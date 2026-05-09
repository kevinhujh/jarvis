import { useState, useCallback } from 'react'
import { SNAP_WIDTH } from './constants'

export default function SnapGrid() {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left
    setHoveredCell(Math.floor(x / SNAP_WIDTH))
  }, [])

  const handleMouseLeave = useCallback(() => setHoveredCell(null), [])

  return (
    <div
      className="absolute inset-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {hoveredCell !== null && (
        <div
          className="absolute inset-y-0 bg-brand-primary/15 pointer-events-none"
          style={{ left: hoveredCell * SNAP_WIDTH, width: SNAP_WIDTH }}
        />
      )}
    </div>
  )
}
