// Device heuristic and initial mode selection
(function(){
  function preferStaticByDevice() {
    // explicit user preference wins
    if (localStorage.getItem('staticMode')) return true;
    if (localStorage.getItem('interactiveMode')) return false;

    // Heuristic: coarse pointer (touch-first) OR narrow viewport -> static by default
    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const narrow = window.innerWidth && window.innerWidth <= 720;
    return isCoarse || narrow;
  }

  document.addEventListener('DOMContentLoaded', function() {
    const stored = localStorage.getItem('staticMode');
    const defaultStatic = preferStaticByDevice();
    const initial = (stored !== null) ? !!stored : defaultStatic;
    if (typeof window.setStaticMode === 'function') window.setStaticMode(initial);

    // Wire try360 button to set interactive preference
    const try360 = document.getElementById('try360Btn');
    if (try360) {
      try360.addEventListener('click', function(){
        if (typeof window.setStaticMode === 'function') window.setStaticMode(false);
        localStorage.setItem('interactiveMode','1');
        const live = document.getElementById('siteAnnouncement'); if (live) live.textContent = 'Interactive view enabled';
      });
    }

    // Ensure interactiveMode key is set when user enters 360 via any other control
    const enter360 = document.querySelectorAll('[data-enter-360]');
    enter360.forEach(el => el.addEventListener('click', () => localStorage.setItem('interactiveMode','1')));
  });
})();
