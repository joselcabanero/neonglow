#!/usr/bin/env python3
"""av_deck: the fixed base of Accelera Ventures HTML decks (made to export to PDF).

It fixes the pieces that are NOT redesigned on every deck:
  - cover()    : hero title with one accent fragment, subtitle, rule and an optional 4-up metadata block.
  - agenda()   : "AGENDA" on the left, a hairline, numbered sections on the right. No chrome foot.
  - chapter()  : section divider. Dark by default, with a mono number in accent and room for a visual.
  - header()   : eyebrow (chapter number + name) and the slide title with one accent fragment.
  - slide()    : the paper (or ink) content frame, with chrome top, body region and chrome foot.
  - closing()  : dark, hero headline and a contact row.
  - document() : one self-contained HTML file. Fonts, tokens and images are embedded in base64.

Canvas 1920 x 1080. Margins 100 px left and right, chrome at 44 px, body region from 170 px to 150 px
from the foot. The body region is therefore always 1720 x 760 px.

Language: every fixed label follows the deck language (lang="en" by default, or "es").

Text helper: fmt() turns **bold** into <strong> and __accent__ into the accent span.

Use: see README.md in this folder.
"""
import base64
import html
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent                       # the design-system root
ASSETS = ROOT / "assets"
FONTS = ROOT / "fonts"
TOKENS = ROOT / "colors_and_type.css"
E = html.escape

CANVAS_W, CANVAS_H = 1920, 1080
MARGIN_X = 100
CONTENT_TOP = 170
CONTENT_FOOT = 150
BODY_W = CANVAS_W - 2 * MARGIN_X         # 1720
BODY_H = CANVAS_H - CONTENT_TOP - CONTENT_FOOT   # 760


# ------------------------------------------------------------------ embedding
def _b64(path):
    return base64.b64encode(pathlib.Path(path).read_bytes()).decode()


def _png(name):
    return f"data:image/png;base64,{_b64(ASSETS / name)}"


WORDMARK_PRIMARY = _png("accelera-wordmark-primary.png")   # for the paper cover
WORDMARK_INK = _png("accelera-wordmark-ink.png")           # for paper slides
WORDMARK_INVERTED = _png("accelera-wordmark-inverted.png")  # for ink slides
MARK = _png("accelera-mark.png")                            # watermark on paper
MARK_PAPER = _png("accelera-mark-paper.png")                # watermark on ink

# Every asset is a 1181 x 439 box. The wordmark lockups fill it, but the "A" mark sits in the left
# 26% and the rest of the box is transparent. Size the watermark by the glyph, not by the box.
MARK_BOX = 1181
MARK_GLYPH_W = 308


def watermark(dark=False, glyph_w=560, x=1540, y=-130, opacity=0.07):
    """The brand glyph as a quiet watermark. glyph_w is the width of the visible mark, not of the file.
    x and y place the glyph itself, so it can bleed off an edge on purpose."""
    box_w = round(glyph_w * MARK_BOX / MARK_GLYPH_W)
    src = MARK_PAPER if dark else MARK
    return (f'<img class="watermark" src="{src}" alt="" '
            f'style="left:{x}px;top:{y}px;width:{box_w}px;opacity:{opacity}">')

FONT_FACES = [
    ("Ubuntu", 300, "Ubuntu-Light.woff2"),
    ("Ubuntu", 400, "Ubuntu-Regular.woff2"),
    ("Ubuntu", 500, "Ubuntu-Medium.woff2"),
    ("Ubuntu", 700, "Ubuntu-Bold.woff2"),
    ("Ubuntu Mono", 400, "UbuntuMono-Regular.woff2"),
    ("Ubuntu Mono", 700, "UbuntuMono-Bold.woff2"),
]


def fonts():
    """The six brand fonts as embedded @font-face rules. No network request."""
    out = []
    for family, weight, filename in FONT_FACES:
        data = _b64(FONTS / filename)
        out.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};"
                   f"font-display:block;src:url(data:font/woff2;base64,{data}) format('woff2');}}")
    return "\n".join(out)


