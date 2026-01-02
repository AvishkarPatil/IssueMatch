"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { getUserByGithubId } from "@/lib/firebase-utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"

interface IssueFilterProps {
  onFilterChange: (filters: { keywords: string[] }) => void
}

const PREDEFINED_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust",
  "React", "Vue", "Angular", "Node.js", "Express", "Django", "Flask", "Spring",
  "Machine Learning", "Data Science", "AI", "Web Development", "Mobile Development",
  "DevOps", "Cloud Computing", "Database", "API", "Testing"
]

export function IssueFilter({ onFilterChange }: IssueFilterProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [userSkills, setUserSkills] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  // Fetch user skills
  useEffect(() => {
    const fetchUserSkills = async () => {
      if (!user) return
      try {
        const result = await getUserByGithubId(user.id)
        if (result.success && result.data?.skill_keywords) {
          setUserSkills(result.data.skill_keywords)
        }
      } catch (error) {
        console.error("Error fetching user skills:", error)
      }
    }
    fetchUserSkills()
  }, [user])

  // Combine user skills with predefined skills
  const allSkills = Array.from(new Set([...userSkills, ...PREDEFINED_SKILLS]))

  const handleSkillToggle = (skill: string) => {
    const updated = selectedKeywords.includes(skill)
      ? selectedKeywords.filter(s => s !== skill)
      : [...selectedKeywords, skill]
    setSelectedKeywords(updated)
  }

  const applyFilters = () => {
    onFilterChange({
      keywords: selectedKeywords
    })
    setIsOpen(false)
  }

  const clearFilters = () => {
    setSelectedKeywords([])
    onFilterChange({ keywords: [] })
  }

  const totalSelected = selectedKeywords.length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Issues
          {totalSelected > 0 && (
            <Badge variant="secondary" className="ml-1">
              {totalSelected}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Keywords</h4>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {allSkills.map(skill => (
                <div key={`keyword-${skill}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`keyword-${skill}`}
                    checked={selectedKeywords.includes(skill)}
                    onCheckedChange={() => handleSkillToggle(skill)}
                  />
                  <label htmlFor={`keyword-${skill}`} className="text-sm">{skill}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button onClick={applyFilters} size="sm">
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear All
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
