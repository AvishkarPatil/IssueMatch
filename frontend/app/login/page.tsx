"use client"

import { Github, X, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuth()

  useEffect(() => {
    let mounted = true;
    
    const checkAuthStatus = async () => {
      if (!mounted) return;
      
      const isAuth = await checkAuth();
      if (isAuth && user && mounted) {
        if (user.test_taken) {
          router.push('/match');
        } else {
          router.push('/skills');
        }
      }
    };
    
    checkAuthStatus();

    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const refParam = urlParams.get('ref');
    
    if (refParam) {
      sessionStorage.setItem('referralCode', refParam);
    }
    
    if (errorParam) {
      setError(
        errorParam === 'auth_failed'
          ? "GitHub authentication failed. Please try again."
          : "An error occurred during login. Please try again."
      );
    }
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleGitHubLogin = () => {
    setIsLoading(true)
    setError("")
    window.location.href = "http://localhost:8000/api/v1/auth/login"
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-[#0d1117] dark:to-black relative overflow-hidden">
      {/* Radial glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#e88951]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#e88951]/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[32px] p-8 shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e88951] to-[#d67840] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">IssueMatch</h2>
                <p className="text-xs text-gray-600 dark:text-white/60">AI-Powered Matching</p>
              </div>
            </div>
            <Link href="/">
              <button className="w-10 h-10 bg-gray-200 dark:bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-300 dark:border-white/10 hover:bg-gray-300 dark:hover:bg-black/40 transition-all duration-200 hover:scale-110 hover:rotate-90">
                <X className="w-5 h-5 text-gray-700 dark:text-white/80" />
              </button>
            </Link>
          </div>

          <h1 className="text-3xl font-normal text-gray-900 dark:text-white mb-3">Welcome back</h1>
          <p className="text-gray-600 dark:text-white/60 mb-8">Sign in to continue your open source journey</p>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 backdrop-blur-sm border border-red-200 dark:border-red-500/20 rounded-2xl p-4 mb-6">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* GitHub Login Button */}
          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#e88951] to-[#d67840] hover:from-[#d67840] hover:to-[#c56730] text-white font-medium rounded-2xl h-14 flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Github className="w-5 h-5" />
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting to GitHub...
              </div>
            ) : (
              "Sign in with GitHub"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gray-300 dark:bg-white/10"></div>
            <span className="px-4 text-gray-500 dark:text-white/40 text-sm font-medium">SECURE AUTHENTICATION</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-white/10"></div>
          </div>

          {/* Terms */}
          <p className="text-center text-gray-500 dark:text-white/40 text-sm mt-8">
            By signing in, you agree to our{" "}
            <Link href="#" className="text-[#e88951] hover:text-[#d67840] transition-colors">
              Terms of Service
            </Link>
          </p>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
            <p className="text-gray-500 dark:text-white/40 text-xs">
              Don't have a GitHub account?{" "}
              <a
                href="https://github.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e88951] hover:text-[#d67840] transition-colors"
              >
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}