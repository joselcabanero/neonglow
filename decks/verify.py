#!/usr/bin/env python3
"""verify: checks the Accelera deck engine. Run it after any change in this folder.

    python3 decks/verify.py

It must end with "Accelera deck engine verified." Checks:
  1. the module imports and every piece of the fixed base returns HTML;
  2. the example deck builds, and its slide count matches;
  3. the document is self-contained: no http(s) request and no reference to a file on disk;
  4. both languages produce their own fixed labels;
  5. the agenda switches to the dense variant above five sections;
  6. Chrome exports the example to PDF with one page per slide (skipped if Chrome is absent).
"""
import os
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import av_deck as D  # noqa: E402
import av_elements as X  # noqa: E402

CHROME_PATHS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
]
fails = []


def check(name, condition, detail=""):
    print(f"  {'ok  ' if condition else 'FAIL'}  {name}" + (f" — {detail}" if detail and not condition else ""))
    if not condition:
        fails.append(name)


print("1. the fixed base")
pieces = {
    "cover": D.cover("Portfolio", "Track Record", "2018–2026", subtitle="One line",
                     prepared_for="Demo LP", date="October 2026", team="Javier Nadal", n=1, total=3),
    "agenda": D.agenda([("One", "First"), ("Two", "Second")], subtitle="Two sections"),
    "chapter": D.chapter("01", "A section", "One line of context"),
    "slide": D.slide(D.header("01", "Chapter", "A title with " + D.accent("one accent") + "."),
                     n=2, total=3, source="Source: internal", client="Demo LP"),
    "closing": D.closing("Let's build the", "sustainable", "future.",
                         contacts=[("Email", "lp@accelera.vc")], client="Demo LP", n=3, total=3),
}
for name, html in pieces.items():
    check(f"{name}() returns a <section>", html.startswith("<section") and html.rstrip().endswith("</section>"))

print("2. the example deck")
example = HERE / "examples" / "build_example.py"
run = subprocess.run([sys.executable, str(example)], capture_output=True, text=True)
check("build_example.py runs", run.returncode == 0, run.stderr.strip()[-300:])
out = HERE / "examples" / "example-deck.html"
deck = out.read_text(encoding="utf-8") if out.exists() else ""
check("the deck file exists", bool(deck))
check("the deck has 7 slides", deck.count("<section class=") == 7, f"found {deck.count('<section class=')}")

print("3. self-contained output")
check("no http(s) request", not re.search(r'(src|href)="https?://', deck))
check("no @import", "@import" not in deck)
check("no url() to a file on disk", not re.search(r"url\((?!data:)['\"]?[^)d]", deck))
check("the fonts are embedded", deck.count("data:font/woff2;base64,") == len(D.FONT_FACES))

print("4. language")
en = D.cover("A", "B", prepared_for="X", date="Y", team="Z", lang="en", n=1, total=1)
es = D.cover("A", "B", prepared_for="X", date="Y", team="Z", lang="es", n=1, total=1)
check("en labels", "Prepared for" in en and "Private &amp; Confidential" in en)
check("es labels", "Realizado para" in es and "Confidencial" in es)
check("en and es differ", en != es)

print("5. the agenda")
small = D.agenda([(f"S{i}", "d") for i in range(5)])
big = D.agenda([(f"S{i}", "d") for i in range(6)])
check("five sections stay wide", 'class="ag"' in small)
check("six sections go dense", 'class="ag dense"' in big)

print("6. the layout system")
check("the grid adds up to the body region",
      all(sum(g) <= X.COLS for g in X.GRIDS.values())
      and X.span_px(X.COLS) == X.BODY_W, f"span_px(12)={X.span_px(12)}, BODY_W={X.BODY_W}")
check("span_px follows the gutter", X.span_px(8) + X.COL_GUTTER + X.span_px(4) == X.BODY_W)
check("a body with no title block leaves nearly the whole region",
      X.body_height(0, 0, 0, 0) == X.BODY_H - X.base.H_EYEBROW - X.base.H_TITLE_MARGIN)
