/**
 * catalog.js
 * ------------------------------------------------------------------
 * Sigil and Scribe, LLC — Card Catalog component.
 *
 * Fully self-mounting: this file builds its own DOM. It does not
 * require any pre-existing markup beyond a single empty container
 * element to attach to.
 *
 * REQUIRES (load in this order, before this file):
 *   1. catalog-data.js   → defines window.SIGIL_CATALOG
 *   2. catalog.css        → visual styles
 *   3. Google Fonts: Playfair Display, Inter, Courier Prime
 *      (or swap the font-family values in catalog.css)
 *
 * USAGE:
 *   <div id="sigil-catalog"></div>
 *   <script src="catalog-data.js"></script>
 *   <link rel="stylesheet" href="catalog.css">
 *   <script src="catalog.js"></script>
 *   <script>
 *     SigilCatalog.init('sigil-catalog', {
 *       // optional: called instead of the built-in modal when a book
 *       // is opened, e.g. to highlight a matching spine on a shelf
 *       // elsewhere on the page before showing the modal.
 *       onBeforeOpen: function(book) { ... }
 *     });
 *   </script>
 *
 * WHAT THIS COMPONENT DOES:
 *   - Renders a search box + author filter chips + genre "drawers"
 *     (Children's Books, Health & Wellness, More Books, Writer's Toolbox)
 *   - Renders the "Nineteen Days" reserved card separately, above the
 *     drawers, per the sensitive-content handling rules in the
 *     project handoff doc (Section 10) — no call number, no cover,
 *     no shelf placement, description text only.
 *   - Opens a book detail modal on click, with purchase links for
 *     books or a "sign in required" state for Toolbox tools/modules.
 *
 * WHAT THIS COMPONENT DOES NOT DO:
 *   - It does not implement the bookshelf/spine visuals — that's a
 *     separate component. If a shelf component exists elsewhere on
 *     the page, use the onBeforeOpen hook (see above) to sync them
 *     by book `id`.
 *   - It does not implement authentication. The "Open this tool"
 *     button on Toolbox items fires a `sigil:requireLogin` custom
 *     event on `document` with the book object as `event.detail` —
 *     wire your real auth flow to listen for that event.
 * ------------------------------------------------------------------
 */

