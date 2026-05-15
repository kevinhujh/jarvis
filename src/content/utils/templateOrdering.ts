import { CATEGORIES } from '../categoryColors'
import type { EventTemplate } from '../types'

const CATEGORY_INDEX = new Map(CATEGORIES.map((c, i) => [c, i]))

// Deterministic 4-layer comparator. Layers cascade — earlier layers take
// precedence, later layers tie-break.
//
//   1. flexibility  — flexible templates before inflexible ones
//   2. category     — canonical CATEGORIES order (same array drives the
//                     category picker and the chip filter)
//   3. title        — locale-aware alphabetical
//   4. createdAt    — older first (only reached when every other field is
//                     identical; rare, but keeps the order stable)
function compareTemplates(a: EventTemplate, b: EventTemplate): number {
  if (a.flexible !== b.flexible) return a.flexible ? -1 : 1

  const ai = CATEGORY_INDEX.get(a.category) ?? Number.MAX_SAFE_INTEGER
  const bi = CATEGORY_INDEX.get(b.category) ?? Number.MAX_SAFE_INTEGER
  if (ai !== bi) return ai - bi

  const titleCmp = a.title.localeCompare(b.title)
  if (titleCmp !== 0) return titleCmp

  return a.createdAt - b.createdAt
}

export function sortTemplates(templates: EventTemplate[]): EventTemplate[] {
  return [...templates].sort(compareTemplates)
}
