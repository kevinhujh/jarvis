import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { MAX_EVENT_TEMPLATES } from './constants'

type EventTemplate = {
  id: string
  title: string
  color: string
}

const mockTemplates: EventTemplate[] = [
  { id: '1', title: 'Deep Work', color: '#7C3AED' },
  { id: '2', title: 'Meeting', color: '#3B82F6' },
  { id: '3', title: 'Admin', color: '#374151' },
  { id: '4', title: 'Break', color: '#10B981' },
  { id: '5', title: 'Gym', color: '#F59E0B' },
]

export default function EventLibrary() {
  const templates = mockTemplates

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-3 min-h-0">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="flex items-center justify-between px-3 py-2.5 rounded-md text-white text-small font-medium select-none cursor-grab active:cursor-grabbing"
            style={{ backgroundColor: tpl.color }}
          >
            <span className="truncate">{tpl.title}</span>
            <DragIndicatorIcon sx={{ fontSize: 16, opacity: 0.6, flexShrink: 0 }} />
          </div>
        ))}
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
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded border border-dashed border-border-primary text-content-secondary text-small hover:text-content-primary hover:border-content-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
