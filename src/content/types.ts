export type EventCategory =
  | 'health'
  | 'exercise'
  | 'family'
  | 'leisure'
  | 'rest'
  | 'work'
  | 'learning'
  | 'meeting'
  | 'social'
  | 'misc'

export type EventRow = 'primary' | 'secondary'

// Inherent properties of any event — independent of architecture
export type EventCore = {
  title: string
  category: EventCategory
  duration: number
}

// --- Templates (live in EventLibrary) ---

export type FlexibleTemplate = EventCore & {
  id: string
  flexible: true
  startTime?: number
}

export type InflexibleTemplate = EventCore & {
  id: string
  flexible: false
  startTime: number
  repeatDays?: number[]
  repeatRow?: EventRow
}

export type EventTemplate = FlexibleTemplate | InflexibleTemplate

// --- Placed events (live on the timetable grid) ---

export type CalendarEvent = EventCore & {
  id: string
  templateId?: string
  day: number
  startTime: number
  row: EventRow
  flexible: boolean
}
