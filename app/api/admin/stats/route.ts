import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Admin authentication middleware
function verifyAdminAuth(request: NextRequest): boolean {
  const adminKey = request.headers.get("x-admin-key")
  const secretKey = process.env.ADMIN_SECRET_KEY || process.env.TELEGRAM_BOT_TOKEN
  return adminKey === secretKey
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized admin access" }, { status: 401 })
    }

    // Total deposits
    const { data: deposits } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "deposit")
      .eq("currency", "TON")

    const totalDeposits = deposits?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

    // Active users (last 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: activeUsers } = await supabase
      .from("transactions")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", yesterday)

    // Total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    // Connected wallets
    const { count: connectedWallets } = await supabase
      .from("users")
      .select("wallet_address", { count: "exact", head: true })
      .not("wallet_address", "is", null)

    // Total balance
    const { data: users } = await supabase
      .from("users")
      .select("balance")
    
    const totalBalance = users?.reduce((sum, user) => sum + (user.balance || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        totalDeposits,
        activeUsers: activeUsers || 0,
        totalUsers: totalUsers || 0,
        connectedWallets: connectedWallets || 0,
        totalBalance,
        onlineUsers: Math.floor(Math.random() * 50) + 100, // Fake online count
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
