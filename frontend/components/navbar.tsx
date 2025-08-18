"use client"

import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Github, Menu, X, Search, Bell, LogOut, Home, User, Settings, Trophy, Users } from "lucide-react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

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
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-foreground font-bold text-xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">IssueMatch</span>
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  isActive('/') 
                    ? "border-purple-500 text-foreground" 
                    : "border-transparent text-muted-foreground hover:border-purple-400 hover:text-foreground"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                <Home className="mr-1 h-4 w-4" />
                Home
              </Link>
              <Link
                href="/match"
                className={`${
                  isActive('/match') 
                    ? "border-purple-500 text-foreground" 
                    : "border-transparent text-muted-foreground hover:border-purple-400 hover:text-foreground"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                Issues
              </Link>

              <Link
                href="/search"
                className={`${
                  isActive('/search') 
                    ? "border-purple-500 text-foreground" 
                    : "border-transparent text-muted-foreground hover:border-purple-400 hover:text-foreground"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                Explore
              </Link>
              <Link
                href="/leaderboard"
                className={`${
                  isActive('/leaderboard') 
                    ? "border-purple-500 text-foreground" 
                    : "border-transparent text-muted-foreground hover:border-purple-400 hover:text-foreground"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                Leaderboard
              </Link>
              <Link
                href="/mentor-hub"
                className={`${
                  isActive('/mentor-hub') 
                    ? "border-purple-500 text-foreground" 
                    : "border-transparent text-muted-foreground hover:border-purple-400 hover:text-foreground"
                } inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-base font-semibold transition-colors duration-200`}
              >
                Mentors
              </Link>
              <Link
                href="/about"
                className={`${
                  isActive('/about') 
                    ? "border-purple-500 text-foreground" 
                    : "border-transparent text-muted-foreground hover:border-purple-400 hover:text-foreground"
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
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search issues"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-background text-sm text-foreground rounded-full pl-10 pr-4 py-1.5 border border-gray-300 dark:border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-purple-500 dark:focus:border-purple-500 w-48 shadow-sm dark:shadow-none transition-all duration-200"
              />
            </form>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Icon */}
            <button className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent transition-colors shadow-sm dark:shadow-none">
              <Bell className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Profile Link */}
                <Link href="/profile" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                  {user?.avatar_url && (
                    <img
                      className="h-8 w-8 rounded-full border border-purple-500/30 shadow-sm dark:shadow-none"
                      src={user.avatar_url}
                      alt={`${user.login}'s avatar`}
                    />
                  )}
                  <span className="text-sm font-medium">{user?.login}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent transition-colors shadow-sm dark:shadow-none"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="text-foreground hover:text-primary-foreground flex items-center text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 px-3 py-1.5 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md dark:shadow-none"
              >
                <Github className="mr-1.5 h-4 w-4" />
                Sign in
              </button>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-purple-500 transition-colors shadow-sm dark:shadow-none"
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
        <div className="sm:hidden bg-white dark:bg-background border-t border-gray-200 dark:border-border shadow-lg dark:shadow-none">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`${
                isActive('/') 
                  ? "bg-blue-50 dark:bg-accent text-blue-700 dark:text-foreground" 
                  : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent/50 hover:text-foreground"
              } flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors`}
            >
              <Home className="mr-2 h-5 w-5" />
              Home
            </Link>
            <Link
              href="/match"
              className={`${
                isActive('/match') 
                  ? "bg-blue-50 dark:bg-accent text-blue-700 dark:text-foreground" 
                  : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent/50 hover:text-foreground"
              } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
            >
              Issues
            </Link>

            <Link
              href="/search"
              className={`${
                isActive('/search') 
                  ? "bg-blue-50 dark:bg-accent text-blue-700 dark:text-foreground" 
                  : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent/50 hover:text-foreground"
              } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
            >
              Explore
            </Link>
            <Link
              href="/leaderboard"
              className={`${
                isActive('/leaderboard') 
                  ? "bg-blue-50 dark:bg-accent text-blue-700 dark:text-foreground" 
                  : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent/50 hover:text-foreground"
              } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
            >
              Leaderboard
            </Link>
            <Link
              href="/mentor-hub"
              className={`${
                isActive('/mentor-hub') 
                  ? "bg-blue-50 dark:bg-accent text-blue-700 dark:text-foreground" 
                  : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent/50 hover:text-foreground"
              } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
            >
              Mentors
            </Link>
            <Link
              href="/about"
              className={`${
                isActive('/about') 
                  ? "bg-blue-50 dark:bg-accent text-blue-700 dark:text-foreground" 
                  : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent/50 hover:text-foreground"
              } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
            >
              About
            </Link>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search issues"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white dark:bg-background text-sm text-foreground rounded-md pl-10 pr-4 py-2 border border-gray-300 dark:border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-purple-500 dark:focus:border-purple-500 w-full shadow-sm dark:shadow-none transition-all duration-200"
                />
              </div>
            </form>
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-border">
            {isAuthenticated ? (
              <div className="flex items-center px-5">
                {user?.avatar_url && (
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full border border-purple-500/30 shadow-sm dark:shadow-none"
                      src={user.avatar_url}
                      alt={`${user.login}'s avatar`}
                    />
                  </div>
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-foreground">{user?.name || user?.login}</div>
                  <div className="text-sm font-medium text-muted-foreground">{user?.login}</div>
                </div>
                <button className="ml-auto text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent transition-colors shadow-sm dark:shadow-none">
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            ) : null}
                        <div className="mt-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-accent/50 flex items-center transition-colors"
                  >
                    <User className="mr-2 h-5 w-5" />
                    Your Profile
                  </Link>
                  <Link
                    href="/referral"
                    className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-accent/50 flex items-center transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    Referrals
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-accent/50 flex items-center transition-colors"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary-foreground bg-blue-600/80 hover:bg-blue-700 dark:bg-purple-600/80 dark:hover:bg-purple-700 transition-colors shadow-sm dark:shadow-none"
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