def tokens():
    """colors_and_type.css without its @font-face rules, which point at files on disk."""
    css = TOKENS.read_text(encoding="utf-8")
    return re.sub(r"@font-face\s*\{[^}]*\}", "", css)


# ------------------------------------------------------------------ fixed text
TXT = {
    "en": dict(prepared_for="Prepared for", date="Date", team="Team", classification="Classification",
               conf_default="Private & Confidential",
               copyright="© {year} Accelera Ventures. All rights reserved.",
               foot="Confidential · For use by {client} only",
               thanks="Thank you", next_step="Next step",
               agenda_eyebrow="Document structure", agenda="Agenda", house="Accelera Ventures"),
    "es": dict(prepared_for="Realizado para", date="Fecha", team="Equipo", classification="Clasificación",
               conf_default="Confidencial",
               copyright="© {year} Accelera Ventures. Todos los derechos reservados.",
               foot="Confidencial · Solo para uso de {client}",
               thanks="Gracias", next_step="Próximo paso",
               agenda_eyebrow="Estructura del documento", agenda="Agenda", house="Accelera Ventures"),
}


def fmt(text):
    """Inline text format for any fixed-base string: **bold** and __accent__. Everything else is escaped."""
    out = E(text)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    return re.sub(r"__(.+?)__", r'<span class="accent">\1</span>', out)


def accent(text):
    """The one accent fragment of a headline."""
    return f'<span class="accent">{E(text)}</span>'


