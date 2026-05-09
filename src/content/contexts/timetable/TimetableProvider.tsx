import { useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { TimetableContext } from './context'
import type { DragSource, GuideState } from './context'
import type { CalendarEvent, EventRow } from '../../types'
import { mockEvents } from '../../modules/weektimetable/mockData'
import { mockTemplates } from '../../modules/weektimetable/mockTemplates'
import { computeCascade } from '../../modules/weektimetable/dndUtils'

type Props = { children: ReactNode }

export default function TimetableProvider({ children }: Props) {
  const [selectedWeekChart, setSelectedWeekChart] = useState('week-density')
  const [selectedDayChart, setSelectedDayChart] = useState('day-allocation')
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const [guides, setGuides] = useState<GuideState | null>(null)
  const templates = mockTemplates

  // Ref keeps tryPlace reading fresh event state without listing events as a dep
  const eventsRef = useRef(events)
  eventsRef.current = events

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
    setGuides(null)
  }, [])

  const tryPlace = useCallback(
    (source: DragSource, day: number, row: EventRow, startTime: number): boolean => {
      if (source.kind === 'template') {
        const template = templates.find((t) => t.id === source.templateId)
        if (!template) return false

        const actualStart = template.flexible ? startTime : template.startTime
        const cascade = computeCascade(
          eventsRef.current,
          day,
          row,
          actualStart,
          template.duration
        )
        if (!cascade.success) return false

        const newEvent: CalendarEvent = {
          id: crypto.randomUUID(),
          templateId: source.templateId,
          day,
          startTime: actualStart,
          duration: template.duration,
          title: template.title,
          category: template.category,
          row,
          flexible: template.flexible,
        }

        setEvents((prev) => {
          const updated = prev.map((e) =>
            cascade.moves.has(e.id) ? { ...e, startTime: cascade.moves.get(e.id)! } : e
          )
          return [...updated, newEvent]
        })

        return true
      }

      const moving = eventsRef.current.find((e) => e.id === source.eventId)
      if (!moving) return false

      const cascade = computeCascade(
        eventsRef.current,
        day,
        row,
        startTime,
        moving.duration,
        source.eventId
      )
      if (!cascade.success) return false

      setEvents((prev) =>
        prev.map((e) => {
          if (e.id === source.eventId) return { ...e, day, row, startTime }
          if (cascade.moves.has(e.id)) return { ...e, startTime: cascade.moves.get(e.id)! }
          return e
        })
      )

      return true
    },
    [templates]
  )

  const tryResize = useCallback((eventId: string, newDuration: number): boolean => {
    const target = eventsRef.current.find((e) => e.id === eventId)
    if (!target) return false
    if (newDuration <= 0) return false

    const cascade = computeCascade(
      eventsRef.current,
      target.day,
      target.row,
      target.startTime,
      newDuration,
      eventId
    )
    if (!cascade.success) return false

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) return { ...e, duration: newDuration }
        if (cascade.moves.has(e.id)) return { ...e, startTime: cascade.moves.get(e.id)! }
        return e
      })
    )

    return true
  }, [])

  return (
    <TimetableContext.Provider
      value={{
        selectedWeekChart, setSelectedWeekChart,
        selectedDayChart, setSelectedDayChart,
        events,
        templates,
        tryPlace,
        tryResize,
        dragSource,
        startDrag,
        endDrag,
        scrollToTime,
        registerScrollToTime,
        guides,
        setGuides,
      }}
    >
      {children}
    </TimetableContext.Provider>
  )
}
