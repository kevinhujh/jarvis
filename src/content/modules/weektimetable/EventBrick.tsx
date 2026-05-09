import { SHORT_THRESHOLD } from './constants'
import type { CalendarEvent } from '../../types'

interface Props {
  event: CalendarEvent
}

function formatHour(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function EventBrick({ event }: Props) {
  const isShort = event.endHour - event.startHour < SHORT_THRESHOLD

  return (
    <div data-testid={`event-brick-${event.id}`} className="flex-1 w-full flex items-center rounded-md bg-brand-primary p-1 overflow-hidden">
      {!isShort && (
        <span className="text-small text-white font-medium whitespace-nowrap select-none">
          {formatHour(event.startHour)}-{formatHour(event.endHour)}
        </span>
      )}
    </div>
  )
}
