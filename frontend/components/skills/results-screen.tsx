"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Check } from "lucide-react"

interface ResultsScreenProps {
  skills: string[]
  onGetStarted: () => void
}

// Map of skill keywords to more readable display names
const skillDisplayNames: Record<string, string> = {
  react: "React",
  css: "CSS",
  nodejs: "Node.js",
  mongodb: "MongoDB",
  express: "Express.js",
  "machine learning": "Machine Learning",
  pytorch: "PyTorch",
  cybersecurity: "Cybersecurity",
  pentesting: "Penetration Testing",
  docker: "Docker",
  "ci/cd": "CI/CD",
  pandas: "Pandas",
  "data science": "Data Science",
  fullstack: "Full Stack",
  mern: "MERN Stack",
  ctf: "CTF",
  flutter: "Flutter",
  kotlin: "Kotlin",
  unity: "Unity",
  gamedev: "Game Development",
  ai: "AI",
  nextjs: "Next.js",
  android: "Android",
  blockchain: "Blockchain",
  solidity: "Solidity",
  web3: "Web3",
  backend: "Backend",
  numpy: "NumPy",
  tailwind: "Tailwind CSS",
  "bug bounty": "Bug Bounty",
  frontend: "Frontend",
}

export default function ResultsScreen({ skills, onGetStarted }: ResultsScreenProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    // Simulate a loading state before calling the actual handler
    setTimeout(() => {
      onGetStarted()
    }, 1500)
  }

  // Get display names for skills
  const displaySkills = skills.map((skill) => skillDisplayNames[skill] || skill)

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6"
      >
        <Check className="h-8 w-8 text-white" />
      </motion.div>

      <h1 className="text-3xl font-bold mb-3 text-white">Your Skills Profile</h1>

      <p className="text-lg text-purple-300 mb-8">Based on your responses, these are your top skills</p>

      <motion.div
        className="flex flex-wrap justify-center gap-3 mb-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {displaySkills.map((skill, index) => (
          <motion.div
            key={skill}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
            className="bg-purple-800/50 border border-purple-500 rounded-full px-4 py-2 flex items-center"
          >
            <Sparkles className="h-3 w-3 mr-2 text-purple-400" />
            <span className="text-white font-medium text-sm">{skill}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <Button
          onClick={handleGetStarted}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
              Saving your skills...
            </>
          ) : (
            <>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}