# ------------------------------------------------------------------ fixed CSS
CSS_BASE = """
/* ---- deck frame ---- */
html,body{margin:0;padding:0;background:#d8d8dc;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
*{box-sizing:border-box;}
body{font-family:var(--font-sans);color:var(--ink);font-feature-settings:"tnum" 1,"lnum" 1;}
.deck{padding:40px 0;}
.slide{width:1920px;height:1080px;margin:0 auto 40px;position:relative;overflow:hidden;
background:var(--paper);color:var(--ink);}
.slide.ink{background:var(--ink);color:var(--paper);}
/* colors_and_type.css sets an explicit colour on h1-h3. Inside a slide the surface decides,
   so an ink slide does not print black type on a black ground. */
.slide h1,.slide h2,.slide h3,.slide h4,.slide p,.slide code,.slide .mono{color:inherit;}
@page{size:1920px 1080px;margin:0;}
@media print{body{background:#fff;}.deck{padding:0;}
.slide{margin:0;break-after:page;}.slide:last-child{break-after:auto;}}

/* ---- chrome: top row, body region, foot row ---- */
.chrome-top{position:absolute;top:44px;left:100px;right:100px;display:flex;align-items:center;
justify-content:space-between;font-size:18px;letter-spacing:var(--ls-chrome);text-transform:uppercase;
font-weight:var(--fw-medium);color:var(--ink-3);}
.ink .chrome-top{color:var(--grey-88);}
.chrome-top .logo{height:28px;}
.chrome-top .pagenum{font-family:var(--font-mono);font-variant-numeric:tabular-nums;letter-spacing:.04em;
text-transform:none;font-size:18px;font-weight:var(--fw-medium);color:var(--ink);}
.ink .chrome-top .pagenum{color:var(--paper);}
.chrome-foot{position:absolute;bottom:44px;left:100px;right:100px;display:flex;align-items:baseline;
justify-content:space-between;font-size:14px;letter-spacing:.04em;color:var(--ink-3);}
.ink .chrome-foot{color:var(--grey-88);}
.chrome-foot b{font-weight:var(--fw-medium);color:var(--ink-2);}
.ink .chrome-foot b{color:var(--grey-d8);}
.chrome-foot .num{font-family:var(--font-mono);font-variant-numeric:tabular-nums;}
.body-region{position:absolute;top:170px;left:100px;right:100px;bottom:150px;display:flex;flex-direction:column;}
.watermark{position:absolute;pointer-events:none;opacity:.08;}

/* ---- header of a content slide ---- */
.eyebrow{font-size:var(--fs-eyebrow);letter-spacing:var(--ls-eyebrow);text-transform:uppercase;
font-weight:var(--fw-medium);margin:0 0 28px;display:flex;align-items:center;gap:18px;color:var(--ink);}
.ink .eyebrow{color:var(--paper);}
.eyebrow::before{content:"";width:44px;height:2px;background:currentColor;flex-shrink:0;}
.eyebrow .chap{font-family:var(--font-mono);letter-spacing:.08em;color:var(--accent);font-weight:var(--fw-medium);}
.eyebrow .sep{color:var(--ink-3);font-weight:var(--fw-regular);}
.ink .eyebrow .sep{color:var(--grey-88);}
.eyebrow-row{display:flex;align-items:baseline;justify-content:space-between;gap:28px;}
.eyebrow-row .eyebrow{margin-bottom:0;}
.eyebrow-row .chips{display:flex;gap:10px;flex-shrink:0;}
h1.title{font-size:var(--fs-title-xl);font-weight:var(--fw-medium);line-height:var(--lh-title);
letter-spacing:var(--ls-tight-2);margin:28px 0 40px;text-wrap:balance;}
h1.title.sm{font-size:var(--fs-title-sm);}
h1.title.md{font-size:var(--fs-title);}
.accent{color:var(--accent);}
.ink .accent{color:var(--accent);}
.subtitle{font-size:var(--fs-subtitle);line-height:1.3;font-weight:var(--fw-light);color:var(--ink-2);
margin:0;max-width:1400px;}
.ink .subtitle{color:var(--grey-c9);}

/* ---- cover ---- */
.cover .body-region{justify-content:flex-end;gap:40px;}
h1.hero{font-size:var(--fs-hero);font-weight:var(--fw-bold);line-height:var(--lh-hero);
letter-spacing:var(--ls-tight);margin:0;}
.cv-kicker{font-size:var(--fs-caption);letter-spacing:var(--ls-label);text-transform:uppercase;
font-weight:var(--fw-medium);color:var(--ink-3);}
.ink .cv-kicker{color:var(--grey-9b);}
.cv-rule{height:2px;background:var(--ink);width:100%;}
.ink .cv-rule{background:var(--paper);opacity:.3;}
.cv-meta{display:grid;grid-template-columns:repeat(12,1fr);column-gap:20px;}
.cv-meta>div{grid-column:span 3;}
.cv-meta .l{display:block;font-size:var(--fs-label);letter-spacing:var(--ls-label);text-transform:uppercase;
font-weight:var(--fw-medium);color:var(--ink-3);}
.ink .cv-meta .l{color:var(--grey-9b);}
.cv-meta .v{display:block;font-size:22px;font-weight:var(--fw-regular);line-height:1.35;margin-top:12px;}
.cv-copy{font-size:14px;color:var(--ink-3);letter-spacing:.04em;}
.ink .cv-copy{color:var(--grey-88);}

/* ---- agenda ---- */
.ag{display:grid;grid-template-columns:620px 1fr;column-gap:60px;flex:1;min-height:0;}
.ag-l{display:flex;flex-direction:column;justify-content:center;}
.ag-t{font-size:var(--fs-title-xl);font-weight:var(--fw-medium);letter-spacing:var(--ls-tight-2);
line-height:1;margin:28px 0 0;}
.ag-s{font-size:22px;font-weight:var(--fw-light);color:var(--ink-3);margin:28px 0 0;max-width:520px;
line-height:1.4;}
.ag-r{display:flex;flex-direction:column;justify-content:center;}
/* the hairline measures the sections block, not the whole body region */
.ag-rows{border-left:1px solid var(--rule-light);padding-left:60px;}
.ink .ag-rows{border-left-color:var(--rule-dark-light);}
.ag-i{display:grid;grid-template-columns:76px 1fr;column-gap:24px;align-items:baseline;
padding:26px 0;border-bottom:1px solid var(--rule-faint);}
.ag-i:last-child{border-bottom:0;}
.ag-i .n{font-family:var(--font-mono);font-size:22px;font-weight:var(--fw-bold);color:var(--accent);
letter-spacing:.04em;}
.ag-i h3{font-size:30px;font-weight:var(--fw-medium);letter-spacing:-.015em;margin:0;}
.ag-i p{font-size:18px;font-weight:var(--fw-light);color:var(--ink-3);margin:10px 0 0;max-width:760px;
line-height:1.4;}
.ag.dense .ag-i{padding:16px 0;}
.ag.dense .ag-i h3{font-size:26px;}
.ag.dense .ag-i p{font-size:16px;margin-top:6px;}

/* ---- chapter divider ---- */
.ch .body-region{flex-direction:row;align-items:center;gap:80px;}
.ch-l{flex:1;min-width:0;}
.ch-n{font-family:var(--font-mono);font-size:200px;font-weight:var(--fw-bold);line-height:.8;
letter-spacing:var(--ls-tight-3);color:var(--accent);margin:0 0 40px;}
.ch-t{font-size:var(--fs-title-xl);font-weight:var(--fw-medium);line-height:var(--lh-title);
letter-spacing:var(--ls-tight-2);margin:0;text-wrap:balance;}
.ch-s{font-size:28px;font-weight:var(--fw-light);color:var(--grey-c9);margin:36px 0 0;max-width:840px;
line-height:1.4;}
.slide.ch.paper .ch-s{color:var(--ink-2);}
.ch-vis{flex:0 0 auto;display:flex;align-items:center;justify-content:center;}
.ch-photo{position:absolute;inset:0;background-size:cover;background-position:center;}
.ch-photo-scrim{position:absolute;inset:0;background:linear-gradient(90deg,
rgba(10,10,10,.88) 0%,rgba(10,10,10,.72) 46%,rgba(10,10,10,.28) 100%);}

/* ---- closing ---- */
.cl .body-region{justify-content:flex-end;gap:40px;}
.cl-contacts{display:grid;grid-template-columns:repeat(3,1fr);column-gap:60px;}
.cl-contacts .l{font-size:var(--fs-caption);letter-spacing:var(--ls-label);text-transform:uppercase;
font-weight:var(--fw-medium);color:var(--grey-9b);}
.cl-contacts .v{font-size:22px;margin-top:12px;}
.cl-contacts .v.mono{font-family:var(--font-mono);}
.cl-contacts .r{font-size:18px;color:var(--grey-9b);margin-top:4px;}
.cl-next{font-size:22px;color:var(--grey-c9);font-weight:var(--fw-light);}
.cl-next b{color:var(--paper);font-weight:var(--fw-medium);}

/* ---- a datum that is still missing ----
   Amber is deliberately outside the Accelera palette. A placeholder has to be impossible to miss and
   impossible to deliver by accident, so it must not look like any brand colour. It lives only here,
   never in colors_and_type.css. `python3 decks/pending.py deck.html` lists every one. */
.pending{background:#FFD54A;color:#3D2E00;font-weight:var(--fw-medium);padding:1px 8px;
border-radius:var(--radius-sm);-webkit-box-decoration-break:clone;box-decoration-break:clone;}
.pending-svg{fill:#8A6A00;font-weight:700;}

/* ---- chips (status marks in the eyebrow row) ---- */
.chip{display:inline-flex;align-items:center;padding:8px 16px;background:var(--accent);color:var(--accent-ink);
font-size:var(--fs-caption);font-weight:var(--fw-medium);letter-spacing:.06em;text-transform:uppercase;
border-radius:var(--radius-sm);}
.chip.ghost{background:transparent;border:1.5px solid var(--ink);color:var(--ink);}
.ink .chip.ghost{border-color:var(--paper);color:var(--paper);}
"""


