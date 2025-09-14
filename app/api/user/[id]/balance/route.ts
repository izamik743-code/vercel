import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      balance: user.balance || 0 
    })
  } catch (error) {
    console.error("Get balance error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
