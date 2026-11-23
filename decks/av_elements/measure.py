#!/usr/bin/env python3
"""measure: measures the real height of every block of a content slide in Chrome.

The constants of body_height() are not a guess. This script builds a page with the real CSS, measures
each block, prints the constants and then checks the prediction of body_height() against the height that
Chrome gives to .vis.

    python3 decks/av_elements/measure.py

Exit code 0 when every prediction falls within one pixel, 1 otherwise.
"""
import json
import os
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "decks"))
sys.path.insert(0, str(HERE.parent))
import av_deck as D  # noqa: E402

from base import BODY_H, body, body_height  # noqa: E402
import base as B  # noqa: E402

CHROME_PATHS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
]

# Every case: a title of n lines, a subtitle of n lines, a band of n lines, a note of n lines.
CASES = [
    dict(name="title 2 · sub 1", title_lines=2, subtitle=1, band=0, note=0, size=""),
    dict(name="title 1 · sub 1", title_lines=1, subtitle=1, band=0, note=0, size=""),
    dict(name="title 2 · no sub", title_lines=2, subtitle=0, band=0, note=0, size=""),
    dict(name="title 2 · sub 1 · band 1", title_lines=2, subtitle=1, band=1, note=0, size=""),
    dict(name="title 2 · sub 1 · band 2", title_lines=2, subtitle=1, band=2, note=0, size=""),
    dict(name="title 2 · sub 1 · note 1", title_lines=2, subtitle=1, band=0, note=1, size=""),
    dict(name="title 2 · sub 2 · band 1", title_lines=2, subtitle=2, band=1, note=0, size=""),
    dict(name="title 2 md · sub 1", title_lines=2, subtitle=1, band=0, note=0, size="md"),
    dict(name="title 2 sm · sub 1", title_lines=2, subtitle=1, band=0, note=0, size="sm"),
    dict(name="title 1 sm · no sub · band 1", title_lines=1, subtitle=0, band=1, note=0, size="sm"),
]

# Text that is wide enough to wrap into exactly n lines at each size.
WORD = "Portfolio "


def _lines(n, per_line):
    return (WORD * (n * per_line)).strip()


def build_page():
    slides = []
    for i, c in enumerate(CASES):
        title = _lines(c["title_lines"], {"": 3, "md": 4, "sm": 5}[c["size"]])
        sub = _lines(c["subtitle"], 9) if c["subtitle"] else ""
        band = _lines(c["band"], 11) if c["band"] else None
        note = _lines(c["note"], 16) if c["note"] else None
        head = D.header("01", "Measure", title, size=c["size"])
        slides.append(D.slide(body(sub, '<div class="probe"></div>', band=band, note=note),
                              n=i + 1, total=len(CASES), source="measure", client="Measure",
                              key=f"m{i}").replace('<div class="body-region">',
                                                   f'<div class="body-region" data-case="{i}">')
                      .replace('<div class="vis"', '<div class="vis" data-vis="1"', 1)
                      .replace('data-case="%d">' % i, 'data-case="%d">%s' % (i, head), 1))
    # The fonts are embedded but they are still decoded asynchronously. Measuring before
    # document.fonts.ready gives fallback metrics, and a title that wraps to two lines measures as one.
    script = """
<script>
document.fonts.ready.then(() => {
const out = [];
document.querySelectorAll('[data-case]').forEach(region => {
  const q = s => region.querySelector(s);
  const box = el => el ? el.getBoundingClientRect().height : 0;
  const mt = el => el ? parseFloat(getComputedStyle(el).marginTop) : 0;
  const mb = el => el ? parseFloat(getComputedStyle(el).marginBottom) : 0;
  const eb = q('.eyebrow'), ti = q('h1.title'), su = q('.sub'), ba = q('.band'), no = q('.pre-foot');
  out.push({
    case: Number(region.dataset.case),
    region: box(region),
    eyebrow: box(eb) + mb(eb),
    title: box(ti), titleMargin: mt(ti) + mb(ti),
    titleLines: ti ? Math.round(box(ti) / parseFloat(getComputedStyle(ti).lineHeight)) : 0,
    sub: box(su), subMargin: mb(su),
    subLines: su ? Math.round(box(su) / parseFloat(getComputedStyle(su).lineHeight)) : 0,
    band: box(ba), bandMargin: mt(ba),
    bandLines: ba ? Math.round((box(ba) - 40) / parseFloat(getComputedStyle(ba).lineHeight)) : 0,
    note: box(no), noteMargin: mt(no),
    noteLines: no ? Math.round(box(no) / parseFloat(getComputedStyle(no).lineHeight)) : 0,
    vis: box(q('.vis')),
  });
});
const pre = document.createElement('pre');
pre.id = 'measured';
pre.textContent = JSON.stringify(out);
document.body.appendChild(pre);
});
</script>
"""
    return D.document("measure", slides, css_extra=B.CSS).replace("</body>", script + "</body>")


