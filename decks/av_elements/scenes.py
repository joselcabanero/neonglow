#!/usr/bin/env python3
"""scenes: isometric scenes that illustrate what a company or a fund actually does.

A scene gives a slide context that a chart cannot: the plant, the lab, the farm, the site. Use one on a
chapter divider, or beside a short text when a photo would be generic. Never use one as decoration, and
never use one when a number would say it better.

    X.scene("fermentation", W=700)            the SVG
    X.scene("fermentation", W=700, accent=2)  the third vessel in accent
    X.find_scene("solar")                     ['solar-farm', 'battery-site', ...]
    X.SCENES["laboratory"]["description"]     what it shows

**Colour.** A scene is grey. The accent marks the one element the slide is about — the plant that is
ours, the site that is funded, the step that is the bottleneck. One accent per scene, and only when the
slide names it. `accent=None` leaves the whole scene grey, which is the right default for a divider.

**Geometry.** True isometric: x goes right and down, y goes left and down, z goes up. Build in world
units; the renderer fits the drawing to the width you ask for.
"""
import html
import math
import re

E = html.escape

# --- projection -----------------------------------------------------------
COS30 = math.cos(math.radians(30))   # 0.8660
SIN30 = 0.5
# a circle of radius r in the ground plane projects to an ellipse with these semi-axes
ELL_RX = COS30 * math.sqrt(2)        # 1.2247
ELL_RY = SIN30 * math.sqrt(2)        # 0.7071


def project(x, y, z):
    """World (x, y, z) to screen (sx, sy). Screen y grows downwards, so height is subtracted."""
    return ((x - y) * COS30, (x + y) * SIN30 - z)


# --- surfaces -------------------------------------------------------------
# Three tints per material: the top catches the light, the left face is mid, the right face is dark.
# The greys are the paper tints of the system. The accent shades are derived from --accent by
# multiplying its channels; they exist only here, so a scene can read as a solid without a gradient.
MATERIALS = {
    "mass": ("#eeeef0", "#dcdce1", "#c2c2c8"),    # the default body of a building or a tank
    "pale": ("#f6f6f7", "#e9e9ec", "#d6d6db"),    # a lighter mass, to separate two volumes
    "dark": ("#55555a", "#434348", "#313135"),    # a plinth, a roof, a shadowed volume
    "ink":  ("#2a2a2a", "#1e1e1e", "#131313"),    # the darkest element
    "accent": ("#7BF076", "#62C05E", "#4C9549"),  # the one element the slide is about
    "cool": ("#e4f0ef", "#d3e3e2", "#bed2d1"),    # water, a cooled volume — a solid tint, not glass
}
# On an ink slide the paper greys glare. The same scene is drawn from a second table, so a divider or
# a dark hero reads at the same weight as it does on paper. The accent does not change: it reads on both.
MATERIALS_DARK = {
    "mass": ("#4c4c53", "#3c3c42", "#2e2e33"),
    "pale": ("#5c5c64", "#4c4c53", "#3c3c42"),
    "dark": ("#2a2a2e", "#222226", "#1a1a1d"),
    "ink":  ("#1a1a1d", "#141417", "#101012"),
    "accent": ("#7BF076", "#62C05E", "#4C9549"),
    "cool": ("#3d4c4b", "#324241", "#293736"),
}
# The brand forbids glass, blur and transparency outside the watermark and the hairlines. Glazing is
# therefore drawn as an open frame of hairlines, with frame(), never as a translucent volume.
STROKE = "rgba(10,10,10,.22)"
STROKE_DARK = "rgba(255,255,255,.26)"
TOP, LEFT, RIGHT = 0, 1, 2


