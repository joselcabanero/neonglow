#!/usr/bin/env python3
"""The fixed base and the layout system, one slide per piece. Run it to get example-deck.html here.

    python3 decks/examples/build_example.py

It is also the smoke test: verify.py runs it on every check.
"""
import os
import pathlib
import sys

sys.path.insert(0, os.environ.get("ACCELERA_DECK_DIR", str(pathlib.Path(__file__).resolve().parents[1])))
import av_deck as D  # noqa: E402
import av_elements as X  # noqa: E402

CLIENT = "Demo LP"
TOTAL = 7
slides = []


def metric(label, value, unit="", note=""):
    """A metric block. Not a library piece — the element library comes later."""
    u = f'<span style="font-size:44px;font-weight:400;color:var(--ink-3);margin-left:10px">{unit}</span>' if unit else ""
    return (X.block_label(label)
            + f'<div style="font-size:128px;font-weight:500;line-height:.95;letter-spacing:-.04em;'
              f'font-variant-numeric:tabular-nums">{value}{u}</div>'
            + (f'<div style="font-size:22px;color:var(--ink-3);margin-top:20px;line-height:1.3">{note}</div>'
               if note else ""))


def bars(rows, W, H):
    """A horizontal bar chart that takes the width and the height it is given. It shows the H contract:
    the piece fills the space that body_height() reserved for it."""
    top = max(v for _, v, _ in rows)
    step = H / len(rows)
    bar_h = min(56, step * 0.42)
    label_w, value_w = 260, 120
    track = W - label_w - value_w - 48
    out = []
    for i, (name, value, accent) in enumerate(rows):
        y = i * step + (step - bar_h) / 2
        w = track * value / top
        fill = "var(--accent)" if accent else "var(--paper-2)"
        out.append(
            f'<text x="0" y="{y + bar_h / 2 + 8}" font-size="24" fill="var(--ink)">{name}</text>'
            f'<rect x="{label_w}" y="{y}" width="{w:.1f}" height="{bar_h:.1f}" rx="6" fill="{fill}"/>'
            f'<text x="{W}" y="{y + bar_h / 2 + 8}" font-size="24" font-weight="700" '
            f'text-anchor="end" fill="var(--ink)" style="font-family:var(--font-mono)">'
            f"{value:.2f}×</text>")
    return (f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
            f'style="display:block">{"".join(out)}</svg>')


# 01 — cover
slides.append(D.cover(
    line1="Portfolio", line2="Track Record", accent_line="2018–2026",
    subtitle="Legacy portfolio · €6.12M value · 1.47× MOIC across two funds",
    kicker="Confidential · For LP distribution",
    prepared_for=CLIENT, date="October 2026", team=["Javier Nadal", "Ana Ruiz"],
    year=2026, n=1, total=TOTAL))

# 02 — agenda
slides.append(D.agenda([
    ("Portfolio at a glance", "Where the two funds stand today."),
    ("The landmark exit", "Ekonoke, 14.58× in 29 months."),
    ("Sector performance", "Agritech leads on realised MOIC."),
    ("Thesis and reserves", "What we back and what we hold back."),
], subtitle="Four sections. Numbers first, narrative second.", n=2, total=TOTAL))

# 03 — chapter divider with an isometric scene. Grey, because the divider names no single company.
slides.append(D.chapter("01", "Portfolio at a glance",
                        "Two funds, thirty-five companies, one realised exit.",
                        visual_html=X.scene("portfolio", W=620, on_dark=True),
                        n=3, total=TOTAL))

# 04 — grid D, three metrics. The row takes the height the body left, so there is no hole at the foot.
H = X.body_height(title_lines=2, subtitle=1, band=1)
body = D.header("01", "Portfolio at a Glance",
                "Two funds. Thirty-five companies.<br>One exit at " + D.accent("14.58×") + ".")
