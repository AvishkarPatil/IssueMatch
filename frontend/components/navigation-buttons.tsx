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
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "bg-[#1a1f2a] text-gray-300 hover:bg-[#242a38]"
          }`}
          onClick={() => setActiveButton(button.id)}
        >
          {button.label}
        </button>
      ))}
    </div>
  )
}
