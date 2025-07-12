import { BASE_URL, API_ENDPOINTS, User, Skill, SwapRequest, Feedback, SystemMessage, DashboardSummary, PlatformStats } from "./constants"
import { apiCallTracker } from "./api-utils"

interface ApiOptions extends RequestInit {
  requireAuth?: boolean
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { requireAuth = false, ...fetchOptions } = options
  const startTime = Date.now()

  const url = `${BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (requireAuth) {
    const token = localStorage.getItem("auth_token")
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    const duration = Date.now() - startTime

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }))
      const errorMessage = error.message || error.error || `HTTP ${response.status}`
      
      // Track failed call
      apiCallTracker.logCall(endpoint, duration, false, errorMessage)
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    
    // Track successful call
    apiCallTracker.logCall(endpoint, duration, true)
    
    return data
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    
    // Track failed call
    apiCallTracker.logCall(endpoint, duration, false, errorMessage)
    
    throw error
  }
}

// Authentication API
export const authAPI = {
  register: async (userData: {
    email: string
    password: string
    password_confirm: string
    name: string
    location?: string
    profile_photo_url?: string
    is_public?: boolean
    availability?: string[]
    timeslot?: string[]
    linkedin?: string
    instagram?: string
    youtube?: string
    facebook?: string
    x?: string
    github?: string
    personal_portfolio?: string
  }) => {
    return apiCall(API_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  login: async (email: string, password: string) => {
    return apiCall(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  requestPasswordReset: async (email: string) => {
    return apiCall(API_ENDPOINTS.REQUEST_PASSWORD_RESET, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  resetPassword: async (token: string, new_password: string, new_password_confirm: string) => {
    return apiCall(API_ENDPOINTS.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ token, new_password, new_password_confirm }),
    })
  },
}

// User API
export const userAPI = {
  getMyProfile: async (): Promise<User> => {
    return apiCall(API_ENDPOINTS.GET_MY_PROFILE, { requireAuth: true })
  },

  updateMyProfile: async (userData: Partial<User>) => {
    return apiCall(API_ENDPOINTS.UPDATE_MY_PROFILE, {
      method: "PUT",
      body: JSON.stringify(userData),
      requireAuth: true,
    })
  },

  getPublicUsers: async (params?: {
    page?: number
    limit?: number
    search_skill?: string
    availability?: string[]
    timeslot?: string[]
    verified_only?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search_skill) searchParams.append('search_skill', params.search_skill)
    if (params?.availability) params.availability.forEach(av => searchParams.append('availability', av))
    if (params?.timeslot) params.timeslot.forEach(ts => searchParams.append('timeslot', ts))
    if (params?.verified_only) searchParams.append('verified_only', params.verified_only.toString())

    const queryString = searchParams.toString()
    const endpoint = queryString ? `${API_ENDPOINTS.GET_PUBLIC_USERS}?${queryString}` : API_ENDPOINTS.GET_PUBLIC_USERS
    
    return apiCall(endpoint, { requireAuth: false })
  },

  searchUsers: async (params: {
    q: string
    page?: number
    limit?: number
    availability?: string[]
    timeslot?: string[]
    verified_only?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    searchParams.append('q', params.q)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.availability) params.availability.forEach(av => searchParams.append('availability', av))
    if (params.timeslot) params.timeslot.forEach(ts => searchParams.append('timeslot', ts))
    if (params.verified_only) searchParams.append('verified_only', params.verified_only.toString())

    const endpoint = `${API_ENDPOINTS.SEARCH_USERS}?${searchParams.toString()}`
    return apiCall(endpoint, { requireAuth: true })
  },

  getUserById: async (userId: string): Promise<User> => {
    return apiCall(`${API_ENDPOINTS.GET_USER_BY_ID}${userId}/`, { requireAuth: true })
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    return apiCall(API_ENDPOINTS.GET_DASHBOARD_SUMMARY, { requireAuth: true })
  },

  getVerifiedSkills: async (): Promise<Skill[]> => {
    return apiCall(API_ENDPOINTS.GET_VERIFIED_SKILLS, { requireAuth: true })
  },

  getSkillProofs: async () => {
    return apiCall(API_ENDPOINTS.GET_SKILL_PROOFS, { requireAuth: true })
  },
}

// Skills API
export const skillsAPI = {
  addSkill: async (skillData: {
    name: string
    type: 'Offered' | 'Wanted'
    description?: string
    is_verified?: boolean
    proof_file_url?: string
    proof_file_type?: 'Link' | 'Image'
    proof_description?: string
  }): Promise<Skill> => {
    return apiCall(API_ENDPOINTS.ADD_SKILL, {
      method: "POST",
      body: JSON.stringify(skillData),
      requireAuth: true,
    })
  },

  updateSkill: async (skillId: string, skillData: Partial<Skill>): Promise<Skill> => {
    return apiCall(`${API_ENDPOINTS.UPDATE_SKILL}${skillId}/`, {
      method: "PUT",
      body: JSON.stringify(skillData),
      requireAuth: true,
    })
  },

  deleteSkill: async (skillId: string) => {
    return apiCall(`${API_ENDPOINTS.DELETE_SKILL}${skillId}/delete/`, {
      method: "DELETE",
      requireAuth: true,
    })
  },

  uploadSkillProof: async (skillId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const url = `${BASE_URL}${API_ENDPOINTS.UPLOAD_SKILL_PROOF}${skillId}/upload-proof/`
    const token = localStorage.getItem("auth_token")
    
    const startTime = Date.now()
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const duration = Date.now() - startTime

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Upload failed" }))
        const errorMessage = error.message || error.error || `HTTP ${response.status}`
        
        // Track failed call
        apiCallTracker.logCall(`${API_ENDPOINTS.UPLOAD_SKILL_PROOF}${skillId}/upload-proof/`, duration, false, errorMessage)
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Track successful call
      apiCallTracker.logCall(`${API_ENDPOINTS.UPLOAD_SKILL_PROOF}${skillId}/upload-proof/`, duration, true)
      
      return data
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      // Track failed call
      apiCallTracker.logCall(`${API_ENDPOINTS.UPLOAD_SKILL_PROOF}${skillId}/upload-proof/`, duration, false, errorMessage)
      
      throw error
    }
  },

  markSkillVerified: async (skillId: string): Promise<Skill> => {
    return apiCall(`${API_ENDPOINTS.MARK_SKILL_VERIFIED}${skillId}/mark-verified/`, {
      method: "PUT",
      requireAuth: true,
    })
  },
}

// Swap Requests API
export const swapRequestsAPI = {
  createSwapRequest: async (swapData: {
    receiver_id: string
    offered_skill_id: string
    requested_skill_id: string
    message?: string
  }): Promise<SwapRequest> => {
    return apiCall(API_ENDPOINTS.CREATE_SWAP_REQUEST, {
      method: "POST",
      body: JSON.stringify(swapData),
      requireAuth: true,
    })
  },

  getSentSwapRequests: async (params?: {
    status?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const queryString = searchParams.toString()
    const endpoint = queryString ? `${API_ENDPOINTS.GET_SENT_SWAP_REQUESTS}?${queryString}` : API_ENDPOINTS.GET_SENT_SWAP_REQUESTS
    
    return apiCall(endpoint, { requireAuth: true })
  },

  getReceivedSwapRequests: async (params?: {
    status?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const queryString = searchParams.toString()
    const endpoint = queryString ? `${API_ENDPOINTS.GET_RECEIVED_SWAP_REQUESTS}?${queryString}` : API_ENDPOINTS.GET_RECEIVED_SWAP_REQUESTS
    
    return apiCall(endpoint, { requireAuth: true })
  },

  getCompletedSwaps: async (): Promise<SwapRequest[]> => {
    return apiCall(API_ENDPOINTS.GET_COMPLETED_SWAPS, { requireAuth: true })
  },

  acceptSwapRequest: async (swapId: string): Promise<SwapRequest> => {
    return apiCall(`${API_ENDPOINTS.ACCEPT_SWAP_REQUEST}${swapId}/accept/`, {
      method: "PUT",
      requireAuth: true,
    })
  },

  rejectSwapRequest: async (swapId: string): Promise<SwapRequest> => {
    return apiCall(`${API_ENDPOINTS.REJECT_SWAP_REQUEST}${swapId}/reject/`, {
      method: "PUT",
      requireAuth: true,
    })
  },

  cancelSwapRequest: async (swapId: string): Promise<SwapRequest> => {
    return apiCall(`${API_ENDPOINTS.CANCEL_SWAP_REQUEST}${swapId}/cancel/`, {
      method: "PUT",
      requireAuth: true,
    })
  },
}

// Feedback API
export const feedbackAPI = {
  submitFeedback: async (feedbackData: {
    swap_request_id: string
    rating: number
    comment?: string
    expectations_matched: boolean
    skill_verified_by_peer?: boolean
  }): Promise<Feedback> => {
    return apiCall(API_ENDPOINTS.SUBMIT_FEEDBACK, {
      method: "POST",
      body: JSON.stringify(feedbackData),
      requireAuth: true,
    })
  },
}

// System Messages API
export const systemMessagesAPI = {
  getActiveMessages: async (): Promise<SystemMessage[]> => {
    return apiCall(API_ENDPOINTS.GET_ACTIVE_MESSAGES, { requireAuth: false })
  },
}

// Admin API
export const adminAPI = {
  getAllUsers: async (params?: {
    page?: number
    limit?: number
    search_email?: string
    is_banned?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search_email) searchParams.append('search_email', params.search_email)
    if (params?.is_banned !== undefined) searchParams.append('is_banned', params.is_banned.toString())

    const queryString = searchParams.toString()
    const endpoint = queryString ? `${API_ENDPOINTS.GET_ALL_USERS_ADMIN}?${queryString}` : API_ENDPOINTS.GET_ALL_USERS_ADMIN
    
    return apiCall(endpoint, { requireAuth: true })
  },

  banUser: async (userId: string, banned_reason: string) => {
    return apiCall(`${API_ENDPOINTS.BAN_USER}${userId}/ban/`, {
      method: "PUT",
      body: JSON.stringify({ banned_reason }),
      requireAuth: true,
    })
  },

  unbanUser: async (userId: string) => {
    return apiCall(`${API_ENDPOINTS.UNBAN_USER}${userId}/unban/`, {
      method: "PUT",
      requireAuth: true,
    })
  },

  deleteUser: async (userId: string) => {
    return apiCall(`${API_ENDPOINTS.DELETE_USER_ADMIN}${userId}/`, {
      method: "DELETE",
      requireAuth: true,
    })
  },

  getPlatformStats: async (): Promise<PlatformStats> => {
    return apiCall(API_ENDPOINTS.GET_PLATFORM_STATS, { requireAuth: true })
  },

  getAllSwapRequests: async (params?: {
    status?: string
    sender_id?: string
    receiver_id?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.sender_id) searchParams.append('sender_id', params.sender_id)
    if (params?.receiver_id) searchParams.append('receiver_id', params.receiver_id)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const queryString = searchParams.toString()
    const endpoint = queryString ? `${API_ENDPOINTS.GET_ALL_SWAP_REQUESTS_ADMIN}?${queryString}` : API_ENDPOINTS.GET_ALL_SWAP_REQUESTS_ADMIN
    
    return apiCall(endpoint, { requireAuth: true })
  },

  createSystemMessage: async (messageData: {
    title: string
    content: string
    is_active?: boolean
  }): Promise<SystemMessage> => {
    return apiCall(API_ENDPOINTS.CREATE_SYSTEM_MESSAGE, {
      method: "POST",
      body: JSON.stringify(messageData),
      requireAuth: true,
    })
  },

  getAllSystemMessages: async (): Promise<SystemMessage[]> => {
    return apiCall(API_ENDPOINTS.GET_ALL_SYSTEM_MESSAGES_ADMIN, { requireAuth: true })
  },

  updateSystemMessage: async (messageId: string, messageData: Partial<SystemMessage>): Promise<SystemMessage> => {
    return apiCall(`${API_ENDPOINTS.UPDATE_SYSTEM_MESSAGE_ADMIN}${messageId}/`, {
      method: "PUT",
      body: JSON.stringify(messageData),
      requireAuth: true,
    })
  },

  deleteSystemMessage: async (messageId: string) => {
    return apiCall(`${API_ENDPOINTS.DELETE_SYSTEM_MESSAGE_ADMIN}${messageId}/`, {
      method: "DELETE",
      requireAuth: true,
    })
  },

  deleteSkill: async (skillId: string) => {
    return apiCall(`${API_ENDPOINTS.DELETE_SKILL_ADMIN}${skillId}/`, {
      method: "DELETE",
      requireAuth: true,
    })
  },

  updateSkill: async (skillId: string, skillData: { description: string }): Promise<Skill> => {
    return apiCall(`${API_ENDPOINTS.UPDATE_SKILL_ADMIN}${skillId}/`, {
      method: "PUT",
      body: JSON.stringify(skillData),
      requireAuth: true,
    })
  },
}
