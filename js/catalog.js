/**
 * catalog.js (Refactored 3D Modal & Interactive Transition Engine)
 * ------------------------------------------------------------------
 * Sigil and Scribe, LLC — Dynamic Presentation and Card Catalog.
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
    onBeforeOpen: null,
    activeShelfWrapper: null // Tracks the shelf item element to reset its position later
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

  // ---------------- Rendering 2D Catalog Elements ----------------

  function render() {
    var root = state.container;
    if (!root) return;
    root.innerHTML = "";
    root.className = "sc-catalog";

    var box = el("div", "sc-catalog-box");
    box.appendChild(el("div", "sc-catalog-title", "Card Catalog"));
    box.appendChild(el("div", "sc-catalog-sub", "searchable by title, author, or genre"));

    var search = el("input", "sc-catalog-search");
    search.type = "text";
    search.placeholder = "Search the shelves…";
    search.value = state.search;
    search.addEventListener("input", function (e) {
      state.search = e.target.value.trim().toLowerCase();
      renderResults(resultsWrap);
    });
    box.appendChild(search);

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
        var callCode = b.deweyCall || b.call || "100.0";
        var card = el("div", "sc-catalog-card",
          '<span class="sc-cc-num">' + callCode + '</span>' +
          '<span class="sc-cc-title">' + b.title + '</span>' +
          authorLine + (b.tagline || "")
        );
        card.tabIndex = 0;
        card.addEventListener("click", function () { openBookFromCatalog(b); });
        card.addEventListener("keypress", function (e) { if (e.key === "Enter") openBookFromCatalog(b); });
        cardsWrap.appendChild(card);
      });
      drawer.appendChild(cardsWrap);
      resultsWrap.appendChild(drawer);
    });
  }

  // ---------------- 3D Immersive Modal Pipeline ----------------

  var overlayEl, bookContainer3D, bpCall, bpAuthor, bpTitle, bpTagline, bpDesc, bpNote, bpActions;

  function ensureModal() {
    if (document.getElementById("sc-overlay")) return;

    overlayEl = el("div", "sc-overlay");
    overlayEl.id = "sc-overlay";

    // Layout configuration containing both mesh object and text sheets
    bookContainer3D = el("div", "sc-overlay-book-container");

    // Dynamic 3D Structural Mesh Blueprint
    var structuralMesh = el("div", "sc-modal-book-3d");
    structuralMesh.innerHTML = 
      '<div class="sc-modal-cover-3d" id="sc-modal-mcover">' +
        '<div class="sc-modal-cover-title" id="sc-mcover-title"></div>' +
        '<div class="sc-modal-cover-author" id="sc-mcover-author"></div>' +
      '</div>' +
      '<div class="sc-modal-pages-3d"></div>';

    var page = el("div", "sc-book-page");
    var closeBtn = el("button", "sc-close-x", "✕");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("click", closeModal);

    // Meta Fields Initialization
    bpCall = el("span", "sc-bp-call");
    bpAuthor = el("span", "sc-bp-author");
    bpTitle = el("h2");
    bpTagline = el("p", "sc-bp-tagline");
    bpDesc = el("div", "sc-bp-desc");
    bpNote = el("div", "sc-reserved-note");
    bpActions = el("div", "sc-bp-actions");

    page.appendChild(closeBtn);
    page.appendChild(bpCall);
    page.appendChild(bpAuthor);
    page.appendChild(bpTitle);
    page.appendChild(bpTagline);
    page.appendChild(bpDesc);
    page.appendChild(bpNote);
    page.appendChild(bpActions);

    bookContainer3D.appendChild(structuralMesh);
    bookContainer3D.appendChild(page);
    overlayEl.appendChild(bookContainer3D);
    document.body.appendChild(overlayEl);

    // Close when clicking empty background space
    overlayEl.addEventListener("click", function (e) {
      if (e.target === overlayEl) closeModal();
    });
  }

  /**
   * Pipeline controller triggered directly by shelves.js spine selection clicks
   */
  function open3DPreviewSequence(book, wrapperEl, targetNavUrl) {
    ensureModal();
    state.activeShelfWrapper = wrapperEl;

    // Reset layout attributes
    overlayEl.classList.remove("book-opened");
    document.getElementById("sc-modal-mcover").style.background = getComputedStyle(wrapperEl.querySelector('.sc-spine')).background;

    // Update cover and text nodes
    document.getElementById("sc-mcover-title").innerText = book.title;
    document.getElementById("sc-mcover-author").innerText = book.author || "";
    bpCall.innerText = book.deweyCall || book.call || "100.0";
    bpAuthor.innerText = book.author !== "Toolbox" ? "by " + book.author : "";
    bpTitle.innerText = book.title;
    bpTagline.innerText = book.tagline || "";
    bpDesc.innerHTML = book.description ? "<p>" + book.description + "</p>" : "";

    bpNote.style.display = "none";
    bpActions.innerHTML = "";

    // Build functional navigation pathways mapping to your repo's specific landing files
    if (book.comingSoon) {
      bpNote.innerText = "Coming soon — new items are added automatically as they are published.";
      bpNote.style.display = "block";
    } else {
      var primaryBtn = el("a", "sc-btn sc-btn-primary", "Open Book / Enter Tab");
      primaryBtn.href = targetNavUrl;
      
      // Immersive scaling effect on open transition
      primaryBtn.addEventListener("click", function(e) {
        e.preventDefault();
        bookContainer3D.style.transition = "transform 0.6s cubic-bezier(0.6, -0.28, 0.735, 0.045)";
        bookContainer3D.style.transform = "scale(4) translateZ(400px)";
        overlayEl.style.transition = "background 0.5s ease";
        overlayEl.style.background = "#FDFBF7";
        setTimeout(function() {
          window.location.href = targetNavUrl;
        }, 550);
      });

      bpActions.appendChild(primaryBtn);
    }

    var putBackBtn = el("button", "sc-btn sc-btn-secondary", "Put Back on Shelf");
    putBackBtn.type = "button";
    putBackBtn.addEventListener("click", closeModal);
    bpActions.appendChild(putBackBtn);

    // Make modal frame visible
    overlayEl.classList.add("show");

// Execute staged timing delays for fluid 3D movement sequencessetTimeout(function () {overlayEl.classList.add("book-opened");}, 150);}function openBookFromCatalog(book) {if (typeof state.onBeforeOpen === "function") {state.onBeforeOpen(book);}// Fallback URL router mapping configuration parametersvar fallbackUrls = {children: "html/children.html",wellness: "html/health-wellness.html",more: "html/more-books.html",fiction: "html/fiction.html"};var targetUrl = fallbackUrls[book.section] || book.toolUrl || "index.html";open3DPreviewSequence(book, null, targetUrl);}function openReserved(r) {ensureModal();bpCall.innerText = "— reserved —";bpAuthor.innerText = "by " + r.author;bpTitle.innerText = r.title;bpTagline.innerText = r.tagline || "";bpDesc.innerHTML = r.description ? "" + r.description + "" : "";bpNote.innerText = "This item is reserved for historical validation parameters.";bpNote.style.display = "block";bpActions.innerHTML = "";var closeBtn = el("button", "sc-btn sc-btn-secondary", "Close Record");closeBtn.addEventListener("click", closeModal);bpActions.appendChild(closeBtn);overlayEl.classList.add("show");}function closeModal() {if (!overlayEl) return;overlayEl.classList.remove("book-opened");setTimeout(function () {overlayEl.classList.remove("show");bookContainer3D.style.transform = "";bookContainer3D.style.transition = "";overlayEl.style.background = "";// Return selected shelf item cleanly back into its visual shelf alignment slotif (state.activeShelfWrapper) {state.activeShelfWrapper.classList.remove("sliding-out");state.activeShelfWrapper = null;}}, 400); // Syncs cleanly with CSS exit rotation parameters}
  // ---------------- Global Core API Access Module ----------------window.SigilCatalog = {init: function (containerId, options) {var opts = options || {};state.container = document.getElementById(containerId);if (typeof opts.onBeforeOpen === "function") state.onBeforeOpen = opts.onBeforeOpen;render();},openById: function (id) {var book = (DATA.books || []).find(function (b) { return b.id === id; });if (book) {openBookFromCatalog(book);} else {var res = (DATA.reserved || []).find(function (r) { return r.id === id; });if (res) openReserved(res);}},open3DPreview: open3DPreviewSequence};})();
