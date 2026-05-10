import { TextField as MUITextField } from '@mui/material'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import type { KeyboardEvent, ClipboardEvent, WheelEvent } from 'react'

type Props = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  width?: number | string
  // When set, the displayed value is zero-padded to this many digits
  // (e.g. padTo={2} renders 9 as "09"). Affects display only.
  padTo?: number
}

// Block typing — value can only change via the arrow buttons or scroll wheel.
// Tab/Shift-Tab pass through so keyboard focus traversal still works.
const blockTyping = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Tab') return
  e.preventDefault()
}
const blockPaste = (e: ClipboardEvent<HTMLInputElement>) => e.preventDefault()

export default function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  width = 64,
  padTo,
}: Props) {
  const clamp = (v: number) => {
    if (min !== undefined && v < min) return min
    if (max !== undefined && v > max) return max
    return v
  }
  const increment = () => {
    if (!disabled) onChange(clamp(value + step))
  }
  const decrement = () => {
    if (!disabled) onChange(clamp(value - step))
  }
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    if (e.deltaY < 0) increment()
    else if (e.deltaY > 0) decrement()
  }

  const display = padTo !== undefined ? String(value).padStart(padTo, '0') : String(value)

  const arrowBtn =
    'flex items-center justify-center bg-transparent cursor-pointer hover:bg-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed select-none'

  return (
    <MUITextField
      type="text"
      size="small"
      value={display}
      disabled={disabled}
      slotProps={{
        htmlInput: {
          readOnly: true,
          inputMode: 'none',
          onKeyDown: blockTyping,
          onPaste: blockPaste,
        },
        input: {
          onWheel,
          endAdornment: (
            <div className="flex flex-col -my-1.5 -mr-1.5">
              <button
                type="button"
                onClick={increment}
                disabled={disabled}
                className={arrowBtn}
                style={{ width: 18, height: 14 }}
              >
                <ArrowDropUpIcon sx={{ fontSize: 16 }} />
              </button>
              <button
                type="button"
                onClick={decrement}
                disabled={disabled}
                className={arrowBtn}
                style={{ width: 18, height: 14 }}
              >
                <ArrowDropDownIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          ),
        },
      }}
      sx={{
        width,
        '& .MuiOutlinedInput-root': {
          borderRadius: '6px',
          fontSize: 'var(--text-small)',
          backgroundColor: 'var(--color-surface-primary)',
          color: 'var(--color-content-primary)',
          '& fieldset': {
            borderColor: 'var(--color-border-primary)',
          },
          '&:hover fieldset': {
            borderColor: 'var(--color-border-primary)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--color-brand-primary)',
            borderWidth: '1px',
          },
        },
        '& .MuiOutlinedInput-input': {
          padding: '6px 8px',
          caretColor: 'transparent',
          cursor: 'default',
        },
      }}
    />
  )
}
