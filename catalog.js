/* ==========================================================================
   1. Data Collection & Global State Engine
   ========================================================================== */
const libraryMasterCatalog = [
  { elementId: "i_finally_wrote_it", targetUrl: "fiction.html", shelfCoordinate: { pitch: -3.5, yaw: -52.0 }, dewey: "808.02" },
  { elementId: "partner_book_placeholder", targetUrl: "more-books.html", shelfCoordinate: { pitch: -8.2, yaw: -24.0 }, dewey: "813.6" },
  { elementId: "kids_corner_anchor", targetUrl: "children.html", shelfCoordinate: { pitch: -16.5, yaw: -125.0 }, dewey: "808.83" },
  { elementId: "meditation_space_anchor", targetUrl: "health-wellness.html", shelfCoordinate: { pitch: -6.0, yaw: 58.5 }, dewey: "158.12" },
  { elementId: "librarians_desk_papers", targetUrl: "about.html", shelfCoordinate: { pitch: -17.0, yaw: 14.5 }, dewey: "027.1" },
  { elementId: "librarians_desk_typewriter", targetUrl: "blog.html", shelfCoordinate: { pitch: -14.5, yaw: -1.5 }, dewey: "070.41" },
  { elementId: "muffins_memorial_portrait", targetUrl: "muffin-memorial.html", shelfCoordinate: { pitch: 13.0, yaw: -138.5 }, dewey: "636.7" },
  { elementId: "muffins_constellation_poster", targetUrl: "welcome.html", shelfCoordinate: { pitch: 11.5, yaw: 118.0 }, dewey: "523.8" }
];

let diagnosticTimer = null;
let roomViewer = null;
let isStaticModeActive = false;

window.setStaticMode = function(enabled) {
  if (!enabled) return;
  isStaticModeActive = true;
  
  if (diagnosticTimer) {
    clearTimeout(diagnosticTimer);
    diagnosticTimer = null;
  }
  
  if (roomViewer) {
    try {
      roomViewer.destroy();
    } catch (e) {
      console.warn("Pannellum destruction skipped or unavailable:", e);
    }
    roomViewer = null;
  }

  const container = document.getElementById('panorama-container');
  if (container) {
    container.innerHTML = `
      <div style="color:var(--ink); padding:20px; background:var(--paper); height:100%; overflow-y:auto;">
        <h3>Library Directory</h3>
        <p>Immersive 360 viewer is currently unavailable. Use our text index below:</p>
        <ul id="fallback-list" style="margin-top:15px; list-style:none; padding:0;"></ul>
      </div>`;
    
    const list = document.getElementById('fallback-list');
    if (list) {
      libraryMasterCatalog.forEach(item => {
        const li = document.createElement('li');
        li.style.marginBottom = "10px";
        li.innerHTML = `<a href="${item.targetUrl}" style="color:var(--amber); font-weight:bold; text-decoration:underline;">[Dewey ${item.dewey}] Go to ${item.elementId.replace(/_/g, ' ')}</a>`;
        list.appendChild(li);
      });
    }
  }
  document.getElementById('a11y-fallback-banner')?.remove();
  document.getElementById('panorama-loading-spinner')?.remove();
};


/* ==========================================================================
   2. DOM Viewport Engineering & Diagnostic Timers
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  // Enforce DPR Hardware Acceleration Overrides
  container.style.background = 'var(--mist)';
  container.style.transform = 'translate3d(0,0,0)';

  // Visual Spinner Initialization Sequence
  const spinner = document.createElement('div');
  spinner.id = 'panorama-loading-spinner';
  spinner.style.cssText = `
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    border: 4px solid var(--mist); border-top: 4px solid var(--amber);
    border-radius: 50%; width: 40px; height: 40px;
    animation: spin 1s linear infinite; z-index: 10;
  `;
  container.appendChild(spinner);

  // Initialize Diagnostic WebGL Decoding Watchdog Timer (4.5s Constraint)
  diagnosticTimer = setTimeout(() => {
    if (document.getElementById('a11y-fallback-banner') || isStaticModeActive) return;
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

  // Mobile Safe Library Verification using ID string target instead of element instance
  if (typeof window.pannellum !== 'undefined' && !isStaticModeActive) {
    initializeViewer('panorama-container');
  } else {
    window.setStaticMode(true);
  }
  initializeUIComponents();
});



/* ==========================================================================
   3. WebGL Room Viewer & Custom Interactive Hotspots
   ========================================================================== */