class Scene:
    """Collects solids in world units. Draw back to front: the painter's order is the order you call."""

    def __init__(self, on_dark=False):
        self.parts = []
        self.points = []
        self.mat = MATERIALS_DARK if on_dark else MATERIALS
        self.stroke = STROKE_DARK if on_dark else STROKE

    # -- core
    def poly(self, pts3, material="mass", face=TOP, stroke=True):
        """A flat polygon from a list of (x, y, z) points."""
        pts = [project(*p) for p in pts3]
        self.points += pts
        d = " ".join(f"{sx:.2f},{sy:.2f}" for sx, sy in pts)
        s = f' stroke="{self.stroke}" stroke-width="1" vector-effect="non-scaling-stroke"' if stroke else ""
        self.parts.append(f'<polygon points="{d}" fill="{self.mat[material][face]}"{s}/>')
        return self

    def line(self, p1, p2, width=1, colour=None):
        colour = colour or self.stroke
        a, b = project(*p1), project(*p2)
        self.points += [a, b]
        self.parts.append(
            f'<line x1="{a[0]:.2f}" y1="{a[1]:.2f}" x2="{b[0]:.2f}" y2="{b[1]:.2f}" '
            f'stroke="{colour}" stroke-width="{width}" stroke-linecap="round" '
            f'vector-effect="non-scaling-stroke"/>')
        return self

    # -- solids
    def box(self, x, y, z, w, d, h, material="mass"):
        """A rectangular solid with its near corner at (x, y, z)."""
        self.poly([(x, y + d, z), (x + w, y + d, z), (x + w, y + d, z + h), (x, y + d, z + h)],
                  material, LEFT)
        self.poly([(x + w, y, z), (x + w, y + d, z), (x + w, y + d, z + h), (x + w, y, z + h)],
                  material, RIGHT)
        self.poly([(x, y, z + h), (x + w, y, z + h), (x + w, y + d, z + h), (x, y + d, z + h)],
                  material, TOP)
        return self

    def slab(self, x, y, w, d, material="pale", z=0):
        """A thin ground plate. Put one under a scene to seat it."""
        self.poly([(x, y, z), (x + w, y, z), (x + w, y + d, z), (x, y + d, z)], material, TOP)
        return self

    def cyl(self, cx, cy, z, r, h, material="mass"):
        """A vertical cylinder: tank, vessel, silo, tower."""
        ox, oy = project(cx, cy, 0)
        rx, ry = r * ELL_RX, r * ELL_RY
        top = oy - z - h
        self.points += [(ox - rx, top - ry), (ox + rx, top + ry), (ox - rx, oy - z + ry),
                        (ox + rx, oy - z + ry)]
        s = f'stroke="{self.stroke}" stroke-width="1" vector-effect="non-scaling-stroke"'
        body = (f'M{ox - rx:.2f},{top:.2f} L{ox - rx:.2f},{oy - z:.2f} '
                f'A{rx:.2f},{ry:.2f} 0 0 0 {ox + rx:.2f},{oy - z:.2f} '
                f'L{ox + rx:.2f},{top:.2f} Z')
        self.parts.append(f'<path d="{body}" fill="{self.mat[material][LEFT]}" {s}/>')
        self.parts.append(f'<ellipse cx="{ox:.2f}" cy="{top:.2f}" rx="{rx:.2f}" ry="{ry:.2f}" '
                          f'fill="{self.mat[material][TOP]}" {s}/>')
        return self

    def cone(self, cx, cy, z, r, h, material="mass"):
        """A cone: a tree crown, a heap, a hopper."""
        ox, oy = project(cx, cy, 0)
        rx, ry = r * ELL_RX, r * ELL_RY
        base, apex = oy - z, oy - z - h
        self.points += [(ox - rx, apex), (ox + rx, base + ry)]
        s = f'stroke="{self.stroke}" stroke-width="1" vector-effect="non-scaling-stroke"'
        self.parts.append(
            f'<path d="M{ox - rx:.2f},{base:.2f} A{rx:.2f},{ry:.2f} 0 0 0 {ox + rx:.2f},{base:.2f} '
            f'L{ox:.2f},{apex:.2f} Z" fill="{self.mat[material][LEFT]}" {s}/>')
        return self

    def roof(self, x, y, z, w, d, h, material="dark"):
        """A ridged roof over a box of the same footprint. The ridge runs along x."""
        mid = y + d / 2
        self.poly([(x, y + d, z), (x + w, y + d, z), (x + w, mid, z + h), (x, mid, z + h)],
                  material, LEFT)
        self.poly([(x, y, z), (x, mid, z + h), (x + w, mid, z + h), (x + w, y, z)], material, TOP)
        return self

    def tilt(self, x, y, z, w, d, rise, material="cool"):
        """A tilted plane: a solar panel, a ramp, a sloped glass roof. It rises along +y."""
        self.poly([(x, y, z + rise), (x + w, y, z + rise), (x + w, y + d, z), (x, y + d, z)],
                  material, TOP)
        return self

    def frame(self, x, y, z, w, d, h, ridge=0):
        """The visible edges of a box, with no fill. Glazing and open structures are drawn this way,
        so what is inside still reads. ridge raises a roof line along the middle of y."""
        a, b = (x, y, z), (x + w, y, z)
        c, e = (x + w, y + d, z), (x, y + d, z)
        for p, q in ((a, b), (b, c), (c, e), (e, a)):
            self.line(p, q)
        for px, py in ((x, y), (x + w, y), (x + w, y + d), (x, y + d)):
            self.line((px, py, z), (px, py, z + h))
        top = [(x, y, z + h), (x + w, y, z + h), (x + w, y + d, z + h), (x, y + d, z + h)]
        for i in range(4):
            self.line(top[i], top[(i + 1) % 4])
        if ridge:
            mid = y + d / 2
            self.line((x, mid, z + h + ridge), (x + w, mid, z + h + ridge))
            for px in (x, x + w):
                self.line((px, y, z + h), (px, mid, z + h + ridge))
                self.line((px, y + d, z + h), (px, mid, z + h + ridge))
        return self

    def tree(self, x, y, crown="dark", h=2.6, r=0.95):
        """A tree: a trunk and a crown. The crown material marks a block that the slide names.
        The crown starts above the top of the trunk, so the trunk still reads."""
        self.cyl(x, y, 0, 0.13, 1.0, "ink")
        self.cone(x, y, 0.85, r, h, crown)
        return self

    def rows(self, n, step, fn):
        """Call fn(i) n times with the index, for a row of identical solids."""
        for i in range(n):
            fn(i, i * step)
        return self

    # -- output
    def render(self, W, pad=2):
        if not self.points:
            raise ValueError("the scene drew nothing")
        xs = [p[0] for p in self.points]
        ys = [p[1] for p in self.points]
        x0, x1, y0, y1 = min(xs) - pad, max(xs) + pad, min(ys) - pad, max(ys) + pad
        w, h = x1 - x0, y1 - y0
        scale = W / w
        H = h * scale
        return (f'<svg class="av-scene" width="{W:.0f}" height="{H:.0f}" '
                f'viewBox="{x0:.2f} {y0:.2f} {w:.2f} {h:.2f}" '
                f'style="display:block;overflow:visible">{"".join(self.parts)}</svg>'), H


