import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { chatId, message } = await request.json()

    if (!chatId || !message) {
      return NextResponse.json({ success: false, error: "Chat ID and message are required" }, { status: 400 })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ success: false, error: "Telegram bot token not configured" }, { status: 500 })
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    })

    const result = await response.json()

    if (!result.ok) {
      console.error("Telegram API error:", result)
      return NextResponse.json({ success: false, error: result.description || "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Telegram notification error:", error)
    return NextResponse.json({ success: false, error: "Failed to send notification" }, { status: 500 })
  }
}
