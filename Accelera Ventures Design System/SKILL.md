---
name: accelera-ventures-design
description: Use this skill to generate well-branded interfaces and assets for Accelera Ventures — a VC fund manager for deep-tech / sustainable future companies — either for production or throwaway prototypes/mocks/decks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping investor decks, reports, and web surfaces.
user-invocable: true
---

Read the `README.md` file within this skill first — it contains the full brand, voice, content, visual foundations, iconography rules and asset index. Also explore:

- `colors_and_type.css` — the canonical token file. Import it for anything you build.
- `fonts/` — Ubuntu + Ubuntu Mono woff2 (the brand fonts).
- `assets/` — logo wordmarks and the "A" mark in all valid colour variants.
- `ui_kits/investor-deck/` — six canonical slide recipes (cover, headline-metric, dark-hero, table, card-grid, split-narrative) + closing, as a stacked 1920×1080 HTML preview.
- `ui_kits/data-story/` — five-beat long-form narrative page (Hook · Context · Turn · Resolution · Ask) for LP letters and reports.
- `preview/chart-*.html` — 43 chart types as flat, editable SVG on the brand encoding grammar (ink primary, one accent, tinted greys, hollow = at cost, dashed = reference). `preview/story-*.html` — annotation, hero-number, story-arc, before/after and scroll-step components.
- `preview/map-*.html` — choropleth, proportional symbols, flow, regional zoom and small-multiple maps on real Natural Earth geometry via d3-geo (helper `preview/map.js`). Land greys → accent → ink, white borders, no blue ocean.
- `preview/` — small design-system cards that break down colors, type, grid, spacing and components at atomic level.

If creating visual artifacts (slides, mocks, throwaway prototypes, reports, data stories), copy assets out of this folder into the new project and produce static HTML files for the user to view. For any chart, start from the matching `preview/chart-*.html` and keep its encoding: ink series, one accent, greys for context, mono numerals, 2 px baseline, 3 px mark radius. For a narrative, follow the five-beat arc in `ui_kits/data-story/`. Everything hinges on five principles: editorial not corporate, numbers are the hero, one accent earned, structure over decoration, dark is for moments. No emoji. No icons. Soft corners only (6/12/16 px, never pills). No gradients. No stock imagery. Paper is `#F3EFE6`, not white.

If working on production code, copy the tokens and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build — LP deck? Quarterly report? One-pager? Web page? — ask a handful of follow-up questions, then act as an expert investor-deck / brand-system designer who outputs HTML artifacts or production code, depending on the need.