# --- the registry ----------------------------------------------------------
SCENES = {}
SCENE_THEMES = ["investment", "climate", "biotech"]


def scene_def(name, description, theme, words=""):
    """Declares a scene. The function receives the builder and an accent index, and draws."""
    def wrap(fn):
        SCENES[name] = dict(fn=fn, description=description, theme=theme, words=words)
        return fn
    return wrap


def scene(name, W=700, accent=None, on_dark=False, title=None):
    """One scene as inline SVG, fitted to W px wide.

    accent: the index of the element to put on the accent, counting from 0, or None for an all-grey
    scene. What the index means is written in the description of each scene.
    on_dark: draw the scene for an ink slide. A chapter divider and a dark hero both need it."""
    if name not in SCENES:
        near = find_scene(name)
        hint = f" Did you mean: {', '.join(near[:4])}?" if near else " Run find_scene() to search."
        raise KeyError(f"there is no scene named {name!r}.{hint}")
    s = Scene(on_dark)
    SCENES[name]["fn"](s, accent)
    svg, _ = s.render(W)
    if title:
        svg = svg.replace(">", f'><title>{E(title)}</title>', 1)
    return svg


def scene_height(name, W=700, accent=None, on_dark=False):
    """The height the scene will take at that width, so a layout can reserve it."""
    s = Scene(on_dark)
    SCENES[name]["fn"](s, accent)
    return s.render(W)[1]


