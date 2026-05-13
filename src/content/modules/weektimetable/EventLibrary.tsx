import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { Divider } from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import SearchIcon from '@mui/icons-material/Search'
import { CATEGORY_COLOR, CATEGORIES } from '../../categoryColors'
import type { EventCategory, EventTemplate } from '../../types'
import { useTimetableContext } from '../../contexts/timetable/useTimetableContext'
import { formatHour, formatDuration } from '../../utils/time'
import { spawnDragGhost } from './dndUtils'
import useFacetFilter from '../../hooks/useFacetFilter'
import SegmentedToggle from '../../components/SegmentedToggle'
import type { SegmentedItem } from '../../components/types'
import { MAX_SEARCH_LENGTH } from './constants'
import NewTemplatePanel from './NewTemplatePanel'

const CATEGORY_ITEMS: SegmentedItem<EventCategory>[] = CATEGORIES.map((c) => ({
  key: c,
  label: (
    <span className="flex items-center gap-1">
      <span className={clsx('w-2 h-2 rounded-full shrink-0', CATEGORY_COLOR[c])} aria-hidden />
      <span>{c}</span>
    </span>
  ),
}))

function TemplateCard({ tpl }: { tpl: EventTemplate }) {
  const { startDrag, endDrag, scrollToTime } = useTimetableContext()

  const durationLabel = formatDuration(tpl.duration)

  const subtitle = tpl.flexible ? durationLabel : `${formatHour(tpl.startTime)} · ${durationLabel}`

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', tpl.id)
        const ghost = spawnDragGhost({
          title: tpl.title,
          subtitle,
          category: tpl.category,
        })
        e.dataTransfer.setDragImage(ghost, 20, 20)
        startDrag({ kind: 'template', templateId: tpl.id })
        if (!tpl.flexible) scrollToTime(tpl.startTime)
      }}
      onDragEnd={endDrag}
      className={clsx(
        'flex items-center justify-between px-2 py-2 rounded-md text-white text-small font-medium select-none cursor-grab active:cursor-grabbing',
        CATEGORY_COLOR[tpl.category]
      )}
    >
      <div className="flex flex-col min-w-0">
        <span className="truncate">{tpl.title}</span>
        <span className="text-small opacity-70">{subtitle}</span>
      </div>
      <DragIndicatorIcon sx={{ fontSize: 16, opacity: 0.6, flexShrink: 0 }} />
    </div>
  )
}

function Section({ label, templates }: { label: string; templates: EventTemplate[] }) {
  if (templates.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <span className="text-mini text-content-secondary uppercase tracking-widest">{label}</span>
      {templates.map((tpl) => (
        <TemplateCard key={tpl.id} tpl={tpl} />
      ))}
    </div>
  )
}

const FACET_ACCESSORS = {
  category: (t: EventTemplate) => t.category,
}

export default function EventLibrary() {
  const { templates } = useTimetableContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFacet, setCategoryFacet] = useState<EventCategory[]>([])

  const facets = useMemo(() => ({ category: categoryFacet }), [categoryFacet])
  const { filteredItems } = useFacetFilter<'category', EventTemplate>({
    items: templates,
    accessors: FACET_ACCESSORS,
    facets,
  })

  const q = searchQuery.trim().toLowerCase()
  const matched = q ? filteredItems.filter((t) => t.title.toLowerCase().includes(q)) : filteredItems

  const flexible = matched.filter((t) => t.flexible)
  const inflexible = matched.filter((t) => !t.flexible)
  const showEmpty = matched.length === 0 && (q.length > 0 || categoryFacet.length > 0)

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Utility panel: search, filters, sort, and other list-scope actions */}
      <div className="shrink-0 p-4 flex flex-col gap-4">
        <div
          className={clsx(
            'w-full pb-2 border-b border-border-primary bg-surface-primary',
            'flex items-center gap-2 focus-within:border-brand-primary'
          )}
        >
          <SearchIcon className="text-content-secondary" fontSize="inherit" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxLength={MAX_SEARCH_LENGTH}
            placeholder="Search templates..."
            className="flex-1 min-w-0 bg-transparent outline-none text-content-primary text-small"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-mini text-content-secondary uppercase tracking-widest">
            Advanced Filtering
          </span>

          <SegmentedToggle<EventCategory>
            exclusive={false}
            value={categoryFacet}
            onChange={setCategoryFacet}
            items={CATEGORY_ITEMS}
            className="flex-wrap gap-2"
            getItemClassName={(key) => {
              // Empty facet ⇒ all chips render as active per inclusion-with-empty-as-all
              // convention. MUI's Mui-selected class still tracks the literal selection,
              // but our utility classes (in @layer utilities) win over MUI's defaultSx
              // (in @layer mui), so the visual is driven by isVisuallyActive.
              const isVisuallyActive = categoryFacet.length === 0 || categoryFacet.includes(key)
              return clsx(
                // State lives in `bg` (active vs inactive); hover affordance lives in
                // `text` + `ring` so the two channels never collide. After click, bg
                // flips while cursor-still-over keeps applying the hover effect on the
                // other channels — no inversion confusion (toggle-hover-trap principle).
                'rounded m-0 border-0 min-w-0 px-1 py-0 text-mini uppercase font-medium tracking-wider transition ring ring-border-primary hover:ring-content-secondary hover:text-content-primary',
                isVisuallyActive
                  ? 'bg-surface-secondary text-content-primary'
                  : 'bg-transparent text-content-secondary'
              )
            }}
          />
        </div>
      </div>

      <Divider sx={{ borderColor: 'var(--color-border-primary)' }} />

      {/* pr-2 (8px) + 8px scrollbar gutter = pl-4 (16px), so left/right visual padding match. scrollbar-gutter:stable reserves the gutter whether or not the bar is visible, so template width never reshapes. */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-4 pl-4 pr-2 min-h-0 [scrollbar-gutter:stable]">
        {templates.length === 0 ? (
          <div className="text-center text-content-secondary text-small py-4">
            Create your first template
          </div>
        ) : showEmpty ? (
          <div className="text-center text-content-secondary text-small py-4">
            No matching templates
          </div>
        ) : (
          <>
            <Section label="Flexible" templates={flexible} />
            <Section label="Fixed" templates={inflexible} />
          </>
        )}
      </div>

      <NewTemplatePanel />
    </div>
  )
}
