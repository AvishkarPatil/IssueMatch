"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, Check, FileText, Plus, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

export default function ResumeUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState("")
  const [skillLevel, setSkillLevel] = useState<Record<string, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Common skill suggestions
  const skillSuggestions = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "Java",
    "C#",
    "Go",
    "Rust",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GraphQL",
    "REST API",
    "SQL",
    "MongoDB",
    "Redis",
    "Git",
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (
        droppedFile.type === "application/pdf" ||
        droppedFile.type === "application/msword" ||
        droppedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(droppedFile)
      } else {
        alert("Please upload a PDF or Word document")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadComplete(true)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      const newSkill = currentSkill.trim()
      setSkills([...skills, newSkill])
      setSkillLevel({ ...skillLevel, [newSkill]: 3 }) // Default to intermediate level
      setCurrentSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
    const newSkillLevel = { ...skillLevel }
    delete newSkillLevel[skillToRemove]
    setSkillLevel(newSkillLevel)
  }

  const handleSkillLevelChange = (skill: string, level: number) => {
    setSkillLevel({ ...skillLevel, [skill]: level })
  }

  const handleSave = () => {
    // In a real app, you would save the skills to the user's profile
    // For now, we'll just simulate a successful save and redirect
    setTimeout(() => {
      router.push("/profile")
    }, 1000)
  }

  const getSkillLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Beginner"
      case 2:
        return "Elementary"
      case 3:
        return "Intermediate"
      case 4:
        return "Advanced"
      case 5:
        return "Expert"
      default:
        return "Intermediate"
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Resume & Skills</h1>
          <p className="text-gray-400">
            Upload your resume and add your skills to help us find the perfect open source issues for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Resume Upload Section */}
          <div className="bg-[#1a1f2a] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-400" />
              Resume Upload
            </h2>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
                isDragging
                  ? "border-purple-500 bg-purple-500/10"
                  : file
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-700 hover:border-gray-600"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-white font-medium mb-1">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-white font-medium mb-1">Drag and drop your resume here</p>
                  <p className="text-gray-400 text-sm">or click to browse (PDF, DOC, DOCX)</p>
                </div>
              )}
            </div>

            {file && !uploadComplete && (
              <div className="mb-4">
                {isUploading ? (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Uploading...</span>
                      <span className="text-gray-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleUpload}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Upload Resume
                  </button>
                )}
              </div>
            )}

            {uploadComplete && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm flex items-center mb-4">
                <Check className="h-4 w-4 mr-2" />
                Resume uploaded successfully! Our AI will analyze it to improve your matches.
              </div>
            )}

            {file && (
              <button
                onClick={() => {
                  setFile(null)
                  setUploadComplete(false)
                  setUploadProgress(0)
                }}
                className="w-full py-2 px-4 bg-[#242a38] hover:bg-[#2d3548] rounded-lg text-gray-300 font-medium transition-colors flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove File
              </button>
            )}
          </div>

          {/* Skills Section */}
          <div className="bg-[#1a1f2a] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Your Skills</h2>

            <div className="mb-6">
              <div className="flex mb-2">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Add a skill (e.g. JavaScript, React, Python)"
                  className="flex-1 bg-[#242a38] border border-gray-700 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                />
                <button
                  onClick={handleAddSkill}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-r-lg flex items-center justify-center transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="text-xs text-gray-400 mt-1">Press Enter to add a skill or click the + button</div>
            </div>

            {/* Skill suggestions */}
            {currentSkill && (
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Suggestions:</div>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions
                    .filter(
                      (suggestion) =>
                        suggestion.toLowerCase().includes(currentSkill.toLowerCase()) && !skills.includes(suggestion),
                    )
                    .slice(0, 5)
                    .map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setCurrentSkill(suggestion)
                          handleAddSkill()
                        }}
                        className="px-3 py-1 bg-[#242a38] hover:bg-[#2d3548] rounded-lg text-gray-300 text-sm transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Skills list */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {skills.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No skills added yet. Add your skills to get better issue matches.
                </div>
              ) : (
                skills.map((skill) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#242a38] rounded-lg p-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-white">{skill}</div>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-1 flex justify-between items-center">
                      <span className="text-xs text-gray-400">{getSkillLevelLabel(skillLevel[skill] || 3)}</span>
                      <span className="text-xs text-purple-400">{skillLevel[skill] || 3}/5</span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={skillLevel[skill] || 3}
                      onChange={(e) => handleSkillLevelChange(skill, Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-[#242a38] hover:bg-[#2d3548] rounded-lg text-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  )
}
