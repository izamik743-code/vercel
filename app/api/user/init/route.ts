import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { telegramId, username, firstName, lastName, initData, referralCode } = await request.json()

    if (!telegramId) {
      return NextResponse.json({ success: false, error: "Telegram ID is required" }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser, error: getUserError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegramId)
      .single()

    if (getUserError && getUserError.code !== "PGRST116") {
      console.error("Error checking existing user:", getUserError)
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
    }

    if (existingUser) {
      // Update last active
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ last_active: new Date().toISOString() })
        .eq("id", existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating user:", updateError)
        return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        data: updatedUser 
      })
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        telegram_id: telegramId,
        username: username || null,
        first_name: firstName || "",
        last_name: lastName || null,
        balance: 0,
        wallet_address: null,
        init_data: initData || null,
        referral_code: referralCode || null,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
    }

    // If referral code provided, handle referral logic
    if (referralCode) {
      // Find referrer by referral code
      const { data: referrer } = await supabase
        .from("users")
        .select("id")
        .eq("referral_code", referralCode)
        .single()

      if (referrer) {
        // Update new user with referrer
        await supabase
          .from("users")
          .update({ referred_by: referrer.id })
          .eq("id", newUser.id)

        // Add referral bonus to referrer
        await supabase
          .from("users")
          .update({ 
            balance: supabase.raw("balance + 0.1") // 0.1 TON referral bonus
          })
          .eq("id", referrer.id)

        // Log referral transaction
        await supabase.from("transactions").insert({
          user_id: referrer.id,
          type: "referral_bonus",
          amount: 0.1,
          currency: "TON",
          status: "completed",
          description: `Referral bonus for ${username || firstName}`,
          created_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: newUser 
    })
  } catch (error) {
    console.error("User init error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
