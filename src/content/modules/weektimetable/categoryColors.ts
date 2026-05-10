import type { EventCategory } from '../../types'

// Ordered red → violet along the visible spectrum, with misc (gray) last as
// the catch-all. Object iteration order drives the category dropdown order.
export const CATEGORY_COLOR: Record<EventCategory, string> = {
  health: 'bg-red-500',
  exercise: 'bg-orange-500',
  family: 'bg-amber-500',
  leisure: 'bg-lime-500',
  rest: 'bg-teal-500',
  work: 'bg-blue-500',
  learning: 'bg-indigo-500',
  meeting: 'bg-violet-600',
  social: 'bg-pink-500',
  misc: 'bg-gray-500',
}
