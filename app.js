/*
==================================================
========================
1. App Scope Declarations & Device Management
==================================================
======================== */
// Standardized reference container ensures namespace safety across view shifts
let appRoomViewerRef = null;

function initializeDeviceDefaults() {
  window.addEventListener('resize', () => {
    // Dynamically query the shared application runtime view instance safely
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

/*
==================================================
========================
2. Fallback Runtime List Generator
==================================================
======================== */
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

/*
==================================================
========================
3. DOM Watchdog Lifecycle & UI Sync Loop
==================================================
======================== */
// Merged duplicated blocks into a unified, clean execution layer to eliminate race conditions
document.addEventListener('DOMContentLoaded', () => {
  initializeDeviceDefaults();
  
  // Safely check and initialize drawer controls if catalog.js setup handles it
  if (typeof setupDrawerControls === 'function') {
    setupDrawerControls();
  }

  // Gracefully assign room viewer instance once third-party bundles finish mapping
  setTimeout(() => {
    if (window.roomViewer) {
      appRoomViewerRef = window.roomViewer;
    }
  }, 1000);
});
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



