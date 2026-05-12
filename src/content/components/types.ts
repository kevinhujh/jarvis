import type { ReactNode } from 'react'

// Shared item shape for segmented controls (SegmentedTabs, SegmentedToggle).
// `key` is the logical value; `label` is the rendered content. Constrained to
// primitive-like keys so equality checks and React keys behave predictably.
export type SegmentedItem<T extends string | number | boolean> = {
  id?: string
  key: T
  label: ReactNode
  disabled?: boolean
  tooltip?: string
}
