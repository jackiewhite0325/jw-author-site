
/**
 * Sigil and Scribe - The Writer's Toolbox
 * Master Data Catalog (catalog.js) · Part 1
 * Canon Version 1.5 · Established August 2026
 */

// 1. Visual Theme Variables
export const THEME_SPEC = {
  colors: {
    primaryBg: "#FDFBF7",         // Warm paper
    secondaryContainer: "#F2F5F3", // Soft morning mist
    charcoalBody: "#2B2B2B",       // High-legibility charcoal Universal replacement for black
    highlightAccent: "#D4A373",    // Soft amber gold for focus and selections
    mutedContexts: "#A3B19B"       // Sage green for dividers and metadata state
  },
  typography: {
    headers: "Playfair Display, Merriweather, serif", // Soft human editorial look
    controls: "Inter, DM Sans, sans-serif"            // Clean high-legibility interface components
  },
  transitions: {
    cardHover: "box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    hoverShadowBloom: "0 4px 20px rgba(212, 163, 115, 0.15)"
  },
  spatial: {
    minimumCushioningPadding: "32px"
  }
};

// 2. Canonical Tool Roster
export const TOOL_ROSTER = [
  {
    id: "i-finally-wrote-it",
    name: "I Finally Wrote It!",
    type: "tool",
    bottleneck: "Rewrite-looping, self-editing blindness",
    desc: "Drafting canvas with a gentle continuity & Project Bible watcher. The flagship — stays lean on purpose."
  },
  {
    id: "story-compass",
    name: "Story Compass",
    type: "tool",
    bottleneck: "No roadmap / saggy middle",
    desc: "A 3-question generator that produces a one-line structural compass, always visible, never demanding."
  },
  {
    id: "a-little-cheer",
    name: "A Little Cheer",
    type: "tool",
    bottleneck: "Isolation, no accountability",
    desc: "A soft momentum companion — a weekly note to yourself, optionally shared with one trusted person."
  },
  {
    id: "how-it-might-land",
    name: "How It Might Land",
    type: "tool",
    bottleneck: "Fear the opening doesn't work",
    desc: "Paste an opening page, receive a few warm, honest gut-reactions."
  },
  {
    id: "tell-the-world",
    name: "Tell the World",
    type: "tool",
    bottleneck: "\"If I write it, they'll find it\" trap",
    desc: "Generates a first blurb draft and basic metadata suggestions from the manuscript's own beats."
  },
  {
    id: "troubleshoot-guide",
    name: "Troubleshoot Guide",
    type: "module",
    bottleneck: "Publishing & marketing overwhelm",
    desc: "Fixed-sequence diagnostic cards for the top 5 issues, ending in a \"don't lose hope\" video fallback."
  },
  {
    id: "marketing-menu",
    name: "Marketing Menu",
    type: "module",
    bottleneck: "Not knowing what your options even are",
    desc: "A browsable, ungraded checklist of small marketing actions — pick one, or let it pick for you."
  }
];

