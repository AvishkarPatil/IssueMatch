"use client"

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createOrUpdateGithubUser, getUserByGithubId } from "@/lib/firebase-utils"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  login: string
  avatar_url: string
  name: string | null
  test_taken?: boolean
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
  checkAuth: async () => false,
})

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch(`${API_BASE_URL}/api/v1/github/profile`, {
        credentials: "include",
      })

      if (!response.ok) {
        setUser(null)
        return false
      }

      const githubUser = await response.json()
      if (!githubUser?.id) {
        setUser(null)
        return false
      }

      // persist in localStorage only on client
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "github_user",
          JSON.stringify({
            id: githubUser.id.toString(),
            login: githubUser.login,
            avatar_url: githubUser.avatar_url,
            name: githubUser.name,
          })
        )
      }

      // Fetch user record from DB
      const userResult = await getUserByGithubId(githubUser.id.toString())

      if (!userResult?.success) {
        // Create user if not found
        const createResult = await createOrUpdateGithubUser({
          id: githubUser.id.toString(),
          login: githubUser.login,
          avatar_url: githubUser.avatar_url,
          name: githubUser.name,
          email: githubUser.email,
        })

        if (!createResult.success) {
          toast({
            title: "Error",
            description: "Failed to create user profile.",
            variant: "destructive",
          })
        }

        setUser({
          id: githubUser.id.toString(),
          login: githubUser.login,
          avatar_url: githubUser.avatar_url,
          name: githubUser.name,
          test_taken: false,
        })
      } else {
        setUser({
          id: githubUser.id.toString(),
          login: githubUser.login,
          avatar_url: githubUser.avatar_url,
          name: githubUser.name,
          test_taken: userResult.data?.test_taken || false,
        })
      }

      return true
    } catch (error) {
      console.error("Auth check failed:", error)
      toast({
        title: "Authentication Error",
        description: "Problem verifying your account.",
        variant: "destructive",
      })
      setUser(null)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("github_user")
      }
      setUser(null)
      // Use router.push for Next.js navigation instead of full reload if possible
      window.location.href = `${API_BASE_URL}/api/v1/auth/logout`
    } catch (error) {
      console.error("Logout failed:", error)
      toast({
        title: "Error",
        description: "Problem logging out.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    checkAuth()

    // Re-check when user comes back to the tab
    const handleVisibility = () => {
      if (!document.hidden) checkAuth()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      logout,
      checkAuth,
    }),
    [user, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
