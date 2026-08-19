#!/usr/bin/env python3
# Sigil and Scribe - per-book page generator (2026-08-18)
# Emits one standalone HTML per book + the Muffin memorial page.
# Internal links use __SIB_<id>__ tokens (sibling pages) and __U_<id>__ (any page);
# a later pass swaps them for active paths.

import os, json

OUT = "/workspace/jw_ideas/pages"
os.makedirs(OUT, exist_ok=True)

COVER = {
    "muffin-wiggles": "images/children/book1-cover-v2.png",
    "bingo-card-chronic-illness": "images/health-wellness/bingo-cover-v2.jpg",
    "many-faces-of-grace": "images/health-wellness/grace-cover-v2.png",
    "dont-quote-me": "images/more-books/dqm-cover-v2.jpg",
    "axolotl-dreams": "images/more-books/axo-cover-v1.jpg",
    "ties-that-tear": "images/fiction/ttt1.1-working-cover1.png",
}

BOOKS = [
    dict(id="muffin-wiggles", call="100.1", title="Muffin Gets the Wiggles", author="J. White", section="children",
         tagline="Book 1 of the Muffin the Pitbull Puppy series.",
         description="A 26-book series helping kids understand and cope with chronic illness, inspired by a real dog who had seizures and taught her family what courage looks like. Five percent of net series royalties are donated quarterly to St. Jude Children's Research Hospital in her name.",
         links=[("Kindle", "https://www.amazon.com/dp/B0HDYB7624"), ("Paperback", "https://www.amazon.com/dp/B0HF43T8BV")], comingSoon=False),
         
    dict(id="bingo-card-chronic-illness", call="200.1", title="The Bingo Card of Chronic Illness", author="J. White", section="wellness",
         tagline="A dark humor validation sheet for the weary.",
         description="An interactive workbook for those tracking difficult symptoms, medical gaslighting, and recovery milestones. Designed as a soft place to land when standard self-care frameworks fall short.",
         links=[("Kindle", "https://amazon.com")], comingSoon=False),
         
    dict(id="many-faces-of-grace", call="200.2", title="The Many Faces of Grace", author="J. White", section="wellness",
         tagline="Meditations on chronic existence.",
         description="A companion compilation focusing on internal landscape shifts when moving from health into ongoing patient management strategies.",
         links=[("Paperback", "https://amazon.com")], comingSoon=False),
         
    dict(id="dont-quote-me", call="300.1", title="Don't Quote Me: Smart Mouths", author="J. White", section="more",
         tagline="Conversational essays regarding creative boundaries.",
         description="A series of sharp architectural breakdowns looking at structural problems encountered during long production tasks and collaborative independent cycles.",
         links=[("Get the Book", "https://books2read.com")], comingSoon=False),
         
    dict(id="axolotl-dreams", call="300.2", title="Axolotl Dreams", author="J. White", section="more",
         tagline="A coloring book, gently strange and calming.",
         description="A coloring journey built around the odd little charm of axolotls. A quiet, low-stakes creative outlet.",
         links=[("Paperback", "https://www.amazon.com/dp/B0FPDM6SG5")], comingSoon=False),
         
    dict(id="ties-that-tear", call="400.1", title="The Ties That Tear", author="J. White", section="fiction",
         tagline="Book 1 of the Ties That Tear series.",
         description="The opening thread of the Trinity Tension Saga: a modern journey tangled in a Tudor dynasty trap, with Anna Boleyn at the heart of it. In production: this cover is a working draft.",
         links=[], comingSoon=True),

    dict(id="untying-the-knot", call="400.2", title="Untying the Knot", author="J. White", section="fiction",
         tagline="Book 1 of the Untying the Knot series.",
         description="The second thread of the Trinity Tension Saga. Coming soon.",
         links=[], comingSoon=True),
         
    dict(id="walking-a-tightrope", call="400.3", title="Walking a Tightrope", author="J. White", section="fiction",
         tagline="Book 1 of the Walking a Tightrope series.",
         description="The third thread of the Trinity Tension Saga. Coming soon.",
         links=[], comingSoon=True),
         
    dict(id="syncretic-ritualist-almanac", call="300.3", title="Syncretic Ritualist Almanac", author="Petra C.Ht.", section="more",
         tagline="A working almanac for ritual and practice.",
         description="An almanac blending ritual traditions into a practical, syncretic guide, for readers building their own practice rather than following one script.",
         links=[("Get the Book", "https://books2read.com/u/475ep7")], comingSoon=False)
]
