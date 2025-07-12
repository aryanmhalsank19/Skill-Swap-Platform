import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { receiver_id, offered_skill_id, requested_skill_id, message } = body

    // Mock swap request creation
    const swapRequest = {
      id: Date.now().toString(),
      sender_id: "1", // Current user ID
      receiver_id,
      offered_skill_id,
      requested_skill_id,
      message: message || "",
      status: "Pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(swapRequest, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
