import clsx from 'clsx'
import { HOUR_WIDTH, TIME_AXIS_HEIGHT } from './constants'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import { formatHour } from '../../utils/time'

export default function GridGuides() {
  const { guides } = useTimetableContext()
  if (!guides) return null

  const startX = guides.startTime * HOUR_WIDTH
  const endX = guides.endTime * HOUR_WIDTH
  const isDrag = guides.mode === 'drag'

  const lineClass = clsx(
    'absolute top-0 bottom-0 w-0 pointer-events-none border-l border-dashed',
    isDrag ? 'border-brand-primary/70' : 'border-content-secondary/40'
  )

  const pillClass = clsx(
    'absolute px-1.5 py-0.5 rounded-sm text-mini font-medium',
    'text-white bg-brand-primary shadow-sm select-none whitespace-nowrap'
  )

  const MIN_PILL_GAP = 52
  const center = (startX + endX) / 2
  const half = Math.max(endX - startX, MIN_PILL_GAP) / 2
  const startPillX = center - half
  const endPillX = center + half

  const pillStyle = (left: number) => ({
    left,
    top: TIME_AXIS_HEIGHT / 2,
    transform: 'translate(-50%, -50%)',
  })

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <div className={lineClass} style={{ left: startX }} />
      <div className={lineClass} style={{ left: endX }} />
      {isDrag && (
        <>
          <div className={pillClass} style={pillStyle(startPillX)}>
            {formatHour(guides.startTime)}
          </div>
          <div className={pillClass} style={pillStyle(endPillX)}>
            {formatHour(guides.endTime)}
          </div>
        </>
      )}
    </div>
  )
}
