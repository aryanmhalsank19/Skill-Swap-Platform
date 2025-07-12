import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, location } = body

    // Mock registration - replace with real registration logic
    const user = {
      id: Date.now().toString(),
      email,
      name,
      profile_photo_url: "/placeholder.svg?height=100&width=100",
      location: location || "Unknown",
      is_public: true,
      skills: [],
    }

    return NextResponse.json(
      {
        user,
        access_token: "mock_token_" + Date.now(),
        refresh_token: "mock_refresh_token",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
