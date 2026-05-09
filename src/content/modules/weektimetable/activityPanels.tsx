import type { ReactNode } from 'react'
import type { CalendarEvent } from '../../types'
import { TOTAL_HOURS } from './constants'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import clsx from 'clsx'

type ChartTab = { id: string; label: string }

// --- Shared computation ---

const SLOTS_PER_HOUR = 12
const MAX_WEEK_DENSITY = 7 * SLOTS_PER_HOUR

type HourSlice = { allocated: number; free: number }

function computeDayAllocation(events: CalendarEvent[], dayIndex: number): HourSlice[] {
  return Array.from({ length: TOTAL_HOURS }, (_, hour) => {
    let allocatedSlots = 0
    for (let slot = 0; slot < SLOTS_PER_HOUR; slot++) {
      const slotStart = hour + slot / SLOTS_PER_HOUR
      const slotEnd = slotStart + 1 / SLOTS_PER_HOUR
      if (events.some((e) => e.day === dayIndex && e.startHour < slotEnd && e.endHour > slotStart)) {
        allocatedSlots++
      }
    }
    const allocated = allocatedSlots * 5
    return { allocated, free: 60 - allocated }
  })
}

function computeWeekDensity(events: CalendarEvent[]): number[] {
  return Array.from({ length: TOTAL_HOURS }, (_, hour) => {
    let total = 0
    for (let day = 0; day < 7; day++) {
      for (let slot = 0; slot < SLOTS_PER_HOUR; slot++) {
        const slotStart = hour + slot / SLOTS_PER_HOUR
        const slotEnd = slotStart + 1 / SLOTS_PER_HOUR
        if (events.some((e) => e.day === day && e.startHour < slotEnd && e.endHour > slotStart)) {
          total++
        }
      }
    }
    return total
  })
}

// --- Shared UI primitives ---

function HourAxis() {
  return (
    <div className="relative flex h-5 border-t border-border-primary shrink-0">
      {Array.from({ length: TOTAL_HOURS }, (_, hour) => (
        <div key={hour} className="flex-1 relative">
          <div className="absolute left-0 top-0 h-1.5 w-px bg-border-primary" />
          <span className="absolute left-0 top-1.5 -translate-x-1/2 text-small text-content-secondary leading-none select-none">
            {hour}
          </span>
        </div>
      ))}
      <div className="absolute right-0 top-0 h-1.5 w-px bg-border-primary" />
      <span className="absolute right-0 top-1.5 translate-x-1/2 text-small text-content-secondary leading-none select-none">
        24
      </span>
    </div>
  )
}

function ChartFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      <div
        className={clsx(
          'flex-1 min-h-0 flex items-end',
          'bg-background-primary shadow-inner rounded-t-sm border-t border-dashed border-brand-primary/30'
        )}
      >
        {children}
      </div>
      <HourAxis />
    </div>
  )
}

function PanelHeader({
  label,
  charts,
  selectedId,
  onSelect,
}: {
  label: string
  charts: ChartTab[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex items-center justify-between shrink-0 mb-1">
      <span className="text-tiny text-content-secondary uppercase tracking-widest">
        {label}
        {charts.length === 1 && ` · ${charts[0].label}`}
      </span>
      {charts.length > 1 && (
        <div className="flex gap-0.5">
          {charts.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={clsx(
                'text-tiny px-2 py-0.5 rounded transition-colors',
                selectedId === tab.id
                  ? 'text-brand-primary'
                  : 'text-content-secondary hover:text-content-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Charts ---

function WeekDensityChart({ events }: { events: CalendarEvent[] }) {
  const data = computeWeekDensity(events)
  return (
    <ChartFrame>
      {data.map((value, hour) => (
        <div
          key={hour}
          className="flex-1 bg-brand-primary rounded-t-sm overflow-hidden mx-0.5"
          style={{ height: `${(value / MAX_WEEK_DENSITY) * 100}%` }}
        />
      ))}
    </ChartFrame>
  )
}

function DayAllocationChart({ events, dayIndex }: { events: CalendarEvent[]; dayIndex: number }) {
  const data = computeDayAllocation(events, dayIndex)
  return (
    <ChartFrame>
      {data.map(({ allocated, free }, hour) => (
        <div key={hour} className="flex-1 h-full flex items-end gap-px px-px">
          <div
            className="flex-1 bg-brand-primary border border-brand-primary rounded-t-sm overflow-hidden flex flex-col items-center justify-start"
            style={{ height: `${(allocated / 60) * 100}%` }}
          >
            {allocated > 0 && (
              <span className="text-white text-tiny leading-none mt-px">{allocated}</span>
            )}
          </div>
          <div
            className="flex-1 bg-transparent border border-brand-secondary rounded-t-sm overflow-hidden flex flex-col items-center justify-start"
            style={{ height: `${(free / 60) * 100}%` }}
          >
            {free > 0 && (
              <span className="text-brand-secondary text-tiny leading-none mt-px">{free}</span>
            )}
          </div>
        </div>
      ))}
    </ChartFrame>
  )
}

// --- Exported panels ---

const weekCharts: ChartTab[] = [{ id: 'week-density', label: 'Density' }]

type WeekPanelProps = { events: CalendarEvent[] }

export function WeekDensityPanel({ events }: WeekPanelProps) {
  const { selectedWeekChart, setSelectedWeekChart } = useTimetableContext()

  return (
    <div className="h-full flex flex-col">
      <PanelHeader
        label="Week"
        charts={weekCharts}
        selectedId={selectedWeekChart}
        onSelect={setSelectedWeekChart}
      />
      <WeekDensityChart events={events} />
    </div>
  )
}

const dayCharts: ChartTab[] = [{ id: 'day-allocation', label: 'Allocation' }]

type DayPanelProps = { events: CalendarEvent[]; focusedDay: number | null }

export function DayDensityPanel({ events, focusedDay }: DayPanelProps) {
  const { selectedDayChart, setSelectedDayChart } = useTimetableContext()

  return (
    <div className="h-full flex flex-col">
      <PanelHeader
        label="Day"
        charts={dayCharts}
        selectedId={selectedDayChart}
        onSelect={setSelectedDayChart}
      />
      {focusedDay !== null ? (
        <DayAllocationChart events={events} dayIndex={focusedDay} />
      ) : (
        <ChartFrame>
          <div className="flex-1 h-full flex items-center justify-center text-content-secondary text-small">
            No day selected
          </div>
        </ChartFrame>
      )}
    </div>
  )
}
