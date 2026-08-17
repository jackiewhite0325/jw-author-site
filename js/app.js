// Initialize Pannellum Immersive Workspace Frame
window.addEventListener('DOMContentLoaded', () => {
  // Ensure pannellum is available
  if (typeof pannellum === 'undefined') {
    console.warn('Pannellum not loaded; check CDN script include.');
    return;
  }

  // Allow enabling debug via URL param: ?hotspotDebug=1
  const urlParams = new URLSearchParams(window.location.search);
  const debugMode = urlParams.get('hotspotDebug') === '1' || urlParams.get('hotspotDebug') === 'true';

  const viewer = pannellum.viewer('library-panorama', {
    "type": "equirectangular",
    // Use the existing repo image path — change if you add a different 360 image
    "panorama": "./images/site/victorian_library_360.png",
    "autoLoad": true,
    "compass": false,
    "showControls": false,
    "mouseZoom": false,
    // Use URL param to enable debug without code edits
    "hotSpotDebug": !!debugMode,
    "hotSpots": [
      {
        "pitch": -5.2,
        "yaw": 24.5,
        "type": "url",
        "text": "Open 'I Finally Wrote It!' Canvas",
        "URL": "write/index.html"
      },
      {
        "pitch": 12.1,
        "yaw": -85.0,
        "type": "url",
        "text": "Open Story Compass Module",
        "URL": "write/compass/index.html"
      }
    ]
  });

  // expose viewer for other scripts (library-engine.js can call window.PAN_VIEWER)
  try { window.PAN_VIEWER = viewer; } catch (e) { /* ignore */ }

  // Helpful debug: click canvas to log current viewing angles
  const container = document.getElementById('library-panorama');
  if (container) {
    container.addEventListener('click', () => {
      try {
        const pitch = viewer.getPitch();
        const yaw = viewer.getYaw();
        console.log(`Pannellum click — Pitch: ${pitch.toFixed(2)}, Yaw: ${yaw.toFixed(2)}`);
      } catch (err) { /* ignore when viewer not ready */ }
    });
  }

  // small helper for library-engine to set yaw smoothly (if supported)
  window.panSetYaw = function (deg) {
    try {
      if (window.PAN_VIEWER && typeof window.PAN_VIEWER.setYaw === 'function') {
        window.PAN_VIEWER.setYaw(deg);
        return true;
      }
      // older pannellum versions may expose "setView"
      if (window.PAN_VIEWER && typeof window.PAN_VIEWER.setView === 'function') {
        window.PAN_VIEWER.setView({ yaw: deg });
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  };
});
