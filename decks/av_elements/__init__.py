"""av_elements: everything that goes in the body region of an Accelera slide.

    import av_elements as X

base.py places and fills: the six grids, row(), column(), stack(), body() and body_height().
icons.py draws the icons: icon(), find_icon(), check_icons(), icon_label(), icon_box().
scenes.py draws the isometric scenes: scene(), find_scene(), scene_height().
"""
from .scenes import (  # noqa: F401
    MATERIALS,
    SCENES,
    SCENE_THEMES,
    Scene,
    by_scene_theme,
    find_scene,
    scene,
    scene_height,
)
from .scenes import CSS as SCENE_CSS  # noqa: F401
from .icons import (  # noqa: F401
    ALIASES,
    ICONS,
    THEMES,
    by_theme,
    check_icons,
    find_icon,
    icon,
    icon_box,
    icon_label,
    resolve,
)
from .icons import CSS as ICON_CSS  # noqa: F401
from .base import (  # noqa: F401
    BASELINE,
    BASELINE_HALF,
    BODY_H,
    BODY_W,
    COLS,
    COL_GUTTER,
    COL_W,
    CSS,
    E,
    FIELD_GUTTER,
    FIELD_H,
    GRIDS,
    block_label,
    body,
    body_height,
    column,
    md,
    row,
    span_px,
    stack,
)

#: Every stylesheet the body region needs. Pass it to av_deck.document(css_extra=...).
CSS_ALL = CSS + ICON_CSS + SCENE_CSS

__all__ = [
    "ALIASES", "BASELINE", "BASELINE_HALF", "BODY_H", "BODY_W", "COLS", "COL_GUTTER", "COL_W", "CSS",
    "CSS_ALL", "E", "FIELD_GUTTER", "FIELD_H", "GRIDS", "ICONS", "ICON_CSS", "MATERIALS", "SCENES",
    "SCENE_CSS", "SCENE_THEMES", "Scene", "THEMES", "block_label", "body", "body_height",
    "by_scene_theme", "by_theme", "check_icons", "column", "find_icon", "find_scene", "icon",
    "icon_box", "icon_label", "md", "resolve", "row", "scene", "scene_height", "span_px", "stack",
]
