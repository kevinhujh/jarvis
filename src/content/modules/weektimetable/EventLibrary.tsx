import clsx from 'clsx'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { MAX_EVENT_TEMPLATES } from './constants'
import { CATEGORY_COLOR } from './categoryColors'
import type { EventTemplate } from '../../types'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import { formatHour } from '../../utils/time'
import { spawnDragGhost } from './dndUtils'

function TemplateCard({ tpl }: { tpl: EventTemplate }) {
  const { startDrag, endDrag, scrollToTime } = useTimetableContext()

  const durationLabel = tpl.duration < 1 ? `${Math.round(tpl.duration * 60)}m` : `${tpl.duration}h`

  const subtitle = tpl.flexible ? durationLabel : `${formatHour(tpl.startTime)} · ${durationLabel}`

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', tpl.id)
        const ghost = spawnDragGhost({
          title: tpl.title,
          subtitle,
          category: tpl.category,
        })
        e.dataTransfer.setDragImage(ghost, 20, 20)
        startDrag({ kind: 'template', templateId: tpl.id })
        if (!tpl.flexible) scrollToTime(tpl.startTime)
      }}
      onDragEnd={endDrag}
      className={clsx(
        'flex items-center justify-between px-3 py-2.5 rounded-md text-white text-small font-medium select-none cursor-grab active:cursor-grabbing',
        CATEGORY_COLOR[tpl.category]
      )}
    >
      <div className="flex flex-col min-w-0">
        <span className="truncate">{tpl.title}</span>
        <span className="text-small opacity-70">{subtitle}</span>
      </div>
      <DragIndicatorIcon sx={{ fontSize: 16, opacity: 0.6, flexShrink: 0 }} />
    </div>
  )
}

function Section({ label, templates }: { label: string; templates: EventTemplate[] }) {
  if (templates.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-tiny text-content-secondary uppercase tracking-widest px-1">
        {label}
      </span>
      {templates.map((tpl) => (
        <TemplateCard key={tpl.id} tpl={tpl} />
      ))}
    </div>
  )
}

export default function EventLibrary() {
  const { templates } = useTimetableContext()
  const flexible = templates.filter((t) => t.flexible)
  const inflexible = templates.filter((t) => !t.flexible)

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-3 min-h-0">
        <Section label="Flexible" templates={flexible} />
        <Section label="Fixed" templates={inflexible} />
      </div>

      <div className="shrink-0 border-t border-border-primary p-3">
        <Tooltip
          title={
            templates.length >= MAX_EVENT_TEMPLATES ? 'Template limit reached' : 'New template'
          }
          placement="top"
        >
          <span className="block">
            <button
              disabled={templates.length >= MAX_EVENT_TEMPLATES}
              className={clsx(
                'w-full flex items-center justify-center gap-1.5 py-2 transition-colors bg-surface-primary shadow-sm',
                'rounded border border-dashed border-border-primary',
                'text-content-secondary text-small hover:text-content-primary',
                'hover:border-content-primary disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <AddIcon sx={{ fontSize: 16 }} />
              New Template
            </button>
          </span>
        </Tooltip>
      </div>
    </div>
  )
}
