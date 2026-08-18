/**
 * catalog-data.js
 * ------------------------------------------------------------------
 * Sigil and Scribe, LLC — Card Catalog data source.
 *
 * This file holds CONTENT ONLY (titles, authors, links, descriptions).
 * All display/search behavior lives in catalog.js, which reads this file.
 * Keeping them separate means someone can add/edit a book here without
 * touching any logic.
 *
 * ⚠️ ISBN GAP: The original asset list with ISBNs is currently missing
 * (see project handoff doc, Section 1 / Section 9). Every book below has
 * an `isbn: ""` placeholder. Fill these in once the list is found or
 * rebuilt — do NOT invent ISBNs.
 *
 * Sections currently in use (must match section keys used in catalog.js
 * and the `data-section` attributes on shelf containers in the HTML):
 *   "children" | "wellness" | "more" | "fiction" | "toolbox"
 *
 * Call number ranges (canon, from Project Bible):
 *   100s = Children's Books
 *   200s = Health & Wellness
 *   300s = More Books
 *   400s = Fiction
 *   500s = Writer's Toolbox
 * ------------------------------------------------------------------
 */

window.SIGIL_CATALOG = {

  books: [
    // ---------------- Children's Books (100s) ----------------
    {
      id: "muffin-wiggles",
      call: "100.1",
      title: "Muffin Gets the Wiggles",
      author: "J. White",
      authorKey: "jw",
      section: "children",
      tagline: "Book 1 of the Muffin the Pitbull Puppy series.",
      description: "A 26-book series helping kids understand and cope with chronic illness, inspired by a real dog who had seizures and taught her family what courage looks like. Five percent of net series royalties are donated quarterly to St. Jude Children's Research Hospital in her name.",
      isbn: "",
      links: [
        { label: "Kindle", url: "https://www.amazon.com/dp/B0HDYB7624" },
        { label: "Paperback", url: "https://www.amazon.com/dp/B0HF43T8BV" }
      ],
      comingSoon: false
    },
    {
      id: "muffin-tired",
      call: "100.2",
      title: "Muffin Gets Tired a Lot",
      author: "J. White",
      authorKey: "jw",
      section: "children",
      tagline: "Book 2 of the Muffin the Pitbull Puppy series.",
      description: "Coming soon — new books in the series are added as they're published.",
      isbn: "",
      links: [],
      comingSoon: true
    },

    // ---------------- Health & Wellness (200s) ----------------
    {
      id: "bingo-card-chronic-illness",
      call: "200.1",
      title: "The Bingo Card of Chronic Illness",
      author: "J. White",
      authorKey: "jw",
      section: "wellness",
      tagline: "Have you tried this? Surviving the advice parade.",
      description: "An honest, humor-filled read on chronic illness, grace, and getting through hard days — for anyone tired of well-meaning suggestions.",
      isbn: "",
      links: [
        { label: "Get the Book", url: "https://books2read.com/u/meNaLz" }
      ],
      comingSoon: false
    },
    {
      id: "many-faces-of-grace",
      call: "200.2",
      title: "The Many Faces of Grace",
      author: "J. White",
      authorKey: "jw",
      section: "wellness",
      tagline: "On chronic illness and the many shapes grace takes.",
      description: "A companion read exploring what grace looks like on the hardest days — honest, tender, and never precious about it.",
      isbn: "",
      links: [
        { label: "Get the Book", url: "https://books2read.com/u/mga6XD" }
      ],
      comingSoon: false
    },

    
    // ---------------- More Books (300s) ----------------
    {
      id: "dont-quote-me",
      call: "300.1",
      title: "Don't Quote Me: Smart Mouths",
      author: "J. White",
      authorKey: "jw",
      section: "more",
      tagline: "A quote collection with a sense of humor.",
      description: "Sharp, funny, and quotable lines collected for anyone who likes their wisdom with a little bite.",
      isbn: "",
      links: [
        { label: "Kindle", url: "https://www.amazon.com/dp/B0FK9QH1BR" },
        { label: "Paperback", url: "https://www.amazon.com/dp/B0FL9V16YT" }
      ],
      comingSoon: false
    },
    {
      id: "axolotl-dreams",
      call: "300.2",
      title: "Axolotl Dreams: A Coloring Journey",
      author: "J. White",
      authorKey: "jw",
      section: "more",
      tagline: "A coloring book, gently strange and calming.",
      description: "A coloring journey built around the odd little charm of axolotls — a quiet, low-stakes creative outlet.",
      isbn: "",
      links: [
        { label: "Paperback", url: "https://www.amazon.com/dp/B0FPDM6SG5" }
      ],
      comingSoon: false
    },
    {
      id: "syncretic-ritualist-almanac",
      call: "300.3",
      title: "Syncretic Ritualist Almanac",
      author: "Petra C.Ht.",
      authorKey: "petra",
      section: "more",
      tagline: "A working almanac for ritual and practice.",
      description: "An almanac blending ritual traditions into a practical, syncretic guide — for readers building their own practice rather than following one script.",
      isbn: "",
      links: [
        { label: "Get the Book", url: "https://books2read.com/u/475ep7" }
      ],
      comingSoon: false
    },

    // ---------------- Fiction (400s) ----------------
    // Intentionally empty. Render the "coming soon" shelf state in the UI
    // when no items exist for section === "fiction". Do not fabricate
    // placeholder entries here.

    // ---------------- Writer's Toolbox (500s) ----------------
    {
      id: "i-finally-wrote-it",
      call: "500.1",
      title: "I Finally Wrote It!",
      author: "Toolbox",
      authorKey: "toolbox",
      section: "toolbox",
      kind: "tool",
      tagline: "The flagship — a drafting canvas with a gentle continuity watcher.",
      description: "For when the rewrite-loop won't let go of chapter one. A focused place to draft, with a soft-spoken companion that quietly notices continuity slips — never grading, just a second pair of eyes.",
      requiresLogin: true,
      toolUrl: "/write/i-finally-wrote-it/"
    },
    {
      id: "story-compass",
      call: "520.2",
      title: "Story Compass",
      author: "Toolbox",
      authorKey: "toolbox",
      section: "toolbox",
      kind: "tool",
      tagline: "Three questions. One line. A quiet sense of where north is.",
      description: "For the saggy middle and the missing roadmap. Answer three short questions and receive a one-line structural compass — always visible, never demanding you follow it exactly.",
      requiresLogin: true,
      toolUrl: "/write/story-compass/"
    },
    {
      id: "a-little-cheer",
      call: "540.3",
      title: "A Little Cheer",
      author: "Toolbox",
      authorKey: "toolbox",
      section: "toolbox",
      kind: "tool",
      tagline: "A soft momentum companion for the lonely stretches.",
      description: "A weekly note to yourself — optionally shared with one trusted person — to mark that you showed up, without ever tracking a punishing streak.",
      requiresLogin: true,
      toolUrl: "/write/a-little-cheer/"
    },
    {
      id: "how-it-might-land",
      call: "560.4",
      title: "How It Might Land",
      author: "Toolbox",
      authorKey: "toolbox",
      section: "toolbox",
      kind: "tool",
      tagline: "Paste your opening page. Receive a few honest, warm reactions.",
      description: "For the fear that the opening doesn't work. A few gut-reactions to your first page — gentle, specific, never a verdict.",
      requiresLogin: true,
      toolUrl: "/write/how-it-might-land/"
    },
    {
      id: "tell-the-world",
      call: "600.1",
      title: "Tell the World",
      author: "Toolbox",
      authorKey: "toolbox",
      section: "toolbox",
      kind: "module",
      tagline: "Your manuscript already contains the bones of a blurb.",
      description: "Generates a first blurb draft and metadata suggestions, pulled from your own manuscript's beats — a starting point, not a finished ad.",
      requiresLogin: true,
      toolUrl: "/write/tell-the-world/"
    },
    {
      id: "troubleshoot-guide",
      call: "620.2",
      title: "Troubleshoot Guide",
      author: "Toolbox",
      authorKey: "toolbox",
      section: "toolbox",
      kind: "module",
      tagline: "Five common snags. A few small cards each.",
      description: "Work through short actionable cards in order. If nothing lands, you still leave with 'don't lose hope' and a place to go next.",
      requiresLogin: true,
      toolUrl: "/write/troubleshoot-guide/"
    },
    {
      id: "marketing-menu",
      call: "640.3",
      title: "Marketing Menu",
      author: "Toolbox",
      authorKey: "toolbox",
      section: "toolbox",
      kind: "module",
      tagline: "A buffet of small marketing actions.",
      description: "A browsable, ungraded checklist grouped loosely by theme — no due dates, no sequence. One small thing is a complete, successful visit.",
      requiresLogin: true,
      toolUrl: "/write/marketing-menu/"
    }
  ],

   // Items that are intentionally NOT shelved yet — shown only as a quiet
  // "reserved" note in the catalog. Never render these with a call number,
  // cover, spine, or excerpt. See project handoff doc, Section 10, before
  // editing anything here.
  reserved: [
    {
      id: "nineteen-days",
      title: "Nineteen Days",
      author: "Petra",
      authorKey: "petra",
      tagline: "Coming soon — not yet catalogued.",
      description: "A memoir of surviving a near-fatal moment, and the sister whose voice called her back.",
      note: "Petra is still writing this one. It will appear on the shelf when she's ready — this card is just to say it's coming."
    }
  ]
};
