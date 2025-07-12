export const BASE_URL = "http://127.0.0.1:8000"

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  REGISTER: "/api/auth/register/",
  LOGIN: "/api/auth/login/",
  REQUEST_PASSWORD_RESET: "/api/auth/request-password-reset/",
  RESET_PASSWORD: "/api/auth/reset-password/",
  
  // Users
  GET_MY_PROFILE: "/api/users/me/",
  UPDATE_MY_PROFILE: "/api/users/me/",
  GET_PUBLIC_USERS: "/api/users/public/",
  SEARCH_USERS: "/api/users/public/search/",
  GET_USER_BY_ID: "/api/users/",
  GET_DASHBOARD_SUMMARY: "/api/users/me/dashboard-summary/",
  GET_VERIFIED_SKILLS: "/api/users/me/verified-skills/",
  GET_SKILL_PROOFS: "/api/users/me/skill-proofs/",
  
  // Skills
  ADD_SKILL: "/api/skills/",
  UPDATE_SKILL: "/api/skills/",
  DELETE_SKILL: "/api/skills/",
  UPLOAD_SKILL_PROOF: "/api/skills/",
  MARK_SKILL_VERIFIED: "/api/skills/",
  
  // Swap Requests
  CREATE_SWAP_REQUEST: "/api/swap-requests/",
  GET_SENT_SWAP_REQUESTS: "/api/swap-requests/sent/",
  GET_RECEIVED_SWAP_REQUESTS: "/api/swap-requests/received/",
  GET_COMPLETED_SWAPS: "/api/swap-requests/completed/",
  ACCEPT_SWAP_REQUEST: "/api/swap-requests/",
  REJECT_SWAP_REQUEST: "/api/swap-requests/",
  CANCEL_SWAP_REQUEST: "/api/swap-requests/",
  
  // Feedback
  SUBMIT_FEEDBACK: "/api/feedback/",
  
  // System Messages
  GET_ACTIVE_MESSAGES: "/api/system-messages/active/",
  
  // Admin
  GET_ALL_USERS_ADMIN: "/api/admin/users/",
  BAN_USER: "/api/admin/users/",
  UNBAN_USER: "/api/admin/users/",
  DELETE_USER_ADMIN: "/api/admin/users/",
  GET_PLATFORM_STATS: "/api/admin/stats/",
  GET_ALL_SWAP_REQUESTS_ADMIN: "/api/admin/swap-requests/",
  CREATE_SYSTEM_MESSAGE: "/api/admin/system-messages/",
  GET_ALL_SYSTEM_MESSAGES_ADMIN: "/api/admin/system-messages/",
  UPDATE_SYSTEM_MESSAGE_ADMIN: "/api/admin/system-messages/",
  DELETE_SYSTEM_MESSAGE_ADMIN: "/api/admin/system-messages/",
  DELETE_SKILL_ADMIN: "/api/admin/skills/",
  UPDATE_SKILL_ADMIN: "/api/admin/skills/",
} as const

// User interface types
export interface User {
  id: string
  email: string
  name: string
  location?: string
  profile_photo_url?: string
  is_public: boolean
  availability?: string[]
  timeslot?: string[]
  linkedin?: string
  instagram?: string
  youtube?: string
  facebook?: string
  x?: string
  github?: string
  personal_portfolio?: string
  credits: number
  date_joined: string
  last_login?: string
  skills?: Skill[]
  average_rating?: number
}

export interface Skill {
  id: string
  user: User
  name: string
  type: 'Offered' | 'Wanted'
  description?: string
  is_verified: boolean
  verification_count: number
  proof_file_url?: string
  proof_file_type?: 'Link' | 'Image'
  proof_description?: string
  created_at: string
}

export interface SwapRequest {
  id: string
  sender: User
  receiver: User
  offered_skill: Skill
  requested_skill: Skill
  message?: string
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled' | 'Withdrawn'
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  swap_request: string
  rater: User
  rated_user: User
  rating: number
  comment?: string
  expectations_matched: boolean
  skill_verified_by_peer?: boolean
  created_at: string
}

export interface SystemMessage {
  id: string
  title: string
  content: string
  created_at: string
  is_active: boolean
}

export interface DashboardSummary {
  credits: number
  average_rating: number
  completed_swaps: number
  pending_swaps: number
}

export interface PlatformStats {
  total_users: number
  active_users: number
  total_swaps: number
  completed_swaps: number
  skill_popularity: Array<{name: string, count: number}>
  total_feedback: number
  average_rating: number
}
