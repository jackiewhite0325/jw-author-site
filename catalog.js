const libraryMasterCatalog = [
  {
    elementId: "i_finally_wrote_it",
    targetUrl: "fiction.html",
    shelfCoordinate: { pitch: -3.5, yaw: -52.0 },
    dewey: "808.02"
  },
  {
    elementId: "partner_book_placeholder",
    targetUrl: "more-books.html",
    shelfCoordinate: { pitch: -8.2, yaw: -24.0 },
    dewey: "813.6"
  },
  {
    elementId: "kids_corner_anchor",
    targetUrl: "children.html",
    shelfCoordinate: { pitch: -16.5, yaw: -125.0 },
    dewey: "808.83"
  },
  {
    elementId: "meditation_space_anchor",
    targetUrl: "health-wellness.html",
    shelfCoordinate: { pitch: -6.0, yaw: 58.5 },
    dewey: "158.12"
  }
];

const libraryMasterCatalogPart2 = [
  {
    elementId: "librarians_desk_papers",
    targetUrl: "about.html",
    shelfCoordinate: { pitch: -17.0, yaw: 14.5 },
    dewey: "027.1"
  },
  {
    elementId: "librarians_desk_typewriter",
    targetUrl: "blog.html",
    shelfCoordinate: { pitch: -14.5, yaw: -1.5 },
    dewey: "070.41"
  },
  {
    elementId: "muffins_memorial_portrait",
    targetUrl: "muffin-memorial.html",
    shelfCoordinate: { pitch: 13.0, yaw: -138.5 },
    dewey: "636.7"
  },
  {
    elementId: "muffins_constellation_poster",
    targetUrl: "welcome.html",
    shelfCoordinate: { pitch: 11.5, yaw: 118.0 },
    dewey: "523.8",
    badgeLocations: [
      { elementId: "muffin01", shelfCoordinate: { pitch: 14.0, yaw: 114.5 }, dewey: "523.8.1" },
      { elementId: "muffin02", shelfCoordinate: { pitch: 12.5, yaw: 117.5 }, dewey: "523.8.2" },
      { elementId: "muffin03", shelfCoordinate: { pitch: 10.0, yaw: 120.5 }, dewey: "523.8.3" },
      { elementId: "muffin04", shelfCoordinate: { pitch: 8.5,  yaw: 118.0 }, dewey: "523.8.4" }
    ]
  }
];

// Merge into final synchronized runtime collection
libraryMasterCatalog.push(...libraryMasterCatalogPart2);

(function injectDesignTokens() {
  const root = document.documentElement;
  const tokens = {
    '--paper': '#fcfaf2',
    '--mist': '#e5e9e8',
    '--ink': '#1c1d21',
    '--amber': '#d97706',
    '--sage': '#6b7280',
    '--walnut': '#4b382a',
    '--card': 'rgba(252, 250, 242, 0.95)'
  };
  
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
})();

(function setupPanoramaDOM() {
  const container = document.getElementById('panorama-container') || document.createElement('div');
  container.id = 'panorama-container';
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.background = 'var(--mist)';
  container.style.transform = 'translate3d(0,0,0)'; // Force DPR acceleration

  const spinner = document.createElement('div');
  spinner.id = 'panorama-loading-spinner';
  spinner.style.position = 'absolute';
  spinner.style.top = '50%';
  spinner.style.left = '50%';
  spinner.style.transform = 'translate(-50%, -50%)';
  spinner.style.border = '4px solid var(--mist)';
  spinner.style.borderTop = '4px solid var(--amber)';
  spinner.style.borderRadius = '50%';
  spinner.style.width = '40px';
  spinner.style.height = '40px';
  spinner.style.animation = 'spin 1s linear infinite';
  spinner.style.zIndex = '10';

  const style = document.createElement('style');
  style.textContent = '@keyframes spin { 0% { transform: translate(-50%,-50%) rotate(0deg); } 100% { transform: translate(-50%,-50%) rotate(360deg); } }';
  document.head.appendChild(style);

  container.appendChild(spinner);
  if (!container.parentElement) document.body.appendChild(container);
})();

let diagnosticTimer = setTimeout(() => {
  const container = document.getElementById('panorama-container');
  if (!container) return;

  const banner = document.createElement('div');
  banner.id = 'a11y-fallback-banner';
  banner.setAttribute('role', 'alert');
  banner.style.cssText = `
    position: absolute; bottom: 10px; left: 10px; right: 10px;
    background: var(--card); color: var(--ink); border: 2px solid var(--amber);
    padding: 12px; z-index: 100; border-radius: 4px; display: flex;
    justify-content: space-between; align-items: center; font-family: sans-serif;
  `;

  const text = document.createElement('span');
  text.textContent = 'Loading taking too long? ';

  const action = document.createElement('button');
  action.textContent = '[Switch to our Basic Text Layout]';
  action.style.cssText = 'background:none; border:none; color:var(--amber); cursor:pointer; font-weight:bold;';
  action.addEventListener('click', () => {
    if (typeof window.setStaticMode === 'function') {
      window.setStaticMode(true);
    }
    banner.remove();
  });

  text.appendChild(action);
  banner.appendChild(text);
  container.appendChild(banner);
}, 4500);

window.setStaticMode = function(enabled) {
  if (enabled) {
    clearTimeout(diagnosticTimer);
    document.getElementById('panorama-container').innerHTML = '<div style="color:var(--ink); padding:20px;">Basic Text Layout Active.</div>';
  }
};

const roomViewer = pannellum.viewer('panorama-container', {
  type: 'equirectangular',
  panorama: 'library.jpg', // Ensure proper CORS server configurations
  autoLoad: true,
  hotSpots: libraryMasterCatalog.map(item => ({
    pitch: item.shelfCoordinate.pitch,
    yaw: item.shelfCoordinate.yaw,
    type: 'custom',
    createTooltipFunc: function(hotSpotDiv) {
      clearTimeout(diagnosticTimer);
      const spinner = document.getElementById('panorama-loading-spinner');
      if (spinner) spinner.remove();

      hotSpotDiv.classList.add('custom-hotspot');
      hotSpotDiv.style.transform = 'translate3d(0,0,0)';
      hotSpotDiv.setAttribute('tabindex', '0');
      hotSpotDiv.setAttribute('role', 'button');
      hotSpotDiv.setAttribute('aria-label', `Dewey ${item.dewey}`);

      const tooltip = document.createElement('div');
      tooltip.style.cssText = 'position:absolute; bottom:100%; left:50%; transform:translate(-50%,-10px); background:var(--card); color:var(--ink); border:1px solid var(--walnut); padding:6px; border-radius:4px; pointer-events:none; white-space:nowrap; display:none;';
      tooltip.textContent = `Dewey: ${item.dewey}`;
      hotSpotDiv.appendChild(tooltip);

      hotSpotDiv.addEventListener('mouseenter', () => tooltip.style.display = 'block');
      hotSpotDiv.addEventListener('mouseleave', () => tooltip.style.display = 'none');
      hotSpotDiv.addEventListener('focus', () => tooltip.style.display = 'block');
      hotSpotDiv.addEventListener('blur', () => tooltip.style.display = 'none');
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
  clearTimeout(diagnosticTimer);
  const spinner = document.getElementById('panorama-loading-spinner');
  if (spinner) spinner.remove();
  const banner = document.getElementById('a11y-fallback-banner');
  if (banner) banner.remove();
});

