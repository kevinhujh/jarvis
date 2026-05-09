import { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import TestGround from './content/TestGround'
import WeekTimetable from './content/modules/weektimetable/WeekTimetable'
import DateProvider from './content/contexts/date/DateProvider'
import TopBar from './content/modules/TopBar'

type View = 'landing' | 'app' | 'testground'

export default function Workspace() {
  const [view, setView] = useState<View>('landing')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '=') setView('landing')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (view === 'app') {
    return (
      <DateProvider>
        <div id="workspace" className={isDark ? 'dark' : ''}>
          <div className="h-screen flex flex-col bg-background-primary text-content-primary">
            <TopBar isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} />
            <div data-testid="timetable-dashboard" className="flex-1 flex flex-row min-h-0">
              <div className="flex flex-col flex-1 min-w-0">
                <WeekTimetable />
              </div>
            </div>
          </div>
        </div>
      </DateProvider>
    )
  }

  if (view === 'testground') {
    return <TestGround />
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Button variant="contained" size="large" onClick={() => setView('app')}>
        Open App
      </Button>
      <Button variant="outlined" size="large" onClick={() => setView('testground')}>
        Test Ground
      </Button>
    </div>
  )
}
