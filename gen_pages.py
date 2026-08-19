#!/usr/bin/env python3
"""Generate standalone book pages for the Sigil and Scribe library."""

from __future__ import annotations

import os
import shutil
from html import escape
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
DEFAULT_OUTPUT_DIR = REPO_ROOT / "pages"
OUTPUT_DIR = Path(
    os.environ.get("JW_AUTHOR_SITE_OUTPUT_DIR", str(DEFAULT_OUTPUT_DIR))
).expanduser()
STYLESHEET_SOURCE = REPO_ROOT / "book-pages.css"
STYLESHEET_NAME = STYLESHEET_SOURCE.name
LIBRARY_INDEX = "../sigil_study.html"
R2 = "https://r2.dev/"

COVER = {
    "muffin-wiggles": f"{R2}1787087435477-1d3f821a-e7bb-4139-bdae-869c42aeaf81-cover_muffin1.jpg",
    "bingo-card-chronic-illness": f"{R2}1787087435619-c582856d-e49c-47c0-bd5d-ac85bf7f7c5a-cover_bingo.jpg",
    "many-faces-of-grace": f"{R2}1787087435685-8887a84f-e8f5-439d-8765-6b84db6deea9-cover_grace_front.jpg",
    "dont-quote-me": f"{R2}1787087435396-fb377d71-b5b2-41ed-9bcf-735c964ddbfe-cover_dqm_front.jpg",
    "axolotl-dreams": f"{R2}1787087435547-923ea4b2-3f45-46f8-83ec-238b60b32763-cover_axo.jpg",
    "ties-that-tear": f"{R2}1787087592573-e01493e2-edab-4115-8dc9-b0fe2f8ee161-cover_ties_front.jpg",
}

BOOKS = [
    {
        "id": "muffin-wiggles",
        "call": "100.1",
        "title": "Muffin Gets the Wiggles",
        "author": "J. White",
        "section": "children",
        "tagline": "Book 1 of the Muffin the Pitbull Puppy series.",
        "description": (
            "A 26-book series helping kids understand and cope with chronic illness, "
            "inspired by a real dog who had seizures and taught her family what courage "
            "looks like. Five percent of net series royalties are donated quarterly to "
            "St. Jude Children's Research Hospital in her name."
        ),
        "links": [
            ("Kindle", "https://www.amazon.com/dp/B0HDYB7624"),
            ("Paperback", "https://www.amazon.com/dp/B0HF43T8BV"),
        ],
        "comingSoon": False,
    },
    {
        "id": "bingo-card-chronic-illness",
        "call": "200.1",
        "title": "The Bingo Card of Chronic Illness",
        "author": "J. White",
        "section": "wellness",
        "tagline": "A dark humor validation sheet for the weary.",
        "description": (
            "An interactive workbook for those tracking difficult symptoms, medical "
            "gaslighting, and recovery milestones. Designed as a soft place to land "
            "when standard self-care frameworks fall short."
        ),
        "links": [("Kindle", "https://amazon.com")],
        "comingSoon": False,
    },
    {
        "id": "many-faces-of-grace",
        "call": "200.2",
        "title": "The Many Faces of Grace",
        "author": "J. White",
        "section": "wellness",
        "tagline": "Meditations on chronic existence.",
        "description": (
            "A companion compilation focusing on internal landscape shifts when moving "
            "from health into ongoing patient management strategies."
        ),
        "links": [("Paperback", "https://amazon.com")],
        "comingSoon": False,
    },
    {
        "id": "dont-quote-me",
        "call": "300.1",
        "title": "Don't Quote Me: Smart Mouths",
        "author": "J. White",
        "section": "more",
        "tagline": "Conversational essays regarding creative boundaries.",
        "description": (
            "A series of sharp architectural breakdowns looking at structural problems "
            "encountered during long production tasks and collaborative independent cycles."
        ),
        "links": [("Get the Book", "https://books2read.com")],
        "comingSoon": False,
    },
    {
        "id": "axolotl-dreams",
        "call": "300.2",
        "title": "Axolotl Dreams",
        "author": "J. White",
        "section": "more",
        "tagline": "A coloring book, gently strange and calming.",
        "description": (
            "A coloring journey built around the odd little charm of axolotls. "
            "A quiet, low-stakes creative outlet."
        ),
        "links": [("Paperback", "https://www.amazon.com/dp/B0FPDM6SG5")],
        "comingSoon": False,
    },
    {
        "id": "ties-that-tear",
        "call": "400.1",
        "title": "The Ties That Tear",
        "author": "J. White",
        "section": "fiction",
        "tagline": "Book 1 of the Ties That Tear series.",
        "description": (
            "The opening thread of the Trinity Tension Saga: a modern journey tangled "
            "in a Tudor dynasty trap, with Anna Boleyn at the heart of it. In production: "
            "this cover is a working draft."
        ),
        "links": [],
        "comingSoon": True,
    },
    {
        "id": "untying-the-knot",
        "call": "400.2",
        "title": "Untying the Knot",
        "author": "J. White",
        "section": "fiction",
        "tagline": "Book 2 of the Trinity Tension Saga.",
        "description": "The second thread of the Trinity Tension Saga. Coming soon.",
        "links": [],
        "comingSoon": True,
    },
    {
        "id": "walking-a-tightrope",
        "call": "400.3",
        "title": "Walking a Tightrope",
        "author": "J. White",
        "section": "fiction",
        "tagline": "Book 3 of the Trinity Tension Saga.",
        "description": "The third thread of the Trinity Tension Saga. Coming soon.",
        "links": [],
        "comingSoon": True,
    },
    {
        "id": "syncretic-ritualist-almanac",
        "call": "300.3",
        "title": "Syncretic Ritualist Almanac",
        "author": "Petra C.Ht.",
        "section": "more",
        "tagline": "A working almanac for ritual and practice.",
        "description": (
            "An almanac blending ritual traditions into a practical, syncretic guide, "
            "for readers building their own practice rather than following one script."
        ),
        "links": [("Get the Book", "https://books2read.com/u/475ep7")],
        "comingSoon": False,
    },
]

