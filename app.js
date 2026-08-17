let roomViewer;
let hasReportedFatalFailure = false;

const PANORAMA_ASSET = './images/site/victorian_library_360.png';
const PANORAMA_DIMENSIONS = { width: 1456, height: 720 };
const diagnostics = window.__libraryDiagnostics = window.__libraryDiagnostics || {};

diagnostics.sessionId = diagnostics.sessionId || `library-${Date.now()}`;
diagnostics.panoramaAsset = PANORAMA_ASSET;
diagnostics.panoramaDimensions = PANORAMA_DIMENSIONS;
diagnostics.lifecycle = diagnostics.lifecycle || [];
diagnostics.failures = diagnostics.failures || [];
diagnostics.environment = diagnostics.environment || collectEnvironmentDetails();
diagnostics.webgl = diagnostics.webgl || probeWebGlSupport();
diagnostics.libraryAssets = diagnostics.libraryAssets || readLibraryAssetStatus();

function collectEnvironmentDetails() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    userAgent: navigator.userAgent,
    platform: navigator.userAgentData?.platform || navigator.platform || 'unknown',
    vendor: navigator.vendor || 'unknown',
    language: navigator.language || 'unknown',
    online: navigator.onLine,
    viewport: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    pixelRatio: window.devicePixelRatio || 1,
    coarsePointer: !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches),
    reducedMotion: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemory: navigator.deviceMemory || null,
    connectionType: connection?.effectiveType || null
  };
}

function readLibraryAssetStatus() {
  const script = document.getElementById('pannellum-script');
  const css = document.getElementById('pannellum-css');
  return {
    scriptStatus: diagnostics.libraryAssets?.scriptStatus || script?.dataset?.status || (window.pannellum ? 'loaded' : 'unknown'),
    cssStatus: diagnostics.libraryAssets?.cssStatus || css?.dataset?.status || 'unknown',
    scriptUrl: script?.src || null,
    cssUrl: css?.href || null
  };
}

function probeWebGlSupport() {
  const canvas = document.createElement('canvas');
  const contextNames = ['webgl2', 'webgl', 'experimental-webgl'];

  for (const contextName of contextNames) {
    try {
      const gl = canvas.getContext(contextName, { antialias: false, powerPreference: 'default' });
      if (!gl) continue;

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        supported: true,
        contextName,
        vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)
      };
    } catch (error) {
      diagnostics.failures.push({
        stage: 'webgl-probe',
        category: 'webgl-probe-error',
        message: error?.message || String(error)
      });
    }
  }

  return {
    supported: false,
    contextName: null,
    vendor: null,
    renderer: null,
    version: null,
    shadingLanguageVersion: null,
    maxTextureSize: null,
    maxRenderbufferSize: null
  };
}

function recordLifecycle(stage, details = {}) {
  diagnostics.lifecycle.push({
    stage,
    timestamp: new Date().toISOString(),
    ...details
  });
}

function classifyFailure(stage, error) {
  const message = (error && (error.message || error.reason || error.statusText)) || (typeof error === 'string' ? error : '');
  const combined = `${stage} ${message}`.toLowerCase();

  if (stage === 'missing-pannellum') {
    return 'asset-load-failure';
  }

  if (stage === 'webgl-unavailable' || !diagnostics.webgl.supported) {
    return 'webgl-unsupported';
  }

  if (diagnostics.libraryAssets.scriptStatus === 'error') {
    return 'asset-load-failure';
  }

  if (/webgl|context|shader|gl |gpu|renderer|texture/i.test(combined)) {
    return 'webgl-runtime-failure';
  }

  if (/image|panorama|network|fetch|load|decode|cors/i.test(combined)) {
    return 'panorama-asset-failure';
  }

  return 'device-or-browser-specific-runtime-failure';
}

function summarizeFailure(category) {
  switch (category) {
    case 'asset-load-failure':
      return 'Pannellum did not load before startup.';
    case 'webgl-unsupported':
      return 'This browser/device did not expose a usable WebGL context.';
    case 'webgl-runtime-failure':
      return 'The viewer started but hit a WebGL or GPU-related runtime error.';
    case 'panorama-asset-failure':
      return 'The viewer failed while loading or decoding the panorama asset.';
    default:
      return 'The viewer failed in a browser/device-specific runtime path.';
  }
}