# ------------------------------------------------------------------ pieces
def _wordmark(dark):
    src = WORDMARK_INVERTED if dark else WORDMARK_INK
    return f'<img class="logo" src="{src}" alt="Accelera Ventures">'


def chrome_top(n=None, total=None, dark=False, logo=None):
    """Top row: the wordmark on the left and the page number on the right."""
    page = f'<span class="pagenum">{n:02d} / {total:02d}</span>' if n and total else "<span></span>"
    return f'<div class="chrome-top">{logo or _wordmark(dark)}{page}</div>'


def chrome_foot(left, right):
    return f'<div class="chrome-foot"><span>{left}</span><span>{right}</span></div>'


def foot(source, client, lang="en"):
    """Foot of a content slide: the source on the left, the confidentiality line on the right.
    Give source="" and the house name takes its place. The page number lives in the top chrome,
    so it is not repeated here. No dates in the foot."""
    t = TXT[lang]
    left = f"<b>{E(source)}</b>" if source else E(t["house"])
    right = E(t["foot"].format(client=client)) if client else E(t["conf_default"])
    return chrome_foot(left, right)


def header(chapter_num, chapter_name, title_html, chips="", size=""):
    """Eyebrow (mono chapter number in accent, then the chapter name) and the slide title.

    title_html: write the conclusive fragment as <span class="accent">…</span>, or use accent()/fmt().
    chips: status marks, as chip() output. size: "" (80 px), "md" (64 px) or "sm" (48 px)."""
    chap = (f'<span class="chap">{E(chapter_num)}</span><span class="sep">/</span>'
            if chapter_num else "")
    eyebrow = f'<div class="eyebrow">{chap}<span>{E(chapter_name)}</span></div>'
    if chips:
        eyebrow = f'<div class="eyebrow-row">{eyebrow}<div class="chips">{chips}</div></div>'
    cls = f"title {size}".strip()
    return f'{eyebrow}<h1 class="{cls}">{title_html}</h1>'


