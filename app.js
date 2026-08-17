// room-viewer.js — Immersive Pannellum 360 viewer instance integration
let roomViewer;

window.addEventListener('DOMContentLoaded', () => {
  const containerEl = document.getElementById('panorama-container');
  if (!containerEl) {
    console.warn('room-viewer: missing panorama container element. Aborting.');
    return;
  }

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

  // Global binding hook for library-engine.js alignment integration
  window.panSetYaw = function(yaw) {
    if (roomViewer && typeof roomViewer.setYaw === 'function') {
      roomViewer.setYaw(yaw, true); // True enforces smooth camera panning physics
    }
  };

  // 2. Add Hotspots Programmatically from Database Catalog Source
  roomViewer.on('load', () => {
    // Standardize database lookup across catalog iterations safely
    const activeCatalog = (typeof libraryMasterCatalog !== 'undefined') ? libraryMasterCatalog : (typeof libraryRegistry !== 'undefined' ? libraryRegistry : []);
    
    activeCatalog.forEach((item, index) => {
      // Safely resolve pitch/yaw metrics across variable configuration iterations
      const targetPitch = item.shelfCoordinate ? item.shelfCoordinate.pitch : 0;
      const targetYaw = item.cameraYRotation !== undefined ? item.cameraYRotation : (item.shelfCoordinate ? item.shelfCoordinate.yaw : 0);
      const deweyNum = item.deweyClassification || item.dewey || "000";

      roomViewer.addHotSpot({
        "pitch": targetPitch,
        "yaw": targetYaw,
        "type": "info",
        "text": `[Dewey ${deweyNum}] ${item.title}`,
        "cssClass": "library-custom-hotspot",
        // REQUIRED BY PANNELLUM: Must create and return a DOM element node 
        "createTooltipFunc": (hotspotElement) => {
          hotspotElement.setAttribute('data-registry-id', item.elementId || item.id);
          hotspotElement.setAttribute('data-registry-index', index);
          
          // Construct required structural tooltip element to avoid script breaking
          const span = document.createElement('span');
          span.className = 'pnlm-tooltip-text';
          span.textContent = `[Dewey ${deweyNum}] ${item.title}`;
          hotspotElement.appendChild(span);
          return span;
        }
      });
    });
    
    renderBadgeConstellation();
    populateSelectorDropdown();
    setupHotspotClickHandling();
  });

  // 3. Setup Catalog Drawer Minimize State Button Toggles
  const minimizeBtn = document.getElementById('catalog-toggle-btn');
  const catalogDrawer = document.getElementById('card-catalog-drawer') || document.getElementById('cardCatalogDrawer');
  
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
  const activeCatalog = (typeof libraryMasterCatalog !== 'undefined') ? libraryMasterCatalog : (typeof libraryRegistry !== 'undefined' ? libraryRegistry : []);
  const muffinItem = activeCatalog.find(i => (i.elementId === 'muffinPoster' || i.id === 'muffins_constellation_poster'));
  if (!muffinItem || !muffinItem.badgeLocations) return;

  muffinItem.badgeLocations.forEach(badge => {
    roomViewer.addHotSpot({
      "pitch": badge.pitch, 
      "yaw": badge.yaw,
      "type": "info",
      "text": badge.label,
      "cssClass": "badge-marker-hotspot",
      "createTooltipFunc": (hotspotElement) => {
        const span = document.createElement('span');
        span.className = 'pnlm-tooltip-text';
        span.textContent = badge.label;
        hotspotElement.appendChild(span);

        hotspotElement.addEventListener('click', () => {
          const targetUrl = muffinItem.targetUrl || '#';
          window.location.href = `${targetUrl}?badge=${badge.id}`;
        });

        return span;
      }
    });
  });
}

function populateSelectorDropdown() {
  const selector = document.getElementById('catalog-search-select');
  const activeCatalog = (typeof libraryMasterCatalog !== 'undefined') ? libraryMasterCatalog : (typeof libraryRegistry !== 'undefined' ? libraryRegistry : []);
  if (!selector || activeCatalog.length === 0) return;
  
  selector.innerHTML = '<option value="">Select a shelf volume...</option>';
  activeCatalog.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.elementId || item.id;
    const deweyNum = item.deweyClassification || item.dewey || "000";
    opt.textContent = `[${deweyNum}] ${item.title}`;
    selector.appendChild(opt);
  });
}

// Fixed target bubble lookup selection sequence
function setupHotspotClickHandling() {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    // Check elements and their parents inside the wrapper context safely
    const hotspot = e.target.closest('.pnlm-hotspot-base') || e.target.closest('.pnlm-hotspot');
    if (hotspot && hotspot.hasAttribute('data-registry-id')) {
      const targetId = hotspot.getAttribute('data-registry-id');
      const activeCatalog = (typeof libraryMasterCatalog !== 'undefined') ? libraryMasterCatalog : (typeof libraryRegistry !== 'undefined' ? libraryRegistry : []);
      const matchedItem = activeCatalog.find(item => (item.elementId === targetId || item.id === targetId));
      
      if (matchedItem) {
        if (matchedItem.targetUrl) {
          window.location.href = matchedItem.targetUrl;
        } else if (typeof window.openParchment === 'function') {
          // Graceful fallback option routes straight into our internal parchment view system
          window.openParchment(matchedItem.title, matchedItem.summary);
        }
      }
    }
  });
}

// 3. Immersive Selection Event Trigger Panning Mechanism
function targetCatalogItem(itemId) {
  if (!itemId) {
    clearNavigationLock();
    return;
  }
  
  const activeCatalog = (typeof libraryMasterCatalog !== 'undefined') ? libraryMasterCatalog : (typeof libraryRegistry !== 'undefined' ? libraryRegistry : []);
  const targetItem = activeCatalog.find(i => (i.elementId === itemId || i.id === itemId));
  if (!targetItem) return;

  const targetPitch = targetItem.shelfCoordinate ? targetItem.shelfCoordinate.pitch : 0;
  const targetYaw = targetItem.cameraYRotation !== undefined ? targetItem.cameraYRotation : (targetItem.shelfCoordinate ? targetItem.shelfCoordinate.yaw : 0);

  // Pan camera smoothly towards targeted catalog items
  roomViewer.lookAt(targetPitch, targetYaw, 60, 1500, () => {
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
  toast.setAttribute('aria-hidden', 'false');
  
  const newAcceptBtn = acceptBtn.cloneNode(true);
  acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);
  
  newAcceptBtn.addEventListener('click', () => {
    if (item.targetUrl) {
      window.location.href = item.targetUrl;
    } else if (typeof window.openParchment === 'function') {
      dismissToast();
      window.openParchment(item.title, item.summary);
    }
  });
}

function dismissToast() {
  const toast = document.getElementById('invitation-toast');
  if (toast) {
    toast.style.display = "none";
    toast.setAttribute('aria-hidden', 'true');
  }
}

function clearNavigationLock() {
  const leftArrow = document.getElementById('guide-arrow-left');
  const rightArrow = document.getElementById('guide-arrow-right');
  
  if (leftArrow) leftArrow.style.display = "none";
  if (rightArrow) rightArrow.style.display = "none";
  
  dismissToast();
}
