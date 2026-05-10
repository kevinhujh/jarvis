import type { CalendarEvent } from '../../types'

// day 0 = Monday of current week, day 4 = Friday (today)
export const mockEvents: CalendarEvent[] = [
  // Monday
  { id: '1',  title: 'Team standup',     day: 0, startTime: 9,            duration: 0.25,          row: 'primary',   category: 'meeting',  flexible: false },
  { id: '2',  title: 'Product review',   day: 0, startTime: 10,           duration: 1.5,           row: 'primary',   category: 'meeting',  flexible: false },
  { id: '3',  title: 'Email catchup',    day: 0, startTime: 9,            duration: 1,             row: 'secondary', category: 'work',     flexible: true  },

  // Tuesday
  { id: '4',  title: 'Design sprint',    day: 1, startTime: 9,            duration: 3,             row: 'primary',   category: 'work',     flexible: false },
  { id: '5',  title: 'Lunch with Alex',  day: 1, startTime: 12.5,         duration: 1,             row: 'primary',   category: 'social',   flexible: false },
  { id: '6',  title: 'Playlist',         day: 1, startTime: 9,            duration: 3,             row: 'secondary', category: 'leisure',  flexible: true  },

  // Wednesday
  { id: '7',  title: 'Client call',      day: 2, startTime: 14,           duration: 1,             row: 'primary',   category: 'meeting',  flexible: false },
  { id: '8',  title: 'Weekly report',    day: 2, startTime: 16,           duration: 1,             row: 'primary',   category: 'work',     flexible: true  },
  { id: '9',  title: 'Gardener',         day: 2, startTime: 13,           duration: 3,             row: 'secondary', category: 'misc',     flexible: false },

  // Thursday
  { id: '10', title: 'Doctor',           day: 3, startTime: 9.5,          duration: 1,             row: 'primary',   category: 'health',   flexible: false },
  { id: '11', title: 'Code review',      day: 3, startTime: 13,           duration: 1,             row: 'primary',   category: 'work',     flexible: true  },

  // Friday — today; first event at 07:00 drives initial scroll
  { id: '12', title: 'Morning jog',      day: 4, startTime: 7,            duration: 0.5,           row: 'primary',   category: 'exercise', flexible: false },
  { id: '13', title: 'Release planning', day: 4, startTime: 10,           duration: 1,             row: 'primary',   category: 'meeting',  flexible: false },
  { id: '14', title: 'Critical pitch',   day: 4, startTime: 14 + 5 / 60, duration: 5 / 60,        row: 'primary',   category: 'meeting',  flexible: false },
  { id: '15', title: 'Online course',    day: 4, startTime: 15,           duration: 2,             row: 'secondary', category: 'learning', flexible: true  },

  // Saturday
  { id: '16', title: 'Grocery shopping', day: 5, startTime: 10,           duration: 1,             row: 'primary',   category: 'misc',     flexible: true  },
  { id: '17', title: 'Laundry',          day: 5, startTime: 10.5,         duration: 1,             row: 'secondary', category: 'misc',     flexible: true  },

  // Sunday
  { id: '18', title: 'Weekly review',    day: 6, startTime: 18,           duration: 1,             row: 'primary',   category: 'work',     flexible: true  },
]
