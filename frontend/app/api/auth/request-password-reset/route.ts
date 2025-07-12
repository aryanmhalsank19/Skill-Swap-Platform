import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Mock password reset - replace with real email sending logic
    console.log(`Password reset requested for: ${email}`)

    return NextResponse.json({
      message: "Password reset email sent",
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
