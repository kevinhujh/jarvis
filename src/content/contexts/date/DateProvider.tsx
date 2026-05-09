import { useState } from 'react'
import type { ReactNode } from 'react'
import { DateContext } from './context'
import { getWeekStart } from '../../modules/weektimetable/utils'

interface Props {
  children: ReactNode
}

export default function DateProvider({ children }: Props) {
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => getWeekStart(new Date()))

  return (
    <DateContext.Provider value={{ selectedWeekStart, setSelectedWeekStart }}>
      {children}
    </DateContext.Provider>
  )
}
