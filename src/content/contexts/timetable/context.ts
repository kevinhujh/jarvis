import { createContext } from 'react'

export type TimetableContextProps = {
  selectedWeekChart: string
  setSelectedWeekChart: (id: string) => void
  selectedDayChart: string
  setSelectedDayChart: (id: string) => void
}

export const TimetableContext = createContext<TimetableContextProps>(null!)
