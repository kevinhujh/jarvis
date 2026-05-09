import clsx from 'clsx'
import { HOUR_WIDTH, TOTAL_HOURS } from './constants'

export default function TimeAxisHeader() {
  return (
    <div
      data-testid="time-axis-header"
      className="flex border-b border-border-primary"
    >
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div
          key={i}
          className={clsx(
            'box-border shrink-0 border-border-primary p-1 text-small text-content-secondary select-none',
            i !== 0 && 'border-l'
          )}
          style={{ width: HOUR_WIDTH }}
        >
          {String(i).padStart(2, '0')}:00
        </div>
      ))}
    </div>
  )
}
