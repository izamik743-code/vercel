import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { userId, caseId, casePrice } = await request.json()

    if (!userId || !caseId || !casePrice) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check user balance
    const { data: user, error: getUserError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single()

    if (getUserError || !user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    if (user.balance < casePrice) {
      return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 })
    }

    // Generate random NFT reward based on case type
    const rewards = getRewardsForCase(caseId)
    const reward = getRandomReward(rewards)

    // Deduct balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        balance: user.balance - casePrice,
        last_active: new Date().toISOString()
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating user balance:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update balance" }, { status: 500 })
    }

    // Add to user inventory
    const { error: inventoryError } = await supabase.from("inventory").insert({
      user_id: userId,
      item_name: reward.name,
      item_rarity: reward.rarity,
      item_value: reward.value,
      created_at: new Date().toISOString(),
    })

    if (inventoryError) {
      console.error("Error adding to inventory:", inventoryError)
      // Don't fail the request, just log the error
    }

    // Log transaction
    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "case_open",
      amount: -casePrice,
      currency: "internal",
      status: "completed",
      description: `Opened ${caseId} case`,
      created_at: new Date().toISOString(),
    })

    if (transactionError) {
      console.error("Error logging transaction:", transactionError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      success: true,
      reward, 
      newBalance: user.balance - casePrice 
    })
  } catch (error) {
    console.error("Open case error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

function getRewardsForCase(caseId: string) {
  const caseRewards = {
    basic: [
      { name: "Delicious Cake", rarity: "common", value: 50, weight: 60 },
      { name: "Green Star", rarity: "rare", value: 150, weight: 25 },
      { name: "Blue Star", rarity: "epic", value: 300, weight: 10 },
      { name: "Telegram Premium", rarity: "legendary", value: 500, weight: 5 },
    ],
    premium: [
      { name: "Golden Star", rarity: "rare", value: 200, weight: 50 },
      { name: "Diamond Star", rarity: "epic", value: 400, weight: 30 },
      { name: "Telegram Premium", rarity: "legendary", value: 600, weight: 15 },
      { name: "Mystery Box", rarity: "legendary", value: 1000, weight: 5 },
    ],
    legendary: [
      { name: "Platinum Star", rarity: "epic", value: 500, weight: 40 },
      { name: "Telegram Premium", rarity: "legendary", value: 800, weight: 35 },
      { name: "Mystery Box", rarity: "legendary", value: 1200, weight: 20 },
      { name: "Ultra Rare NFT", rarity: "legendary", value: 2000, weight: 5 },
    ],
  }

  return caseRewards[caseId as keyof typeof caseRewards] || caseRewards.basic
}

function getRandomReward(rewards: Array<{ name: string; rarity: string; value: number; weight: number }>) {
  const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0)
  let random = Math.random() * totalWeight

  for (const reward of rewards) {
    random -= reward.weight
    if (random <= 0) {
      return {
        name: reward.name,
        rarity: reward.rarity,
        value: reward.value,
      }
    }
  }

  // Fallback to first reward
  return {
    name: rewards[0].name,
    rarity: rewards[0].rarity,
    value: rewards[0].value,
  }
}