// 3. Troubleshoot Guide Content
export const TROUBLESHOOT_GUIDE = {
  categories: [
    {
      id: "discoverability",
      title: "No one seems to be finding my book",
      cards: [
        "Think like a reader, not a writer. When people search for a book like yours, what words would they actually type? Make sure those exact words show up in your book's title, subtitle, or description.",
        "Make sure your book is filed in the right spot. Online bookstores sort books into sections, like genres on a shelf. If your book's filed somewhere too broad or slightly off, readers browsing your genre may never see it. You can usually ask to be filed in a few more relevant spots.",
        "Check what shows before someone clicks \"read more.\" Only the first sentence or two of your description shows up right away. Does it make someone want to keep reading?",
        "Shrink your cover down small. Look at it the size it'll appear on a phone. Does it still look like it belongs next to other books in your genre, or does it get lost?",
        "Look for yourself outside your own page. Are you mentioned anywhere else — a blog post, a reading list, someone else talking about your book?"
      ],
      videoFallback: "getting-found"
    },
    {
      id: "reviews",
      title: "I can't seem to get reviews",
      cards: [
        "Just ask, at the very end of the book. A simple line like \"if you enjoyed this, a review would mean the world\" works better than people expect.",
        "Offer a few free copies before launch, in exchange for an honest review once people finish reading.",
        "Reach out to a handful of people who review books in your genre — a personal note to a few beats a mass email to hundreds.",
        "Ask people you know directly — not a vague \"check it out,\" but \"here's the link, would you leave a quick review?\"",
        "Try making the book free or discounted for a short time — more readers now can mean more reviews down the road."
      ],
      videoFallback: "first-reviews"
    },
    {
      id: "sales-slowed",
      title: "Sales that started strong have slowed down",
      cards: [
        "Try a short-term discount to give things a little spark again.",
        "Make sure it's easy for someone to find your other books if you have them — a lot of readers want to buy more once they finish one.",
        "Take a fresh look at your cover and description. Does it still feel true to the book, or does it need an update?",
        "Look for anything new to show off — recent reviews, anything that signals \"people are still reading this.\"",
        "Remind your existing readers you're still here — a quick note or post, even a small one."
      ],
      videoFallback: "picking-things-back-up"
    },
    {
      id: "pricing",
      title: "I don't know what to charge",
      cards: [
        "Look at similar books in your genre and see what they charge — that's your starting range.",
        "Know what you actually take home at different prices. On most platforms, pricing too low or too high can quietly shrink your cut — it's worth checking before you settle on a number.",
        "Think about what you need right now — a lower price to get more people reading and talking, or a higher price because you have a following already.",
        "Try a different price for a few weeks and watch what happens — pricing isn't permanent, and you're allowed to experiment.",
        "It's okay to charge different amounts for the ebook, paperback, and any other format."
      ],
      videoFallback: "pricing-without-guesswork"
    },
    {
      id: "marketing-overwhelm",
      title: "Marketing feels like too much to even start",
      cards: [
        "Pick just one thing to try first — you don't have to do it all at once.",
        "Build one small habit you can repeat, like a short monthly update to readers, instead of chasing every new trend.",
        "Add one simple ask at the end of your book — a review request or a way to stay in touch.",
        "Do it in batches. One afternoon a month beats trying to keep up daily.",
        "Give yourself permission to do two things well and let the rest go — nobody does everything."
      ],
      videoFallback: "marketing-not-doing-it-all"
    }
  ]
};

// 4. Checklist Menus — Marketing Menu Buffet
export const MARKETING_MENU = [
  {
    category: "Your book itself",
    items: [
      "Add a review request in your back matter",
      "Refresh your book description",
      "Double check your cover reads well small",
      "Fill in your keyword fields with real reader language"
    ]
  },
  {
    category: "Reaching new readers",
    items: [
      "Share your book in one relevant online group",
      "Reach out to a few reviewers in your genre",
      "Try a short free or discounted promo",
      "Ask to be added to a genre-specific list or newsletter"
    ]
  },
  {
    category: "Staying in touch with readers you already have",
    items: [
      "Send one newsletter update",
      "Post one update on social media",
      "Thank a reviewer personally",
      "Offer a small bonus to your mailing list"
    ]
  },
  {
    category: "Building for later",
    items: [
      "Set up a simple newsletter signup",
      "Write a short, personal 'about me'",
      "Plan your next book's blurb early",
      "Note what worked this time, for next time"
    ]
  }
];

