#!/usr/bin/env python3
"""build_catalogue: generates the catalogue pages at the repository root from icons.py and scenes.py.

    python3 decks/av_elements/build_catalogue.py

One source. The pages are generated, never edited by hand:
  - "Icon Catalogue.html"  — every icon, by theme, with a search box.
  - "Scene Catalogue.html" — every isometric scene, with and without the accent.
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
import icons as I  # noqa: E402
import scenes as SC  # noqa: E402

OUT = ROOT / "Icon Catalogue.html"
OUT_SCENES = ROOT / "Scene Catalogue.html"

SHARED_CSS = """
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-sans);}
  .wrap{max-width:1240px;margin:0 auto;padding:80px 40px 120px}
  h1{font-size:64px;font-weight:500;letter-spacing:-.02em;margin:0 0 20px}
  .lede{font-size:22px;font-weight:300;color:var(--ink-2);max-width:760px;margin:0 0 40px;
  line-height:1.45}
  .lede code{font-size:18px;background:var(--paper-2);padding:2px 8px;border-radius:6px}
  h2{font-size:16px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;
  color:var(--ink-3);margin:56px 0 20px;display:flex;gap:12px;align-items:baseline}
  h2 span{font-family:var(--font-mono);font-size:13px;color:var(--ink-3)}
  .rules{margin-top:80px;padding-top:40px;border-top:2px solid var(--ink)}
  .rules li{font-size:18px;font-weight:300;color:var(--ink-2);line-height:1.5;margin-bottom:10px}
  table{border-collapse:collapse;margin-top:20px;font-size:14px}
  td{padding:7px 24px 7px 0;font-family:var(--font-mono);color:var(--ink-2)}
  td:first-child{color:var(--ink)}
"""


def scene_page():
    """Every scene, grey and with the accent on its first element, so the difference is visible."""
    sections = []
    for theme in SC.SCENE_THEMES:
        cards = []
        for name in SC.by_scene_theme(theme):
            spec = SC.SCENES[name]
            cards.append(
                f'    <div class="sc">\n'
                f'      <div class="two"><div>{SC.scene(name, 300)}</div>'
                f'<div>{SC.scene(name, 300, accent=0)}</div></div>\n'
                f'      <div class="n">{name}</div>\n'
                f'      <div class="d">{spec["description"]}</div>\n'
                f'      <div class="k">{spec["words"]}</div>\n'
                f"    </div>")
        sections.append(f'  <section>\n    <h2>{theme}<span>{len(cards)}</span></h2>\n'
                        f'    <div class="grid">\n' + "\n".join(cards) + "\n    </div>\n  </section>")
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Accelera Ventures — Scene Catalogue</title>
<link rel="stylesheet" href="styles.css">
<style>{SHARED_CSS}
  .grid{{display:grid;grid-template-columns:1fr;gap:2px;background:var(--rule-faint);
  border:1px solid var(--rule-faint)}}
  .sc{{background:var(--paper);padding:32px}}
  .two{{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}}
  .n{{font-family:var(--font-mono);font-size:16px;margin-top:24px}}
  .d{{font-size:18px;font-weight:300;color:var(--ink-2);margin-top:8px;line-height:1.45}}
  .k{{font-size:12px;color:var(--ink-3);margin-top:8px;font-family:var(--font-mono)}}
</style>
</head>
<body>
<div class="wrap">
  <h1>Scene catalogue</h1>
  <p class="lede">{len(SC.SCENES)} isometric scenes. Draw one with <code>X.scene("name", W=700)</code>.
  Left: the scene as it comes, all grey — the right default for a chapter divider. Right: the same
  scene with <code>accent=0</code>, which marks the one element the slide names.</p>
{chr(10).join(sections)}
  <section class="rules">
    <h2>Rules</h2>
    <ul>
      <li><strong>A scene gives context a chart cannot</strong> — the plant, the lab, the farm, the
      site. Never use one as decoration, and never use one when a number would say it better.</li>
      <li><strong>Grey by default.</strong> The accent marks the one element the slide is about, and
      only when the slide names it. Leave <code>accent=None</code> on a divider.</li>
      <li><strong>No glass, no blur, no transparency.</strong> Glazing is drawn as an open frame of
      hairlines, so what is inside still reads. Solid fills only, as everywhere else in the system.</li>
      <li><strong>A scene is a diagram, not imagery.</strong> It is built from the same flat fills as a
      chart, which is why it is allowed where a photograph is not.</li>
    </ul>
  </section>
</div>
</body>
</html>
"""

CARD = """    <div class="ic" data-find="{find}">
      <div class="g">{svg}</div>
      <div class="n">{name}</div>
      <div class="w">{words}</div>
    </div>"""


def main():
    sections = []
    for theme in I.THEMES:
        names = I.by_theme(theme)
        cards = "\n".join(
            CARD.format(find=f"{n} {I.ICONS[n]['words']} {theme}", svg=I.icon(n, 28),
                        name=n, words=I.ICONS[n]["words"])
            for n in names)
        sections.append(f'  <section class="th" data-theme="{theme}">\n'
                        f'    <h2>{theme}<span>{len(names)}</span></h2>\n'
                        f'    <div class="grid">\n{cards}\n    </div>\n  </section>')
    aliases = "".join(f"<tr><td>{a}</td><td>{r}</td></tr>" for a, r in sorted(I.ALIASES.items()))
    body = "\n".join(sections)
    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Accelera Ventures — Icon Catalogue</title>
