#!/usr/bin/env python3
# Sigil and Scribe - per-book page generator (2026-08-18)
# Emits one standalone HTML per book + the Muffin memorial page.
# Internal links use __SIB_<id>__ tokens (sibling pages) and __U_<id>__ (any page);
# a later pass swaps them for active paths.

import os, json

OUT = "/workspace/jw_ideas/pages"
os.makedirs(OUT, exist_ok=True)

R2 = "https://r2.dev"

COVER = {
    "muffin-wiggles": R2 + "1787087435477-1d3f821a-e7bb-4139-bdae-869c42aeaf81-cover_muffin1.jpg",
    "bingo-card-chronic-illness": R2 + "1787087435619-c582856d-e49c-47c0-bd5d-ac85bf7f7c5a-cover_bingo.jpg",
    "many-faces-of-grace": R2 + "1787087435685-8887a84f-e8f5-439d-8765-6b84db6deea9-cover_grace_front.jpg",
    "dont-quote-me": R2 + "1787087435396-fb377d71-b5b2-41ed-9bcf-735c964ddbfe-cover_dqm_front.jpg",
    "axolotl-dreams": R2 + "1787087435547-923ea4b2-3f45-46f8-83ec-238b60b32763-cover_axo.jpg",
    "ties-that-tear": R2 + "1787087592573-e01493e2-edab-4115-8dc9-b0fe2f8ee161-cover_ties_front.jpg",
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
         links=[], comingSoon=True)
]
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
         links=[("Get the Book", "https://books2read.com/u/475ep7")], comingSoon=False),
]

SECTIONS = {
    "children": ("Children's Books", "100s", "sc-children"),
    "wellness": ("Health & Wellness", "200s", "sc-wellness"),
    "more": ("More Books", "300s", "sc-more"),
    "fiction": ("Fiction", "400s", "sc-fiction"),
}

def variant(i, sec):
    v = i % 3
    if sec in ("children", "wellness"):
        return " sc-v2" if v == 1 else ""
    if sec == "more":
        return " sc-v2" if v == 1 else (" sc-v3" if v == 2 else "")
    return " sc-v2" if v == 1 else ""

