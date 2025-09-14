import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ton-mystery-cases.vercel.app"
  
  const manifest = {
    url: baseUrl,
    name: "TON Mystery Cases",
    iconUrl: `${baseUrl}/placeholder-logo.png`,
    termsOfUseUrl: `${baseUrl}/terms`,
    privacyPolicyUrl: `${baseUrl}/privacy`,
    description: "Открывайте кейсы и выигрывайте TON подарки в Telegram",
  }

  return NextResponse.json(manifest)
}
