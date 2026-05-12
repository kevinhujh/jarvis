export const HOUR_WIDTH = 160
export const TOTAL_HOURS = 24
export const TRACK_WIDTH = HOUR_WIDTH * TOTAL_HOURS

export const EVENT_ROW_HEIGHT = 64           // px, source of truth for a single event row
export const ROWS_PER_DAY = 2                // primary + secondary rows per day
export const DAY_ROW_HEIGHT = EVENT_ROW_HEIGHT * ROWS_PER_DAY  // derived: 128px

export const TIME_AXIS_HEIGHT = 28           // px, fixed header above the event rows
export const SCROLLBAR_SIZE = 8              // px, horizontal scrollbar height
export const SUMMARY_MIN_HEIGHT = 200        // px, minimum height of the top summary card

export const SHORT_THRESHOLD = 1.0
export const MAX_EVENT_TEMPLATES = 100
export const MAX_TITLE_LENGTH = 30
export const MIN_EVENT_DURATION_MINUTES = 5
export const SNAPS_PER_HOUR = 60 / MIN_EVENT_DURATION_MINUTES  // 12
export const SNAP_WIDTH = HOUR_WIDTH / SNAPS_PER_HOUR           // px per 5-min cell

// Width of the event library drawer when expanded. Lives as a JS constant
// so the open/closed wrapper and the inner content column read from one
// source — a `w-[280px]` hardcoded in both spots would let them drift.
export const EVENT_LIBRARY_WIDTH = 280

// Right-click context menu dimensions. The strip + panel widths feed both the
// inline `style={{ width: ... }}` on each column AND the anchor-clamp math
// that ensures the menu fits in the viewport. Using a Tailwind `w-40` here
// would let the layout drift silently from the clamp, so JS constants are
// the source of truth and the `style` props read from them.
export const MENU_STRIP_WIDTH = 160       // px, left column of action rows
export const CONFIG_PANEL_WIDTH = 280     // px, right column with the edit form
export const CONTEXT_MENU_HEIGHT = 400    // px, worst-case height used for clamp
export const VIEWPORT_MARGIN = 8          // px, gap between menu edge and viewport
