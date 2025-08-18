"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "Find Your Perfect Open Source Match",
    description:
      "AI-powered matching connects developers with ideal GitHub issues based on your skills, interests, and contribution history.",
    stats: [
      { value: "4,318+", label: "Developers" },
      { value: "27,894+", label: "Issues Matched" },
      { value: "6,782+", label: "Contributions Made" },
      { value: "1,143+", label: "Repositories" },
    ],
  },
  {
    id: 2,
    title: "How IssueMatch Works",
    description:
      "Our platform uses advanced AI to connect developers with open source issues that match their skills and interests.",
    features: [
      {
        icon: "ai",
        title: "AI-Powered Matching",
        description:
          "Our Vertex AI algorithm analyzes your skills and history to find the perfect GitHub issues for you.",
      },
      {
        icon: "github",
        title: "GitHub Integration",
        description: "Seamlessly connect with GitHub to access issues, track contributions, and analyze your activity.",
      },
      {
        icon: "analytics",
        title: "Analytics Dashboard",
        description: "Track your contribution metrics, skill growth, and impact with our comprehensive analytics.",
      },
    ],
  },
]

export function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState("right")
  const [isAnimating, setIsAnimating] = useState(false)

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection("right")
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
        setTimeout(() => {
          setIsAnimating(false)
        }, 50)
      }, 300)
    }, 7000) // Change slide every 7 seconds

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    if (isAnimating) return
    setDirection("right")
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
      setTimeout(() => {
        setIsAnimating(false)
      }, 50)
    }, 300)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setDirection("left")
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
      setTimeout(() => {
        setIsAnimating(false)
      }, 50)
    }, 300)
  }

  return (
    <div className="relative w-full bg-gray-50 dark:bg-[#0a101c] py-16 overflow-hidden">
      {/* Slides */}
      <div className="container mx-auto px-4 relative h-[400px] md:h-[450px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : direction === "right"
                  ? "opacity-0 translate-x-full"
                  : "opacity-0 -translate-x-full"
            } ${isAnimating && index === currentSlide ? "opacity-0" : ""}`}
          >
            <div className="max-w-4xl mx-auto text-center h-full flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 dark:from-purple-400 dark:via-pink-500 dark:to-purple-600">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-600 dark:text-gray-300">{slide.description}</p>

              {/* Slide 1 specific content */}
              {index === 0 && slide.stats && (
                <div className="flex flex-wrap justify-center gap-8 mb-8">
                  {slide.stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-purple-400">{stat.value}</div>
                      <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Slide 2 specific content */}
              {index === 1 && slide.features && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {slide.features.map((feature, i) => (
                    <div key={i} className="bg-white dark:bg-[#1a1f2a] p-6 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-[#242a38] transition-colors border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-purple-600/20 flex items-center justify-center mb-4">
                        <span className="text-blue-600 dark:text-purple-400 text-xl">
                          {feature.icon === "ai" && "🧠"}
                          {feature.icon === "github" && "🔗"}
                          {feature.icon === "analytics" && "📊"}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-purple-300">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 p-2 rounded-full transition-colors border border-gray-200 dark:border-transparent shadow-md dark:shadow-none"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 p-2 rounded-full transition-colors border border-gray-200 dark:border-transparent shadow-md dark:shadow-none"
      >
        <ChevronRight className="w-6 h-6 text-gray-700 dark:text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (isAnimating) return
              setDirection(index > currentSlide ? "right" : "left")
              setIsAnimating(true)
              setTimeout(() => {
                setCurrentSlide(index)
                setTimeout(() => {
                  setIsAnimating(false)
                }, 50)
              }, 300)
            }}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide 
                ? "bg-blue-500 dark:bg-purple-500" 
                : "bg-gray-400/70 dark:bg-gray-500/50 hover:bg-gray-500 dark:hover:bg-gray-400/70"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
