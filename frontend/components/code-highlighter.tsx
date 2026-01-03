"use client"

import { useMemo } from "react"

type TokenType = "keyword" | "string" | "number" | "function" | "class" | "comment" | "text"

interface Token {
  type: TokenType
  value: string
}

const KEYWORDS = new Set([
  "const", "let", "var", "await", "async", "return", "if", "else", "for", "while",
  "function", "class", "new", "import", "export", "from", "default"
])

function tokenize(code: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < code.length) {
    // Skip whitespace
    if (/\s/.test(code[i])) {
      let ws = ""
      while (i < code.length && /\s/.test(code[i])) {
        ws += code[i++]
      }
      tokens.push({ type: "text", value: ws })
      continue
    }

    // Comments
    if (code[i] === "/" && code[i + 1] === "/") {
      let comment = ""
      while (i < code.length && code[i] !== "\n") {
        comment += code[i++]
      }
      tokens.push({ type: "comment", value: comment })
      continue
    }

    // Strings
    if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
      const quote = code[i]
      let str = quote
      i++
      while (i < code.length && code[i] !== quote) {
        if (code[i] === "\\") {
          str += code[i++]
          if (i < code.length) str += code[i++]
        } else {
          str += code[i++]
        }
      }
      if (i < code.length) str += code[i++]
      tokens.push({ type: "string", value: str })
      continue
    }

    // Numbers
    if (/\d/.test(code[i])) {
      let num = ""
      while (i < code.length && /[\d.]/.test(code[i])) {
        num += code[i++]
      }
      tokens.push({ type: "number", value: num })
      continue
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(code[i])) {
      let word = ""
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
        word += code[i++]
      }

      // Check if next char is '(' for function calls
      let j = i
      while (j < code.length && /\s/.test(code[j])) j++
      
      if (KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", value: word })
      } else if (code[j] === "(") {
        tokens.push({ type: "function", value: word })
      } else if (/^[A-Z]/.test(word)) {
        tokens.push({ type: "class", value: word })
      } else {
        tokens.push({ type: "text", value: word })
      }
      continue
    }

    // Everything else
    tokens.push({ type: "text", value: code[i++] })
  }

  return tokens
}

const colorMap: Record<TokenType, string> = {
  keyword: "text-purple-400",
  string: "text-green-400",
  number: "text-orange-400",
  function: "text-blue-400",
  class: "text-yellow-400",
  comment: "text-gray-500",
  text: "text-gray-300"
}

interface CodeHighlighterProps {
  code: string
  className?: string
}

export default function CodeHighlighter({ code, className = "" }: CodeHighlighterProps) {
  const tokens = useMemo(() => tokenize(code), [code])

  return (
    <pre className={`font-mono text-sm ${className}`}>
      <code>
        {tokens.map((token, i) => (
          <span key={i} className={colorMap[token.type]}>
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  )
}
