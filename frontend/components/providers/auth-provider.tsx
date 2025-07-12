"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { authAPI, userAPI } from "@/lib/api"
import { User } from "@/lib/constants"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
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
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setIsLoading(false)
        return
      }

      const userData = await userAPI.getMyProfile()
      setUser(userData)
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("auth_token")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const data = await authAPI.login(email, password)
    
    // Store the access token from the response
    localStorage.setItem("auth_token", data.tokens.access)
    setUser(data.user)
  }

  const register = async (userData: {
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
    const data = await authAPI.register(userData)
    
    // Store the access token from the response
    localStorage.setItem("auth_token", data.tokens.access)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}
