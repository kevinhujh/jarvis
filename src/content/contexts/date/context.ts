import { createContext } from 'react'

export type DateContextProps = {
  selectedWeekStart: Date
  setSelectedWeekStart: (weekStart: Date) => void
}

export const DateContext = createContext<DateContextProps>(null!)
