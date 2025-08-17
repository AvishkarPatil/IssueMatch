"use client"

import { useState, useEffect } from "react"
import { Award, Flame, Star, Trophy, Zap } from "lucide-react"

const quotes = [
  {
    text: "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.",
    author: "Patrick McKenzie",
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
  },
  {
    text: "The best way to predict the future is to implement it.",
    author: "David Heinemeier Hansson",
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
  },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
  },
]

const achievements = [
  {
    icon: <Trophy className="w-5 h-5 text-yellow-500" />,
    title: "Consistency Champion",
    description: "You've contributed code for 7 days in a row!",
  },
  {
    icon: <Flame className="w-5 h-5 text-orange-500" />,
    title: "On Fire!",
    description: "You solved 3 hard issues this week.",
  },
  {
    icon: <Star className="w-5 h-5 text-purple-400" />,
    title: "Rising Star",
    description: "Your PR was featured in the project newsletter!",
  },
  {
    icon: <Zap className="w-5 h-5 text-blue-400" />,
    title: "Quick Responder",
    description: "You've been responding to issues within 24 hours.",
  },
  {
    icon: <Award className="w-5 h-5 text-green-400" />,
    title: "Bug Crusher",
    description: "You fixed a critical bug that affected many users.",
  },
]

export function InspirationSidebar() {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setQuoteIndex((prev) => (prev === quotes.length - 1 ? 0 : prev + 1))
        setTimeout(() => {
          setAnimating(false)
        }, 100)
      }, 500)
    }, 10000) // Change quote every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Inspirational Quote */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a1f2a] dark:to-[#242a38] rounded-lg p-5 shadow-lg dark:shadow-lg border border-gray-200 dark:border-purple-900/20">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="bg-blue-100 dark:bg-purple-600/20 p-1.5 rounded-md mr-2 text-blue-600 dark:text-purple-400">💡</span>
          Daily Inspiration
        </h3>
        <div className="min-h-[120px] flex flex-col justify-center">
          <p
            className={`text-gray-700 dark:text-gray-300 italic mb-2 transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-100"}`}
          >
            "{quotes[quoteIndex].text}"
          </p>
          <p
            className={`text-blue-600 dark:text-purple-400 text-sm text-right transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-100"}`}
          >
            — {quotes[quoteIndex].author}
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a1f2a] dark:to-[#242a38] rounded-lg p-5 shadow-lg dark:shadow-lg border border-gray-200 dark:border-purple-900/20">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="bg-blue-100 dark:bg-purple-600/20 p-1.5 rounded-md mr-2 text-blue-600 dark:text-purple-400">🏆</span>
          Your Achievements
        </h3>
        <div className="space-y-4">
          {achievements.slice(0, 3).map((achievement, index) => (
            <div
              key={index}
              className="flex items-start gap-3 group p-2 rounded-md hover:bg-gray-50 dark:hover:bg-black/20 transition-colors"
            >
              <div className="mt-0.5 bg-gray-100 dark:bg-[#1a1f2a] p-1.5 rounded-md">{achievement.icon}</div>
              <div>
                <h4 className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
