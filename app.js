let roomViewer;
let activeTargetId = null;
let navigationTrackingInterval = null;

window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Pannellum Room with Full-Page Immersion
  roomViewer = pannellum.viewer('panorama-container', {
    "type": "equirectangular",
    "panorama": "images/site/victorian_library_360.png",
    "autoLoad": true,
    "showControls": false,
    "mouseZoom": false,
    "hotSpotDebug": false,
    "friction": 0.05,
    "autoRotate": -0.5
  });

  // 2. Loop and Add Hotspots Programmatically from catalog.js Database Source
  roomViewer.on('load', () => {
    libraryRegistry.forEach(item => {
      roomViewer.addHotSpot({
        "pitch": item.shelfCoordinate.pitch,
        "yaw": item.shelfCoordinate.yaw,
        "type": "info",
        "text": `[Dewey ${item.deweyClassification}] ${item.title}`,
        "cssClass": "library-custom-hotspot",
        "targetUrl": item.targetUrl
      });
    });
    
    // Render badge constellation for muffin poster
    renderBadgeConstellation();
    populateSelectorDropdown();
    setupHotspotClickHandling();
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
    opt.textContent = `[${item.deweyClassification}] ${item.title} (${item.authorName})`;
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
      // Find which item this hotspot belongs to by checking proximity
      const hotspotsContainer = container.querySelector('.pnlm-hotspots');
      if (hotspotsContainer) {
        const allHotspots = Array.from(hotspotsContainer.querySelectorAll('.pnlm-hotspot.library-custom-hotspot'));
        const index = allHotspots.indexOf(hotspot);
        if (index >= 0 && libraryRegistry[index]) {
          const item = libraryRegistry[index];
          triggerItemSelection(item.id);
        }
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
  
  triggerItemSelection(itemId);
}

function triggerItemSelection(itemId) {
  const targetItem = libraryRegistry.find(i => i.id === itemId);
  if (!targetItem) return;

  activeTargetId = itemId;

  // Render the Non-Intrusive Shortcut Invitation Banner Card
  const toast = document.getElementById('invitation-toast');
  const toastText = document.getElementById('invitation-text');
  const acceptBtn = document.getElementById('toast-accept-btn');
  
  if (toast && toastText && acceptBtn) {
    toastText.textContent = `"${targetItem.title}" by ${targetItem.authorName} is resting on the shelves. Would you like to step inside the page now?`;
    acceptBtn.onclick = () => { window.location.href = targetItem.targetUrl; };
    toast.style.display = "block";
  }

  // Engage real-time math tracking loop for Left/Right screen edge pointer arrows
  if (navigationTrackingInterval) clearInterval(navigationTrackingInterval);
  navigationTrackingInterval = setInterval(() => { calculateGuidanceVectors(targetItem.shelfCoordinate.yaw); }, 100);
}

// 4. Calculate Vector Distance between Current Camera Angle and Target Coordinate Yaw Angle
function calculateGuidanceVectors(targetYaw) {
  const currentYaw = roomViewer.getYaw();
  
  // Normalize difference calculation within -180 to 180 coordinate bounds
  let diff = targetYaw - currentYaw;
  while (diff < -180) diff += 360;
  while (diff > 180) diff -= 360;

  const leftArrow = document.getElementById('guide-arrow-left');
  const rightArrow = document.getElementById('guide-arrow-right');

  // If the target item falls inside a 15-degree centered view window, hide tracking pointers
  if (Math.abs(diff) < 15) {
    if (leftArrow) leftArrow.style.display = "none";
    if (rightArrow) rightArrow.style.display = "none";
  } else if (diff < 0) {
    if (leftArrow) leftArrow.style.display = "block";
    if (rightArrow) rightArrow.style.display = "none";
  } else {
    if (leftArrow) leftArrow.style.display = "none";
    if (rightArrow) rightArrow.style.display = "block";
  }
}

function dismissToast() {
  const toast = document.getElementById('invitation-toast');
  if (toast) toast.style.display = "none";
}

function clearNavigationLock() {
  activeTargetId = null;

  if (navigationTrackingInterval) clearInterval(navigationTrackingInterval);
  
  const leftArrow = document.getElementById('guide-arrow-left');
  const rightArrow = document.getElementById('guide-arrow-right');
  
  if (leftArrow) leftArrow.style.display = "none";
  if (rightArrow) rightArrow.style.display = "none";
  
  dismissToast();
}
