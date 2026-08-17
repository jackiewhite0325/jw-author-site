// main.js — site-wide navigation, interactive layout controller, and accessibility helpers
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // 1. Core Header Navigation Discloser System
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('open', !expanded);
      });
    }

    // 2. Global Core Layout State Toggle Listener Interceptor
    var exploreBtn = document.getElementById('exploreBtn');
    var staticModeBtn = document.getElementById('staticModeBtn');
    var exitStaticBtn = document.getElementById('exitStaticBtn');

    // Action listener wrapper helper
    function handleModeTransition(e, enableStatic) {
      e.preventDefault();
      
      // Update global preference storage engine structures
      if (enableStatic) {
        localStorage.setItem('staticMode', 'true');
        localStorage.removeItem('interactiveMode');
      } else {
        localStorage.setItem('interactiveMode', 'true');
        localStorage.removeItem('staticMode');
      }

      // Route through engine controller exposed on the window instance
      if (typeof window.setStaticMode === 'function') {
        window.setStaticMode(enableStatic);
      }
    }

    // Connect trigger nodes if detected present in DOM view output
    if (staticModeBtn) {
      staticModeBtn.addEventListener('click', function (e) {
        handleModeTransition(e, true);
      });
    }

    if (exitStaticBtn) {
      exitStaticBtn.addEventListener('click', function (e) {
        handleModeTransition(e, false);
      });
    }

    if (exploreBtn) {
      exploreBtn.addEventListener('click', function (e) {
        handleModeTransition(e, false);
      });
    }

    // 3. Centralized Skip-Link Interactive Target Manager
    var skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', function (e) {
        var targetId = skipLink.getAttribute('href');
        if (!targetId || targetId === '#') return;
        
        var targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.setAttribute('tabindex', '-1');
          targetEl.focus();
          
          // Clear custom focus parameters safely once focus shifts away
          targetEl.addEventListener('blur', function blurHandler() {
            targetEl.removeAttribute('tabindex');
            targetEl.removeEventListener('blur', blurHandler);
          });
        }
      });
    }
  });
}());
