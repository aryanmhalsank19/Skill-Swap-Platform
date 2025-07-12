import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Mock user data - replace with real user lookup
    const user = {
      id: "1",
      email: "demo@skillswap.com",
      name: "Demo User",
      profile_photo_url: "/placeholder.svg?height=100&width=100",
      location: "San Francisco, CA",
      is_public: true,
      availability: ["Weekdays", "Evening"],
      timeslot: ["Evening", "Night"],
      linkedin: "https://linkedin.com/in/demo",
      github: "https://github.com/demo",
      skills: [
        {
          id: "1",
          name: "Web Development",
          type: "Offered",
          description: "Full-stack development with React and Node.js",
          is_verified: true,
          verification_count: 5,
          proof_file_url: null,
          proof_description: null,
        },
        {
          id: "2",
          name: "Photography",
          type: "Wanted",
          description: "Looking to learn portrait photography",
          is_verified: false,
          verification_count: 0,
          proof_file_url: null,
          proof_description: null,
        },
      ],
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Mock update - replace with real database update
    const updatedUser = {
      id: "1",
      email: "demo@skillswap.com",
      ...body,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
