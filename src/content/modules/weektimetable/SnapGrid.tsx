import { useState, useCallback, useEffect } from 'react'
import clsx from 'clsx'
import { SNAP_WIDTH, SNAPS_PER_HOUR, HOUR_WIDTH } from './constants'
import type { EventRow } from '../../types'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import { computeCascade } from './dndUtils'
import type { CascadeResult } from './dndUtils'

type Props = {
  day: number
  row: EventRow
}

function xToCell(clientX: number, el: HTMLElement): number {
  return Math.floor((clientX - el.getBoundingClientRect().left) / SNAP_WIDTH)
}

function cascadeClass(cascade: CascadeResult): string {
  if (!cascade.success) return 'bg-red'
  if (cascade.moves.size > 0) return 'bg-yellow'
  return 'bg-green'
}

export default function SnapGrid({ day, row }: Props) {
  const { templates, events, dragSource, tryPlace, endDrag, setGuides } = useTimetableContext()
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)
  const [isShaking, setIsShaking] = useState(false)

  const draggingTemplate =
    dragSource?.kind === 'template'
      ? (templates.find((t) => t.id === dragSource.templateId) ?? null)
      : null
  const draggingEvent =
    dragSource?.kind === 'event'
      ? (events.find((e) => e.id === dragSource.eventId) ?? null)
      : null
  const isDraggingInflexibleTemplate = draggingTemplate !== null && !draggingTemplate.flexible

  const triggerShake = useCallback(() => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 400)
  }, [])

  useEffect(() => {
    if (!dragSource) return

    let startTime: number
    let duration: number

    if (draggingTemplate && !draggingTemplate.flexible) {
      startTime = draggingTemplate.startTime
      duration = draggingTemplate.duration
    } else if (draggingTemplate?.flexible && hoveredCell !== null) {
      startTime = hoveredCell / SNAPS_PER_HOUR
      duration = draggingTemplate.duration
    } else if (draggingEvent && hoveredCell !== null) {
      startTime = hoveredCell / SNAPS_PER_HOUR
      duration = draggingEvent.duration
    } else {
      return
    }

    setGuides({ startTime, endTime: startTime + duration, mode: 'drag' })
  }, [dragSource, draggingTemplate, draggingEvent, hoveredCell, setGuides])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredCell(xToCell(e.clientX, e.currentTarget))
  }, [])

  const handleClearHover = useCallback(() => setHoveredCell(null), [])

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (!isDraggingInflexibleTemplate) setHoveredCell(xToCell(e.clientX, e.currentTarget))
    },
    [isDraggingInflexibleTemplate]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!dragSource) return
      const cell = xToCell(e.clientX, e.currentTarget)
      const ok = tryPlace(dragSource, day, row, cell / SNAPS_PER_HOUR)
      if (!ok) triggerShake()
      endDrag()
      setHoveredCell(null)
    },
    [dragSource, tryPlace, endDrag, triggerShake, day, row]
  )

  // Compute highlight
  let highlight: React.ReactNode = null

  if (draggingTemplate && !draggingTemplate.flexible) {
    const cascade = computeCascade(
      events,
      day,
      row,
      draggingTemplate.startTime,
      draggingTemplate.duration
    )
    highlight = (
      <div
        className={clsx('absolute inset-y-0 opacity-40 pointer-events-none', cascadeClass(cascade))}
        style={{
          left: draggingTemplate.startTime * HOUR_WIDTH,
          width: draggingTemplate.duration * HOUR_WIDTH,
        }}
      />
    )
  } else if (draggingTemplate?.flexible && hoveredCell !== null) {
    const startTime = hoveredCell / SNAPS_PER_HOUR
    const cascade = computeCascade(events, day, row, startTime, draggingTemplate.duration)
    highlight = (
      <div
        className={clsx('absolute inset-y-0 opacity-40 pointer-events-none', cascadeClass(cascade))}
        style={{
          left: hoveredCell * SNAP_WIDTH,
          width: draggingTemplate.duration * HOUR_WIDTH,
        }}
      />
    )
  } else if (draggingEvent && hoveredCell !== null) {
    const startTime = hoveredCell / SNAPS_PER_HOUR
    const cascade = computeCascade(
      events,
      day,
      row,
      startTime,
      draggingEvent.duration,
      draggingEvent.id
    )
    highlight = (
      <div
        className={clsx('absolute inset-y-0 opacity-40 pointer-events-none', cascadeClass(cascade))}
        style={{
          left: hoveredCell * SNAP_WIDTH,
          width: draggingEvent.duration * HOUR_WIDTH,
        }}
      />
    )
  } else if (hoveredCell !== null) {
    highlight = (
      <div
        className="absolute inset-y-0 bg-brand-primary/15 pointer-events-none"
        style={{ left: hoveredCell * SNAP_WIDTH, width: SNAP_WIDTH }}
      />
    )
  }

  return (
    <div
      className={clsx('absolute inset-0', isShaking && 'animate-shake bg-red/20')}
      onMouseMove={isDraggingInflexibleTemplate ? undefined : handleMouseMove}
      onMouseLeave={handleClearHover}
      onDragOver={handleDragOver}
      onDragLeave={handleClearHover}
      onDrop={handleDrop}
    >
      {highlight}
    </div>
  )
}