function initializeViewer(containerId) {
  if (!window.pannellum || !window.pannellum.viewer) return;

  const structuralAssetUrl = '/jw-author-site/images/site/victorian_library_360.jpg';

  roomViewer = window.pannellum.viewer(containerId, {
    type: 'equirectangular',
    panorama: structuralAssetUrl,
    autoLoad: true,
    hotSpots: libraryMasterCatalog.map(item => ({
      pitch: item.shelfCoordinate.pitch,
      yaw: item.shelfCoordinate.yaw,
      type: 'custom',
      createTooltipFunc: function(hotSpotDiv) {
        if (isStaticModeActive) return;

        hotSpotDiv.classList.add('custom-hotspot');
        hotSpotDiv.style.transform = 'translate3d(0,0,0)';
        hotSpotDiv.setAttribute('tabindex', '0');
        hotSpotDiv.setAttribute('role', 'button');
        hotSpotDiv.setAttribute('aria-label', `Dewey ${item.dewey}: Go to ${item.elementId.replace(/_/g, ' ')}`);

        const tooltip = document.createElement('div');
        tooltip.style.cssText = 'position:absolute; bottom:100%; left:50%; transform:translate(-50%,-10px); background:var(--card); color:var(--ink); border:1px solid var(--walnut); padding:6px; border-radius:4px; pointer-events:none; white-space:nowrap; display:none;';
        tooltip.textContent = `Dewey: ${item.dewey}`;
        hotSpotDiv.appendChild(tooltip);

        // Functional click mapping for hotspots
        hotSpotDiv.addEventListener('click', () => {
          window.location.href = item.targetUrl;
        });

        // Combined visual display and visibility handling loops
        const showVisuals = () => tooltip.style.display = 'block';
        const hideVisuals = () => tooltip.style.display = 'none';

        hotSpotDiv.addEventListener('mouseenter', showVisuals);
        hotSpotDiv.addEventListener('mouseleave', hideVisuals);
        hotSpotDiv.addEventListener('focus', showVisuals);
        hotSpotDiv.addEventListener('blur', hideVisuals);
        
        hotSpotDiv.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = item.targetUrl;
          }
        });
      }
    }))
  });

  // RPG Navigation Compass Engine: Calculates objective locations in real-time
  roomViewer.on('viewchange', () => {
    const leftArrow = document.getElementById('guide-arrow-left');
    const rightArrow = document.getElementById('guide-arrow-right');
    
    // Safety check: if no active quest is set or arrow components are missing, exit
    if (!window.activeQuestTarget || !leftArrow || !rightArrow) {
      if (leftArrow) leftArrow.style.display = 'none';
      if (rightArrow) rightArrow.style.display = 'none';
      return;
    }

    const currentYaw = roomViewer.getYaw();
    const targetYaw = window.activeQuestTarget.shelfCoordinate.yaw;

    // Track shortest angular distance on a 360 circle geometry loop
    let angleDifference = targetYaw - currentYaw;
    while (angleDifference < -180) angleDifference += 360;
    while (angleDifference > 180) angleDifference -= 360;

    // Proximity Trigger: If target object is within 15 degrees right in front of them
    if (Math.abs(angleDifference) < 15) {
      leftArrow.style.display = 'none';
      rightArrow.style.display = 'none';
      
      const text = document.getElementById('invitation-text');
      if (text) {
        text.innerHTML = `
          <strong style="color:#4caf50; letter-spacing:1px; font-size:0.8rem; text-transform:uppercase; display:block; margin-bottom:4px;">🎯 Objective Spotted!</strong>
          <span>Look closely! Tap the physical shelf marker directly to open the volume.</span>
        `;
      }
    } else if (angleDifference > 0) {
      // Quest objective is located to the right side of the frame
      leftArrow.style.display = 'none';
      rightArrow.style.display = 'block';
      rightArrow.style.color = 'var(--amber)'; 
    } else {
      // Quest objective is located to the left side of the frame
      leftArrow.style.block = 'block';
      leftArrow.style.display = 'block';
      leftArrow.style.color = 'var(--amber)';
      rightArrow.style.display = 'none';
    }
  });

  roomViewer.on('load', clearLoadingIndicators);
}



