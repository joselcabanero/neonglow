# Investor deck — UI kit

Six slide recipes (cover, headline-metric, dark-hero, table, card-grid, split-narrative) + closing — a direct port of the canonical Accelera layouts from the guidelines deck.

All slides sit on the 1920×1080 canvas with 100 px gutters, 44 px chrome top/foot, 170 px body-top and 150 px body-bottom. Content is laid on the **12-column / 4-field Müller-Brockmann grid** (see the root README "Grid system" section). Toggle **Show construction grid** in the header to see the columns and fields.

## Files
- `index.html` — stacked preview of every recipe, fit-scaled to viewport width, with a grid-overlay toggle.

## How to reuse
1. Import `colors_and_type.css` from the project root.
2. Copy any `<div class="slide …">` block into your deck.
3. Swap copy and numbers. Keep the chrome, keep the rails, keep the scale.

## Patterns
| Pattern | When |
|---|---|
| A · Cover | Deck opener. Logo top-left, hero title bottom-left, mark watermark. |
| B · Headline metric | Overview. Eyebrow → H2 → three 128 px numbers. |
| C · Dark hero | Exit moments. One gigantic number in accent green on ink. |
| D · Table | Positions / returns detail. Tinted row = marking up. |
| E · Card grid | Four-up highlights. One state per card background. |
| F · Split narrative | Thesis + chart side-by-side. Two-column 1fr 1fr with 100 px gap. |
| Closing | Thank-you. Dark, hero-scale, contact block in the footer. |
