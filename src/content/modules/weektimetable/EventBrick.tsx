import clsx from 'clsx'
import LockIcon from '@mui/icons-material/Lock'
import { SHORT_THRESHOLD } from './constants'
import { CATEGORY_COLOR } from './categoryColors'
import type { CalendarEvent } from '../../types'
import { formatHour } from '../../utils/time'

type ResizeHandlers = {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
}

type Props = {
  event: CalendarEvent
  resizeHandlers?: ResizeHandlers
}

export default function EventBrick({ event, resizeHandlers }: Props) {
  const isShort = event.duration < SHORT_THRESHOLD

  return (
    <div
      data-testid={`event-brick-${event.id}`}
      className={clsx(
        'relative flex-1 w-full flex items-center rounded-md p-1 overflow-hidden',
        CATEGORY_COLOR[event.category]
      )}
    >
      {!isShort && (
        <span className="text-small text-white font-medium whitespace-nowrap select-none">
          {formatHour(event.startTime)}-{formatHour(event.startTime + event.duration)}
        </span>
      )}
      {!event.flexible && (
        <LockIcon
          sx={{ fontSize: 10, color: 'white', opacity: 0.7 }}
          className="absolute top-0.5 right-0.5"
        />
      )}
      {resizeHandlers && (
        <div
          data-testid={`event-resize-handle-${event.id}`}
          className="absolute right-0 inset-y-0 w-1.5 cursor-ew-resize"
          onPointerDown={resizeHandlers.onPointerDown}
          onPointerMove={resizeHandlers.onPointerMove}
          onPointerUp={resizeHandlers.onPointerUp}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        />
      )}
    </div>
  )
}
