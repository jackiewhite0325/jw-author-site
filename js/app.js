// Initialize Pannellum Immersive Workspace Frame
window.addEventListener('DOMContentLoaded', () => {
  // Ensure pannellum is available
  if (typeof pannellum === 'undefined') {
    console.warn('Pannellum not loaded; check CDN script include.');
    return;
  }

  const viewer = pannellum.viewer('library-panorama', {
    "type": "equirectangular",
    // Use the existing repo image path — change if you add a different 360 image
    "panorama": "./images/site/victorian_library_360.png",
    "autoLoad": true,
    "compass": false,
    "showControls": false,
    "mouseZoom": false,
    "hotSpotDebug": true,
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
});
