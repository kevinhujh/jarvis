import { useState } from 'react'
import clsx from 'clsx'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LocationPinIcon from '@mui/icons-material/LocationPin'
import Popover from '../../components/Popover'
import MiniCalendar from '../MiniCalendar'
import { DAY_ROW_HEIGHT, TIME_AXIS_HEIGHT } from './constants'
import { SCROLLBAR_SIZE } from '../../constants'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type Props = {
  days: Date[]
  todayDayIndex: number
  focusedDay: number | null
  onDayClick: (index: number) => void
}

export default function DayLabelColumn({ days, todayDayIndex, focusedDay, onDayClick }: Props) {
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLButtonElement | null>(null)

  return (
    <div
      data-testid="day-label-column"
      style={{ paddingBottom: SCROLLBAR_SIZE }}
      className="shrink-0 w-30 flex flex-col rounded-md ring ring-border-primary bg-surface-primary"
    >
      <div
        style={{ height: TIME_AXIS_HEIGHT }}
        className="shrink-0 flex items-center justify-center"
      >
        <button
          type="button"
          onClick={(e) => setCalendarAnchor(e.currentTarget)}
          className="flex items-center justify-center bg-transparent text-content-secondary hover:text-content-primary transition-colors"
        >
          <CalendarMonthIcon sx={{ fontSize: 20 }} />
        </button>

        <Popover
          open={Boolean(calendarAnchor)}
          anchorEl={calendarAnchor}
          onClose={() => setCalendarAnchor(null)}
        >
          <MiniCalendar />
        </Popover>
      </div>

      {days.map((date, i) => {
        const isToday = i === todayDayIndex
        const isFocused = i === focusedDay

        return (
          <div
            key={i}
            onClick={() => onDayClick(i)}
            style={{ height: DAY_ROW_HEIGHT }}
            className={clsx(
              'shrink-0 flex flex-col items-center justify-center gap-0.5 border-b border-border-primary cursor-pointer select-none transition-colors duration-150',
              i === 0 && 'border-t border-border-primary',
              isFocused ? 'bg-brand-primary' : 'bg-surface-primary hover:bg-brand-primary/10'
            )}
          >
            <span
              className={clsx(
                'text-small font-semibold uppercase tracking-[0.05em]',
                isFocused ? 'text-white' : 'text-content-secondary'
              )}
            >
              {DAYS[i]}
            </span>
            {isToday && (
              <LocationPinIcon
                sx={{ fontSize: 20, color: isFocused ? 'white' : 'var(--color-brand-primary)' }}
              />
            )}
            <span
              className={clsx(
                'text-base font-medium',
                isFocused ? 'text-white' : isToday ? 'text-brand-primary' : 'text-content-primary'
              )}
            >
              {MONTHS[date.getMonth()]} {date.getDate()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