<link rel="stylesheet" href="styles.css">
<style>
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-sans);}}
  .wrap{{max-width:1240px;margin:0 auto;padding:80px 40px 120px}}
  h1{{font-size:64px;font-weight:500;letter-spacing:-.02em;margin:0 0 20px}}
  .lede{{font-size:22px;font-weight:300;color:var(--ink-2);max-width:760px;margin:0 0 40px;
  line-height:1.45}}
  .lede code{{font-size:18px;background:var(--paper-2);padding:2px 8px;border-radius:6px}}
  .bar{{position:sticky;top:0;background:var(--paper);padding:20px 0 20px;z-index:2;
  border-bottom:2px solid var(--ink);margin-bottom:40px;display:flex;gap:20px;align-items:center}}
  input{{flex:1;font-family:var(--font-mono);font-size:16px;padding:14px 18px;
  border:1.5px solid var(--rule-light);border-radius:6px;background:var(--paper);color:var(--ink)}}
  input:focus{{outline:none;border-color:var(--ink)}}
  .count{{font-family:var(--font-mono);font-size:14px;color:var(--ink-3);white-space:nowrap}}
  h2{{font-size:16px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;
  color:var(--ink-3);margin:56px 0 20px;display:flex;gap:12px;align-items:baseline}}
  h2 span{{font-family:var(--font-mono);font-size:13px;color:var(--ink-3)}}
  .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:2px;
  background:var(--rule-faint);border:1px solid var(--rule-faint)}}
  .ic{{background:var(--paper);padding:24px 16px 18px;text-align:center}}
  .ic .g{{height:40px;display:flex;align-items:center;justify-content:center;color:var(--ink)}}
  .ic .n{{font-family:var(--font-mono);font-size:13px;margin-top:14px;word-break:break-word}}
  .ic .w{{font-size:11px;color:var(--ink-3);margin-top:6px;line-height:1.35;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}}
  .th.hide,.ic.hide{{display:none}}
  table{{border-collapse:collapse;margin-top:20px;font-size:14px}}
  td{{padding:7px 24px 7px 0;font-family:var(--font-mono);color:var(--ink-2)}}
  td:first-child{{color:var(--ink)}}
  .rules{{margin-top:80px;padding-top:40px;border-top:2px solid var(--ink)}}
  .rules li{{font-size:18px;font-weight:300;color:var(--ink-2);line-height:1.5;margin-bottom:10px}}
</style>
</head>
<body>
<div class="wrap">
  <h1>Icon catalogue</h1>
  <p class="lede">{len(I.ICONS)} icons in {len(I.THEMES)} themes. Draw one with
  <code>X.icon("name")</code>. The name has to exist — <code>icon()</code> raises instead of printing
  nothing. Search by name or by what you mean: <code>X.find_icon("money")</code>.</p>
  <div class="bar">
    <input id="q" type="search" placeholder="Search by name, keyword or theme…" autocomplete="off">
    <span class="count" id="count"></span>
  </div>
{body}
  <section class="rules">
    <h2>Rules</h2>
    <ul>
      <li><strong>No emoji.</strong> Not for bullets, not for status, nowhere.</li>
      <li><strong>No unicode character used as an icon.</strong> No ✓, no ★, no arrow as a section mark.
      The only marks that belong to the system are <code>·</code> <code>–</code> <code>—</code>
      <code>→</code> (money flow only) and <code>×</code> (the MOIC unit).</li>
      <li><strong>An icon is functional and secondary.</strong> It supports a label; it never carries
      the message of a slide on its own, and it is never decoration.</li>
      <li><strong>One geometry.</strong> 24 px box, 1.5 stroke, no fill, currentColor. The
      <code>interface</code> theme is the same geometry as the React package
      <code>@neonglow/icons</code>; <code>verify.py</code> fails if the two drift apart.</li>
      <li><strong>Check before you deliver.</strong> <code>X.check_icons(deck_html)</code> reports an
      unknown name, an emoji, or a unicode character used as an icon.</li>
    </ul>
    <h2>Aliases</h2>
    <table><tbody>{aliases}</tbody></table>
  </section>
</div>
<script>
  const q = document.getElementById('q'), count = document.getElementById('count');
  const cards = [...document.querySelectorAll('.ic')], themes = [...document.querySelectorAll('.th')];
  function run() {{
    const t = q.value.toLowerCase().trim();
    let n = 0;
    cards.forEach(c => {{
      const hit = !t || c.dataset.find.includes(t);
      c.classList.toggle('hide', !hit);
      if (hit) n++;
    }});
    themes.forEach(s => s.classList.toggle('hide',
      !s.querySelectorAll('.ic:not(.hide)').length));
    count.textContent = n + ' / ' + cards.length;
  }}
  q.addEventListener('input', run);
  run();
</script>
</body>
</html>
"""
    OUT.write_text(page, encoding="utf-8")
    print(f"{OUT} · {len(I.ICONS)} icons in {len(I.THEMES)} themes")
    OUT_SCENES.write_text(scene_page(), encoding="utf-8")
    print(f"{OUT_SCENES} · {len(SC.SCENES)} scenes in {len(SC.SCENE_THEMES)} themes")


if __name__ == "__main__":
    main()
