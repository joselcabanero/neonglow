# neonglow — Web & App Design System

**Date:** 2026-07-04
**Owner:** joseluis@eatableadventures.com (Accelera Ventures)
**Status:** Design approved — ready for implementation planning

---

## 1. Summary

**neonglow** is Accelera Ventures' design system for **web and applications**. It sits
alongside the firm's existing **print/deck** design system (the editorial, "numbers are
the hero" system already in this repository) and extends the same brand primitives — the
green, Ubuntu, the spacing scale — into an interactive, dual-theme, **data-intensive
component library** for building serious operational and analytical applications.

The system is delivered as an installable, versioned family of npm packages under the
`@neonglow/*` scope, built with **React + TypeScript** and styled with a
**token-driven CSS custom-property + CSS Modules** architecture (zero runtime, SSR-safe,
trivially dual-theme).

### Brand context that shaped this design

- The **print system** (local files: `README.md`, `colors_and_type.css`,
  `ui_kits/investor-deck/`) is light/editorial: white grounds, one earned green
  (`#7BF076`), Müller-Brockmann grid, **radius 0, no shadows, no icons, static**.
- The **live marketing site** (`acceleraventures.vc`) is dark-dominant, bold display
  type, the same green — with **rounded green pill buttons** and functional motion.
- neonglow's job is to turn that accidental two-register split into a **deliberate
  spectrum**. The green and Ubuntu are the constants; light↔dark, sharp↔soft, and
  density become intentional, tokenized decisions.

### Guiding principle for every brand deviation

We never abandon a print rule — we **scope** it, and document the scope:

| Print rule | App-layer scope |
|---|---|
| Radius 0 everywhere | Radius 0 on **data surfaces**; 4px on **action affordances** |
| No shadows, ever | No shadows on data; **minimal elevation on true overlays only** |
| No icons, ever | **Curated functional icons only** (affordances), never decorative |
| Static, print-first | **Functional micro-motion** (100–150ms), `prefers-reduced-motion`-safe |
| Dark is for moments | Dark promoted to a **first-class theme** (reusing the print dark greys) |

This traceability is what keeps neonglow reading as *Accelera*, not as a generic
component library.

---

## 2. Decisions locked during brainstorming

| Decision | Choice |
|---|---|
| Tech stack | **React + TypeScript** |
| Styling architecture | **Approach A** — TS tokens → generated CSS custom properties + per-component CSS Modules |
| Theme model | **Dual, both first-class** (light + dark authored equally) |
| Scope target | **Broad data-app component coverage** (tables, trees, forms, overlays, selects, datetime), built in dependency-ordered phases |
| Distribution | **Installable npm packages** (`@neonglow/*`) |
| Shape language | **Sharp for data, soft (4px) for actions** |
| Icons | **Curated functional-only set, drawn/owned in-house** (Lucide as geometric reference) |
| Density | **Two densities** — `default` and `compact` |
| Tokens source of truth | **TypeScript**, generated to CSS + typed JS exports |

---

## 3. Architecture & repository structure

A **pnpm workspace + Turborepo** monorepo publishing a scoped package family: a small
always-loaded core, with heavy widgets isolated so apps only pay for what they import.

```
neonglow/
├─ packages/
│  ├─ tokens/        @neonglow/tokens   — TS token source → generated CSS vars (both themes) + typed JS export
│  ├─ icons/         @neonglow/icons    — curated functional icon set, tree-shakeable React components
│  ├─ core/          @neonglow/core     — buttons, inputs, tags, menu, dialog, drawer, tabs, tooltip, toast, callout, tree…
│  ├─ table/         @neonglow/table    — virtualized data grid (the heavy one)
│  ├─ datetime/      @neonglow/datetime — date/time/range pickers
│  └─ select/        @neonglow/select   — select, multiselect, combobox, suggest, omnibar
├─ apps/
│  └─ docs/          Storybook + docs site (living reference, dual-theme QA, a11y checks)
├─ tooling/          shared tsconfig, lint (existing oxlint config), build config
└─ (print layer, preserved untouched)
   ├─ colors_and_type.css
   ├─ ui_kits/investor-deck/
   ├─ preview/
   ├─ fonts/  assets/  README.md  SKILL.md
```

