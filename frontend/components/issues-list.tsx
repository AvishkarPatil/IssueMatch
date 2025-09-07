"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { IssueCard } from "@/components/issue-card"
import { useAuth } from "@/context/auth-context"
import { getUserByGithubId } from "@/lib/firebase-utils"

const MATCH_COLORS = ["#8b5cf6", "#ec4899", "#f97316", "#10b981", "#3b82f6"]

interface APIIssue {
  issue_id: number
  issue_url: string
  repo_url: string
  title: string
  created_at: string
  user_login: string
  labels: string[]
  similarity_score: number
  short_description: string
}

interface IssuesListProps {
  type: "recommended" | "trending" | "favorite" | "recent"
}

import { IssueFilter } from "@/components/issue-filter"

export function IssuesList({ type }: IssuesListProps) {
  const [issues, setIssues] = useState<APIIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userSkills, setUserSkills] = useState<string[]>([])
  const [filters, setFilters] = useState<{ keywords: string[] }>({
    keywords: [],
  })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { user, isLoading: authLoading } = useAuth()

  // Fetch user skills from Firebase
  const fetchUserSkills = useCallback(async () => {
    if (!user) {
      setUserSkills([])
      return
    }
    try {
      const result = await getUserByGithubId(user.id)
      if (result.success && result.data?.skill_keywords) {
        setUserSkills(result.data.skill_keywords)
        // Initialize filters.keywords with user skills
        setFilters((prev) => ({ ...prev, keywords: result.data.skill_keywords }))
      } else {
        setUserSkills([])
      }
    } catch (error) {
      console.error("Error fetching user skills:", error)
      setUserSkills([])
    }
  }, [user])

  // Create a fetchIssues function that can be called both in useEffect and by the retry button
  const fetchIssues = useCallback(async () => {
    if (authLoading) {
      return
    }

    if (!user) {
      setError("Please log in to view issues")
      setLoading(false)
      return
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set up a new timeout
    timeoutRef.current = setTimeout(() => {
      setLoading(false)
      setError("Request timed out. Please try again later.")
    }, 25000) // 25 seconds timeout

    setLoading(true)
    setError(null)

    try {
      console.log(`Fetching ${type} issues...`)

      // Build endpoint with filters for recommended type
      let endpoint = ""
      if (type === "recommended") {
        const params = new URLSearchParams()
        if (filters.keywords.length > 0) {
          filters.keywords.forEach((skill) => {
            params.append("keywords", skill)
          })
        } else {
          // fallback keywords if no user skills
          params.append("keywords", "machine-learning")
          params.append("keywords", "java")
        }

        params.append("max_results", "5")
        endpoint = `http://localhost:8000/api/v1/match/match-issue?${params.toString()}`
      } else {
        switch (type) {
          case "trending":
            endpoint = "http://localhost:8000/api/v1/match/trending-issues"
            break
          case "favorite":
            endpoint = "http://localhost:8000/api/v1/match/favorite-issues"
            break
          case "recent":
            endpoint = "http://localhost:8000/api/v1/match/recent-issues"
            break
          default:
            endpoint = "http://localhost:8000/api/v1/match/match-issue?keywords=machine-learning&keywords=java&max_results=5"
        }
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      })

      // Clear the timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`)
      }

      const data = await response.json()
      console.log("Successfully received data:", data)

      if (data.recommendations && Array.isArray(data.recommendations)) {
        setIssues(data.recommendations)
      } else if (Array.isArray(data)) {
        // Handle case where the API returns an array directly
        setIssues(data)
      } else {
        console.warn("No valid data found in response:", data)
        setIssues([])
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching issues:", err)
      setLoading(false)
      setError(err instanceof Error ? err.message : "Failed to fetch issues")
    }
  }, [type, filters, authLoading, user])

  // Effect to fetch user skills when user changes
  useEffect(() => {
    fetchUserSkills()
  }, [fetchUserSkills])

  // Effect to fetch issues when the component mounts or type, filters change
  useEffect(() => {
    fetchIssues()

    // Cleanup function to clear the timeout when the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [fetchIssues]) // fetchIssues already depends on type, filters, authLoading

  // Transform API issues to the format expected by IssueCard
  const transformedIssues = issues.map((issue, index) => ({
    id: issue.issue_id,
    title: issue.title,
    repo: issue.repo_url.replace("https://github.com/", ""),
    description: issue.short_description,
    skillMatch: Math.min(Math.round(issue.similarity_score * 100 + 30), 99), // Cap at 99%
    skills: issue.labels?.slice(0, 5) || ["No labels"],
    matchColor: MATCH_COLORS[index % MATCH_COLORS.length],
    issueUrl: issue.issue_url,
  }))

  return (
    <>
      <IssueFilter onFilterChange={setFilters} />
      <div className="grid gap-4 mt-4">
        {loading ? (
          <div className="bg-white dark:bg-[#1a1f2a] rounded-lg p-6 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="flex space-x-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-[#1a1f2a] rounded-lg p-6 text-center border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none">
            <div className="text-red-600 dark:text-red-400 mb-2">Error loading issues</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error}</div>
            {error === "Please log in to view issues" ? (
              <a
                href="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg text-white transition-colors shadow-sm dark:shadow-none inline-block"
              >
                Log In
              </a>
            ) : (
              <button
                onClick={fetchIssues}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg text-white transition-colors shadow-sm dark:shadow-none"
              >
                Try Again
              </button>
            )}
          </div>
        ) : transformedIssues.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1f2a] rounded-lg p-6 text-center border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none">
            <div className="text-gray-600 dark:text-gray-400 mb-2">No issues found</div>
            <div className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your search criteria or check back later</div>
          </div>
        ) : (
          transformedIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        )}
      </div>
    </>
  )
}
