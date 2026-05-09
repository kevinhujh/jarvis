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
export const MIN_EVENT_DURATION_MINUTES = 5
