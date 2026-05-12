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

**Tailwind + MUI coexistence** — three deliberate choices keep Tailwind utilities winning over MUI defaults without the `!` important modifier:

1. `src/index.css` imports only Tailwind's `theme` and `utilities` layers — preflight is intentionally excluded so MUI component base styles are not reset.
2. `src/index.css` declares the cascade-layer order `@layer theme, base, components, mui, utilities;` and puts the universal `box-sizing: border-box` reset inside `@layer base` (not unlayered). MUI components like `OutlinedInput` deliberately set `box-sizing: content-box` on inputs and rely on it for height; an unlayered reset would override them and squash the inputs.
3. `src/main.tsx` creates an emotion cache with `prepend: false` and monkey-patches `cache.sheet.insert` to wrap every emitted rule in `@layer mui { ... }`. `prepend: false` is critical — with it on, emotion injects above `index.css` and the first occurrence of `@layer mui` locks the layer at the bottom of the cascade, inverting the intended order. Stylis middleware plugins were tried first but emotion places `stringify` after user plugins so `element.return` is empty when the plugin runs; the `sheet.insert` patch operates on the already-serialized rule.

With this in place, plain Tailwind utility classes on MUI components (`<Divider className="mx-2 my-1 border-border-primary" />`, `<Paper className="rounded-md ring ring-border-primary bg-surface-primary" />`) override MUI's defaults naturally — no `!` modifier required.

**CSS approach** — global design tokens live as CSS custom properties in `:root` inside `src/index.css` (colors, typography, shadows). Component-scoped styles live in co-located `.css` files (e.g. `App.css`). Use Tailwind utilities for layout and spacing; reach for MUI components for interactive UI elements; use `clsx` to compose conditional class names.

**Tailwind spacing** — for paddings, margins, gaps, and `space-x`/`space-y` utilities:

1. **Use `1` or even multiples only** (`p-1`, `p-2`, `p-4`, `p-6`, `p-8`, ...). No odd integers (`p-3`, `gap-5`) and no halves (`py-1.5`). Mixing odd and even spacing breaks visual rhythm because adjacent elements stop sharing a common multiple. The `1` unit (4px) is allowed for tight pairings like label-to-field gaps.
2. **Shorthand when horizontal and vertical match** — `p-4` not `px-4 py-4`, `m-2` not `mx-2 my-2`.
3. **Prefer scale tokens over arbitrary brackets.** `--spacing: 4px` (set in `src/index.css`), so 280px is `w-70` not `w-[280px]`. Divide the px value by 4 — if the result is on-scale, use the token. Arbitrary brackets are reserved for off-grid values that are *necessary*, e.g. a width that must sum precisely with sibling components to align. In that case, prefer the layout-constants pattern below over inline arbitrary classes.

**Context pattern** — shared state lives in `src/content/contexts/`, one subdirectory per context named without the "Context" suffix (e.g. `date/`). Each subdirectory contains exactly three files:

- `context.ts` — exports `type XXXContextProps` and the `createContext` const
- `XXXProvider.tsx` — owns state and effects, wraps children with the context value
- `useXXXContext.ts` — exports the consumer hook; throws if called outside the provider

**Components** — `src/content/components/` holds reusable wrappers around MUI components. Inside a wrapper, import the MUI component under an alias (e.g. `Popover as MUIPopover`) to avoid a namespace clash with the wrapper's own export name.

**Utilities** — `src/content/utils/` holds pure functions with no React dependencies, organized by concern (e.g. `time.ts` for date and time helpers). Module-specific constants stay co-located (e.g. `weektimetable/constants.ts`).

**Layout constants** — pixel-precise alignment between sibling components (e.g. `DayLabelColumn` cell heights matching `DayRow` heights) is enforced via shared JS constants in a co-located `constants.ts`, applied through inline `style={}` props. Avoid encoding these values in Tailwind classes — Tailwind arbitrary values cannot be referenced across files. One constant is the source of truth; others are derived from it (e.g. `DAY_ROW_HEIGHT = EVENT_ROW_HEIGHT * ROWS_PER_DAY`).

**Multi-export modules** — when a file has no single dominant export, use a lowercase filename (e.g. `activityPanels.tsx`). All exports are named; there is no default. Use this pattern sparingly — only when the exports are tightly coupled and belong together conceptually.

**Extensible slot pattern** — chart slots (and similar extensible UI slots) are registered as `type ChartTab = { id: string; label: string }`. The `id` drives context state and conditional rendering; the `label` drives the segmented control UI. Adding a new chart means appending to the tab array — no structural changes required.

**Maintenance** — when a commit introduces a new architectural pattern or convention, update this file in the same commit. Keep `docs/CLAUDE.md` in sync with the code locally as new components, layouts, or features land; it is not versioned (gitignored), so updates do not need to ride along with commits. Docs that drift behind the code are worse than no docs.

**TypeScript** is configured in bundler mode with strict unused-variable checking (`noUnusedLocals`, `noUnusedParameters`). `erasableSyntaxOnly` is enabled — avoid TypeScript-only syntax that emits runtime code (e.g. `enum`, parameter properties). Prefer `type` over `interface` for all type definitions.
