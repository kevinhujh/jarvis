import clsx from 'clsx'
import { EVENT_ROW_HEIGHT } from './constants'
import type { CalendarEvent, EventRow as EventRowType } from '../../types'
import EventItem from './EventItem'
import SnapGrid from './SnapGrid'

type Props = {
  variant: EventRowType
  day: number
  events: CalendarEvent[]
  scrollLeft: number
}

export default function EventRow({ variant, day, events, scrollLeft }: Props) {
  return (
    <div
      data-testid={`event-row-${variant}`}
      style={{ height: EVENT_ROW_HEIGHT }}
      className={clsx(
        'relative',
        variant === 'primary' ? 'bg-surface-primary' : 'bg-surface-secondary/30'
      )}
    >
      <SnapGrid day={day} row={variant} />
      {events.map((event) => (
        <EventItem key={event.id} event={event} scrollLeft={scrollLeft} />
      ))}
    </div>
  )
}
