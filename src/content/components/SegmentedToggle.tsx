import {
  ToggleButtonGroup as MUIToggleButtonGroup,
  ToggleButton as MUIToggleButton,
  Tooltip,
} from '@mui/material'
import type { SegmentedItem } from './types'

type Key = string | number | boolean

type CommonProps<T extends Key> = {
  items: SegmentedItem<T>[]
  fullWidth?: boolean
  // Group-level className passed to the ToggleButtonGroup root.
  className?: string
  // Per-item className resolver. Receives (key, isActive, isDisabled) so the
  // caller can compose state-aware classes for each ToggleButton.
  getItemClassName?: (key: T, isActive: boolean, isDisabled: boolean) => string
}

type ExclusiveProps<T extends Key> = CommonProps<T> & {
  exclusive: true
  value: T
  onChange: (value: T) => void
}

type MultipleProps<T extends Key> = CommonProps<T> & {
  exclusive?: false
  value: T[]
  onChange: (value: T[]) => void
}

type Props<T extends Key> = ExclusiveProps<T> | MultipleProps<T>

// Explicit type-predicate guard so TypeScript narrows reliably across versions.
// The optional `exclusive?: false` on MultipleProps means a simple `if
// (props.exclusive)` ternary narrows fine in some TS versions but falls back
// to the union (`Key | T[]`) in others; the guard forces narrowing.
function isExclusive<T extends Key>(p: Props<T>): p is ExclusiveProps<T> {
  return p.exclusive === true
}

// Component-default styling for the selected state uses the project's brand
// palette via CSS variables. Callers can override per-item via
// getItemClassName — Tailwind utilities land in `@layer utilities` which sits
// above `@layer mui` (where this sx ends up), so plain class overrides win.
const defaultSx = {
  '& .MuiToggleButton-root': {
    color: 'var(--color-content-primary)',
    borderColor: 'var(--color-border-primary)',
  },
  '& .MuiToggleButton-root.Mui-selected': {
    backgroundColor: 'var(--color-brand-primary)',
    color: 'var(--color-white)',
    '&:hover': {
      backgroundColor: 'var(--color-brand-secondary)',
    },
  },
}

export default function SegmentedToggle<T extends Key>(props: Props<T>) {
  const { items, fullWidth = false, className, getItemClassName } = props

  const isActiveFor = (key: T): boolean => {
    if (isExclusive(props)) return key === props.value
    return props.value.includes(key)
  }

  const handleChange = (_: React.MouseEvent<HTMLElement>, v: T | T[] | null) => {
    if (isExclusive(props)) {
      // MUI emits null when the user clicks the currently-selected item.
      // For a single-select control we keep the previous selection rather
      // than allow a no-selection state.
      if (v !== null) props.onChange(v as T)
    } else {
      props.onChange((v ?? []) as T[])
    }
  }

  return (
    <MUIToggleButtonGroup
      value={props.value}
      exclusive={props.exclusive ?? false}
      onChange={handleChange}
      fullWidth={fullWidth}
      className={className}
      sx={defaultSx}
    >
      {items.map((item) => {
        const isActive = isActiveFor(item.key)
        // Tooltip wraps the label content (not the ToggleButton) so MUI's
        // Children.map still sees ToggleButton as the direct child for
        // first/middle/last button class wiring.
        const labelNode = item.tooltip ? (
          <Tooltip title={item.tooltip} placement="bottom">
            <span>{item.label}</span>
          </Tooltip>
        ) : (
          item.label
        )
        return (
          <MUIToggleButton
            key={String(item.key)}
            id={item.id}
            value={item.key}
            disabled={item.disabled}
            className={getItemClassName?.(item.key, isActive, !!item.disabled)}
          >
            {labelNode}
          </MUIToggleButton>
        )
      })}
    </MUIToggleButtonGroup>
  )
}
