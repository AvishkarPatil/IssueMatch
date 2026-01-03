'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Search, Bell, Trophy, Users, GraduationCap, Info, Github, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { ThemeToggle } from '@/components/theme-toggle'

const FloatingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Issues', href: '/match', icon: Search },
    { name: 'Explore', href: '/search', icon: Search },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Mentors', href: '/mentor-hub', icon: GraduationCap },
    { name: 'About', href: '/about', icon: Info },
  ]

  // Check if a link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogin = () => {
    // Redirect to the backend login endpoint to start the GitHub OAuth flow
    window.location.href = "http://localhost:8000/api/v1/auth/login";
  };

  const handleLogout = () => {
    // Redirect to the backend logout endpoint
    window.location.href = "http://localhost:8000/api/v1/auth/logout";
  };

  return (
    <>
      {/* Floating Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-4 w-full flex justify-center z-50 transition-all duration-500 ${
          scrolled ? 'scale-95' : 'scale-100'
        }`}
      >
        <div className="bg-white/90 dark:bg-background/80 backdrop-blur-md rounded-full px-6 py-3 shadow-lg dark:shadow-2xl border border-gray-200 dark:border-border">
          <div className="flex items-center space-x-1">
            {/* Logo */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mr-6 cursor-pointer"
              >
                IssueMatch
              </motion.div>
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <motion.div key={item.name} className="relative">
                    <Link href={item.href}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 ${
                          active 
                            ? 'text-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </motion.div>
                    </Link>
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-purple-600/50 dark:to-cyan-600/50 rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Theme Toggle */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden md:flex"
            >
              <ThemeToggle />
            </motion.div>

            {/* Notification Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden md:flex text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-gray-100 dark:hover:bg-accent transition-colors shadow-sm dark:shadow-none"
            >
              <Bell size={16} />
            </motion.button>

            {/* User Profile or Login Button */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center ml-2">
                <Link href="/profile">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {user?.avatar_url ? (
                      <img
                        className="h-8 w-8 rounded-full border border-purple-500/30 shadow-sm dark:shadow-none"
                        src={user.avatar_url}
                        alt={`${user.login}'s avatar`}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-sm dark:shadow-none">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                </Link>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="hidden md:flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-purple-600 dark:to-cyan-600 text-white font-medium py-2 px-4 rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-purple-500/20 ml-2 shadow-sm dark:shadow-none"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">Sign In</span>
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-accent transition-colors ml-2 text-muted-foreground hover:text-foreground shadow-sm dark:shadow-none"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={18} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 w-full flex justify-center z-40 md:hidden"
          >
            <div className="bg-white/95 dark:bg-background/80 backdrop-blur-md rounded-2xl p-4 shadow-xl dark:shadow-2xl border border-gray-200 dark:border-border min-w-[200px]">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${active ? 'bg-blue-50 dark:bg-gradient-to-r dark:from-purple-600/30 dark:to-cyan-600/30' : 'hover:bg-gray-50 dark:hover:bg-accent/50'} transition-all duration-200`}
                    >
                      <Icon size={18} className={active ? "text-blue-600 dark:text-foreground" : "text-cyan-400"} />
                      <span className="font-medium text-foreground">{item.name}</span>
                    </motion.div>
                  </Link>
                )
              })}
              
              {isAuthenticated ? (
                <>
                  <Link href="/profile">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navItems.length * 0.1 }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-accent/50 transition-all duration-200 mt-2"
                    >
                      <User size={18} className="text-purple-400" />
                      <span className="font-medium text-foreground">Profile</span>
                    </motion.div>
                  </Link>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.1 }}
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-accent/50 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="font-medium text-foreground">Sign Out</span>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  onClick={handleLogin}
                  className="w-full flex items-center space-x-3 px-4 py-3 mt-2 rounded-xl bg-blue-600/90 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-purple-600/80 dark:to-cyan-600/80 transition-all duration-200 shadow-sm dark:shadow-none"
                >
                  <Github size={18} className="text-white" />
                  <span className="font-medium text-white">Sign In with GitHub</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingNavbar