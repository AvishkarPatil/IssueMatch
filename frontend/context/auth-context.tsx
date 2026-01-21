"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react"
import { useRouter } from "next/navigation"
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
  checkAuth: async () => false
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/github/profile`,
        { credentials: "include" }
      )

      if (!response.ok) throw new Error("Not authenticated")

      const githubUser = await response.json()

      const skillsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/skills/status`,
        { credentials: "include" }
      )

      let test_taken = false
      if (skillsRes.ok) {
        const data = await skillsRes.json()
        test_taken = !!data.skillsTestCompleted
      }

      const finalUser = {
        id: githubUser.id.toString(),
        login: githubUser.login,
        avatar_url: githubUser.avatar_url,
        name: githubUser.name,
        test_taken
      }

      setUser(finalUser)
      localStorage.setItem("github_user", JSON.stringify(finalUser))
      return true
    } catch {
      setUser(null)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      localStorage.removeItem("github_user")
      setUser(null)
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`
    } catch {
      toast({
        title: "Logout failed",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    const timer = setTimeout(checkAuth, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

