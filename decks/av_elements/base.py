#!/usr/bin/env python3
"""av_elements.base: the layout and fill system of the body region.

av_deck fixes the frame. This module fills it. Three jobs:

  1. **Place.** Six named grids and row() / column(). Every block begins and ends on a column edge of the
     12-column Müller-Brockmann grid, so the layout is construction and not composition by eye.
  2. **Fill.** body_height() returns the height that is free for the visual, before you build it. Pass that
     number to a piece as H and the body fills the slide. column(spread=True) and row(grow=True) share
     the height that is left.
  3. **Say.** body() is the standard body under av_deck.header(): subtitle, visual, optional note and the
     conclusion band.

Sizes come from the grid, not from CSS of your own. The body region is 1720 x 760 px. A block of n columns
is span_px(n) px wide. Give that number to any piece that takes a width.
"""
import html
import re

E = html.escape

# ---- the grid, from colors_and_type.css ----------------------------------
BODY_W = 1720            # the body region, 1920 minus two margins of 100
BODY_H = 760             # 1080 minus 170 at the top and 150 at the foot
COLS = 12
COL_W = 125
COL_GUTTER = 20          # the narrow gutter, between columns
FIELD_H = 160
FIELD_GUTTER = 40
BASELINE = 40            # every vertical measure is a multiple of this
BASELINE_HALF = 20

GRIDS = {                # column spans of the six named grids
    "A": (12,),          # one piece, full width
    "B": (8, 4),         # the piece and the reading column
    "C": (6, 6),         # two sibling pieces
    "D": (4, 4, 4),      # three siblings — the metric row
    "E": (3, 3, 3, 3),   # four siblings — the card grid
    "F": (4, 8),         # the context column and the piece
}


def span_px(n):
    """Width in px of a block of n columns, gutters included. Give it to a piece as its width."""
    return n * COL_W + (n - 1) * COL_GUTTER


# ---- fill ----------------------------------------------------------------
# Heights measured in Chrome on the real CSS. measure.py regenerates them; do not edit by hand.
H_EYEBROW = 49           # .eyebrow, one line, plus its 28 px margin
H_TITLE_LINE = 82        # one line of h1.title at 80 px, line-height 1.02
H_TITLE_LINE_MD = 65     # one line of h1.title.md at 64 px
H_TITLE_LINE_SM = 49     # one line of h1.title.sm at 48 px
H_TITLE_MARGIN = 68      # the 28 px top margin and the 40 px bottom margin of h1.title
H_SUBTITLE_LINE = 36     # one line of .sub at 28 px, line-height 1.3
H_SUBTITLE_MARGIN = 40   # the bottom margin of .sub
H_BAND_LINE = 32         # one line of .band at 22 px, line-height 1.45
H_BAND_FRAME = 80        # the 40 px top margin and the 20 px padding of .band, top and bottom
H_NOTE_LINE = 23         # one line of .pre-foot at 16 px
H_NOTE_MARGIN = 20       # the top margin of .pre-foot

_TITLE_LINE = {"": H_TITLE_LINE, "md": H_TITLE_LINE_MD, "sm": H_TITLE_LINE_SM}


def body_height(title_lines=2, subtitle=1, band=0, note=0, title_size=""):
    """The height in px that is free for the visual of a content slide.

    Pass the result to a piece as H and the body fills the slide. Count the lines you will really use:
    title_lines 1 or 2, subtitle, band and note as a number of lines (0 leaves the block out).
    title_size: "" (80 px), "md" (64 px) or "sm" (48 px), the same value you give to header().

    A piece that takes H is not a promise that the slide is full: with little content a hole stays.
    Look at the rendered page."""
    free = BODY_H - H_EYEBROW - title_lines * _TITLE_LINE[title_size] - H_TITLE_MARGIN
    if subtitle:
        free -= subtitle * H_SUBTITLE_LINE + H_SUBTITLE_MARGIN
    if band:
        free -= band * H_BAND_LINE + H_BAND_FRAME
    if note:
        free -= note * H_NOTE_LINE + H_NOTE_MARGIN
    return int(free)


# ---- place ---------------------------------------------------------------
def row(*pieces, grid=None, align="stretch", vertical="center", grow=False, gap=None):
    """The pieces side by side, each one in a block of whole columns and all of the same height.

    grid: a key of GRIDS ("B") or a tuple of column spans ((8, 4)). None shares the 12 columns equally.
    align: how the blocks line up — stretch, center, or end to line up the baselines of two charts.
    vertical: where the content sits inside each block — center, or flex-start when the blocks carry a
    block label and have to start at the same height.
    grow: the row takes the height that is left in the body region. Use it for the last row.
    gap: the gutter in px. Leave it at None for the 20 px column gutter of the grid."""
    if isinstance(grid, str):
        grid = GRIDS[grid]
    if grid is None:
        n = len(pieces)
        if n > COLS:
            raise ValueError(f"{n} pieces do not fit in {COLS} columns")
        base, extra = divmod(COLS, n)
        grid = tuple(base + (1 if i < extra else 0) for i in range(n))
    if len(grid) != len(pieces):
        raise ValueError(f"the grid has {len(grid)} blocks and {len(pieces)} pieces were given")
    if sum(grid) > COLS:
        raise ValueError(f"the grid spans {sum(grid)} columns and only {COLS} exist")
    if any(s < 1 for s in grid):
        raise ValueError("every block spans at least one column")
    cells = "".join(
        f'<div class="av-cell" style="grid-column:span {s};justify-content:{vertical}">{p}</div>'
        for p, s in zip(pieces, grid))
    style = f"align-items:{align};" + ("flex:1;min-height:0;" if grow else "")
    if gap is not None:
        style += f"column-gap:{gap}px;"
    return f'<div class="av-row" style="{style}">{cells}</div>'


