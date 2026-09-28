/* =====================================================================
   Tan-Dzung (Chris) Do — personal site, v2
   1. project videos   2. hero slider   3. scroll reveal
   4. nav              5. odds and ends
===================================================================== */

var each = function (sel, fn, root) {
  Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn);
};
var hasIO = 'IntersectionObserver' in window;
var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------------
   1. Project videos — each <video> has its own src; play only what is
      on screen so a page of clips doesn't decode all at once
--------------------------------------------------------------------- */
(function () {
  function play(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  if (!hasIO) { each('video', play); return; }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) play(en.target);
      else if (!en.target.paused) en.target.pause();
    });
  }, { rootMargin: '200px 0px' });

  each('video', function (v) { io.observe(v); });
})();


/* ---------------------------------------------------------------------
   2. Hero slider — featured projects, auto-advance, pause on hover
--------------------------------------------------------------------- */
(function () {
  var root = document.getElementById('slider');
  if (!root) return;
  var slides = root.querySelectorAll('.slide');
  var dots   = root.querySelectorAll('.slider-dots button');
  var i = 0, timer = null;

  function go(n) {
    slides[i].classList.remove('is-active');
    dots[i].classList.remove('is-active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('is-active');
    dots[i].classList.add('is-active');
  }
  function start() { if (!reduced) { stop(); timer = setInterval(function () { go(i + 1); }, 5000); } }
  function stop()  { clearInterval(timer); }

  Array.prototype.forEach.call(dots, function (d, n) {
    d.addEventListener('click', function () { go(n); start(); });
  });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  start();
})();


/* ---------------------------------------------------------------------
   3. Scroll reveal
--------------------------------------------------------------------- */
(function () {
  if (!hasIO) {
    each('.reveal', function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      // stagger siblings that enter together
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.classList.contains('reveal');
      });
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 70 + 'ms';
      el.classList.add('is-in');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  each('.reveal', function (el) { io.observe(el); });

  // content inside a freshly opened <details> should just appear
  each('details', function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) each('.reveal', function (el) { el.classList.add('is-in'); }, d);
    });
  });
})();


/* ---------------------------------------------------------------------
   4. Nav — mobile menu, border on scroll, current-section highlight
--------------------------------------------------------------------- */
(function () {
  var nav    = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.getElementById('nav-links');

  function close() { links.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  each('a', function (a) { a.addEventListener('click', close); }, links);

  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!hasIO) return;
  var map = {};
  each('a', function (a) { map[a.getAttribute('href').slice(1)] = a; }, links);
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var a = map[en.target.id];
      if (a && en.isIntersecting) {
        each('a', function (x) { x.classList.remove('is-current'); }, links);
        a.classList.add('is-current');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(map).forEach(function (id) {
    var s = document.getElementById(id);
    if (s) spy.observe(s);
  });
})();


/* ---------------------------------------------------------------------
   5. Odds and ends — "more about" toggle, placeholder links, year
--------------------------------------------------------------------- */
(function () {
  var toggle = document.getElementById('bio-toggle');
  var more   = document.getElementById('about-more');
  if (toggle && more) {
    toggle.addEventListener('click', function () {
      var open = more.hidden;
      more.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.querySelector('.btn-text').textContent = open ? 'Less about' : 'More about';
    });
  }

  // LinkedIn / Scholar buttons stay inert until real URLs are filled in
  each('a[data-placeholder]', function (a) {
    a.addEventListener('click', function (e) { if (a.getAttribute('href') === '#') e.preventDefault(); });
  });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
