import { useState } from 'react'
import clsx from 'clsx'
import { Collapse, Divider } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import type { EventCategory, EventTemplate } from '../../types'
import { CATEGORY_COLOR, CATEGORIES } from '../../categoryColors'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import { MAX_EVENT_TEMPLATES, MAX_TITLE_LENGTH, MIN_EVENT_DURATION_MINUTES } from './constants'
import Switch from '../../components/Switch'
import NumberField from '../../components/NumberField'
import Select from '../../components/Select'

const DEFAULT_DURATION_HOUR = 0
const DEFAULT_DURATION_MINUTE = 30
const DEFAULT_START_HOUR = 9
const DEFAULT_START_MINUTE = 0

export default function NewTemplatePanel() {
  const { addTemplate, templates } = useTimetableContext()
  const atLimit = templates.length >= MAX_EVENT_TEMPLATES

  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<EventCategory>('work')
  const [durationHour, setDurationHour] = useState(DEFAULT_DURATION_HOUR)
  const [durationMinute, setDurationMinute] = useState(DEFAULT_DURATION_MINUTE)
  const [flexible, setFlexible] = useState(true)
  const [startHour, setStartHour] = useState(DEFAULT_START_HOUR)
  const [startMinute, setStartMinute] = useState(DEFAULT_START_MINUTE)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setTitle('')
    setCategory('work')
    setDurationHour(DEFAULT_DURATION_HOUR)
    setDurationMinute(DEFAULT_DURATION_MINUTE)
    setFlexible(true)
    setStartHour(DEFAULT_START_HOUR)
    setStartMinute(DEFAULT_START_MINUTE)
    setError(null)
  }

  const handleOpen = () => {
    if (!atLimit) setIsOpen(true)
  }

  const handleCancel = () => {
    reset()
    setIsOpen(false)
  }

  const handleApply = () => {
    const trimmed = title.trim()
    if (!trimmed) return setError('Title is required')

    const rawDurationMin = durationHour * 60 + durationMinute
    const durationMin =
      Math.round(rawDurationMin / MIN_EVENT_DURATION_MINUTES) * MIN_EVENT_DURATION_MINUTES
    if (durationMin < MIN_EVENT_DURATION_MINUTES) {
      return setError(`Duration must be at least ${MIN_EVENT_DURATION_MINUTES} minutes`)
    }
    if (durationMin > 24 * 60) {
      return setError('Duration cannot exceed 24 hours')
    }

    const duration = durationMin / 60

    let next: Omit<EventTemplate, 'id'>
    if (flexible) {
      next = { title: trimmed, category, duration, flexible: true }
    } else {
      const rawStart = startHour + startMinute / 60
      const startTime =
        (Math.round((rawStart * 60) / MIN_EVENT_DURATION_MINUTES) * MIN_EVENT_DURATION_MINUTES) / 60
      if (startTime < 0) return setError('Start time cannot be negative')
      if (startTime + duration > 24) return setError('Event would extend past midnight')
      next = { title: trimmed, category, duration, flexible: false, startTime }
    }

    addTemplate(next)
    reset()
    setIsOpen(false)
  }

  // Bottom-strip button transforms between "+ New Template" (closed) and
  // "Cancel" (open). Same DOM element so border/background can transition;
  // text and icon swap instantly.
  const bottomBtnClass = clsx(
    'w-full flex items-center justify-center gap-2 py-2 transition-colors text-small',
    'rounded-md border border-border-primary bg-surface-primary shadow-sm',
    'text-content-secondary hover:text-content-primary hover:bg-surface-secondary/70',
    !isOpen && 'border-dashed disabled:opacity-40 disabled:cursor-not-allowed'
  )

  return (
    <div className="shrink-0 border-t border-border-primary flex flex-col bg-surface-primary">
      <Collapse in={isOpen}>
        <div className="flex flex-col gap-2 px-4 pt-4">
          <span className="text-small text-content-secondary uppercase tracking-widest">
            New template
          </span>

          <label className="flex flex-col gap-1">
            <span className="text-mini text-content-secondary">Title</span>
            <div className="w-full px-2 py-1.5 rounded-md ring ring-border-primary bg-surface-primary flex items-center gap-2 focus-within:ring-brand-primary">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={MAX_TITLE_LENGTH}
                placeholder="e.g. Deep work"
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

          <div className="flex flex-row items-center justify-between">
            <span className="text-mini text-content-secondary">Flexible</span>
            <Switch checked={flexible} onChange={setFlexible} />
          </div>

          {!flexible && <Divider sx={{ borderColor: 'var(--color-border-primary)' }} />}

          {!flexible && (
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
          )}

          <Divider sx={{ borderColor: 'var(--color-border-primary)' }} />

          {error && <span className="text-mini text-red">{error}</span>}

          <button
            type="button"
            onClick={handleApply}
            className="w-full py-2 rounded-md bg-brand-primary text-white text-small shadow-sm transition-colors hover:bg-brand-secondary"
          >
            Apply
          </button>
        </div>
      </Collapse>

      <div className="p-4">
        <Tooltip
          title={!isOpen && atLimit ? 'Template limit reached' : ''}
          placement="top"
          disableHoverListener={isOpen || !atLimit}
        >
          <span className="block">
            <button
              type="button"
              onClick={isOpen ? handleCancel : handleOpen}
              disabled={!isOpen && atLimit}
              className={bottomBtnClass}
            >
              {!isOpen && <AddIcon fontSize="inherit" />}
              {isOpen ? 'Cancel' : 'New Template'}
            </button>
          </span>
        </Tooltip>
      </div>
    </div>
  )
}
