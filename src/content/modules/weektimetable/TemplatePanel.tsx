import { useState } from 'react'
import clsx from 'clsx'
import { Collapse, Divider } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import type { EventCategory, EventTemplate } from '../../types'
import type { TemplatePatch } from '../../contexts/timetable/context'
import { CATEGORY_COLOR, CATEGORIES } from '../../categoryColors'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import { MAX_EVENT_TEMPLATES, MAX_TITLE_LENGTH, MIN_EVENT_DURATION_MINUTES } from './constants'
import Switch from '../../components/Switch'
import NumberField from '../../components/NumberField'
import Select from '../../components/Select'

const DEFAULT_DURATION_HOUR = 0
const DEFAULT_DURATION_MINUTE = 30
const DEFAULT_START_HOUR = 9

export default function TemplatePanel() {
  const { templatePanel, templates } = useTimetableContext()

  const isOpen = templatePanel.kind !== 'closed'

  // `isOpen` drives the live Collapse animation, but the content inside has to
  // lag one step behind: when we close, render the previously-open form so the
  // user sees *that* form collapse, not whatever the next-open state would be.
  // We snapshot the most recent non-closed state and derive the form from it.
  // Adjusted during render (React's prescribed pattern for derived state) so
  // the snapshot updates in the same commit as the source change.
  const [openSnapshot, setOpenSnapshot] = useState(templatePanel)
  if (templatePanel.kind !== 'closed' && templatePanel !== openSnapshot) {
    setOpenSnapshot(templatePanel)
  }

  const editingTemplate =
    openSnapshot.kind === 'edit' ? (templates.find((t) => t.id === openSnapshot.id) ?? null) : null

  // Inner form is keyed so that switching panel modes/targets remounts it
  // with fresh state derived from the new initial values — no useEffect
  // dance to keep field state in sync with the targeted template.
  const formKey = openSnapshot.kind === 'edit' ? `edit-${openSnapshot.id}` : 'create'

  return (
    <div className="shrink-0 border-t border-border-primary flex flex-col bg-surface-primary">
      <Collapse in={isOpen}>
        {editingTemplate ? (
          <PanelForm key={formKey} mode="edit" initial={editingTemplate} />
        ) : (
          <PanelForm key={formKey} mode="create" />
        )}
      </Collapse>

      <BottomStrip />
    </div>
  )
}

function BottomStrip() {
  const { templatePanel, templates, openTemplateCreate, closeTemplatePanel } = useTimetableContext()

  const isOpen = templatePanel.kind !== 'closed'
  const atLimit = templates.length >= MAX_EVENT_TEMPLATES

  // Same DOM element across states so border/background can transition;
  // text and icon swap instantly.
  const btnClass = clsx(
    'w-full flex items-center justify-center gap-2 py-2 transition-colors text-small',
    'rounded-md border border-border-primary bg-surface-primary shadow-sm',
    'text-content-secondary hover:text-content-primary hover:bg-surface-secondary/70',
    !isOpen && 'border-dashed disabled:opacity-40 disabled:cursor-not-allowed'
  )

  return (
    <div className="p-4">
      <Tooltip
        title={!isOpen && atLimit ? 'Template limit reached' : ''}
        placement="top"
        disableHoverListener={isOpen || !atLimit}
      >
        <span className="block">
          <button
            type="button"
            onClick={isOpen ? closeTemplatePanel : openTemplateCreate}
            disabled={!isOpen && atLimit}
            className={btnClass}
          >
            {!isOpen && <AddIcon fontSize="inherit" />}
            {isOpen ? 'Cancel' : 'New Template'}
          </button>
        </span>
      </Tooltip>
    </div>
  )
}

type PanelFormProps =
  | { mode: 'create'; initial?: undefined }
  | { mode: 'edit'; initial: EventTemplate }

function PanelForm({ mode, initial }: PanelFormProps) {
  const { addTemplate, updateTemplate, removeTemplate, closeTemplatePanel } = useTimetableContext()

  // Derive initial state once at mount — the parent keys this component on
  // mode/target so any change to those forces a remount with fresh values.
  const initialDurationHour = initial ? Math.floor(initial.duration) : DEFAULT_DURATION_HOUR
  const initialDurationMinute = initial
    ? Math.round((initial.duration - Math.floor(initial.duration)) * 60)
    : DEFAULT_DURATION_MINUTE
  const initialFlexible = initial ? initial.flexible : true
  const initialStartTime = initial && !initial.flexible ? initial.startTime : DEFAULT_START_HOUR
  const initialStartHour = Math.floor(initialStartTime)
  const initialStartMinute = Math.round((initialStartTime - Math.floor(initialStartTime)) * 60)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? 'work')
  const [durationHour, setDurationHour] = useState(initialDurationHour)
  const [durationMinute, setDurationMinute] = useState(initialDurationMinute)
  const [flexible, setFlexible] = useState(initialFlexible)
  const [startHour, setStartHour] = useState(initialStartHour)
  const [startMinute, setStartMinute] = useState(initialStartMinute)
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
    if (durationMin > 24 * 60) {
      return setError('Duration cannot exceed 24 hours')
    }

    const duration = durationMin / 60

    let next: TemplatePatch
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

    if (mode === 'edit') {
      updateTemplate(initial.id, next)
    } else {
      addTemplate(next)
    }
    closeTemplatePanel()
  }

  const handleDelete = () => {
    if (mode !== 'edit') return
    removeTemplate(initial.id)
  }

  const titleLabel = mode === 'edit' ? 'Edit template' : 'New template'
  const TitleIcon = mode === 'edit' ? EditIcon : AddIcon

  return (
    <div className="flex flex-col gap-2 px-4 pt-4">
      <span className="text-small text-content-secondary uppercase tracking-widest flex items-center gap-1">
        <TitleIcon fontSize="inherit" />
        {titleLabel}
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

      {/* Apply takes the dominant span; in edit mode Delete is a square icon
          button on the right. The size asymmetry mirrors the action asymmetry
          (Apply is what most clicks want) and shrinks the misclick target for
          the destructive action without needing a confirm step. */}
      <div className="flex flex-row gap-2">
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 py-2 rounded-md bg-brand-primary text-white text-small shadow-sm transition-colors hover:bg-brand-secondary"
        >
          Apply
        </button>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete"
            className="p-2 rounded-md bg-red text-white shadow-sm transition-colors hover:opacity-80 flex items-center justify-center text-medium"
          >
            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
        )}
      </div>
    </div>
  )
}
