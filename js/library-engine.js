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
    const focusable = Array.from(modalEl.querySelectorAll(selector)).filter(el => {
      const style = window.getComputedStyle(el);
      return !el.hidden && style.display !== 'none' && style.visibility !== 'hidden';
    });
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

  // Transient overlay helper (used instead of A-Frame highlights)
  let _transientOverlayTimer = null;
  function _createTransientOverlay(text) {
    try {
      const container = document.getElementById('library-panorama');
      if (!container) return null;
      let overlay = container.querySelector('.pano-transient-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'pano-transient-overlay';
        overlay.style.position = 'absolute';
        overlay.style.left = '50%';
        overlay.style.top = '50%';
        overlay.style.transform = 'translate(-50%,-50%)';
        overlay.style.padding = '12px 16px';
        overlay.style.borderRadius = '8px';
        overlay.style.background = 'rgba(242,245,243,0.95)'; // module-bg tone
        overlay.style.color = '#2B2B2B';
        overlay.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
        overlay.style.zIndex = '10020';
        overlay.style.transition = 'opacity 360ms ease';
        overlay.style.pointerEvents = 'none';
        container.style.position = container.style.position || 'relative';
        container.appendChild(overlay);
      }
      overlay.textContent = text || '';
      overlay.style.opacity = '1';
      if (_transientOverlayTimer) clearTimeout(_transientOverlayTimer);
      _transientOverlayTimer = setTimeout(() => { try { overlay.style.opacity = '0'; } catch (e) {} }, 900);
      return overlay;
    } catch (e) { return null; }
  }

  // Highlighting functions (A-Frame removed) — use Pannellum yaw and transient overlay
  function highlightSceneElement(elementId, fallbackYaw) {
    const yaw = (typeof fallbackYaw === 'number') ? fallbackYaw : null;
    if (yaw !== null && typeof window.panSetYaw === 'function') {
      window.panSetYaw(yaw);
    }
    _createTransientOverlay('Hotspot highlighted');
  }

  function clearSceneHighlight() {
    try {
      const container = document.getElementById('library-panorama');
      if (container) {
        const overlay = container.querySelector('.pano-transient-overlay');
        if (overlay) overlay.style.opacity = '0';
      }
    } catch (e) {}
  }

  function highlightSceneElementWithRetry(elementId, fallbackYaw) {
    highlightSceneElement(elementId, fallbackYaw);
  }

  // Utility: announce to aria-live region
  function announce(msg) {
    const live = document.getElementById('siteAnnouncement');
    if (!live) return;
    live.textContent = '';
    setTimeout(() => { live.textContent = msg; }, 50);
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
    const exitStaticBtn = document.getElementById('exitStaticBtn');

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

      releaseFocus();
      trapFocus(modal);
      announce(`${title} opened`);

      if (modal._escHandler) document.removeEventListener('keydown', modal._escHandler);
      const escHandler = function (e) { if (e.key === 'Escape') closeParchment(); };
      document.addEventListener('keydown', escHandler);
      modal._escHandler = escHandler;
    }

    function closeParchment() {
      modal.classList.remove('modal-active');
      modal.setAttribute('aria-hidden', 'true');
      restoreBodyScroll();
      releaseFocus();
      
      if (modal._escHandler) {
        document.removeEventListener('keydown', modal._escHandler);
        modal._escHandler = null;
      }
      
      announce('Modal closed');
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
      }
      clearSceneHighlight();
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeParchment);
    }

    // Render logic for items inside card catalog
    function renderCatalogItems(items) {
      resultsContainer.innerHTML = '';
      if (items.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No catalog matches found.</p>';
        return;
      }

      items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'catalog-card';
        itemEl.setAttribute('role', 'button');
        itemEl.setAttribute('tabindex', '0');
        
        itemEl.innerHTML = `
          <span class="cc-num">${item.dewey}</span>
          <strong class="cc-title">${item.title}</strong>
          <span class="cc-author">By ${item.author}</span>
          <span class="poster-tag">${item.genre}</span>
        `;

        const triggerAction = () => {
          highlightSceneElementWithRetry(item.elementId, item.cameraYRotation);
          openParchment(item.title, `${item.summary}\n\nLocation Class: ${item.genre} (Dewey: ${item.dewey})`);
        };

        itemEl.addEventListener('click', triggerAction);
        itemEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerAction();
          }
        });

        resultsContainer.appendChild(itemEl);
      });
    }

    // Debounced search logic
    const performSearch = debounce(() => {
      const query = searchInput.value.toLowerCase().trim();
      if (!query) {
        renderCatalogItems(libraryMasterCatalog);
        return;
      }

const matchingItems = libraryMasterCatalog.filter(item =>item.title.toLowerCase().includes(query) ||item.author.toLowerCase().includes(query) ||item.genre.toLowerCase().includes(query) ||item.dewey.includes(query));renderCatalogItems(matchingItems);announce(${matchingItems.length} records filtered);}, 250);searchInput.addEventListener('input', performSearch);// Run initial catalog render setuprenderCatalogItems(libraryMasterCatalog);// Connect global interface layout controllerwindow.setStaticMode = function (isStatic) {if (isStatic) {document.body.classList.add('static-layout-enabled');document.body.classList.remove('interactive-layout-enabled');if (cardCatalog) cardCatalog.setAttribute('aria-hidden', 'true');announce('Switched to basic reading layout');} else {document.body.classList.remove('static-layout-enabled');document.body.classList.add('interactive-layout-enabled');if (cardCatalog) cardCatalog.setAttribute('aria-hidden', 'false');announce('Switched to immersive panorama workspace');}};});})();
