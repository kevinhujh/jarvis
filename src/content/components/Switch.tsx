import { Switch as MUISwitch } from '@mui/material'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

// iOS-style: track encloses the thumb (thumb sits inside the rounded track
// with 2px padding all around). Brand color when checked, neutral surface off.
export default function Switch({ checked, onChange, disabled }: Props) {
  return (
    <MUISwitch
      checked={checked}
      onChange={(_, c) => onChange(c)}
      disabled={disabled}
      disableRipple
      focusVisibleClassName=".Mui-focusVisible"
      sx={{
        width: 36,
        height: 20,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: '2px',
          transitionDuration: '300ms',
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: 'var(--color-brand-primary)',
              opacity: 1,
              border: 0,
            },
          },
          '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.5,
          },
        },
        '& .MuiSwitch-thumb': {
          boxSizing: 'border-box',
          width: 16,
          height: 16,
          boxShadow: 'none',
        },
        '& .MuiSwitch-track': {
          borderRadius: 10,
          backgroundColor: 'var(--color-surface-secondary)',
          opacity: 1,
          transition: 'background-color 300ms',
        },
      }}
    />
  )
}
