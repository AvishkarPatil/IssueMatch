"use client"

import { useState } from "react"

export function NavigationButtons() {
  const [activeButton, setActiveButton] = useState("recommended")

  const buttons = [
    { id: "recommended", label: "Recommended" },
    { id: "trending", label: "Trending Issues" },
    { id: "favorite", label: "Favorite Issues" },
    { id: "recent", label: "Recently Viewed" },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {buttons.map((button) => (
        <button
          key={button.id}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
            activeButton === button.id
              ? "bg-[#e88951] text-white shadow-lg shadow-[#e88951]/20"
              : "bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0d1117] border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none"
          }`}
          onClick={() => setActiveButton(button.id)}
        >
          {button.label}
        </button>
      ))}
    </div>
  )
}
