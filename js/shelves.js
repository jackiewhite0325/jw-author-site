/**
 * shelves.js (Refactored 3D Perspective Animation Engine)
 * ------------------------------------------------------------------
 * Sigil and Scribe, LLC — Visual 3D Bookcase Component.
 * ------------------------------------------------------------------
 */

(function () {
  "use strict";

  var DATA = window.SIGIL_CATALOG || { books: [] };

  // Explicitly matches your repository's real HTML files shown in the layout screenshot
  var SECTIONS = [
    { key: "children", label: "Children's Books", callRange: "100s", cls: "sc-children", url: "html/children.html" },
    { key: "wellness", label: "Health & Wellness", callRange: "200s", cls: "sc-wellness", url: "html/health-wellness.html" },
    { key: "more", label: "More Books", callRange: "300s", cls: "sc-more", url: "html/more-books.html" },
    { key: "fiction", label: "Fiction", callRange: "400s", cls: null, emptyNote: "New stories are on the way, from more than one author.", url: "html/fiction.html" }
  ];

  var spineRefs = {}; 

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

  /**
   * Triggers the interactive multi-stage 3D sliding out sequence
   */
  function handleSpineClick(book, wrapperEl) {
    // Stage 1: Slide forward out of the physical shelf rack geometry
    wrapperEl.classList.add("sliding-out");

    setTimeout(function () {
      if (window.SigilCatalog && typeof window.SigilCatalog.open3DPreview === "function") {
        // Find matching section navigation destination URL from map
        var sectionMeta = SECTIONS.find(function(s) { return s.key === book.section; });
        var targetedNavigationUrl = sectionMeta ? sectionMeta.url : (book.toolUrl || "index.html");

        // Pass book object, spatial element reference, and destination path to the shared preview window
        window.SigilCatalog.open3DPreview(book, wrapperEl, targetedNavigationUrl);
      } else {
        // Fallback custom fallback environment event mapping
        document.dispatchEvent(new CustomEvent("sigil:openBook", { detail: book }));
        wrapperEl.classList.remove("sliding-out");
      }
    }, 300); // Gives CSS slide transformation 300ms vector clearance
  }

  function makeSpine(book, i, sectionKey) {
    var kindCls = sectionKey === "toolbox"
      ? (book.kind === "module" ? "sc-module" : "sc-tool")
      : ("sc-" + sectionKey);
    
    // Create an explicit structural 3D animation container around the spine button element
    var wrapper = el("div", "sc-book-wrapper");
    var btn = el("button", "sc-spine " + kindCls + variantClass(i, sectionKey));
    btn.type = "button";
    
    var authorHtml = book.author !== "Toolbox" ? '<span class="sc-sauthor">' + book.author + "</span>" : "";
    
    // Fallback safely to compiled dynamic Dewey parameters if your dataset logic executes first
    var callDisplay = book.deweyCall || book.call || "100.0";

    btn.innerHTML =
      '<span class="sc-stitle">' + book.title + (book.comingSoon ? " ✦" : "") + "</span>" +
      authorHtml +
      '<span class="sc-call">' + callDisplay + '</span>';
    
    btn.addEventListener("click", function () { handleSpineClick(book, wrapper); });
    
    wrapper.appendChild(btn);
    spineRefs[book.id] = wrapper; // Reference wrapper container to enable dynamic scale-highlights
    return wrapper;
  }

  function renderShelf(sectionMeta, books) {
    var section = el("section", "sc-shelf-container");
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
    init: function (containerId) {
      var container = document.getElementById(containerId);
      if (!container) {
        console.error("SigilShelves.init: no element found with id \"" + containerId + "\"");
        return;
      }
      render(container);
    },

    refresh: function (containerId) {
      var container = document.getElementById(containerId);
      if (container) render(container);
    },

    highlight: function (id) {
      Object.keys(spineRefs).forEach(function (key) {
        spineRefs[key].classList.remove("sc-highlight");
      });
      var targetWrapper = spineRefs[id];
      if (targetWrapper) {
        var targetSpine = targetWrapper.querySelector(".sc-spine");
        if (targetSpine) {
          targetSpine.classList.add("sc-highlight");
          targetWrapper.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };
})();
