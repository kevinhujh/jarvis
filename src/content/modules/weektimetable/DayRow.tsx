import clsx from 'clsx'
import type { CalendarEvent } from '../../types'
import EventRow from './EventRow'

type Props = {
  dayIndex: number
  focused: boolean
  events: CalendarEvent[]
  scrollLeft: number
}

export default function DayRow({ dayIndex, focused, events, scrollLeft }: Props) {
  const primaryEvents = events.filter((e) => e.row === 'primary')
  const secondaryEvents = events.filter((e) => e.row === 'secondary')

  const primaryEventRow = (
    <EventRow variant="primary" day={dayIndex} events={primaryEvents} scrollLeft={scrollLeft} />
  )
  const secondaryEventRow = (
    <EventRow variant="secondary" day={dayIndex} events={secondaryEvents} scrollLeft={scrollLeft} />
  )

  return (
    <div data-testid={`day-row-${dayIndex}`} className={clsx('flex flex-col bg-background-primary transition-opacity duration-150', !focused && 'opacity-40')}>
      {primaryEventRow}
      {secondaryEventRow}
    </div>
  )
}
