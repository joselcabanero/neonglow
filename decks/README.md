# Accelera Ventures — HTML decks

Build a deck with code, not with a copy of a slide block. This folder holds the **fixed base**: the pieces
that are not redesigned on every deck. Everything else goes in the body region of each slide.

The output is one self-contained HTML file. Fonts, tokens and images are embedded in base64, so the file
makes no network request and reads no file from disk. Export it to PDF with Chrome.

## What you need

- Python 3.9 or later. The fixed base needs no third-party package.
- Google Chrome, for the PDF export. The scripts look in the usual paths; otherwise set `CHROME_PATH`.
- After any change in this folder: `python3 decks/verify.py`. It must end with
  "Accelera deck engine verified."

## The canvas

| Measure | Value |
|---|---|
| Canvas | 1920 × 1080 |
| Margin left and right | 100 px |
| Chrome top and foot | 44 px from the edge |
| Body region | top 170 px, foot 150 px |
| Body region size | **1720 × 760 px** |

Every piece works on that canvas. The body region is the only place where a slide differs from the next.

## The pieces

| Function | What it makes |
|---|---|
| `cover()` | Deck opener. A bottom-aligned hero title with one accent fragment, a subtitle, a 2 px rule and a 4-up metadata block (prepared for · date · team · classification). |
| `agenda()` | "Agenda" and a subtitle on the left, a hairline, the numbered sections on the right. No chrome foot. Above five sections it switches to the dense variant. |
| `chapter()` | Section divider. Dark by default: a mono number in accent, the section title and one line of context. It takes a visual on the right or a full-bleed photo behind a scrim. |
| `header()` | The eyebrow (mono chapter number in accent, then the chapter name) and the slide title. Put it first in the body region of a content slide. |
| `slide()` | The content frame: chrome top, body region, chrome foot. Paper by default, ink with `dark=True`. |
| `closing()` | Last slide. Dark, a hero headline with one accent fragment, an optional next step and up to three contact blocks. |
| `document()` | The whole file. Give it the list of slides. |

Support: `chip()` for a status mark in the eyebrow row, `accent()` for the accent fragment of a headline,
`fmt()` for `**bold**` and `__accent__` in any string, `watermark()` for the brand glyph.

## Fill the body region

`av_elements` places and fills the body region. Import it as `X`.

```python
import av_elements as X
```

**Place.** Six named grids, in column spans of the 12-column grid. Every block begins and ends on a
column edge.

| Grid | Spans | For what |
|---|---|---|
| `A` | 12 | One piece, full width. |
| `B` | 8 · 4 | The piece and the reading column. |
| `C` | 6 · 6 | Two sibling pieces. |
| `D` | 4 · 4 · 4 | Three siblings. The metric row. |
| `E` | 3 · 3 · 3 · 3 | Four siblings. The card grid. |
| `F` | 4 · 8 | The context column and the piece. |

`row(*pieces, grid="B")` lays them out. `column(*pieces)` stacks them. `stack(*rows)` puts rows one under
the other and gives the rest to the last one. `span_px(n)` gives the width in px of a block of n columns —
pass it to a piece as its width. Any tuple of spans works where a grid key does, so `grid=(4, 8)` mirrors
`F`.

**Fill.** `body_height()` returns the height that is free for the visual, **before** you build it:

```python
H = X.body_height(title_lines=2, subtitle=1, band=1)   # 291
W = X.span_px(8)                                        # 1140
X.row(context, bars(data, W, H), grid="F", vertical="flex-start", grow=True)
```

Count the lines you will really use. `title_size` takes the same value you gave `header()`. The constants
are measured in Chrome on the real CSS, not estimated — `python3 decks/av_elements/measure.py` re-measures
them and checks every prediction against the height Chrome gives. It must end with
"all 10 cases predicted within one pixel."

Three ways to take up the height that is left:

- `row(grow=True)` — the row takes the rest of the body region. Use it on the last row.
- `column(spread=True)` — the pieces share the height that is left, without stretching any of them.
- a piece that takes `H` — it draws itself at that height.

A piece that takes `H` is not a promise that the slide is full. With little content a hole stays. Look at
the rendered page.

**Say.** `body(subtitle, visual, band=..., band_label=..., note=...)` is the standard body under
`header()`. The band carries the conclusion — a conclusion that adds something, not a summary of what is
already visible. `**bold**` marks the part that carries it. `block_label()` labels a block inside a slide.

Add the stylesheets to the document: `D.document(title, slides, css_extra=X.CSS_ALL)`.