/* ==========================================================================
   4. Component Synchronization & Event Interface Loop
   ========================================================================== */
function clearLoadingIndicators() {
  if (diagnosticTimer) {
    clearTimeout(diagnosticTimer);
    diagnosticTimer = null;
  }
  document.getElementById('panorama-loading-spinner')?.remove();
  document.getElementById('a11y-fallback-banner')?.remove();
}

function initializeUIComponents() {
  const selectMenu = document.getElementById('catalog-search-select');
  if (selectMenu) {
    // Prevent duplicate entries if initialization fires twice
    selectMenu.innerHTML = '<option value="">-- Pull open a drawer --</option>';
    libraryMasterCatalog.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.targetUrl;
      opt.textContent = `Dewey ${item.dewey} : ${item.elementId.replace(/_/g, ' ')}`;
      selectMenu.appendChild(opt);
    });

    // Upgraded change listener treats selections as Active Quest Logs
    selectMenu.addEventListener('change', (e) => {
      const selectedUrl = e.target.value;
      if (!selectedUrl) return;

      const item = libraryMasterCatalog.find(i => i.targetUrl === selectedUrl);
      if (item) {
        window.activeQuestTarget = item; // Store active tracker target globally

        const toast = document.getElementById('invitation-toast');
        const text = document.getElementById('invitation-text');
        
        if (toast && text) {
          text.innerHTML = `
            <strong style="color:var(--amber); letter-spacing:1px; font-size:0.85rem; text-transform:uppercase; display:block; margin-bottom:4px;">✨ Quest Accepted!</strong>
            <span>Locate the volume: <span style="font-family:'Courier Prime', monospace; font-weight:bold; color:var(--amber);">[Dewey ${item.dewey}] ${item.elementId.replace(/_/g, ' ')}</span></span>
          `;
          toast.style.display = 'block';
          toast.setAttribute('aria-hidden', 'false');
          
          // Primary action buttons handle quest choice pathways
          const acceptBtn = document.getElementById('toast-accept-btn');
          if (acceptBtn) {
            acceptBtn.textContent = "Teleport to Spot";
            acceptBtn.onclick = () => {
              if (roomViewer) roomViewer.lookAt(item.shelfCoordinate.pitch, item.shelfCoordinate.yaw, 60, 1000);
            };
          }
          
          const dismissBtn = document.getElementById('toast-dismiss-btn');
          if (dismissBtn) {
            dismissBtn.textContent = "Track on Foot";
            dismissBtn.onclick = () => {
              toast.style.display = 'none';
              toast.setAttribute('aria-hidden', 'true');
            };
          }
        }
      }
    });
  }

  // Wire up structural Drawer Close Minimization Actions safely 
  const toggleBtn = document.getElementById('catalog-toggle-btn');
  const drawerPanel = document.getElementById('card-catalog-drawer');
  
  if (toggleBtn && drawerPanel) {
    toggleBtn.addEventListener('click', () => {
      const isMinimized = drawerPanel.classList.contains('minimized') || drawerPanel.getAttribute('aria-hidden') === 'true';
      
      if (isMinimized) {
        drawerPanel.classList.remove('minimized');
        drawerPanel.setAttribute('aria-hidden', 'false');
        toggleBtn.setAttribute('aria-expanded', 'true');
      } else {
        drawerPanel.classList.add('minimized');
        drawerPanel.setAttribute('aria-hidden', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}
