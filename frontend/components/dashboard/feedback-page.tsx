"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { feedbackAPI, swapRequestsAPI } from "@/lib/api"
import { Feedback, SwapRequest } from "@/lib/constants"
import { 
  Loader2, 
  Star, 
  MessageSquare, 
  User, 
  Calendar,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle
} from "lucide-react"

interface PaginatedFeedback {
  count: number
  next: string | null
  previous: string | null
  results: Feedback[]
}

export function FeedbackPage() {
  const [receivedFeedback, setReceivedFeedback] = useState<Feedback[]>([])
  const [givenFeedback, setGivenFeedback] = useState<Feedback[]>([])
  const [completedSwaps, setCompletedSwaps] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchFeedbackData()
  }, [])

  const fetchFeedbackData = async () => {
    setLoading(true)
    try {
      // For now, we'll use mock data since the backend might not have all feedback endpoints
      // In a real implementation, you would call the actual API endpoints
      const completed = await swapRequestsAPI.getCompletedSwaps()
      setCompletedSwaps(completed)
      
      // Mock feedback data - replace with actual API calls when available
      const mockReceivedFeedback: Feedback[] = [
        {
          id: "1",
          swap_request: "swap-1",
          rater: {
            id: "user-1",
            email: "john@example.com",
            name: "John Doe",
            is_public: true,
            credits: 100,
            date_joined: "2024-01-01T00:00:00Z",
          },
          rated_user: {
            id: "current-user",
            email: "current@example.com",
            name: "Current User",
            is_public: true,
            credits: 150,
            date_joined: "2024-01-01T00:00:00Z",
          },
          rating: 5,
          comment: "Excellent skill exchange! Very professional and helpful.",
          expectations_matched: true,
          skill_verified_by_peer: true,
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          swap_request: "swap-2",
          rater: {
            id: "user-2",
            email: "jane@example.com",
            name: "Jane Smith",
            is_public: true,
            credits: 80,
            date_joined: "2024-01-01T00:00:00Z",
          },
          rated_user: {
            id: "current-user",
            email: "current@example.com",
            name: "Current User",
            is_public: true,
            credits: 150,
            date_joined: "2024-01-01T00:00:00Z",
          },
          rating: 4,
          comment: "Good experience overall, would recommend.",
          expectations_matched: true,
          skill_verified_by_peer: false,
          created_at: "2024-01-14T15:45:00Z",
        },
      ]

      const mockGivenFeedback: Feedback[] = [
        {
          id: "3",
          swap_request: "swap-3",
          rater: {
            id: "current-user",
            email: "current@example.com",
            name: "Current User",
            is_public: true,
            credits: 150,
            date_joined: "2024-01-01T00:00:00Z",
          },
          rated_user: {
            id: "user-3",
            email: "bob@example.com",
            name: "Bob Johnson",
            is_public: true,
            credits: 120,
            date_joined: "2024-01-01T00:00:00Z",
          },
          rating: 5,
          comment: "Amazing teaching skills! Learned a lot.",
          expectations_matched: true,
          skill_verified_by_peer: true,
          created_at: "2024-01-13T09:20:00Z",
        },
      ]

      setReceivedFeedback(mockReceivedFeedback)
      setGivenFeedback(mockGivenFeedback)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load feedback data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getAverageRating = (feedback: Feedback[]) => {
    if (feedback.length === 0) return 0
    const total = feedback.reduce((sum, item) => sum + item.rating, 0)
    return (total / feedback.length).toFixed(1)
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  const FeedbackCard = ({ feedback, isReceived = false }: { feedback: Feedback; isReceived?: boolean }) => {
    const user = isReceived ? feedback.rater : feedback.rated_user
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profile_photo_url || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {getRatingStars(feedback.rating)}
              </div>
              <Badge variant="outline">{feedback.rating}/5</Badge>
            </div>
          </div>

          {feedback.comment && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">{feedback.comment}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm">
                {feedback.expectations_matched ? (
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ThumbsDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-muted-foreground">
                  {feedback.expectations_matched ? "Expectations met" : "Expectations not met"}
                </span>
              </div>
              
              {feedback.skill_verified_by_peer && (
                <div className="flex items-center space-x-1 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Skill verified</span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {new Date(feedback.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const averageReceivedRating = getAverageRating(receivedFeedback)
  const averageGivenRating = getAverageRating(givenFeedback)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Feedback</h1>
        <p className="text-muted-foreground">View and manage your feedback and ratings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{averageReceivedRating}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{receivedFeedback.length}</div>
                <div className="text-sm text-muted-foreground">Received Feedback</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{givenFeedback.length}</div>
                <div className="text-sm text-muted-foreground">Given Feedback</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{completedSwaps.length}</div>
                <div className="text-sm text-muted-foreground">Completed Swaps</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Received ({receivedFeedback.length})</span>
          </TabsTrigger>
          <TabsTrigger value="given" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Given ({givenFeedback.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Completed Swaps ({completedSwaps.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedFeedback.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Received Feedback</h3>
                <p className="text-muted-foreground">You haven't received any feedback yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receivedFeedback.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} isReceived={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="given" className="space-y-4">
          {givenFeedback.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Given Feedback</h3>
                <p className="text-muted-foreground">You haven't given any feedback yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {givenFeedback.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedSwaps.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Swaps</h3>
                <p className="text-muted-foreground">You haven't completed any swaps yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedSwaps.map((swap) => (
                <Card key={swap.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={swap.receiver.profile_photo_url || "/placeholder.svg"} 
                            alt={swap.receiver.name} 
                          />
                          <AvatarFallback>{swap.receiver.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">Swap with {swap.receiver.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {swap.offered_skill.name} ↔ {swap.requested_skill.name}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">Completed</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed on {new Date(swap.updated_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 