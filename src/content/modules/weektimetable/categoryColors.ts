import type { EventCategory } from '../../types'

export const CATEGORY_COLOR: Record<EventCategory, string> = {
  work:     'bg-blue-500',
  meeting:  'bg-violet-600',
  health:   'bg-red-500',
  exercise: 'bg-orange-500',
  family:   'bg-amber-500',
  social:   'bg-pink-500',
  learning: 'bg-indigo-500',
  errands:  'bg-gray-500',
  leisure:  'bg-emerald-500',
  rest:     'bg-teal-500',
}
