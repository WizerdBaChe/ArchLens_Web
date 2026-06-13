/**
 * ThemeContext.tsx
 * 放置路徑：src/ThemeContext.tsx
 *
 * 全域主題狀態
 * 'hacker'  = 開發者硬核風（預設）
 * 'default' = 原版 light 設計
 */

import { createContext, useContext, useState } from 'react'

export type Theme = 'hacker' | 'default'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'default',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default')
  const toggleTheme = () =>
    setTheme(prev => (prev === 'hacker' ? 'default' : 'hacker'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
