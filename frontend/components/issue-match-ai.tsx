"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Minimize2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function IssueMatchAI() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm IssueMatch AI. I can help you solve coding issues and contribute to projects. How can I assist you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const minimizeChat = () => {
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let responseText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        responseText += chunk

        // Update the message in real-time
        setMessages((prev) => {
          const newMessages = [...prev]
          const assistantMessageIndex = newMessages.findIndex((msg) => msg.id === "assistant-typing")

          if (assistantMessageIndex === -1) {
            newMessages.push({
              id: "assistant-typing",
              role: "assistant",
              content: responseText,
            })
          } else {
            newMessages[assistantMessageIndex].content = responseText
          }

          return newMessages
        })
      }

      // Finalize the message with a permanent ID
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => msg.id !== "assistant-typing")
        newMessages.push({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: responseText,
        })
        return newMessages
      })
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 sm:w-96 h-[500px] flex flex-col shadow-lg border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#1a1f2a]">
          <div className="bg-gray-50 dark:bg-[#242a38] p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-white">IssueMatch AI</div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={minimizeChat} className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#1a1f2a]">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 mt-1">
                    <div
                      className={`h-full w-full flex items-center justify-center ${
                        message.role === "user" ? "bg-purple-600" : "bg-gray-700"
                      }`}
                    >
                      {message.role === "user" ? "U" : "AI"}
                    </div>
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user" 
                        ? "bg-blue-600 dark:bg-purple-600 text-white" 
                        : "bg-gray-100 dark:bg-[#242a38] text-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && !messages.some((msg) => msg.id === "assistant-typing") && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <Avatar className="h-8 w-8 mt-1">
                    <div className="h-full w-full flex items-center justify-center bg-gray-700">AI</div>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-gray-100 dark:bg-[#242a38] text-gray-900 dark:text-gray-200">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-blue-400 dark:bg-purple-400 rounded-full animate-bounce"></div>
                      <div
                        className="h-2 w-2 bg-blue-400 dark:bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-blue-400 dark:bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-gray-50 dark:bg-[#242a38]">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 bg-white dark:bg-[#1a1f2a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      ) : (
        <Button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 border-2 border-white dark:border-white"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}