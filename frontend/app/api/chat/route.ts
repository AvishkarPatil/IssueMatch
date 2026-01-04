import { GoogleGenAI } from "@google/genai"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.GOOGLE_AI_API_KEY
    const model = process.env.GOOGLE_AI_MODEL || "gemini-2.0-flash-lite"

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const googleMessages = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }))

    const config = {
      responseMimeType: "text/plain",
      systemInstruction: [
        {
          text: `You are IssueMatch AI, a helpful assistant that helps users solve coding issues and contribute to projects.

Important rules to follow:
1. Keep your responses concise and under 500 characters.
2. Focus on providing practical solutions to coding problems.
3. Be friendly and supportive.
4. If you don't know something, admit it rather than making up information.
5. You also help in coding-related tasks like code reviews writing tests, and improving code quality.`,
        },
      ],
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model,
            config,
            contents: googleMessages,
          })

          for await (const chunk of response) {
            if (chunk.text) {
              const encoder = new TextEncoder()
              controller.enqueue(encoder.encode(chunk.text))
            }
          }
          controller.close()
        } catch (error: any) {
          console.error("Error in streaming response:", error)
          const encoder = new TextEncoder()
          let errorMessage = "Sorry, I encountered an error. Please try again."

          if (error?.message?.includes("429") || error?.message?.includes("Too Many Requests")) {
            errorMessage = "Rate limit exceeded. Please wait a moment and try again."
          } else if (error?.message?.includes("403") || error?.message?.includes("Forbidden")) {
            errorMessage = "API key issue. Please contact support."
          }

          controller.enqueue(encoder.encode(errorMessage))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Error processing your request" }, { status: 500 })
  }
}
