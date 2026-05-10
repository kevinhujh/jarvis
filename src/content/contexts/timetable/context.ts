import { createContext } from 'react'
import type { CalendarEvent, EventTemplate, EventRow } from '../../types'

export type DragSource =
  | { kind: 'template'; templateId: string }
  | { kind: 'event'; eventId: string }

export type GuideMode = 'hover' | 'drag'

export type GuideState = {
  startTime: number
  endTime: number
  mode: GuideMode
}

export type TimetableContextProps = {
  selectedWeekChart: string
  setSelectedWeekChart: (id: string) => void
  selectedDayChart: string
  setSelectedDayChart: (id: string) => void
  events: CalendarEvent[]
  templates: EventTemplate[]
  addTemplate: (template: Omit<EventTemplate, 'id'>) => void
  tryPlace: (source: DragSource, day: number, row: EventRow, startTime: number) => boolean
  tryResize: (eventId: string, newDuration: number) => boolean
  dragSource: DragSource | null
  startDrag: (source: DragSource) => void
  endDrag: () => void
  scrollToTime: (time: number) => void
  registerScrollToTime: (fn: (time: number) => void) => void
  guides: GuideState | null
  setGuides: (guides: GuideState | null) => void
}

export const TimetableContext = createContext<TimetableContextProps>(null!)
