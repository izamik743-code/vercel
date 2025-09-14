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

    const { data: inventory, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Get inventory error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch inventory" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      inventory: inventory || [] 
    })
  } catch (error) {
    console.error("Get inventory error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