def chip(text, ghost=False):
    return f'<span class="chip{" ghost" if ghost else ""}">{E(text)}</span>'


def slide(body_html, n, total, source="", client="", lang="en", dark=False, key=None):
    """A content slide. body_html goes inside the 1720 x 760 body region.

    key: a stable identifier across versions ("s07"), to anchor review comments.
    dark: ink background. The brand rule is that dark is for moments, so keep it rare."""
    attr = f' data-slide-key="{E(str(key), quote=True)}"' if key else ""
    cls = "slide ink" if dark else "slide"
    return (f'<section class="{cls}"{attr}>{chrome_top(n, total, dark)}'
            f'<div class="body-region">{body_html}</div>'
            f'{foot(source, client, lang)}</section>')


def cover(line1, line2, accent_line="", subtitle="", kicker="", prepared_for="", team="", date="",
          classification=None, year=2026, lang="en", dark=False, meta=True, n=1, total=None):
    """Deck opener. The hero title is bottom-aligned, with one accent fragment on the last line.

    line1 / line2: the deliverable and the client or project. Keep each to about 22 characters.
    accent_line: the third line, in accent. Leave it out for a two-line title.
    subtitle: one line, blocks joined with ' · ', no full stop.
    kicker: the small label above the title ("Confidential · For LP distribution").
    meta: show the 4-up metadata block (prepared for, date, team, classification). Set False for a bare cover.
    date: month with a capital and the year ("October 2026")."""
    t = TXT[lang]
    team_lines = team if isinstance(team, (list, tuple)) else ([team] if team else [])
    lines = [f"<span>{E(line1)}</span>"]
    if line2:
        lines.append(f"<span>{E(line2)}</span>")
    if accent_line:
        lines.append(f'<span class="accent">{E(accent_line)}</span>')
    logo = (f'<img class="logo" src="{WORDMARK_INVERTED if dark else WORDMARK_PRIMARY}" '
            f'alt="Accelera Ventures">')
    blocks = []
    if kicker:
        blocks.append(f'<div class="cv-kicker">{E(kicker)}</div>')
    blocks.append('<h1 class="hero">' + "<br>".join(lines) + "</h1>")
    if subtitle:
        blocks.append(f'<div class="subtitle">{E(subtitle)}</div>')
    blocks.append('<div class="cv-rule"></div>')
    if meta:
        cells = [(t["prepared_for"], E(prepared_for)), (t["date"], E(date)),
                 (t["team"], "<br>".join(E(x) for x in team_lines)),
                 (t["classification"], E(classification or t["conf_default"]))]
        blocks.append('<div class="cv-meta">' + "".join(
            f'<div><span class="l">{label}</span><span class="v">{value}</span></div>'
            for label, value in cells) + "</div>")
    copy = '<span class="cv-copy">' + E(t["copyright"].format(year=year)) + "</span>"
    return (f'<section class="slide cover{" ink" if dark else ""}">'
            f'{chrome_top(n, total, dark, logo=logo)}'
            f'{watermark(dark)}'
            f'<div class="body-region">{"".join(blocks)}</div>'
            f'{chrome_foot(E(t["house"]), copy)}'
            "</section>")


