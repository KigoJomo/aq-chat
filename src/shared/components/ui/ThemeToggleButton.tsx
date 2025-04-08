'use client'

import { useThemeStore } from "@/store/ThemeStore";


const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useThemeStore()
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  )
}

const DisplayTheme = () => {
  const theme = useThemeStore((state) => state.theme)
  
  return <div>Current theme: {theme}</div>
}