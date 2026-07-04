# Accelera Ventures — Design System

A design system for **Accelera Ventures**, a VC Fund Manager dedicated to nurturing the deep‑tech solutions that shape our sustainable future. Portfolio focus: foodtech, agritech, logistics and adjacent deep‑tech.

> "Editorial, not corporate. Numbers are the hero."

This system produces **investor‑grade** artifacts — LP decks, quarterly reports, portfolio one‑pagers, investment memos. Every surface reads like a serious business newspaper: dense, confident, quiet.

---

## Sources used

| Source | Path | Notes |
|---|---|---|
| Brand guidelines (HTML document) | `Brand Guidelines/Accelera Design System _standalone_.html` (read‑only, user‑mounted) | Full self‑contained design system doc. Fonts and logos extracted into `fonts/` and `assets/`; tokens + recipes re‑authored in `colors_and_type.css` and `ui_kits/investor-deck/`. |
| Logo set | `uploads/*.png` | 6 logo variants (wordmark + mark, ink / green‑A / paper / grey). |

All extracted fonts, tokens and logo assets live in `fonts/` and `assets/` respectively and should be used directly; the `source/` folder is reference only.

---

## Index — what's in this folder

| File | Purpose |
|---|---|
| `README.md` | This file. Start here. |
| `SKILL.md` | Agent‑skill entry point (cross‑compatible with Claude Code Skills). |
| `colors_and_type.css` | All design tokens — colors, fonts, type scale, spacing, semantic element styles. Import this into any new HTML. |
| `fonts/` | Ubuntu + Ubuntu Mono woff2 files (latin subset, weights 300/400/500/700 and 400/700). |
| `assets/` | Logos — wordmark (primary, ink, inverted), mark (green, ink, grey, paper). |
| `preview/` | Design‑system cards rendered individually for the Design System review tab. |
| `ui_kits/investor-deck/` | UI kit for the core product — a 1920×1080 LP / investor deck with all recipe layouts in one stacked HTML preview. |

---

## Brand in one paragraph

Accelera Ventures invests in the deep‑tech companies building a sustainable future — food, agriculture, logistics, planet. The brand voice is that of a disciplined investor writing a memo: **short, declarative, confident in the numbers rather than in the language**. Visually, the system is clean and neutral — white grounds, cool light‑grey surfaces, editorial and restrained — Ubuntu set tight, tabular numerals, one accent green reserved for moments that have been earned.

---

## Content fundamentals

**Voice.** An investment memo. Precise, understated, quiet. Copy never sells — the data does. Prefer facts over adjectives. Third‑person institutional ("we deployed €4.15M", not "I'm excited to share…").

**Casing.**
- *Eyebrows (section kickers):* Title Case, 2–5 words, a topic noun‑phrase. Examples: `Portfolio at a Glance`, `The Landmark Exit`, `Active Pipeline`.
- *Titles (H1/H2):* full sentence, ends in a period. Multiple short sentences separated by periods are preferred over long clauses. Examples: `Two funds. Thirty-five companies. One exit at 14.58×.`, `Value creation is concentrated — and that's by design.`
- *Body:* two sentences maximum. Key numbers are bold.
- *Captions:* one clause, middot‑separated facts. Example: `Spain · Agritech · Indoor hop farming`, `Entry Jul 2020 · Exit Dec 2022 · 29 months hold`.

**Pronouns.** "We" for the firm. Rarely "you". Never "I".

**Number formatting (hard rules).**
- MOIC always has two decimals and the unicode multiplication sign: `1.47×`, `14.58×`.
- Currency: `€4.15M`, `€152K`, `€2.18M` — Euro sign prefix, capital magnitude suffix, no space.
- Percents: `+42%`, `−3%` (real minus sign, not hyphen).
- Dates in body copy: `Jul 2020`, `Dec 2022`, `Q4 2026`. Dates in a memo header: `2018–2026` (en‑dash).
- Money flow: arrow, thin space either side: `€152K → €797K`. Use Ubuntu Mono.
- Thousand separators: `€1,500,000` only in appendices; otherwise abbreviate.
- Ranges: en‑dash, no spaces: `1.0–1.2×`.

