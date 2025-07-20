"use client"

import { useState } from "react"
import { Filter, SortAsc, SortDesc } from "lucide-react"

export function SortOptions() {
  const [sortBy, setSortBy] = useState("match")
  const [filterType, setFilterType] = useState("all")
  const [sortDirection, setSortDirection] = useState("desc")

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="bg-[#1a1f2a] rounded-lg p-5 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Sort & Filter</h3>
        <Filter className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-2">Sort by</label>
          <div className="grid grid-cols-1 gap-2">
            <SortOption label="Skill Match" value="match" current={sortBy} onClick={() => setSortBy("match")} />
            <SortOption label="Recently Added" value="recent" current={sortBy} onClick={() => setSortBy("recent")} />
            <SortOption label="Repository Stars" value="stars" current={sortBy} onClick={() => setSortBy("stars")} />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Filter by</label>
          <div className="grid grid-cols-1 gap-2">
            <FilterOption label="All Issues" value="all" current={filterType} onClick={() => setFilterType("all")} />
            <FilterOption
              label="Repositories"
              value="repos"
              current={filterType}
              onClick={() => setFilterType("repos")}
            />
            <FilterOption label="Issues" value="issues" current={filterType} onClick={() => setFilterType("issues")} />
          </div>
        </div>

        <div>
          <button
            className="flex items-center justify-between w-full p-3 bg-[#242a38] rounded-lg text-gray-300 hover:bg-[#2d3548] transition-colors"
            onClick={toggleSortDirection}
          >
            <span>Order: {sortDirection === "desc" ? "Descending" : "Ascending"}</span>
            {sortDirection === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
          </button>
        </div>

        <div className="pt-2">
          <button className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

interface SortOptionProps {
  label: string
  value: string
  current: string
  onClick: () => void
}

function SortOption({ label, value, current, onClick }: SortOptionProps) {
  const isActive = value === current

  return (
    <button
      className={`flex items-center p-3 rounded-lg transition-colors ${
        isActive
          ? "bg-purple-600/20 text-purple-400 border border-purple-600/50"
          : "bg-[#242a38] text-gray-300 hover:bg-[#2d3548]"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

interface FilterOptionProps {
  label: string
  value: string
  current: string
  onClick: () => void
}

function FilterOption({ label, value, current, onClick }: FilterOptionProps) {
  const isActive = value === current

  return (
    <button
      className={`flex items-center p-3 rounded-lg transition-colors ${
        isActive
          ? "bg-purple-600/20 text-purple-400 border border-purple-600/50"
          : "bg-[#242a38] text-gray-300 hover:bg-[#2d3548]"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
