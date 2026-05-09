import { SHORT_THRESHOLD } from './constants'
import type { CalendarEvent } from '../../types'
import { formatHour } from '../../utils/time'

type Props = {
  event: CalendarEvent
}

export default function EventBrick({ event }: Props) {
  const isShort = event.duration < SHORT_THRESHOLD

  return (
    <div data-testid={`event-brick-${event.id}`} className="flex-1 w-full flex items-center rounded-md bg-brand-primary p-1 overflow-hidden">
      {!isShort && (
        <span className="text-small text-white font-medium whitespace-nowrap select-none">
          {formatHour(event.startTime)}-{formatHour(event.startTime + event.duration)}
        </span>
      )}
    </div>
  )
}
