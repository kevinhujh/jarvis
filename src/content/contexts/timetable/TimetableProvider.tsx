import { useState, useCallback, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { TimetableContext } from './context'
import type {
  DragSource,
  GuideState,
  EditingEventState,
  EventMetaPatch,
  EventGeometryPatch,
} from './context'
import type { CalendarEvent, EventRow, EventTemplate } from '../../types'
import { mockEvents } from '../../modules/weektimetable/mockData'
import { mockTemplates } from '../../modules/weektimetable/mockTemplates'
import { computeCascade } from '../../modules/weektimetable/dndUtils'

type Props = { children: ReactNode }

export default function TimetableProvider({ children }: Props) {
  const [selectedWeekChart, setSelectedWeekChart] = useState('week-density')
  const [selectedDayChart, setSelectedDayChart] = useState('day-allocation')
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)
  const [templates, setTemplates] = useState<EventTemplate[]>(mockTemplates)
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const [guides, setGuides] = useState<GuideState | null>(null)
  const [editingEvent, setEditingEvent] = useState<EditingEventState | null>(null)

  // Ref keeps tryPlace / tryResize / tryRelocateEvent reading fresh event
  // state without listing events as a dep. Update is deferred to a post-render
  // effect so we don't mutate a ref during render — the consumers are user-
  // event handlers (drag/drop, click, contextmenu) that fire well after the
  // commit phase, so the one-microtask delay is invisible to them.
  const eventsRef = useRef(events)
  useEffect(() => {
    eventsRef.current = events
  }, [events])

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

  const addTemplate = useCallback((template: Omit<EventTemplate, 'id'>) => {
    const withId = { ...template, id: crypto.randomUUID() } as EventTemplate
    setTemplates((prev) => [...prev, withId])
  }, [])

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

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setEditingEvent((prev) => (prev?.id === id ? null : prev))
  }, [])

  const updateEventMeta = useCallback((id: string, patch: EventMetaPatch) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }, [])

  const tryRelocateEvent = useCallback((id: string, patch: EventGeometryPatch): boolean => {
    const target = eventsRef.current.find((e) => e.id === id)
    if (!target) return false

    const day = patch.day ?? target.day
    const row = patch.row ?? target.row
    const startTime = patch.startTime ?? target.startTime
    const duration = patch.duration ?? target.duration

    if (duration <= 0) return false

    const cascade = computeCascade(eventsRef.current, day, row, startTime, duration, id)
    if (!cascade.success) return false

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) return { ...e, day, row, startTime, duration }
        if (cascade.moves.has(e.id)) return { ...e, startTime: cascade.moves.get(e.id)! }
        return e
      })
    )

    return true
  }, [])

  const openEventEditor = useCallback((id: string, anchor: { x: number; y: number }) => {
    setEditingEvent({ id, anchor })
  }, [])

  const closeEventEditor = useCallback(() => {
    setEditingEvent(null)
  }, [])

  return (
    <TimetableContext.Provider
      value={{
        selectedWeekChart, setSelectedWeekChart,
        selectedDayChart, setSelectedDayChart,
        events,
        templates,
        addTemplate,
        tryPlace,
        tryResize,
        removeEvent,
        updateEventMeta,
        tryRelocateEvent,
        editingEvent,
        openEventEditor,
        closeEventEditor,
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
