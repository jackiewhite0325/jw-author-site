// app.js - Immersive Viewer Architecture
let roomViewer;

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

function setupHotspotClickHandling() {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    // Find the correct interactive base node element wrapper
    const hotspot = e.target.closest('.pnlm-hotspot');
    
    if (hotspot && hotspot.hasAttribute('data-registry-id')) {
      const targetId = hotspot.getAttribute('data-registry-id');
      const matched = libraryMasterCatalog.find(i => i.elementId === targetId || i.id === targetId);
      
      if (matched) {
        // Prevent Pannellum from doing its default snap-to-corner shift
        e.preventDefault();
        e.stopPropagation();

        if (matched.targetUrl) {
          window.location.href = matched.targetUrl;
        } else if (typeof window.openParchment === 'function') {
          window.openParchment(matched.title, matched.summary);
        }
      }
    }
  });
}

// 3. User Selects an Item inside the Card Catalog Drawer Interface
window.targetCatalogItem = function(itemId) {
  if (!itemId) {
    clearNavigationLock();
    return;
  }
  
  const matched = libraryMasterCatalog.find(i => 
    i.elementId === itemId || i.id === itemId
  );
  if (!matched) return;

  const targetPitch = matched.shelfCoordinate ? matched.shelfCoordinate.pitch : 0;
  const targetYaw = matched.cameraYRotation !== undefined ? matched.cameraYRotation : 0;

  // Pan the camera perspective smoothly over to the target shelf location 
  if (roomViewer && typeof roomViewer.lookAt === 'function') {
    roomViewer.lookAt(targetPitch, targetYaw, 60, 1500, () => {
      // Fire interactive shortcut invitation banner upon panning completion
      triggerInvitationToast(matched);
    });
  }
};

function populateSelectorDropdown() {
  const select = document.getElementById('catalog-search-select');
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Pull open a drawer --</option>';
  
  libraryMasterCatalog.forEach(item => {
    const option = document.createElement('option');
    option.value = item.elementId || item.id;
    option.textContent = `[${item.dewey}] ${item.title}`;
    select.appendChild(option);
  });

  select.addEventListener('change', (e) => {
    if (e.target.value) window.targetCatalogItem(e.target.value);
  });
}

function triggerInvitationToast(item) {
  const toast = document.getElementById('invitation-toast');
  const text = document.getElementById('invitation-text');
  const acceptBtn = document.getElementById('toast-accept-btn');
  if (!toast || !text || !acceptBtn) return;

  text.textContent = `You targeted "${item.title}". View archive parchment logs now?`;
  toast.style.display = 'block';
  toast.setAttribute('aria-hidden', 'false');

  const clonedBtn = acceptBtn.cloneNode(true);
  acceptBtn.parentNode.replaceChild(clonedBtn, acceptBtn);

  clonedBtn.addEventListener('click', () => {
    dismissToast();
    if (item.targetUrl) {
      window.location.href = item.targetUrl;
    } else if (typeof window.openParchment === 'function') {
      window.openParchment(item.title, item.summary);
    }
  });
}

window.addEventListener('load', () => {
  const targetPanoContainer = document.getElementById('panorama-container');
  if (!targetPanoContainer) return;

  roomViewer = pannellum.viewer('panorama-container', {
    "type": "equirectangular",
    "panorama": "./images/site/victorian_library_360.png",
    "autoLoad": true,
    "showControls": false,
    "mouseZoom": false,
    "friction": 0.05,
    "autoRotate": -0.3
  });

  window.panSetYaw = function(yaw) {
    if (roomViewer && typeof roomViewer.setYaw === 'function') {
      roomViewer.setYaw(yaw, true);
    }
  };

  roomViewer.on('load', () => {
    libraryMasterCatalog.forEach((item, index) => {
      roomViewer.addHotSpot({
        "pitch": item.shelfCoordinate ? item.shelfCoordinate.pitch : 0,
        "yaw": item.cameraYRotation !== undefined ? item.cameraYRotation : 0,
        "type": "info",
        "text": `[Dewey ${item.dewey}] ${item.title}`,
        "cssClass": "library-custom-hotspot",
        "createTooltipFunc": (hotspotElement) => {
          hotspotElement.setAttribute('data-registry-id', item.elementId || item.id);
          hotspotElement.setAttribute('data-registry-index', index);
          
          const span = document.createElement('span');
          span.className = 'pnlm-tooltip-text';
          span.textContent = `[Dewey ${item.dewey}] ${item.title}`;
          hotspotElement.appendChild(span);
          return span;
        }
      });
    });
    
    populateSelectorDropdown();
    setupHotspotClickHandling();
  });

  const minimizeBtn = document.getElementById('catalog-toggle-btn');
  const catalogDrawer = document.getElementById('cardCatalogDrawer') || document.getElementById('card-catalog-drawer');
  if (minimizeBtn && catalogDrawer) {
    minimizeBtn.addEventListener('click', () => {
      catalogDrawer.classList.toggle('minimized');
      const isMin = catalogDrawer.classList.contains('minimized');
      minimizeBtn.setAttribute('aria-label', isMin ? 'Expand panel' : 'Minimize panel');
      minimizeBtn.textContent = isMin ? '+' : '−';
    });
  }
});