## Icons

93 icons in 8 themes. Open **`Icon Catalogue.html`** at the repository root to see and search them.

```python
X.icon("exit")                      # the SVG, 24 px, takes the colour of the text
X.icon("fund", size=32)
X.icon_label("runway", "14 months of cash")   # an icon and one line of text
X.icon_box("lab", filled=True)                # an icon in a box, for the head of a card
X.find_icon("money")                # ['investment', 'valuation', 'runway', 'revenue']
```

`icon()` **raises** on a name that does not exist, instead of printing nothing, and suggests the near
names. A typo still gets an answer: `find_icon("funnnel")` returns `['funnel']`.

| Theme | Count | What it covers |
|---|---|---|
| `interface` | 34 | Arrows, chevrons, status, search, calendar. **The same geometry as the React package `@neonglow/icons`** — `verify.py` fails if the two drift apart. |
| `capital` | 15 | fund · investment · valuation · portfolio · funnel · diligence · cap-table · exit · growth · burn · runway · follow-on · milestone · committee · investor |
| `company` | 5 | company · founder · team · hiring · board |
| `market` | 4 | market · customer · revenue · partnership |
| `technology` | 9 | lab · research · patent · prototype · factory · data · ai · software · hardware |
| `climate` | 13 | emissions · carbon · renewable · solar · wind · battery · grid · water · waste · circular · leaf · soil · forest |
| `biotech` | 8 | dna · cell · molecule · bioreactor · clinical-trial · regulatory · sequencing · protein |
| `status` | 5 | blocked · decision · question · target · location |

**Rules.** No emoji, anywhere. No unicode character used as an icon — no ✓, no ★, no arrow as a section
mark. The only marks that belong to the system are `·` `–` `—` `→` (money flow only) and `×` (the MOIC
unit). An icon is functional and secondary: it supports a label, it never carries the message of a slide
and it is never decoration.

Check a built deck before you deliver:

```python
X.check_icons(deck_html)    # [] when clean; reports unknown names, emoji and fake icons
```

## Isometric scenes

18 scenes in 3 themes. Open **`Scene Catalogue.html`** at the repository root.

```python
X.scene("fermentation", W=700)                  # all grey — the right default for a divider
X.scene("fermentation", W=700, accent=2)        # the third vessel on the accent
X.scene("portfolio", W=620, on_dark=True)       # on an ink slide
D.chapter("01", "Our plants", visual_html=X.scene("pilot-plant", 620, on_dark=True))
```

| Theme | Scenes |
|---|---|
| `investment` | headquarters · boardroom · portfolio · roadmap · partnership |
| `climate` | solar-farm · wind-farm · battery-site · vertical-farm · recycling-plant · water-plant · forest |
| `biotech` | laboratory · fermentation · pilot-plant · cleanroom · greenhouse · data-centre |

**Rules.**

- A scene gives context a chart cannot — the plant, the lab, the farm, the site. Never use one as
  decoration, and never use one when a number would say it better.
- **Grey by default.** The accent marks the one element the slide names, and nothing else. Each scene's
  description says what the accent index means.
- **Pass `on_dark=True` on an ink slide.** The paper greys glare on ink; the second palette matches it.
- **No glass, no blur, no transparency.** Glazing is drawn as an open frame of hairlines, so what is
  inside still reads. Solid fills only, as everywhere else in the system.
- A scene is a diagram, not imagery. It is built from the same flat fills as a chart, which is why it is
  allowed where a photograph is not.

To add a scene, write a function in `av_elements/scenes.py` with the `@scene_def` decorator and build it
from the primitives — `box`, `cyl`, `cone`, `roof`, `tilt`, `slab`, `frame`, `tree`, `poly`, `line`.
Draw back to front: the order you call is the order they paint. Then run `build_catalogue.py`.

## A datum you do not have yet

Never invent a number to fill a slide. Write `==the datum I do not have yet==` in any string — a title,
a figure, a table cell, a band or the label of a chart:

```python
D.header("01", "Pipeline", "Twelve companies, and " + D.accent("==three still unnamed==") + ".")
X.body("Diligence stage at ==Q3 2026==, provisional.", chart, band="Close rate is **==to be confirmed==**.")
```

It comes out marked in amber on the page, inside an SVG as well. Amber is deliberately outside the
Accelera palette: a placeholder has to be impossible to miss and impossible to deliver by accident, so it
must not look like any brand colour. It lives in the deck CSS only, never in `colors_and_type.css`.

