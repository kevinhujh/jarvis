import { createContext } from 'react'
import type { CalendarEvent, EventCategory, EventTemplate, EventRow } from '../../types'

export type DragSource =
  | { kind: 'template'; templateId: string }
  | { kind: 'event'; eventId: string }

export type GuideMode = 'hover' | 'drag'

export type GuideState = {
  startTime: number
  endTime: number
  mode: GuideMode
}

export type EventMetaPatch = {
  title?: string
  category?: EventCategory
  flexible?: boolean
}

export type EventGeometryPatch = {
  day?: number
  row?: EventRow
  startTime?: number
  duration?: number
}

export type EditingEventState = {
  id: string
  anchor: { x: number; y: number }
}

export type TemplatePanelState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; id: string }

export type TemplatePatch = Omit<EventTemplate, 'id' | 'createdAt'>

export type TimetableContextProps = {
  selectedWeekChart: string
  setSelectedWeekChart: (id: string) => void
  selectedDayChart: string
  setSelectedDayChart: (id: string) => void
  events: CalendarEvent[]
  templates: EventTemplate[]
  addTemplate: (template: TemplatePatch) => void
  updateTemplate: (id: string, patch: TemplatePatch) => void
  removeTemplate: (id: string) => void
  templatePanel: TemplatePanelState
  openTemplateCreate: () => void
  openTemplateEdit: (id: string) => void
  closeTemplatePanel: () => void
  tryPlace: (source: DragSource, day: number, row: EventRow, startTime: number) => boolean
  tryResize: (eventId: string, newDuration: number) => boolean
  removeEvent: (id: string) => void
  updateEventMeta: (id: string, patch: EventMetaPatch) => void
  tryRelocateEvent: (id: string, patch: EventGeometryPatch) => boolean
  editingEvent: EditingEventState | null
  openEventEditor: (id: string, anchor: { x: number; y: number }) => void
  closeEventEditor: () => void
  dragSource: DragSource | null
  startDrag: (source: DragSource) => void
  endDrag: () => void
  scrollToTime: (time: number) => void
  registerScrollToTime: (fn: (time: number) => void) => void
  guides: GuideState | null
  setGuides: (guides: GuideState | null) => void
}

export const TimetableContext = createContext<TimetableContextProps>(null!)
