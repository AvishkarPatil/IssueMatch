"use client"

import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Github, Menu, X, Search, Bell, LogOut, Home, User, Settings, Trophy, Users } from "lucide-react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const handleLogout = () => {
    // Instead of trying to fetch directly, redirect to the backend logout endpoint
    // The backend will clear the session and redirect back to the frontend
    window.location.href = `${API_URL}/auth/logout`;
  };

  const handleLogin = () => {
    // Redirect to the backend login endpoint to start the GitHub OAuth flow
    window.location.href = `${API_URL}/auth/login`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-[#161b22] to-[#1a1a2e] border-b border-[#30363d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-white font-bold text-xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">IssueMatch</span>
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  isActive('/') 
                    ? "border-purple-500 text-white" 
                    : "border-transparent text-gray-300 hover:border-purple-400 hover:text-white"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                <Home className="mr-1 h-4 w-4" />
                Home
              </Link>
              <Link
                href="/match"
                className={`${
                  isActive('/match') 
                    ? "border-purple-500 text-white" 
                    : "border-transparent text-gray-300 hover:border-purple-400 hover:text-white"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                Issues
              </Link>

              <Link
                href="/search"
                className={`${
                  isActive('/search') 
                    ? "border-purple-500 text-white" 
                    : "border-transparent text-gray-300 hover:border-purple-400 hover:text-white"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                Explore
              </Link>
              <Link
                href="/leaderboard"
                className={`${
                  isActive('/leaderboard') 
                    ? "border-purple-500 text-white" 
                    : "border-transparent text-gray-300 hover:border-purple-400 hover:text-white"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                Leaderboard
              </Link>
              <Link
                href="/mentor-hub"
                className={`${
                  isActive('/mentor-hub') 
                    ? "border-purple-500 text-white" 
                    : "border-transparent text-gray-300 hover:border-purple-400 hover:text-white"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                Mentors
              </Link>
              <Link
                href="/about"
                className={`${
                  isActive('/about') 
                    ? "border-purple-500 text-white" 
                    : "border-transparent text-gray-300 hover:border-purple-400 hover:text-white"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                About
              </Link>
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search issues"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0d1117] text-sm text-white rounded-full pl-10 pr-4 py-1.5 border border-[#30363d] focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 w-48"
              />
            </form>

            {/* Notification Icon */}
            <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-purple-900/30">
              <Bell className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Profile Link */}
                <Link href="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white">
                  {user?.avatar_url && (
                    <img
                      className="h-8 w-8 rounded-full border border-purple-500/30"
                      src={user.avatar_url}
                      alt={`${user.login}'s avatar`}
                    />
                  )}
                  <span className="text-sm font-medium">{user?.login}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-purple-900/30"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="text-gray-300 hover:text-white flex items-center text-sm font-medium bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-md transition-colors duration-200"
              >
                <Github className="mr-1.5 h-4 w-4" />
                Sign in
              </button>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-purple-900/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`${
                isActive('/') 
                  ? "bg-purple-900/20 text-white" 
                  : "text-gray-300 hover:bg-purple-900/10 hover:text-white"
              } flex items-center px-3 py-2 rounded-md text-base font-medium`}
            >
              <Home className="mr-2 h-5 w-5" />
              Home
            </Link>
            <Link
              href="/match"
              className={`${
                isActive('/match') 
                  ? "bg-purple-900/20 text-white" 
                  : "text-gray-300 hover:bg-purple-900/10 hover:text-white"
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Issues
            </Link>

            <Link
              href="/search"
              className={`${
                isActive('/search') 
                  ? "bg-purple-900/20 text-white" 
                  : "text-gray-300 hover:bg-purple-900/10 hover:text-white"
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Explore
            </Link>
            <Link
              href="/leaderboard"
              className={`${
                isActive('/leaderboard') 
                  ? "bg-purple-900/20 text-white" 
                  : "text-gray-300 hover:bg-purple-900/10 hover:text-white"
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Leaderboard
            </Link>
            <Link
              href="/mentor-hub"
              className={`${
                isActive('/mentor-hub') 
                  ? "bg-purple-900/20 text-white" 
                  : "text-gray-300 hover:bg-purple-900/10 hover:text-white"
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Mentors
            </Link>
            <Link
              href="/about"
              className={`${
                isActive('/about') 
                  ? "bg-purple-900/20 text-white" 
                  : "text-gray-300 hover:bg-purple-900/10 hover:text-white"
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              About
            </Link>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search issues"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0d1117] text-sm text-white rounded-md pl-10 pr-4 py-2 border border-[#30363d] focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 w-full"
                />
              </div>
            </form>
          </div>

          <div className="pt-4 pb-3 border-t border-[#30363d]">
            {isAuthenticated ? (
              <div className="flex items-center px-5">
                {user?.avatar_url && (
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full border border-purple-500/30"
                      src={user.avatar_url}
                      alt={`${user.login}'s avatar`}
                    />
                  </div>
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user?.name || user?.login}</div>
                  <div className="text-sm font-medium text-gray-400">{user?.login}</div>
                </div>
                <button className="ml-auto text-gray-400 hover:text-white p-1 rounded-full hover:bg-purple-900/30">
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            ) : null}
                        <div className="mt-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-purple-900/20 flex items-center"
                  >
                    <User className="mr-2 h-5 w-5" />
                    Your Profile
                  </Link>
                  <Link
                    href="/referral"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-purple-900/20 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    Referrals
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-purple-900/20 flex items-center"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-purple-900/20"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white bg-purple-600/80 hover:bg-purple-700"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Sign in with GitHub
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}