export interface CalendarEvent {
  id: string
  title: string
  day: number // 0 = Monday, 6 = Sunday
  startHour: number // e.g. 9.5 = 09:30
  endHour: number
  track: 'primary' | 'secondary'
}
