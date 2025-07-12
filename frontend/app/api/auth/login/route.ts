import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Mock authentication - replace with real authentication logic
    if (email === "demo@skillswap.com" && password === "password") {
      const user = {
        id: "1",
        email: "demo@skillswap.com",
        name: "Demo User",
        profile_photo_url: "/placeholder.svg?height=100&width=100",
        location: "San Francisco, CA",
        is_public: true,
        skills: [
          {
            id: "1",
            name: "Web Development",
            type: "Offered",
            is_verified: true,
            verification_count: 5,
          },
          {
            id: "2",
            name: "Photography",
            type: "Wanted",
            is_verified: false,
            verification_count: 0,
          },
        ],
      }

      return NextResponse.json({
        user,
        access_token: "mock_token_" + Date.now(),
        refresh_token: "mock_refresh_token",
      })
    }

    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
