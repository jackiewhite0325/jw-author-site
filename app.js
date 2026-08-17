let roomViewer;

function setLoadingStatus(message) {
  const status = document.getElementById('library-loading-status');
  if (!status) return;
  status.hidden = false;
  status.textContent = message;
}

function clearLoadingStatus() {
  const status = document.getElementById('library-loading-status');
  if (!status) return;
  status.hidden = true;
}

function showLoadingFallback(message) {
  const fallback = document.getElementById('library-fallback');
  if (!fallback) return;

  const copy = fallback.querySelector('p');
  if (copy && message) {
    copy.textContent = message;
  }

  fallback.hidden = false;
  setLoadingStatus(message || 'Unable to load the immersive library.');
}

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  if (typeof libraryRegistry === 'undefined' || !Array.isArray(libraryRegistry)) {
    showLoadingFallback('The library catalog is unavailable right now. You can still use the direct links below.');
    return;
  }

  if (!window.pannellum || typeof window.pannellum.viewer !== 'function') {
    showLoadingFallback('The immersive viewer could not be loaded. You can still use the direct links below.');
    return;
  }

  // 1. Initialize Pannellum Room with Full-Page Immersion
  try {
    roomViewer = pannellum.viewer('panorama-container', {
      "type": "equirectangular",
      "panorama": "./images/site/victorian_library_360.png",
      "autoLoad": true,
      "showControls": false,
      "mouseZoom": false,
      "hotSpotDebug": false,
      "friction": 0.05,
      "autoRotate": -0.5
    });
  } catch (error) {
    console.error('Immersive library initialization failed.', error);
    showLoadingFallback('The immersive library could not be started. You can still use the direct links below.');
    return;
  }

  // 2. Loop and Add Hotspots Programmatically from catalog.js Database Source
  roomViewer.on('load', () => {
    clearLoadingStatus();
    libraryRegistry.forEach((item, index) => {
      // Use 'info' type to prevent Pannellum's default URL handling
      roomViewer.addHotSpot({
        "pitch": item.shelfCoordinate.pitch,
        "yaw": item.shelfCoordinate.yaw,
        "type": "info",
        "text": `[Dewey ${item.deweyClassification}] ${item.title}`,
        "cssClass": "library-custom-hotspot"
      }, index);
    });
    
    // Render badge constellation for muffin poster
    renderBadgeConstellation();
    populateSelectorDropdown();
    setupHotspotClickHandling();
  });

  roomViewer.on('error', () => {
    console.error('Immersive library reported a viewer error.');
    showLoadingFallback('The immersive scene could not finish loading. You can still use the direct links below.');
  });

  // 3. Setup catalog minimize button
  const minimizeBtn = document.getElementById('catalog-toggle-btn');
  const catalogDrawer = document.getElementById('card-catalog-drawer');
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      catalogDrawer.classList.toggle('minimized');
    });
  }
});

function renderBadgeConstellation() {
  const muffinItem = libraryRegistry.find(i => i.id === 'muffins_constellation_poster');
  if (!muffinItem || !muffinItem.badgeLocations) return;

  const container = document.getElementById('panorama-container');
  const constellationDiv = document.createElement('div');
  constellationDiv.className = 'badge-constellation';
  constellationDiv.id = 'badge-constellation-overlay';

  muffinItem.badgeLocations.forEach(badge => {
    const marker = document.createElement('div');
    marker.className = 'badge-marker';
    marker.id = `badge-${badge.id}`;
    marker.title = badge.label;
    marker.style.left = badge.x + '%';
    marker.style.top = badge.y + '%';

    const label = document.createElement('div');
    label.className = 'badge-label';
    label.textContent = badge.label;

    constellationDiv.appendChild(marker);
    constellationDiv.appendChild(label);

    marker.addEventListener('click', () => {
      if (muffinItem.targetUrl) {
        window.location.href = muffinItem.targetUrl + `?badge=${badge.id}`;
      }
    });
  });

  container.appendChild(constellationDiv);
}

function populateSelectorDropdown() {
  const selector = document.getElementById('catalog-search-select');
  if (!selector) return;
  
  libraryRegistry.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `[${item.deweyClassification}] ${item.title}`;
    selector.appendChild(opt);
  });
}

// Handle direct clicking on hotspots in the panorama
function setupHotspotClickHandling() {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    // Check if click target is a hotspot
    const hotspot = e.target.closest('.pnlm-hotspot');
    if (hotspot && hotspot.classList.contains('library-custom-hotspot')) {
      // Find which item this hotspot belongs to by checking the text content
      const hotspotText = hotspot.textContent || '';
      
      // Match against libraryRegistry to find the corresponding item
      const matchedItem = libraryRegistry.find(item => 
        hotspotText.includes(item.title) || hotspotText.includes(item.deweyClassification)
      );
      
      if (matchedItem && matchedItem.targetUrl) {
        // Direct navigation on hotspot click
        window.location.href = matchedItem.targetUrl;
      }
    }
  });
}

// 3. User Selects an Item inside the Card Catalog Drawer Interface
function targetCatalogItem(itemId) {
  if (!itemId) {
    clearNavigationLock();
    return;
  }
  
  const targetItem = libraryRegistry.find(i => i.id === itemId);
  if (!targetItem) return;

  // Direct navigation from catalog
  window.location.href = targetItem.targetUrl;
}

function dismissToast() {
  const toast = document.getElementById('invitation-toast');
  if (toast) toast.style.display = "none";
}

function clearNavigationLock() {
  const leftArrow = document.getElementById('guide-arrow-left');
  const rightArrow = document.getElementById('guide-arrow-right');
  
  if (leftArrow) leftArrow.style.display = "none";
  if (rightArrow) rightArrow.style.display = "none";
  
  dismissToast();
}
