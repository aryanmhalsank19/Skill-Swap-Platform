"use client"

import { useEffect, useState, useRef, useMemo } from "react" // Added useMemo
import { useSearchParams } from "next/navigation"
import { UserCard } from "./user-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useApiThrottle } from "@/hooks/use-api-throttle"
import { userAPI } from "@/lib/api"
import { User } from "@/lib/constants"

interface PaginatedResponse {
  results: User[]
  pagination: {
    page: number
    limit: number
    total: number
    has_next: boolean
    has_previous: boolean
  }
}

export function UserDirectory() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { throttledCall, clearThrottle } = useApiThrottle({ minInterval: 15000, maxInterval: 20000 })
  const isInitialLoad = useRef(true)

  // Use useMemo to memoize the derived search parameter values
  // This ensures the dependency array only changes if the actual values change.
  const memoizedSearchParams = useMemo(() => {
    const searchSkill = searchParams.get("search_skill") || undefined
    const availability = searchParams.getAll("availability")
    const timeslot = searchParams.getAll("timeslot")
    const verifiedOnly = searchParams.get("verified_only") === "true"
    const searchQuery = searchParams.get("q")

    return { searchSkill, availability, timeslot, verifiedOnly, searchQuery }
  }, [searchParams]) // Only re-memoize if the searchParams object reference changes

  const fetchUsers = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true)

      let data: PaginatedResponse

      if (memoizedSearchParams.searchQuery) {
        // Use search endpoint if there's a search query
        data = await userAPI.searchUsers({
          q: memoizedSearchParams.searchQuery,
          page: pageNum,
          limit: 12,
          availability: memoizedSearchParams.availability.length > 0 ? memoizedSearchParams.availability : undefined,
          timeslot: memoizedSearchParams.timeslot.length > 0 ? memoizedSearchParams.timeslot : undefined,
          verified_only: memoizedSearchParams.verifiedOnly,
        })
      } else {
        // wait for 10 seconds
        // Use public users endpoint
        data = await userAPI.getPublicUsers({
          page: pageNum,
          limit: 12,
          search_skill: memoizedSearchParams.searchSkill,
          availability: memoizedSearchParams.availability.length > 0 ? memoizedSearchParams.availability : undefined,
          timeslot: memoizedSearchParams.timeslot.length > 0 ? memoizedSearchParams.timeslot : undefined,
          verified_only: memoizedSearchParams.verifiedOnly,
        })
        await new Promise(resolve => setTimeout(resolve, 10000))
      }

      if (reset) {
        setUsers(data.results || [])
      } else {
        setUsers((prev) => [...prev, ...(data.results || [])])
      }

      setHasMore(data.pagination?.has_next || false)
      setPage(pageNum)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const throttledFetchUsers = async (pageNum = 1, reset = false) => {
    // For initial load, don't throttle
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return await fetchUsers(pageNum, reset)
    }

    // For subsequent calls, use throttling
    return await throttledCall(() => fetchUsers(pageNum, reset))
  }

  useEffect(() => {
    // Reset initial load flag when search parameters change
    isInitialLoad.current = true
    clearThrottle() // Clear any pending throttled calls
    fetchUsers(1, true)
  }, [
    memoizedSearchParams.searchSkill,
    memoizedSearchParams.searchQuery,
    // For arrays, shallow comparison in useEffect dependencies will trigger if reference changes.
    // To properly compare array content, you might need a custom comparison or convert to string.
    // For useSearchParams.getAll(), it often returns a new array reference even if contents are same.
    JSON.stringify(memoizedSearchParams.availability),
    JSON.stringify(memoizedSearchParams.timeslot),
    memoizedSearchParams.verifiedOnly,
    // Add fetchUsers to dependencies if it's not stable or wrapped in useCallback
    // However, if it contains `memoizedSearchParams`, it's implicitly tied to them.
  ])

  const loadMore = () => {
    if (!loading && hasMore) {
      throttledFetchUsers(page + 1, false)
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (users.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters to find more people.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <div className="mr-2">
                  <LoadingSpinner />
                </div>
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}