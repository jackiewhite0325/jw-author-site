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
};// Fire device detection triggers when DOM resources compile
document.addEventListener('DOMContentLoaded', () => {
  initializeDeviceDefaults();
  
  // Cache structural reference link to the primary Pannellum object engine instance
  setTimeout(() => {
    if (window.roomViewer) {
      appRoomViewerRef = window.roomViewer;
    }
  }, 1000);
});



/* ==========================================================================
   2. DOM Watchdog Lifecycle & UI Sync Loop
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initializeDeviceDefaults();
  
  // Safely intercept and augment layout drawer controls if components exist
  setupDrawerControls();
  
  // Cache reference link to the primary Pannellum object engine instance
  setTimeout(() => {
    if (window.roomViewer) {
      appRoomViewerRef = window.roomViewer;
    }
  }, 1000);
});

function setupDrawerControls() {
  const toggleBtn = document.getElementById('catalog-toggle-btn');
  const drawerPanel = document.getElementById('card-catalog-drawer');
  
  if (toggleBtn && drawerPanel) {
    toggleBtn.addEventListener('click', () => {
      // Toggle the structural minimization class styles smoothly
      const isMinimized = drawerPanel.classList.toggle('minimized');
      
      // Update tactile button indicators and labels for screen readers
      toggleBtn.textContent = isMinimized ? '+' : '−';
      toggleBtn.setAttribute('aria-label', isMinimized ? 'Expand window' : 'Minimize window');
      toggleBtn.setAttribute('aria-expanded', isMinimized ? 'false' : 'true');
      drawerPanel.setAttribute('aria-hidden', isMinimized ? 'true' : 'false');
    });
  }
}