CSS = """
:root {
  --paper:#FDFBF7; --mist:#F2F5F3; --ink:#2B2B2B; --amber:#D4A373; --amber-deep:#B8874F;
  --sage:#A3B19B; --sage-deep:#7E8F76; --walnut:#6B4A34; --walnut-dark:#4A3324; --walnut-deep:#38251A;
  --card:#F7EFDD; --ease:cubic-bezier(0.2,0.8,0.2,1);
}
* { box-sizing:border-box; margin:0; padding:0; }
body { background:radial-gradient(ellipse at 20% 0%, rgba(212,163,115,0.08), transparent 55%), var(--paper); color:var(--ink); font-family:'Inter',system-ui,sans-serif; min-height:100vh; }
a { color:inherit; text-decoration:none; }
::selection { background:var(--amber); color:var(--paper); }
.site-header { position:sticky; top:0; z-index:500; background:var(--walnut-deep); color:var(--paper); box-shadow:0 4px 14px rgba(31,22,17,0.35); }
.site-header .inner { max-width:1180px; margin:0 auto; padding:12px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.brand { font-family:'Playfair Display',Georgia,serif; font-weight:700; font-size:1.15rem; letter-spacing:0.01em; cursor:pointer; }
.brand span { color:var(--amber); }
.bp-crumb { font-family:'Courier Prime',monospace; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:var(--sage-deep); }
.page { max-width:1080px; margin:0 auto; padding:34px 24px 70px; }
.bp-grid { display:grid; grid-template-columns:minmax(220px,300px) 1fr; gap:40px; align-items:start; }
@media (max-width:700px){ .bp-grid { grid-template-columns:1fr; gap:22px; } }
.bp-cover { position:relative; }
.bp-cover img { width:100%; height:auto; border-radius:4px; box-shadow:0 30px 50px -22px rgba(56,37,26,0.55); display:block; }
.bp-badge { position:absolute; top:12px; right:-10px; background:var(--amber); color:var(--walnut-deep); font-family:'Courier Prime',monospace; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; padding:5px 10px; border-radius:3px; box-shadow:0 4px 10px rgba(0,0,0,0.25); transform:rotate(2deg); }
.bp-badge.sage { background:var(--sage); color:var(--paper); }
.bp-info { padding-top:6px; }
.bp-call { font-family:'Courier Prime',monospace; font-size:12px; letter-spacing:0.05em; color:var(--amber-deep); display:inline-block; margin-right:12px; font-weight:700; }
.bp-author { font-family:'Courier Prime',monospace; font-size:12px; letter-spacing:0.02em; color:var(--sage-deep); text-transform:uppercase; }
.bp-title { font-family:'Playfair Display',Georgia,serif; font-size:2.1rem; font-weight:700; color:var(--walnut-dark); margin:8px 0 14px; line-height:1.2; }
@media (max-width:500px){ .bp-title { font-size:1.65rem; } }
.bp-tagline { font-family:'Inter',sans-serif; font-size:14px; font-weight:600; color:var(--walnut); margin-bottom:20px; line-height:1.5; font-style:italic; }
.bp-desc { font-size:14.5px; line-height:1.65; color:rgba(43,43,43,0.92); max-width:680px; }
.bp-desc p { margin-bottom:14px; }
.bp-actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:28px; padding-bottom:34px; border-bottom:1px solid rgba(110,74,52,0.12); }
.sc-btn { display:inline-flex; align-items:center; justify-content:center; font-family:'Courier Prime',monospace; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:10px 18px; border-radius:4px; border:none; transition:all 0.2s var(--ease); cursor:pointer; min-height:36px; text-align:center; }
.sc-btn-primary { background:var(--walnut); color:var(--paper); box-shadow:0 4px 10px rgba(107,74,52,0.2); }
.sc-btn-primary:hover { background:var(--walnut-dark); transform:translateY(-1px); box-shadow:0 6px 14px rgba(107,74,52,0.3); }
.bp-shelf-wrap { margin-top:44px; }
.bp-shelf-label { font-family:'Courier Prime',monospace; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--walnut); opacity:0.5; margin-bottom:12px; }
.sc-section-label { display:flex; align-items:baseline; gap:10px; margin-bottom:10px; }
.sc-section-label h2 { font-family:'Playfair Display',serif; font-size:1.15rem; font-weight:700; color:var(--walnut); }
.sc-section-label span { font-family:'Courier Prime',monospace; font-size:10px; color:var(--sage-deep); font-weight:700; }
.sc-shelf { position:relative; background:rgba(163,177,155,0.07); border:1px solid rgba(110,74,52,0.08); border-radius:4px; padding:24px 20px 10px; display:flex; gap:10px; flex-wrap:wrap; min-height:140px; align-items:end; margin-bottom:34px; box-shadow:inset 0 4px 20px rgba(56,37,26,0.03); }
.sc-shelf-board { position:absolute; bottom:0; left:0; right:0; height:10px; background:linear-gradient(90deg, var(--walnut-dark), var(--walnut), var(--walnut-dark)); border-radius:0 0 3px 3px; box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:10; }
.sc-book-wrapper { position:relative; margin-bottom:8px; display:inline-block; transition:transform 0.25s var(--ease); }
.sc-book-wrapper.sliding-out { animation:scSpineOut 0.5s var(--ease) forwards; pointer-events:none; }
@keyframes scSpineOut { 0% { transform:translateY(0) scale(1); opacity:1; } 40% { transform:translateY(-18px) scale(0.98); opacity:0.7; } 100% { transform:translateY(40px) scale(0.9); opacity:0; } }
.sc-spine { display:flex; flex-direction:column; justify-content:space-between; align-items:center; height:106px; border:none; padding:10px 5px; color:var(--paper); font-family:'Playfair Display',serif; font-weight:600; text-align:center; border-radius:3px 3px 0 0; box-shadow:inset 1px 0 0 rgba(253,251,247,0.2), inset -2px 0 5px rgba(0,0,0,0.22), 2px 2px 6px rgba(0,0,0,0.15); transition:all 0.2s var(--ease); cursor:pointer; position:relative; z-index:5; text-shadow:0 1px 2px rgba(0,0,0,0.2); }
.sc-spine:hover, .sc-spine:focus-visible { transform:translateY(-6px) scale(1.02); box-shadow:inset 1px 0 0 rgba(253,251,247,0.25), inset -2px 0 5px rgba(0,0,0,0.18), 4px 8px 16px rgba(56,37,26,0.3); outline:none; z-index:20; }
.sc-spine .sc-stitle { font-size:10px; line-height:1.15; letter-spacing:0.01em; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; width:100%; word-break:break-word; padding:0 2px; }
.sc-spine .sc-sauthor { font-family:'Inter',sans-serif; font-size:7.5px; text-transform:uppercase; letter-spacing:0.05em; font-weight:500; opacity:0.75; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; margin-top:auto; }
.sc-spine .sc-call { font-family:'Courier Prime',monospace; font-size:8.5px; letter-spacing:0.04em; writing-mode:vertical-rl; transform:rotate(180deg); opacity:0.85; margin-top:5px; white-space:nowrap; }
.sc-spine.sc-children { width:42px; background:linear-gradient(180deg,#E0AE79,#C98F56); }
.sc-spine.sc-children.sc-v2 { background:linear-gradient(180deg,#EABF90,#D19E64); }
.sc-spine.sc-wellness { width:42px; background:linear-gradient(180deg,#A3B19B,#8CA187); }
.sc-spine.sc-wellness.sc-v2 { background:linear-gradient(180deg,#B3C0AB,#94A28C); }
.sc-spine.sc-more { width:40px; background:linear-gradient(180deg,#8C6142,#6B4A34); }
.sc-spine.sc-more.sc-v2 { background:linear-gradient(180deg,#9C7B54,#7A5A3A); }
.sc-spine.sc-more.sc-v3 { background:linear-gradient(180deg,#7E5A3F,#5B3F2A); }
.sc-spine.sc-fiction { width:40px; background:linear-gradient(180deg,#8A4A55,#6B3540); }
.sc-spine.sc-fiction.sc-v2 { background:linear-gradient(180deg,#9A5A65,#7A4550); }
.sc-spine.sc-coming { opacity:0.85; }
.sc-spine.sc-current { box-shadow:inset 0 0 0 2px rgba(253,251,247,0.55), inset -3px 0 6px rgba(0,0,0,0.15); cursor:default; }
.sc-spine.sc-current:hover { transform:none; box-shadow:inset 0 0 0 2px rgba(253,251,247,0.55), inset -3px 0 6px rgba(0,0,0,0.15); }
.site-footer { text-align:center; padding:34px 20px 40px; font-family:'Courier Prime',monospace; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--sage-deep); }
"""

PAGE_HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>__TITLE__ | Sigil and Scribe Library</title>
<meta name="description" content="__DESC__">
<link rel="preconnect" href="https://googleapis.com">
<link rel="preconnect" href="https://gstatic.com" crossorigin>
<link href="https://googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
__CSS__
</style>
</head>
<body>
<header class="site-header">
  <div class="inner">
