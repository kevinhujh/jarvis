import { useRef, useEffect, useState } from 'react'
import clsx from 'clsx'
import { HOUR_WIDTH, SHORT_THRESHOLD } from './constants'
import type { CalendarEvent } from '../../types'

interface Props {
  event: CalendarEvent
  scrollLeft: number
}

export default function EventLabel({ event, scrollLeft }: Props) {
  const labelRef = useRef<HTMLDivElement>(null)
  const [labelWidth, setLabelWidth] = useState(0)

  const brickLeft = event.startTime * HOUR_WIDTH
  const brickWidth = event.duration * HOUR_WIDTH
  const isShort = event.duration < SHORT_THRESHOLD

  useEffect(() => {
    if (labelRef.current) setLabelWidth(labelRef.current.offsetWidth)
  }, [event.title])

  const offsetX = isShort
    ? 0
    : Math.min(Math.max(0, scrollLeft - brickLeft), Math.max(0, brickWidth - labelWidth))

  return (
    <div
      ref={labelRef}
      data-testid={`event-label-${event.id}`}
      className={clsx(
        'flex items-center self-start bg-brand-secondary/70 px-1 rounded-md text-small font-medium text-white',
        !isShort && 'max-w-full'
      )}
      style={{ transform: `translateX(${offsetX}px)` }}
    >
      <span className={clsx('select-none', isShort ? 'whitespace-nowrap' : 'truncate')}>
        {event.title}
      </span>
    </div>
  )
}