**Punctuation.** Em‑dashes with hair spaces are welcome as editorial pauses — like this. Middots (`·`) separate facts in a caption. Arrows (`→`) connect before/after. Never use emoji. Never use decorative icons.

**Tone examples (verbatim from the guidelines deck).**
- `Across Europe Foodtech Acceleration Fund I and Spain Foodtech Genesys SPV, we have deployed €4.15M into 35 portfolio companies.`
- `Two COVID write‑offs pre‑programme. Zero in the Fund.`
- `Spain SPV 2.09× · Fund I 1.27× at 2‑year maturity.`

**What to avoid.** "Excited", "thrilled", "amazing", "leverage", "disrupt", "unicorn", "game‑changing". Any adjective doing work a number could do.

---

## Visual foundations

The system is **editorial, not corporate** — it should feel like the business section of a broadsheet, not a SaaS landing page.

### Five core principles (from the guidelines)
1. **Editorial, not corporate.** Dense, confident, quiet. No gradients, no glass, no drop shadows.
2. **Numbers are the hero.** Metrics get the largest type on the page. Tabular figures, minus‑zero rounding, units demoted to neutral grey.
3. **One accent colour, earned.** Green is for positive outcomes, highlights and the brand. Never decorative.
4. **Structure over decoration.** Hairline rules, 2 px dividers, grids of flat rectangles. No rounded corners on data surfaces.
5. **Dark is for moments.** Ink‑black slides mark the exit, the closing, the value‑creation narrative — never the default.

### Palette
| Role | Name | Hex | Var |
|---|---|---|---|
| Primary text / rules / dark bg | Ink | `#0A0A0A` | `--ink` |
| Body copy on paper | Ink 2 | `#2A2A2A` | `--ink-2` |
| Captions, labels, chrome | Ink 3 | `#555555` | `--ink-3` |
| Default slide bg (clean white) | Paper | `#FFFFFF` | `--paper` |
| Muted card surfaces | Paper 2 | `#EEEEF0` | `--paper-2` |
| Deeper muted (sparingly) | Paper 3 | `#E0E0E4` | `--paper-3` |
| **Accent — highlights, positive perf, logo** | **Accent Green** | **`#7BF076`** | `--accent` |
| Performance up (≥ 1.2×) tint | Perf Up | `#D4F5D1` | `--perf-up` |
| Dark‑slide chrome | Grey 88 | `#888888` | `--grey-88` |
| Dark‑slide caption | Grey 9b | `#9B9588` | `--grey-9b` |
| Dark‑slide body | Grey c6 / d8 | `#C6C6CB` / `#D8D8DC` | `--grey-c9` / `--grey-d8` |

Backgrounds default to **clean white** (`#FFFFFF`) with neutral, cool light‑greys for muted surfaces — deliberately *not* a warm cream. Dark slides use pure ink (`#0A0A0A`), never a near‑black.

### Typography
**One display family, period.**
- `Ubuntu` — weights 300 / 400 / 500 / 700. Used for everything (titles, body, labels, captions). Humanist sans, friendly but architectural. Tight negative tracking on anything display‑sized.
- `Ubuntu Mono` — weights 400 / 700. Numeric/technical only: section tags (`01 / OVERVIEW`), table numerics, money flow.

Weight does the work colour would otherwise. Tabular‑nums (`font-variant-numeric: tabular-nums`) on every metric, table, money value.

Scale: 120 hero → 80/64 title → 128/64 metric → 34 subtitle → 28 body‑lg → 22/18 body → 18/14/11 labels. See `colors_and_type.css` for CSS vars.

### Spacing
A fixed **1920 × 1080** canvas is the base unit for slides. Rails:
- **100 px** gutters left and right of every slide.
- Top chrome strip at **44 px**. Body starts at **170 px** from top.
- Bottom chrome strip at **130 px** from bottom.

Spacing scale (px): `4, 8, 14, 20, 28, 40, 56, 80, 100`. Gaps between grid columns are 40–80 px. All vertical spacing resolves to multiples of the **40 px baseline** (see Grid system).

