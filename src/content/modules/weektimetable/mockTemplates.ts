import type { EventTemplate } from '../../types'

export const mockTemplates: EventTemplate[] = [
  // Flexible — no fixed startTime, can be placed anywhere
  { id: 't1', createdAt: 1, title: 'Deep work', category: 'work', duration: 2, flexible: true },
  { id: 't2', createdAt: 2, title: 'Reading', category: 'learning', duration: 1, flexible: true },
  { id: 't3', createdAt: 3, title: 'Gym session', category: 'exercise', duration: 1, flexible: true },
  { id: 't4', createdAt: 4, title: 'Grocery run', category: 'misc', duration: 1, flexible: true },

  // Inflexible — fixed startTime, user picks day and row only
  {
    id: 't5',
    createdAt: 5,
    title: 'Morning standup',
    category: 'meeting',
    duration: 0.25,
    flexible: false,
    startTime: 9,
  },
  {
    id: 't6',
    createdAt: 6,
    title: 'Lunch break',
    category: 'rest',
    duration: 1,
    flexible: false,
    startTime: 12,
  },
  {
    id: 't7',
    createdAt: 7,
    title: 'Evening walk',
    category: 'exercise',
    duration: 0.5,
    flexible: false,
    startTime: 18,
  },
]
