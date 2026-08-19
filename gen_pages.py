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

h:640px; }
.bp-actions { display:flex; gap:12px; margin-top:28px; flex-wrap:wrap; }
.sc-btn { display:inline-flex; align-items:center; justify-content:center; font-family:'Courier Prime',monospace; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; padding:10px 20px; border-radius:4px; border:none; cursor:pointer; transition:all 0.2s ease; min-height:38px; text-align:center; }
.sc-btn-primary { background:var(--walnut); color:var(--paper); box-shadow:0 4px 10px rgba(107,74,52,0.15); }
.sc-btn-primary:hover { background:var(--walnut-dark); transform:translateY(-1px); box-shadow:0 6px 12px rgba(107,74,52,0.25); }
.sc-btn-secondary { background:transparent; color:var(--walnut); border:1px solid rgba(107,74,52,0.25); }
.sc-btn-secondary:hover { background:rgba(107,74,52,0.04); color:var(--walnut-dark); border-color:var(--walnut-dark); }
.sc-spine-nav { margin-top:50px; border-top:1px solid rgba(163,177,155,0.2); padding-top:30px; }
.sc-spine-title { font-family:'Playfair Display',Georgia,serif; font-size:16px; color:var(--walnut-dark); margin-bottom:14px; }
.sc-spines { display:flex; gap:10px; overflow-x:auto; padding-bottom:12px; }
.sc-spine { padding:12px 8px; background:var(--card); border:1px solid rgba(107,74,52,0.15); border-radius:3px; font-family:'Courier Prime',monospace; font-size:11px; writing-mode:vertical-rl; text-orientation:mixed; transform:rotate(180deg); min-height:140px; text-align:right; cursor:pointer; transition:transform 0.2s; }
.sc-spine:hover { transform:rotate(180deg) translateY(4px); background:var(--paper); }
</style>
</head>
<body>

<header class="site-header">
  <div class="inner">
    <a href="../index.html" class="brand" id="back-link"><span>&larr;</span> Return to Library</a>
    <span class="bp-crumb">Shelf &middot; __SECTION_LABEL__</span>
  </div>
</header>

<div class="page">
  <div class="bp-grid">
    <div class="bp-cover">
      <img src="../__COVER_PATH__" alt="Book Cover for __TITLE__" onerror="this.src='../images/children/book1-cover-v2.png'">
      __BADGE__
    </div>
    <div class="bp-info">
      <div>
        <span class="bp-call">__CALL__</span>
        <span class="bp-author">by __AUTHOR__</span>
      </div>
      <h1 class="bp-title">__TITLE__</h1>
      <p class="bp-tagline">__TAGLINE__</p>
      <div class="bp-desc">__DESC__</div>
      <div class="bp-actions">__ACTIONS__</div>
    </div>
  </div>

  <div class="sc-spine-nav">
    <p class="sc-spine-title">Other Books on this Shelf:</p>
    <div class="sc-spines">__SIBLINGS__</div>
  </div>
</div>

<script>
document.getElementById("back-link").addEventListener("click", function (e) {
  if (history.length > 1) { e.preventDefault(); history.back(); }
});
</script>
</body>
</html>
"""

# HTML Template generation engine loop
for i, b in enumerate(BOOKS):
    sec_meta = SECTIONS[b["section"]]
    badge = f'<div class="bp-badge">In Production</div>' if b.get("comingSoon") else ""
    
    # Generate actionable purchase links
    actions_html = ""
    for label, url in b["links"]:
        actions_html += f'<a href="{url}" target="_blank" rel="noopener" class="sc-btn sc-btn-primary">{label}</a> '
    if not actions_html:
        actions_html = '<button class="sc-btn sc-btn-secondary" disabled>Drafting Phase</button>'

    # Extract shelf siblings for relative linking
    siblings_html = ""
    for sib in BOOKS:
        if sib["section"] == b["section"] and sib["id"] != b["id"]:
            siblings_html += f'<a href="__SIB_{sib["id"]}__" class="sc-spine">{sib["title"]}</a>'
    if not siblings_html:
        siblings_html = '<p style="font-family:monospace; font-size:11px; opacity:0.6;">You have reached the end of this shelf section.</p>'

    # Process page rendering variables
    page_src = CSS.replace("__TITLE__", b["title"])
    page_src = page_src.replace("__AUTHOR__", b["author"])
    page_src = page_src.replace("__CALL__", b["call"])
    page_src = page_src.replace("__TAGLINE__", b["tagline"])
    page_src = page_src.replace("__DESC__", b["description"])
    page_src = page_src.replace("__SECTION_LABEL__", sec_meta[0])
    page_src = page_src.replace("__COVER_PATH__", COVER.get(b["id"], "images/children/book1-cover-v2.png"))
    page_src = page_src.replace("__BADGE__", badge)
    page_src = page_src.replace("__ACTIONS__", actions_html)
    page_src = page_src.replace("__SIBLINGS__", siblings_html)

    # Output static page asset compilation
    out_file = os.path.join(OUT, f"{b['id']}.html")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(page_src)

print(f"Compilation Complete: Generated {len(BOOKS)} shelf pages inside {OUT}.")
