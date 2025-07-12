import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Mock dashboard data
    const dashboardData = {
      credits_balance: 150,
      average_rating: 4.8,
      pending_sent: 2,
      pending_received: 3,
      completed_swaps: 12,
      verified_skills_count: 3,
      total_skills: 5,
      recent_activity: [
        {
          id: "1",
          type: "swap_completed",
          message: "Completed swap with Alice Johnson",
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          type: "feedback_received",
          message: "Received 5-star feedback from Bob Smith",
          created_at: "2024-01-14T15:45:00Z",
        },
        {
          id: "3",
          type: "swap_request",
          message: "New swap request from Carol Davis",
          created_at: "2024-01-13T09:15:00Z",
        },
      ],
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
