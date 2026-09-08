# Data story — UI kit

A long-form, fluid narrative page for LP letters, quarterly reports and one-topic deep dives. Reads top to bottom in five beats, one chart type per beat.

## The arc
1. **Hook** — one number that surprises. Dark chapter, hero metric in accent green, no chart.
2. **Context** — baseline and scale. KPI tiles + a distribution (histogram / bar / table).
3. **Turn** — what changed and why. Movement charts only: waterfall, slope, diverging, bump.
4. **Resolution** — where it landed. Annotated chart with numbered markers; return to the hook number.
5. **Ask** — one decision, one date, never more than two options. Recommended option on accent.

## Rules
- 12-column grid, 24 px gutter, 1100 px max. Chart spans 7–8 columns, narrative 4–5. Never centred.
- One accent surface per chapter. If the chart uses green, the eyebrow number is the only other green.
- Every chart has a `.t` title row: plain-language claim left, the number that proves it right (mono).
- Annotations are numbered `01 02 03` in ink squares with orthogonal leader lines. Read order = number order.
- Sources in mono, 11 px, under the narrative — never under the chart.
- Body copy: two sentences per paragraph, numbers in weight 500.

## Files
- `index.html` — the five-chapter story, ready to duplicate.
- Chart building blocks live in `preview/chart-*.html`; story components in `preview/story-*.html`.
