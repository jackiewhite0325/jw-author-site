// Sigil and Scribe — main.js

document.addEventListener('DOMContentLoaded', function () {

  // Mobile nav dropdown toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
    });
  }

  // Featured collection rotator
  var rotator = document.querySelector('.rotator');
  if (!rotator) return;

  var track = rotator.querySelector('.rotator-track');
  var slides = rotator.querySelectorAll('.rotator-slide');
  var dotsWrap = rotator.querySelector('.rotator-dots');
  var prevBtn = rotator.querySelector('.rotator-arrow.prev');
  var nextBtn = rotator.querySelector('.rotator-arrow.next');
  var index = 0;
  var total = slides.length;
  var timer;

  // build dots
  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', function () { goTo(i); });
    dotsWrap.appendChild(dot);
  });
  var dots = dotsWrap.querySelectorAll('button');

  function goTo(i) {
    index = (i + total) % total;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    dots.forEach(function (d, di) {
      d.classList.toggle('active', di === index);
    });
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(index + 1); }, 6000);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });

  resetTimer();
});
