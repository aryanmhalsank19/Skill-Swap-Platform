import { useEffect, useRef, useCallback } from 'react'

interface PeriodicApiOptions {
  interval?: number // Interval between calls in milliseconds (default: 20000)
  minInterval?: number // Minimum time between calls in milliseconds (default: 15000)
  enabled?: boolean // Whether periodic calls are enabled
  onError?: (error: any) => void
}

export function usePeriodicApi<T>(
  apiFunction: () => Promise<T>,
  options: PeriodicApiOptions = {}
) {
  const { 
    interval = 20000, 
    minInterval = 15000, 
    enabled = true,
    onError 
  } = options
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCallTime = useRef<number>(0)
  const isInitialCall = useRef(true)

  const executeApiCall = useCallback(async () => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime.current

    // For initial call, execute immediately
    if (isInitialCall.current) {
      isInitialCall.current = false
      lastCallTime.current = now
      try {
        return await apiFunction()
      } catch (error) {
        onError?.(error)
        throw error
      }
    }

    // For subsequent calls, respect minimum interval
    if (timeSinceLastCall < minInterval) {
      const timeToWait = minInterval - timeSinceLastCall
      return new Promise<T>((resolve, reject) => {
        setTimeout(async () => {
          try {
            lastCallTime.current = Date.now()
            const result = await apiFunction()
            resolve(result)
          } catch (error) {
            onError?.(error)
            reject(error)
          }
        }, timeToWait)
      })
    }

    // Execute immediately if enough time has passed
    lastCallTime.current = now
    try {
      return await apiFunction()
    } catch (error) {
      onError?.(error)
      throw error
    }
  }, [apiFunction, minInterval, onError])

  const startPeriodicCalls = useCallback(() => {
    if (!enabled) return

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up new interval
    intervalRef.current = setInterval(async () => {
      try {
        await executeApiCall()
      } catch (error) {
        console.error('Periodic API call failed:', error)
      }
    }, interval)
  }, [enabled, interval, executeApiCall])

  const stopPeriodicCalls = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const resetInterval = useCallback(() => {
    stopPeriodicCalls()
    startPeriodicCalls()
  }, [stopPeriodicCalls, startPeriodicCalls])

  useEffect(() => {
    if (enabled) {
      startPeriodicCalls()
    } else {
      stopPeriodicCalls()
    }

    return () => {
      stopPeriodicCalls()
    }
  }, [enabled, startPeriodicCalls, stopPeriodicCalls])

  return {
    executeApiCall,
    startPeriodicCalls,
    stopPeriodicCalls,
    resetInterval,
    isInitialCall: isInitialCall.current
  }
} 