**Rules:**
- **The print system stays intact.** `colors_and_type.css`, `ui_kits/`, `preview/`,
  `README.md`, `SKILL.md`, `fonts/`, `assets/` are unchanged. `@neonglow/tokens` is the
  screen-oriented sibling that shares brand primitives with the print CSS.
- **Each package has one clear job** and a documented public API. `table` can grow
  complex internally without leaking into `core`.
- **Build output per package:** ESM + `.d.ts` types + a bundled `styles.css`. Consumers
  import the package's `styles.css` once plus tree-shaken components.
- **`peerDependencies` on React** so apps dedupe a single React copy.
- **Parity is reached package-by-package**, never as a monolith.

---

## 4. Token foundation & dual-theme system

Three tiers, so themes and components stay decoupled. Components read **only Tier 2**.

### Tier 1 — Primitives (raw brand values, theme-agnostic)
The green scale, ink/paper ramps, type families, spacing scale (`4, 8, 14, 20, 28, 40,
56, 80, 100`), radii, type scale. Sourced directly from the print system so the brand
primitives are the same source of truth.

**Typography.** The brand family is **Ubuntu** (sans) + **Ubuntu Mono** (numeric/technical),
carried over from the print system. The family is expressed as a **token, not a hard pin**:
`--font-sans` and `--font-mono` resolve to Ubuntu with a graceful fallback to a **similar
humanist geometric sans** (e.g. system-ui / a close alternative such as Inter or Ubuntu's
metrics-compatible peers) where Ubuntu is unavailable, or where a heavier display weight is
needed than the brand woff2 subset provides. Swapping to a similar family is a single
token change, and the brand's *character* (humanist, architectural, tight negative
tracking on display, tabular numerics) is preserved regardless of the exact face.

### Tier 2 — Semantic (what a component asks for; this flips per theme)
```
--surface, --surface-raised, --surface-sunken     /* panels, cards, wells */
--text-1, --text-2, --text-3                       /* primary / body / caption */
--border-hairline, --border-strong                 /* 1px 12% + 2px ink rules */
--accent, --accent-hover, --accent-press, --on-accent
--accent-text                                      /* ink on light, green on dark (contrast-honest) */
--intent-success / -warning / -danger / -info      /* green already = success */
                                                   /* intents are VIVID, especially on dark:
                                                      electric amber, hot red, electric cyan —
                                                      "neonglow" is earned, not decorative */
--focus-ring                                       /* 2px solid, offset 2px */
--radius-0, --radius-action                        /* 0 for data, 4px for actions */
--elevation-overlay                                /* overlays only; see §7 */
```

### Tier 3 — Component tokens (optional)
`--table-row-height`, `--btn-height`, etc. — reference Tier 2 only.

### Dual theme = one selector swap
Light and dark are both authored as complete Tier-2 sets:
```css
:root, [data-theme="light"] {
  --surface:#ffffff; --text-1:#0a0a0a;
  --border-hairline:rgba(10,10,10,.12); …
}
[data-theme="dark"] {
  --surface:#0a0a0a; --text-1:#f2f2f4;
  --border-hairline:rgba(255,255,255,.16); …
}
```
Dark theme reuses the print system's dark-slide greys (`--grey-9b/c9/d8`) — promoting
"dark is for moments" into a first-class theme rather than inventing a palette. Components
render correctly in either theme with **zero conditional code**.

### Green contrast handling
`#7BF076` on white fails WCAG AA for small text. The token layer encodes the rule:
- `--accent` (raw green) is for **fills** — buttons, bars, tags — never small body text on light.
- `--accent-text` resolves to **ink on light, green on dark**, so "green text" only
  appears where it actually passes contrast.

