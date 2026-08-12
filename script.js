(function () {
  var tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
  var panels = document.querySelectorAll('.panel[id^="panel-"]');
  var gotoEls = document.querySelectorAll('[data-goto]');
  var tabsRegion = document.querySelector('.tabs-region');

  function activateTab(tabName, opts) {
    opts = opts || {};
    var found = false;

    tabButtons.forEach(function (btn) {
      var isMatch = btn.getAttribute('data-tab') === tabName;
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      if (isMatch) found = true;
    });

    panels.forEach(function (panel) {
      var isMatch = panel.id === 'panel-' + tabName;
      panel.classList.toggle('active', isMatch);
    });

    if (!found) return false;

    if (opts.updateHash !== false) {
      history.replaceState(null, '', '#' + tabName);
    }

    if (opts.scroll && tabsRegion) {
      var headerOffset = 0;
      var stickyBar = document.querySelector('.tabbar');
      if (stickyBar) headerOffset = stickyBar.offsetHeight;
      var top = tabsRegion.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
    return true;
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activateTab(btn.getAttribute('data-tab'), { scroll: true });
    });
  });

  gotoEls.forEach(function (el) {
    el.addEventListener('click', function (e) {
      var target = el.getAttribute('data-goto');
      if (!target) return;
      e.preventDefault();
      activateTab(target, { scroll: true });
    });
  });

  // Respect a direct link like ://site.com
  var initial = (window.location.hash || '').replace('#', '');
  var validTabs = Array.prototype.map.call(tabButtons, function (b) {
    return b.getAttribute('data-tab');
  });

  if (initial && validTabs.indexOf(initial) !== -1) {
    activateTab(initial, { updateHash: false });
  }
})();
