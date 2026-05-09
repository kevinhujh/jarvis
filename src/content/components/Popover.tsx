import { Popover as MUIPopover } from '@mui/material'
import type { PopoverOrigin } from '@mui/material'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  anchorOrigin?: PopoverOrigin
  transformOrigin?: PopoverOrigin
  children: ReactNode
}

const DEFAULT_ANCHOR: PopoverOrigin = { vertical: 'bottom', horizontal: 'right' }
const DEFAULT_TRANSFORM: PopoverOrigin = { vertical: 'top', horizontal: 'right' }

export default function Popover({
  open,
  anchorEl,
  onClose,
  anchorOrigin = DEFAULT_ANCHOR,
  transformOrigin = DEFAULT_TRANSFORM,
  children,
}: Props) {
  return (
    <MUIPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          sx: {
            mt: 0.5,
            background: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
          },
        },
      }}
    >
      {children}
    </MUIPopover>
  )
}
