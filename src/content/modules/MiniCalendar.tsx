import { useState } from 'react'
import clsx from 'clsx'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { getWeekStart, buildCalendarWeeks } from '../utils/time'
import { useDateContext } from '../contexts/date/useDateContext'

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function MiniCalendar() {
  const { selectedWeekStart, setSelectedWeekStart } = useDateContext()
  const today = new Date()

  const [display, setDisplay] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const year = display.getFullYear()
  const month = display.getMonth()
  const weeks = buildCalendarWeeks(year, month)

  return (
    <div
      data-testid="mini-calendar"
      className="rounded-md ring ring-border-primary bg-surface-primary p-3 select-none"
    >
      <div className="flex items-center justify-between mb-2 gap-4">
        <button
          onClick={() => setDisplay(new Date(year, month - 1, 1))}
          className={clsx(
            'w-6 h-6 flex items-center justify-center rounded-full cursor-pointer',
            'text-content-secondary hover:text-content-primary hover:bg-brand-primary/10',
            'transition-colors'
          )}
        >
          <ChevronLeftIcon sx={{ fontSize: 16 }} />
        </button>
        <span className="text-small font-semibold text-content-primary">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setDisplay(new Date(year, month + 1, 1))}
          className={clsx(
            'w-6 h-6 flex items-center justify-center rounded-full cursor-pointer',
            'text-content-secondary hover:text-content-primary hover:bg-brand-primary/10',
            'transition-colors'
          )}
        >
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d, i) => (
          <div
            key={i}
            className={clsx(
              'w-8 text-center text-tiny font-semibold uppercase py-1',
              i === 6 ? 'text-[var(--color-red)]' : 'text-content-secondary'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {weeks.map((week, wi) => {
        const monday = week.find((d) => d !== null && d.getDay() === 1)
        const anchor = monday ?? week.find((d) => d !== null)
        const weekMs = anchor != null ? getWeekStart(anchor).getTime() : null
        const isSelectedWeek = weekMs !== null && weekMs === selectedWeekStart.getTime()

        return (
          <div
            key={wi}
            onClick={() => {
              if (anchor != null) setSelectedWeekStart(getWeekStart(anchor))
            }}
            className={clsx(
              'grid grid-cols-7 rounded-sm cursor-pointer hover:bg-brand-primary/5 transition-colors',
              isSelectedWeek && 'bg-brand-primary/10 hover:bg-brand-primary/15'
            )}
          >
            {week.map((day, di) => {
              const isToday = day !== null && day?.toDateString() === today.toDateString()
              return (
                <div key={di} className="w-8 h-8 flex items-center justify-center">
                  {day !== null && (
                    <span
                      className={clsx(
                        'w-6 h-6 flex items-center justify-center rounded-full text-small',
                        isToday
                          ? 'bg-brand-primary text-white font-semibold'
                          : day.getDay() === 0
                            ? 'text-[var(--color-red)] transition-colors'
                            : 'text-content-primary transition-colors'
                      )}
                    >
                      {day.getDate()}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
