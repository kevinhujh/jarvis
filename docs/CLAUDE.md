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

| Type  | Duration     | Label behavior                          |
|-------|--------------|-----------------------------------------|
| Short | < 30 min*    | Static, left-aligned to brick left edge |
| Long  | ≥ 30 min*    | Sliding (see below)                     |

*30 min is a starting threshold — tune to 1h if a 30-min brick cannot comfortably hold a ~20 char title.

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
