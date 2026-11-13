#!/usr/bin/env python3
"""Generate the per-address copies of index.html that GitHub Pages serves.

GitHub Pages only serves files that exist, so /learn and /library each need their own
HTML file. They're identical to index.html apart from the title and description; the app
reads the address and shows the right section. 404.html lets any unknown address
(e.g. a trailing slash) still load the app.

Run after editing index.html:  python3 scripts/build-pages.py
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "index.html").read_text()

PAGES = {
    "learn.html": ("Learn: How Jazz Chords Work · Changes",
                   "An illustrated guide to every jazz chord family: what it is, how it sounds, how it's written."),
    "library.html": ("Chord Library · Changes",
                     "Every jazz chord type in every key, with notation, keyboard, audio, inversions and scales."),
    "404.html": ("Changes — Jazz Chord Flashcards", None),
}

VIEW = {"learn.html": "learn", "library.html": "library"}

def start_on(html, view):
    """Make the page show `view` from the first paint, so reloading /learn doesn't flash Practice."""
    html = html.replace('<body data-view="practice">', f'<body data-view="{view}">', 1)
    html = html.replace('<section class="view" id="view-practice">', '<section class="view" id="view-practice" hidden>', 1)
    html = html.replace(f'<section class="view" id="view-{view}" hidden>', f'<section class="view" id="view-{view}">', 1)
    html = html.replace('<a class="tab active" href="/" data-view="practice">', '<a class="tab" href="/" data-view="practice">', 1)
    href = "/" + view
    html = html.replace(f'<a class="tab" href="{href}" data-view="{view}">', f'<a class="tab active" href="{href}" data-view="{view}">', 1)
    return html

def page(title, desc, name=None):
    html = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", SRC, count=1)
    if name in VIEW:
        html = start_on(html, VIEW[name])
    if desc:
        html = re.sub(r'<meta name="description" content="[^"]*" />', f'<meta name="description" content="{desc}" />', html, count=1)
    note = "<!-- Generated from index.html by scripts/build-pages.py. Edit index.html, then re-run the script. -->\n"
    return html.replace("<!doctype html>\n", "<!doctype html>\n" + note, 1)

for name, (title, desc) in PAGES.items():
    (ROOT / name).write_text(page(title, desc, name))
    print("wrote", name)
