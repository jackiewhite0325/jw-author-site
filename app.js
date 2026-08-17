/* ==========================================================================
   Consolidated Application Interface Engine (app.js)
   ========================================================================== */
let appRoomViewerRef = null;

function initializeDeviceDefaults() {
  window.addEventListener('resize', () => {
    // Dynamically query the shared application runtime view instance
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

// Fallback runtime listener safely checks if static mode configuration layout is requested
window.triggerStaticFallbackList = function() {
  const list = document.getElementById('static-list');
  if (list && window.libraryMasterCatalog) {
    list.innerHTML = ''; // Prevent layout compilation doubling
    window.libraryMasterCatalog.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${item.targetUrl}" style="color: var(--amber); font-weight: 600; text-decoration: underline;">[Dewey ${item.dewey}] Go to ${item.elementId.replace(/_/g, ' ')}</a>`;
      list.appendChild(li);
    });
  }
};

/* ==========================================================================
   Consolidated Application Interface Engine (app.js)
   ========================================================================== */
let appRoomViewerRef = null;

function initializeDeviceDefaults() {
  window.addEventListener('resize', () => {
    // Dynamically query the shared application runtime view instance
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

// Fallback runtime listener safely checks if static mode configuration layout is requested
window.triggerStaticFallbackList = function() {
  const list = document.getElementById('static-list');
  if (list && window.libraryMasterCatalog) {
    list.innerHTML = ''; // Prevent layout compilation doubling
    window.libraryMasterCatalog.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${item.targetUrl}" style="color: var(--amber); font-weight: 600; text-decoration: underline;">[Dewey ${item.dewey}] Go to ${item.elementId.replace(/_/g, ' ')}</a>`;
      list.appendChild(li);
    });
  }
};
