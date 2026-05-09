import clsx from 'clsx'
import { HOUR_WIDTH, EVENT_ROW_HEIGHT } from './constants'
import type { CalendarEvent, EventRow as EventRowType } from '../../types'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import EventBrick from './EventBrick'
import EventLabel from './EventLabel'
import SnapGrid from './SnapGrid'
import { spawnDragGhost } from './dndUtils'

type Props = {
  variant: EventRowType
  day: number
  events: CalendarEvent[]
  scrollLeft: number
}

export default function EventRow({ variant, day, events, scrollLeft }: Props) {
  const { dragSource, startDrag, endDrag } = useTimetableContext()

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
      {events.map((event) => {
        const left = event.startTime * HOUR_WIDTH
        const brickWidth = event.duration * HOUR_WIDTH

        return (
          <div
            key={event.id}
            draggable={event.flexible}
            onDragStart={
              event.flexible
                ? (e) => {
                    e.dataTransfer.setData('text/plain', event.id)
                    const subtitle =
                      event.duration < 1
                        ? `${Math.round(event.duration * 60)}m`
                        : `${event.duration}h`
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
            className={clsx(
              'absolute inset-y-0 overflow-hidden flex flex-col py-1 gap-1',
              event.flexible && 'cursor-grab active:cursor-grabbing',
              dragSource !== null && 'pointer-events-none'
            )}
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
