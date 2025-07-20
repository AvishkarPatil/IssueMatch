"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createOrUpdateGithubUser, getUserByGithubId } from "@/lib/firebase-utils"
import { useToast } from "@/components/ui/use-toast"

// Define the User type
type User = {
  id: string
  login: string
  avatar_url: string
  name: string | null
  test_taken?: boolean
} | null

// Define the context type
type AuthContextType = {
  user: User
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
  checkAuth: async () => false,
})

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if the user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("Checking authentication...");

      // Fetch user profile from backend
      console.log("Fetching user profile from backend...");
      const response = await fetch("http://localhost:8000/api/v1/github/profile", {
        credentials: "include" // Important: include cookies for session authentication
      });

      if (!response.ok) {
        console.log("Not authenticated, response not OK:", response.status);
        return false;
      }

      const githubUser = await response.json();
      console.log("GitHub user data received:", githubUser);

      if (!githubUser?.id) {
        console.log("No user ID found in GitHub data");
        return false;
      }

      // Store essential user data in localStorage for convenience
      localStorage.setItem('github_user', JSON.stringify({
        id: githubUser.id.toString(),
        login: githubUser.login,
        avatar_url: githubUser.avatar_url,
        name: githubUser.name
      }));
      console.log("User data stored in localStorage");

      // Check if user exists in our database
      console.log("Checking if user exists in Firebase...");
      const userResult = await getUserByGithubId(githubUser.id.toString());
      console.log("User lookup result:", userResult);

      if (!userResult?.success) {
        console.log("User doesn't exist in Firebase, creating new user...");
        // User doesn't exist in our database yet, create them
        const createResult = await createOrUpdateGithubUser({
          id: githubUser.id.toString(),
          login: githubUser.login,
          avatar_url: githubUser.avatar_url,
          name: githubUser.name,
          email: githubUser.email
        });

        console.log("User creation result:", createResult);

        if (!createResult.success) {
          console.error("Failed to create user in Firebase:", createResult.error);
          toast({
            title: "Error",
            description: "Failed to create user profile. Please try again.",
            variant: "destructive",
          });
        }

        // Set user with default values
        setUser({
          id: githubUser.id.toString(),
          login: githubUser.login,
          avatar_url: githubUser.avatar_url,
          name: githubUser.name,
          test_taken: false
        });
        console.log("User state set with default values");
      } else {
        console.log("User exists in Firebase, using existing data");
        // User exists, use data from our database
        setUser({
          id: githubUser.id.toString(),
          login: githubUser.login,
          avatar_url: githubUser.avatar_url,
          name: githubUser.name,
          test_taken: userResult.data?.test_taken || false
        });
        console.log("User state set with Firebase data");
      }

      console.log("Authentication check complete, user is authenticated");
      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      toast({
        title: "Authentication Error",
        description: "There was a problem verifying your account. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      console.log("Logging out...");
      // Clear local storage
      localStorage.removeItem('github_user')

      // Clear user state
      setUser(null)

      // Redirect to backend logout endpoint
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

  // Check authentication on component mount
  useEffect(() => {
    console.log("AuthProvider mounted, checking authentication...");
    checkAuth();
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

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)