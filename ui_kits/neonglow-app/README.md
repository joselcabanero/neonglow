# neonglow — web & app UI kit (preview)

A single-file, static preview of the **neonglow** token architecture — the screen
sibling of the print/deck system. Open `index.html` in any browser.

What it proves, before any React code exists:

- **Dual theme** — light/dark toggle flips one `[data-theme]` attribute; components
  read only Tier-2 semantic tokens (`--surface`, `--text-1`, `--accent-text`…).
- **Dual density** — `[data-density]` default/compact drives control and row heights.
- **Two-tier shape** — radius 0 on data surfaces, 4px on action affordances.
- **Elevation scoped to overlays** — dialogs/menus lift; data surfaces never do.
- **Functional icon set** — ~29 single-stroke `currentColor` glyphs, affordances only.
- **Contrast-honest green** — `--accent-text` is ink on light, green on dark.
- **The neon glow** — dark theme only: intent chips, primary actions and positive
  figures emit a faint halo of their own colour. Light stays flat and editorial.
- **Müller-Brockmann grid** — every section is a 12-column matrix on a 24px baseline
  (the print system's 40px unit scaled to screen). Section identity sits in a marginal
  rail (cols 1–4), content in the field (cols 5–12); wide data surfaces take the full
  matrix. Press **Grid** in the top bar to see the construction lines.

Components shown: buttons, inputs, checkbox/radio/switch, tags, callouts, tabs,
breadcrumbs, tooltip, metric cards, data table (selection/sort/sticky header),
tree, menu, dialog.

Spec: `docs/superpowers/specs/2026-07-04-neonglow-web-app-design-system-design.md`.
The production system will ship as `@neonglow/*` React + TypeScript packages.
