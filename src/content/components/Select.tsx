import { Select as MUISelect, MenuItem, ListSubheader } from '@mui/material'
import type { ReactNode } from 'react'

type Option<T extends string | number> = { value: T; label: ReactNode }

type Props<T extends string | number> = {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  disabled?: boolean
  width?: number | string
  header?: ReactNode
}

export default function Select<T extends string | number>({
  value,
  onChange,
  options,
  disabled,
  width = '100%',
  header,
}: Props<T>) {
  return (
    <MUISelect
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      disabled={disabled}
      size="small"
      sx={{
        width,
        borderRadius: '6px',
        fontSize: 'var(--text-small)',
        backgroundColor: 'var(--color-surface-primary)',
        color: 'var(--color-content-primary)',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--color-border-primary)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--color-border-primary)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--color-brand-primary)',
          borderWidth: '1px',
        },
        '& .MuiSelect-select': {
          padding: '6px 8px',
          minHeight: 'unset',
        },
      }}
      MenuProps={{
        slotProps: {
          paper: {
            sx: {
              backgroundColor: 'var(--color-surface-primary)',
              color: 'var(--color-content-primary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              mt: 0.5,
              '& .MuiMenuItem-root': {
                fontSize: 'var(--text-small)',
                minHeight: 'unset',
                padding: '6px 8px',
              },
              '& .MuiMenuItem-root.Mui-selected': {
                backgroundColor: 'var(--color-surface-secondary)',
              },
              '& .MuiMenuItem-root.Mui-selected:hover': {
                backgroundColor: 'var(--color-surface-secondary)',
              },
              '& .MuiListSubheader-root': {
                fontSize: 'var(--text-mini)',
                lineHeight: 1,
                padding: '8px 8px 4px',
                color: 'var(--color-content-secondary)',
                backgroundColor: 'transparent',
                pointerEvents: 'none',
              },
            },
          },
        },
      }}
    >
      {header && <ListSubheader>{header}</ListSubheader>}
      {options.map((o) => (
        <MenuItem key={String(o.value)} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </MUISelect>
  )
}
