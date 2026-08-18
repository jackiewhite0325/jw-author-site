/* ============================================================================ 

1. Data Collection & Global State Engine
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
toc: ["Story 1: The Brave Little Pixel", "Story 2: Gravity's Playground"]
},
{
id: "meditation_space_anchor",
title: "A Mindful Breath",
spineColor: "#4b86b4",
dewey: "158.12",
toc: ["Intro: Tuning Out the Noise", "01: Stillness", "02: The Daily Pivot"]
}
];

// Global runtime flags replacing the old 360 viewer references
let activeBookInstance = null;
let isAnimationSequenceRunning = false; 

/* ============================================================================
2. Animation Router & Interaction Core
============================================================================ */
function selectBook(bookId) {
if (isAnimationSequenceRunning) return; 

const bookData = libraryMasterCatalog.find(b => b.id === bookId);
if (!bookData) return; 

// If clicking the already open book, close it
if (activeBookInstance && activeBookInstance.id === bookId) {
closeActiveBook();
return;
} 

// If another book is open, close it first before opening the new one
if (activeBookInstance) {
closeActiveBook(() => executeBookOpenSequence(bookData));
} else {
executeBookOpenSequence(bookData);
}
} 

function executeBookOpenSequence(bookData) {
isAnimationSequenceRunning = true;
activeBookInstance = bookData; 

// Update UI text instantly for accessibility hooks
updateToastDisplay(Pulling "${bookData.title}" off the shelf...); 

/*
INTEGRATION NOTE:
Trigger your animation library hooks here (e.g., GSAP or Three.js timelines).
Step 1: Move the book model forward (-Z axis translation)
Step 2: Rotate the book face-flat toward the screen camera
Step 3: Trigger the cover flip animation open (Y-axis hinge rotation)
*/ 

// Simulate animation duration before rendering text contents
setTimeout(() => {
renderTableOfContents(bookData);
isAnimationSequenceRunning = false;
}, 1200); // Match this timeout value to your actual visual animation duration
} 

function closeActiveBook(callback = null) {
if (!activeBookInstance) return;
isAnimationSequenceRunning = true; 

hideTableOfContentsPanel();
updateToastDisplay(Returning book to Dewey ${activeBookInstance.dewey}...); 

/*
INTEGRATION NOTE:
Reverse your animation timelines here to snap the book back on the shelf.
*/ 

setTimeout(() => {
activeBookInstance = null;
isAnimationSequenceRunning = false;
updateToastDisplay("");
if (callback) callback();
}, 1000);
} 

/* ============================================================================
3. Dynamic DOM Renderer & Content Populator
============================================================================ */
function renderTableOfContents(bookData) {
const overlayPanel = document.getElementById('toc-display-overlay');
const titleNode = document.getElementById('toc-title');
const listNode = document.getElementById('toc-list'); 

if (!overlayPanel || !titleNode || !listNode) return; 

titleNode.textContent = bookData.title;
listNode.innerHTML = ''; // Clear previous elements safely 

bookData.toc.forEach(chapter => {
const li = document.createElement('li');
li.textContent = chapter;
listNode.appendChild(li);
}); 

overlayPanel.classList.add('visible');
} 

function hideTableOfContentsPanel() {
const overlayPanel = document.getElementById('toc-display-overlay');
if (overlayPanel) {
overlayPanel.classList.remove('visible');
}
} 

function updateToastDisplay(message) {
const toast = document.getElementById('library-status-toast');
if (!toast) return; 

if (message) {
toast.textContent = message;
toast.style.display = 'block';
} else {
toast.style.display = 'none';
}
} 

function initializeCatalogDropdown() {
const selectMenu = document.getElementById('catalog-search-select');
if (!selectMenu) return; 

selectMenu.innerHTML = '-- Browse Shelf Registry --
