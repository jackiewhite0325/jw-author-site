/*
============================================================================
1. Pannellum Core Immersive Study Constructor
============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  // Detect mobile/touch configuration states
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Initialize the third-party panorama viewer layout element
  window.roomViewer = pannellum.viewer('panorama-container', {
    "type": "equirectangular",
    "panorama": "images/site/victorian_library_360.jpg", // Master 360 graphic asset link
    "autoLoad": true,
    "compass": false,
    "mouseZoom": false, // Prevents mobile touch screen viewport scroll pinching interference
    "draggable": true,
    "touchPanSpeed": 1.2, // Optimizes finger sweeping speeds on mobile touch targets
    "hotSpots": [
      { "pitch": -3.5, "yaw": -52.0, "type": "info", "text": "Fiction Catalog", "URL": "fiction.html" },
      { "pitch": -16.5, "yaw": -125.0, "type": "info", "text": "Children's Corner", "URL": "children.html" },
      { "pitch": -6.0, "yaw": 58.5, "type": "info", "text": "Health & Wellness Room", "URL": "health-wellness.html" },
      { "pitch": -14.5, "yaw": -1.5, "type": "info", "text": "The Librarian's Desk Blog", "URL": "blog.html" }
    ]
  });

  /*
  ============================================================================
  2. Live Compass Horizon Sweep Tracking Events
  ============================================================================ */
  window.roomViewer.on('animatefinished', () => {
    const currentYaw = window.roomViewer.getYaw();
    // Safely pipe yaw telemetry variables straight to catalog.js helper routines
    if (typeof updateCompassGuides === 'function') {
      updateCompassGuides(currentYaw);
    }
  });

  // Check orientation during active drag sweeps
  container.addEventListener('pointermove', () => {
    if (window.roomViewer && typeof window.roomViewer.getYaw === 'function') {
      const liveYaw = window.roomViewer.getYaw();
      if (typeof updateCompassGuides === 'function') {
        updateCompassGuides(liveYaw);
      }
    }
  });
});

/*
============================================================================
3. Dynamic Resolution Fail-Safe Monitors
============================================================================ */
window.addEventListener('resize', () => {
  if (window.roomViewer && typeof window.roomViewer.resize === 'function') {
    // Triggers canvas element recalibrations instantly when window sizes shift
    window.roomViewer.resize();
  }
});