SECTIONS = {
    "children": ("Children's Books", "100s", "sc-children"),
    "wellness": ("Health & Wellness", "200s", "sc-wellness"),
    "more": ("More Books", "300s", "sc-more"),
    "fiction": ("Fiction", "400s", "sc-fiction"),
}

SECTION_VARIANTS = {
    "children": {1: " sc-v2"},
    "wellness": {1: " sc-v2"},
    "more": {1: " sc-v2", 2: " sc-v3"},
    "fiction": {1: " sc-v2"},
}

MEMORIAL = {
    "title": "Muffin Memorial",
    "tagline": "Forever the heart behind the stories.",
    "description": (
        "Muffin inspired the series, the study, and the steady courage at the center "
        "of this project. This small memorial page keeps her close to the library she "
        "helped shape."
    ),
    "image": "muffin01.jpg",
}
MEMORIAL_IMAGE_SOURCE = REPO_ROOT / "images" / "muffin" / MEMORIAL["image"]

PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | Sigil and Scribe Library</title>
  <meta name="description" content="{description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&amp;family=Inter:wght@400;500;600&amp;family=Courier+Prime:ital,wght@0,400;0,700;1,400&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{stylesheet_href}">
</head>
<body>
  <header class="site-header">
    <div class="inner">
      <a class="brand" href="{library_href}">Sigil <span>&amp;</span> Scribe</a>
      <p class="bp-crumb">{crumb}</p>
    </div>
  </header>
  <main class="page">
    {body}
  </main>
  <footer class="site-footer">
    <p>&copy; 2026 Sigil and Scribe, LLC &middot; J. White</p>
  </footer>
