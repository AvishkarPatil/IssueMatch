"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Minimize2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

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
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[380px] h-[600px] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#161b22] backdrop-blur-sm">
          <div className="bg-gradient-to-r from-[#e88951] to-[#f59e6c] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">IssueMatch AI</div>
                <div className="text-xs text-white/80">Always here to help</div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={minimizeChat} className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-lg">
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0d1117]">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <div
                      className={`h-full w-full flex items-center justify-center text-xs font-semibold ${
                        message.role === "user" ? "bg-[#e88951] text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {message.role === "user" ? "You" : "AI"}
                    </div>
                  </Avatar>
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      message.role === "user" 
                        ? "bg-[#e88951] text-white rounded-br-sm" 
                        : "bg-white dark:bg-[#161b22] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-gray-800 prose-code:text-[#e88951] prose-code:bg-gray-100 dark:prose-code:bg-[#0d1117] prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && !messages.some((msg) => msg.id === "assistant-typing") && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[85%]">
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold">AI</div>
                  </Avatar>
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800">
                    <div className="flex space-x-1.5">
                      <div className="h-2 w-2 bg-[#e88951] rounded-full animate-bounce"></div>
                      <div
                        className="h-2 w-2 bg-[#e88951] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-[#e88951] rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2 bg-white dark:bg-[#161b22]">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-50 dark:bg-[#0d1117] border-gray-300 dark:border-gray-800 rounded-full px-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#e88951]"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="bg-[#e88951] hover:bg-[#d67840] rounded-full h-10 w-10 shadow-lg disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      ) : (
        <Button
          onClick={toggleChat}
          className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-[#e88951] to-[#f59e6c] hover:from-[#d67840] hover:to-[#e88951] border-4 border-white dark:border-gray-900 transition-all hover:scale-110 group"
        >
          <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
        </Button>
      )}
    </div>
  )
}