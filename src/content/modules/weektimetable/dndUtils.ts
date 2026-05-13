import type { CalendarEvent, EventCategory, EventRow } from '../../types'
import { CATEGORY_COLOR } from '../../categoryColors'

export type CascadeResult = { success: true; moves: Map<string, number> } | { success: false }

// Computes the push cascade for placing an event at [incomingStart, incomingEnd].
// Direction is inferred from each existing event's position relative to the
// drop: events whose start is at or after incomingStart are pushed forward;
// events whose start is before incomingStart (but extend past it) are pushed
// backward. This preserves the lead/trail ordering signaled by the drop.
// Fails if a push hits an inflexible event or a day boundary (hour 0 or 24).
export function computeCascade(
  events: CalendarEvent[],
  day: number,
  row: EventRow,
  incomingStart: number,
  incomingDuration: number,
  excludeId?: string
): CascadeResult {
  const rowEvents = events.filter((e) => e.day === day && e.row === row && e.id !== excludeId)

  const incomingEnd = incomingStart + incomingDuration
  const moves = new Map<string, number>()

  // Forward chain — events at or after the drop start, sorted ASC by start.
  const forwardEvents = rowEvents
    .filter((e) => e.startTime >= incomingStart)
    .sort((a, b) => a.startTime - b.startTime)
  let forwardPressure = incomingEnd
  for (const event of forwardEvents) {
    if (event.startTime >= forwardPressure) break
    if (!event.flexible) return { success: false }
    const newStart = forwardPressure
    const newEnd = newStart + event.duration
    if (newEnd > 24) return { success: false }
    moves.set(event.id, newStart)
    forwardPressure = newEnd
  }

  // Backward chain — events that start before the drop but extend past it.
  // Sort DESC by end time so each push pulls the wall further left for events
  // we'll evaluate next; once an event's end no longer crosses the wall, all
  // remaining (smaller-ended) events are guaranteed to clear it too.
  const backwardEvents = rowEvents
    .filter((e) => e.startTime < incomingStart)
    .sort((a, b) => b.startTime + b.duration - (a.startTime + a.duration))
  let backwardPressure = incomingStart
  for (const event of backwardEvents) {
    if (event.startTime + event.duration <= backwardPressure) break
    if (!event.flexible) return { success: false }
    const newEnd = backwardPressure
    const newStart = newEnd - event.duration
    if (newStart < 0) return { success: false }
    moves.set(event.id, newStart)
    backwardPressure = newStart
  }

  return { success: true, moves }
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
  el.className = `flex items-center justify-between px-2 py-2 rounded-md text-white text-small font-medium ${CATEGORY_COLOR[options.category]}`

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
