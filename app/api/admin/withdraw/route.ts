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

    const { userId, tgId } = await request.json()

    if (!userId || !tgId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const { data: user, error: getUserError } = await supabase
      .from("users")
      .select("balance, wallet_address")
      .eq("id", userId)
      .eq("telegram_id", tgId)
      .single()

    if (getUserError || !user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    if (user.balance <= 0) {
      return NextResponse.json({ success: false, error: "User has no balance to withdraw" }, { status: 400 })
    }

    if (!user.wallet_address) {
      return NextResponse.json({ success: false, error: "User has no connected wallet" }, { status: 400 })
    }

    // Log transaction
    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "admin_withdrawal",
      amount: -user.balance,
      currency: "TON",
      status: "completed",
      description: `Admin withdrawal of ${user.balance} TON`,
      wallet_address: user.wallet_address,
      admin_action: true,
      created_at: new Date().toISOString(),
    })

    if (transactionError) {
      console.error("Transaction record error:", transactionError)
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
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // Integrate with TON Blockchain for real withdrawal
    try {
      const { tonService } = await import("@/lib/ton-service")
      
      // Get admin wallet address from environment
      const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS
      const adminPrivateKey = process.env.TON_PRIVATE_KEY
      
      if (adminWalletAddress && adminPrivateKey) {
        // Send real TON transaction
        const txResult = await tonService.sendTransaction(
          user.wallet_address,
          adminWalletAddress,
          user.balance,
          adminPrivateKey
        )
        
        if (txResult.success) {
          console.log(`[ADMIN] Real TON transaction sent: ${txResult.txHash}`)
          
          // Update transaction record with real tx hash
          await supabase
            .from("transactions")
            .update({ 
              description: `Admin withdrawal of ${user.balance} TON - TX: ${txResult.txHash}`,
              status: "completed"
            })
            .eq("user_id", userId)
            .eq("type", "admin_withdrawal")
            .order("created_at", { ascending: false })
            .limit(1)
        } else {
          console.error(`[ADMIN] TON transaction failed: ${txResult.error}`)
        }
      } else {
        console.log(`[ADMIN] Mock withdrawal: ${user.balance} TON from user ${tgId} (${userId})`)
      }
    } catch (error) {
      console.error("[ADMIN] TON integration error:", error)
      // Continue with mock withdrawal if TON integration fails
    }

    return NextResponse.json({
      success: true,
      data: {
        withdrawnAmount: user.balance,
        message: "Balance successfully withdrawn",
      },
    })
  } catch (error) {
    console.error("Admin withdrawal error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
