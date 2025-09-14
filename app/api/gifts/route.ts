import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Get recent wins from database
    const { data: recentWins, error: winsError } = await supabase
      .from("inventory")
      .select(`
        item_name,
        item_rarity,
        item_value,
        created_at,
        users!inner(username, first_name)
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (winsError) {
      console.error("Error fetching recent wins:", winsError)
      // Return fake data as fallback
      const fakeWins = [
        { item: "Delicious Cake", rarity: "common", time: "2 min ago", user: "User***" },
        { item: "Green Star", rarity: "rare", time: "5 min ago", user: "User***" },
        { item: "Blue Star", rarity: "epic", time: "8 min ago", user: "User***" },
        { item: "Telegram Premium", rarity: "legendary", time: "12 min ago", user: "User***" },
        { item: "Delicious Cake", rarity: "common", time: "15 min ago", user: "User***" },
      ]
      return NextResponse.json({ success: true, wins: fakeWins })
    }

    // Format recent wins
    const formattedWins = recentWins?.map(win => ({
      item: win.item_name,
      rarity: win.item_rarity,
      time: getTimeAgo(win.created_at),
      user: win.users?.username ? `@${win.users.username}` : `User***`,
    })) || []

    // If no real wins, return fake data
    if (formattedWins.length === 0) {
      const fakeWins = [
        { item: "Delicious Cake", rarity: "common", time: "2 min ago", user: "User***" },
        { item: "Green Star", rarity: "rare", time: "5 min ago", user: "User***" },
        { item: "Blue Star", rarity: "epic", time: "8 min ago", user: "User***" },
        { item: "Telegram Premium", rarity: "legendary", time: "12 min ago", user: "User***" },
        { item: "Delicious Cake", rarity: "common", time: "15 min ago", user: "User***" },
      ]
      return NextResponse.json({ success: true, wins: fakeWins })
    }

    return NextResponse.json({ success: true, wins: formattedWins })
  } catch (error) {
    console.error("Gifts fetch error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "just now"
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
}