def column(*pieces, gap=BASELINE_HALF, width=None, center=False, spread=False):
    """The pieces stacked. gap is a multiple of the half baseline.

    width: a fixed width in px, from span_px(). None takes the whole block.
    center: centre each piece across the width. Centring is the exception, not the rule.
    spread: share the height that is left between the pieces, so the column fills the block without
    stretching any piece."""
    style = (f"width:{width}px;flex:none;" if width else "flex:1;")
    style += "align-items:center;" if center else ""
    style += "justify-content:space-between;height:100%;" if spread else ""
    return f'<div class="av-col" style="gap:{gap}px;{style}">{"".join(pieces)}</div>'


def stack(*rows, gap=BASELINE, grow_last=True):
    """Rows one under the other inside the body region, on the baseline. The last row takes the rest,
    which is grid D: a metric row on top and the piece below, both full width."""
    style = f"display:flex;flex-direction:column;gap:{gap}px;flex:1;min-height:0;"
    out = []
    for i, r in enumerate(rows):
        last = i == len(rows) - 1
        wrap = "flex:1;min-height:0;display:flex;flex-direction:column;" if (last and grow_last) else ""
        out.append(f'<div style="{wrap}">{r}</div>' if wrap else r)
    return f'<div style="{style}">{"".join(out)}</div>'


# ---- say -----------------------------------------------------------------
def md(text):
    """**bold** inside a body string. Everything else is escaped."""
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", E(text or ""))


def body(subtitle, visual, band=None, note=None, band_label=None, vis_style=""):
    """The standard body of a content slide, to put after av_deck.header().

    subtitle: one line that frames the visual. "" leaves it out.
    visual: the piece. It takes the height that is free; body_height() gives that number in advance.
    band: the conclusion. Write a conclusion that adds something, not a summary of what is already
    visible. **bold** marks the part that carries it.
    band_label: a label at the left of the band ("Conclusion", "Key assumption", "Implication").
    note: a line under the visual, for a caveat or the unit."""
    out = f'<p class="sub">{E(subtitle)}</p>' if subtitle else ""
    out += f'<div class="vis" style="{vis_style}">{visual}</div>'
    if note:
        out += f'<p class="pre-foot">{md(note)}</p>'
    if band and band_label:
        out += (f'<div class="band band-l"><b class="bl">{E(band_label)}</b>'
                f"<div>{md(band)}</div></div>")
    elif band:
        out += f'<div class="band">{md(band)}</div>'
    return out


def block_label(text, strong=False):
    """The label of a block inside the slide. Small text is never set in the accent colour on paper,
    because the accent green does not carry enough contrast at label sizes. strong sets it in ink."""
    cls = "block-label strong" if strong else "block-label"
    return f'<div class="{cls}">{E(text)}</div>'


# ---- CSS -----------------------------------------------------------------
CSS = """
/* ---- av_elements: the body region ---- */
.av-row{display:grid;grid-template-columns:repeat(12,1fr);column-gap:20px;width:100%;}
.av-cell{min-width:0;display:flex;flex-direction:column;}
.av-col{display:flex;flex-direction:column;min-width:0;}

/* subtitle, visual, note */
.sub{font-size:var(--fs-body-lg);font-weight:var(--fw-light);line-height:1.3;color:var(--ink-2);
margin:0 0 40px;max-width:1200px;}
.ink .sub{color:var(--grey-c9);}
.vis{flex:1;min-height:0;display:flex;flex-direction:column;}
.pre-foot{font-size:var(--fs-caption);color:var(--ink-3);margin:20px 0 0;max-width:1200px;}
.ink .pre-foot{color:var(--grey-9b);}

/* the conclusion band */
.band{margin:40px 0 0;background:var(--paper-2);border-left:3px solid var(--accent);
border-radius:var(--radius-sm);padding:20px 28px;font-size:var(--fs-body);line-height:1.45;
font-weight:var(--fw-light);color:var(--ink-2);}
.band strong{color:var(--ink);font-weight:var(--fw-medium);}
.ink .band{background:rgba(255,255,255,.06);color:var(--grey-d8);}
.ink .band strong{color:var(--paper);}
.band-l{display:flex;gap:24px;align-items:baseline;}
.band-l .bl{font-size:var(--fs-label);letter-spacing:var(--ls-label);text-transform:uppercase;
font-weight:var(--fw-medium);color:var(--ink-3);flex:none;}
.ink .band-l .bl{color:var(--grey-9b);}

/* the label of a block */
.block-label{font-size:var(--fs-caption);letter-spacing:var(--ls-label);text-transform:uppercase;
font-weight:var(--fw-medium);color:var(--ink-3);margin:0 0 20px;}
.ink .block-label{color:var(--grey-9b);}
.block-label.strong{color:var(--ink);}
.ink .block-label.strong{color:var(--paper);}
"""
