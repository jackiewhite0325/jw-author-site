/*
============================================================================
1. Immersive Study State Controls & Fail-Safe Watchdogs
============================================================================ */
let libraryViewerLoadedSuccessfully = false;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  // FAIL-SAFE WATCHDOG: If the WebGL engine freezes for more than 2.5 seconds, activate fallback lists
  const renderingWatchdogTimer = setTimeout(() => {
    if (!libraryViewerLoadedSuccessfully) {
      console.warn("Pannellum stalled or WebGL context dropped. Activating clean fallback directory.");
      activateMobileFallbackLayout();
    }
  }, 2500);

  try {
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

    // Mark loading sequence complete when the image finishes layout calculations
    window.roomViewer.on('load', () => {
      libraryViewerLoadedSuccessfully = true;
      clearTimeout(renderingWatchdogTimer);
    });

    /*
    ============================================================================
    2. Live Compass Horizon Sweep Tracking Events
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
    console.error("WebGL context instantiation crashed:", error);
    clearTimeout(renderingWatchdogTimer);
    activateMobileFallbackLayout();
  }
});

/*
============================================================================
3. Fallback Layout Generator Routines
============================================================================ */
function activateMobileFallbackLayout() {
  const fallbackBox = document.getElementById('static-fallback-grid');
  const listElement = document.getElementById('static-list');
  const mainViewport = document.getElementById('library-viewport-wrapper');

  if (fallbackBox && listElement && window.libraryMasterCatalog) {
    fallbackBox.style.display = 'block';
    listElement.innerHTML = ''; // Prevent text duplication

    window.libraryMasterCatalog.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${item.targetUrl}">[Dewey ${item.dewey}] ${item.elementId.replace(/_/g, ' ')} →</a>`;
      listElement.appendChild(li);
    });

    // Minimize or hide the locked viewer container frame gracefully to clear touch room
    if (mainViewport) {
      mainViewport.style.height = '120px';
    }
  }
}

window.addEventListener('resize', () => {
  if (window.roomViewer && typeof window.roomViewer.resize === 'function') {
    window.roomViewer.resize();
  }
});
