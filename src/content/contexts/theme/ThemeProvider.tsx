import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from './context'

type Props = { children: ReactNode }

// Holds the dark/light state and reflects it onto document.body. Putting the
// `dark` class on body means every element in the page — including portal-
// rendered content (MUI Popover, Menu, Dialog) — descends from a `.dark`
// ancestor and picks up the `dark` Tailwind variant automatically. No per-
// component wiring required at usage sites.
export default function ThemeProvider({ children }: Props) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('dark', isDark)
    return () => {
      document.body.classList.remove('dark')
    }
  }, [isDark])

  const toggle = useCallback(() => setIsDark((d) => !d), [])

  return <ThemeContext.Provider value={{ isDark, toggle }}>{children}</ThemeContext.Provider>
}
