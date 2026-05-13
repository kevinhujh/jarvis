import { TextField as MUITextField } from '@mui/material'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import clsx from 'clsx'
import type { KeyboardEvent, ClipboardEvent, WheelEvent } from 'react'

type NumberFieldClassNames = {
  root?: string
  input?: string
  notchedOutline?: string
  htmlInput?: string
}

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
  classNames?: NumberFieldClassNames
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
  classNames,
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
      style={{ width }}
      slotProps={{
        root: {
          className: clsx(classNames?.root),
        },
        input: {
          className: clsx(
            classNames?.input ??
              'rounded-md text-small bg-surface-primary text-content-primary ring ring-border-primary focus:ring-brand-primary focus-within:ring-brand-primary transition'
          ),
          classes: {
            notchedOutline: clsx(classNames?.notchedOutline ?? 'border-0'),
          },
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
        htmlInput: {
          className: clsx(
            classNames?.htmlInput ?? 'py-1.5 px-2 caret-transparent cursor-default'
          ),
          readOnly: true,
          inputMode: 'none',
          onKeyDown: blockTyping,
          onPaste: blockPaste,
        },
      }}
    />
  )
}