def main():
    chrome = next((p for p in CHROME_PATHS if pathlib.Path(p).exists()), os.environ.get("CHROME_PATH"))
    if not chrome:
        print("Chrome not found. Set CHROME_PATH.")
        return 1
    tmp = HERE / "_measure.html"
    tmp.write_text(build_page(), encoding="utf-8")
    dom = subprocess.run([chrome, "--headless", "--disable-gpu", "--virtual-time-budget=4000",
                          "--dump-dom", str(tmp)], capture_output=True, text=True).stdout
    tmp.unlink()
    m = re.search(r'<pre id="measured">(.*?)</pre>', dom, re.S)
    if not m:
        print("the page did not report any measurement")
        return 1
    data = json.loads(m.group(1).replace("&quot;", '"'))

    print(f"{'case':30s} {'title/line':>10s} {'sub/line':>9s} {'band/line':>10s} "
          f"{'predicted':>10s} {'rendered':>9s} {'diff':>5s}")
    bad = 0
    for row, c in zip(data, CASES):
        assert row["region"] == BODY_H, f"the body region is {row['region']}, not {BODY_H}"
        per_title = row["title"] / row["titleLines"] if row["titleLines"] else 0
        per_sub = row["sub"] / row["subLines"] if row["subLines"] else 0
        per_band = (row["band"] - 40) / row["bandLines"] if row["bandLines"] else 0
        predicted = body_height(c["title_lines"], c["subtitle"], c["band"], c["note"], c["size"])
        diff = predicted - row["vis"]
        if abs(diff) > 1:
            bad += 1
        print(f"{c['name']:30s} {per_title:10.1f} {per_sub:9.1f} {per_band:10.1f} "
              f"{predicted:10d} {row['vis']:9.1f} {diff:+5.1f}")

    first = data[0]
    print("\nconstants measured on case 1:")
    print(f"  H_EYEBROW        = {round(first['eyebrow'])}")
    print(f"  H_TITLE_LINE     = {round(first['title'] / first['titleLines'])}")
    print(f"  H_TITLE_MARGIN   = {round(first['titleMargin'])}")
    print(f"  H_SUBTITLE_LINE  = {round(first['sub'] / first['subLines'])}")
    print(f"  H_SUBTITLE_MARGIN= {round(first['subMargin'])}")
    band_case = next(r for r, c in zip(data, CASES) if c["band"])
    print(f"  H_BAND_LINE      = {round((band_case['band'] - 40) / band_case['bandLines'])}")
    print(f"  H_BAND_FRAME     = {round(band_case['band'] - band_case['bandLines'] * ((band_case['band'] - 40) / band_case['bandLines']) + band_case['bandMargin'])}")
    note_case = next(r for r, c in zip(data, CASES) if c["note"])
    print(f"  H_NOTE_LINE      = {round(note_case['note'] / note_case['noteLines'])}")
    print(f"  H_NOTE_MARGIN    = {round(note_case['noteMargin'])}")
    md_case = next(r for r, c in zip(data, CASES) if c["size"] == "md")
    sm_case = next(r for r, c in zip(data, CASES) if c["size"] == "sm")
    print(f"  H_TITLE_LINE_MD  = {round(md_case['title'] / md_case['titleLines'])}")
    print(f"  H_TITLE_LINE_SM  = {round(sm_case['title'] / sm_case['titleLines'])}")

    print()
    if bad:
        print(f"{bad} of {len(CASES)} cases are off by more than one pixel. Update the constants in base.py.")
        return 1
    print(f"all {len(CASES)} cases predicted within one pixel.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
