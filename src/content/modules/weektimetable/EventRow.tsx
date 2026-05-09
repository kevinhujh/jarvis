import clsx from 'clsx'
import { HOUR_WIDTH } from './constants'
import type { CalendarEvent } from '../../types'
import EventBrick from './EventBrick'
import EventLabel from './EventLabel'

type Props = {
  variant: 'primary' | 'secondary'
  events: CalendarEvent[]
  scrollLeft: number
}

export default function EventRow({ variant, events, scrollLeft }: Props) {
  return (
    <div
      data-testid={`event-row-${variant}`}
      className={clsx(
        'relative h-16',
        variant === 'primary' ? 'bg-surface-primary' : 'bg-surface-secondary/30'
      )}
    >
      {events.map((event) => {
        const left = event.startHour * HOUR_WIDTH
        const brickWidth = (event.endHour - event.startHour) * HOUR_WIDTH

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