// 5. Canonical Badge Inventory (Milestones & Points Core)
export const BADGE_INVENTORY = {
  sitewide: [
    {
      id: "welcome-star",
      name: "Welcome Star",
      milestones: [
        { lvl: 1, req: "First login", pts: 1 },
        { lvl: 2, req: "One month since joining", pts: 1 },
        { lvl: 3, req: "Six months since joining", pts: 1 },
        { lvl: 4, req: "One year since joining", pts: 1 }
      ]
    },
    {
      id: "still-here",
      name: "Still Here",
      desc: "Comeback tracker. Never resets progress or displays loss states.",
      milestones: [
        { lvl: 1, req: "Returned after 7+ days away", pts: 1 },
        { lvl: 2, req: "Returned after 30+ days away", pts: 1 },
        { lvl: 3, req: "Returned after 90+ days away", pts: 1 },
        { lvl: 4, req: "Returned after a full year away", pts: 1 }
      ]
    },
    {
      id: "wanderer",
      name: "Wanderer",
      milestones: [
        { lvl: 1, req: "Tried a 2nd tool", pts: 1 },
        { lvl: 2, req: "Tried a 3rd tool", pts: 1 },
        { lvl: 3, req: "Tried a 4th tool", pts: 2 },
        { lvl: 4, req: "Used four+ tools on one project", pts: 5 }
      ]
    },
    {
      id: "the-patron",
      name: "The Patron",
      desc: "Book purchases. Stacks up to 4x multiplier on Plain frame. Framed per badge milestone context.",
      milestones: [
        { lvl: 1, req: "1st purchase (plain frame)", pts: 2 },
        { lvl: 2, req: "2nd purchase", pts: 2 },
        { lvl: 3, req: "3rd purchase", pts: 2 },
        { lvl: 4, req: "4th purchase", pts: 2 },
        { lvl: 5, req: "5th purchase (silver frame wrap, color resets)", pts: 2 },
        { lvl: 9, req: "9th purchase (gold frame upgrade, color resets)", pts: 2 }
      ]
    }
  ],
  iFinallyWroteIt: [
    {
      id: "wordsmith",
      name: "Wordsmith",
      milestones: [
        { lvl: 1, req: "500 words (bronze unlock)", pts: 2 },
        { lvl: 2, req: "1,000 words (color shift)", pts: 2 },
        { lvl: 3, req: "2,500 words (color shift)", pts: 2 },
        { lvl: 4, req: "5,000 words (color shift + frame check)", pts: 2 }
      ]
    },
    {
      id: "second-eyes",
      name: "Second Eyes",
      milestones: [
        { lvl: 1, req: "1st note resolved", pts: 3 },
        { lvl: 2, req: "5 notes resolved", pts: 3 },
        { lvl: 3, req: "15 notes resolved", pts: 3 },
        { lvl: 4, req: "30 notes resolved", pts: 3 }
      ]
    },
    {
      id: "turned-the-page",
      name: "Turned the Page",
      milestones: [
        { lvl: 1, req: "1 chapter", pts: 3 },
        { lvl: 2, req: "5 chapters", pts: 3 },
        { lvl: 3, req: "10 chapters", pts: 3 },
        { lvl: 4, req: "20 chapters", pts: 3 }
      ]
    },
    {
      id: "the-finish-line",
      name: "The Finish Line",
      desc: "Manuscripts completed. Point parameters do not scale down with future completions.",
      milestones: [
        { lvl: 1, req: "1st draft finished", pts: 5 },
        { lvl: 2, req: "2nd draft finished", pts: 5 },
        { lvl: 3, req: "3rd draft finished", pts: 5 },
        { lvl: 4, req: "5th draft finished", pts: 5 }
      ]
    }
  ]
};  storyCompass: [
    {
      id: "true-north",
      name: "True North",
      milestones: [
        { lvl: 1, req: "First compass completed", pts: 2 },
        { lvl: 2, req: "Revised a compass after drafting", pts: 3 },
        { lvl: 3, req: "Compasses for 3 projects", pts: 2 },
        { lvl: 4, req: "Compasses for 5 projects", pts: 2 }
      ]
    }
  ],
  aLittleCheer: [
    {
      id: "cheerful-heart",
      name: "Cheerful Heart",
      milestones: [
        { lvl: 1, req: "First check-in", pts: 1 },
        { lvl: 2, req: "4 check-ins total", pts: 1 },
        { lvl: 3, req: "12 check-ins total", pts: 2 },
        { lvl: 4, req: "30 separate days checked in", pts: 5 }
      ]
    }
  ],
  howItMightLand: [
    {
      id: "brave-page",
      name: "Brave Page",
      milestones: [
        { lvl: 1, req: "First pass completed", pts: 3 },
        { lvl: 2, req: "3 openings shared", pts: 3 },
        { lvl: 3, req: "5 openings shared", pts: 3 },
        { lvl: 4, req: "10 openings shared", pts: 3 }
      ]
    }
  ],
  tellTheWorld: [
    {
      id: "storytellers-voice",
      name: "Storyteller's Voice",
      milestones: [
        { lvl: 1, req: "First blurb drafted", pts: 2 },
        { lvl: 2, req: "Blurbs for 3 books", pts: 2 },
        { lvl: 3, req: "Used metadata suggestions", pts: 2 },
        { lvl: 4, req: "5+ blurbs total", pts: 2 }
      ]
    }
  ],
  troubleshootGuide: [
    {
      id: "steady-hands",
      name: "Steady Hands",
      milestones: [
        { lvl: 1, req: "First 'this worked' resolution", pts: 3 },
        { lvl: 2, req: "3 resolutions total", pts: 3 },
        { lvl: 3, req: "Tried all 5 categories", pts: 2 },
        { lvl: 4, req: "Reached 'don't lose hope' and came back", pts: 2 }
      ]
    }
  ],
  marketingMenu: [
    {
      id: "one-small-thing",
      name: "One Small Thing",
      milestones: [
        { lvl: 1, req: "First item checked", pts: 1 },
        { lvl: 2, req: "5 items checked", pts: 1 },
        { lvl: 3, req: "Items checked from all 4 categories", pts: 2 },
        { lvl: 4, req: "15 items checked total", pts: 2 }
      ]
    }
  ]
};

