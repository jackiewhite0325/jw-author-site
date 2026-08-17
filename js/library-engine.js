// Improved library-engine.js (focus trap + scene highlighting + class-based results + debounced search + accessibility polish)
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
    clearSceneHighlight();

    if (!elementId) return;
    const el = document.getElementById(elementId);
    if (!el) return;

    try {
      el.setAttribute('material', 'color: #b8873f; opacity: 0.9; transparent: true');
      el.setAttribute('animation__highlight', 'property: scale; to: 1.08 1.08 1.08; dir: alternate; dur: 600; loop: true; easing: easeInOutSine');
      lastHighlightedEl = el;
    } catch (err) {
      try { el.object3D.scale.set(1.08, 1.08, 1.08); lastHighlightedEl = el; } catch (e) { /* ignore */ }
    }
  }
  function clearSceneHighlight() {
    if (!lastHighlightedEl) return;
    try {
      lastHighlightedEl.removeAttribute('animation__highlight');
      lastHighlightedEl.removeAttribute('material');
      lastHighlightedEl.setAttribute('scale', '1 1 1');
    } catch (err) {
      try { lastHighlightedEl.object3D.scale.set(1,1,1); } catch (e) { /* ignore */ }
    }
    lastHighlightedEl = null;
  }

  // Retry helper if entity not ready
  function highlightSceneElementWithRetry(elementId, attempts = 6) {
    if (!elementId) return;
    let tries = 0;
    const tryNow = () => {
      const el = document.getElementById(elementId);
      if (el) { highlightSceneElement(elementId); return; }
      tries++;
      if (tries < attempts) setTimeout(tryNow, 250);
    };
    tryNow();
  }

  // Cached DOM nodes & startup
  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('catalogSearch');
    const resultsContainer = document.getElementById('catalogResults');
    const modal = document.getElementById('parchmentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = modal ? modal.querySelector('.close-btn') : null;

    const exploreIntro = document.getElementById('exploreIntro');
    const exploreBtn = document.getElementById('exploreBtn');
    const showCatalogBtn = document.getElementById('showCatalogBtn');
    const staticModeBtn = document.getElementById('staticModeBtn');
    const exploreToggle = document.getElementById('exploreToggle');
    const cardCatalog = document.getElementById('cardCatalogDrawer');
    const catalogSearch = searchInput;
    const exitStaticBtn = document.getElementById('exitStaticBtn');
    const siteAnnounce = document.getElementById('siteAnnouncement');

    if (!searchInput || !resultsContainer || !modal || !modalTitle || !modalContent) {
      console.warn('library-engine: missing required DOM elements. Aborting initialization.');
      return;
    }

    function announce(msg) { if (siteAnnounce) siteAnnounce.textContent = msg; }

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
      announce(`${title} opened`);

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
      const prev = document.querySelector('.catalog-result.selected');
      if (prev) prev.classList.remove('selected');
      clearSceneHighlight();
      announce('Closed details');
    }

    // wire close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeParchment);
      closeBtn.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); closeParchment(); }
      });
    }

    // click backdrop to close
    modal.addEventListener('click', (ev) => { if (ev.target === modal) closeParchment(); });

    // helper: safe HTML escape for snippets
    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // rotate/face bookshelf helper (best-effort)
    function highlightBookshelfZone(targetDegrees) {
      const rig = document.getElementById('cameraRig') || document.querySelector('[camera]');
      if (!rig) return;
      try { rig.setAttribute('rotation', `0 ${targetDegrees} 0`); } catch (err) { if (rig.style) rig.style.transform = `rotateY(${targetDegrees}deg)`; }
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
      metaLine.className = 'meta';
      const seriesText = book.seriesName && book.seriesName !== 'None' ? `Vol ${book.volume} of ${book.seriesName}` : 'Standalone';
      metaLine.textContent = `By ${book.author} | ${seriesText}`;
      btn.appendChild(metaLine);

      btn.addEventListener('click', () => {
        const prev = document.querySelector('.catalog-result.selected');
        if (prev) prev.classList.remove('selected');
        btn.classList.add('selected');

        try { highlightBookshelfZone(book.cameraYRotation || 0); } catch (e) { /* ignore */ }
        highlightSceneElementWithRetry(book.elementId);

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
      announce(`No results for ${query}`);
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
      announce(`${matches.length} results for ${query}`);
    }, 200);

    searchInput.addEventListener('input', handleSearch);
    // init empty state
    searchInput.value = '';
    handleSearch({ target: searchInput });

    // Expose for inline handlers
    window.openParchment = openParchment;
    window.closeParchment = closeParchment;

    // Onboarding + Explore toggle wiring with accessibility
    // siteAnnounce is an aria-live polite region (screen-reader announcements)
    if (exploreIntro && !localStorage.getItem('sawExploreIntro')) { exploreIntro.style.display = 'block'; }
    else if (exploreIntro) { exploreIntro.style.display = 'none'; }

    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        localStorage.setItem('sawExploreIntro', '1');
        exploreIntro.style.display = 'none';
        brieflyShowHotspots();
        announce('Exploration started');
      });
    }

    if (showCatalogBtn) {
      showCatalogBtn.addEventListener('click', () => {
        if (exploreIntro) exploreIntro.style.display = 'none';
        if (cardCatalog) { cardCatalog.classList.remove('hidden'); if (catalogSearch) catalogSearch.focus(); }
        announce('Catalog opened');
      });
    }

    // helper that briefly hints at hotspots
    function brieflyShowHotspots() {
      const hotspotIds = libraryMasterCatalog.map(b => b.elementId).filter(Boolean);
      hotspotIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        try { el.setAttribute('material', 'color: #b8873f; opacity: 0.65; transparent: true'); } catch (e) {}
        setTimeout(() => { try { el.setAttribute('material', 'opacity: 0.01; transparent: true'); } catch (e) {} }, 1400);
      });
    }

    // Explore toggle (floating)
    if (exploreToggle) {
      exploreToggle.setAttribute('aria-pressed', 'false');
      exploreToggle.addEventListener('click', () => {
        const pressed = exploreToggle.getAttribute('aria-pressed') === 'true';
        exploreToggle.setAttribute('aria-pressed', String(!pressed));
        if (cardCatalog) {
          cardCatalog.classList.toggle('hidden');
          if (!cardCatalog.classList.contains('hidden') && catalogSearch) catalogSearch.focus();
          announce(cardCatalog.classList.contains('hidden') ? 'Catalog hidden' : 'Catalog shown');
        }
      });
    }

    // Static mode toggle
    if (staticModeBtn) {
      staticModeBtn.setAttribute('aria-pressed', String(!!localStorage.getItem('staticMode')));
      staticModeBtn.addEventListener('click', () => {
        const pressed = staticModeBtn.getAttribute('aria-pressed') === 'true';
        const newMode = !pressed;
        staticModeBtn.setAttribute('aria-pressed', String(newMode));
        if (typeof window.setStaticMode === 'function') window.setStaticMode(newMode);
        announce(newMode ? 'Static view enabled' : 'Interactive view enabled');
      });
    }

    if (exitStaticBtn) {
      exitStaticBtn.addEventListener('click', () => {
        if (typeof window.setStaticMode === 'function') window.setStaticMode(false);
        if (staticModeBtn) staticModeBtn.setAttribute('aria-pressed','false');
        announce('Interactive view enabled');
      });
    }

    // Keyboard shortcut: press 'm' to toggle static mode (when not focused in an input)
    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;
      if (e.key && e.key.toLowerCase() === 'm') {
        // toggle
        const current = !!localStorage.getItem('staticMode');
        const newMode = !current;
        if (typeof window.setStaticMode === 'function') window.setStaticMode(newMode);
        if (staticModeBtn) staticModeBtn.setAttribute('aria-pressed', String(newMode));
        announce(newMode ? 'Static view enabled' : 'Interactive view enabled');
      }
    });

  });
})();
