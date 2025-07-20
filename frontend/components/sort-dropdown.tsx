"use client"

import { useState } from "react"
import { ChevronDown, SortAsc } from "lucide-react"

export function SortDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [sortOption, setSortOption] = useState("skill-match")

  const options = [
    { id: "skill-match", label: "Skill Match" },
    { id: "recent", label: "Recently Added" },
    { id: "stars", label: "Repository Stars" },
  ]

  const handleSelect = (optionId: string) => {
    setSortOption(optionId)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 bg-[#1a1f2a] rounded-lg text-gray-300 hover:bg-[#242a38] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <SortAsc className="w-4 h-4" />
        <span>Sort</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1a1f2a] rounded-lg shadow-lg overflow-hidden z-50">
          {options.map((option) => (
            <button
              key={option.id}
              className={`w-full text-left px-4 py-2.5 transition-colors ${
                sortOption === option.id ? "bg-purple-600/20 text-purple-400" : "text-gray-300 hover:bg-[#242a38]"
              }`}
              onClick={() => handleSelect(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
