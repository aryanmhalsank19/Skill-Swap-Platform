"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { swapRequestsAPI } from "@/lib/api"
import { SwapRequest } from "@/lib/constants"
import { 
  Loader2, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Award,
  Send,
  Inbox,
  Check,
  X,
  Ban
} from "lucide-react"

interface PaginatedSwapRequests {
  count: number
  next: string | null
  previous: string | null
  results: SwapRequest[]
}

export function SwapRequestsPage() {
  const [sentRequests, setSentRequests] = useState<PaginatedSwapRequests | null>(null)
  const [receivedRequests, setReceivedRequests] = useState<PaginatedSwapRequests | null>(null)
  const [completedSwaps, setCompletedSwaps] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSwapRequests()
  }, [])

  const fetchSwapRequests = async () => {
    setLoading(true)
    try {
      const [sent, received, completed] = await Promise.all([
        swapRequestsAPI.getSentSwapRequests(),
        swapRequestsAPI.getReceivedSwapRequests(),
        swapRequestsAPI.getCompletedSwaps(),
      ])
      
      setSentRequests(sent)
      setReceivedRequests(received)
      setCompletedSwaps(completed)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load swap requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (swapId: string) => {
    setActionLoading(swapId)
    try {
      await swapRequestsAPI.acceptSwapRequest(swapId)
      toast({
        title: "Swap Accepted",
        description: "The swap request has been accepted successfully.",
      })
      fetchSwapRequests() // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept swap request",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (swapId: string) => {
    setActionLoading(swapId)
    try {
      await swapRequestsAPI.rejectSwapRequest(swapId)
      toast({
        title: "Swap Rejected",
        description: "The swap request has been rejected.",
      })
      fetchSwapRequests() // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject swap request",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (swapId: string) => {
    setActionLoading(swapId)
    try {
      await swapRequestsAPI.cancelSwapRequest(swapId)
      toast({
        title: "Swap Cancelled",
        description: "The swap request has been cancelled.",
      })
      fetchSwapRequests() // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel swap request",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: { variant: "secondary" as const, icon: Clock },
      Accepted: { variant: "default" as const, icon: CheckCircle },
      Rejected: { variant: "destructive" as const, icon: XCircle },
      Completed: { variant: "default" as const, icon: CheckCircle },
      Cancelled: { variant: "outline" as const, icon: Ban },
      Withdrawn: { variant: "outline" as const, icon: Ban },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{status}</span>
      </Badge>
    )
  }

  const SwapRequestCard = ({ swap, isReceived = false }: { swap: SwapRequest; isReceived?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={isReceived ? swap.sender.profile_photo_url : swap.receiver.profile_photo_url} 
                alt={isReceived ? swap.sender.name : swap.receiver.name} 
              />
              <AvatarFallback>
                {(isReceived ? swap.sender.name : swap.receiver.name)?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {isReceived ? swap.sender.name : swap.receiver.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isReceived ? swap.sender.location : swap.receiver.location}
              </p>
            </div>
          </div>
          {getStatusBadge(swap.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">You're offering:</span>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {swap.offered_skill.name}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">You're requesting:</span>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              {swap.requested_skill.name}
            </Badge>
          </div>
        </div>

        {swap.message && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{swap.message}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {new Date(swap.created_at).toLocaleDateString()}
          </div>
          
          {swap.status === "Pending" && (
            <div className="flex space-x-2">
              {isReceived ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(swap.id)}
                    disabled={actionLoading === swap.id}
                  >
                    {actionLoading === swap.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(swap.id)}
                    disabled={actionLoading === swap.id}
                  >
                    {actionLoading === swap.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Reject
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancel(swap.id)}
                  disabled={actionLoading === swap.id}
                >
                  {actionLoading === swap.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Swap Requests</h1>
        <p className="text-muted-foreground">Manage your skill swap requests and exchanges</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{sentRequests?.results?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Sent Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Inbox className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{receivedRequests?.results?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Received Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{completedSwaps?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Completed Swaps</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  {(sentRequests?.results?.filter(r => r.status === "Pending").length || 0) +
                   (receivedRequests?.results?.filter(r => r.status === "Pending").length || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received" className="flex items-center space-x-2">
            <Inbox className="h-4 w-4" />
            <span>Received ({receivedRequests?.results?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Sent ({sentRequests?.results?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Completed ({completedSwaps?.length || 0})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedRequests?.results?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Received Requests</h3>
                <p className="text-muted-foreground">You haven't received any swap requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receivedRequests?.results?.map((swap) => (
                <SwapRequestCard key={swap.id} swap={swap} isReceived={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentRequests?.results?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sent Requests</h3>
                <p className="text-muted-foreground">You haven't sent any swap requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sentRequests?.results?.map((swap) => (
                <SwapRequestCard key={swap.id} swap={swap} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedSwaps?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Swaps</h3>
                <p className="text-muted-foreground">You haven't completed any swaps yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedSwaps?.map((swap) => (
                <SwapRequestCard key={swap.id} swap={swap} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 