/**
 * shelves.js
 * ------------------------------------------------------------------
 * Sigil and Scribe, LLC — Bookshelf / spine component.
 *
 * Fully self-mounting: builds its own DOM into one empty container.
 * Reads the same window.SIGIL_CATALOG data as catalog.js.
 *
 * REQUIRES (load in this order, before this file):
 *   1. catalog-data.js   → defines window.SIGIL_CATALOG
 *   2. shelves.css
 *   3. catalog.js         → OPTIONAL but recommended. If present,
 *      clicking a spine opens the shared book-detail modal via
 *      SigilCatalog.openById(). If catalog.js is NOT loaded, spine
 *      clicks fire a `sigil:openBook` custom event on `document`
 *      instead, so you can wire your own detail view.
 *   4. Google Fonts: Playfair Display, Inter, Courier Prime
 *
 * USAGE:
 *   <div id="sigil-shelves"></div>
 *   <script src="catalog-data.js"></script>
 *   <link rel="stylesheet" href="shelves.css">
 *   <script src="catalog.js"></script>   (optional, see above)
 *   <script src="shelves.js"></script>
 *   <script>
 *     SigilShelves.init('sigil-shelves');
 *   </script>
 *
 * SYNCING WITH THE CATALOG:
 *   Pass onBeforeOpen to SigilCatalog.init() so a catalog click
 *   highlights the matching spine before the shared modal opens:
 *
 *     SigilCatalog.init('sigil-catalog', {
 *       onBeforeOpen: function (book) { SigilShelves.highlight(book.id); }
 *     });
 *
 * NOTE ON FICTION:
 *   The Fiction section renders its own "coming soon" empty state
 *   whenever no books exist with section === "fiction". Do not
 *   fabricate placeholder book entries in catalog-data.js to fill it.
 *
 * NOTE ON THE TOOLBOX WING:
 *   Rendered with a dashed "rope" divider and a note that a library
 *   card is required, per canon. This component does not gate
 *   clicks itself — same as catalog.js, it fires `sigil:requireLogin`
 *   on `document` if catalog.js's shared modal handles the click.
 * ------------------------------------------------------------------
 */

(function () {
  "use strict";

  var DATA = window.SIGIL_CATALOG || { books: [] };

  var SECTIONS = [
    { key: "children", label: "Children's Books", callRange: "100s", cls: "sc-children" },
    { key: "wellness", label: "Health & Wellness", callRange: "200s", cls: "sc-wellness" },
    { key: "more", label: "More Books", callRange: "300s", cls: "sc-more" },
    { key: "fiction", label: "Fiction", callRange: "400s", cls: null, emptyNote: "New stories are on the way, from more than one author." }
  ];

  var spineRefs = {}; // book id -> spine DOM element, for highlight()

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function groupBySection(books) {
    var out = {};
    books.forEach(function (b) {
      if (!out[b.section]) out[b.section] = [];
      out[b.section].push(b);
    });
    return out;
  }

  function variantClass(i, sectionKey) {
    var v = i % 3;
    if (sectionKey === "children" || sectionKey === "wellness") return v === 1 ? " sc-v2" : "";
    if (sectionKey === "more") return v === 1 ? " sc-v2" : (v === 2 ? " sc-v3" : "");
    if (sectionKey === "toolbox") return v === 1 ? " sc-v2" : "";
    return "";
  }

  function handleSpineClick(book) {
    if (window.SigilCatalog && typeof window.SigilCatalog.openById === "function") {
      window.SigilCatalog.openById(book.id);
    } else {
      document.dispatchEvent(new CustomEvent("sigil:openBook", { detail: book }));
    }
  }

  function makeSpine(book, i, sectionKey) {
    var kindCls = sectionKey === "toolbox"
      ? (book.kind === "module" ? "sc-module" : "sc-tool")
      : ("sc-" + sectionKey);
    var btn = el("button", "sc-spine " + kindCls + variantClass(i, sectionKey));
    btn.type = "button";
    var authorHtml = book.author !== "Toolbox" ? '<span class="sc-sauthor">' + book.author + "</span>" : "";
    btn.innerHTML =
      '<span class="sc-stitle">' + book.title + (book.comingSoon ? " ✦" : "") + "</span>" +
      authorHtml +
      '<span class="sc-call">' + book.call + "</span>";
    btn.addEventListener("click", function () { handleSpineClick(book); });
    spineRefs[book.id] = btn;
    return btn;
  }

  function renderShelf(sectionMeta, books) {
    var section = el("section");
    var label = el("div", "sc-section-label",
      "<h2>" + sectionMeta.label + "</h2><span>" + sectionMeta.callRange + "</span>");
    section.appendChild(label);

    if (books.length === 0 && sectionMeta.emptyNote) {
      var emptyShelf = el("div", "sc-shelf sc-empty");
      emptyShelf.appendChild(el("div", "sc-shelf-board"));
      emptyShelf.appendChild(el("div", "sc-empty-note", sectionMeta.emptyNote));
      section.appendChild(emptyShelf);
      return section;
    }

    var shelf = el("div", "sc-shelf");
    shelf.appendChild(el("div", "sc-shelf-board"));
    books.forEach(function (b, i) {
      shelf.appendChild(makeSpine(b, i, sectionMeta.key));
    });
    section.appendChild(shelf);
    return section;
  }

  function renderToolboxWing(books) {
    var section = el("section", "sc-toolbox-wing");
    section.appendChild(el("div", "sc-rope"));
    var label = el("div", "sc-section-label",
      "<h2>The Writer's Toolbox</h2><span>500s · library card required</span>");
    section.appendChild(label);
    section.appendChild(el("div", "sc-toolbox-note", "Browse freely — you'll only need your card to open one."));

    var shelf = el("div", "sc-shelf");
    shelf.appendChild(el("div", "sc-shelf-board"));
    books.forEach(function (b, i) {
      shelf.appendChild(makeSpine(b, i, "toolbox"));
    });
    section.appendChild(shelf);
    return section;
  }

  function render(container) {
    container.innerHTML = "";
    container.className = "sc-shelves-root";
    spineRefs = {};

    var grouped = groupBySection(DATA.books || []);

    SECTIONS.forEach(function (sectionMeta) {
      container.appendChild(renderShelf(sectionMeta, grouped[sectionMeta.key] || []));
    });

    container.appendChild(renderToolboxWing(grouped.toolbox || []));
  }

  window.SigilShelves = {
    /**
     * Mount the shelves into a container element.
     * @param {string} containerId - id of an empty element already in the DOM
     */
    init: function (containerId) {
      var container = document.getElementById(containerId);
      if (!container) {
        console.error("SigilShelves.init: no element found with id \"" + containerId + "\"");
        return;
      }
      render(container);
    },

    /** Re-render with fresh state (e.g. after data changes at runtime). */
    refresh: function (containerId) {
      var container = document.getElementById(containerId);
      if (container) render(container);
    },

    /**
     * Scroll to and visually highlight the spine matching this book id.
     * Intended to be called from catalog.js's onBeforeOpen hook.
     */
    highlight: function (id) {
      Object.keys(spineRefs).forEach(function (key) {
        spineRefs[key].classList.remove("sc-highlight");
      });
      var target = spineRefs[id];
      if (target) {
        target.classList.add("sc-highlight");
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };
})();
