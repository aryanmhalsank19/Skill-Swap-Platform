"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiCallTracker } from "@/lib/api-utils"
import { BarChart3, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function ApiStats() {
  const [stats, setStats] = useState(apiCallTracker.getCallStats())
  const [recentCalls, setRecentCalls] = useState(apiCallTracker.getRecentCalls(5))
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(apiCallTracker.getCallStats())
      setRecentCalls(apiCallTracker.getRecentCalls(5))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const clearStats = () => {
    apiCallTracker.clear()
    setStats(apiCallTracker.getCallStats())
    setRecentCalls(apiCallTracker.getRecentCalls(5))
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    // <div className="fixed bottom-4 right-4 z-50">
    //   <Button
    //     onClick={() => setIsVisible(!isVisible)}
    //     variant="outline"
    //     size="sm"
    //     className="mb-2"
    //   >
    //     <BarChart3 className="h-4 w-4 mr-2" />
    //     API Stats
    //   </Button>

    //   {isVisible && (
    //     <Card className="w-80 bg-background/95 backdrop-blur border-border/50">
    //       <CardHeader className="pb-3">
    //         <CardTitle className="text-sm flex items-center justify-between">
    //           API Call Statistics
    //           <Button
    //             onClick={clearStats}
    //             variant="ghost"
    //             size="sm"
    //             className="h-6 w-6 p-0"
    //           >
    //             <RefreshCw className="h-3 w-3" />
    //           </Button>
    //         </CardTitle>
    //       </CardHeader>
    //       <CardContent className="space-y-3">
    //         {/* Summary Stats */}
    //         <div className="grid grid-cols-2 gap-2 text-xs">
    //           <div className="flex items-center space-x-1">
    //             <CheckCircle className="h-3 w-3 text-green-500" />
    //             <span>Success: {stats.successfulCalls}</span>
    //           </div>
    //           <div className="flex items-center space-x-1">
    //             <XCircle className="h-3 w-3 text-red-500" />
    //             <span>Failed: {stats.failedCalls}</span>
    //           </div>
    //           <div className="flex items-center space-x-1">
    //             <Clock className="h-3 w-3 text-blue-500" />
    //             <span>Avg: {stats.avgDuration}ms</span>
    //           </div>
    //           <div className="flex items-center space-x-1">
    //             <BarChart3 className="h-3 w-3 text-purple-500" />
    //             <span>Rate: {stats.successRate.toFixed(1)}%</span>
    //           </div>
    //         </div>

    //         {/* Recent Calls */}
    //         <div className="space-y-2">
    //           <h4 className="text-xs font-medium">Recent Calls:</h4>
    //           {recentCalls.length === 0 ? (
    //             <p className="text-xs text-muted-foreground">No recent calls</p>
    //           ) : (
    //             <div className="space-y-1 max-h-32 overflow-y-auto">
    //               {recentCalls.map((call, index) => (
    //                 <div key={index} className="flex items-center justify-between text-xs">
    //                   <div className="flex items-center space-x-1">
    //                     {call.success ? (
    //                       <CheckCircle className="h-3 w-3 text-green-500" />
    //                     ) : (
    //                       <XCircle className="h-3 w-3 text-red-500" />
    //                     )}
    //                     <span className="truncate max-w-32">
    //                       {call.endpoint.split('/').pop() || call.endpoint}
    //                     </span>
    //                   </div>
    //                   <Badge variant="outline" className="text-xs">
    //                     {call.duration}ms
    //                   </Badge>
    //                 </div>
    //               ))}
    //             </div>
    //           )}
    //         </div>
    //       </CardContent>
    //     </Card>
    //   )}
    // </div>
    <>
    </>
  )
} 