def find_scene(query, theme=None):
    """The scenes whose name, theme, description or keywords match the query."""
    q = query.lower().strip()
    hit = []
    for name, spec in SCENES.items():
        if theme and spec["theme"] != theme:
            continue
        hay = f"{name} {spec['theme']} {spec['description']} {spec['words']}".lower()
        if q in hay:
            hit.append(name)
    if hit:
        return sorted(hit, key=lambda n: (q not in n, n))
    import difflib
    return difflib.get_close_matches(q, list(SCENES), n=4, cutoff=0.5)


def by_scene_theme(theme):
    return [n for n, s in SCENES.items() if s["theme"] == theme]


def _mat(i, accent):
    """The material of element i: the accent when the slide points at it, grey otherwise."""
    return "accent" if accent is not None and i == accent else "mass"


# =========================================================== investment ====
@scene_def("headquarters", "An office block on a plaza. The accent marks the tower.",
           "investment", "office fund hq firm building city")
def _headquarters(S, accent=None):
    S.slab(-1, -1, 14, 11)
    S.box(0.5, 0.5, 0, 4, 4, 2.4, "pale")
    S.box(5.5, 1, 0, 4.5, 5, 7.5, _mat(0, accent))
    S.box(5.5, 1, 7.5, 4.5, 5, 0.4, "dark")
    S.box(1, 6, 0, 3.5, 3, 4, "pale")
    for i in range(3):
        S.line((5.5, 1 + 1.1 * i + 0.6, 1), (5.5, 1 + 1.1 * i + 0.6, 7))
    S.tree(11.3, 2.2, "dark", 2.1, 0.8)
    S.tree(11.3, 8, "mass", 1.8, 0.75)


@scene_def("boardroom", "A table and six seats. The accent marks the chair that decides.",
           "investment", "committee decision meeting governance vote")
def _boardroom(S, accent=None):
    S.slab(-1, -1, 13, 10)
    S.box(2, 2.5, 0, 7, 3, 0.9, "pale")
    for i in range(3):
        x = 2.4 + i * 2.4
        S.box(x, 1, 0, 1.2, 1, 1.6, _mat(i, accent))
        S.box(x, 6.5, 0, 1.2, 1, 1.6, _mat(i + 3, accent))
    S.box(10.5, 1, 0, 0.4, 7, 3.2, "dark")


@scene_def("portfolio", "A cluster of buildings of different heights. The accent marks the exit.",
           "investment", "companies positions book holdings city cluster")
def _portfolio(S, accent=None):
    S.slab(-1, -1, 14, 12)
    heights = [2.2, 4.5, 3.0, 6.8, 2.6, 3.8]
    k = 0
    for row in range(2):
        for col in range(3):
            x, y = 0.6 + col * 4.2, 0.6 + row * 5.2
            S.box(x, y, 0, 3, 3.4, heights[k], _mat(k, accent))
            k += 1


@scene_def("roadmap", "Four gates on a rising path to a marker. The accent marks the gate we are at.",
           "investment", "plan next steps milestones stages timeline journey gate")
