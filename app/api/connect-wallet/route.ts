import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { userId, walletAddress, tonAmount } = await request.json()

    if (!userId || !walletAddress) {
      return NextResponse.json({ success: false, error: "User ID and wallet address are required" }, { status: 400 })
    }

    // Verify wallet address format (basic validation)
    if (!walletAddress.startsWith("UQ") && !walletAddress.startsWith("EQ")) {
      return NextResponse.json({ success: false, error: "Invalid TON wallet address format" }, { status: 400 })
    }

    // Get current user
    const { data: user, error: getUserError } = await supabase
      .from("users")
      .select("balance, wallet_address")
      .eq("id", userId)
      .single()

    if (getUserError || !user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // If wallet already connected, return current user data
    if (user.wallet_address === walletAddress) {
      return NextResponse.json({ 
        success: true, 
        data: { ...user, id: userId },
        message: "Wallet already connected"
      })
    }

    // Update user wallet and add balance if tonAmount provided
    const updateData: any = {
      wallet_address: walletAddress,
      last_active: new Date().toISOString(),
    }

    if (tonAmount && tonAmount > 0) {
      updateData.balance = (user.balance || 0) + (tonAmount * 1000) // Convert TON to internal currency
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating user wallet:", updateError)
      return NextResponse.json({ success: false, error: "Failed to connect wallet" }, { status: 500 })
    }

    // Log transaction if amount was added
    if (tonAmount && tonAmount > 0) {
      await supabase.from("transactions").insert({
        user_id: userId,
        type: "deposit",
        amount: tonAmount,
        currency: "TON",
        status: "completed",
        description: `Wallet connection deposit: ${tonAmount} TON`,
        wallet_address: walletAddress,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedUser 
    })
  } catch (error) {
    console.error("Connect wallet error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
