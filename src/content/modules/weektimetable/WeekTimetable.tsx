import { useRef, useState, useEffect, useCallback } from 'react'
import { HOUR_WIDTH, TRACK_WIDTH } from './constants'
import { mockEvents } from './mockData'
import TimeAxisHeader from './TimeAxisHeader'
import DayLabelColumn from './DayLabelColumn'
import DayRow from './DayRow'

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function applyTimeAxisScroll(el: HTMLDivElement | null, left: number) {
  if (el) el.style.transform = `translateX(-${left}px)`
}

export default function WeekTimetable() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const timeAxisRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)

  const today = new Date()
  const weekStart = getWeekStart(today)
  const todayDayIndex = (() => {
    const d = today.getDay()
    return d === 0 ? 6 : d - 1
  })()

  const [focusedDay, setFocusedDay] = useState<number | null>(todayDayIndex)

  const handleDayClick = useCallback((i: number) => {
    setFocusedDay((prev) => (prev === i ? null : i))
  }, [])

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  useEffect(() => {
    const todayEvents = mockEvents
      .filter((e) => e.day === todayDayIndex)
      .sort((a, b) => a.startHour - b.startHour)

    if (todayEvents.length > 0 && scrollRef.current) {
      const target = Math.max(0, todayEvents[0].startHour * HOUR_WIDTH - 40)
      scrollRef.current.scrollLeft = target
      applyTimeAxisScroll(timeAxisRef.current, target)
      setScrollLeft(target)
    }
  }, [todayDayIndex])

  const handleScroll = useCallback(() => {
    const left = scrollRef.current?.scrollLeft ?? 0
    applyTimeAxisScroll(timeAxisRef.current, left)
    setScrollLeft(left)
  }, [])

  return (
    <div data-testid="week-timetable" className="flex w-full bg-background-primary gap-4 p-4">
      <DayLabelColumn
        days={days}
        todayDayIndex={todayDayIndex}
        focusedDay={focusedDay}
        onDayClick={handleDayClick}
      />

      <div className="flex-1 flex flex-col min-w-0 rounded-md ring ring-border-primary bg-surface-primary">
        <div className="overflow-hidden shrink-0 border-b border-border-primary">
          <TimeAxisHeader ref={timeAxisRef} />
        </div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 min-w-0 overflow-x-auto"
        >
          <div style={{ width: TRACK_WIDTH }}>
            {days.map((_, i) => (
              <DayRow
                key={i}
                dayIndex={i}
                focused={focusedDay === null || focusedDay === i}
                events={mockEvents.filter((e) => e.day === i)}
                scrollLeft={scrollLeft}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