### Source of truth & generation
- Tokens authored in **TypeScript** in `@neonglow/tokens`.
- Generated (Style-Dictionary-style) to: `theme.css` (both themes' CSS vars) **and** typed
  JS objects for consumers that need token values in code.

### Density
`[data-density="default"]` and `[data-density="compact"]` drive spacing / row-height /
control-height tokens. `compact` is the dense data-table / ops register.

---

## 5. Component scope & phasing

### Full coverage target, by package

**`@neonglow/core`** — buttons (+ button group), anchor button, inputs
(text/textarea/numeric), checkbox/radio/switch, label/form-group, tags & tag-input,
callout, card/section/panel, divider, menu + menu-item, popover, tooltip, dialog, drawer,
tabs, breadcrumbs, navbar, tree, spinner/progress bar, skeleton, non-ideal-state (empty),
toast/notifications, static HTML table, key-value/property list.

**`@neonglow/select`** — select, multi-select, combobox/suggest, omnibar (⌘K),
query-list primitive.

**`@neonglow/datetime`** — date picker, date-range picker, time picker, datetime,
date input field.

**`@neonglow/table`** — virtualized data grid: sortable/resizable/reorderable columns,
row/cell selection, frozen rows/cols, editable cells, loading states.

**`@neonglow/icons`** — the curated functional set (§6).

### Phasing (dependency-ordered; each phase = its own spec → plan → build cycle)

| Phase | Delivers | Rationale |
|---|---|---|
| **0 — Foundation** | tokens, dual-theme, density, icons scaffold, build/publish pipeline, Storybook, a11y + visual-regression harness | Prerequisite for everything |
| **1 — Core essentials** | buttons, inputs, checkbox/radio/switch, tag, form-group, card/panel, callout, spinner, divider, tooltip | Atoms every screen needs; validates the system end-to-end in both themes |
| **2 — Overlays & nav** | menu, popover, dialog, drawer, tabs, toast, breadcrumbs, navbar, tree, non-ideal-state | Interaction/overlay layer |
| **3 — Select family** | `@neonglow/select` | Depends on popover + menu (Phase 2) |
| **4 — Datetime** | `@neonglow/datetime` | Depends only on core inputs/popover |
| **5 — Data grid** | `@neonglow/table` | Largest; wants stable selection/edit primitives first |

> **This spec is scoped to Phase 0 + Phase 1** — the first shippable, self-contained
> sub-project that proves the architecture in both themes. Phases 2–5 each get their own
> spec/plan when reached.

---

## 6. Icon system

A **curated, functional-only** icon set — the deliberate, documented app-only deviation
from the print "no icons" rule.

**Rules (encoded in the package, enforced in review):**
- **Functional affordances only** (sort caret, tree toggle, close, chevron, status, ⌘K).
  Never decorative, never in body copy, never as bullets. Each new icon requires a
  functional justification in its PR.
- **One drawing style:** 16px and 20px grids, **1.5px stroke**, geometric, no fill,
  terminals tuned to Ubuntu's weight.
- **`currentColor` everywhere** → icons inherit `--text-2` / intent colors / `--on-accent`,
  so they theme for free in both modes. No per-theme icon variants.
- **Tree-shakeable React components** (`<IconChevronDown/>`), not a sprite/font.

**Initial set (~30, covers Phases 0–2):**
`chevron-{down,right,up,left}`, `caret-{up,down}`, `chevron-double`, `plus`, `minus`,
`x`, `check`, `dash` (indeterminate), `search`, `command`, `more-horizontal`,
`more-vertical`, `filter`, `sort`, `arrow-{up,down,left,right}`, `calendar`, `clock`,
`info`, `warning`, `error`, `success-check`, `spinner`, `drag-handle`, `external-link`,
`eye`, `eye-off`.

**Sourcing:** drawn/normalized in-house on the 16/20 grid (brand-owned stroke, licensing,
and additions), using Lucide geometry as reference where it fits.

---

## 7. Shape, elevation, motion & interaction

### Shape — two-tier
- **Data surfaces → `--radius-0`** (0). Tables, cells, panels, wells, the grid.
- **Action affordances → `--radius-action`** (4px). Buttons, inputs, tags, pills, menu items.

### Elevation — the shadow deviation
- **Inline surfaces: no shadow.** Separation by hairline / 2px rule only (unchanged from print).
- **True overlays only** (popover, dropdown, dialog, drawer, toast): minimal elevation.
  - Light theme → single soft shadow token `--elevation-overlay`.
  - Dark theme → separation via `--surface-raised` + hairline instead of shadow.
  - Never applied to data surfaces.

### The neon glow — dark-theme signature
On **dark theme only**, intent-coloured elements (intent tags, primary/accent actions,
callout icons, positive-performance figures) emit a **faint halo of their own colour**
(`box-shadow` / `text-shadow` of `currentColor`). This is the system's namesake signature.
Rules: glow follows *meaning* (intent/accent), never structure; **data surfaces, panels
and rules never glow**; light theme has zero glow — it keeps the print system's flat
editorial discipline.

### Motion — functional only
- Micro-motion at **100–150ms ease-out** for state changes (hover tint, overlay
  enter/exit, expand/collapse). No parallax, no decorative animation.
- Everything inside `@media (prefers-reduced-motion: reduce)` → instant. Hard cuts remain
  the default character.

### Interaction states (lifted from print, promoted to tokens)
- **Hover:** `--surface` → `--surface-sunken` (light) / raised (dark). Color does not
  brighten/saturate.
- **Press:** accent buttons keep ink text; background drops to `#6de066`; no transform.
- **Focus:** `2px solid --focus-ring, offset 2px`, via `:focus-visible` (keyboard only).
- **Disabled:** 40% opacity + `not-allowed`.

### Layout — the grid, after Müller-Brockmann
The fixed 1920×1080 slide canvas relaxes to a **fluid 12-column modular grid on a 24px
baseline** (the print system's 40px unit rescaled to 15px body type). The method carries
over intact:
- **Composition by construction.** Elements begin and end on column edges; structural
  vertical spacing is always a baseline multiple; leadings snap to the 8px sub-unit.
- **Marginal rail.** Long documentation/showcase pages place section identity (eyebrow,
  title, summary) in a rail spanning cols 1–4 and content in the field (cols 5–12);
  wide data surfaces deliberately take the full 12. Variety comes from *which* fields
  are filled, not from moving the rails.
- **Construction lines.** A diagnostic overlay (columns + baselines) ships as a dev
  affordance, mirroring the print system's `.grid-overlay`.
App shells (navbar + side rail + content) are documented layout primitives.

---

## 8. Quality, testing & accessibility

- **Storybook** (`apps/docs`) is the living reference and QA surface: every component has
  stories rendered in **both themes** and **both densities**.
- **Visual regression** (e.g. Storybook + Chromatic-style snapshots or Playwright
  screenshots) on stories, per theme.
- **Accessibility:** keyboard operability, visible `:focus-visible`, correct ARIA roles
  for menus/dialogs/comboboxes/trees, `prefers-reduced-motion` respected, and automated
  a11y checks (axe) wired into the story run. WCAG AA contrast enforced via the
  green-contrast token rule (§4).
- **Unit/interaction tests** for stateful components (Testing Library) — following TDD.
- **Type-safety:** every component ships `.d.ts`; public props are documented.

---

## 9. Scope of the first implementation (Phase 0 + Phase 1)

**Phase 0 — Foundation**
1. Monorepo scaffolding (pnpm workspace + Turborepo, shared tsconfig, lint).
2. `@neonglow/tokens`: TS token source → generated `theme.css` (light + dark) + typed JS;
   density tokens; green-contrast rule encoded.
3. `@neonglow/icons`: package scaffold + drawing pipeline + the initial ~30-icon set as
   tree-shakeable components.
4. Build/publish pipeline (ESM + types + `styles.css` per package; versioning).
5. `apps/docs` Storybook with dual-theme + dual-density toggles; a11y + visual-regression
   harness.

**Phase 1 — Core essentials (`@neonglow/core`, first tranche)**
buttons (+ group), inputs (text/textarea/numeric), checkbox/radio/switch, tag,
label/form-group, card/panel, callout, divider, spinner, tooltip — each with dual-theme +
dual-density stories, tests, and a11y coverage.

**Out of scope for this spec:** Phases 2–5 (overlays/nav, select, datetime, data grid).
Each gets its own spec when reached.

---

## 10. Open items to confirm before/at planning

- **Package registry:** publish to public npm under `@neonglow/*`, or a private registry
  (GitHub Packages / npm private / internal)? Affects publish config.
- **React version floor** (e.g. 18+ vs 19) for peerDependencies.
- **Visual-regression tooling** choice (hosted Chromatic vs self-hosted Playwright
  snapshots) — affects CI setup.
- **Git:** this directory is not yet a git repository; initialize one for neonglow before
  implementation (recommended) so the monorepo and this spec are versioned.
