/*
============================================================================
1. Data Collection & Global State Engine
============================================================================ */
const libraryMasterCatalog = [
  { elementId: "i_finally_wrote_it", targetUrl: "fiction.html", shelfCoordinate: { pitch: -3.5, yaw: -52.0 }, dewey: "808.02" },
  { elementId: "partner_book_placeholder", targetUrl: "more-books.html", shelfCoordinate: { pitch: -8.2, yaw: -24.0 }, dewey: "813.6" },
  { elementId: "kids_corner_anchor", targetUrl: "children.html", shelfCoordinate: { pitch: -16.5, yaw: -125.0 }, dewey: "808.83" },
  { elementId: "meditation_space_anchor", targetUrl: "health-wellness.html", shelfCoordinate: { pitch: -6.0, yaw: 58.5 }, dewey: "158.12" },
  { elementId: "librarians_desk_papers", targetUrl: "about.html", shelfCoordinate: { pitch: -17.0, yaw: 14.5 }, dewey: "027.1" },
  { elementId: "librarians_desk_typewriter", targetUrl: "blog.html", shelfCoordinate: { pitch: -14.5, yaw: -1.5 }, dewey: "070.41" },
  { elementId: "muffins_memorial_portrait", targetUrl: "muffin-memorial.html", shelfCoordinate: { pitch: 13.0, yaw: -138.5 }, dewey: "636.7" },
  { elementId: "muffins_constellation_poster", targetUrl: "welcome.html", shelfCoordinate: { pitch: 11.5, yaw: 118.0 }, dewey: "523.8" }
];

let diagnosticTimer = null;
let roomViewer = null;
let isStaticModeActive = false;
let appRoomViewerRef = null;

/*
============================================================================
2. Device Initialization & Compass Logic
============================================================================ */
function initializeDeviceDefaults() {
  window.addEventListener('resize', () => {
    const activeViewer = window.roomViewer || appRoomViewerRef;
    if (activeViewer && typeof activeViewer.resize === 'function') {
      activeViewer.resize();
    }
  });

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const container = document.getElementById('panorama-container');
  if (container) {
    container.setAttribute('data-device-mode', isTouch ? 'touch' : 'desktop');
  }
}

function updateCompassGuides(yaw) {
  const leftArrow = document.getElementById('guide-arrow-left');
  const rightArrow = document.getElementById('guide-arrow-right');
  
  if (!leftArrow || !rightArrow) return;

  if (yaw > 20) {
    leftArrow.style.display = 'block';
    rightArrow.style.display = 'none';
  } else if (yaw < -20) {
    leftArrow.style.display = 'none';
    rightArrow.style.display = 'block';
  } else {
    leftArrow.style.display = 'none';
    rightArrow.style.display = 'none';
  }
}

/*
============================================================================
3. Card Catalog Populator & Selection Listeners
============================================================================ */
function initializeUIComponents() {
  const selectMenu = document.getElementById('catalog-search-select');
  if (!selectMenu) return;

  // Clear duplication windows safely
  selectMenu.innerHTML = '<option value="">-- Pull open a drawer --</option>';
  
  // Build drawer book targets programmatically into the UI dropdown node
  libraryMasterCatalog.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.targetUrl;
    opt.textContent = `Dewey ${item.dewey} : ${item.elementId.replace(/_/g, ' ')}`;
    selectMenu.appendChild(opt);
  });

  // Attach event routing listener actions
  selectMenu.addEventListener('change', (e) => {
    const selectedUrl = e.target.value;
    if (!selectedUrl) return;

    const item = libraryMasterCatalog.find(i => i.targetUrl === selectedUrl);
    if (item) {
      window.activeQuestTarget = item;
      const toast = document.getElementById('invitation-toast');
      if (toast) {
        toast.textContent = `Selected: [Dewey ${item.dewey}] Opening folder...`;
        toast.style.display = 'block';
      }
      
      // Auto-navigate or look at target safely if panorama view engine is accessible
      const viewer = window.roomViewer || appRoomViewerRef;
      if (viewer && typeof viewer.lookAt === 'function') {
        viewer.lookAt(item.shelfCoordinate.pitch, item.shelfCoordinate.yaw, 50, 2000, () => {
          window.location.href = selectedUrl;
        });
      } else {
        // Direct instant fallback navigation strategy for low-tier hardware nodes
        window.location.href = selectedUrl;
      }
    }
  });
}

function setupDrawerControls() {
  const toggleBtn = document.getElementById('catalog-toggle-btn');
  const drawerPanel = document.getElementById('card-catalog-drawer');
  
  if (toggleBtn && drawerPanel) {
    toggleBtn.addEventListener('click', () => {
      const isMinimized = drawerPanel.classList.contains('minimized');
      if (isMinimized) {
        drawerPanel.classList.remove('minimized');
        toggleBtn.setAttribute('aria-expanded', 'true');
      } else {
        drawerPanel.classList.add('minimized');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/*
============================================================================
4. Master Runtime Execution Pipeline
============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initializeDeviceDefaults();
  setupDrawerControls();
  initializeUIComponents(); // FIXED: Restored core UI data initialization mapping hook!

  // Safe reference query setup for third-party scripts
  setTimeout(() => {
    if (window.roomViewer) {
      appRoomViewerRef = window.roomViewer;
    }
  }, 1000);
});
