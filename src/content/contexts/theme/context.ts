import { createContext } from 'react'

export type ThemeContextProps = {
  isDark: boolean
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextProps>(null!)
