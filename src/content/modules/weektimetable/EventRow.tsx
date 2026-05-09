import clsx from 'clsx'
import { HOUR_WIDTH, EVENT_ROW_HEIGHT } from './constants'
import type { CalendarEvent } from '../../types'
import EventBrick from './EventBrick'
import EventLabel from './EventLabel'
import SnapGrid from './SnapGrid'

type Props = {
  variant: 'primary' | 'secondary'
  events: CalendarEvent[]
  scrollLeft: number
}

export default function EventRow({ variant, events, scrollLeft }: Props) {
  return (
    <div
      data-testid={`event-row-${variant}`}
      style={{ height: EVENT_ROW_HEIGHT }}
      className={clsx(
        'relative',
        variant === 'primary' ? 'bg-surface-primary' : 'bg-surface-secondary/30'
      )}
    >
      <SnapGrid />
      {events.map((event) => {
        const left = event.startTime * HOUR_WIDTH
        const brickWidth = event.duration * HOUR_WIDTH

        return (
          <div
            key={event.id}
            className="absolute inset-y-0 flex flex-col py-1 gap-1"
            style={{ left, width: Math.max(brickWidth, 4) }}
          >
            <EventLabel event={event} scrollLeft={scrollLeft} />
            <EventBrick event={event} />
          </div>
        )
      })}
    </div>
  )
}
