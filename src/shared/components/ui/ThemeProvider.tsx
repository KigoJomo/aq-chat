// components/ThemeProvider.tsx
'use client'

import { useThemeStore } from '@/store/ThemeStore';
import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme)
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <>{children}</>
}