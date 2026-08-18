/* ============================================================================ 
1. Centralized Data Catalog Schema (Fixed with True Books & Prices)
============================================================================ */
const libraryMasterCatalog = [
  {
    id: "i_finally_wrote_it",
    title: "I Finally Wrote It",
    spineColor: "#8b0000",
    dewey: "808.02",
    price: "Read Sample Online",
    toc: ["Chapter 1: The Blank Page", "Chapter 2: Finding a Voice", "Chapter 3: The Final Draft"]
  },
  {
    id: "partner_book_placeholder",
    title: "Partner Project Ledger",
    spineColor: "#1e3d59",
    dewey: "813.6",
    price: "Status: In Production",
    toc: ["Section I: Collaborative Design", "Section II: Integration Steps", "Section III: Shared Ecosystems"]
  },
  {
    id: "kids_corner_anchor",
    title: "Muffin the Pitbull Puppy",
    spineColor: "#ff7b25",
    dewey: "808.83",
    price: "Hardcover $12.99",
    toc: ["Story 1: The Brave Little Pixel", "Story 2: Gravity's Playground", "Story 3: Muffin's Grand Adventure"]
  },
  {
    id: "bingo_card_chronic_illness",
    title: "The Bingo Card of Chronic Illness",
    spineColor: "#4b86b4",
    dewey: "158.12",
    price: "Ebook $4.99 · Paperback $14.99",
    toc: ["Intro: Have You Tried This?", "01: Surviving the Advice Parade", "02: Validation, Humor, and Grace"]
  }
];

// Structural global state layers
let activeBookInstance = null;
let isAnimationSequenceRunning = false;
