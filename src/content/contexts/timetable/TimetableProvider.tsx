import { useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { TimetableContext } from './context'
import type { DragSource } from './context'
import type { CalendarEvent, EventRow } from '../../types'
import { mockEvents } from '../../modules/weektimetable/mockData'
import { mockTemplates } from '../../modules/weektimetable/mockTemplates'

type Props = { children: ReactNode }

export default function TimetableProvider({ children }: Props) {
  const [selectedWeekChart, setSelectedWeekChart] = useState('week-density')
  const [selectedDayChart, setSelectedDayChart] = useState('day-allocation')
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const templates = mockTemplates

  const scrollFnRef = useRef<((time: number) => void) | null>(null)
  const registerScrollToTime = useCallback((fn: (time: number) => void) => {
    scrollFnRef.current = fn
  }, [])
  const scrollToTime = useCallback((time: number) => {
    scrollFnRef.current?.(time)
  }, [])

  // Defer the state update so Chrome establishes the drag before any DOM
  // mutations — applying pointer-events or size changes synchronously during
  // dragstart causes Chrome to cancel or corrupt the drag.
  const startDrag = useCallback((source: DragSource) => {
    requestAnimationFrame(() => setDragSource(source))
  }, [])

  const endDrag = useCallback(() => {
    setDragSource(null)
  }, [])

  const tryPlace = useCallback(
    (source: DragSource, day: number, row: EventRow, startTime: number) => {
      if (source.kind === 'template') {
        const template = templates.find((t) => t.id === source.templateId)
        if (!template) return
        const finalStart = template.flexible ? startTime : template.startTime
        const newEvent: CalendarEvent = {
          id: crypto.randomUUID(),
          templateId: source.templateId,
          day,
          startTime: finalStart,
          duration: template.duration,
          title: template.title,
          category: template.category,
          row,
          flexible: template.flexible,
        }
        setEvents((prev) => [...prev, newEvent])
        return
      }
      setEvents((prev) =>
        prev.map((e) => (e.id === source.eventId ? { ...e, day, row, startTime } : e))
      )
    },
    [templates]
  )

  return (
    <TimetableContext.Provider
      value={{
        selectedWeekChart, setSelectedWeekChart,
        selectedDayChart, setSelectedDayChart,
        events,
        templates,
        tryPlace,
        dragSource,
        startDrag,
        endDrag,
        scrollToTime,
        registerScrollToTime,
      }}
    >
      {children}
    </TimetableContext.Provider>
  )
}
