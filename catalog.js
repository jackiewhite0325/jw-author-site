/* ============================================================================ 
1. Centralized Data Catalog Schema
============================================================================ */
const libraryMasterCatalog = [
  {
    id: "i_finally_wrote_it",
    title: "I Finally Wrote It",
    spineColor: "#8b0000",
    dewey: "808.02",
    toc: ["Chapter 1: The Blank Page", "Chapter 2: Finding a Voice", "Chapter 3: The Final Draft"]
  },
  {
    id: "partner_book_placeholder",
    title: "Partner Project Ledger",
    spineColor: "#1e3d59",
    dewey: "813.6",
    toc: ["Section I: Collaborative Design", "Section II: Integration Steps", "Section III: Shared Ecosystems"]
  },
  {
    id: "kids_corner_anchor",
    title: "The Kids Corner Tales",
    spineColor: "#ff7b25",
    dewey: "808.83",
    toc: ["Story 1: The Brave Little Pixel", "Story 2: Gravity's Playground", "Story 3: Muffin's Grand Adventure"]
  },
  {
    id: "meditation_space_anchor",
    title: "A Mindful Breath",
    spineColor: "#4b86b4",
    dewey: "158.12",
    toc: ["Intro: Tuning Out the Noise", "01: Stillness", "02: The Daily Pivot"]
  }
];

// Structural global state layers
let activeBookInstance = null;
let isAnimationSequenceRunning = false;