def agenda(sections, subtitle="", lang="en", n=None, total=None, dark=False):
    """Agenda. "Agenda" and a subtitle on the left, a hairline, the numbered sections on the right.

    sections: [(title, description)] or [(number, title, description)]. Above five, the dense variant."""
    t = TXT[lang]
    items = [(f"{i + 1:02d}", *s) if len(s) == 2 else tuple(s) for i, s in enumerate(sections)]
    rows = "".join(
        f'<div class="ag-i"><span class="n">{E(num)}</span><div><h3>{E(title)}</h3>'
        + (f"<p>{E(desc)}</p>" if desc else "") + "</div></div>"
        for num, title, desc in items)
    left = (f'<div class="ag-l"><div class="eyebrow"><span>{E(t["agenda_eyebrow"])}</span></div>'
            f'<h2 class="ag-t">{E(t["agenda"])}</h2>'
            + (f'<p class="ag-s">{E(subtitle)}</p>' if subtitle else "") + "</div>")
    return (f'<section class="slide{" ink" if dark else ""}">{chrome_top(n, total, dark)}'
            f'<div class="body-region"><div class="ag{" dense" if len(items) > 5 else ""}">'
            f'{left}<div class="ag-r"><div class="ag-rows">{rows}</div></div>'
            "</div></div></section>")


def chapter(number, title, subtitle="", visual_html=None, photo=None, n=None, total=None,
            dark=True, lang="en"):
    """Section divider. Dark by default: a mono number in accent, the section title and one line of context.

    visual_html: a visual on the right, for example an isometric scene. Keep it under 700 px wide.
    photo: a full-bleed image behind a scrim. The brand rule forbids stock imagery, so use a photo only
    when it shows the subject of the deck, and record where it came from."""
    body = (f'<div class="ch-l"><div class="ch-n">{E(str(number))}</div>'
            f'<h2 class="ch-t">{E(title)}</h2>'
            + (f'<p class="ch-s">{E(subtitle)}</p>' if subtitle else "") + "</div>")
    if visual_html:
        body += f'<div class="ch-vis">{visual_html}</div>'
    layers = ""
    if photo:
        mime = "image/png" if str(photo).lower().endswith(".png") else "image/jpeg"
        layers = (f'<div class="ch-photo" style="background-image:url(data:{mime};base64,{_b64(photo)})">'
                  '</div><div class="ch-photo-scrim"></div>')
    cls = "slide ch ink" if dark else "slide ch paper"
    return (f'<section class="{cls}">{layers}{chrome_top(n, total, dark)}'
            f'<div class="body-region">{body}</div></section>')