### Grid system — after Müller-Brockmann
Follows the method of Josef Müller-Brockmann's *Grid Systems in Graphic Design*: a **modular field grid** plus a **baseline rhythm**. The grid is not decoration — it is the instrument of order. Every element begins and ends on a field edge; every line of type sits on the baseline. Compose by construction, not by eye.

**Principles applied**
1. **The grid is objective.** Position is decided by the matrix, not by feel — this is what makes a 40-slide LP deck read as one document.
2. **Fields, not free space.** The content area is a matrix of modules with constant gutters. Text, numbers, tables and the mark watermark all snap to module boundaries.
3. **Baseline rhythm.** A single vertical unit (40 px) governs inter-field space and leading. Headings take whole-line leadings (80, 120); structural spacing is always a multiple of 40.
4. **Two gutters, deliberately.** A narrow 20 px inter-column gutter (keeps 12 columns legible) and a wide 40 px inter-field gutter (= one baseline line). The horizontal and vertical rhythms are tuned independently — authentic to the method.
5. **The grid liberates.** Once fixed, you stop deciding margins and start deciding content. Variety comes from *which* fields you fill, not from moving the rails.

**The spec (1920 × 1080 canvas)**
| | Value |
|---|---|
| Margins | 100 px L/R · top 170 (chrome 44) · foot 150 |
| Content area | 1720 × 760 px |
| Columns | **12 × 125 px**, 20 px inter-column gutter — `12·125 + 11·20 = 1720` |
| Fields (rows) | **4 × 160 px**, 40 px inter-field gutter — `4·160 + 3·40 = 760` |
| Baseline | **40 px** (760 = 19 lines); half-unit 20 px |
| Module | 125 × 160 px — the 1/48 unit of the page |

**Common spans** (12-col): half = `col-6`, third = `col-4`, quarter = `col-3`, two-thirds = `col-8`. The deck's 3-up metric rows are three `col-4` fields; 4-up card grids are four `col-3` fields.

**How to use.** Wrap slide content in `.grid-region`, lay it out with `.field-grid` + `.col-N`, stack vertical blocks with `.rhythm`, snap heading leadings with `.lead-2` / `.lead-3`. Drop a `.grid-overlay` inside `.grid-region` to see the construction lines. All classes are in `colors_and_type.css`.

### Backgrounds
- Default: **flat white** `#FFFFFF`. That's it. No textures, no noise.
- Tinted card blocks: `--paper-2` (`#EEEEF0`) / `--paper-3` (`#E0E0E4`) — neutral light greys, solid fills only.
- Dark: flat `#0A0A0A`. Reserved for hero moments (exits, closing slide).
- Watermark: the Accelera mark at **10% opacity**, bleeding off the corner. That is the *only* permissible decorative element.
- **No gradients. No stock photography. No drop shadows. No glass / blur. No noise textures.**

### Borders, rules, corners
- **Corner radius is 0.** Nothing rounds. Data surfaces, cards, tiles, chips are rectangles.
- Hairline dividers at `rgba(10,10,10,0.12)` — 1 px.
- Strong dividers are 2 px solid ink.
- Card separation uses a 2 px ink grid line between cells, not borders around each cell.

### Shadows, transparency, blur
- **No drop shadows.** Ever.
- Transparency: only for the mark watermark (10%) and for hairline dividers (12–20%).
- No backdrop blur, no glass effects.

### Animation & motion
This is a **static print‑first** system. Investor decks are exported to PDF and read on paper. No transitions, no entrances, no parallax. If a deck is presented live, slide changes are hard cuts. Hover is irrelevant.

### Hover / press states
For the rare interactive surface (UI kit, web one‑pager):
- **Hover:** swap background from `--paper-2` → `--paper-3`, or ink underline appears on a link. Color does not brighten or saturate.
- **Press:** ink text on an accent button stays ink; background drops to `#6de066`. No scale/transform.
- **Focus:** 2 px solid ink outline, offset 2 px.