def _roadmap(S, accent=None):
    S.slab(-1.5, -1, 17, 10)
    # the path climbs one step per gate, so progress reads from the ground and not only from the blocks
    for i in range(4):
        x, z = 0.5 + i * 3.4, i * 0.45
        S.box(x, 3.2, 0, 3.4, 2.2, 0.3 + z, "pale")
        S.box(x + 1.1, 3.6, 0.3 + z, 1.2, 1.4, 1.6, _mat(i, accent))
        S.line((x + 1.7, 4.3, 1.9 + z), (x + 1.7, 4.3, 2.6 + z))
    # the marker at the end of the path
    S.box(14.0, 3.5, 2.1, 0.26, 0.26, 3.2, "ink")
    S.poly([(14.26, 3.6, 5.3), (14.26, 3.6, 3.7), (14.26, 6.4, 4.1), (14.26, 6.4, 4.9)],
           "accent" if accent == 4 else "dark", RIGHT)


@scene_def("partnership", "Two blocks joined by a bridge. The accent marks our side.",
           "investment", "alliance joint venture co-investment bridge deal")
def _partnership(S, accent=None):
    S.slab(-1, -1, 15, 10)
    S.box(0.5, 2, 0, 3.5, 4, 5, _mat(0, accent))
    S.box(9, 2, 0, 3.5, 4, 4.2, _mat(1, accent))
    S.box(4, 3.2, 2.6, 5, 1.6, 0.4, "dark")


# =============================================================== climate ====
@scene_def("solar-farm", "Rows of tilted panels. The accent marks the funded array.",
           "climate", "pv photovoltaic array renewable energy sun")
def _solar(S, accent=None):
    S.slab(-1, -1, 16, 12)
    for r in range(3):
        y = 0.8 + r * 3.4
        for c in range(3):
            x = 0.8 + c * 4.6
            S.box(x + 0.3, y + 1.6, 0, 0.3, 0.3, 0.5, "dark")
            S.box(x + 3.1, y + 1.6, 0, 0.3, 0.3, 0.5, "dark")
            S.tilt(x, y, 0.5, 3.8, 2.2, 1.1, "accent" if accent == r else "cool")


@scene_def("wind-farm", "Three turbines on open ground. The accent marks the one in service.",
           "climate", "turbine offshore renewable power generation")
def _wind(S, accent=None):
    S.slab(-1, -1, 16, 12)
    for i, (x, y, h) in enumerate([(2.5, 7.5, 7), (7, 4.5, 8.5), (11.5, 1.5, 6)]):
        m = _mat(i, accent)
        S.cyl(x, y, 0, 0.32, h, m)
        ox, oy = project(x, y, 0)
        hub = oy - h
        for a in (-90, 30, 150):
            rad = math.radians(a)
            S.parts.append(
                f'<line x1="{ox:.2f}" y1="{hub:.2f}" '
                f'x2="{ox + 3.4 * math.cos(rad):.2f}" y2="{hub + 3.4 * math.sin(rad):.2f}" '
                f'stroke="{S.mat[m][2]}" stroke-width="2.4" stroke-linecap="round" '
                f'vector-effect="non-scaling-stroke"/>')
            S.points.append((ox + 3.4 * math.cos(rad), hub + 3.4 * math.sin(rad)))
        S.parts.append(f'<circle cx="{ox:.2f}" cy="{hub:.2f}" r="0.6" '
                       f'fill="{S.mat[m][0]}" stroke="{S.stroke}" stroke-width="1" '
                       f'vector-effect="non-scaling-stroke"/>')


@scene_def("battery-site", "A row of storage containers and a substation. The accent marks the new bank.",
           "climate", "storage grid bess containers energy charge")
def _battery(S, accent=None):
    S.slab(-1, -1, 15, 11)
    for i in range(4):
        y = 0.8 + i * 2.2
        S.box(1, y, 0, 7, 1.6, 1.8, _mat(i, accent))
        S.box(1.2, y + 0.1, 1.8, 6.6, 1.4, 0.1, "dark")
    S.box(10, 2, 0, 2.4, 2.4, 1.2, "pale")
    S.cyl(11.2, 7, 0, 0.9, 2.6, "dark")


@scene_def("vertical-farm", "A building of stacked growing trays. The accent marks the lit tier.",
           "climate", "indoor agriculture cea hydroponics crop tiers controlled")
