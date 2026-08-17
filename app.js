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
   2. DOM Watchdog Lifecycle & UI Sync Loop
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initializeDeviceDefaults();
  
  // Safely intercept and augment drawer controls if components exist
  setupDrawerControls();
});

function setupDrawerControls() {
  const selectMenu = document.getElementById('catalog-search-select');
  const catalogData = window.libraryMasterCatalog;
  
  if (selectMenu && catalogData) {
    // Only compile the options list if the select menu is empty
    if (selectMenu.options.length <= 1) {
      catalogData.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.targetUrl;
        opt.textContent = `[${item.dewey}] ${item.elementId.replace(/_/g, ' ')}`;
        selectMenu.appendChild(opt);
      });
    }

    // Safely bind actions cleanly
    selectMenu.addEventListener('change', (e) => {
      if (e.target.value) window.location.href = e.target.value;
    });
  }

  const toggleBtn = document.getElementById('catalog-toggle-btn');
  const drawerPanel = document.getElementById('card-catalog-drawer');
  if (toggleBtn && drawerPanel) {
    toggleBtn.addEventListener('click', () => {
      const isMinimized = drawerPanel.classList.toggle('minimized');
      toggleBtn.textContent = isMinimized ? '+' : '−';
      toggleBtn.setAttribute('aria-label', isMinimized ? 'Expand window' : 'Minimize window');
    });
  }
}

