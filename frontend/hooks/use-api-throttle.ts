import { useRef, useCallback } from 'react'

interface ThrottleOptions {
  minInterval?: number // Minimum time between calls in milliseconds
  maxInterval?: number // Maximum time between calls in milliseconds
}

export function useApiThrottle(options: ThrottleOptions = {}) {
  const { minInterval = 15000, maxInterval = 20000 } = options
  const lastCallTime = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const throttledCall = useCallback(
    async <T>(apiFunction: () => Promise<T>): Promise<T> => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCallTime.current

      // If enough time has passed since the last call, make the call immediately
      if (timeSinceLastCall >= minInterval) {
        lastCallTime.current = now
        return await apiFunction()
      }

      // If we're within the minimum interval, schedule the call
      const timeToWait = minInterval - timeSinceLastCall

      return new Promise((resolve, reject) => {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Schedule the call
        timeoutRef.current = setTimeout(async () => {
          try {
            lastCallTime.current = Date.now()
            const result = await apiFunction()
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }, timeToWait)
      })
    },
    [minInterval]
  )

  const clearThrottle = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  return { throttledCall, clearThrottle }
} 