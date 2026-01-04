"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
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
  checkAuth: async () => false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch("http://localhost:8000/api/v1/github/profile", {
        credentials: "include"
      });

      if (!response.ok) {
        return false;
      }

      const githubUser = await response.json();

      if (!githubUser?.id) {
        return false;
      }

      localStorage.setItem('github_user', JSON.stringify({
        id: githubUser.id.toString(),
        login: githubUser.login,
        avatar_url: githubUser.avatar_url,
        name: githubUser.name
      }));

      const skillsResponse = await fetch("http://localhost:8000/api/v1/skills/status", {
        credentials: "include"
      });

      let test_taken = false;
      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        test_taken = skillsData.skillsTestCompleted || false;
      }

      setUser({
        id: githubUser.id.toString(),
        login: githubUser.login,
        avatar_url: githubUser.avatar_url,
        name: githubUser.name,
        test_taken
      });

      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem('github_user')
      setUser(null)
      window.location.href = "http://localhost:8000/api/v1/auth/logout"
    } catch (error) {
      console.error("Error during logout:", error)
      toast({
        title: "Error",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    let mounted = true;
    
    const doCheck = async () => {
      if (mounted) {
        await checkAuth();
      }
    };
    
    doCheck();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)