"use client"

import Link from "next/link"
import { Github, Zap, Code, BarChart2, ChevronDown, Users, GitPullRequest, GitMerge, GitBranch, Sparkles, GraduationCap, Trophy, MessageSquare, Share2, Star } from "lucide-react"
import { useEffect, useState } from "react"
import FloatingNavbar from "../components/floating-navbar"

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    // Check for authentication token or session
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/github/profile", {
          credentials: "include", // Send cookies with the request
        })

        if (response.ok) {
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        setIsLoggedIn(false)
      }
    }

    checkAuth()
  }, [])

  // Smooth scroll function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[#0d1117] overflow-hidden">
          <div className="absolute w-full h-full opacity-20">
            {/* Animated code lines */}
            <div className="absolute top-1/4 left-1/4 h-64 w-1 bg-gradient-to-b from-purple-500 to-transparent animate-pulse"></div>
            <div className="absolute top-1/3 left-1/3 h-32 w-1 bg-gradient-to-b from-cyan-500 to-transparent animate-pulse delay-300"></div>
            <div className="absolute top-1/2 left-2/3 h-48 w-1 bg-gradient-to-b from-purple-500 to-transparent animate-pulse delay-700"></div>
            <div className="absolute top-3/4 left-1/5 h-24 w-1 bg-gradient-to-b from-cyan-500 to-transparent animate-pulse delay-500"></div>
            
            {/* Glowing orbs */}
            <div className="absolute top-1/4 right-1/4 h-32 w-32 rounded-full bg-purple-600/10 animate-pulse blur-xl"></div>
            <div className="absolute bottom-1/3 left-1/3 h-40 w-40 rounded-full bg-cyan-600/10 animate-pulse delay-300 blur-xl"></div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-block mb-4 px-4 py-1 bg-purple-900/30 rounded-full border border-purple-700/30 text-purple-300 text-sm font-medium">
                Powered by AI & Vector Matching
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-500">
                  Find Your Perfect
                </span>
                <br />
                <span className="text-white">Open Source Match</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg">
                IssueMatch connects your skills with open source issues that need your expertise. Start making meaningful contributions today.
              </p>

              {isLoggedIn ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/match"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium py-4 px-8 rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105"
                  >
                    <Code className="w-5 h-5" />
                    Find Issues Now
                  </Link>
                  <Link
                    href="/mentor-hub"
                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-4 px-8 rounded-lg transition-all border border-gray-700"
                  >
                    <GraduationCap className="w-5 h-5" />
                    Connect with Mentors
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium py-4 px-8 rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105"
                  >
                    <Github className="w-5 h-5" />
                    Sign in with GitHub
                  </Link>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-4 px-8 rounded-lg transition-all border border-gray-700"
                  >
                    Learn More
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#0d1117] overflow-hidden">
                      <div className={`w-full h-full bg-gradient-to-br ${i % 2 === 0 ? 'from-purple-500 to-cyan-500' : 'from-cyan-500 to-purple-500'}`}></div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-white font-bold">3,500+</span> developers already matched
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 mt-10 md:mt-0 relative">
              <div className="relative bg-gray-900/50 border border-gray-800 rounded-xl p-1 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-xs text-gray-400">issue-match-finder.js</div>
                  </div>
                  
                  <div className="space-y-2 font-mono text-sm">
                    <div className="text-gray-400"><span className="text-cyan-400">const</span> <span className="text-purple-400">developer</span> = <span className="text-orange-400">await</span> <span className="text-cyan-400">github</span>.<span className="text-green-400">getProfile</span>();</div>
                    <div className="text-gray-400"><span className="text-cyan-400">const</span> <span className="text-purple-400">skills</span> = <span className="text-orange-400">await</span> <span className="text-cyan-400">analyzer</span>.<span className="text-green-400">extractSkills</span>(developer);</div>
                    <div className="text-gray-400"><span className="text-cyan-400">const</span> <span className="text-purple-400">matches</span> = <span className="text-orange-400">await</span> <span className="text-cyan-400">issueMatch</span>.<span className="text-green-400">findBestMatches</span>(skills);</div>
                    <div className="text-gray-400 pl-4">// Finding perfect matches...</div>
                    <div className="text-gray-400 pl-4 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-cyan-500 animate-spin"></div>
                      <span className="text-cyan-400">Processing</span> <span className="text-white">98%</span>
                    </div>
                    <div className="text-gray-400"><span className="text-green-400">console</span>.<span className="text-cyan-400">log</span>(<span className="text-orange-400">"Found 23 perfect matches!"</span>);</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-600/30 rounded-full blur-xl"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-cyan-600/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
        
        {/* Scroll down arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce">
          <div 
            onClick={() => scrollToSection('how-it-works')} 
            className="w-12 h-12 rounded-full border-2 border-purple-500 flex items-center justify-center group hover:bg-purple-500/10 transition-all"
          >
            <ChevronDown className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-[#0a101c] to-[#0d1117]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block mb-3 px-4 py-1 bg-cyan-900/30 rounded-full border border-cyan-700/30 text-cyan-300 text-sm font-medium">
              Simple Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              How the <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">AI Matchmaker</span> Works
            </h2>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/50 via-cyan-500/50 to-purple-500/50 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 transition-all hover:shadow-lg hover:shadow-purple-500/10 group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:rotate-6 transition-transform">
                  <Github className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4 text-white">Connect GitHub</h3>
                <p className="text-gray-400 text-center">
                  Sign in with GitHub to analyze your repositories, contributions, and coding patterns using our secure AI system.
                </p>
                <div className="mt-6 flex justify-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 border border-gray-700 text-white font-semibold">1</span>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 transition-all hover:shadow-lg hover:shadow-cyan-500/10 group">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:rotate-6 transition-transform">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4 text-white">AI Analysis</h3>
                <p className="text-gray-400 text-center">
                  Our advanced AI analyzes your skills and creates a developer profile using vector embeddings to find perfect matches.
                </p>
                <div className="mt-6 flex justify-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 border border-gray-700 text-white font-semibold">2</span>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 transition-all hover:shadow-lg hover:shadow-green-500/10 group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:rotate-6 transition-transform">
                  <Code className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4 text-white">Start Contributing</h3>
                <p className="text-gray-400 text-center">
                  Get personalized issue recommendations that match your expertise, with mentorship options to help you succeed.
                </p>
                <div className="mt-6 flex justify-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 border border-gray-700 text-white font-semibold">3</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link
              href="/match"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              See how it works in action
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-[#0d1117] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-cyan-900/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block mb-3 px-4 py-1 bg-purple-900/30 rounded-full border border-purple-700/30 text-purple-300 text-sm font-medium">
              Our Impact
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
              Growing Community of Contributors
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center transition-all hover:border-purple-700/50">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-900/30 mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">3,560+</div>
              <div className="text-gray-400">Developers</div>
            </div>
            
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center transition-all hover:border-cyan-700/50">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-cyan-900/30 mb-4">
                <GitPullRequest className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">23,504+</div>
              <div className="text-gray-400">Issues Matched</div>
            </div>
            
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center transition-all hover:border-green-700/50">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-900/30 mb-4">
                <GitMerge className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">7,637+</div>
              <div className="text-gray-400">Contributions Made</div>
            </div>
            
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center transition-all hover:border-orange-700/50">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-900/30 mb-4">
                <GitBranch className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">994+</div>
              <div className="text-gray-400">Repositories</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-[#0d1117] to-[#0a101c]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block mb-3 px-4 py-1 bg-green-900/30 rounded-full border border-green-700/30 text-green-300 text-sm font-medium">
              Key Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-400 text-center max-w-2xl">
              IssueMatch provides all the tools you need to find the perfect open source issues and make meaningful contributions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-purple-500/5 group">
              <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center mb-4 group-hover:bg-purple-900/50 transition-colors">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Matching</h3>
              <p className="text-gray-400">
                Our advanced AI analyzes your GitHub profile and coding patterns to find issues that perfectly match your skills and interests.
              </p>
            </div>
            
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-cyan-500/5 group">
              <div className="w-12 h-12 rounded-lg bg-cyan-900/30 flex items-center justify-center mb-4 group-hover:bg-cyan-900/50 transition-colors">
                <GraduationCap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mentor Connection</h3>
              <p className="text-gray-400">
                Connect with experienced mentors who can guide you through your open source journey and help you make successful contributions.
              </p>
            </div>
            
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-green-500/5 group">
              <div className="w-12 h-12 rounded-lg bg-green-900/30 flex items-center justify-center mb-4 group-hover:bg-green-900/50 transition-colors">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Gamified Leaderboard</h3>
              <p className="text-gray-400">
                Track your progress on our interactive leaderboard and earn badges as you make more contributions to open source projects.
              </p>
            </div>
            
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-orange-500/5 group">
              <div className="w-12 h-12 rounded-lg bg-orange-900/30 flex items-center justify-center mb-4 group-hover:bg-orange-900/50 transition-colors">
                <MessageSquare className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Assistant</h3>
              <p className="text-gray-400">
                Get help understanding issues and planning your contributions with our built-in AI assistant powered by Google Gemini.
              </p>
            </div>
            
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-pink-500/5 group">
              <div className="w-12 h-12 rounded-lg bg-pink-900/30 flex items-center justify-center mb-4 group-hover:bg-pink-900/50 transition-colors">
                <Share2 className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Referral Program</h3>
              <p className="text-gray-400">
                Invite friends to join IssueMatch and earn rewards as they make contributions to the open source community.
              </p>
            </div>
            
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-blue-500/5 group">
              <div className="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center mb-4 group-hover:bg-blue-900/50 transition-colors">
                <BarChart2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Skill Analytics</h3>
              <p className="text-gray-400">
                Visualize your skills and track your growth as you contribute to different projects and technologies.
              </p>
            </div>
          </div>
          
          <div className="mt-16 flex justify-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium py-4 px-8 rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <Github className="w-5 h-5" />
              Get Started with GitHub
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-[#0a101c] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/5 to-purple-900/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block mb-3 px-4 py-1 bg-blue-900/30 rounded-full border border-blue-700/30 text-blue-300 text-sm font-medium">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-400 text-center max-w-2xl">
              Hear from developers who have found their perfect open source matches and made meaningful contributions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all hover:border-purple-700/50 relative">
              <div className="absolute -top-3 -left-3 text-purple-500 text-5xl opacity-20">"</div>
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-300 mb-6">
                "IssueMatch helped me find the perfect issues to work on. The AI matching is incredibly accurate, and I've made 12 contributions to projects I care about in just two months!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500"></div>
                <div>
                  <div className="font-medium text-white">Alex Chen</div>
                  <div className="text-sm text-gray-400">Frontend Developer</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all hover:border-cyan-700/50 relative">
              <div className="absolute -top-3 -left-3 text-cyan-500 text-5xl opacity-20">"</div>
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-300 mb-6">
                "The mentor connection feature is a game-changer. I was paired with an experienced developer who guided me through my first open source contribution. Now I'm a regular contributor!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500"></div>
                <div>
                  <div className="font-medium text-white">Priya Sharma</div>
                  <div className="text-sm text-gray-400">Backend Developer</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all hover:border-green-700/50 relative">
              <div className="absolute -top-3 -left-3 text-green-500 text-5xl opacity-20">"</div>
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-300 mb-6">
                "As a project maintainer, IssueMatch has brought quality contributors to our repository. The skill matching ensures we get developers who can actually solve our issues."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-cyan-500"></div>
                <div>
                  <div className="font-medium text-white">Marcus Johnson</div>
                  <div className="text-sm text-gray-400">Open Source Maintainer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/*/!* CTA Section *!/*/}
      {/*<section className="py-24 bg-gradient-to-b from-[#0a101c] to-[#0d1117] relative overflow-hidden">*/}
      {/*  <div className="absolute inset-0">*/}
      {/*    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl"></div>*/}
      {/*    <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-cyan-600/10 blur-3xl"></div>*/}
      {/*  </div>*/}
      {/*  */}
      {/*  <div className="container mx-auto px-4 relative z-10">*/}
      {/*    <div className="flex justify-center">*/}
      {/*      <Link*/}
      {/*        href="/login"*/}
      {/*        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium py-4 px-8 rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105"*/}
      {/*      >*/}
      {/*        <Github className="w-5 h-5" />*/}
      {/*        Sign in with GitHub*/}
      {/*      </Link>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}
    </main>
  )
}