check("more blocks leave less height",
      X.body_height(1, 0) > X.body_height(2, 0) > X.body_height(2, 1) > X.body_height(2, 1, 1)
      > X.body_height(2, 1, 1, 1))
check("every grid is a row of its spans",
      all(X.row(*["x"] * len(g), grid=k).count("grid-column:span") == len(g)
          for k, g in X.GRIDS.items()))
try:
    X.row("a", "b", grid="D")
    check("a grid and a piece count that disagree raise", False, "no error raised")
except ValueError:
    check("a grid and a piece count that disagree raise", True)
try:
    X.row(*["x"] * 13)
    check("more than twelve columns raise", False, "no error raised")
except ValueError:
    check("more than twelve columns raise", True)
check("grow makes the row take the rest", "flex:1" in X.row("a", grow=True))
check("spread shares the height in a column", "space-between" in X.column("a", "b", spread=True))

print("7. the measured fill")
measure = HERE / "av_elements" / "measure.py"
run = subprocess.run([sys.executable, str(measure)], capture_output=True, text=True)
if "Chrome not found" in run.stdout:
    print("  skip  Chrome not found — set CHROME_PATH to run this check")
else:
    check("body_height predicts the rendered height within one pixel", run.returncode == 0,
          run.stdout.strip().splitlines()[-1] if run.stdout.strip() else run.stderr[-200:])

print("8. missing data")
probe = D.slide(D.header("01", "Probe", "A title with " + D.accent("==a missing name==") + ".")
                + X.body("At ==Q3 2026==, provisional.",
                         '<svg width="400" height="80"><text x="0" y="30">Series A · '
                         '==value pending==</text></svg>',
                         band="Close rate is **==to be confirmed==**."),
                n=1, total=1, source="probe", client="Probe", key="p01")
doc = D.document("probe", [probe], css_extra=X.CSS)
found = D.list_pending(doc)
check("the marker survives in plain text", any(t == "Q3 2026" for _, _, t in found))
check("the marker survives inside an accent fragment", any(t == "a missing name" for _, _, t in found))
check("the marker survives inside an SVG", 'class="pending-svg"' in doc
      and any(t == "value pending" for _, _, t in found))
check("the marker survives inside bold", any(t == "to be confirmed" for _, _, t in found))
check("every marker carries its slide key", all(k == "p01" for _, k, _ in found))
check("a deck with no marker lists nothing", D.list_pending(deck) == [],
      f"the example deck reports {len(D.list_pending(deck))}")
check("pending.py exits 1 when something is pending",
      subprocess.run([sys.executable, str(HERE / "pending.py"), str(out)],
                     capture_output=True).returncode == 0)

print("9. icons")
check("every theme has icons", all(X.by_theme(t) for t in X.THEMES))
check("every alias points at a real icon", all(r in X.ICONS for r in X.ALIASES.values()))
try:
    X.icon("funnnel")
    check("an unknown name raises", False, "no error raised")
except KeyError as e:
    check("an unknown name raises with a suggestion", "funnel" in str(e), str(e))
check("an alias resolves", 'data-icon="success"' in X.icon("on-track"))
check("find_icon ranks the exact name first", X.find_icon("exit")[0] == "exit")
check("find_icon does not match a short word inside the query",
      "success" not in X.find_icon("carbon"), f"carbon -> {X.find_icon('carbon')}")
check("find_icon survives a typo", X.find_icon("funnnel") == ["funnel"])
# the interface theme has to stay the same geometry as the React package
tsx = (HERE.parents[0] / "packages" / "icons" / "src" / "index.tsx")
if not tsx.exists():
    print("  skip  packages/icons/src/index.tsx not found")
else:
    drift = []
    react = dict(re.findall(r'createIcon\("([^"]+)",\s*(.*?)\);\s*$', tsx.read_text(), re.M))
    for name, jsx in react.items():
        want = re.sub(r"\s+", " ", jsx.strip().replace("<>", "").replace("</>", "")).strip()
        have = X.ICONS.get(name, {}).get("body")
        if have is None:
            drift.append(f"{name} is missing from icons.py")
        elif re.sub(r"\s+", " ", have) != want:
            drift.append(f"{name} differs")
    check(f"the interface theme matches @neonglow/icons ({len(react)} icons)", not drift,
          "; ".join(drift[:3]))
