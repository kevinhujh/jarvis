import { useRef, useState, useEffect, useCallback } from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { HOUR_WIDTH, TRACK_WIDTH, SUMMARY_MIN_HEIGHT } from './constants'
import { getWeekStart } from '../../utils/time'
import { mockEvents } from './mockData'
import { useDateContext } from '../../contexts/date/useDateContext'
import TimeAxisHeader from './TimeAxisHeader'
import DayLabelColumn from './DayLabelColumn'
import DayRow from './DayRow'
import EventLibrary from './EventLibrary'
import { WeekDensityPanel, DayDensityPanel } from './activityPanels'
import clsx from 'clsx'

export default function WeekTimetable() {
  const { selectedWeekStart: weekStart } = useDateContext()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  const today = new Date()
  const todayDayIndex = (() => {
    const d = today.getDay()
    return d === 0 ? 6 : d - 1
  })()
  const isCurrentWeek = weekStart.getTime() === getWeekStart(today).getTime()

  const [focusedDay, setFocusedDay] = useState<number | null>(isCurrentWeek ? todayDayIndex : null)

  useEffect(() => {
    const nowIsCurrentWeek = weekStart.getTime() === getWeekStart(new Date()).getTime()
    setFocusedDay(nowIsCurrentWeek ? todayDayIndex : null)
  }, [weekStart, todayDayIndex])

  const handleDayClick = useCallback((i: number) => {
    setFocusedDay((prev) => (prev === i ? null : i))
  }, [])

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  useEffect(() => {
    if (!isCurrentWeek) return
    const todayEvents = mockEvents
      .filter((e) => e.day === todayDayIndex)
      .sort((a, b) => a.startHour - b.startHour)

    if (todayEvents.length > 0 && scrollRef.current) {
      const target = Math.max(0, todayEvents[0].startHour * HOUR_WIDTH - 40)
      scrollRef.current.scrollLeft = target
      setScrollLeft(target)
    }
  }, [weekStart, todayDayIndex, isCurrentWeek])

  const handleScroll = useCallback(() => {
    setScrollLeft(scrollRef.current?.scrollLeft ?? 0)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let target = 0
    let rafId: number | null = null

    const animate = () => {
      const dist = target - el.scrollLeft
      if (Math.abs(dist) < 0.5) {
        el.scrollLeft = target
        rafId = null
        return
      }
      el.scrollLeft += dist * 0.15
      rafId = requestAnimationFrame(animate)
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaX !== 0) return
      e.preventDefault()
      if (rafId === null) target = el.scrollLeft
      target = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, target + e.deltaY))
      if (rafId === null) rafId = requestAnimationFrame(animate)
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div data-testid="week-timetable" className="flex flex-row gap-4 w-full p-4 flex-1 min-h-0">
      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 gap-4">
        {/* Summary card */}
        <div
          data-testid="week-timetable-summary"
          style={{ minHeight: SUMMARY_MIN_HEIGHT }}
          className="shrink-0 rounded-md ring ring-border-primary bg-surface-primary flex flex-col"
        >
          <div className="flex-1 min-h-0 p-3 border-b border-border-primary">
            <WeekDensityPanel events={mockEvents} />
          </div>
          <div className="flex-1 min-h-0 p-3">
            <DayDensityPanel events={mockEvents} focusedDay={focusedDay} />
          </div>
        </div>

        {/* Timetable grid */}
        <div className="flex flex-1 min-h-0 gap-4">
          <DayLabelColumn
            days={days}
            todayDayIndex={isCurrentWeek ? todayDayIndex : -1}
            focusedDay={focusedDay}
            onDayClick={handleDayClick}
          />

          <div className="flex-1 flex flex-col min-w-0 rounded-md ring ring-border-primary bg-surface-primary">
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 min-w-0 overflow-x-auto">
              <div style={{ width: TRACK_WIDTH }}>
                <TimeAxisHeader />
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
      </div>

      {/* Library pull tab */}
      <div
        className="shrink-0 w-10 flex flex-col items-center justify-center gap-3 cursor-pointer rounded-md ring ring-border-primary bg-surface-primary text-content-secondary hover:text-content-primary transition-colors select-none"
        onClick={() => setIsLibraryOpen((prev) => !prev)}
      >
        {isLibraryOpen ? (
          <ChevronRightIcon fontSize="small" />
        ) : (
          <ChevronLeftIcon fontSize="small" />
        )}
        <span className="[writing-mode:vertical-rl] rotate-180 text-small tracking-widest uppercase">
          Library
        </span>
      </div>

      {/* Library drawer */}
      <div
        className={clsx(
          'shrink-0 overflow-hidden rounded-md ring ring-border-primary bg-surface-primary flex flex-col transition-all duration-300 ease-in-out',
          isLibraryOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0 ring-0'
        )}
      >
        <div className="w-[260px] h-full flex flex-col min-h-0">
          <div className="shrink-0 px-3 py-2 border-b border-border-primary">
            <span className="text-small text-content-secondary uppercase tracking-widest">
              Event Templates
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <EventLibrary />
          </div>
        </div>
      </div>
    </div>
  )
}
