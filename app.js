/*
============================================================================
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
    /*
    ============================================================================
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

    /*
    ============================================================================
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
});