### Imagery
**There is none.** The guidelines call it out explicitly: *No stock imagery. Use placeholders or the mark watermark.* If imagery is ever required, it must be black‑and‑white, warm‑toned, grainy, editorial — think Magnum, not Shutterstock.

### Cards
Five states. One shape. Flat rectangles, no borders, no shadows — state is encoded by background colour:
1. **Accent** (`#7BF076`) — featured / brand moment.
2. **Up** (`#D4F5D1`) — positive performance.
3. **Neutral** (paper) — default / held at cost.
4. **Muted** (`#E9E3D4`) — written off / inactive.
5. **Dark** (`#0A0A0A`) — hero / closing.

Card stack order from top: status label (11 px caps) → value (48 px tabular) → company name (20–26 px medium) → one‑line description (13 px ink‑2) → money flow (mono, pinned to bottom).

### Layout rules
- Content left‑aligns. **Never centre body copy.**
- Multiple columns are preferred over multi‑line body.
- Eyebrow → title → body is the canonical hierarchy on every narrative slide.
- Page chrome is the same on every slide: logo top‑left (28 px), section tag centred, page number mono top‑right, brand + context mono at foot.

---

## Iconography

**The system is close to iconless by design.** The guidelines say, verbatim: *No emoji. No decorative icons.* Accelera decks are typography + numbers + hairlines; they do not lean on icon sets.

**When an icon is unavoidable (UI kit, web one‑pager), rules:**
- **No emoji.** Not for bullets, status, or anywhere else.
- **No unicode character used as an icon** (no ✓, no ★, no arrows as section markers). The *only* unicode marks that are part of the system are the middot `·`, the en‑dash `–`, the em‑dash `—`, the rightward arrow `→` (money flow only) and the multiplication sign `×` (MOIC unit).
- If a real icon is needed, use a **1 px stroke, 24 px, ink (or paper on dark)**, geometric, no fill. Substitute from **Lucide** (`https://unpkg.com/lucide-static/icons/…`) — closest match to the Ubuntu stroke weight. FLAG THIS SUBSTITUTION to the user: the original system uses **no icons at all**; any icon introduced is a deviation.
- Logo mark (`assets/accelera-mark.png` / `-green.png`) is the brand glyph — it can be used as a favicon and as a low‑opacity watermark. It is *not* a general‑purpose icon.

---

## Logos — inventory

All live in `assets/`.

| File | Use |
|---|---|
| `accelera-wordmark-primary.png` | **Primary.** Green "A" + ink wordmark on paper. Covers, headers, marketing. |
| `accelera-wordmark-ink.png` | Full wordmark, all ink. Chrome/secondary — use when green would compete. |
| `accelera-wordmark-inverted.png` | Full wordmark, paper colour. For dark slides. |
| `accelera-mark.png` | Just the stylised "A" glyph, green. Watermark (10% opacity), favicon. |
| `accelera-mark-grey.png` | Mark, grey. Muted watermark. |
| `accelera-mark-paper.png` | Mark, paper. Use on ink bg. |

**Clear space:** preserve at least the height of the "A" around all sides. On slide chrome the wordmark sits at 28 px tall. Never place text closer than 20 px to it.

---

## Font substitution note

Extracted fonts are the latin subset (U+0000–00FF) from the guidelines bundle — Ubuntu 300/400/500/700 and Ubuntu Mono 400/700. These are the originals. **No substitution needed.** If a future deliverable needs extended language support (Cyrillic, Greek), the full set is available from Google Fonts under the same family names and should be added to `fonts/` alongside the existing files.

---

## How to use this system

1. Import the tokens: `<link rel="stylesheet" href="colors_and_type.css">`.
2. Start from one of the six layout recipes (cover · headline‑metric · dark‑hero · table · card‑grid · split‑narrative). The `ui_kits/investor-deck/` folder has them all as a stacked HTML preview.
3. Lift a card / chrome / metric component rather than hand‑rolling.
4. Check copy against the Do / Don't list: no adjectives, bold the number, one accent per slide, neutral greys not warm cream, rectangles not rounded, zero emoji.