body += X.body(
    "Both funds are above cost. The concentration is deliberate, not accidental.",
    X.row(X.column(metric("Current portfolio value", "€6.12", "M",
                          "On €4.15M deployed — €1.97M of value creation to date.")),
          X.column(metric("Active companies", "32",
                          note="Two COVID write-offs before the programme. Zero in the Fund.")),
          X.column(metric("Overall MOIC", "1.47", "×",
                          "Spain SPV 2.09× · Fund I 1.27× at two-year maturity.")),
          grid="D", vertical="flex-start", grow=True),
    band="One position carries **36% of the portfolio value**. Reserves are sized for that, not against it.",
    band_label="Conclusion")
slides.append(D.slide(body, n=4, total=TOTAL, source="Source: internal valuations, Q4 2026",
                      client=CLIENT, key="s04"))

# 05 — grid F, context column and a piece that receives H
H = X.body_height(title_lines=1, subtitle=1, band=1)
W = X.span_px(8)
context = X.column(
    X.block_label("How to read it", strong=True),
    X.icon_label("exit", "One realised exit carries the figure"),
    '<p style="font-size:22px;font-weight:300;line-height:1.45;color:var(--ink-2);margin:0">'
    "Realised and unrealised MOIC by sector, across both funds. Agritech carries the only exit, "
    "so its figure is the one to question first.</p>",
    '<p style="font-size:22px;font-weight:300;line-height:1.45;color:var(--ink-2);margin:0">'
    "Logistics is below cost at a single position. It is too early to read anything into it.</p>",
    gap=X.BASELINE_HALF)
body = D.header("02", "Sector Performance",
                "Agritech carries the " + D.accent("realised return") + ".", size="md")
body += X.body(
    "Sector MOIC, realised and unrealised, across 35 positions.",
    X.row(context,
          bars([("Agritech", 2.18, True), ("Foodtech", 1.46, False), ("Logistics", 0.97, False)], W, H),
          grid="F", vertical="flex-start", grow=True),
    band="Strip out Ekonoke and agritech falls to **1.12×**. One exit is not a sector thesis.",
    band_label="Conclusion")
slides.append(D.slide(body, n=5, total=TOTAL, source="Source: internal valuations, Q4 2026",
                      client=CLIENT, key="s05"))

# 06 — content slide, ink. Dark is for moments: one number carries the slide.
body = D.header("03", "The Landmark Exit",
                "One position returned more than the whole " + D.accent("2020 programme") + ".",
                chips=D.chip("Realised"))
body += X.body(
    "",
    """
<div style="display:flex;align-items:flex-end;gap:60px">
  <div style="font-family:var(--font-mono);font-size:260px;font-weight:700;letter-spacing:-.05em;
  line-height:.8;color:var(--accent);font-variant-numeric:tabular-nums">14.58<span
  style="font-size:96px;color:var(--paper);margin-left:10px">×</span></div>
  <div style="padding-bottom:40px;max-width:460px">
    <div style="font-size:16px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;
    color:var(--grey-9b)">MOIC at exit</div>
    <div style="font-size:32px;margin-top:14px;line-height:1.2">Ekonoke · Series A · Dec 2022</div>
    <div style="font-size:20px;color:var(--grey-9b);margin-top:20px;line-height:1.5">
    Entry Jul 2020 · Exit Dec 2022<br>29 months hold · Indoor hop farming · Spain</div>
  </div>
</div>""",
    band="**€152K → €2.21M.** A single position returned more than we deployed into the entire "
         "Fund I programme that year.")
slides.append(D.slide(body, n=6, total=TOTAL, source="Source: exit documentation, Dec 2022",
                      client=CLIENT, dark=True, key="s06"))

# 07 — closing
slides.append(D.closing("Let's build the", "sustainable", accent_line="future.",
                        next_step="Q1 2027 LP update",
                        contacts=[("Contact", "Javier Nadal", "Managing Partner"),
                                  ("Email", "lp@accelera.vc"),
                                  ("Office", "Madrid · Iberia")],
                        client=CLIENT, n=7, total=TOTAL))

out = pathlib.Path(__file__).resolve().parent / "example-deck.html"
out.write_text(D.document("Accelera Ventures — fixed base and layout", slides, css_extra=X.CSS_ALL),
               encoding="utf-8")
print(f"{out} · {len(slides)} slides")
