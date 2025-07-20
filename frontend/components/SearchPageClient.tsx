"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ExternalLink, AlertCircle, Search } from "lucide-react"

interface GitHubIssue {
  id: number
  html_url: string
  title: string
  repository_url: string
  user: {
    login: string
  }
  state: string
  created_at: string
  body?: string
}

interface SearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubIssue[]
}

export default function SearchPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const [searchInput, setSearchInput] = useState(query)

  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    if (!query) return

    const fetchIssues = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/github/search/issues?query=${encodeURIComponent(query)}`,
          {
            credentials: "include",
          }
        )

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data: SearchResponse = await response.json()
        setIssues(data.items || [])
        setTotalCount(data.total_count || 0)
      } catch (err) {
        console.error("Error fetching search results:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch search results")
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
    setSearchInput(query)
  }, [query])

  const getRepoPath = (repoUrl: string) => {
    const parts = repoUrl.split("/")
    return parts.length >= 5 ? `${parts[parts.length - 2]}/${parts[parts.length - 1]}` : "Unknown repository"
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const truncateText = (text: string, maxLength: number) =>
    !text ? "" : text.length > maxLength ? text.substring(0, maxLength) + "..." : text

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search GitHub issues..."
              className="w-full h-12 py-2 pl-10 pr-4 bg-[#1a1f2a] border border-[#30363d] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {query && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Search Results</h1>
          <div className="flex items-center gap-2 text-gray-400">
            <Search className="h-4 w-4" />
            <p>{loading ? "Searching..." : `Found ${totalCount} issues matching "${query}"`}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1a1f2a] rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#1a1f2a] rounded-lg p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-gray-400">Please try a different search or check your connection.</p>
        </div>
      ) : issues.length === 0 && query ? (
        <div className="bg-[#1a1f2a] rounded-lg p-6 text-center">
          <p className="text-gray-400">No issues found matching "{query}".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="bg-[#1a1f2a] rounded-lg p-5 hover:bg-[#242a38] transition-colors border border-[#30363d]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-cyan-400 hover:text-purple-400 transition-colors"
                  >
                    {issue.title}
                  </a>
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-purple-400"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    issue.state === "open"
                      ? "bg-green-900 text-green-300"
                      : "bg-purple-900 text-purple-300"
                  }`}
                >
                  {issue.state}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-400 mb-3">
                <span className="text-gray-300 font-medium">{getRepoPath(issue.repository_url)}</span>
                <span className="mx-2">•</span>
                <span>Opened by {issue.user.login}</span>
                <span className="mx-2">•</span>
                <span>{new Date(issue.created_at).toLocaleDateString()}</span>
              </div>

              {issue.body && (
                <p className="text-gray-300 text-sm mt-2 line-clamp-2">{truncateText(issue.body, 200)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {!query && !loading && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-3 text-center">Search for GitHub Issues</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-center">
            Find open source issues to contribute to by searching for keywords, languages, or project names.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => {
                setSearchInput("label:good-first-issue state:open")
                handleSearch(new Event("submit") as any)
              }}
              className="px-4 py-2 bg-[#242a38] text-gray-300 rounded-md hover:bg-[#2d3748] text-sm border border-[#30363d]"
            >
              Good First Issues
            </button>
            <button
              onClick={() => {
                setSearchInput("label:help-wanted state:open")
                handleSearch(new Event("submit") as any)
              }}
              className="px-4 py-2 bg-[#242a38] text-gray-300 rounded-md hover:bg-[#2d3748] text-sm border border-[#30363d]"
            >
              Help Wanted
            </button>
            <button
              onClick={() => {
                setSearchInput("language:javascript state:open")
                handleSearch(new Event("submit") as any)
              }}
              className="px-4 py-2 bg-[#242a38] text-yellow-300 rounded-md hover:bg-[#2d3748] text-sm border border-[#30363d]"
            >
              JavaScript
            </button>
            <button
              onClick={() => {
                setSearchInput("language:python state:open")
                handleSearch(new Event("submit") as any)
              }}
              className="px-4 py-2 bg-[#242a38] text-blue-300 rounded-md hover:bg-[#2d3748] text-sm border border-[#30363d]"
            >
              Python
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
