import { useState } from 'react'
import { IconButton } from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import Popover from '../components/Popover'
import MiniCalendar from './MiniCalendar'
import { useThemeContext } from '../contexts/theme/useThemeContext'

export default function TopBar() {
  const { isDark, toggle } = useThemeContext()
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLButtonElement | null>(null)

  return (
    <div className="shrink-0 h-12 flex items-center justify-between px-4 border-b border-border-primary bg-surface-primary">
      <span className="text-sm font-semibold tracking-tight text-content-primary">Jarvis</span>

      <div className="flex items-center gap-1">
        <IconButton
          size="small"
          onClick={(e) => setCalendarAnchor(e.currentTarget)}
          sx={{ color: 'var(--color-content-secondary)' }}
        >
          <CalendarMonthIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <IconButton
          size="small"
          onClick={toggle}
          sx={{ color: 'var(--color-content-secondary)' }}
        >
          {isDark ? (
            <LightModeIcon sx={{ fontSize: 20 }} />
          ) : (
            <DarkModeIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>

        <Popover
          open={Boolean(calendarAnchor)}
          anchorEl={calendarAnchor}
          onClose={() => setCalendarAnchor(null)}
        >
          <MiniCalendar />
        </Popover>
      </div>
    </div>
  )
}
