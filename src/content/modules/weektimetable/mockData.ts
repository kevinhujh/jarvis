import type { CalendarEvent } from '../../types'

// day 0 = Monday of current week, day 4 = Friday (today)
export const mockEvents: CalendarEvent[] = [
  // Monday
  { id: '1',  title: 'Team standup',     day: 0, startHour: 9,               endHour: 9.25,            track: 'primary' },
  { id: '2',  title: 'Product review',   day: 0, startHour: 10,              endHour: 11.5,            track: 'primary' },
  { id: '3',  title: 'Email catchup',    day: 0, startHour: 9,               endHour: 10,              track: 'secondary' },

  // Tuesday
  { id: '4',  title: 'Design sprint',    day: 1, startHour: 9,               endHour: 12,              track: 'primary' },
  { id: '5',  title: 'Lunch with Alex',  day: 1, startHour: 12.5,            endHour: 13.5,            track: 'primary' },
  { id: '6',  title: 'Playlist',         day: 1, startHour: 9,               endHour: 12,              track: 'secondary' },

  // Wednesday
  { id: '7',  title: 'Client call',      day: 2, startHour: 14,              endHour: 15,              track: 'primary' },
  { id: '8',  title: 'Weekly report',    day: 2, startHour: 16,              endHour: 17,              track: 'primary' },
  { id: '9',  title: 'Gardener',         day: 2, startHour: 13,              endHour: 16,              track: 'secondary' },

  // Thursday
  { id: '10', title: 'Doctor',           day: 3, startHour: 9.5,             endHour: 10.5,            track: 'primary' },
  { id: '11', title: 'Code review',      day: 3, startHour: 13,              endHour: 14,              track: 'primary' },

  // Friday — today; first event at 07:00 drives initial scroll
  { id: '12', title: 'Morning jog',      day: 4, startHour: 7,               endHour: 7.5,             track: 'primary' },
  { id: '13', title: 'Release planning', day: 4, startHour: 10,              endHour: 11,              track: 'primary' },
  { id: '14', title: 'Critical pitch',   day: 4, startHour: 14 + 5 / 60,    endHour: 14 + 10 / 60,   track: 'primary' },
  { id: '15', title: 'Online course',    day: 4, startHour: 15,              endHour: 17,              track: 'secondary' },

  // Saturday
  { id: '16', title: 'Grocery shopping', day: 5, startHour: 10,              endHour: 11,              track: 'primary' },
  { id: '17', title: 'Laundry',          day: 5, startHour: 10.5,            endHour: 11.5,            track: 'secondary' },

  // Sunday
  { id: '18', title: 'Weekly review',    day: 6, startHour: 18,              endHour: 19,              track: 'primary' },
]
