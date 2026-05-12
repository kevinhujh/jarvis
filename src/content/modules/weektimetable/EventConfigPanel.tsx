import { useState } from 'react'
import clsx from 'clsx'
import { Divider } from '@mui/material'
import type { CalendarEvent, EventCategory } from '../../types'
import { CATEGORY_COLOR } from './categoryColors'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import { CONFIG_PANEL_WIDTH, MAX_TITLE_LENGTH, MIN_EVENT_DURATION_MINUTES } from './constants'
import NumberField from '../../components/NumberField'
import Select from '../../components/Select'
import WeekDayPicker from '../../components/WeekDayPicker'

const CATEGORIES = Object.keys(CATEGORY_COLOR) as EventCategory[]

type Props = {
  event: CalendarEvent
  onClose: () => void
}

export default function EventConfigPanel({ event, onClose }: Props) {
  const { updateEventMeta, tryRelocateEvent } = useTimetableContext()

  const initStartHour = Math.floor(event.startTime)
  const initStartMinute = Math.round((event.startTime - initStartHour) * 60)
  const initDurationHour = Math.floor(event.duration)
  const initDurationMinute = Math.round((event.duration - initDurationHour) * 60)

  const [title, setTitle] = useState(event.title)
  const [category, setCategory] = useState<EventCategory>(event.category)
  const [day, setDay] = useState(event.day)
  const [startHour, setStartHour] = useState(initStartHour)
  const [startMinute, setStartMinute] = useState(initStartMinute)
  const [durationHour, setDurationHour] = useState(initDurationHour)
  const [durationMinute, setDurationMinute] = useState(initDurationMinute)
  const [error, setError] = useState<string | null>(null)

  const handleApply = () => {
    const trimmed = title.trim()
    if (!trimmed) return setError('Title is required')

    const rawDurationMin = durationHour * 60 + durationMinute
    const durationMin =
      Math.round(rawDurationMin / MIN_EVENT_DURATION_MINUTES) * MIN_EVENT_DURATION_MINUTES
    if (durationMin < MIN_EVENT_DURATION_MINUTES) {
      return setError(`Duration must be at least ${MIN_EVENT_DURATION_MINUTES} minutes`)
    }
    if (durationMin > 24 * 60) return setError('Duration cannot exceed 24 hours')

    const duration = durationMin / 60
    const rawStart = startHour + startMinute / 60
    const startTime =
      (Math.round((rawStart * 60) / MIN_EVENT_DURATION_MINUTES) * MIN_EVENT_DURATION_MINUTES) / 60
    if (startTime < 0) return setError('Start time cannot be negative')
    if (startTime + duration > 24) return setError('Event would extend past midnight')

    const geometryChanged =
      day !== event.day ||
      startTime !== event.startTime ||
      duration !== event.duration

    if (geometryChanged) {
      const ok = tryRelocateEvent(event.id, { day, startTime, duration })
      if (!ok) return setError('Cannot place here — collision with an inflexible event')
    }

    const metaPatch: { title?: string; category?: EventCategory } = {}
    if (trimmed !== event.title) metaPatch.title = trimmed
    if (category !== event.category) metaPatch.category = category
    if (Object.keys(metaPatch).length > 0) updateEventMeta(event.id, metaPatch)

    onClose()
  }

  return (
    <div style={{ width: CONFIG_PANEL_WIDTH }} className="p-4 flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-mini text-content-secondary">Title</span>
        <div className="w-full p-2 rounded-md border border-border-primary bg-surface-primary flex items-center gap-2 focus-within:border-brand-primary">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            className="flex-1 min-w-0 bg-transparent outline-none text-content-primary text-small"
          />
          <span className="text-mini text-content-secondary shrink-0 tabular-nums">
            {title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-mini text-content-secondary">Category</span>
        <Select<EventCategory>
          value={category}
          onChange={setCategory}
          header="Suggested"
          options={CATEGORIES.map((c) => ({
            value: c,
            label: (
              <span className="flex items-center gap-2">
                <span
                  className={clsx('w-3 h-3 rounded-full shrink-0', CATEGORY_COLOR[c])}
                  aria-hidden
                />
                <span className="capitalize">{c}</span>
              </span>
            ),
          }))}
        />
      </div>

      <Divider className="border-border-primary" />

      <WeekDayPicker value={day} onChange={setDay} />

      <div className="flex flex-col gap-1">
        <span className="text-mini text-content-secondary">Start time</span>
        <div className="flex items-center gap-1 w-full">
          <div className="flex-1 min-w-0">
            <NumberField
              value={startHour}
              onChange={setStartHour}
              min={0}
              max={23}
              step={1}
              width="100%"
              padTo={2}
            />
          </div>
          <span className="text-content-secondary">:</span>
          <div className="flex-1 min-w-0">
            <NumberField
              value={startMinute}
              onChange={setStartMinute}
              min={0}
              max={55}
              step={MIN_EVENT_DURATION_MINUTES}
              width="100%"
              padTo={2}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-mini text-content-secondary">Duration</span>
        <div className="flex items-center gap-1 w-full">
          <div className="flex-1 min-w-0">
            <NumberField
              value={durationHour}
              onChange={setDurationHour}
              min={0}
              max={24}
              step={1}
              width="100%"
            />
          </div>
          <span className="text-content-secondary text-small">h</span>
          <div className="flex-1 min-w-0">
            <NumberField
              value={durationMinute}
              onChange={setDurationMinute}
              min={0}
              max={55}
              step={MIN_EVENT_DURATION_MINUTES}
              width="100%"
            />
          </div>
          <span className="text-content-secondary text-small">m</span>
        </div>
      </div>

      {error && <span className="text-mini text-red">{error}</span>}

      <button
        type="button"
        onClick={handleApply}
        className="w-full py-2 rounded-md bg-brand-primary text-white text-small shadow-sm transition-colors hover:bg-brand-secondary"
      >
        Apply
      </button>
    </div>
  )
}
