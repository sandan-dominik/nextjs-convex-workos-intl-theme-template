"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const currentTheme = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(currentTheme.theme === "light" ? "dark" : "light")} className="cursor-pointer">
          <Sun className="w-[1.2rem] h-[1.2rem] rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all" />
          <Moon className="absolute w-[1.2rem] h-[1.2rem] rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
  )
}