function buildDiagnosticSummary() {
  const lastFailure = diagnostics.failures[diagnostics.failures.length - 1] || null;
  const failureCategory = lastFailure?.category || 'unknown';
  const likelyDeviceLimited = diagnostics.webgl.supported &&
    typeof diagnostics.webgl.maxTextureSize === 'number' &&
    diagnostics.webgl.maxTextureSize < Math.max(PANORAMA_DIMENSIONS.width, PANORAMA_DIMENSIONS.height);

  return {
    sessionId: diagnostics.sessionId,
    failureCategory,
    failureSummary: summarizeFailure(failureCategory),
    pannellumScriptStatus: diagnostics.libraryAssets.scriptStatus,
    pannellumCssStatus: diagnostics.libraryAssets.cssStatus,
    webglSupported: diagnostics.webgl.supported,
    webglContext: diagnostics.webgl.contextName,
    webglRenderer: diagnostics.webgl.renderer,
    maxTextureSize: diagnostics.webgl.maxTextureSize,
    panoramaDimensions: `${PANORAMA_DIMENSIONS.width}x${PANORAMA_DIMENSIONS.height}`,
    likelyDeviceCapabilityLimit: likelyDeviceLimited,
    coarsePointer: diagnostics.environment.coarsePointer,
    viewport: diagnostics.environment.viewport,
    pixelRatio: diagnostics.environment.pixelRatio,
    online: diagnostics.environment.online,
    userAgent: diagnostics.environment.userAgent
  };
}

function renderDiagnosticsPanel() {
  const panel = document.getElementById('library-debug-panel');
  const output = document.getElementById('library-debug-output');
  if (!panel || !output) return;

  panel.hidden = false;
  output.textContent = JSON.stringify(buildDiagnosticSummary(), null, 2);
}

function clearLoadingStatus() {
  const status = document.getElementById('library-loading-status');
  if (!status) return;
  status.hidden = true;
}

function showLoadingFallback(message, category, error) {
  const fallback = document.getElementById('library-fallback');
  if (!fallback) return;

  const copy = fallback.querySelector('p');
  if (copy && message) {
    copy.textContent = message;
  }

  if (category && !hasReportedFatalFailure) {
    diagnostics.failures.push({
      stage: diagnostics.lifecycle[diagnostics.lifecycle.length - 1]?.stage || 'unknown',
      category,
      message: error?.message || error?.reason || (typeof error === 'string' ? error : null)
    });
  }

  fallback.hidden = false;
  clearLoadingStatus();
  renderDiagnosticsPanel();
  if (!hasReportedFatalFailure) {
    hasReportedFatalFailure = true;
    console.warn('Immersive library diagnostics', buildDiagnosticSummary(), error || '');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  recordLifecycle('dom-ready');

  const container = document.getElementById('panorama-container');
  if (!container) return;

  container.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    recordLifecycle('webgl-context-lost');
    showLoadingFallback(
      'The immersive scene lost its graphics context. You can still use the direct links below.',
      'webgl-runtime-failure',
      { message: 'WebGL context lost after viewer startup.' }
    );
  }, { once: true });

  if (typeof libraryRegistry === 'undefined' || !Array.isArray(libraryRegistry)) {
    recordLifecycle('missing-catalog');
    showLoadingFallback(
      'The library catalog is unavailable right now. You can still use the direct links below.',
      'catalog-data-failure'
    );
    return;
  }

  diagnostics.libraryAssets = readLibraryAssetStatus();
  if (!window.pannellum || typeof window.pannellum.viewer !== 'function') {
    recordLifecycle('missing-pannellum');
    showLoadingFallback(
      'The immersive viewer could not be loaded. You can still use the direct links below.',
      classifyFailure('missing-pannellum')
    );
    return;
  }

  if (!diagnostics.webgl.supported) {
    recordLifecycle('webgl-unavailable');
    showLoadingFallback(
      'This browser could not start the immersive graphics view. You can still use the direct links below.',
      classifyFailure('webgl-unavailable')
    );
    return;
  }

  try {
    recordLifecycle('viewer-init-start');
    roomViewer = pannellum.viewer('panorama-container', {
      type: 'equirectangular',
      panorama: PANORAMA_ASSET,
      autoLoad: true,
      showControls: false,
      mouseZoom: false,
      hotSpotDebug: false,
      friction: 0.05,
      autoRotate: -0.5
    });
    recordLifecycle('viewer-init-success');
  } catch (error) {
    recordLifecycle('viewer-init-failed', { error: error?.message || String(error) });
    console.error('Immersive library initialization failed.', error);
    showLoadingFallback(
      'The immersive library could not be started. You can still use the direct links below.',
      classifyFailure('viewer-init-failed', error),
      error
    );
    return;
  }

  roomViewer.on('load', () => {
    recordLifecycle('viewer-load-success');
    clearLoadingStatus();
    libraryRegistry.forEach((item, index) => {
      roomViewer.addHotSpot({
        pitch: item.shelfCoordinate.pitch,
        yaw: item.shelfCoordinate.yaw,
        type: 'info',
        text: `[Dewey ${item.deweyClassification}] ${item.title}`,
        cssClass: 'library-custom-hotspot'
      }, index);
    });

    renderBadgeConstellation();
    populateSelectorDropdown();
    setupHotspotClickHandling();
  });

  roomViewer.on('error', (error) => {
    recordLifecycle('viewer-runtime-error', { error: error?.message || String(error) });
    console.error('Immersive library reported a viewer error.', error);
    showLoadingFallback(
      'The immersive scene could not finish loading. You can still use the direct links below.',
      classifyFailure('viewer-runtime-error', error),
      error
    );
  });

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
