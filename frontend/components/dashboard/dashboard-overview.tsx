"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Star, MessageSquare, Award, TrendingUp, Users, CheckCircle } from "lucide-react"
import { userAPI } from "@/lib/api"
import { DashboardSummary } from "@/lib/constants"

interface DashboardData {
  credits_balance: number
  average_rating: number
  pending_sent: number
  pending_received: number
  completed_swaps: number
  verified_skills_count: number
  total_skills: number
  recent_activity: Array<{
    id: string
    type: string
    message: string
    created_at: string
  }>
}

export function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const data: DashboardSummary = await userAPI.getDashboardSummary()
      
      // Transform the API response to match our component's expected format
      const transformedData: DashboardData = {
        credits_balance: data.credits,
        average_rating: data.average_rating,
        pending_sent: 0, // These would need separate API calls
        pending_received: 0, // These would need separate API calls
        completed_swaps: data.completed_swaps,
        verified_skills_count: 0, // This would need separate API call
        total_skills: 0, // This would need separate API call
        recent_activity: [], // This would need separate API call
      }
      
      setDashboardData(transformedData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Mock data if API doesn't return data
  const data = dashboardData || {
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
    ],
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-green-500/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.profile_photo_url || "/placeholder.svg"} alt={user?.name} />
              <AvatarFallback className="text-lg">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-muted-foreground">Ready to continue your skill-swapping journey?</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{data.credits_balance}</div>
            <p className="text-xs text-muted-foreground">Available for swaps</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{data.average_rating}</div>
            <div className="flex items-center space-x-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(data.average_rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pending_sent + data.pending_received}</div>
            <p className="text-xs text-muted-foreground">
              {data.pending_sent} sent, {data.pending_received} received
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Swaps</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{data.completed_swaps}</div>
            <p className="text-xs text-muted-foreground">Successful exchanges</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Progress */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Skills Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verified Skills</span>
              <span className="text-sm text-muted-foreground">
                {data.verified_skills_count} of {data.total_skills}
              </span>
            </div>
            <Progress value={(data.verified_skills_count / data.total_skills) * 100} className="h-2" />
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>
                {Math.round((data.verified_skills_count / data.total_skills) * 100)}% of your skills are verified
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recent_activity.length > 0 ? (
              data.recent_activity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent activity to show</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
