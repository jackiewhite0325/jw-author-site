// Device heuristic and initial mode selection
(function() {
  'use strict';

  function preferStaticByDevice() {
    // 1. Explicit user preferences win (checked as explicit strings)
    if (localStorage.getItem('staticMode') === 'true') return true;
    if (localStorage.getItem('interactiveMode') === 'true') return false;

    // 2. Hardware Heuristics: coarse pointer (touch-first) OR narrow screens
    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const isNarrow = window.innerWidth && window.innerWidth <= 720;
    
    return isCoarse || isNarrow;
  }

  document.addEventListener('DOMContentLoaded', function() {
    const storedStatic = localStorage.getItem('staticMode');
    const defaultStatic = preferStaticByDevice();
    
    // Resolve boolean from string representation safely
    const initialMode = (storedStatic !== null) ? (storedStatic === 'true') : defaultStatic;
    
    if (typeof window.setStaticMode === 'function') {
      window.setStaticMode(initialMode);
    }

    // Announcement utility helper to reduce repetitive DOM queries
    function announceToScreenReader(message) {
      const liveRegion = document.getElementById('siteAnnouncement');
      if (liveRegion) liveRegion.textContent = message;
    }

    // Helper to safely switch layout modes globally
    function switchMode(toStatic) {
      if (toStatic) {
        localStorage.setItem('staticMode', 'true');
        localStorage.removeItem('interactiveMode');
        if (typeof window.setStaticMode === 'function') window.setStaticMode(true);
        announceToScreenReader('Static view enabled');
      } else {
        localStorage.setItem('interactiveMode', 'true');
        localStorage.removeItem('staticMode');
        if (typeof window.setStaticMode === 'function') window.setStaticMode(false);
        announceToScreenReader('Interactive view enabled');
      }
    }

    // Wire up try360 action button
    const try360Btn = document.getElementById('try360Btn');
    if (try360Btn) {
      try360Btn.addEventListener('click', function() {
        switchMode(false);
      });
    }

    // Capture explicit alternative entry point attributes
    const enter360Triggers = document.querySelectorAll('[data-enter-360]');
    enter360Triggers.forEach(el => {
      el.addEventListener('click', function() {
        switchMode(false);
      });
    });

    // Capture optional alternative exit point attributes (Static fallback triggers)
    const exit360Triggers = document.querySelectorAll('[data-exit-360]');
    exit360Triggers.forEach(el => {
      el.addEventListener('click', function() {
        switchMode(true);
      });
    });
  });
})();