</body>
</html>
"""


def variant(index: int, section: str) -> str:
    """Return the alternating shelf class for a book spine."""
    return SECTION_VARIANTS.get(section, {}).get(index % 3, "")


def page_name(book_id: str) -> str:
    """Return the output filename for a book page."""
    return f"{book_id}.html"


def book_lookup() -> dict[str, dict]:
    """Return books keyed by id for quick lookups."""
    return {book["id"]: book for book in BOOKS}


def render_actions(book: dict) -> str:
    """Render book CTA buttons."""
    if book["links"]:
        return "".join(
            f'<a class="sc-btn sc-btn-primary" href="{escape(url, quote=True)}">{escape(label)}</a>'
            for label, url in book["links"]
        )
    if book["comingSoon"]:
        return '<span class="sc-btn sc-btn-primary sc-btn-disabled">Coming Soon</span>'
    return ""


def render_cover(book: dict) -> str:
    """Render the cover image or a simple placeholder when no image exists."""
    cover = COVER.get(book["id"])
    badge = '<span class="bp-badge sage">Coming Soon</span>' if book["comingSoon"] else ""
    if cover:
        return (
            '<div class="bp-cover">'
            f'<img src="{escape(cover, quote=True)}" alt="Cover for {escape(book["title"], quote=True)}">'
            f"{badge}</div>"
        )
    return (
        '<div class="bp-cover">'
        '<div class="bp-cover-placeholder">Cover in progress</div>'
        f"{badge}</div>"
    )


def render_shelf(current_book_id: str | None = None) -> str:
    """Render the bookshelf navigation shared by every page."""
    parts = ['<section class="bp-shelf-wrap">', '<p class="bp-shelf-label">Browse the library</p>']
    for section, (label, call_range, spine_class) in SECTIONS.items():
        section_books = [book for book in BOOKS if book["section"] == section]
        parts.extend(
            [
                '<section class="bp-section">',
                '<div class="sc-section-label">',
                f"<h2>{escape(label)}</h2>",
                f"<span>{escape(call_range)}</span>",
                "</div>",
                '<div class="sc-shelf">',
                '<div class="sc-shelf-board"></div>',
            ]
        )
        for index, book in enumerate(section_books):
            classes = f"sc-spine {spine_class}{variant(index, section)}"
            if book["comingSoon"]:
                classes += " sc-coming"
            title = escape(book["title"])
            author = escape(book["author"])
            call = escape(book["call"])
            if book["id"] == current_book_id:
                classes += " sc-current"
                item = (
                    '<span class="sc-book-wrapper">'
                    f'<span class="{classes}">'
                    f'<span class="sc-stitle">{title}</span>'
                    f'<span class="sc-sauthor">{author}</span>'
                    f'<span class="sc-call">{call}</span>'
                    "</span></span>"
                )
            else:
                item = (
                    '<a class="sc-book-wrapper" '
                    f'href="{escape(page_name(book["id"]), quote=True)}">'
                    f'<span class="{classes}">'
                    f'<span class="sc-stitle">{title}</span>'
                    f'<span class="sc-sauthor">{author}</span>'
                    f'<span class="sc-call">{call}</span>'
                    "</span></a>"
                )
            parts.append(item)
        parts.extend(["</div>", "</section>"])
    parts.append("</section>")
    return "".join(parts)


def render_book_page(book: dict) -> str:
    """Build a standalone book page."""
    section_label = SECTIONS[book["section"]][0]
    body = f"""
    <section class="bp-grid">
      {render_cover(book)}
      <div class="bp-info">
        <a class="sc-btn sc-btn-secondary" href="{LIBRARY_INDEX}#book={escape(book["id"], quote=True)}">Back to the Library</a>
        <div class="bp-meta">
          <span class="bp-call">{escape(book["call"])}</span>
          <span class="bp-author">{escape(book["author"])}</span>
        </div>
        <h1 class="bp-title">{escape(book["title"])}</h1>
        <p class="bp-tagline">{escape(book["tagline"])}</p>
        <div class="bp-desc"><p>{escape(book["description"])}</p></div>
        <div class="bp-actions">{render_actions(book)}</div>
      </div>
    </section>
    {render_shelf(book["id"])}
    """
    return PAGE_TEMPLATE.format(
        title=escape(book["title"], quote=True),
        description=escape(book["description"], quote=True),
        stylesheet_href=escape(STYLESHEET_NAME, quote=True),
        library_href=LIBRARY_INDEX,
        crumb=escape(f"{section_label} / {book['call']}"),
        body=body,
    )


def render_memorial_page() -> str:
    """Build the standalone memorial page."""
    body = f"""
    <section class="bp-grid">
      <div class="bp-cover">
        <img src="{escape(MEMORIAL["image"], quote=True)}" alt="Portrait of Muffin">
        <span class="bp-badge">Memorial</span>
      </div>
      <div class="bp-info">
        <a class="sc-btn sc-btn-secondary" href="{LIBRARY_INDEX}#book=muffin-wiggles">Back to the Library</a>
        <div class="bp-meta">
          <span class="bp-call">memorial</span>
          <span class="bp-author">Sigil and Scribe</span>
        </div>
        <h1 class="bp-title">{escape(MEMORIAL["title"])}</h1>
        <p class="bp-tagline">{escape(MEMORIAL["tagline"])}</p>
        <div class="bp-desc"><p>{escape(MEMORIAL["description"])}</p></div>
        <div class="bp-actions">
          <a class="sc-btn sc-btn-primary" href="muffin-wiggles.html">Read Muffin Gets the Wiggles</a>
        </div>
      </div>
    </section>
    {render_shelf()}
    """
    return PAGE_TEMPLATE.format(
        title=escape(MEMORIAL["title"], quote=True),
        description=escape(MEMORIAL["description"], quote=True),
        stylesheet_href=escape(STYLESHEET_NAME, quote=True),
        library_href=LIBRARY_INDEX,
        crumb="Muffin Memorial",
        body=body,
    )


def ensure_output_assets() -> None:
    """Create the output directory and copy shared assets into it."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(STYLESHEET_SOURCE, OUTPUT_DIR / STYLESHEET_NAME)
    shutil.copyfile(MEMORIAL_IMAGE_SOURCE, OUTPUT_DIR / MEMORIAL["image"])


def write_page(filename: str, content: str) -> None:
    """Write one generated page to disk."""
    (OUTPUT_DIR / filename).write_text(content, encoding="utf-8")


def main() -> None:
    """Generate the shared stylesheet, each book page, and the memorial page."""
    ensure_output_assets()
    for book in BOOKS:
        write_page(page_name(book["id"]), render_book_page(book))
    write_page("muffin-memorial.html", render_memorial_page())


if __name__ == "__main__":
    main()
