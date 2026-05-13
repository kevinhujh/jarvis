import { useMemo } from 'react'

import type { Accessors, Facets, Prim } from '../types'

const toArr = (v: Prim | Prim[] | null | undefined): Prim[] =>
  v == null ? [] : Array.isArray(v) ? v : [v]

/**
 * Generic faceted filter. State (the `facets` object) is the consumer's
 * responsibility; this hook is a pure transformation: items + accessors +
 * facets → filteredItems + facetCounts.
 *
 * @template K - Union of facet keys (e.g. `'category' | 'priority'`).
 * @template T - Item type (e.g. `EventTemplate`).
 */
type UseFacetFilterProps<K extends string, T> = {
  items: T[]
  /** Maps each facet key to a getter that extracts the filterable value(s) from an item. */
  accessors: Partial<Accessors<K, T>>
  /** Maps each facet key to the array of currently selected values. Empty array means "no filter on this facet". */
  facets: Facets<K>
  /**
   * Empty-set semantic per facet.
   * - `include` (default): empty array on a facet ⇒ include everything (no filtering on that axis)
   * - `strict-include`: empty array on ALL facets ⇒ include nothing
   * - `exclude`: matching values are excluded rather than included
   */
  filterMode?: 'include' | 'strict-include' | 'exclude'
}

const useFacetFilter = <K extends string, T>({
  items,
  accessors,
  facets,
  filterMode = 'include',
}: UseFacetFilterProps<K, T>) => {
  const keys = useMemo(() => Object.keys(accessors) as K[], [accessors])

  const filteredItems = useMemo(() => {
    const activeKeys = keys.filter((k) => (facets[k]?.length ?? 0) > 0)
    if (activeKeys.length === 0) {
      return filterMode === 'strict-include' ? [] : items
    }

    return items.filter((item) => {
      for (const k of activeKeys) {
        const facetVals = facets[k]!
        const vals = toArr(accessors[k] ? accessors[k]!(item) : undefined)
        const match = vals.some((v) => facetVals.includes(v))
        if (filterMode !== 'exclude') {
          if (!match) return false
        } else {
          if (match) return false
        }
      }
      return true
    })
  }, [items, keys, accessors, facets, filterMode])

  const facetCounts = useMemo(() => {
    const counts = {} as Record<K, Map<Prim, number>>
    for (const k of keys) counts[k] = new Map<Prim, number>()
    for (const item of filteredItems) {
      for (const k of keys) {
        const vals = toArr(accessors[k] ? accessors[k]!(item) : undefined)
        for (const v of vals) {
          counts[k].set(v, (counts[k].get(v) ?? 0) + 1)
        }
      }
    }
    return counts
  }, [filteredItems, accessors, keys])

  return { filteredItems, facetCounts }
}

export default useFacetFilter
