/* ==========================================================================
   1. State Engine, Utilities, & UI Animation Controls
   ========================================================================== */
let roomViewer = null;

function dismissToast() {
  const toast = document.getElementById('invitation-toast');
  if (toast) {
    toast.style.display = "none";
    toast.setAttribute('aria-hidden', 'true');
  }
}

function clearNavigationLock() {
  const left = document.getElementById('guide-arrow-left');
  const right = document.getElementById('guide-arrow-right');
  if (left) left.style.display = "none";
  if (right) right.style.display = "none";
  dismissToast();
}

window.targetCatalogItem = function(itemId) {
  if (!itemId) {
    clearNavigationLock();
    return;
  }
  
  const matched = libraryMasterCatalog.find(i => i.elementId === itemId);
  if (!matched || !roomViewer) return;

  const targetPitch = matched.shelfCoordinate ? matched.shelfCoordinate.pitch : 0;
  const targetYaw = matched.shelfCoordinate ? matched.shelfCoordinate.yaw : 0;

  // Execute smooth camera navigation pan sequence
  if (typeof roomViewer.lookAt === 'function') {
    roomViewer.lookAt(targetPitch, targetYaw, 60, 1500, () => {
      triggerInvitationToast(matched);
    });
  }
};

/* ==========================================================================
   2. Component Synchronization & Event Interface Loop
   ========================================================================== */
function populateSelectorDropdown() {
  const select = document.getElementById('catalog-search-select');
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Pull open a drawer --</option>';
  
  libraryMasterCatalog.forEach(item => {
    const option = document.createElement('option');
    option.value = item.elementId;
    option.textContent = `[${item.dewey}] ${item.elementId.replace(/_/g, ' ')}`;
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

  text.textContent = `You targeted volume marker. View archive log now?`;
  toast.style.display = 'block';
  toast.setAttribute('aria-hidden', 'false');

  // Enforce a singular clean listener pattern instead of mutating nodes
  acceptBtn.onclick = () => {
    dismissToast();
    if (item.targetUrl) window.location.href = item.targetUrl;
  };
}
/* ==========================================================================
   3. WebGL Viewport Instantiation & System Lifecycle Hooks
   ========================================================================== */
window.addEventListener('load', () => {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  roomViewer = pannellum.viewer('panorama-container', {
    type: 'equirectangular',
    panorama: './images/site/victorian_library_360.png',
    autoLoad: true,
    showControls: false,
    mouseZoom: false,
    hotSpots: libraryMasterCatalog.map(item => ({
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
          e.stopPropagation();
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
    populateSelectorDropdown();
  });

  const toggleBtn = document.getElementById('catalog-toggle-btn');
  const drawer = document.getElementById('card-catalog-drawer');
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const isMin = drawer.classList.toggle('minimized');
      toggleBtn.setAttribute('aria-label', isMin ? 'Expand panel' : 'Minimize panel');
      toggleBtn.textContent = isMin ? '+' : '−';
    });
  }
});


