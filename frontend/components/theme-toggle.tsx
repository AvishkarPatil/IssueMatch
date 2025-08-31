"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import * as Popover from "@radix-ui/react-popover"


export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-full shadow-sm dark:shadow-none"
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const getActiveIcon = () => {
    if (theme === "system") return <Monitor className="h-4 w-4" />
    if (theme === "dark") return <Moon className="h-4 w-4" />
    return <Sun className="h-4 w-4" />
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-accent hover:text-foreground transition-colors shadow-sm dark:shadow-none border border-gray-200 dark:border-border"
          title="Select theme"
        >
          {getActiveIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
  sideOffset={8}
  className="flex gap-1 px-2 py-1 rounded-full z-[100] shadow-lg"
  style={{
    backgroundColor: theme === "dark" ? "#23272f" : "#3a3a3a",
    zIndex: 100,
  }}
>
  <Button
    variant="ghost"
    size="icon"
    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
      focus:outline-none focus:ring-0 active:bg-transparent
      ${theme === "system" ? "bg-gray-700 dark:bg-gray-700" : ""}
      hover:bg-gray-600 dark:hover:bg-gray-700
    `}
    onClick={() => setTheme("system")}
    title="System"
  >
    <Monitor
      className={`h-6 w-6 transition-colors
        ${theme === "system" ? "text-white" : "text-gray-300"}
        hover:text-yellow-400
      `}
    />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
      focus:outline-none focus:ring-0 active:bg-transparent
      ${theme === "light" ? "bg-gray-700 dark:bg-gray-700" : ""}
      hover:bg-gray-600 dark:hover:bg-gray-700
    `}
    onClick={() => setTheme("light")}
    title="Light"
  >
    <Sun
      className={`h-6 w-6 transition-colors
        ${theme === "light" ? "text-white" : "text-gray-300"}
        hover:text-yellow-400
      `}
    />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
      focus:outline-none focus:ring-0 active:bg-transparent
      ${theme === "dark" ? "bg-gray-700 dark:bg-gray-700" : ""}
      hover:bg-gray-600 dark:hover:bg-gray-700
    `}
    onClick={() => setTheme("dark")}
    title="Dark"
  >
    <Moon
      className={`h-6 w-6 transition-colors
        ${theme === "dark" ? "text-white" : "text-gray-300"}
        hover:text-yellow-400
      `}
    />
  </Button>
</Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}