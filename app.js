/* ============================================================================
1. State Management & 3-Second Redirect Watchdog
============================================================================ */
let libraryViewerLoadedSuccessfully = false;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('panorama-container');
  if (!container) return; 

  // WATCHDOG TIMER: If panorama canvas drops or hangs for 3 seconds, escape to home.html
  const redirectWatchdogTimer = setTimeout(() => {
    if (!libraryViewerLoadedSuccessfully) {
      console.warn("Viewer load threshold exceeded. Escaping to static environment.");
      window.location.href = 'home.html'; // Triggers clean alternative layout path
    }
  }, 3000); 

  try {
    /* ============================================================================
    2. Immersive Study Object Instantiation
    ============================================================================ */
    window.roomViewer = pannellum.viewer('panorama-container', {
      "type": "equirectangular",
      "panorama": "images/site/victorian_library_360.jpg",
      "autoLoad": true,
      "compass": false,
      "mouseZoom": false,
      "draggable": true,
      "touchPanSpeed": 1.2,
      "hotSpots": [
        { "pitch": -3.5, "yaw": -52.0, "type": "info", "text": "Fiction Catalog", "URL": "fiction.html" },
        { "pitch": -16.5, "yaw": -125.0, "type": "info", "text": "Children's Corner", "URL": "children.html" },
        { "pitch": -6.0, "yaw": 58.5, "type": "info", "text": "Health & Wellness Room", "URL": "health-wellness.html" },
        { "pitch": -14.5, "yaw": -1.5, "type": "info", "text": "The Librarian's Desk Blog", "URL": "blog.html" }
      ]
    }); 

    // Clear watchdog timer once resource rendering maps successfully
    window.roomViewer.on('load', () => {
      libraryViewerLoadedSuccessfully = true;
      clearTimeout(redirectWatchdogTimer);
    });

    /* ============================================================================
    3. Horizon Sweep Tracking Events
    ============================================================================ */
    window.roomViewer.on('animatefinished', () => {
      const currentYaw = window.roomViewer.getYaw();
      if (typeof updateCompassGuides === 'function') {
        updateCompassGuides(currentYaw);
      }
    });

    container.addEventListener('pointermove', () => {
      if (window.roomViewer && typeof window.roomViewer.getYaw === 'function') {
        const liveYaw = window.roomViewer.getYaw();
        if (typeof updateCompassGuides === 'function') {
          updateCompassGuides(liveYaw);
        }
      }
    });

  } catch (error) {
    console.error("Critical WebGL layout context drop:", error);
    clearTimeout(redirectWatchdogTimer);
    window.location.href = 'home.html';
  }
}); 

window.addEventListener('resize', () => {
  if (window.roomViewer && typeof window.roomViewer.resize === 'function') {
    window.roomViewer.resize();
  }
}); /* ============================================================================
4. Interactive Initialization & Dropdown Matrix
============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('catalog-search-select');
  const staticList = document.getElementById('static-list');
  const drawer = document.getElementById('card-catalog-drawer');
  const toggleBtn = document.getElementById('catalog-toggle-btn');

  // Populate Dropdown Selection List and the Static Fallback System
  if (typeof libraryMasterCatalog !== 'undefined') {
    libraryMasterCatalog.forEach(book => {
      // 1. Build Interactive Drawer Elements
      const opt = document.createElement('option');
      opt.value = book.id;
      opt.textContent = book.title;
      if (dropdown) dropdown.appendChild(opt); 

      // 2. Build Accessible Fallback Directory Link Paths
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#book-anchor-${book.id}`;
      a.textContent = book.title;
      a.style.borderLeft = `5px solid ${book.spineColor}`;
      li.appendChild(a);
      if (staticList) staticList.appendChild(li);
    });
  } 

  // Wire Dropdown Routing Event Engine
  if (dropdown) {
    dropdown.addEventListener('change', (e) => {
      if (e.target.value && typeof selectBook === 'function') {
        selectBook(e.target.value);
      }
    });
  } 

  // Handle Sliding Card Catalog Open/Close States
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const isMinimized = drawer.classList.toggle('minimized');
      toggleBtn.textContent = isMinimized ? '＋' : '－';
      toggleBtn.setAttribute('aria-label', isMinimized ? 'Expand catalog window' : 'Minimize catalog window');
    });
  }
}); 

/* ============================================================================
5. RPG Radar Compass Guide Engine
============================================================================ */
function updateCompassGuides(currentYaw) {
  const leftArrow = document.getElementById('guide-arrow-left');
  const rightArrow = document.getElementById('guide-arrow-right');
  if (!leftArrow || !rightArrow) return;

  // Track if off-screen points of interest sit outside standard viewport cones
  const targetYaw = -52.0;
  const delta = targetYaw - currentYaw; 

  // Normalized Boundary Sweeping
  if (delta > 30) {
    leftArrow.style.display = 'block';
    rightArrow.style.display = 'none';
  } else if (delta < -30) {
    leftArrow.style.display = 'none';
    rightArrow.style.display = 'block';
  } else {
    leftArrow.style.display = 'none';
    rightArrow.style.display = 'none';
  }
} 

/* ============================================================================
6. Animation Lifecycle Completion Layers
============================================================================ */
function closeActiveBook(callback) {
  const toast = document.getElementById('invitation-toast') || document.getElementById('library-status-toast');
  if (toast) {
    toast.style.display = 'none';
    toast.setAttribute('aria-hidden', 'true');
  }

  // Mimic basic book fold timing delay before invoking new sequence routines
  setTimeout(() => {
    activeBookInstance = null;
    if (typeof callback === 'function') {
      callback();
    } else {
      isAnimationSequenceRunning = false;
    }
  }, 250);
} 

function executeBookOpenSequence(bookData) {
  isAnimationSequenceRunning = true;
  activeBookInstance = bookData; 

  // Fire Visual Toast Layer Alert Tracking System
  const toast = document.getElementById('invitation-toast') || document.getElementById('library-status-toast');
  if (toast) {
    toast.textContent = `Opened: ${bookData.title} (Dewey: ${bookData.dewey})`;
    toast.style.display = 'block';
    toast.setAttribute('aria-hidden', 'false');
  } 

  // Free interactive frame execution locks
  setTimeout(() => {
    isAnimationSequenceRunning = false;
  }, 600);
}


