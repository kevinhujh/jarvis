import { IconButton } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useThemeContext } from '../contexts/theme/useThemeContext'

export default function TopBar() {
  const { isDark, toggle } = useThemeContext()

  return (
    <div className="shrink-0 h-12 flex items-center justify-between px-4 border-b border-border-primary bg-surface-primary">
      <span className="text-sm font-semibold tracking-tight text-content-primary">Jarvis</span>

      <div className="flex items-center gap-1">
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
      </div>
    </div>
  )
}
