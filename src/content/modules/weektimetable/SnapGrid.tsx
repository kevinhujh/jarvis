import { useState, useCallback } from 'react'
import clsx from 'clsx'
import { SNAP_WIDTH, SNAPS_PER_HOUR, HOUR_WIDTH } from './constants'
import type { EventRow } from '../../types'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import { findConflicts } from './dndUtils'

type Props = {
  day: number
  row: EventRow
}

function xToCell(clientX: number, el: HTMLElement): number {
  return Math.floor((clientX - el.getBoundingClientRect().left) / SNAP_WIDTH)
}

function conflictClass(conflicts: { flexible: boolean }[]): string {
  if (conflicts.some((e) => !e.flexible)) return 'bg-red'
  if (conflicts.length > 0) return 'bg-yellow'
  return 'bg-green'
}

export default function SnapGrid({ day, row }: Props) {
  const { templates, events, dragSource, tryPlace, endDrag } = useTimetableContext()
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)

  const draggingTemplate =
    dragSource?.kind === 'template'
      ? (templates.find((t) => t.id === dragSource.templateId) ?? null)
      : null
  const draggingEvent =
    dragSource?.kind === 'event'
      ? (events.find((e) => e.id === dragSource.eventId) ?? null)
      : null
  const isDraggingInflexibleTemplate = draggingTemplate !== null && !draggingTemplate.flexible

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
      tryPlace(dragSource, day, row, cell / SNAPS_PER_HOUR)
      endDrag()
      setHoveredCell(null)
    },
    [dragSource, tryPlace, endDrag, day, row]
  )

  // Compute highlight
  let highlight: React.ReactNode = null

  if (draggingTemplate && !draggingTemplate.flexible) {
    const conflicts = findConflicts(
      events,
      day,
      row,
      draggingTemplate.startTime,
      draggingTemplate.duration
    )
    highlight = (
      <div
        className={clsx('absolute inset-y-0 opacity-40 pointer-events-none', conflictClass(conflicts))}
        style={{
          left: draggingTemplate.startTime * HOUR_WIDTH,
          width: draggingTemplate.duration * HOUR_WIDTH,
        }}
      />
    )
  } else if (draggingEvent && hoveredCell !== null) {
    const startTime = hoveredCell / SNAPS_PER_HOUR
    const conflicts = findConflicts(events, day, row, startTime, draggingEvent.duration).filter(
      (e) => e.id !== draggingEvent.id
    )
    highlight = (
      <div
        className={clsx('absolute inset-y-0 opacity-40 pointer-events-none', conflictClass(conflicts))}
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
      className="absolute inset-0"
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