def _vertical_farm(S, accent=None):
    S.slab(-1, -1, 12, 10)
    S.box(0.5, 0.5, 0, 8, 6, 0.4, "dark")
    for i in range(4):
        z = 0.4 + i * 1.5
        S.box(1, 1, z, 7, 5, 1.1, _mat(i, accent))
        S.box(1, 1, z + 1.1, 7, 5, 0.2, "pale")
    S.box(0.6, 0.6, 6.5, 7.8, 5.8, 0.3, "dark")


@scene_def("recycling-plant", "A hall, a hopper and an outfeed. The accent marks the recovery line.",
           "climate", "circular valorisation waste reuse byproduct recovery")
def _recycling(S, accent=None):
    S.slab(-1, -1, 15, 11)
    S.box(0.8, 1, 0, 6, 6, 3.4, "pale")
    S.roof(0.8, 1, 3.4, 6, 6, 1.4, "dark")
    S.box(8.5, 1.5, 0, 0.5, 0.5, 1.8, "dark")
    S.box(11, 1.5, 0, 0.5, 0.5, 1.8, "dark")
    S.box(8.2, 1.2, 1.8, 3.6, 1.2, 1.6, _mat(0, accent))
    S.box(8.5, 5, 0, 3, 2.4, 1, _mat(1, accent))


@scene_def("water-plant", "Circular treatment tanks. The accent marks the stage that was rebuilt.",
           "climate", "treatment wastewater reuse clarifier blue scarcity")
def _water(S, accent=None):
    S.slab(-1, -1, 15, 12)
    for i, (x, y, r) in enumerate([(3, 3, 2.4), (9, 2.5, 1.8), (3.5, 8.5, 1.8), (9.5, 8, 2.1)]):
        S.cyl(x, y, 0, r, 0.9, "cool" if accent != i else "accent")
    S.box(12.5, 4.5, 0, 1.6, 2.4, 2, "pale")


@scene_def("forest", "A stand of trees on sloped ground. The accent marks the protected block.",
           "climate", "carbon sink land use biodiversity reforestation nature")
def _forest(S, accent=None):
    S.slab(-1, -1, 15, 12)
    # drawn back to front, so a near tree overlaps the one behind it
    spots = [(1.5, 1.5), (4.5, 2.5), (7.5, 1), (10.5, 2.5), (2.5, 5.5), (6, 6), (9.5, 5.5),
             (12, 7), (1.5, 9), (5, 9.5), (8.5, 9)]
    for i, (x, y) in enumerate(spots):
        crown = "accent" if accent is not None and i == accent else ("mass" if i % 3 == 2 else "dark")
        S.tree(x, y, crown, 2.4 + (i % 4) * 0.35, 0.92 + (i % 3) * 0.1)


# =============================================================== biotech ====
@scene_def("laboratory", "Benches, a fume hood and an instrument. The accent marks the assay bench.",
           "biotech", "lab rnd research bench science experiment")
def _laboratory(S, accent=None):
    S.slab(-1, -1, 14, 11)
    S.box(0.5, 0.5, 0, 0.4, 8, 3.4, "pale")
    for i in range(2):
        y = 1.5 + i * 4
        S.box(2, y, 0, 6, 1.8, 0.9, _mat(i, accent))
        S.box(2, y, 0.9, 6, 1.8, 0.12, "dark")
    S.box(2.4, 1.9, 1.02, 1, 1, 1.1, "cool")
    S.cyl(5, 2.4, 1.02, 0.4, 0.9, "cool")
    S.box(9.5, 1, 0, 2.2, 2.2, 3.6, "pale")
    S.box(9.5, 1, 3.6, 2.2, 2.2, 0.3, "dark")


@scene_def("fermentation", "A row of bioreactors and a service deck. The accent marks the vessel at scale.",
           "biotech", "precision fermentation bioreactor vessel tank protein scale")
