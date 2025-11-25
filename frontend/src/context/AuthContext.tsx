"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import * as SecureStore from "expo-secure-store"
import { userApi, authApi } from "../api"
import { setAccessToken as setAccessTokenHelper } from "./tokenHelper"
import type { User } from "../types"

type AuthContextType = {
  user: User | null
  signIn: (username: string, password: string) => Promise<void>
  signUp: (payload: {
    username: string
    password: string
    email: string
    firstName?: string
    lastName?: string
  }) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  refreshUser: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  // Khôi phục session từ refresh token khi app khởi động
  useEffect(() => {
    ; (async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken")
        if (refreshToken) {
          const r = await authApi.refresh(refreshToken)
          if (r.data.accessToken) {
            await setAccessTokenHelper(r.data.accessToken)
            // Fetch profile
            const me = await userApi.getProfile()
            setUser(me.data.user ?? null)
          }
        }
      } catch (e) {
        console.warn("Restore session failed", e)
        await SecureStore.deleteItemAsync("refreshToken")
        await setAccessTokenHelper(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const signIn = async (username: string, password: string) => {
    const r = await authApi.signIn(username.trim().toLowerCase(), password)
    if (!r.data.accessToken) {
      throw new Error("Login failed")
    }
    const { accessToken, refreshToken } = r.data
    await SecureStore.setItemAsync("refreshToken", refreshToken)
    await setAccessTokenHelper(accessToken)
    // Fetch profile
    const me = await userApi.getProfile()
    setUser(me.data.user ?? null)
  }

  const signUp = async (payload: {
    username: string
    password: string
    email: string
    firstName?: string
    lastName?: string
  }) => {
    try {
      const response = await authApi.signUp({
        username: payload.username,
        password: payload.password,
        email: payload.email,
        firstName: payload.firstName || "",
        lastName: payload.lastName || "",
      })
      console.log("[v0] SignUp response:", response.data)
      return response.data
    } catch (error: any) {
      console.log("[v0] SignUp error in AuthContext:", error.response?.data || error.message)
      // Re-throw để component có thể catch và hiển thị message
      throw error
    }
  }

  const signOut = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken")
      if (refreshToken) {
        await authApi.signOut(refreshToken)
      }
    } catch (e) {
      console.warn("signOut error", e)
    } finally {
      await SecureStore.deleteItemAsync("refreshToken")
      setUser(null)
      await setAccessTokenHelper(null)
    }
  }

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data })
    }
  }

  const refreshUser = async () => {
    try {
      const me = await userApi.getProfile()
      setUser(me.data.user ?? null)
    } catch (e) {
      console.warn("refreshUser error", e)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        updateUser,
        refreshUser,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
