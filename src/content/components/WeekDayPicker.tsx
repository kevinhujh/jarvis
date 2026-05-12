import { useMemo } from 'react'
import clsx from 'clsx'
import { useDateContext } from '../contexts/date/useDateContext'
import SegmentedToggle from './SegmentedToggle'
import type { SegmentedItem } from './types'

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type Props = {
  value: number // 0=Mon … 6=Sun
  onChange: (day: number) => void
  className?: string
}

// Compact one-click day-of-week picker. Reads selectedWeekStart from the date
// context, renders 7 SegmentedToggle cells (exclusive) showing weekday letter
// over date number. Today gets a small dot under the date, shown regardless
// of selection so it stays visible even when today IS the selected day.
//
// Styling deviates from SegmentedToggle's default grouped look: each cell is
// borderless and the group has a real gap. Achieved by overriding MUI's
// ToggleButtonGroup margin/border defaults via arbitrary-variant Tailwind
// classes on the group className.
export default function WeekDayPicker({ value, onChange, className }: Props) {
  const { selectedWeekStart } = useDateContext()

  const { days, header } = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(selectedWeekStart)
      d.setDate(selectedWeekStart.getDate() + i)
      return d
    })
    const mm = (m: number) => String(m + 1).padStart(2, '0')
    const startMonth = days[0].getMonth()
    const endMonth = days[6].getMonth()
    const startYear = days[0].getFullYear()
    const endYear = days[6].getFullYear()
    let header: string
    if (startYear !== endYear) {
      header = `${mm(startMonth)}/${startYear} – ${mm(endMonth)}/${endYear}`
    } else if (startMonth !== endMonth) {
      header = `${mm(startMonth)}-${mm(endMonth)}/${startYear}`
    } else {
      header = `${mm(startMonth)}/${startYear}`
    }
    return { days, header }
  }, [selectedWeekStart])

  const today = new Date()
  const todayIdx = days.findIndex(
    (d) =>
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
  )

  const items: SegmentedItem<number>[] = days.map((d, i) => ({
    key: i,
    label: (
      <span className="flex flex-col items-center leading-tight">
        <span className="text-mini">{WEEKDAY_LETTERS[i]}</span>
        <span className="text-small font-medium">{d.getDate()}</span>
        {/* Today dot — rendered for all cells but invisible on non-today to
            preserve uniform cell height. Brand color by default; switches to
            white when this cell is the selected one (where the bg is brand
            and a brand dot would vanish). */}
        <span
          aria-hidden
          className={clsx(
            'h-1 w-1 rounded-full',
            i !== todayIdx
              ? 'invisible'
              : i === value
                ? 'bg-white'
                : 'bg-brand-primary'
          )}
        />
      </span>
    ),
  }))

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      <span className="text-mini text-content-secondary tabular-nums">{header}</span>
      <SegmentedToggle<number>
        exclusive
        items={items}
        value={value}
        onChange={onChange}
        fullWidth
        // Group-level overrides: real gap between cells, drop MUI's overlap-
        // negative-margin and grouped-border, give every cell its own radius.
        className={clsx(
          'gap-1',
          '[&_.MuiToggleButton-root]:ml-0',
          '[&_.MuiToggleButton-root]:border-0',
          '[&_.MuiToggleButton-root]:rounded'
        )}
        getItemClassName={() =>
          'min-h-0 min-w-0 p-1 transition-colors duration-150 hover:bg-brand-primary hover:text-white'
        }
      />
    </div>
  )
}
