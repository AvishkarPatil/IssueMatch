"use client"

import Link from "next/link"
import { Github, Zap, Code, BarChart2, ChevronDown, Users, GitPullRequest, GitMerge, GitBranch, Sparkles, GraduationCap, Trophy, MessageSquare, Share2, Star, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import FloatingNavbar from "../components/floating-navbar"
import { TestimonialsSection } from "../components/testimonials"
import { NewReleasePromo } from "../components/new-release-promo"
import AnimatedCodeDemo from "../components/animated-code-demo"

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/github/profile", {
          credentials: "include",
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <section id="hero" className="relative overflow-hidden min-h-screen flex flex-col">
        {/* Background with radial glow for both modes */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(ellipse 80% 80% at 50% 20%, rgba(232, 137, 81, 0.08), transparent 70%), #ffffff",
          }}
        />
        <div
          className="absolute inset-0 z-0 dark:block hidden"
          style={{
            background: "radial-gradient(ellipse 80% 80% at 50% 20%, rgba(226, 232, 240, 0.15), transparent 70%), #000000",
          }}
        />
        <div className="container mx-auto px-4 py-24 sm:py-32 relative z-10 flex-1 flex flex-col">
          <div className="mx-auto max-w-4xl text-center flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-secondary border border-gray-200 dark:border-border rounded-full">
                <Sparkles className="h-4 w-4 text-gray-700 dark:text-white" />
                <span className="text-gray-700 dark:text-white">Powered by AI & Vector Matching</span>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-gray-700 dark:text-[#c1c1c1]">
                Find <strong>Your Perfect</strong> <span>&</span> <br />
                <strong>Open Source</strong> <em className="italic">Match</em>
              </h1>
            </div>

            <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-600 dark:text-muted-foreground">
              IssueMatch connects your skills with open source issues that need your expertise. Start making meaningful contributions today.
            </p>

            <div className="flex flex-col items-center gap-2">
              <svg
                width="100"
                height="50"
                viewBox="0 0 100 50"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-900 dark:text-foreground mt-2"
              >
                <path d="M68.6958 5.40679C67.3329 12.7082 68.5287 20.1216 68.5197 27.4583C68.5189 29.5382 68.404 31.6054 68.1147 33.682C67.9844 34.592 69.4111 34.751 69.5414 33.8411C70.5618 26.5016 69.2488 19.104 69.4639 11.7325C69.5218 9.65887 69.7222 7.6012 70.0939 5.56265C70.1638 5.1949 69.831 4.81112 69.4601 4.76976C69.0891 4.72841 68.7689 5.01049 68.6958 5.40679Z"></path>
                <path d="M74.0117 26.1349C73.2662 27.1206 72.5493 28.1096 72.0194 29.235C71.5688 30.167 71.2007 31.137 70.7216 32.0658C70.4995 32.5033 70.252 32.9091 69.9475 33.3085C69.8142 33.4669 69.6779 33.654 69.5161 33.8093C69.4527 33.86 68.9199 34.2339 68.9167 34.2624C68.9263 34.1768 69.0752 34.3957 69.0055 34.2434C68.958 34.1515 68.8534 34.0531 68.8058 33.9612C68.6347 33.6821 68.4637 33.403 68.264 33.1208L67.1612 31.3512C66.3532 30.0477 65.5199 28.7126 64.7119 27.4093C64.5185 27.0699 63.9701 27.0666 63.7131 27.2979C63.396 27.5514 63.4053 27.9858 63.6018 28.2966C64.3845 29.5683 65.1956 30.8431 65.9783 32.1149L67.1572 33.9796C67.5025 34.5093 67.8225 35.2671 68.428 35.5368C69.6136 36.0446 70.7841 34.615 71.3424 33.7529C71.9992 32.786 72.4085 31.705 72.9035 30.6336C73.4842 29.3116 74.2774 28.1578 75.1306 26.9818C75.7047 26.2369 74.5573 25.3868 74.0117 26.1349ZM55.1301 12.2849C54.6936 18.274 54.6565 24.3076 55.0284 30.3003C55.1293 31.987 55.2555 33.7056 55.4419 35.4019C55.5431 36.3087 56.9541 36.0905 56.8529 35.1837C56.2654 29.3115 56.0868 23.3982 56.2824 17.4978C56.3528 15.8301 56.4263 14.1339 56.5537 12.4725C56.6301 11.5276 55.2034 11.3686 55.1301 12.2849Z"></path>
                <path d="M59.2642 30.6571C58.8264 31.475 58.36 32.2896 57.9222 33.1075C57.7032 33.5164 57.4843 33.9253 57.2369 34.3311C57.0528 34.6861 56.8656 35.0697 56.6278 35.3898C56.596 35.4152 56.5611 35.4691 56.5294 35.4944C56.4881 35.6054 56.5041 35.4627 56.5548 35.5261C56.7481 35.6055 56.8337 35.6151 56.7545 35.5484L56.6784 35.4533C56.6023 35.3581 56.5263 35.263 56.4534 35.1393C56.1778 34.7619 55.8734 34.3814 55.5946 34.0324C55.0146 33.2744 54.4315 32.545 53.8515 31.787C53.2685 31.0576 52.1584 31.945 52.7415 32.6744C53.4229 33.5592 54.1042 34.4441 54.7888 35.3004C55.1184 35.7127 55.4321 36.2677 55.8569 36.6039C56.3069 36.9719 56.884 36.9784 57.3533 36.6551C57.7624 36.3542 57.9845 35.9167 58.2067 35.4792C58.4636 34.9878 58.746 34.5282 59.003 34.0369C59.5423 33.0859 60.0563 32.1032 60.5957 31.1522C60.7765 30.8257 60.5104 30.3627 60.2092 30.2135C59.8161 30.112 59.4451 30.3305 59.2642 30.6571ZM44.5918 10.1569L42.2324 37.5406C42.0032 40.1151 41.8057 42.6641 41.5764 45.2386C41.5032 46.1549 42.9299 46.314 43.0032 45.3977L45.3626 18.014C45.5918 15.4396 45.7893 12.8905 46.0186 10.316C46.1235 9.37433 44.6968 9.21532 44.5918 10.1569Z"></path>
                <path d="M48.101 37.7616C46.7404 38.8232 45.8267 40.2814 44.9163 41.7109C44.0407 43.0866 43.1365 44.4592 41.738 45.3434C42.1247 45.5019 42.5146 45.6321 42.9014 45.7908C42.1324 41.8051 41.04 37.8699 39.6781 34.0203C39.545 33.6589 39.0695 33.5191 38.7365 33.6553C38.3719 33.817 38.2385 34.2353 38.3716 34.5969C39.7209 38.3007 40.7404 42.1121 41.4904 46.009C41.6012 46.5703 42.1877 46.7512 42.6539 46.4565C45.5462 44.6124 46.3877 40.9506 49.0169 38.8748C49.7178 38.2884 48.8304 37.1784 48.101 37.7616ZM25.9671 13.1014C25.7028 16.2497 26.0758 19.3824 26.5091 22.4929C26.9645 25.6636 27.4166 28.863 27.872 32.0337C28.1346 33.8253 28.3971 35.6167 28.631 37.4051C28.7607 38.3151 30.1717 38.0968 30.042 37.1868C29.5866 34.016 29.1281 30.8738 28.7012 27.7062C28.2647 24.6242 27.7396 21.5612 27.449 18.4666C27.2943 16.7449 27.2283 15.0042 27.3653 13.2572C27.4671 12.3442 26.0404 12.1851 25.9671 13.1014Z"></path>
                <path d="M30.5625 27.3357C29.9525 30.7343 29.3425 34.133 28.704 37.5284C29.1225 37.4018 29.5411 37.2751 29.9882 37.1516C28.6034 35.0617 27.2504 32.9465 25.8655 30.8565C25.6406 30.5425 25.1523 30.517 24.8669 30.7451C24.5497 30.9987 24.5305 31.4299 24.7555 31.7439C26.1403 33.8338 27.4933 35.9491 28.8781 38.039C29.2489 38.6003 30.0417 38.2265 30.1624 37.6621C30.7724 34.2635 31.3824 30.8648 32.0209 27.4694C32.0908 27.1016 31.758 26.7178 31.3871 26.6765C30.9559 26.6573 30.6324 26.9679 30.5625 27.3357Z"></path>
              </svg>

              <div className="flex items-center justify-center">
                {isLoggedIn ? (
                  <Link href="/match">
                    <div className="group cursor-pointer border border-border bg-card gap-2 h-[60px] flex items-center p-[10px] rounded-full">
                      <div className="border border-border bg-[#e88951] h-[40px] rounded-full flex items-center justify-center text-white">
                        <p className="font-medium tracking-tight mr-3 ml-3 flex items-center gap-2 justify-center text-base">
                          <Code className="w-5 h-5" />
                          Find Issues Now
                        </p>
                      </div>
                      <div className="text-muted-foreground group-hover:ml-4 ease-in-out transition-all size-[24px] flex items-center justify-center rounded-full border-2 border-border">
                        <ArrowRight className="w-4 h-4 group-hover:rotate-180 ease-in-out transition-all" />
                      </div>
                    </div>
                  </Link>
                ) : (
                  <Link href="/login">
                    <div className="group cursor-pointer border border-border bg-card gap-2 h-[60px] flex items-center p-[10px] rounded-full">
                      <div className="border border-border bg-[#e88951] h-[40px] rounded-full flex items-center justify-center text-white">
                        <p className="font-medium tracking-tight mr-3 ml-3 flex items-center gap-2 justify-center text-base">
                          <Github className="w-5 h-5" />
                          Get started
                        </p>
                      </div>
                      <div className="text-muted-foreground group-hover:ml-4 ease-in-out transition-all size-[24px] flex items-center justify-center rounded-full border-2 border-border">
                        <ArrowRight className="w-4 h-4 group-hover:rotate-180 ease-in-out transition-all" />
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
            <div className="text-center">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="mx-auto flex items-center justify-center w-8 h-14 rounded-full border border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/40 transition-all cursor-pointer group"
              >
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-white/60 group-hover:text-gray-800 dark:group-hover:text-white/80 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gradient-to-b dark:from-[#0a0a0a] dark:to-black relative overflow-hidden">
        <div className="bg-primary absolute -top-10 left-1/2 h-16 w-44 -translate-x-1/2 rounded-full opacity-40 blur-3xl"></div>
        <div className="via-primary/50 absolute top-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent"></div>
        
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-6 py-2 rounded-full bg-[#e88951]/10 dark:bg-[#e88951]/20 border border-[#e88951]/20 dark:border-[#e88951]/30 text-[#e88951] text-sm font-semibold">
              <Zap className="w-4 h-4" />
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              From <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e88951] to-[#e88951]">Profile</span> to <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e88951] to-[#e88951]">Contribution</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              In three simple steps, we transform your GitHub profile into a personalized open source contribution journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="group relative bg-gradient-to-br from-white to-[#e88951]/5 dark:from-[#1a1a1a] dark:to-[#e88951]/5 backdrop-blur-sm border border-gray-200 dark:border-gray-900 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e88951]/20 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 text-[120px] font-bold bg-gradient-to-br from-[#e88951]/10 to-[#e88951]/5 bg-clip-text text-transparent leading-none p-4">
                01
              </div>
              <div className="relative">
                <div className="mb-6 inline-flex p-4 rounded-xl bg-[#e88951]/10 text-[#e88951] transition-all duration-300">
                  <Github className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-[#e88951] transition-colors">
                  Connect GitHub
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Sign in with GitHub to analyze your repositories, contributions, and coding patterns using our secure AI system.
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[29.5%] z-20">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-900">
                <ArrowRight className="h-6 w-6 text-[#e88951] animate-pulse" />
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white to-[#e88951]/5 dark:from-[#1a1a1a] dark:to-[#e88951]/5 backdrop-blur-sm border border-gray-200 dark:border-gray-900 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e88951]/20 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 text-[120px] font-bold bg-gradient-to-br from-[#e88951]/10 to-[#e88951]/5 bg-clip-text text-transparent leading-none p-4">
                02
              </div>
              <div className="relative">
                <div className="mb-6 inline-flex p-4 rounded-xl bg-[#e88951]/10 text-[#e88951] transition-all duration-300">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-[#e88951] transition-colors">
                  AI Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our advanced AI analyzes your skills and creates a developer profile using vector embeddings to find perfect matches.
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[62.8%] z-20">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-900">
                <ArrowRight className="h-6 w-6 text-[#e88951] animate-pulse" />
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white to-[#e88951]/5 dark:from-[#1a1a1a] dark:to-[#e88951]/5 backdrop-blur-sm border border-gray-200 dark:border-gray-900 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e88951]/20 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 text-[120px] font-bold bg-gradient-to-br from-[#e88951]/10 to-[#e88951]/5 bg-clip-text text-transparent leading-none p-4">
                03
              </div>
              <div className="relative">
                <div className="mb-6 inline-flex p-4 rounded-xl bg-[#e88951]/10 text-[#e88951] transition-all duration-300">
                  <Code className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-[#e88951] transition-colors">
                  Start Contributing
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Get personalized issue recommendations that match your expertise, with mentorship options to help you succeed.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link
              href="/match"
              className="inline-flex items-center gap-2 text-[#e88951] hover:text-[#d67840] font-semibold transition-colors group"
            >
              See how it works in action
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section id="stats" className="py-16 bg-white dark:bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
                See it in <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e88951] to-[#e88951]">action</span>
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Watch how IssueMatch analyzes your profile and finds the perfect issues for you.
              </p>
            </div>
            
            <div>
              <AnimatedCodeDemo />
            </div>
          </div>
        </div>
      </section>
      
      <section id="features" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#e88951]/5 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#e88951]/5 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block mb-3 px-6 py-1.5 bg-[#e88951]/10 dark:bg-[#e88951]/20 rounded-full border border-[#e88951]/20 dark:border-[#e88951]/30 text-[#e88951] text-sm font-medium">
              Key Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Everything You Need to <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e88951] to-[#e88951]">Succeed</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl text-lg">
              IssueMatch provides all the tools you need to find the perfect open source issues and make meaningful contributions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group relative bg-gradient-to-br from-white to-[#e88951]/5 dark:from-[#1a1a1a] dark:to-[#e88951]/5 backdrop-blur-sm border border-gray-200 dark:border-gray-900 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e88951]/10 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/0 to-[#e88951]/0 group-hover:from-[#e88951]/5 group-hover:to-[#e88951]/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#e88951] to-[#e88951] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI-Powered Matching</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our advanced AI analyzes your GitHub profile and coding patterns to find issues that perfectly match your skills and interests.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-white to-[#e88951]/5 dark:from-[#1a1a1a] dark:to-[#e88951]/5 backdrop-blur-sm border border-gray-200 dark:border-gray-900 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e88951]/10 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/0 to-[#e88951]/0 group-hover:from-[#e88951]/5 group-hover:to-[#e88951]/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#e88951] to-[#e88951] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Mentor Connection</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Connect with experienced mentors who can guide you through your open source journey and help you make successful contributions.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-white to-[#e88951]/5 dark:from-[#1a1a1a] dark:to-[#e88951]/5 backdrop-blur-sm border border-gray-200 dark:border-gray-900 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e88951]/10 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/0 to-[#e88951]/0 group-hover:from-[#e88951]/5 group-hover:to-[#e88951]/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#e88951] to-[#e88951] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Gamified Leaderboard</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Track your progress on our interactive leaderboard and earn badges as you make more contributions to open source projects.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-white to-[#e88951]/5 dark:from-[#1a1a1a] dark:to-[#e88951]/5 backdrop-blur-sm border border-gray-200 dark:border-gray-900 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e88951]/10 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/0 to-[#e88951]/0 group-hover:from-[#e88951]/5 group-hover:to-[#e88951]/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#e88951] to-[#e88951] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI Assistant</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Get help understanding issues and planning your contributions with our built-in AI assistant powered by Google Gemini.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-white to-[#e88951]/5 dark:from-[#1a1a1a] dark:to-[#e88951]/5 backdrop-blur-sm border border-gray-200 dark:border-gray-900 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e88951]/10 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/0 to-[#e88951]/0 group-hover:from-[#e88951]/5 group-hover:to-[#e88951]/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#e88951] to-[#e88951] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Share2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Referral Program</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Invite friends to join IssueMatch and earn rewards as they make contributions to the open source community.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-white to-[#e88951]/5 dark:from-[#1a1a1a] dark:to-[#e88951]/5 backdrop-blur-sm border border-gray-200 dark:border-gray-900 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e88951]/10 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/0 to-[#e88951]/0 group-hover:from-[#e88951]/5 group-hover:to-[#e88951]/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#e88951] to-[#e88951] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Skill Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Visualize your skills and track your growth as you contribute to different projects and technologies.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex justify-center">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#e88951] to-[#e88951] text-white font-semibold py-4 px-10 rounded-full transition-all hover:shadow-2xl hover:shadow-[#e88951]/30 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#d67840] to-[#d67840] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Github className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Get Started with GitHub</span>
            </Link>
          </div>
        </div>
      </section>
      
      <TestimonialsSection />
      
      <NewReleasePromo />
    </main>
  )
}
