import type { CalendarEvent, EventCategory, EventRow } from '../../types'
import { CATEGORY_COLOR } from './categoryColors'

export function findConflicts(
  events: CalendarEvent[],
  day: number,
  row: EventRow,
  startTime: number,
  duration: number
): CalendarEvent[] {
  const endTime = startTime + duration
  return events.filter(
    (e) =>
      e.day === day &&
      e.row === row &&
      e.startTime < endTime &&
      e.startTime + e.duration > startTime
  )
}

// Builds a template-card-styled element off-screen and returns it for use with
// dataTransfer.setDragImage. Self-cleans on the next frame after the browser
// has snapshotted it. Both library and grid drag sources route through this so
// the ghost is identical across flows.
export function spawnDragGhost(options: {
  title: string
  subtitle: string
  category: EventCategory
}): HTMLElement {
  const el = document.createElement('div')
  el.style.position = 'absolute'
  el.style.top = '-9999px'
  el.style.left = '-9999px'
  el.style.width = '232px'
  el.style.pointerEvents = 'none'
  el.className = `flex items-center justify-between px-3 py-2.5 rounded-md text-white text-small font-medium ${CATEGORY_COLOR[options.category]}`

  const inner = document.createElement('div')
  inner.className = 'flex flex-col min-w-0'

  const titleSpan = document.createElement('span')
  titleSpan.className = 'truncate'
  titleSpan.textContent = options.title
  inner.appendChild(titleSpan)

  const subSpan = document.createElement('span')
  subSpan.className = 'text-small opacity-70'
  subSpan.textContent = options.subtitle
  inner.appendChild(subSpan)

  el.appendChild(inner)
  document.body.appendChild(el)

  requestAnimationFrame(() => el.remove())
  return el
}
