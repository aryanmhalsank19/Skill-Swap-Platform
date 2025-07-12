// API call tracking and debugging utilities

interface ApiCallLog {
  endpoint: string
  timestamp: number
  duration: number
  success: boolean
  error?: string
}

class ApiCallTracker {
  private calls: ApiCallLog[] = []
  private maxLogs = 100

  logCall(endpoint: string, duration: number, success: boolean, error?: string) {
    const log: ApiCallLog = {
      endpoint,
      timestamp: Date.now(),
      duration,
      success,
      error
    }

    this.calls.push(log)

    // Keep only the last maxLogs entries
    if (this.calls.length > this.maxLogs) {
      this.calls = this.calls.slice(-this.maxLogs)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Call: ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'} - ${duration}ms`)
      if (error) {
        console.error(`API Error: ${error}`)
      }
    }
  }

  getRecentCalls(limit = 10): ApiCallLog[] {
    return this.calls.slice(-limit)
  }

  getCallStats() {
    const totalCalls = this.calls.length
    const successfulCalls = this.calls.filter(call => call.success).length
    const failedCalls = totalCalls - successfulCalls
    const avgDuration = this.calls.reduce((sum, call) => sum + call.duration, 0) / totalCalls

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      successRate: totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0,
      avgDuration: Math.round(avgDuration)
    }
  }

  clear() {
    this.calls = []
  }
}

export const apiCallTracker = new ApiCallTracker()

// Throttling utility
export function createThrottledFunction<T extends (...args: any[]) => any>(
  func: T,
  minInterval: number
): T {
  let lastCallTime = 0
  let timeoutId: NodeJS.Timeout | null = null

  return ((...args: any[]) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime

    if (timeSinceLastCall >= minInterval) {
      // Execute immediately
      lastCallTime = now
      return func(...args)
    }

    // Schedule execution
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      const timeToWait = minInterval - timeSinceLastCall
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now()
        try {
          const result = func(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, timeToWait)
    })
  }) as T
}

// Debouncing utility
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null

  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        try {
          const result = func(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }) as T
}

// Rate limiting utility
export class RateLimiter {
  private calls: number[] = []
  private maxCalls: number
  private timeWindow: number

  constructor(maxCalls: number, timeWindow: number) {
    this.maxCalls = maxCalls
    this.timeWindow = timeWindow
  }

  canMakeCall(): boolean {
    const now = Date.now()
    const windowStart = now - this.timeWindow

    // Remove old calls outside the time window
    this.calls = this.calls.filter(timestamp => timestamp > windowStart)

    // Check if we can make another call
    if (this.calls.length < this.maxCalls) {
      this.calls.push(now)
      return true
    }

    return false
  }

  getTimeUntilNextCall(): number {
    if (this.calls.length < this.maxCalls) {
      return 0
    }

    const oldestCall = Math.min(...this.calls)
    const windowStart = Date.now() - this.timeWindow
    return Math.max(0, oldestCall - windowStart)
  }
} 