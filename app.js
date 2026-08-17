let roomViewer;

window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Pannellum Room with Full-Page Immersion
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

  // 2. Add Hotspots Programmatically from catalog.js Database Source
  roomViewer.on('load', () => {
    if (typeof libraryRegistry !== 'undefined') {
      libraryRegistry.forEach((item, index) => {
        roomViewer.addHotSpot({
          "pitch": item.shelfCoordinate.pitch,
          "yaw": item.shelfCoordinate.yaw,
          "type": "info",
          "text": `[Dewey ${item.deweyClassification}] ${item.title}`,
          "cssClass": "library-custom-hotspot",
          // Pass identification parameters cleanly into the hotspot's data context
          "createTooltipFunc": (hotspotElement) => {
            hotspotElement.setAttribute('data-registry-id', item.id);
            hotspotElement.setAttribute('data-registry-index', index);
          }
        });
      });
    }
    
    renderBadgeConstellation();
    populateSelectorDropdown();
    setupHotspotClickHandling();
  });

  // 3. Setup catalog minimize button state toggles
  const minimizeBtn = document.getElementById('catalog-toggle-btn');
  const catalogDrawer = document.getElementById('card-catalog-drawer');
  if (minimizeBtn && catalogDrawer) {
    minimizeBtn.addEventListener('click', () => {
      catalogDrawer.classList.toggle('minimized');
      const isMinimized = catalogDrawer.classList.contains('minimized');
      minimizeBtn.setAttribute('aria-label', isMinimized ? 'Expand catalog window' : 'Minimize catalog window');
      minimizeBtn.textContent = isMinimized ? '+' : '−';
    });
  }
});

// Refactored to map natively into Pannellum coordinates instead of static canvas space
function renderBadgeConstellation() {
  const muffinItem = typeof libraryRegistry !== 'undefined' ? libraryRegistry.find(i => i.id === 'muffins_constellation_poster') : null;
  if (!muffinItem || !muffinItem.badgeLocations) return;

  muffinItem.badgeLocations.forEach(badge => {
    roomViewer.addHotSpot({
      "pitch": badge.pitch, // Ensure database definitions are converted to pitch/yaw
      "yaw": badge.yaw,
      "type": "info",
      "text": badge.label,
      "cssClass": "badge-marker-hotspot",
      "createTooltipFunc": (hotspotElement) => {
        hotspotElement.addEventListener('click', () => {
          window.location.href = `${muffinItem.targetUrl}?badge=${badge.id}`;
        });
      }
    });
  });
}

function populateSelectorDropdown() {
  const selector = document.getElementById('catalog-search-select');
  if (!selector || typeof libraryRegistry === 'undefined') return;
  
  libraryRegistry.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `[${item.deweyClassification}] ${item.title}`;
    selector.appendChild(opt);
  });
}

// Rewritten target execution utilizing data attribute mappings safely
function setupHotspotClickHandling() {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const hotspot = e.target.closest('.pnlm-hotspot');
    if (hotspot && hotspot.hasAttribute('data-registry-id')) {
      const targetId = hotspot.getAttribute('data-registry-id');
      const matchedItem = libraryRegistry.find(item => item.id === targetId);
      
      if (matchedItem && matchedItem.targetUrl) {
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

  // Pan the camera perspective smoothly over to the target shelf location 
  roomViewer.lookAt(targetItem.shelfCoordinate.pitch, targetItem.shelfCoordinate.yaw, 60, 1500, () => {
    // Fire interactive shortcut invitation banner upon panning completion
    triggerInvitationToast(targetItem);
  });
}

function triggerInvitationToast(item) {
  const toast = document.getElementById('invitation-toast');
  const text = document.getElementById('invitation-text');
  const acceptBtn = document.getElementById('toast-accept-btn');
  
  if (!toast || !text || !acceptBtn) return;
  
  text.textContent = `You discovered "${item.title}". Would you like to check it out?`;
  toast.style.display = "block";
  
  // Clean off old target hooks before setting fresh instances
  const newAcceptBtn = acceptBtn.cloneNode(true);
  acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);
  
  newAcceptBtn.addEventListener('click', () => {
    window.location.href = item.targetUrl;
  });
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