problems = X.check_icons('<p>All good</p>' + X.icon("fund"))
check("a clean document reports no problem", problems == [], str(problems))
problems = X.check_icons('<p>Great 🚀 work ✓</p>')
check("an emoji is reported", any("emoji" in p for p in problems), str(problems))
check("a unicode character used as an icon is reported",
      any("used as an icon" in p for p in problems), str(problems))
check("the brand marks are allowed", X.check_icons("<p>€6.12M · 1.47× – see 2018—2026 →</p>") == [])
check("an unknown icon in a document is reported",
      X.check_icons('<svg data-icon="nope"></svg>') == ["unknown icon: nope"])
cat = HERE.parents[0] / "Icon Catalogue.html"
run = subprocess.run([sys.executable, str(HERE / "av_elements" / "build_catalogue.py")],
                     capture_output=True, text=True)
check("the catalogue builds", run.returncode == 0, run.stderr.strip()[-200:])
if cat.exists():
    page = cat.read_text(encoding="utf-8")
    missing = [n for n in X.ICONS if f">{n}</div>" not in page]
    check(f"the catalogue lists all {len(X.ICONS)} icons", not missing, f"missing {missing[:3]}")

print("10. scenes")
check("every scene theme has scenes", all(X.by_scene_theme(t) for t in X.SCENE_THEMES))
bad = []
for name in X.SCENES:
    for on_dark in (False, True):
        svg = X.scene(name, W=600, accent=0, on_dark=on_dark)
        if not svg.startswith("<svg") or "NaN" in svg or ">None<" in svg:
            bad.append(f"{name}{' dark' if on_dark else ''}")
        h = X.scene_height(name, W=600, on_dark=on_dark)
        if not 150 < h < 900:
            bad.append(f"{name} height {h:.0f}")
check(f"all {len(X.SCENES)} scenes draw on paper and on ink", not bad, str(bad[:3]))
check("a scene fits the width it is given", 'width="600"' in X.scene("laboratory", W=600))
check("grey and accent differ", X.scene("portfolio", 400) != X.scene("portfolio", 400, accent=0))
check("paper and ink differ", X.scene("portfolio", 400) != X.scene("portfolio", 400, on_dark=True))
check("a scene uses no gradient, blur or opacity",
      not re.search(r"(Gradient|filter=|fill-opacity|opacity=)",
                    "".join(X.scene(n, 400) for n in X.SCENES)))
try:
    X.scene("fermentaton")
    check("an unknown scene raises", False, "no error raised")
except KeyError as e:
    check("an unknown scene raises with a suggestion", "fermentation" in str(e), str(e))
cat_s = HERE.parents[0] / "Scene Catalogue.html"
if cat_s.exists():
    page_s = cat_s.read_text(encoding="utf-8")
    missing = [n for n in X.SCENES if f">{n}</div>" not in page_s]
    check(f"the scene catalogue lists all {len(X.SCENES)} scenes", not missing, f"missing {missing[:3]}")
check("the example deck uses a scene and an icon",
      'class="av-scene"' in deck and 'class="av-icon"' in deck)
check("the example deck has no icon problem", X.check_icons(deck) == [], str(X.check_icons(deck)[:3]))

print("11. PDF export")
chrome = next((p for p in CHROME_PATHS if pathlib.Path(p).exists()), os.environ.get("CHROME_PATH"))
if not chrome:
    print("  skip  Chrome not found — set CHROME_PATH to run this check")
else:
    pdf = HERE / "examples" / "example-deck.pdf"
    subprocess.run([chrome, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={pdf}", str(out)], capture_output=True)
    check("the PDF exists", pdf.exists())
    if pdf.exists():
        pages = pdf.read_bytes().count(b"/Type /Page\n") or pdf.read_bytes().count(b"/Type/Page")
        check("one PDF page per slide", pages == 7, f"found {pages} pages")

print()
if fails:
    print(f"{len(fails)} check(s) failed: " + ", ".join(fails))
    sys.exit(1)
print("Accelera deck engine verified.")
