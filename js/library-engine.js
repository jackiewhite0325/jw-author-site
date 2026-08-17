// Improved library-engine.js (focus trap + scene highlighting + class-based results + debounced search)
(function () {
  'use strict';

  // Small utility: debounce
  function debounce(fn, wait = 200) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Centralized Database for All Authors under Sigil and Scribe LLC
  // Each book may contain cameraYRotation (for scene orientation) and elementId (A-Frame entity id to highlight)
  const libraryMasterCatalog = [
    {
      title: "Muffin Gets the Wiggles",
      author: "J. White",
      dewey: "813.6",
      genre: "Children's Books",
      seriesName: "The Muffin the Pitbull Puppy series",
      volume: 1,
      summary: "Follow the charming first adventures of Muffin the Pitbull puppy.",
      cameraYRotation: -45,
      elementId: 'muffinPoster'
    },
    {
      title: "The Bingo Card of Chronic Illness",
      author: "J. White",
      dewey: "616.09",
      genre: "Health & Wellness",
      seriesName: "None",
      volume: 0,
      summary: "An honest read offering grace and vulnerability while managing ongoing chronic conditions.",
      cameraYRotation: 0,
      elementId: 'aboutDeskPapers'
    },
    {
      title: "Don't Quote Me: Smart Mouths",
      author: "J. White",
      dewey: "818.6",
      genre: "More Books",
      seriesName: "Quote Journeys",
      volume: 1,
      summary: "A beautifully curated collection of wit, smart expressions, and interactive drawing paths.",
      cameraYRotation: 45,
      elementId: 'blogTypewriter'
    }
  ];

  // Focus trap helpers (small, dependency-free)
  let _trapHandler = null;
  function trapFocus(modalEl) {
    const selector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(modalEl.querySelectorAll(selector)).filter(el => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    _trapHandler = function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', _trapHandler);
    first.focus();
  }
  function releaseFocus() {
    if (_trapHandler) {
      document.removeEventListener('keydown', _trapHandler);
      _trapHandler = null;
    }
  }

  // Scene highlighting helpers
  let lastHighlightedEl = null;
  function highlightSceneElement(elementId) {
    // clear any previous highlight
    clearSceneHighlight();

    if (!elementId) return;
    const el = document.getElementById(elementId);
    if (!el) return;

    // add a subtle pulsing scale animation using aframe's animation component
    try {
      el.setAttribute('animation__highlight', 'property: scale; to: 1.08 1.08 1.08; dir: alternate; dur: 600; loop: true; easing: easeInOutSine');
      lastHighlightedEl = el;
    } catch (err) {
      // gracefully fail if the scene doesn't support animation attributes
      try { el.object3D.scale.set(1.08, 1.08, 1.08); lastHighlightedEl = el; } catch (e) { /* ignore */ }
    }
  }
  function clearSceneHighlight() {
    if (!lastHighlightedEl) return;
    try {
      lastHighlightedEl.removeAttribute('animation__highlight');
      lastHighlightedEl.setAttribute('scale', '1 1 1');
    } catch (err) {
      try { lastHighlightedEl.object3D.scale.set(1,1,1); } catch (e) { /* ignore */ }
    }
    lastHighlightedEl = null;
  }

  // Cached DOM nodes
  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('catalogSearch');
    const resultsContainer = document.getElementById('catalogResults');
    const modal = document.getElementById('parchmentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = modal ? modal.querySelector('.close-btn') : null;

    if (!searchInput || !resultsContainer || !modal || !modalTitle || !modalContent) {
      console.warn('library-engine: missing required DOM elements. Aborting initialization.');
      return;
    }

    // Prevent body scroll while modal is open
    function preventBodyScroll() { document.body.style.overflow = 'hidden'; }
    function restoreBodyScroll() { document.body.style.overflow = ''; }

    // Open/Close modal with accessibility hooks
    let lastFocusedEl = null;
    function openParchment(title, contents) {
      lastFocusedEl = document.activeElement;
      modalTitle.textContent = title || '';
      modalContent.innerHTML = '';

      if (typeof contents === 'string') {
        const p = document.createElement('div');
        p.innerText = contents;
        modalContent.appendChild(p);
      } else if (contents instanceof Node) {
        modalContent.appendChild(contents);
      } else {
        const p = document.createElement('div');
        p.innerText = String(contents);
        modalContent.appendChild(p);
      }

      modal.classList.add('modal-active');
      modal.setAttribute('aria-hidden', 'false');
      preventBodyScroll();

      // trap focus inside the modal
      trapFocus(modal);

      // listen for Escape to close
      const escHandler = function (e) { if (e.key === 'Escape') closeParchment(); };
      document.addEventListener('keydown', escHandler);
      modal._escHandler = escHandler;
    }

    function closeParchment() {
      modal.classList.remove('modal-active');
      modal.setAttribute('aria-hidden', 'true');
      restoreBodyScroll();
      releaseFocus();
      if (modal._escHandler) document.removeEventListener('keydown', modal._escHandler);
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
      // clear any scene highlight when closing
      clearSceneHighlight();
    }

    // wire the close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeParchment);
      closeBtn.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          closeParchment();
        }
      });
    }

    // click backdrop to close
    modal.addEventListener('click', (ev) => { if (ev.target === modal) closeParchment(); });

    // helper: safe HTML escape for snippets (used sparingly)
    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // create accessible result button
    function createResultButton(book) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'catalog-result';
      btn.setAttribute('aria-label', `${book.title} by ${book.author}`);

      const titleLine = document.createElement('div');
      titleLine.style.fontWeight = '600';
      titleLine.innerHTML = `<strong>[Dewey: ${escapeHtml(book.dewey)}]</strong> ${escapeHtml(book.title)}`;
      btn.appendChild(titleLine);

      const metaLine = document.createElement('div');
      metaLine.style.fontSize = '0.95rem';
      metaLine.style.opacity = '0.95';
      const seriesText = book.seriesName && book.seriesName !== 'None' ? `Vol ${book.volume} of ${book.seriesName}` : 'Standalone';
      metaLine.textContent = `By ${book.author} | ${seriesText}`;
      btn.appendChild(metaLine);

      btn.addEventListener('click', () => {
        // rotate scene to face book area (best-effort)
        try { highlightBookshelfZone(book.cameraYRotation || 0); } catch (e) { /* ignore */ }

        // visually highlight the related A-Frame element
        highlightSceneElement(book.elementId);

        const wrapper = document.createElement('div');
        const authorLine = document.createElement('p');
        authorLine.innerHTML = `<strong>Author:</strong> ${escapeHtml(book.author)}`;
        wrapper.appendChild(authorLine);

        const genreLine = document.createElement('p');
        genreLine.innerHTML = `<strong>Genre Hierarchy:</strong> ${escapeHtml(book.genre)}`;
        wrapper.appendChild(genreLine);

        const seriesLine = document.createElement('p');
        seriesLine.innerHTML = `<strong>Series Ordering:</strong> ${escapeHtml(book.seriesName)} (Volume ${escapeHtml(String(book.volume))})`;
        wrapper.appendChild(seriesLine);

        const summaryLine = document.createElement('p');
        summaryLine.innerHTML = `<em>${escapeHtml(book.summary)}</em>`;
        wrapper.appendChild(summaryLine);

        openParchment(`${book.title} (Class ${book.dewey})`, wrapper);
      });

      return btn;
    }

    // render no results
    function renderNoResults(query) {
      resultsContainer.innerHTML = '';
      const no = document.createElement('div');
      no.className = 'catalog-result';
      no.textContent = `No results for "${query}".`;
      resultsContainer.appendChild(no);
    }

    // main search handler (debounced)
    const handleSearch = debounce(function (e) {
      const query = (e && e.target) ? e.target.value.trim().toLowerCase() : '';
      resultsContainer.innerHTML = '';

      if (!query) {
        const hint = document.createElement('div');
        hint.className = 'catalog-result';
        hint.textContent = 'Start typing a title, author, or genre to search the catalog.';
        resultsContainer.appendChild(hint);
        return;
      }

      const tokens = query.split(/\s+/).filter(Boolean);
      const matches = libraryMasterCatalog.filter((book) => {
        const hay = `${book.title} ${book.author} ${book.genre}`.toLowerCase();
        return tokens.every(tok => hay.includes(tok));
      });

      if (!matches.length) { renderNoResults(query); return; }

      const frag = document.createDocumentFragment();
      matches.forEach(book => frag.appendChild(createResultButton(book)));
      resultsContainer.appendChild(frag);
    }, 200);

    searchInput.addEventListener('input', handleSearch);
    // init empty state
    searchInput.value = '';
    handleSearch({ target: searchInput });

    // expose (only if other inline handlers rely on them)
    window.openParchment = openParchment;
    window.closeParchment = closeParchment;

    // helper to rotate the room to target the physical bookshelf area (kept as best-effort)
    function highlightBookshelfZone(targetDegrees) {
      const rig = document.getElementById('cameraRig') || document.querySelector('[camera]');
      if (!rig) return;
      try { rig.setAttribute('rotation', `0 ${targetDegrees} 0`); } catch (err) { if (rig.style) rig.style.transform = `rotateY(${targetDegrees}deg)`; }
    }

  });
})();