(function () {
  "use strict";

  var DATA = window.SIGIL_CATALOG || { books: [], reserved: [] };

  var SECTION_LABELS = {
    children: "Children's Books · 100s",
    wellness: "Health & Wellness · 200s",
    more: "More Books · 300s",
    toolbox: "Writer's Toolbox · 500s"
    // "fiction" intentionally omitted — empty section, no drawer needed
    // until real content exists. Add it here once books are shelved.
  };

  var AUTHOR_FILTERS = [
    { key: "all", label: "All authors" },
    { key: "jw", label: "J. White" },
    { key: "petra", label: "Petra" },
    { key: "toolbox", label: "Toolbox" }
  ];

  var state = {
    search: "",
    author: "all",
    container: null,
    onBeforeOpen: null
  };

  function groupBySection(books) {
    var out = {};
    books.forEach(function (b) {
      if (!out[b.section]) out[b.section] = [];
      out[b.section].push(b);
    });
    return out;
  }

  function matchesSearch(book, term) {
    if (!term) return true;
    var haystack = (
      book.title + " " + book.author + " " + (book.tagline || "") + " " + (book.description || "")
    ).toLowerCase();
    return haystack.indexOf(term) !== -1;
  }

  function matchesAuthor(book, authorKey) {
    if (authorKey === "all") return true;
    return book.authorKey === authorKey;
  }

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  // ---------------- Rendering ----------------

  function render() {
    var root = state.container;
    root.innerHTML = "";
    root.className = "sc-catalog";

    var box = el("div", "sc-catalog-box");
    box.appendChild(el("div", "sc-catalog-title", "Card Catalog"));
    box.appendChild(el("div", "sc-catalog-sub", "searchable by title, author, or genre"));

    // Search input
    var search = el("input", "sc-catalog-search");
    search.type = "text";
    search.placeholder = "Search the shelves…";
    search.value = state.search;
    search.addEventListener("input", function (e) {
      state.search = e.target.value.trim().toLowerCase();
      renderResults(resultsWrap);
    });
    box.appendChild(search);

    // Author filter chips
    var filterRow = el("div", "sc-filter-row");
    AUTHOR_FILTERS.forEach(function (opt) {
      var chip = el("button", "sc-filter-chip" + (opt.key === state.author ? " active" : ""), opt.label);
      chip.type = "button";
      chip.addEventListener("click", function () {
        state.author = opt.key;
        render();
      });
      filterRow.appendChild(chip);
    });
    box.appendChild(filterRow);

    var resultsWrap = el("div", "sc-drawers");
    box.appendChild(resultsWrap);
    root.appendChild(box);

    renderResults(resultsWrap);
    ensureModal();
  }

  function renderResults(resultsWrap) {
    resultsWrap.innerHTML = "";
    var term = state.search;
    var author = state.author;

    // Reserved card(s) — shown above drawers, only when matching filters
    (DATA.reserved || []).forEach(function (r) {
      var authorOk = author === "all" || r.authorKey === author || (author === "petra" && r.author.toLowerCase().indexOf("petra") !== -1);
      var searchOk = !term || (r.title + " " + r.description).toLowerCase().indexOf(term) !== -1;
      if (authorOk && searchOk) {
        var card = el("div", "sc-catalog-card reserved",
          '<span class="sc-cc-num">— reserved —</span>' +
          '<span class="sc-cc-title">' + r.title + '</span>' +
          '<span class="sc-cc-author">' + r.author + ' · coming soon</span>' +
          r.tagline
        );
        card.tabIndex = 0;
        card.addEventListener("click", function () { openReserved(r); });
        card.addEventListener("keypress", function (e) { if (e.key === "Enter") openReserved(r); });
        resultsWrap.appendChild(card);
      }
    });

    var grouped = groupBySection(DATA.books || []);

    Object.keys(SECTION_LABELS).forEach(function (sectionKey, idx) {
      var items = (grouped[sectionKey] || []).filter(function (b) {
        return matchesAuthor(b, author) && matchesSearch(b, term);
      });

      var drawer = el("div", "sc-drawer" + ((term || author !== "all") && items.length ? " open" : (idx === 0 ? " open" : "")));
      var handle = el("button", "sc-drawer-handle",
        "<span>" + SECTION_LABELS[sectionKey] + "</span><span class=\"sc-pull\"></span>");
      handle.type = "button";
      handle.addEventListener("click", function () { drawer.classList.toggle("open"); });
      drawer.appendChild(handle);

      var cardsWrap = el("div", "sc-drawer-cards");
      if (items.length === 0) {
        cardsWrap.appendChild(el("div", "sc-catalog-empty", "No cards match here."));
      }
      items.forEach(function (b) {
        var authorLine = b.author !== "Toolbox" ? '<span class="sc-cc-author">' + b.author + "</span>" : "";
        var card = el("div", "sc-catalog-card",
          '<span class="sc-cc-num">' + b.call + '</span>' +
          '<span class="sc-cc-title">' + b.title + '</span>' +
          authorLine + (b.tagline || "")
        );
        card.tabIndex = 0;
        card.addEventListener("click", function () { openBook(b); });
        card.addEventListener("keypress", function (e) { if (e.key === "Enter") openBook(b); });
        cardsWrap.appendChild(card);
      });
      drawer.appendChild(cardsWrap);
      resultsWrap.appendChild(drawer);
    });
  }

  // ---------------- Book detail modal ----------------

  var overlayEl, bpCall, bpAuthor, bpTitle, bpTagline, bpDesc, bpNote, bpActions;

  function ensureModal() {
    if (document.getElementById("sc-overlay")) return;

    overlayEl = el("div", "sc-overlay");
    overlayEl.id = "sc-overlay";
    var page = el("div", "sc-book-page");
    var closeBtn = el("button", "sc-close-x", "✕");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("click", closeModal);

    var headLine = el("div", "", "");
    bpCall = el("span", "sc-bp-call", "");
    bpAuthor = el("span", "sc-bp-author", "");
    headLine.appendChild(bpCall);
    headLine.appendChild(bpAuthor);

    bpTitle = el("h2", "", "");
    bpTagline = el("p", "sc-bp-tagline", "");
    bpDesc = el("p", "sc-bp-desc", "");
    bpNote = el("div", "", "");
    bpActions = el("div", "sc-bp-actions", "");

    page.appendChild(closeBtn);
    page.appendChild(headLine);
    page.appendChild(bpTitle);
    page.appendChild(bpTagline);
    page.appendChild(bpDesc);
    page.appendChild(bpNote);
    page.appendChild(bpActions);
    overlayEl.appendChild(page);
    document.body.appendChild(overlayEl);

    overlayEl.addEventListener("click", function (e) {
      if (e.target === overlayEl) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  function closeModal() {
    if (overlayEl) overlayEl.classList.remove("show");
  }

  function openBook(book) {
    if (typeof state.onBeforeOpen === "function") {
      state.onBeforeOpen(book);
    }
    bpCall.textContent = "Call No. " + book.call;
    bpAuthor.textContent = book.author !== "Toolbox" ? "· " + book.author : "";
    bpTitle.textContent = book.title;
    bpTagline.textContent = book.tagline || "";
    bpDesc.textContent = book.description || "";
    bpNote.innerHTML = "";
    bpActions.innerHTML = "";

    if (book.kind === "tool" || book.kind === "module") {
      var beginBtn = el("button", "sc-btn sc-btn-primary", "Open this tool");
      beginBtn.type = "button";
      beginBtn.addEventListener("click", function () {
        closeModal();
        document.dispatchEvent(new CustomEvent("sigil:requireLogin", { detail: book }));
      });
      bpActions.appendChild(beginBtn);
    } else if (book.links && book.links.length) {
      book.links.forEach(function (l) {
        var a = el("a", "sc-btn sc-btn-primary", l.label);
        a.href = l.url;
        a.target = "_blank";
        a.rel = "noopener";
        bpActions.appendChild(a);
      });
    } else if (book.comingSoon) {
      bpNote.appendChild(el("div", "sc-reserved-note", "This one isn't published yet — check back as the series grows."));
    }

    var closeBtn2 = el("button", "sc-btn sc-btn-secondary", "Back to the shelf");
    closeBtn2.type = "button";
    closeBtn2.addEventListener("click", closeModal);
    bpActions.appendChild(closeBtn2);

    overlayEl.classList.add("show");
  }

  function openReserved(reserved) {
    bpCall.textContent = "Reserved";
    bpAuthor.textContent = "· " + reserved.author;
    bpTitle.textContent = reserved.title;
    bpTagline.textContent = reserved.tagline;
    bpDesc.textContent = reserved.description;
    bpNote.innerHTML = "";
    bpNote.appendChild(el("div", "sc-reserved-note", reserved.note));
    bpActions.innerHTML = "";
    var closeBtn2 = el("button", "sc-btn sc-btn-secondary", "Back to the shelf");
    closeBtn2.type = "button";
    closeBtn2.addEventListener("click", closeModal);
    bpActions.appendChild(closeBtn2);
    overlayEl.classList.add("show");
  }

  // ---------------- Public API ----------------

  window.SigilCatalog = {
    /**
     * Mount the catalog into a container element.
     * @param {string} containerId - id of an empty element already in the DOM
     * @param {object} [options]
     * @param {function} [options.onBeforeOpen] - called with the book object
     *   right before the detail modal opens (e.g. to highlight a shelf spine)
     */
    init: function (containerId, options) {
      var container = document.getElementById(containerId);
      if (!container) {
        console.error("SigilCatalog.init: no element found with id \"" + containerId + "\"");
        return;
      }
      options = options || {};
      state.container = container;
      state.onBeforeOpen = options.onBeforeOpen || null;
      render();
    },

    /** Re-render with fresh state (e.g. after data changes at runtime). */
    refresh: function () {
      if (state.container) render();
    },

    /** Programmatically open a book/tool by its `id` from catalog-data.js. */
    openById: function (id) {
      var book = (DATA.books || []).find(function (b) { return b.id === id; });
      if (book) { ensureModal(); openBook(book); }
    }
  };
})();
