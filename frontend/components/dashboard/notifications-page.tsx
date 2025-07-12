"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { systemMessagesAPI, swapRequestsAPI } from "@/lib/api"
import { SystemMessage, SwapRequest } from "@/lib/constants"
import { 
  Loader2, 
  Bell, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  User,
  Award,
  Calendar,
  Settings
} from "lucide-react"

interface Notification {
  id: string
  type: 'swap_request' | 'swap_accepted' | 'swap_rejected' | 'swap_completed' | 'system_message' | 'skill_verified'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: any
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // Fetch system messages
      const messages = await systemMessagesAPI.getActiveMessages()
      setSystemMessages(messages)

      // Fetch swap requests for notifications
      const [sentRequests, receivedRequests, completedSwaps] = await Promise.all([
        swapRequestsAPI.getSentSwapRequests(),
        swapRequestsAPI.getReceivedSwapRequests(),
        swapRequestsAPI.getCompletedSwaps(),
      ])

      // Generate notifications from swap data
      const generatedNotifications: Notification[] = []

      // Notifications from received requests
      receivedRequests.results?.forEach((swap) => {
        if (swap.status === 'Pending') {
          generatedNotifications.push({
            id: `swap-received-${swap.id}`,
            type: 'swap_request',
            title: 'New Swap Request',
            message: `${swap.sender.name} wants to swap ${swap.offered_skill.name} for your ${swap.requested_skill.name}`,
            isRead: false,
            createdAt: swap.created_at,
            data: swap,
          })
        } else if (swap.status === 'Accepted') {
          generatedNotifications.push({
            id: `swap-accepted-${swap.id}`,
            type: 'swap_accepted',
            title: 'Swap Accepted',
            message: `Your swap request with ${swap.sender.name} has been accepted`,
            isRead: false,
            createdAt: swap.updated_at,
            data: swap,
          })
        } else if (swap.status === 'Rejected') {
          generatedNotifications.push({
            id: `swap-rejected-${swap.id}`,
            type: 'swap_rejected',
            title: 'Swap Rejected',
            message: `Your swap request with ${swap.sender.name} has been rejected`,
            isRead: false,
            createdAt: swap.updated_at,
            data: swap,
          })
        }
      })

      // Notifications from sent requests
      sentRequests.results?.forEach((swap) => {
        if (swap.status === 'Accepted') {
          generatedNotifications.push({
            id: `swap-accepted-sent-${swap.id}`,
            type: 'swap_accepted',
            title: 'Swap Accepted',
            message: `${swap.receiver.name} accepted your swap request`,
            isRead: false,
            createdAt: swap.updated_at,
            data: swap,
          })
        } else if (swap.status === 'Rejected') {
          generatedNotifications.push({
            id: `swap-rejected-sent-${swap.id}`,
            type: 'swap_rejected',
            title: 'Swap Rejected',
            message: `${swap.receiver.name} rejected your swap request`,
            isRead: false,
            createdAt: swap.updated_at,
            data: swap,
          })
        }
      })

      // Notifications from completed swaps
      completedSwaps.forEach((swap) => {
        generatedNotifications.push({
          id: `swap-completed-${swap.id}`,
          type: 'swap_completed',
          title: 'Swap Completed',
          message: `Your swap with ${swap.receiver.name} has been completed successfully`,
          isRead: false,
          createdAt: swap.updated_at,
          data: swap,
        })
      })

      // Add system messages as notifications
      messages.forEach((message) => {
        generatedNotifications.push({
          id: `system-${message.id}`,
          type: 'system_message',
          title: message.title,
          message: message.content,
          isRead: false,
          createdAt: message.created_at,
          data: message,
        })
      })

      // Sort by creation date (newest first)
      generatedNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setNotifications(generatedNotifications)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      swap_request: MessageSquare,
      swap_accepted: CheckCircle,
      swap_rejected: XCircle,
      swap_completed: CheckCircle,
      system_message: AlertCircle,
      skill_verified: Award,
    }
    const Icon = iconMap[type as keyof typeof iconMap] || Bell
    return <Icon className="h-5 w-5" />
  }

  const getNotificationColor = (type: string) => {
    const colorMap = {
      swap_request: "text-blue-500",
      swap_accepted: "text-green-500",
      swap_rejected: "text-red-500",
      swap_completed: "text-green-500",
      system_message: "text-yellow-500",
      skill_verified: "text-purple-500",
    }
    return colorMap[type as keyof typeof colorMap] || "text-gray-500"
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your latest activities</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Mark all as read
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{notifications.length}</div>
                <div className="text-sm text-muted-foreground">Total Notifications</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-sm text-muted-foreground">Unread</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'swap_request').length}
                </div>
                <div className="text-sm text-muted-foreground">Swap Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{systemMessages.length}</div>
                <div className="text-sm text-muted-foreground">System Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>All ({notifications.length})</span>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>Unread ({unreadCount})</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>System ({systemMessages.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                <p className="text-muted-foreground">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadCount === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Unread Notifications</h3>
                <p className="text-muted-foreground">All caught up!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications
                .filter(n => !n.isRead)
                .map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsRead(notification.id)}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {systemMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No System Messages</h3>
                <p className="text-muted-foreground">No system announcements at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {systemMessages.map((message) => (
                <Card key={message.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full bg-yellow-100 ${getNotificationColor('system_message')}`}>
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{message.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            System Announcement
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">System</Badge>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString()}
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

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead: () => void
}

function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-blue-100 ${getNotificationColor(notification.type)}`}>
              {getNotificationIcon(notification.type)}
            </div>
            <div>
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-sm text-muted-foreground">
                {notification.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
          {!notification.isRead && (
            <Badge variant="default">New</Badge>
          )}
        </div>
        
        <div className="mb-4">
          <p className="text-sm">{notification.message}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {new Date(notification.createdAt).toLocaleDateString()}
          </div>
          
          {!notification.isRead && (
            <Button size="sm" variant="outline" onClick={onMarkAsRead}>
              Mark as read
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 