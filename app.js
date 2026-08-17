let roomViewer;
let activeTargetId = null;
let navigationTrackingInterval = null;

window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Pannellum Room with Newly Generated Asset Blueprint Layout
  roomViewer = pannellum.viewer('panorama-container', {
    "type": "equirectangular",
    "panorama": "assets/images/library_360_room.jpg", // Confirm your saved local target directory string matches this asset
    "autoLoad": true,
    "showControls": false,
    "mouseZoom": false,
    "hotSpotDebug": false
  });

  // 2. Loop and Add Hotspots Programmatically from catalog.js Database Source
  roomViewer.on('load', () => {
    libraryRegistry.forEach(item => {
      roomViewer.addHotSpot({
        "pitch": item.shelfCoordinate.pitch,
        "yaw": item.shelfCoordinate.yaw,
        "type": "url",
        "text": `[Dewey ${item.deweyClassification}] ${item.title} - ${item.authorName}`,
        "URL": item.targetUrl,
        "cssClass": "library-custom-hotspot"
      });
    });
    populateSelectorDropdown();
  });
});

function populateSelectorDropdown() {
  const selector = document.getElementById('catalog-search-select');
  libraryRegistry.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `[${item.deweyClassification}] ${item.title} (${item.authorName})`;
    selector.appendChild(opt);
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

  activeTargetId = itemId;

  // Render the Non-Intrusive Shortcut Invitation Banner Card
  const toast = document.getElementById('invitation-toast');
  const toastText = document.getElementById('invitation-text');
  const acceptBtn = document.getElementById('toast-accept-btn');
  
  toastText.textContent = `"${targetItem.title}" by ${targetItem.authorName} is resting on the shelves. Would you like to step inside the page now?`;
  acceptBtn.onclick = () => { window.location.href = targetItem.targetUrl; };
  toast.style.display = "block";

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

  // If the target item falls inside a standard 30-degree centered view window, hide tracking pointers
  if (Math.abs(diff) < 15) {
    leftArrow.style.display = "none";
    rightArrow.style.display = "none";
  } else if (diff < 0) {
    leftArrow.style.display = "block";
    rightArrow.style.display = "none";
  } else {
    leftArrow.style.display = "none";
    rightArrow.style.display = "block";
  }
}

function dismissToast() {
  document.getElementById('invitation-toast').style.display = "none";
}

function clearNavigationLock() {
  activeTargetId = null;

  if (navigationTrackingInterval) clearInterval(navigationTrackingInterval);
  document.getElementById('guide-arrow-left').style.display = "none";
  document.getElementById('guide-arrow-right').style.display = "none";
  dismissToast();
}
