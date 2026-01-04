"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import WelcomeScreen from "@/components/skills/welcome-screen"
import SkillsTest from "@/components/skills/skills-test"
import ResultsScreen from "@/components/skills/results-screen"
import { useToast } from "@/components/ui/use-toast"

export default function SkillsPage() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "test" | "results">("welcome")
  const [userSkills, setUserSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const checkTestStatus = async () => {
      try {
        if (authLoading) return

        setLoading(true)

        if (!user) {
          router.push('/login')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/status`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.skillsTestCompleted) {
            toast({
              title: "Welcome back!",
              description: "You've already completed the skills assessment.",
              duration: 3000,
            })
            router.push('/')
            return
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("Error checking test status:", error)
        setLoading(false)
      }
    }

    checkTestStatus()
  }, [router, toast, user, authLoading])

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
      router.push('/login')
      return
    }

    try {
      const referralCode = sessionStorage.getItem('referralCode')
      const endpoint = referralCode 
        ? `${process.env.NEXT_PUBLIC_API_URL}/skills/submit-with-referral?referralCode=${referralCode}`
        : `${process.env.NEXT_PUBLIC_API_URL}/skills/submit`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ skills: userSkills }),
      })

      if (response.ok) {
        sessionStorage.removeItem('referralCode')
        toast({
          title: "Skills Saved",
          description: "Your skills have been saved successfully!",
          duration: 3000,
        })
        router.push("/")
      } else {
        toast({
          title: "Error",
          description: "There was a problem saving your skills.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error saving skills:", error)
      toast({
        title: "Error",
        description: "There was a problem saving your skills.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <div className="relative w-[300px] h-2 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-full">
            <div className="h-full bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {currentScreen === "welcome" && <WelcomeScreen />}
      {currentScreen === "test" && <SkillsTest onComplete={handleTestComplete} />}
      {currentScreen === "results" && <ResultsScreen skills={userSkills} onGetStarted={handleGetStarted} />}
    </div>
  )
}