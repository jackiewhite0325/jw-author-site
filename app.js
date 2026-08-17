/* ==========================================================================
   Consolidated Application Interface Engine (app.js)
   ========================================================================== */
let roomViewer = null;
let diagnosticTimer = null;

// Consolidated Device Defaults & Viewport Resizing Logic
function initializeDeviceDefaults() {
  window.addEventListener('resize', () => {
    if (roomViewer && typeof roomViewer.resize === 'function') {
      roomViewer.resize();
    }
  });

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  document.getElementById('panorama-container')?.setAttribute('data-device-mode', isTouch ? 'touch' : 'desktop');
}

// Seamless A11y Static Layout Engine Transition Fallback
window.setStaticMode = function(enabled) {
  if (!enabled) return;
  if (diagnosticTimer) clearTimeout(diagnosticTimer);
  
  const container = document.getElementById('panorama-container');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 24px; color: var(--ink); background: var(--paper); height: 100%; font-family: sans-serif; overflow-y: auto;">
      <h2 style="font-family:'Playfair Display', serif; margin-bottom: 12px;">Library Directory</h2>
      <p style="margin-bottom: var(--space-md);">Immersive viewer disabled. Please choose an archive log target:</p>
      <ul id="static-list" style="list-style: none; display: flex; flex-direction: column; gap: 8px;"></ul>
    </div>
  `;
  
  const list = document.getElementById('static-list');
  if (list && window.libraryMasterCatalog) {
    window.libraryMasterCatalog.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${item.targetUrl}" style="color: var(--amber); font-weight: 600; text-decoration: underline;">[Dewey ${item.dewey}] Go to ${item.elementId.replace(/_/g, ' ')}</a>`;
      list.appendChild(li);
    });
  }
};/* ==========================================================================
   2. DOM Watchdog Lifecycle & Timer Orchestration
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  initializeDeviceDefaults();

  // Establish Hardware Acceleration Target Parameters
  container.style.background = 'var(--mist)';
  container.style.transform = 'translate3d(0,0,0)';
  
  // Inject Visual Fallback Loading Spinner State
  const spinner = document.createElement('div');
  spinner.id = 'panorama-loading-spinner';
  spinner.style.cssText = `
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    border: 4px solid var(--mist); border-top: 4px solid var(--amber);
    border-radius: 50%; width: 40px; height: 40px;
    animation: spin 1s linear infinite; z-index: 10;
  `;
  container.appendChild(spinner);

  // Deploy 4.5-Second Diagnostic Watchdog Alert System
  diagnosticTimer = setTimeout(() => {
    if (document.getElementById('a11y-fallback-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'a11y-fallback-banner';
    banner.setAttribute('role', 'alert');
    banner.style.cssText = `
      position: absolute; bottom: 10px; left: 10px; right: 10px;
      background: var(--card); color: var(--ink); border: 2px solid var(--amber);
      padding: 12px; z-index: 100; border-radius: 4px; display: flex;
      justify-content: space-between; align-items: center; font-family: sans-serif;
    `;
    banner.innerHTML = `<span>Loading taking too long? <button onclick="window.setStaticMode(true)" style="background:none; border:none; color:var(--amber); cursor:pointer; font-weight:bold;">[Switch to our Basic Text Layout]</button></span>`;
    container.appendChild(banner);
  }, 4500);

  initializeImmersiveViewer(container);
});

/* ==========================================================================
   3. WebGL Viewport Instantiation & UI Sync Loop
   ========================================================================== */
function initializeImmersiveViewer(container) {
  if (!window.pannellum || !window.libraryMasterCatalog) return;

  roomViewer = window.pannellum.viewer(container, {
    type: 'equirectangular',
    panorama: './images/site/victorian_library_360.png',
    autoLoad: true,
    showControls: false,
    mouseZoom: false,
    hotSpots: window.libraryMasterCatalog.map(item => ({
      pitch: item.shelfCoordinate.pitch,
      yaw: item.shelfCoordinate.yaw,
      type: 'custom',
      createTooltipFunc: function(hotSpotDiv) {
        hotSpotDiv.classList.add('library-custom-hotspot');
        hotSpotDiv.setAttribute('tabindex', '0');
        hotSpotDiv.setAttribute('role', 'button');
        hotSpotDiv.setAttribute('aria-label', `Dewey ${item.dewey}`);

        hotSpotDiv.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = item.targetUrl;
        });

        hotSpotDiv.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = item.targetUrl;
          }
        });
      }
    }))
  });

  roomViewer.on('load', () => {
    if (diagnosticTimer) clearTimeout(diagnosticTimer);
    document.getElementById('panorama-loading-spinner')?.remove();
    document.getElementById('a11y-fallback-banner')?.remove();
    setupDrawerControls();
  });
}

function setupDrawerControls() {
  const selectMenu = document.getElementById('catalog-search-select');
  if (selectMenu) {
    window.libraryMasterCatalog.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.targetUrl;
      opt.textContent = `[${item.dewey}] ${item.elementId.replace(/_/g, ' ')}`;
      selectMenu.appendChild(opt);
    });
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


