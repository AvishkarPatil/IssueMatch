"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Send } from "lucide-react"

interface SkillsTestProps {
  onComplete: (skills: string[]) => void
}

// Define the test questions and options
const questions = [
  {
    question: "What kind of projects excite you the most?",
    options: [
      { text: "Designing interactive UIs and animations", keywords: ["react", "css"] },
      { text: "Building REST APIs and database models", keywords: ["nodejs", "mongodb"] },
      { text: "Developing AI models or prediction systems", keywords: ["machine learning", "pytorch"] },
      { text: "Finding and exploiting security flaws", keywords: ["cybersecurity", "pentesting"] },
    ],
  },
  {
    question: "Which of these tools/technologies have you worked with or want to explore?",
    options: [
      { text: "React, Tailwind CSS", keywords: ["react", "css"] },
      { text: "Express, MongoDB", keywords: ["express", "mongodb"] },
      { text: "Docker, GitHub Actions", keywords: ["docker", "ci/cd"] },
      { text: "Pandas, Matplotlib", keywords: ["pandas", "data science"] },
    ],
  },
  {
    question: "Which best describes your ideal role?",
    options: [
      { text: "Full-stack web developer", keywords: ["fullstack", "mern"] },
      { text: "Cybersecurity researcher", keywords: ["cybersecurity", "ctf"] },
      { text: "Mobile app developer", keywords: ["flutter", "kotlin"] },
      { text: "Game developer", keywords: ["unity", "gamedev"] },
    ],
  },
  {
    question: "What do you enjoy solving the most?",
    options: [
      { text: "UI/UX and user interaction problems", keywords: ["css", "react"] },
      { text: "Backend scaling and performance", keywords: ["nodejs", "express"] },
      { text: "Classification or clustering challenges", keywords: ["ai", "machine learning"] },
      { text: "Capture The Flag puzzles or exploits", keywords: ["ctf", "pentesting"] },
    ],
  },
  {
    question: "Your preferred development environment?",
    options: [
      { text: "Visual Studio Code with Next.js", keywords: ["nextjs", "fullstack"] },
      { text: "Jupyter Notebooks and Colab", keywords: ["data science", "pandas"] },
      { text: "Android Studio or Flutter", keywords: ["flutter", "android"] },
      { text: "Kali Linux and Burp Suite", keywords: ["cybersecurity", "pentesting"] },
    ],
  },
  {
    question: "Which of these repositories would you contribute to?",
    options: [
      { text: "A Web3 DApp written in Solidity", keywords: ["blockchain", "solidity"] },
      { text: "A game engine built in Unity", keywords: ["unity", "gamedev"] },
      { text: "A scalable REST API boilerplate", keywords: ["nodejs", "backend"] },
      { text: "A data visualization dashboard", keywords: ["pandas", "data science"] },
    ],
  },
  {
    question: "Choose a task you'd enjoy doing for a hackathon:",
    options: [
      { text: "Making the frontend look smooth and responsive", keywords: ["react", "tailwind"] },
      { text: "Securing the app and performing pentests", keywords: ["cybersecurity", "ctf"] },
      { text: "Building a chatbot with ML", keywords: ["machine learning", "ai"] },
      { text: "Automating CI/CD for deployments", keywords: ["docker", "ci/cd"] },
    ],
  },
  {
    question: "Which of these best represents your learning focus in the last 3 months?",
    options: [
      { text: "Building full-stack apps", keywords: ["fullstack", "mern"] },
      { text: "Preparing for CTFs", keywords: ["cybersecurity", "pentesting"] },
      { text: "Understanding GANs and neural networks", keywords: ["ai", "pytorch"] },
      { text: "Creating mobile UIs", keywords: ["flutter", "android"] },
    ],
  },
  {
    question: "Which of these would be your GitHub bio?",
    options: [
      { text: "Frontend developer passionate about design systems", keywords: ["react", "css"] },
      { text: "DevOps engineer automating deployments", keywords: ["docker", "ci/cd"] },
      { text: "Data enthusiast diving into real-world datasets", keywords: ["data science", "numpy"] },
      { text: "Security researcher and ethical hacker", keywords: ["pentesting", "cybersecurity"] },
    ],
  },
  {
    question: "Which domain would you teach to others confidently?",
    options: [
      { text: "React and frontend frameworks", keywords: ["react", "frontend"] },
      { text: "APIs and backend logic", keywords: ["nodejs", "express"] },
      { text: "Machine learning and data preprocessing", keywords: ["machine learning", "pandas"] },
      { text: "Bug bounty and network security", keywords: ["bug bounty", "cybersecurity"] },
    ],
  },
]

export default function SkillsTest({ onComplete }: SkillsTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<number[]>(Array(questions.length).fill(-1))
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleOptionSelect = (optionIndex: number) => {
    const newSelectedOptions = [...selectedOptions]
    newSelectedOptions[currentQuestionIndex] = optionIndex
    setSelectedOptions(newSelectedOptions)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handleSubmit = () => {
    // Calculate the top skills based on selected options
    const keywordCounts: Record<string, number> = {}

    selectedOptions.forEach((optionIndex, questionIndex) => {
      if (optionIndex !== -1) {
        const keywords = questions[questionIndex].options[optionIndex].keywords
        keywords.forEach((keyword) => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
        })
      }
    })

    // Sort keywords by count and get top 4
    const topSkills = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([keyword]) => keyword)

    onComplete(topSkills)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const canProceed = selectedOptions[currentQuestionIndex] !== -1

  return (
    <div className="relative">
      {/* Radial glows */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e88951]/5 rounded-full blur-3xl pointer-events-none"></div>
      
    <div className="container mx-auto max-w-3xl px-6 py-8 mt-24 bg-white dark:bg-[#161b22] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 relative z-10">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 text-sm text-[#e88951]">
          <span>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-full">
          <div className="h-full bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className={`${isTransitioning ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{currentQuestion.question}</h2>

          <div className="space-y-3 mb-10">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedOptions[currentQuestionIndex] === index
                    ? "border-[#e88951] bg-[#e88951]/10 dark:bg-[#e88951]/20"
                    : "border-gray-300 dark:border-gray-700 hover:border-[#e88951]/60 bg-white dark:bg-[#0d1117]"
                }`}
                onClick={() => handleOptionSelect(index)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                      selectedOptions[currentQuestionIndex] === index 
                        ? "bg-[#e88951]" 
                        : "border-2 border-gray-400 dark:border-gray-500"
                    }`}
                  >
                    {selectedOptions[currentQuestionIndex] === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-lg text-gray-900 dark:text-white">{option.text}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstQuestion}
              className={`${isFirstQuestion ? "opacity-0" : "opacity-100"} border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-[#e88951]/10 hover:text-[#e88951]`}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed}
                className="bg-[#e88951] hover:bg-[#d67840] text-white"
              >
                Submit Test
                <Send className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-[#e88951] hover:bg-[#d67840] text-white"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
    </div>
  )
}
