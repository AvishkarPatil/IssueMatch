import { GoogleGenAI } from "@google/genai"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Initialize Google GenAI with API key
    const ai = new GoogleGenAI({
      apiKey: "AIzaSyCSNgHQVtpGkihGV0S-nZTIVNfp7R6mQZs",
    })

    // Convert our messages to Google GenAI format
    const googleMessages = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }))

    // Configuration for the model
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

    // Use the specified model
    const model = "gemini-2.0-flash-lite"

    // Create a new ReadableStream to stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate content stream from Google GenAI
          const response = await ai.models.generateContentStream({
            model,
            config,
            contents: googleMessages,
          })

          // Process each chunk from the stream
          for await (const chunk of response) {
            if (chunk.text) {
              // Encode the text chunk and send it to the client
              const encoder = new TextEncoder()
              controller.enqueue(encoder.encode(chunk.text))
            }
          }
          controller.close()
        } catch (error) {
          console.error("Error in streaming response:", error)
          controller.error(error)
        }
      },
    })

    // Return the stream as a response
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
