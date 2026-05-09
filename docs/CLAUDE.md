# Project Plan

Jarvis is a personal secretary app focused on productivity and time management.
To understand current progress, compare this plan against the actual state of the codebase.

---

## App Layout

Three top-level regions:

- **TopBar** (top strip) — global tools accessible from any view: theme toggle, calendar popover, and future global actions.
- **Sidebar** (left, collapsible) — main navigation; switches between views; collapses to icon-only width to preserve horizontal space for time-based content. Not yet implemented.
- **Content** (remainder) — hosts the active view.

---

## Feature 1: Week Timetable

The first view to implement. Accessible from the sidebar and rendered in the content area.

### Why horizontal (Gantt-style) over vertical

Traditional vertical timetables have two pain points:

1. **Cross-day comparison** — hard to see at a glance how events distribute across the 24 hours of different days. Horizontal layout puts days as rows so you can scan vertically across them.
2. **Soft multitasking** — vertical timetables assume one event per time slot. Modern work is fragmented; people are accountable for overlapping things without being fully present in both. Rather than allowing infinite overlap, we loosen the restriction by exactly one step: two event rows per day.

### Layout

```
WeekTimetable                         flex row, full height
  ├── Main column                     flex col, flex-1, min-w-0
  │     ├── Summary card              shrink-0, minHeight=SUMMARY_MIN_HEIGHT
  │     │     ├── Upper half          WeekDensityPanel (flex-1)
  │     │     └── Lower half          DayDensityPanel  (flex-1)
  │     └── Timetable row             flex row, flex-1
  │           ├── DayLabelColumn      shrink-0, w-30
  │           └── Grid container      flex col, flex-1, rounded card
  │                 └── scroll area   overflow-x-auto
  │                       ├── TimeAxisHeader
  │                       └── DayRow (×7)
  │                             ├── primaryEventRow   → <EventRow variant="primary" />
  │                             └── secondaryEventRow → <EventRow variant="secondary" />
  ├── Library pull tab                shrink-0, w-10, toggles drawer
  └── Library drawer                  w-[260px] | w-0, animated transition
        └── EventLibrary              vertical list of template cards
```

`TimeAxisHeader` lives inside the same `overflow-x-auto` scroll container as the `DayRow`s — this is what keeps them in sync without any manual transform or ref forwarding.

Each `DayRow` has a **primary** and **secondary** event row. Primary sits on top — vertical position naturally communicates priority without needing extra labels or color coding. The `primaryEventRow` and `secondaryEventRow` are consts within `DayRow`, both rendering the shared `EventRow` component.

### EventRow internals

Each `EventRow` is split into two internal sub-rows:

```
EventRow
  ├── [top]    EventLabel row
  └── [bottom] EventBrick row
```

Separating labels from bricks solves the short-event labeling problem: a 5-minute pitch still needs a visible title, but its brick is too narrow to hold it. With labels in their own row, length is unconstrained by brick width.

`EventBrick` accepts a `scale` prop (`"duration"` | `"importance"` | ...) so the metric driving brick width is parametrized and swappable in the future.

### Event types (uniform timeline view only)

| Type  | Duration   | Label behavior                          |
| ----- | ---------- | --------------------------------------- |
| Short | < 30 min\* | Static, left-aligned to brick left edge |
| Long  | ≥ 30 min\* | Sliding (see below)                     |

\*30 min is a starting threshold — tune to 1h if a 30-min brick cannot comfortably hold a ~20 char title.

### Label sliding behavior (long events only)

The label slides horizontally within the brick as the user scrolls, always staying visible while any part of the brick is in the viewport:

```
Scroll 0:  [label__  ]         left-aligned to brick, fully visible
           [brick_____]

Scroll 1:       |[label__]     viewport left edge cuts in, label slides right
                |[brick___]

Scroll 2:       |[__label]     label hits right bound (brick right edge), stops
                |[_brick__]

Scroll 3:        |[_label→     label clips with the brick, both overflow-hidden
                 |[brick→
```

Implemented as: `clamp(viewportLeft, brick.left, brick.right - label.width)`

### Title truncation

Titles are never rejected at input. Long titles are silently truncated so the label always fits within the brick for long events. This is intentional — a less disruptive way to guide users toward shorter titles.

### Label collision (consecutive short events)

Since events within one row cannot overlap, label collisions only happen when several short events appear consecutively. In that case labels stack vertically. If a label is hidden under a stack, hovering the corresponding brick reveals it.

---

### Event data model

```ts
type CalendarEvent = {
  id: string
  day: number // 0=Mon … 6=Sun
  startTime: number // e.g. 9.5 = 09:30
  duration: number // hours; endHour is computed as startHour + duration
  title: string
  category: string // 'work' | 'personal' | 'family' | 'health' | etc.
  row: 'primary' | 'secondary'
  flexible: boolean // true = can be pushed; false = immovable anchor
}
```

`endHour` is never stored — always computed. Day boundaries (hour 0 and hour 24) behave as implicit inflexible anchors for push collision purposes.

---

### Drag and drop

Six incremental steps:

1. **Data model** — migrate `mockEvents` to `startHour + duration` shape; add `flexible` flag; remove `endHour` from storage
2. **Drop zones + snapping grid** — overlay invisible 5-minute snap cells across each `EventRow`; show hover highlight on valid drop targets; no actual placement yet
3. **Place from library** — drag a template card from `EventLibrary` onto a snap cell; event appears at that position
4. **Relocate from grid** — drag an existing brick to a new position within the grid; remove from old slot, insert at new slot
5. **Push mechanics** — when a flexible event would overlap another, push the chain in the direction implied by the drop position; show a red shake animation if the chain hits an inflexible event or a day boundary (fail state, no mutation)
6. **Edge resize** — drag the right edge of a brick to extend or shrink duration in 5-minute increments

#### Push cascade rules

- A **flexible** event can be displaced by an incoming event or another cascade.
- An **inflexible** event cannot move; if a cascade reaches one, the entire drag fails (animated shake, no mutation).
- Day boundaries (hour 0, hour 24) are treated as inflexible anchors — events cannot be pushed past midnight.
- Push direction follows the drop: events whose start precedes the drop are pushed backward (earlier); events whose start matches or follows the drop are pushed forward (later). This preserves the lead/trail ordering implied by where the user dropped the event.

#### Snapping

All positions snap to 5-minute intervals: `Math.round(rawHour * 12) / 12`.
