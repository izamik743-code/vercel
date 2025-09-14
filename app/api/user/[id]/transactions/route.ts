import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Get transactions error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      transactions: transactions || [] 
    })
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
