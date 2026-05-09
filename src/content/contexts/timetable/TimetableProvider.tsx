import { useState } from 'react'
import type { ReactNode } from 'react'
import { TimetableContext } from './context'

type Props = { children: ReactNode }

export default function TimetableProvider({ children }: Props) {
  const [selectedWeekChart, setSelectedWeekChart] = useState('week-density')
  const [selectedDayChart, setSelectedDayChart] = useState('day-allocation')

  return (
    <TimetableContext.Provider
      value={{ selectedWeekChart, setSelectedWeekChart, selectedDayChart, setSelectedDayChart }}
    >
      {children}
    </TimetableContext.Provider>
  )
}
