import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import clsx from 'clsx'
import { HOUR_WIDTH, SNAPS_PER_HOUR, MIN_EVENT_DURATION_MINUTES, TOTAL_HOURS } from './constants'
import type { CalendarEvent } from '../../types'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import EventBrick from './EventBrick'
import EventLabel from './EventLabel'
import { spawnDragGhost } from './dndUtils'
import { formatDuration } from '../../utils/time'

const MIN_DURATION = MIN_EVENT_DURATION_MINUTES / 60

type Props = {
  event: CalendarEvent
  scrollLeft: number
}

export default function EventItem({ event, scrollLeft }: Props) {
  const { dragSource, startDrag, endDrag, tryResize, setGuides } = useTimetableContext()
  const [previewDuration, setPreviewDuration] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const startRef = useRef<{ x: number; duration: number } | null>(null)

  const effectiveDuration = previewDuration ?? event.duration
  const effectiveEvent =
    previewDuration !== null ? { ...event, duration: previewDuration } : event

  const left = event.startTime * HOUR_WIDTH
  const brickWidth = effectiveDuration * HOUR_WIDTH
  const isResizing = previewDuration !== null

  useEffect(() => {
    if (dragSource !== null) return
    if (!isHovered) return
    setGuides({
      startTime: event.startTime,
      endTime: event.startTime + effectiveDuration,
      mode: isResizing ? 'drag' : 'hover',
    })
  }, [isHovered, isResizing, dragSource, event.startTime, effectiveDuration, setGuides])

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      startRef.current = { x: e.clientX, duration: event.duration }
      setPreviewDuration(event.duration)
    },
    [event.duration]
  )

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!startRef.current) return
      const deltaX = e.clientX - startRef.current.x
      const rawDuration = startRef.current.duration + deltaX / HOUR_WIDTH
      const snapped = Math.round(rawDuration * SNAPS_PER_HOUR) / SNAPS_PER_HOUR
      const maxDuration = TOTAL_HOURS - event.startTime
      const clamped = Math.max(MIN_DURATION, Math.min(maxDuration, snapped))
      setPreviewDuration(clamped)
    },
    [event.startTime]
  )

  const handleResizePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      const next = previewDuration
      setPreviewDuration(null)
      startRef.current = null
      if (next !== null && next !== event.duration) {
        tryResize(event.id, next)
      }
    },
    [previewDuration, event.id, event.duration, tryResize]
  )

  const resizeHandlers = useMemo(
    () =>
      event.flexible
        ? {
            onPointerDown: handleResizePointerDown,
            onPointerMove: handleResizePointerMove,
            onPointerUp: handleResizePointerUp,
          }
        : undefined,
    [event.flexible, handleResizePointerDown, handleResizePointerMove, handleResizePointerUp]
  )

  return (
    <div
      draggable={event.flexible && !isResizing}
      onDragStart={
        event.flexible
          ? (e) => {
              e.dataTransfer.setData('text/plain', event.id)
              const subtitle = formatDuration(event.duration)
              const ghost = spawnDragGhost({
                title: event.title,
                subtitle,
                category: event.category,
              })
              e.dataTransfer.setDragImage(ghost, 20, 20)
              startDrag({ kind: 'event', eventId: event.id })
            }
          : undefined
      }
      onDragEnd={event.flexible ? endDrag : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        if (dragSource === null) setGuides(null)
      }}
      className={clsx(
        'group absolute inset-y-0 flex flex-col py-1 gap-1 hover:z-20',
        event.flexible && !isResizing && 'cursor-grab active:cursor-grabbing',
        dragSource !== null && 'pointer-events-none'
      )}
      style={{ left, width: Math.max(brickWidth, 4) }}
    >
      <EventLabel event={effectiveEvent} scrollLeft={scrollLeft} />
      <EventBrick event={effectiveEvent} resizeHandlers={resizeHandlers} />
    </div>
  )
}
