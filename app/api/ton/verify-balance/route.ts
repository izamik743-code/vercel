import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ success: false, error: "Wallet address is required" }, { status: 400 })
    }

    // Validate TON wallet address format
    if (!walletAddress.startsWith("UQ") && !walletAddress.startsWith("EQ")) {
      return NextResponse.json({ success: false, error: "Invalid TON wallet address format" }, { status: 400 })
    }

    // Use TON API to check balance
    const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${walletAddress}`, {
      headers: {
        "X-API-Key": process.env.TON_API_KEY || "",
      },
    })

    if (!response.ok) {
      console.error("TON API error:", response.status, response.statusText)
      return NextResponse.json({ success: false, error: "Failed to verify TON balance" }, { status: 500 })
    }

    const data = await response.json()
    const balance = data.result ? Number.parseFloat(data.result) / 1000000000 : 0 // Convert from nanotons to TON

    return NextResponse.json({ 
      success: true,
      balance 
    })
  } catch (error) {
    console.error("TON balance verification error:", error)
    return NextResponse.json({ success: false, error: "Failed to verify TON balance" }, { status: 500 })
  }
}
