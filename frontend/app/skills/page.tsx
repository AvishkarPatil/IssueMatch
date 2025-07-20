"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getUserByGithubId, updateUserSkills } from "@/lib/firebase-utils"
import WelcomeScreen from "@/components/skills/welcome-screen"
import SkillsTest from "@/components/skills/skills-test"
import ResultsScreen from "@/components/skills/results-screen"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

export default function SkillsPage() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "test" | "results">("welcome")
  const [userSkills, setUserSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  // Check if user has already taken the test
  useEffect(() => {
    const checkTestStatus = async () => {
      try {
        // Wait for auth context to load
        if (authLoading) {
          return;
        }

        setLoading(true)

        // If no user is authenticated, redirect to login
        if (!user) {
          console.log("No authenticated user found, redirecting to login");
          router.push('/login')
          return
        }

        console.log("User authenticated:", user);

        // Check if user has already taken the test using Firebase
        const userResult = await getUserByGithubId(user.id)
        console.log("Firebase user data:", userResult);

        if (userResult?.success && userResult.data?.test_taken) {
          // User has already taken the test, redirect to home/dashboard
          console.log("User has already taken the test, redirecting to home page");
          toast({
            title: "Welcome back!",
            description: "You've already completed the skills assessment.",
            duration: 3000,
          })
          router.push('/') // Redirect to root/home
          return
        }

        console.log("User hasn't taken the test yet, showing test interface");
        // User hasn't taken the test yet, show the test interface
        setLoading(false)
      } catch (error) {
        console.error("Error checking test status:", error)
        toast({
          title: "Error",
          description: "There was a problem loading your profile. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
        setLoading(false)
      }
    }

    checkTestStatus()
  }, [router, toast, user, authLoading])

  // Auto-transition from welcome to test screen
  useEffect(() => {
    if (!loading && currentScreen === "welcome") {
      const timer = setTimeout(() => {
        setCurrentScreen("test")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen, loading])

  const handleTestComplete = (skills: string[]) => {
    setUserSkills(skills)
    setCurrentScreen("results")
  }

  const handleGetStarted = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated. Please log in again.",
        variant: "destructive",
        duration: 5000,
      })
      router.push('/login')
      return
    }

    try {
      // Save the skills to Firebase and mark test as taken
      console.log("Saving skills to Firebase:", userSkills);
      const result = await updateUserSkills(user.id, userSkills)

      if (result.success) {
        console.log("Skills saved successfully");
        toast({
          title: "Skills Saved",
          description: "Your skills have been saved successfully!",
          duration: 3000,
        })
        // Redirect to home or match page
        router.push("/")
      } else {
        console.error("Error saving skills:", result.error);
        toast({
          title: "Error",
          description: "There was a problem saving your skills. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error in handleGetStarted:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your skills. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Loading state - show while checking auth or loading user data
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <Progress value={100} className="w-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white">
      {currentScreen === "welcome" && <WelcomeScreen />}

      {currentScreen === "test" && <SkillsTest onComplete={handleTestComplete} />}

      {currentScreen === "results" && <ResultsScreen skills={userSkills} onGetStarted={handleGetStarted} />}
    </div>
  )
}