// Improved library-engine.js
// - Scoped, defensive, debounced search
// - Accessible modal handling (ESC to close, focus management)
// - Safe DOM creation for search results (uses buttons)
// - Prevents body scroll when modal is open

(function () {
  'use strict';

  // Small utility: debounce
  function debounce(fn, wait = 250) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Local catalog (consider extracting to a JSON/module if it grows)
  const libraryMasterCatalog = [
    {
      title: "Muffin Gets the Wiggles",
      author: "J. White",
      dewey: "813.6",
      genre: "Children's Books",
      seriesName: "The Muffin the Pitbull Puppy series",
      volume: 1,
      summary: "Follow the charming first adventures of Muffin the Pitbull puppy.",
      // 3D Target: Facing the Left Bookshelf wall coordinates
      cameraYRotation: 90
    },
    {
      title: "The Bingo Card of Chronic Illness",
      author: "J. White",
      dewey: "616.09",
      genre: "Health & Wellness",
      seriesName: "None",
      volume: 0,
      summary: "An honest read offering grace and vulnerability while managing ongoing chronic conditions.",
      // 3D Target: Facing the Right Bookshelf wall coordinates
      cameraYRotation: -90
    },
    {
      title: "Don't Quote Me: Smart Mouths",
      author: "J. White",
      dewey: "818.6",
      genre: "More Books",
      seriesName: "Quote Journeys",
      volume: 1,
      summary: "A beautifully curated collection of wit, smart expressions, and interactive drawing paths.",
      // 3D Target: Facing the Deep Back Alcove shelves coordinates
      cameraYRotation: 180
    }
  ];

  // Cached DOM nodes (query once)
  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('catalogSearch');
    const resultsContainer = document.getElementById('catalogResults');
    const modal = document.getElementById('parchmentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    if (!searchInput || !resultsContainer || !modal || !modalTitle || !modalContent) {
      console.warn('library-engine: missing required DOM elements. Aborting script initialization.');
      return;
    }

    // Accessibility: close button reference (assumes markup contains a .close-btn element)
    const closeBtn = modal.querySelector('.close-btn');

    // Keep track of focus for modal
    let lastFocusedEl = null;

    function preventBodyScroll() {
      document.body.style.overflow = 'hidden';
    }
    function restoreBodyScroll() {
      document.body.style.overflow = '';
    }

    function openParchment(title, contents) {
      lastFocusedEl = document.activeElement;
      modalTitle.textContent = title || '';
      // Clear previous content
      modalContent.innerHTML = '';
      // If contents is plain string, add it safely
      if (typeof contents === 'string') {
        const p = document.createElement('p');
        p.innerText = contents;
        modalContent.appendChild(p);
      } else if (contents instanceof Node) {
        modalContent.appendChild(contents);
      } else {
        // Fallback: stringify safely
        const p = document.createElement('p');
        p.innerText = String(contents);
        modalContent.appendChild(p);
      }
      modal.classList.add('modal-active');
      modal.setAttribute('aria-hidden', 'false');
      preventBodyScroll();

      // Focus management: focus close button if present, otherwise modal
      if (closeBtn) {
        closeBtn.focus();
      } else {
        modal.focus();
      }
      // Add keydown handler for modal-level interactions
      document.addEventListener('keydown', handleKeyDown);
    }

    function closeParchment() {
      modal.classList.remove('modal-active');
      modal.setAttribute('aria-hidden', 'true');
      restoreBodyScroll();
      document.removeEventListener('keydown', handleKeyDown);
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeParchment();
      }
      // Tab trapping could be added here if modal contains multiple focusable elements.
    }

    // Wire close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeParchment);
      // allow Enter/Space to activate the close control if it's not a button
      closeBtn.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          closeParchment();
        }
      });
    }

    // If user clicks outside modal content, close it (optional — only if modal container is backdrop)
    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) {
        closeParchment();
      }
    });

    // Smoothly rotates the room to target the physical bookshelf area (A-Frame integration if present)
    function highlightBookshelfZone(targetDegrees) {
      // If an entity with id cameraRig exists, rotate it; otherwise try camera selector
      const rig = document.getElementById('cameraRig') || document.querySelector('[camera]');
      if (rig) {
        // If rig is an A-Frame entity, setAttribute accepts strings or objects
        try {
          rig.setAttribute('rotation', `0 ${targetDegrees} 0`);
        } catch (err) {
          // Fallback: directly set style transform for non-AFrame fallbacks
          if (rig.style) rig.style.transform = `rotateY(${targetDegrees}deg)`;
        }
      }
    }

    // Build a result item safely using DOM APIs (button for keyboard accessibility)
    function createResultButton(book) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'catalog-result';
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.textAlign = 'left';
      btn.style.padding = '8px';
      btn.style.border = 'none';
      btn.style.background = 'transparent';
      btn.style.cursor = 'pointer';
      btn.setAttribute('aria-label', `${book.title} by ${book.author}`);

      const titleLine = document.createElement('div');
      titleLine.style.fontWeight = '600';
      titleLine.textContent = `[Dewey: ${book.dewey}] ${book.title}`;
      btn.appendChild(titleLine);

      const metaLine = document.createElement('div');
      metaLine.style.fontSize = '0.9em';
      metaLine.style.color = '#3e2723';
      const seriesText = book.seriesName && book.seriesName !== 'None' ? `Vol ${book.volume} of ${book.seriesName}` : 'Standalone';
      metaLine.textContent = `By ${book.author} | ${seriesText}`;
      btn.appendChild(metaLine);

      btn.addEventListener('click', () => {
        // Pivot the entire room orientation smoothly (if possible)
        highlightBookshelfZone(book.cameraYRotation);

        // Build structured content safely
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

    // Simple escape for inserted innerHTML snippets (we still build DOM, but use innerHTML for <strong>/<em>).
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Render "no results" message
    function renderNoResults(query) {
      resultsContainer.innerHTML = '';
      const no = document.createElement('div');
      no.style.padding = '8px';
      no.style.color = '#fff';
      no.textContent = `No results for "${query}". Try different keywords.`;
      resultsContainer.appendChild(no);
    }

    // Main search handler (debounced)
    const handleSearch = debounce(function (e) {
      const query = (e && e.target) ? e.target.value.trim().toLowerCase() : '';
      resultsContainer.innerHTML = '';

      if (!query) {
        // Could show suggestions or recent searches here
        const hint = document.createElement('div');
        hint.style.padding = '8px';
        hint.style.color = '#fff';
        hint.textContent = 'Start typing a title, author, or genre to search the catalog.';
        resultsContainer.appendChild(hint);
        return;
      }

      // Basic tokenized matching: split query into tokens and make sure each token appears somewhere
      const tokens = query.split(/\s+/).filter(Boolean);

      const matches = libraryMasterCatalog.filter((book) => {
        const hay = `${book.title} ${book.author} ${book.genre}`.toLowerCase();
        return tokens.every(tok => hay.includes(tok));
      });

      if (!matches.length) {
        renderNoResults(query);
        return;
      }

      const fragment = document.createDocumentFragment();
      matches.forEach((book) => {
        const btn = createResultButton(book);
        fragment.appendChild(btn);
      });
      resultsContainer.appendChild(fragment);
    }, 200);

    // Attach
    searchInput.addEventListener('input', handleSearch);

    // Initialize empty state
    searchInput.value = ''; // optional: restore previous value from localStorage
    handleSearch({ target: searchInput });

    // Expose open/close globally only if needed by inline a-frame onclicks (but better to avoid globals)
    window.openParchment = openParchment;
    window.closeParchment = closeParchment;
  });
})();