def _fermentation(S, accent=None):
    S.slab(-1, -1, 15, 11)
    S.box(0.5, 0.5, 0, 11, 8, 0.3, "dark")
    for i in range(3):
        x = 2 + i * 3.4
        S.cyl(x, 2.5, 0.3, 1.1, 4.2 + i * 0.6, _mat(i, accent))
        S.cyl(x, 2.5, 0.3, 1.1, 0.25, "dark")
    S.box(1, 6.5, 0.3, 9.5, 1.2, 0.2, "pale")
    S.box(1, 6.5, 0.5, 0.15, 1.2, 1, "dark")
    S.box(10.35, 6.5, 0.5, 0.15, 1.2, 1, "dark")
    S.cyl(12.5, 3, 0.3, 0.8, 2.4, "cool")


@scene_def("pilot-plant", "Tanks, a skid and piping at pilot scale. The accent marks the new line.",
           "biotech", "scale up trl pilot demonstration process line")
def _pilot(S, accent=None):
    S.slab(-1, -1, 14, 11)
    S.box(0.5, 0.5, 0, 10, 8, 0.3, "dark")
    S.cyl(2.5, 2, 0.3, 1.3, 3, _mat(0, accent))
    S.cyl(6, 2, 0.3, 1, 2.2, "mass")
    S.box(8.3, 1.2, 0.3, 2, 2, 1.6, _mat(1, accent))
    S.box(1, 5.5, 0.3, 9, 0.5, 0.35, "dark")
    S.box(1, 6.8, 0.3, 9, 0.5, 0.35, "dark")
    S.box(3.5, 5, 0.65, 1.4, 3, 1.2, "pale")


@scene_def("cleanroom", "A sealed module with an airlock. The accent marks the classified zone.",
           "biotech", "gmp sterile manufacturing classified module aseptic")
def _cleanroom(S, accent=None):
    S.slab(-1, -1, 14, 11)
    S.box(0.5, 0.5, 0, 8, 7, 0.3, "dark")
    S.box(1, 1, 0.3, 7, 6, 3.2, _mat(0, accent))
    S.box(1, 1, 3.5, 7, 6, 0.3, "dark")
    S.box(8, 2.5, 0.3, 2.2, 2.4, 2.4, "pale")
    S.box(8, 2.5, 2.7, 2.2, 2.4, 0.25, "dark")
    S.box(10.2, 3.2, 0.3, 0.2, 1, 1.9, "cool")


@scene_def("greenhouse", "A glass house with crop rows. The accent marks the trial block.",
           "biotech", "cea protected crop glass agriculture variety trial")
def _greenhouse(S, accent=None):
    S.slab(-1, -1, 15, 11)
    S.box(0.5, 0.5, 0, 11, 8, 0.25, "dark")
    for i in range(3):
        y = 1.2 + i * 2.4
        S.box(1.5, y, 0.25, 9, 1.4, 0.5, _mat(i, accent))
    # the house is an open frame, so the crop rows still read. No glass fill: the brand forbids it.
    S.frame(1, 0.8, 0.25, 10, 7.4, 2.2, ridge=1.5)


@scene_def("data-centre", "Rows of racks and a cooling unit. The accent marks the compute that is ours.",
           "biotech", "compute ai model cluster servers racks infrastructure")
def _data_centre(S, accent=None):
    S.slab(-1, -1, 14, 11)
    S.box(0.5, 0.5, 0, 10, 8, 0.3, "pale")
    for i in range(4):
        y = 1 + i * 1.8
        S.box(1.5, y, 0.3, 6.5, 1.1, 2.4, _mat(i, accent))
        S.box(1.5, y, 2.7, 6.5, 1.1, 0.15, "dark")
    S.box(9, 2, 0.3, 1.6, 4, 1.4, "dark")


CSS = """
/* ---- isometric scenes: context a chart cannot give ---- */
.av-scene{max-width:100%;height:auto;}
.scene-wrap{display:flex;align-items:center;justify-content:center;min-width:0;}
"""
