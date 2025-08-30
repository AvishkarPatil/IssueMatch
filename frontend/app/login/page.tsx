"use client"

import { Github } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuth()

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const isAuth = await checkAuth()

      if (isAuth && user) {
        // If user has completed the skills test, redirect to match page
        if (user.test_taken) {
          router.push('/match')
        } else {
          // If user hasn't completed the skills test, redirect to skills page
          router.push('/skills')
        }
      }
    }

    checkAuthStatus()

    // Check for error query parameter (for failed login attempts)
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    if (errorParam) {
      setError(
        errorParam === 'auth_failed'
          ? "GitHub authentication failed. Please try again."
          : "An error occurred during login. Please try again."
      )
    }
  }, [router, checkAuth, user])

  const handleGitHubLogin = () => {
    setIsLoading(true)
    setError("")

    // Redirect to the backend's GitHub OAuth login endpoint
    window.location.href = "http://localhost:8000/api/v1/auth/login"
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-black dark:text-white">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-700 dark:text-gray-400">
          Or{" "}
          <Link href="/landing" className="font-medium text-purple-400 hover:text-purple-300">
            return to the landing page
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-100 dark:bg-[#1a1f2a] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black dark:text-white bg-gray-300 dark:bg-[#24292e] hover:bg-gray-400 dark:hover:bg-[#2c3440] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#1a1f2a] focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Github className="mr-2 h-5 w-5" />
            {isLoading ? "Redirecting to GitHub..." : "Sign in with GitHub"}
          </button>

          <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-400">
            <p>
              By signing in, you agree to our{" "}
              <Link href="#" className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-700 dark:text-gray-400">
          Don't have a GitHub account?{" "}
          <a
            href="https://github.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}