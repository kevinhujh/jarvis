import { useState } from 'react'
import clsx from 'clsx'
import { Divider, Fade, Popover } from '@mui/material'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import LockIcon from '@mui/icons-material/Lock'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import type { EditingEventState } from '../../contexts/timetable/context'
import Switch from '../../components/Switch'
import EventConfigPanel from './EventConfigPanel'
import {
  MENU_STRIP_WIDTH,
  CONFIG_PANEL_WIDTH,
  CONTEXT_MENU_HEIGHT,
  VIEWPORT_MARGIN,
} from './constants'

const TOTAL_MENU_WIDTH = MENU_STRIP_WIDTH + CONFIG_PANEL_WIDTH

// Clamp the cursor coordinates so the full menu always fits in the viewport.
const clampAnchor = (anchor: { x: number; y: number }) => ({
  left: Math.max(
    VIEWPORT_MARGIN,
    Math.min(anchor.x, window.innerWidth - TOTAL_MENU_WIDTH - VIEWPORT_MARGIN)
  ),
  top: Math.max(
    VIEWPORT_MARGIN,
    Math.min(anchor.y, window.innerHeight - CONTEXT_MENU_HEIGHT - VIEWPORT_MARGIN)
  ),
})

export default function EventContextMenu() {
  const { editingEvent, closeEventEditor, openEventEditor } = useTimetableContext()

  // Mirror the latest non-null editingEvent so Popover's exit transition has
  // stable content to render. Updated during render — the conditional check
  // makes the setState idempotent (React allows setState during render when
  // the new state would actually differ). Cleared via TransitionProps.onExited.
  const [renderedEvent, setRenderedEvent] = useState<EditingEventState | null>(null)
  if (editingEvent && editingEvent !== renderedEvent) {
    setRenderedEvent(editingEvent)
  }

  return (
    <Popover
      open={!!editingEvent}
      onClose={closeEventEditor}
      anchorReference="anchorPosition"
      anchorPosition={renderedEvent ? clampAnchor(renderedEvent.anchor) : undefined}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      disableScrollLock
      disableAutoFocus
      disableRestoreFocus
      disableEnforceFocus
      slots={{ transition: Fade }}
      slotProps={{
        paper: {
          className:
            'rounded-md ring ring-border-primary bg-surface-primary overflow-hidden shadow-md',
          onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
        },
        backdrop: {
          onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault()
            const modalRoot = e.currentTarget.closest('.MuiModal-root') as HTMLElement | null
            if (!modalRoot) return
            const original = modalRoot.style.pointerEvents
            modalRoot.style.pointerEvents = 'none'
            const below = document.elementFromPoint(e.clientX, e.clientY)
            modalRoot.style.pointerEvents = original
            const brick = below?.closest('[data-testid^="event-brick-"]')
            if (brick) {
              const id = brick.getAttribute('data-testid')!.replace('event-brick-', '')
              openEventEditor(id, { x: e.clientX, y: e.clientY })
            }
          },
        },
        transition: {
          onExited: () => setRenderedEvent(null),
        },
      }}
    >
      {renderedEvent && (
        <EventContextMenuInner key={renderedEvent.id} editingEvent={renderedEvent} />
      )}
    </Popover>
  )
}

type InnerProps = { editingEvent: EditingEventState }

function EventContextMenuInner({ editingEvent }: InnerProps) {
  const { events, closeEventEditor, updateEventMeta, removeEvent } = useTimetableContext()

  const event = events.find((e) => e.id === editingEvent.id)
  if (!event) return null

  const row =
    'flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-surface-secondary text-small text-content-primary select-none'

  return (
    <div className="flex flex-row w-fit">
      {/* Action column — stateless one-shot actions. Open for additions:
          Duplicate, Save as template, etc. Width inline-styled (not Tailwind)
          so it stays in sync with the JS constant the clamp depends on. */}
      <div style={{ width: MENU_STRIP_WIDTH }} className="shrink-0 flex flex-col py-2">
        <div
          className={row}
          onClick={() => updateEventMeta(event.id, { flexible: !event.flexible })}
        >
          {event.flexible ? (
            <LockOpenIcon sx={{ fontSize: 16 }} />
          ) : (
            <LockIcon sx={{ fontSize: 16 }} />
          )}
          <span className="flex-1">Flexible</span>
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={event.flexible}
              onChange={(v) => updateEventMeta(event.id, { flexible: v })}
            />
          </div>
        </div>

        <Divider className="mx-2 my-1 border-border-primary" />

        <div className={clsx(row, 'text-red')} onClick={() => removeEvent(event.id)}>
          <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
          <span className="flex-1">Remove</span>
        </div>
      </div>

      {/* EventConfigPanel pins its own width via the same constant the
          clamp uses — no width needed here. */}
      <div className="shrink-0 border-l border-border-primary">
        <EventConfigPanel event={event} onClose={closeEventEditor} />
      </div>
    </div>
  )
}