List every one before you deliver:

```
python3 decks/pending.py deck.html
```

```
deck.html: 2 pending
  slide 2 (s02)      three still unnamed
  slide 4 (s04)      Q3 2026
```

Exit code 0 when nothing is pending, 1 when something is. Use it as the last gate before delivery.

**A chart needs a number.** Mark the label and give a provisional value. A chart with no value cannot be
drawn, and a chart drawn from an invented value is worse than a marked one.

## A deck in one file

```python
import os, sys, pathlib
sys.path.insert(0, os.environ.get("ACCELERA_DECK_DIR", "decks"))   # no machine path in the generator
import av_deck as D
import av_elements as X

CLIENT, TOTAL = "Demo LP", 3
slides = [D.cover("Portfolio", "Track Record", "2018–2026",
                  subtitle="Legacy portfolio · €6.12M value · 1.47× MOIC across two funds",
                  kicker="Confidential · For LP distribution",
                  prepared_for=CLIENT, date="October 2026", team=["Javier Nadal"],
                  n=1, total=TOTAL)]

H = X.body_height(title_lines=2, subtitle=1, band=1)
body = D.header("01", "Portfolio at a Glance",
                "Two funds. Thirty-five companies.<br>One exit at " + D.accent("14.58×") + ".")
body += X.body("Both funds are above cost. The concentration is deliberate.",
               X.row(left_piece, right_piece, grid="B", grow=True),
               band="One position carries **36% of the portfolio value**.",
               band_label="Conclusion")
slides.append(D.slide(body, n=2, total=TOTAL, source="Source: internal valuations, Q4 2026",
                      client=CLIENT, key="s02"))

slides.append(D.closing("Let's build the", "sustainable", "future.",
                        contacts=[("Email", "lp@accelera.vc")], client=CLIENT, n=3, total=TOTAL))

open("deck.html", "w", encoding="utf-8").write(
    D.document("Portfolio track record", slides, css_extra=X.CSS_ALL))
```

The complete example is `examples/build_example.py`, one slide per piece. Run it to see the base:

```
python3 decks/examples/build_example.py
```

Export and look at every page:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --no-pdf-header-footer --print-to-pdf=deck.pdf deck.html
pdftoppm -png -r 72 deck.pdf page
```

## Rules the base applies for you

- **The page number lives in the top chrome**, as `04 / 07` in mono. The foot does not repeat it.
- **The foot** carries the source on the left and the confidentiality line on the right. No dates.
- **One accent fragment** per headline. The accent is the thing the slide is about.
- **Dark is for moments.** `slide(dark=True)` is for an exit, a hero number or a turn in the story, and
  `chapter()` and `closing()` are dark by rule. Keep every other slide on paper.
- **The brand glyph is a watermark, not an icon.** `watermark()` sizes it by the visible mark, because
  every asset file is a 1181 × 439 box and the mark fills only the left 26% of it.
- **Headings inherit the surface colour.** `colors_and_type.css` sets an explicit colour on `h1`–`h3`,
  which would print black type on an ink slide. The deck CSS corrects this inside `.slide`.
- **Language.** Every fixed label follows `lang="en"` (default) or `lang="es"`. Do not mix the two.

## Known limits

- `cover(meta=False)` gives the bare cover of the original UI kit, with no metadata block.
- A photo in `chapter()` is available but the brand rule forbids stock imagery. Use a photo only when it
  shows the subject of the deck, and record where it came from.
- There is no element library yet. The example builds its metric block and its bar chart by hand. The
  library of pieces chosen by intent is the next piece of work.

## Files

| File | For what |
|---|---|
| `av_deck.py` | The fixed base. Pieces, CSS, embedding and `document()`. |
| `av_elements/base.py` | The layout and fill system: grids, `row`, `column`, `stack`, `body`, `body_height`. |
| `av_elements/icons.py` | 93 icons in 8 themes, `find_icon()` and `check_icons()`. |
| `av_elements/scenes.py` | 18 isometric scenes and the primitives they are built from. |
| `av_elements/build_catalogue.py` | Generates `Icon Catalogue.html` and `Scene Catalogue.html`. |
| `av_elements/measure.py` | Measures the real height of every block in Chrome and checks `body_height()`. |
| `pending.py` | Lists every `==datum I do not have yet==` in a built deck. The last gate before delivery. |
| `verify.py` | Verification in one command. Run it after any change here. |
| `examples/build_example.py` | A working deck with one slide per piece. The smoke test. |
