"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

export default function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Issues", href: "/match" },
    { name: "Explore", href: "/search" },
    { name: "Mentors", href: "/mentor-hub" },
    { name: "About", href: "/about" },
  ]

  const handleLogin = () => {
    window.location.href = "http://localhost:8000/api/v1/auth/login"
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pt-4">
      {/* Desktop Header */}
      <header
        className={`mx-auto hidden w-full flex-row items-center justify-between rounded-full bg-white/80 dark:bg-[#1a1a1a]/90 md:flex backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg transition-all duration-300 ${
          isScrolled ? "max-w-4xl px-2" : "max-w-5xl px-4"
        } py-2.5`}
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          perspective: "1000px",
        }}
      >
        <Link
          className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 relative ${
            isScrolled ? "ml-4" : "ml-8"
          }`}
          href="/"
        >
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951] bg-clip-text text-transparent">IssueMatch</span>
        </Link>

        <div className="flex-1 flex flex-row items-center justify-center space-x-2 text-[15px] font-medium text-muted-foreground transition duration-200 hover:text-foreground md:flex md:space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10"
            >
              <span className="relative z-20">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 mr-4 relative z-50">
          <ThemeToggle />
          <button
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-accent hover:text-foreground transition-colors shadow-sm dark:shadow-none border border-gray-200 dark:border-border flex items-center justify-center relative"
            title="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
          </button>

          {isAuthenticated ? (
            <>
              <Link href="/profile" className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full border border-border/50 cursor-pointer hover:opacity-80 transition-opacity"
                  alt={user?.login}
                  src={user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                />
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "http://localhost:8000/api/v1/auth/logout";
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors cursor-pointer"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-[#e88951] to-[#d67840] text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-5 py-2 text-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <header className="mx-4 flex w-auto flex-row items-center justify-between rounded-full bg-white/80 dark:bg-[#1a1a1a]/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg md:hidden px-4 py-4 relative z-[10000]">
        <Link className="flex items-center justify-center gap-2" href="/">
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951] bg-clip-text text-transparent">IssueMatch</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-accent hover:text-foreground transition-colors shadow-sm dark:shadow-none border border-gray-200 dark:border-border flex items-center justify-center relative"
            title="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
          </button>
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 border border-border/50 transition-colors hover:bg-background/80"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
              <span
                className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${
                  isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              ></span>
              <span
                className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-24 left-4 right-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-border/50 pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 mb-4">
                      <img
                        className="h-12 w-12 rounded-full border-2 border-border/50"
                        alt={user?.login}
                        src={user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{user?.name || user?.login}</p>
                        <p className="text-sm text-muted-foreground">{user?.email || `@${user?.login}`}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-background/50 hover:bg-background/80 rounded-lg border border-border/50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span className="text-sm font-medium">Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-background/50 hover:bg-background/80 rounded-lg border border-border/50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="text-sm font-medium">Profile</span>
                      </Link>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = "http://localhost:8000/api/v1/auth/logout";
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-red-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-500/10 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="w-full px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-[#e88951] to-[#d67840] text-white rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
