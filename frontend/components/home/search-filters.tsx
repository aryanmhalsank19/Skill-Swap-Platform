"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Filter, ChevronDown, X } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

const AVAILABILITY_OPTIONS = [
  "Weekdays",
  "Weekends",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const TIMESLOT_OPTIONS = ["Morning", "Afternoon", "Evening", "Night"]

export function SearchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || searchParams.get("search_skill") || "")
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    searchParams.getAll("availability"),
  )
  const [selectedTimeslots, setSelectedTimeslots] = useState<string[]>(searchParams.getAll("timeslot"))
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified_only") === "true")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  // Debounce search term to prevent rapid API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  const updateURL = useCallback(() => {
    const params = new URLSearchParams()

    if (debouncedSearchTerm) {
      // Use 'q' for general search, 'search_skill' for skill-specific search
      if (debouncedSearchTerm.includes(" ") || debouncedSearchTerm.length > 20) {
        params.set("q", debouncedSearchTerm)
      } else {
        params.set("search_skill", debouncedSearchTerm)
      }
    }
    
    selectedAvailability.forEach(av => params.append("availability", av))
    selectedTimeslots.forEach(ts => params.append("timeslot", ts))
    if (verifiedOnly) params.set("verified_only", "true")

    router.push(`${pathname}?${params.toString()}`)
  }, [debouncedSearchTerm, selectedAvailability, selectedTimeslots, verifiedOnly, router, pathname])

  // Auto-update URL when filters change (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL()
    }, 300) // 300ms delay for filter changes

    return () => clearTimeout(timer)
  }, [debouncedSearchTerm, selectedAvailability, selectedTimeslots, verifiedOnly, updateURL])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedAvailability([])
    setSelectedTimeslots([])
    setVerifiedOnly(false)
    router.push(pathname)
  }

  const hasActiveFilters = debouncedSearchTerm || selectedAvailability.length || selectedTimeslots.length || verifiedOnly

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search skills or users (e.g., Web Design, Photography, Cooking...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 h-12 text-lg"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {
                    [debouncedSearchTerm, ...selectedAvailability, ...selectedTimeslots, verifiedOnly && "Verified"].filter(
                      Boolean,
                    ).length
                  }
                </Badge>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-card">
              {/* Availability */}
              <div className="space-y-3">
                <h3 className="font-medium">Availability</h3>
                <div className="space-y-2">
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`availability-${option}`}
                        checked={selectedAvailability.includes(option)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedAvailability([...selectedAvailability, option])
                          } else {
                            setSelectedAvailability(selectedAvailability.filter((a) => a !== option))
                          }
                        }}
                      />
                      <label htmlFor={`availability-${option}`} className="text-sm">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeslots */}
              <div className="space-y-3">
                <h3 className="font-medium">Timeslot</h3>
                <div className="space-y-2">
                  {TIMESLOT_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`timeslot-${option}`}
                        checked={selectedTimeslots.includes(option)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedTimeslots([...selectedTimeslots, option])
                          } else {
                            setSelectedTimeslots(selectedTimeslots.filter((t) => t !== option))
                          }
                        }}
                      />
                      <label htmlFor={`timeslot-${option}`} className="text-sm">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Filters */}
              <div className="space-y-3">
                <h3 className="font-medium">Other</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                  <label htmlFor="verified-only" className="text-sm">
                    Verified skills only
                  </label>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
          <Button onClick={updateURL}>Apply Filters</Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {debouncedSearchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {debouncedSearchTerm}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
            </Badge>
          )}
          {selectedAvailability.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1">
              {item}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedAvailability(selectedAvailability.filter((a) => a !== item))}
              />
            </Badge>
          ))}
          {selectedTimeslots.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1">
              {item}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedTimeslots(selectedTimeslots.filter((t) => t !== item))}
              />
            </Badge>
          ))}
          {verifiedOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Verified Only
              <X className="h-3 w-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
