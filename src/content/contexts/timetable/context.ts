import { createContext } from 'react'
import type { CalendarEvent, EventTemplate, EventRow } from '../../types'

export type DragSource =
  | { kind: 'template'; templateId: string }
  | { kind: 'event'; eventId: string }

export type TimetableContextProps = {
  selectedWeekChart: string
  setSelectedWeekChart: (id: string) => void
  selectedDayChart: string
  setSelectedDayChart: (id: string) => void
  events: CalendarEvent[]
  templates: EventTemplate[]
  tryPlace: (source: DragSource, day: number, row: EventRow, startTime: number) => boolean
  tryResize: (eventId: string, newDuration: number) => boolean
  dragSource: DragSource | null
  startDrag: (source: DragSource) => void
  endDrag: () => void
  scrollToTime: (time: number) => void
  registerScrollToTime: (fn: (time: number) => void) => void
}

export const TimetableContext = createContext<TimetableContextProps>(null!)