def closing(line1, line2="", accent_line="", contacts=(), next_step="", client="", lang="en",
            n=None, total=None):
    """Last slide. Dark, a hero headline with one accent fragment, and up to three contact blocks.

    contacts: [(label, value, role)] — role is optional. A value that holds '@' or '.' is set in mono."""
    t = TXT[lang]
    lines = [f"<span>{E(line1)}</span>"]
    if line2:
        lines.append(f"<span>{E(line2)}</span>")
    if accent_line:
        lines.append(f'<span class="accent">{E(accent_line)}</span>')
    blocks = [f'<div class="eyebrow"><span>{E(t["thanks"])}</span></div>',
              '<h1 class="hero">' + "<br>".join(lines) + "</h1>"]
    if next_step:
        blocks.append(f'<div class="cl-next">{E(t["next_step"])}: <b>{E(next_step)}</b></div>')
    blocks.append('<div class="cv-rule"></div>')
    if contacts:
        cells = []
        for item in contacts:
            label, value, role = (list(item) + [""])[:3]
            mono = " mono" if ("@" in value or value.startswith("www.")) else ""
            cells.append(f'<div><span class="l">{E(label)}</span>'
                         f'<div class="v{mono}">{E(value)}</div>'
                         + (f'<div class="r">{E(role)}</div>' if role else "") + "</div>")
        blocks.append('<div class="cl-contacts">' + "".join(cells) + "</div>")
    right = E(t["foot"].format(client=client)) if client else "accelera.vc"
    return (f'<section class="slide cl ink">{chrome_top(n, total, True)}'
            f'{watermark(True, glyph_w=500, x=1580, y=-110, opacity=0.05)}'
            f'<div class="body-region">{"".join(blocks)}</div>'
            f'{chrome_foot(E(t["house"]), right)}</section>')


# ------------------------------------------------------------- missing data
PENDING = r"==([^=<>]{1,80}?)=="


def mark_pending(markup):
    """==a datum I do not have yet== comes out marked, in any text of the slide and also inside an SVG.

    Write the marker in any string: a title, a figure, a table cell or the label of a chart. A chart
    needs a number, so mark the label and give a provisional value. Without a marker nothing changes."""
    if "==" not in markup:
        return markup
    span = '<span class="pending">\\1</span>'
    tspan = '<tspan class="pending-svg">\\1</tspan>'
    # inside the text of an SVG, where a background cannot be painted
    markup = re.sub(r"(<(?:text|tspan)\b[^>]*>)([^<]*==[^<]*)",
                    lambda m: m.group(1) + re.sub(PENDING, tspan, m.group(2)), markup)
    # anywhere else, between two tags
    return re.sub(r">([^<]*==[^<]*)<",
                  lambda m: ">" + re.sub(PENDING, span, m.group(1)) + "<", markup)


def list_pending(document_html):
    """Every pending datum of a built deck, in reading order.

    Returns [(slide number, slide key or "", the text)]. Run it on the output of document(), which is
    what `python3 decks/pending.py deck.html` does."""
    out = []
    for i, section in enumerate(re.split(r"(?=<section class=)", document_html)[1:], start=1):
        key = re.search(r'data-slide-key="([^"]*)"', section)
        for m in re.finditer(r'<(?:span|tspan) class="pending(?:-svg)?">(.*?)</(?:span|tspan)>',
                             section, re.S):
            out.append((i, key.group(1) if key else "", html.unescape(m.group(1)).strip()))
    return out


# ------------------------------------------------------------------ document
def document(title, slides_html, css_extra="", lang="en"):
    """One self-contained HTML file. slides_html: a list of strings from the pieces above.

    ==a datum I do not have yet== comes out marked on the slide. pending.py lists every one."""
    body = "\n".join(mark_pending(s) for s in slides_html)
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)}</title>
<style>
{fonts()}
{tokens()}
{CSS_BASE}
{css_extra}
</style>
</head>
<body>
<div class="deck">
{body}
</div>
</body>
</html>
"""
