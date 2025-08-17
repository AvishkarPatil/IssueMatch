"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { IssueCard } from "@/components/issue-card"

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

export function IssuesList({ type }: IssuesListProps) {
  const [issues, setIssues] = useState<APIIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Create a fetchIssues function that can be called both in useEffect and by the retry button
  const fetchIssues = useCallback(async () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set up a new timeout
    timeoutRef.current = setTimeout(() => {
      setLoading(false)
      setError("Request timed out. Please try again later.")
    }, 25000) // 15 seconds timeout

    setLoading(true)
    setError(null)

    try {
      console.log(`Fetching ${type} issues...`)

      // Different endpoints based on issue type
      let endpoint = ""
      switch (type) {
        case "recommended":
          endpoint = "http://localhost:8000/api/v1/match/match-issue?keywords=machine-learning&keywords=java&max_results=5"
          break
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

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      })

      // Clear the timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`)
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
  }, [type])

  // Effect to fetch issues when the component mounts or type changes
  useEffect(() => {
    fetchIssues()

    // Cleanup function to clear the timeout when the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [fetchIssues]) // fetchIssues already depends on type

  // Transform API issues to the format expected by IssueCard
  const transformedIssues = issues.map((issue, index) => ({
    id: issue.issue_id,
    title: issue.title,
    repo: issue.repo_url.replace("https://github.com/", ""),
    description: issue.short_description,
    skillMatch: Math.min(Math.round(issue.similarity_score * 100 + 30), 99), // Cap at 99%
    skills: issue.labels?.slice(0, 5) || ["No labels"],
    matchColor: MATCH_COLORS[index % MATCH_COLORS.length],
    issueUrl: issue.issue_url
  }))

  return (
    <div className="grid gap-4">
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
          <button
            onClick={fetchIssues}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg text-white transition-colors shadow-sm dark:shadow-none"
          >
            Try Again
          </button>
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
  )
}