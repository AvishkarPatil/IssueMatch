"use client"

import { useState } from "react"
import { Code, ThumbsDown, ThumbsUp, Star, Lightbulb } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface Issue {
  id: number
  title: string
  repo: string
  description: string
  skillMatch: number
  skills: string[]
  matchColor: string
  issueUrl: string
}

interface IssueCardProps {
  issue: Issue
}

export function IssueCard({ issue }: IssueCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isInterested, setIsInterested] = useState(null as boolean | null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const router = useRouter()

  const getMatchColorClass = () => {
    if (issue.skillMatch >= 90) return "bg-purple-600"
    if (issue.skillMatch >= 80) return "bg-purple-500"
    if (issue.skillMatch >= 70) return "bg-pink-500"
    return "bg-orange-500"
  }

  const handleContribute = () => {
    setIsAnimating(true)
    setIsInterested(true)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const handleNotInterested = () => {
    setIsAnimating(true)
    setIsInterested(false)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const handleMentor = () => {
    router.push(`/mentor?issueID=${issue.id}`)
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  return (
    <div
      className={`bg-white dark:bg-[#161b22] rounded-lg overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none ${
        isHovered ? "shadow-lg shadow-blue-500/10 dark:shadow-purple-900/20 translate-y-[-2px]" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        {/* Title & Skill Match */}
        <div className="flex items-center justify-between mb-3">
          <a
            href={issue.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-purple-400 transition-colors truncate max-w-[75%]"
          >
            {issue.title}
          </a>
          <div className="flex items-center gap-2">
            <motion.button
              className={`p-1.5 rounded-full transition-colors ${
                isFavorite 
                  ? "text-yellow-500 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/10" 
                  : "text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-400/10"
              }`}
              onClick={toggleFavorite}
              whileTap={{ scale: 0.9 }}
              animate={
                isFavorite
                  ? { scale: [1, 1.2, 1], transition: { duration: 0.3 } }
                  : {}
              }
            >
              <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            </motion.button>
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getMatchColorClass()} transition-all duration-500`}
                style={{ width: `${issue.skillMatch}%` }}
              />
            </div>
            <span className="text-sm font-medium" style={{ color: issue.matchColor }}>
              {issue.skillMatch}%
            </span>
          </div>
        </div>

        {/* Repo URL */}
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{issue.repo}</span>
        </div>

        {/* Description */}
        <p
          className={`text-gray-600 dark:text-gray-400 mb-4 transition-all duration-300 cursor-pointer ${
            isExpanded ? "" : "line-clamp-2"
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {issue.description}
        </p>

        {/* Skills + Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {issue.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-[#0d1117] text-gray-700 dark:text-gray-300 hover:bg-[#e88951]/10 dark:hover:bg-[#e88951]/20 hover:text-[#e88951] transition-colors cursor-pointer"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <motion.button
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#0d1117] text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-600/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors border border-gray-200 dark:border-gray-800"
              onClick={handleMentor}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                Mentor
              </span>
            </motion.button>

            <motion.button
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isInterested
                  ? "bg-[#e88951] text-white"
                  : "bg-gray-100 dark:bg-[#0d1117] text-gray-600 dark:text-gray-400 hover:bg-[#e88951]/10 dark:hover:bg-[#e88951]/20 hover:text-[#e88951] border border-gray-200 dark:border-gray-800"
              }`}
              onClick={handleContribute}
              whileTap={{ scale: 0.95 }}
              animate={
                isAnimating && isInterested
                  ? { scale: [1, 1.1, 1], transition: { duration: 0.4 } }
                  : {}
              }
            >
              <span className="flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4" />
                Contribute
              </span>
            </motion.button>

            <motion.button
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isInterested === false
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-[#0d1117] text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-600/20 hover:text-red-700 dark:hover:text-red-400 border border-gray-200 dark:border-gray-800"
              }`}
              onClick={handleNotInterested}
              whileTap={{ scale: 0.95 }}
              animate={
                isAnimating && isInterested === false
                  ? { scale: [1, 1.1, 1], transition: { duration: 0.4 } }
                  : {}
              }
            >
              <span className="flex items-center gap-1.5">
                <ThumbsDown className="w-4 h-4" />
                Not Interested
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hover Gradient Underline */}
      <div
        className={`h-1 w-full transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        style={{
          background: `linear-gradient(to right, ${issue.matchColor}, #8b5cf6)`,
        }}
      />
    </div>
  )
}