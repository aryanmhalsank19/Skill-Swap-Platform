import { type NextRequest, NextResponse } from "next/server"

// Mock users data
const mockUsers = [
  {
    id: "1",
    name: "Alice Johnson",
    location: "San Francisco, CA",
    profile_photo_url: "/placeholder.svg?height=100&width=100",
    skills: [
      { id: "1", name: "Web Development", type: "Offered", is_verified: true, verification_count: 5 },
      { id: "2", name: "Photography", type: "Wanted", is_verified: false, verification_count: 0 },
    ],
    average_rating: 4.8,
    completed_swaps: 12,
  },
  {
    id: "2",
    name: "Bob Smith",
    location: "New York, NY",
    profile_photo_url: "/placeholder.svg?height=100&width=100",
    skills: [
      { id: "3", name: "Photography", type: "Offered", is_verified: true, verification_count: 8 },
      { id: "4", name: "Cooking", type: "Offered", is_verified: false, verification_count: 2 },
      { id: "5", name: "Guitar", type: "Wanted", is_verified: false, verification_count: 0 },
    ],
    average_rating: 4.6,
    completed_swaps: 8,
  },
  {
    id: "3",
    name: "Carol Davis",
    location: "Los Angeles, CA",
    profile_photo_url: "/placeholder.svg?height=100&width=100",
    skills: [
      { id: "6", name: "Graphic Design", type: "Offered", is_verified: true, verification_count: 3 },
      { id: "7", name: "Marketing", type: "Offered", is_verified: false, verification_count: 1 },
      { id: "8", name: "Web Development", type: "Wanted", is_verified: false, verification_count: 0 },
    ],
    average_rating: 4.9,
    completed_swaps: 15,
  },
  {
    id: "4",
    name: "David Wilson",
    location: "Chicago, IL",
    profile_photo_url: "/placeholder.svg?height=100&width=100",
    skills: [
      { id: "9", name: "Music Production", type: "Offered", is_verified: true, verification_count: 6 },
      { id: "10", name: "Video Editing", type: "Offered", is_verified: false, verification_count: 2 },
      { id: "11", name: "Photography", type: "Wanted", is_verified: false, verification_count: 0 },
    ],
    average_rating: 4.7,
    completed_swaps: 10,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search_skill") || searchParams.get("search")
    const availability = searchParams.get("availability")?.split(",") || []
    const timeslot = searchParams.get("timeslot")?.split(",") || []
    const verifiedOnly = searchParams.get("verified_only") === "true"

    let filteredUsers = [...mockUsers]

    // Apply search filter
    if (search) {
      filteredUsers = filteredUsers.filter((user) =>
        user.skills.some((skill) => skill.name.toLowerCase().includes(search.toLowerCase())),
      )
    }

    // Apply verified filter
    if (verifiedOnly) {
      filteredUsers = filteredUsers.filter((user) =>
        user.skills.some((skill) => skill.is_verified || skill.verification_count > 0),
      )
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return NextResponse.json({
      users: paginatedUsers,
      total: filteredUsers.length,
      page,
      limit,
      has_more: endIndex < filteredUsers.length,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
