import { useRef, useState, useEffect, useCallback } from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { EVENT_LIBRARY_WIDTH, HOUR_WIDTH, TRACK_WIDTH, SUMMARY_MIN_HEIGHT } from './constants'
import { getWeekStart } from '../../utils/time'
import { useDateContext } from '../../contexts/date/useDateContext'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import TimeAxisHeader from './TimeAxisHeader'
import DayLabelColumn from './DayLabelColumn'
import DayRow from './DayRow'
import EventLibrary from './EventLibrary'
import GridGuides from './GridGuides'
import { WeekDensityPanel, DayDensityPanel } from './activityPanels'
import clsx from 'clsx'

export default function WeekTimetable() {
  const { selectedWeekStart: weekStart } = useDateContext()
  const { events, registerScrollToTime } = useTimetableContext()
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

  // Reset focusedDay when the user navigates to a different week or when
  // "today" rolls over midnight. Using the "during-render reset on key
  // change" pattern instead of useEffect avoids the cascading-renders that
  // happen when setState is called inside an effect body.
  const [prevKey, setPrevKey] = useState({ weekStart, todayDayIndex })
  if (prevKey.weekStart !== weekStart || prevKey.todayDayIndex !== todayDayIndex) {
    setPrevKey({ weekStart, todayDayIndex })
    setFocusedDay(isCurrentWeek ? todayDayIndex : null)
  }

  useEffect(() => {
    registerScrollToTime((time: number) => {
      if (!scrollRef.current) return
      const el = scrollRef.current
      const target = Math.max(
        0,
        Math.min(time * HOUR_WIDTH - el.clientWidth / 2, el.scrollWidth - el.clientWidth)
      )
      el.scrollTo({ left: target, behavior: 'smooth' })
    })
  }, [registerScrollToTime])

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
    const todayEvents = events
      .filter((e) => e.day === todayDayIndex)
      .sort((a, b) => a.startTime - b.startTime)

    if (todayEvents.length > 0 && scrollRef.current) {
      const target = Math.max(0, todayEvents[0].startTime * HOUR_WIDTH - 40)
      scrollRef.current.scrollLeft = target
      setScrollLeft(target)
    }
    // `events` is intentionally read from closure without being a dep —
    // this effect's job is the initial scroll-to-today when the week
    // changes, not to re-scroll on every event mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          className="flex-1 shrink-0 rounded-md ring ring-border-primary bg-surface-primary flex flex-col"
        >
          <div className="flex-1 min-h-0 p-4 border-b border-border-primary">
            <WeekDensityPanel events={events} />
          </div>
          <div className="flex-1 min-h-0 p-4">
            <DayDensityPanel events={events} focusedDay={focusedDay} />
          </div>
        </div>

        {/* Timetable grid */}
        <div data-testid="week-timetable-grid" className="flex flex-1 gap-4">
          <DayLabelColumn
            days={days}
            todayDayIndex={isCurrentWeek ? todayDayIndex : -1}
            focusedDay={focusedDay}
            onDayClick={handleDayClick}
          />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={clsx(
              'flex-1 flex flex-col min-w-0 overflow-x-auto',
              'rounded-md ring ring-border-primary bg-surface-primary'
            )}
          >
            <div style={{ width: TRACK_WIDTH }} className="relative">
              <TimeAxisHeader />
              {days.map((_, i) => (
                <DayRow
                  key={i}
                  dayIndex={i}
                  focused={focusedDay === null || focusedDay === i}
                  events={events.filter((e) => e.day === i)}
                  scrollLeft={scrollLeft}
                />
              ))}
              <GridGuides />
            </div>
          </div>
        </div>
      </div>

      {/* Library widget — strip + drawer share one card */}
      <div className="shrink-0 flex flex-row rounded-md ring ring-border-primary bg-surface-primary overflow-hidden transition-[width] duration-300 ease-in-out">
        {/* Pull tab */}
        <div
          className="shrink-0 w-10 flex flex-col items-center justify-center gap-4 cursor-pointer text-content-secondary hover:text-content-primary transition-colors select-none"
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

        {/* Drawer */}
        <div
          style={{ width: isLibraryOpen ? EVENT_LIBRARY_WIDTH : 0 }}
          className={clsx(
            'shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out',
            isLibraryOpen && 'border-l border-border-primary'
          )}
        >
          <div
            style={{ width: EVENT_LIBRARY_WIDTH }}
            className="h-full flex flex-col min-h-0"
          >
            <div className="shrink-0 px-4 py-2 border-b border-border-primary">
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
    </div>
  )
}
