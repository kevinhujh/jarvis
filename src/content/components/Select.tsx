import { Fade, OutlinedInput, Select as MUISelect, MenuItem, ListSubheader } from '@mui/material'
import clsx from 'clsx'
import type { ReactNode } from 'react'

type SelectClassNames = {
  root?: string
  input?: string
  notchedOutline?: string
  select?: string
  paper?: string
  menuItem?: string
  listSubheader?: string
}

type Option<T extends string | number> = { value: T; label: ReactNode }

type Props<T extends string | number> = {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  disabled?: boolean
  width?: number | string
  header?: ReactNode
  classNames?: SelectClassNames
}

export default function Select<T extends string | number>({
  value,
  onChange,
  options,
  disabled,
  width = '100%',
  header,
  classNames,
}: Props<T>) {
  return (
    <MUISelect
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      disabled={disabled}
      size="small"
      style={{ width }}
      className={clsx(classNames?.root)}
      input={
        <OutlinedInput
          classes={{
            root: clsx(
              classNames?.input ??
                'rounded-md text-small bg-surface-primary text-content-primary ring ring-border-primary focus:ring-brand-primary focus-within:ring-brand-primary transition'
            ),
            notchedOutline: clsx(classNames?.notchedOutline ?? 'border-0'),
          }}
        />
      }
      classes={{
        select: clsx(classNames?.select ?? 'py-1.5 px-2 min-h-0'),
      }}
      MenuProps={{
        slots: { transition: Fade },
        slotProps: {
          paper: {
            className: clsx(
              classNames?.paper ??
                'bg-surface-primary text-content-primary ring ring-border-primary rounded-sm mt-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
            ),
          },
        },
      }}
    >
      {header && (
        <ListSubheader
          className={clsx(
            classNames?.listSubheader ??
              'text-mini leading-none px-2 pt-2 pb-1 text-content-secondary bg-transparent pointer-events-none'
          )}
        >
          {header}
        </ListSubheader>
      )}
      {options.map((o) => (
        <MenuItem
          key={String(o.value)}
          value={o.value}
          className={clsx(
            classNames?.menuItem ??
              'text-small min-h-0 py-1.5 px-2 [&.Mui-selected]:bg-surface-secondary [&.Mui-selected:hover]:bg-surface-secondary'
          )}
        >
          {o.label}
        </MenuItem>
      ))}
    </MUISelect>
  )
}
