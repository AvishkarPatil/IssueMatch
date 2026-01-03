import Link from "next/link"
import { Github, Zap, Code, BarChart2 } from "lucide-react"
import AnimatedCodeDemo from "@/components/animated-code-demo"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117] to-[#0a101c] z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-500 to-purple-600">
                Grow your portfolio with meaningful work
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                Our AI-driven platform matches developers with ideal GitHub issues based on your skills, history, and
                interests. Contribute to projects that matter to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  <Github className="w-5 h-5" />
                  Sign in with GitHub
                </Link>
                <Link
                  href="#how-it-works"
                  className="flex items-center justify-center gap-2 bg-[#1a1f2a] hover:bg-[#242a38] text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Learn More
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-1"
                  >
                    <path
                      d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-6 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#0ea5e9] p-3 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21a8 8 0 0 0-16 0" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Developer Profile</h3>
                      <p className="text-gray-400">Your skills and contribution history</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-purple-600 p-3 rounded-full">
                      <Zap className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">AI Matching</h3>
                      <p className="text-gray-400">Powered by Vertex AI</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-green-600 p-3 rounded-full">
                      <Code className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">GitHub Integration</h3>
                      <p className="text-gray-400">Seamless connection to repositories</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-orange-500 p-3 rounded-full">
                      <BarChart2 className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Analytics</h3>
                      <p className="text-gray-400">Track your contribution impact</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-[#0a101c]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How the <span className="text-[#0ea5e9]">Matchmaker</span> Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-8 transition-transform hover:transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-[#0ea5e9] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Github className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Connect GitHub</h3>
              <p className="text-gray-400 text-center">
                Link your GitHub account to analyze your repositories, contributions, and coding patterns.
              </p>
            </div>

            <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-8 transition-transform hover:transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">AI Analysis</h3>
              <p className="text-gray-400 text-center">
                Our Vertex AI algorithms analyze your skills and match them with open issues across GitHub.
              </p>
            </div>

            <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-8 transition-transform hover:transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Start Contributing</h3>
              <p className="text-gray-400 text-center">
                Get personalized recommendations for issues that match your expertise and interests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Demo Section */}
      <section className="py-20 bg-[#0d1117]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              See it in <span className="text-[#0ea5e9]">action</span>
            </h2>
            <p className="text-gray-400 text-center mb-12">
              Watch how IssueMatch analyzes your profile and finds the perfect issues for you.
            </p>
            <AnimatedCodeDemo />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#0a101c]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">5,000+</div>
              <div className="text-gray-400">Developers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#0ea5e9] mb-2">30,000+</div>
              <div className="text-gray-400">Issues Matched</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">7,500+</div>
              <div className="text-gray-400">Contributions Made</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">1,000+</div>
              <div className="text-gray-400">Repositories</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
