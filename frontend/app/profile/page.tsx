"use client"

import {useState, useEffect, JSX} from "react"
import Link from "next/link"
import Image from "next/image";
import { useRouter } from "next/navigation"
import { GitHubActivityGraph } from "@/components/github-activity-graph"
import {
  User,
  FileText,
  Code,
  Github,
  Star,
  GitPullRequest,
  GitMerge,
  Award,
  Calendar,
  Edit,
  BarChart2,
  ExternalLink,
  Settings,
  LogOut,
} from "lucide-react"

interface GitHubProfile {
  login: string
  id: number
  avatar_url: string
  name: string
  company: string | null // Allow null
  blog: string | null // Allow null
  location: string | null // Allow null
  email: string | null
  bio: string | null // Allow null
  twitter_username: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  html_url: string
}

interface Skill {
  name: string;
  level: number;
}

interface Stats {
  contributions: number;
  pullRequests: number;
  issuesClosed: number;
  stars: number;
}

interface Achievement {
  name: string;
  icon: string;
  date: string;
}

// Profile Page Component
export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [profile, setProfile] = useState<GitHubProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const mockData: { skills: Skill[]; stats: Stats; achievements: Achievement[]; resumeUploaded: boolean } = {
    skills: [
      { name: "JavaScript", level: 5 },
      { name: "React", level: 4.2 },
      { name: "TypeScript", level: 1 },
      { name: "Node.js", level: 2 },
      { name: "CSS/Tailwind", level: 3 },
    ],
    stats: {
      contributions: 149,
      pullRequests: 86,
      issuesClosed: 53,
      stars: 128,
    },
    achievements: [
      { name: "First Contribution", icon: "GitMerge", date: "Feb 2022" },
      { name: "Pull Request Pro", icon: "GitPullRequest", date: "May 2022" },
      { name: "Bug Hunter", icon: "Code", date: "Aug 2022" },
      { name: "Popular Project", icon: "Star", date: "Nov 2022" },
      { name: "Consistent Contributor", icon: "Calendar", date: "Jan 2023" },
    ],
    resumeUploaded: false, // Example state
  }

  // Effect hook to fetch profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true); // Start loading
      setError(""); // Clear previous errors
      try {
        // Fetch profile data from the backend API endpoint
        // Assumes backend handles authentication (e.g., via cookies)
        const response = await fetch("http://localhost:8000/api/v1/github/profile", {
          credentials: "include", // Send cookies along with the request
        })

        if (!response.ok) {
          if (response.status === 401) {
            // If unauthorized, redirect to the login page
            console.log("Unauthorized, redirecting to login...");
            router.push("/login") // Adjust login path if needed
            return // Stop further execution
          }
          // Throw error for other non-ok responses
          throw new Error(`Failed to fetch profile: ${response.statusText} (Status: ${response.status})`)
        }

        const data: GitHubProfile = await response.json()
        setProfile(data) // Store fetched profile data in state
      } catch (err: any) {
        // Handle errors during fetch
        setError(err.message || "Failed to load profile data")
        console.error("Fetch profile error:", err)
        setProfile(null); // Clear profile on error
      } finally {
        setLoading(false) // Stop loading regardless of success or error
      }
    }

    fetchProfile()
  }, [router]) // Dependency array includes router for the push navigation

  // Helper function to get skill level label
  const getSkillLevelLabel = (level: number): string => {
    switch (level) {
      case 1: return "Beginner"
      case 2: return "Elementary"
      case 3: return "Intermediate"
      case 4: return "Advanced"
      case 5: return "Expert"
      default: return "Intermediate"
    }
  }

  // Helper function to render the correct Lucide icon based on name
  const getAchievementIcon = (iconName: string): JSX.Element => {
    switch (iconName) {
      case "GitMerge": return <GitMerge className="h-5 w-5" />
      case "GitPullRequest": return <GitPullRequest className="h-5 w-5" />
      case "Code": return <Code className="h-5 w-5" />
      case "Star": return <Star className="h-5 w-5" />
      case "Calendar": return <Calendar className="h-5 w-5" />
      default: return <Award className="h-5 w-5" />
    }
  }

  // Helper function to format date strings (e.g., "created_at")
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return "Invalid Date";
    }
  }

    // Helper function to format joined date
    const getJoinedDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        } catch (e) {
            return "Invalid Date";
        }
    }


  // Function to handle logout action
  const handleLogout = () => {
    // Redirects to the backend logout endpoint
    // Backend should handle clearing session/cookie and potentially redirecting back
    window.location.href = "http://localhost:8000/api/v1/auth/logout" // Adjust if your logout URL is different
  }

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center">
        {/* Basic loading indicator */}
        <div className="text-black dark:text-white animate-pulse">Loading profile...</div>
      </div>
    )
  }

  // --- Render Error State ---
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center text-center">
        <div>
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error || "Failed to load profile data."}</p>
          <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline">
            Return to Login
          </Link>
        </div>
      </div>
    )
  }

  // --- Render Profile Page ---
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-black dark:text-gray-300">
      {/* Main container */}
      <div className="container mx-auto px-4 py-8">
        {/* Grid layout for sidebar and main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 dark:bg-[#1a1f2a] rounded-xl p-6 shadow-lg sticky top-8"> {/* Added sticky top */}
              {/* Profile Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full bg-purple-200 dark:bg-purple-600/20 mb-4 overflow-hidden border-2 border-purple-500"> {/* Added border */}
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || profile.login} // Use login as fallback alt text
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = 'placeholder.png')} // Basic image error handling
                  />
                </div>
                <h1 className="text-xl font-bold text-black dark:text-white">{profile.name || profile.login}</h1> {/* Fallback to login name */}
                <p className="text-gray-700 dark:text-gray-400">@{profile.login}</p>
              </div>

              {/* Bio and Links */}
              <div className="mb-6">
                <p className="text-gray-800 dark:text-gray-300 mb-4 text-sm">{profile.bio || "No bio provided."}</p> {/* Handle null bio */}

                <div className="space-y-2 text-sm">
                  {/* Location */}
                  {profile.location && (
                    <div className="flex items-center text-gray-700 dark:text-gray-400">
                      <User className="h-4 w-4 mr-2 flex-shrink-0" /> {/* Added flex-shrink-0 */}
                      <span>{profile.location}</span> {/* Wrapped text in span */}
                    </div>
                  )}
                  {/* Blog/Website Link */}
                  {profile.blog && (
                    <div className="flex items-center text-gray-700 dark:text-gray-400">
                      <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                      <a
                        href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:underline truncate" // Added truncate
                      >
                        {profile.blog.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  {/* GitHub Profile Link */}
                  <div className="flex items-center text-gray-700 dark:text-gray-400">
                    <Github className="h-4 w-4 mr-2 flex-shrink-0" />
                    <a
                      href={profile.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:underline truncate"
                    >
                      {profile.html_url.replace("https://github.com/", "")}
                    </a>
                  </div>
                  {/* Joined Date */}
                  <div className="flex items-center text-gray-700 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Joined {getJoinedDate(profile.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4"> {/* Added items-center */}
                  <h3 className="text-black dark:text-white font-medium">Skills (Mock)</h3>
                  {/* Link to edit/upload resume */}
                  <Link
                    href="/resume" // Adjust link as needed
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-sm flex items-center"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Link>
                </div>

                {/* Skills List */}
                <div className="space-y-3">
                  {mockData.skills.map((skill) => (
                    <div key={skill.name} className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-black dark:text-white text-sm">{skill.name}</div>
                        <span className="text-xs text-purple-600 dark:text-purple-400">{getSkillLevelLabel(skill.level)}</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-400 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-purple-600 h-1.5 rounded-full"
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Resume Button (Conditional) */}
                {/*{!mockData.resumeUploaded && (*/}
                {/*  <div className="mt-4">*/}
                {/*    <Link*/}
                {/*      href="/profile/resume" // Adjust link as needed*/}
                {/*      className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center text-sm" // Added text-sm*/}
                {/*    >*/}
                {/*      <FileText className="h-4 w-4 mr-2" />*/}
                {/*      Upload Resume*/}
                {/*    </Link>*/}
                {/*  </div>*/}
                {/*)}*/}

                {/* Settings, Referrals and Logout buttons */}
                <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700 space-y-2"> {/* Added border */}
                  <Link
                    href="/referral"
                    className="w-full py-2 px-4 bg-gray-200 dark:bg-[#242a38] hover:bg-gray-300 dark:hover:bg-[#2d3548] rounded-lg text-black dark:text-gray-300 font-medium transition-colors flex items-center justify-center text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    Referral Program
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2 px-4 bg-red-200 dark:bg-red-900/30 hover:bg-red-300 dark:hover:bg-red-900/50 border border-red-800 rounded-lg text-red-700 dark:text-red-300 font-medium transition-colors flex items-center justify-center text-sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div> {/* End Skills Section */}
            </div> {/* End Sidebar inner bg div */}
          </div> {/* End Sidebar Section */}

          {/* Main Content Section */}
          <div className="lg:col-span-3">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {/* Contributions Stat */}
              <div className="bg-gray-100 dark:bg-[#1a1f2a] rounded-xl p-4 text-center shadow-md"> {/* Added shadow */}
                <div className="text-2xl font-bold text-black dark:text-white">{mockData.stats.contributions}</div>
                <div className="text-sm text-gray-700 dark:text-gray-400 mt-1">Contributions</div> {/* Added mt-1 */}
              </div>
              {/* Repositories Stat */}
              <div className="bg-gray-100 dark:bg-[#1a1f2a] rounded-xl p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-black dark:text-white">{profile.public_repos}</div>
                <div className="text-sm text-gray-700 dark:text-gray-400 mt-1">Repositories</div>
              </div>
              {/* Pull Requests Stat */}
              <div className="bg-gray-100 dark:bg-[#1a1f2a] rounded-xl p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-black dark:text-white">{mockData.stats.pullRequests}</div>
                <div className="text-sm text-gray-700 dark:text-gray-400 mt-1">Pull Requests</div>
              </div>
              {/* Issues Closed Stat */}
              <div className="bg-gray-100 dark:bg-[#1a1f2a] rounded-xl p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-black dark:text-white">{mockData.stats.issuesClosed}</div>
                <div className="text-sm text-gray-700 dark:text-gray-400 mt-1">Issues Closed</div>
              </div>
              {/* Followers Stat */}
              <div className="bg-gray-100 dark:bg-[#1a1f2a] rounded-xl p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-black dark:text-white">{profile.followers}</div>
                <div className="text-sm text-gray-700 dark:text-gray-400 mt-1">Followers</div>
              </div>
            </div> {/* End Stats Cards Grid */}

            {/* Tabs Container */}
            <div className="bg-gray-100 dark:bg-[#1a1f2a] rounded-xl shadow-lg overflow-hidden">
              {/* Tab Headers */}
              <div className="border-b border-gray-300 dark:border-gray-800">
                <div className="flex space-x-1"> {/* Added space-x-1 */}
                  {/* Overview Tab Button */}
                  <button
                    className={`px-4 sm:px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === "overview"
                        ? "text-black dark:text-white border-b-2 border-purple-500"
                        : "text-gray-700 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    Overview
                  </button>
                  {/* Contributions Tab Button */}
                  <button
                    className={`px-4 sm:px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === "contributions"
                        ? "text-black dark:text-white border-b-2 border-purple-500"
                        : "text-gray-700 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("contributions")}
                  >
                    Contributions
                  </button>
                  {/* Analytics Tab Button */}
                  <button
                    className={`px-4 sm:px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === "analytics"
                        ? "text-black dark:text-white border-b-2 border-purple-500"
                        : "text-gray-700 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("analytics")}
                  >
                    Analytics
                  </button>
                </div>
              </div> {/* End Tab Headers */}

              {/* Tab Content Area */}
              <div className="p-6">
                {/* Overview Tab Content */}
                {activeTab === "overview" && (
                  <div>
                    <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Achievements (Mock)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Map through mock achievements */}
                      {mockData.achievements.map((achievement, index) => (
                        <div key={index} className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-4 flex items-center shadow-sm"> {/* Added shadow */}
                          <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-600/20 flex items-center justify-center mr-3 flex-shrink-0">
                            {getAchievementIcon(achievement.icon)}
                          </div>
                          <div>
                            <div className="font-medium text-black dark:text-white text-sm">{achievement.name}</div>
                            <div className="text-xs text-gray-700 dark:text-gray-400">{achievement.date}</div> {/* Changed to xs */}
                          </div>
                        </div>
                      ))}
                    </div>

                    <h2 className="text-xl font-semibold text-black dark:text-white mt-8 mb-4">Recommended Issues (Mock)</h2>
                    {/* Placeholder for recommended issues - replace with actual data later */}
                    <div className="space-y-4">
                      {/* Example Recommended Issue 1 */}
                      <div className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-4 hover:bg-gray-300 dark:hover:bg-[#2d3548] transition-colors cursor-pointer shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-black dark:text-white text-sm leading-snug">Implement dark mode toggle for dashboard</h3> {/* Adjusted text size/leading */}
                          <div className="bg-purple-600/20 text-purple-600 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full flex-shrink-0"> {/* Adjusted padding */}
                            95% Match
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-400 mb-3">frontend-toolkit/ui-components</div> {/* Changed to xs */}
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-300 dark:bg-[#2d3548] text-gray-800 dark:text-gray-300">React</span> {/* Adjusted colors/padding */}
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-300 dark:bg-[#2d3548] text-gray-800 dark:text-gray-300">TypeScript</span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-300 dark:bg-[#2d3548] text-gray-800 dark:text-gray-300">CSS</span>
                        </div>
                      </div>
                      {/* Example Recommended Issue 2 */}
                      <div className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-4 hover:bg-gray-300 dark:hover:bg-[#2d3548] transition-colors cursor-pointer shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-black dark:text-white text-sm leading-snug">Fix accessibility issues in navigation menu</h3>
                            <div className="bg-purple-600/20 text-purple-600 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                              87% Match
                            </div>
                          </div>
                          <div className="text-xs text-gray-700 dark:text-gray-400 mb-3">a11y-tools/navigation-component</div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-300 dark:bg-[#2d3548] text-gray-800 dark:text-gray-300">JavaScript</span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-300 dark:bg-[#2d3548] text-gray-800 dark:text-gray-300">Accessibility</span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-300 dark:bg-[#2d3548] text-gray-800 dark:text-gray-300">HTML</span>
                          </div>
                      </div>
                      {/* Example Recommended Issue 3 */}
                       <div className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-4 hover:bg-gray-300 dark:hover:bg-[#2d3548] transition-colors cursor-pointer shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-black dark:text-white text-sm leading-snug">Optimize API response caching</h3>
                            <div className="bg-purple-600/20 text-purple-600 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                              82% Match
                            </div>
                          </div>
                          <div className="text-xs text-gray-700 dark:text-gray-400 mb-3">data-services/api-gateway</div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-300 dark:bg-[#2d3548] text-gray-800 dark:text-gray-300">Node.js</span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-300 dark:bg-[#2d3548] text-gray-800 dark:text-gray-300">Performance</span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-300 dark:bg-[#2d3548] text-gray-800 dark:text-gray-300">API</span>
                          </div>
                      </div>
                    </div> {/* End recommended issues space-y-4 */}
                  </div>
                )} {/* End Overview Tab Content */}

                {/* Contributions Tab Content */}
                {activeTab === "contributions" && (
                  <div>
                    <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Recent Contributions (Mock)</h2>
                    {/* Placeholder for contributions list */}
                    <div className="space-y-4">
                      {/* Example Contribution 1 */}
                      <div className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="bg-green-200 dark:bg-green-600/20 p-2 rounded-full mt-1 flex-shrink-0"> {/* Added mt-1 */}
                            <GitMerge className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-black dark:text-white text-sm">Merged Pull Request</h3>
                              <span className="text-xs text-gray-700 dark:text-gray-400">3 days ago</span>
                            </div>
                            <p className="text-gray-800 dark:text-gray-300 mt-1 text-sm">Added responsive design for mobile devices</p>
                            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">ui-framework/responsive-components</div>
                          </div>
                        </div>
                      </div>
                      {/* Example Contribution 2 */}
                      <div className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-200 dark:bg-blue-600/20 p-2 rounded-full mt-1 flex-shrink-0">
                            <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-black dark:text-white text-sm">Commit</h3>
                              <span className="text-xs text-gray-700 dark:text-gray-400">1 week ago</span>
                            </div>
                            <p className="text-gray-800 dark:text-gray-300 mt-1 text-sm">Fixed bug in authentication flow</p>
                            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">auth-service/login-module</div>
                          </div>
                        </div>
                      </div>
                      {/* Example Contribution 3 */}
                      <div className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="bg-purple-200 dark:bg-purple-600/20 p-2 rounded-full mt-1 flex-shrink-0">
                            <GitPullRequest className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-black dark:text-white text-sm">Opened Pull Request</h3>
                              <span className="text-xs text-gray-700 dark:text-gray-400">2 weeks ago</span>
                            </div>
                            <p className="text-gray-800 dark:text-gray-300 mt-1 text-sm">Implemented new feature for data visualization</p>
                            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">data-viz/chart-components</div>
                          </div>
                        </div>
                      </div>
                    </div> {/* End contributions space-y-4 */}

                    {/* Load More Button */}
                    <div className="mt-6 text-center">
                      <button className="px-4 py-2 bg-gray-100 dark:bg-[#1a1f2a] hover:bg-gray-200 dark:hover:bg-[#242a38] text-gray-800 dark:text-gray-300 rounded-lg text-sm transition-colors border border-gray-300 dark:border-gray-700"> {/* Added border */}
                        Load More
                      </button>
                    </div>
                  </div>
                )} {/* End Contributions Tab Content */}

                {/* Analytics Tab Content */}
                {activeTab === "analytics" && (
                  <div>
                    <div className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-6 mb-6 shadow-sm h-80"> {/* Added h-64 to reduce height */}
                        <GitHubActivityGraph height={170}/>
                    </div>

                    {/* Language & Time Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Top Languages Card */}
                      <div className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-black dark:text-white mb-4">Top Languages</h3>
                        <div className="space-y-4">
                          {/* Example Language 1 */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-800 dark:text-gray-300">JavaScript</span>
                              <span className="text-gray-700 dark:text-gray-400">45%</span>
                            </div>
                            <div className="w-full bg-gray-400 dark:bg-gray-700 rounded-full h-2">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                            </div>
                          </div>
                          {/* Example Language 2 */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-800 dark:text-gray-300">TypeScript</span>
                              <span className="text-gray-700 dark:text-gray-400">30%</span>
                            </div>
                            <div className="w-full bg-gray-400 dark:bg-gray-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: "30%" }}></div>
                            </div>
                          </div>
                          {/* Example Language 3 */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-800 dark:text-gray-300">CSS</span>
                              <span className="text-gray-700 dark:text-gray-400">15%</span>
                            </div>
                            <div className="w-full bg-gray-400 dark:bg-gray-700 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                            </div>
                          </div>
                           {/* Example Language 4 */}
                           <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-800 dark:text-gray-300">HTML</span>
                              <span className="text-gray-700 dark:text-gray-400">10%</span>
                            </div>
                            <div className="w-full bg-gray-400 dark:bg-gray-700 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                            </div>
                          </div>
                        </div> {/* End language space-y-4 */}
                      </div> {/* End Top Languages Card */}


                      <div className="bg-gray-200 dark:bg-[#242a38] rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-black dark:text-white mb-4">Contribution Times</h3>
                        <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-[#1a1f2a] rounded-md overflow-hidden"> {/* Added overflow-hidden */}
                          <Image
                            src="https://i.ibb.co/SwB9Bpxy/heatmap.png"
                            alt="Contribution times heatmap"
                            width={400}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div> {/* End Contribution Times Card */}
                    </div> {/* End Language & Time Grid */}
                  </div>
                )} {/* End Analytics Tab Content */}
              </div> {/* End Tab Content Area */}
            </div> {/* End Tabs Container */}
          </div> {/* End Main Content Section */}
        </div> {/* End Grid layout */}
      </div> {/* End Main container */}
    </div> /* End Outer div */
  )
} // End ProfilePage Component
