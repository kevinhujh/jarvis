# CLAUDE.md

This file describes the repository — its stack, architecture, and rules to follow when working on this project.
For the project plan and progress, see below.

@docs/CLAUDE.md

## Git Commit Messages

All commit messages should follow the following rules:
- Use the present tense.
- Start with a verb, capitalize the first letter.
- No punctuations and symbols.
- Use the imperative mood.
- Keep it short and to the point.

## Commands

```bash
npm run dev        # start dev server (Vite HMR)
npm run build      # tsc type-check + production build
npm run lint       # ESLint across all files
npm run preview    # serve the production build locally
```

There is no test runner configured yet.

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Bundler | Vite 8 |
| UI components | MUI v9 (emotion-based) |
| Styling | Tailwind CSS v4 + scoped CSS modules |
| Linting | ESLint 10 + typescript-eslint + eslint-config-prettier |
| Formatting | Prettier 3 |
| Utilities | clsx |

## Architecture

Entry: `index.html` → `src/main.tsx` → `src/App.tsx` → `src/Workspace.tsx`

`App.tsx` is a thin entry point — no logic, no layout. `Workspace.tsx` is the layout and logic owner: it holds top-level state, wires providers, and handles view switching.

**Tailwind + MUI coexistence** — two deliberate choices keep them from conflicting:

1. `src/index.css` imports only Tailwind's `theme` and `utilities` layers — preflight is intentionally excluded so MUI component base styles are not reset.
2. `src/main.tsx` wraps the tree in `<StyledEngineProvider injectFirst>`, which places emotion-injected MUI styles at the top of `<head>` so Tailwind utility classes always win specificity battles when applied.

**CSS approach** — global design tokens live as CSS custom properties in `:root` inside `src/index.css` (colors, typography, shadows). Component-scoped styles live in co-located `.css` files (e.g. `App.css`). Use Tailwind utilities for layout and spacing; reach for MUI components for interactive UI elements; use `clsx` to compose conditional class names.

**Context pattern** — shared state lives in `src/content/contexts/`, one subdirectory per context named without the "Context" suffix (e.g. `date/`). Each subdirectory contains exactly three files:

- `context.ts` — exports `type XXXContextProps` and the `createContext` const
- `XXXProvider.tsx` — owns state and effects, wraps children with the context value
- `useXXXContext.ts` — exports the consumer hook; throws if called outside the provider

**Components** — `src/content/components/` holds reusable wrappers around MUI components. Inside a wrapper, import the MUI component under an alias (e.g. `Popover as MUIPopover`) to avoid a namespace clash with the wrapper's own export name.

**Utilities** — `src/content/utils/` holds pure functions with no React dependencies, organized by concern (e.g. `time.ts` for date and time helpers). Module-specific constants stay co-located (e.g. `weektimetable/constants.ts`).

**Layout constants** — pixel-precise alignment between sibling components (e.g. `DayLabelColumn` cell heights matching `DayRow` heights) is enforced via shared JS constants in a co-located `constants.ts`, applied through inline `style={}` props. Avoid encoding these values in Tailwind classes — Tailwind arbitrary values cannot be referenced across files. One constant is the source of truth; others are derived from it (e.g. `DAY_ROW_HEIGHT = EVENT_ROW_HEIGHT * ROWS_PER_DAY`).

**Multi-export modules** — when a file has no single dominant export, use a lowercase filename (e.g. `activityPanels.tsx`). All exports are named; there is no default. Use this pattern sparingly — only when the exports are tightly coupled and belong together conceptually.

**Extensible slot pattern** — chart slots (and similar extensible UI slots) are registered as `type ChartTab = { id: string; label: string }`. The `id` drives context state and conditional rendering; the `label` drives the segmented control UI. Adding a new chart means appending to the tab array — no structural changes required.

**Maintenance** — when a commit introduces a new architectural pattern or convention, update this file in the same commit; when it adds new components, layouts, or features, also update `docs/CLAUDE.md`. Docs that drift behind the code are worse than no docs.

**TypeScript** is configured in bundler mode with strict unused-variable checking (`noUnusedLocals`, `noUnusedParameters`). `erasableSyntaxOnly` is enabled — avoid TypeScript-only syntax that emits runtime code (e.g. `enum`, parameter properties). Prefer `type` over `interface` for all type definitions.
