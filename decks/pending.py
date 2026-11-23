#!/usr/bin/env python3
"""pending: lists every datum that is still missing in a built deck.

Write `==the datum I do not have yet==` in any string of a slide. It comes out marked on the page, and
this command lists every one, so a draft cannot be delivered by accident.

    python3 decks/pending.py deck.html [deck2.html ...]

Exit code 0 when nothing is pending, 1 when something is. Use it as the last gate before delivery.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import av_deck as D  # noqa: E402


def main(paths):
    if not paths:
        print(__doc__.strip())
        return 2
    total = 0
    for p in paths:
        path = pathlib.Path(p)
        if not path.exists():
            print(f"{p}: no such file")
            return 2
        items = D.list_pending(path.read_text(encoding="utf-8"))
        total += len(items)
        if not items:
            print(f"{path.name}: nothing pending")
            continue
        print(f"{path.name}: {len(items)} pending")
        for n, key, text in items:
            where = f"slide {n}" + (f" ({key})" if key else "")
            print(f"  {where:18s} {text}")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
