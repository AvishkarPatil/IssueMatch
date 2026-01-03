"use client"

import { useState, useEffect } from "react"
import CodeHighlighter from "./code-highlighter"

const codeSnippet = `const developer = await github.getProfile();
const skills = await analyzer.extractSkills(developer);
const matches = await issueMatch.findBestMatches(skills);
// Finding perfect matches...
const recommendations = matches.filter(m => m.score > 0.8);
console.log('Found 23 perfect matches!');`

export default function AnimatedCodeDemo() {
  const [displayedCode, setDisplayedCode] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (currentIndex < codeSnippet.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(codeSnippet.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 15)
      return () => clearTimeout(timeout)
    } else {
      const resetTimeout = setTimeout(() => {
        setCurrentIndex(0)
        setDisplayedCode("")
      }, 3000)
      return () => clearTimeout(resetTimeout)
    }
  }, [currentIndex, mounted])

  if (!mounted) {
    return (
      <div className="bg-[#1e1e1e] border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden max-w-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d30] border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="text-gray-400 text-xs font-medium">issue-match-finder.js</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-500">Running</span>
          </div>
        </div>
        <div className="p-5 min-h-[200px] bg-[#1e1e1e]"></div>
      </div>
    )
  }

  return (
    <div className="bg-[#1e1e1e] border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden max-w-2xl hover:border-gray-600/50 transition-all">
      <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d30] border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 transition-colors cursor-pointer"></div>
          </div>
          <span className="text-gray-400 text-xs font-medium">issue-match-finder.js</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-500">Running</span>
        </div>
      </div>
      <div className="relative p-5 min-h-[200px] overflow-hidden bg-[#1e1e1e]">
        <CodeHighlighter code={displayedCode} />
        {currentIndex < codeSnippet.length && (
          <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse"></span>
        )}
      </div>
    </div>
  )
}
