/* Поведінка сторінки: тема, меню, поява блоків, активний пункт навігації */
(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.getElementById('header');
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');

  /* ---------- Тема ---------- */
  var themeBtn = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function syncThemeColor() {
    if (themeMeta) themeMeta.setAttribute('content', root.dataset.theme === 'light' ? '#f6f7fb' : '#0a0b10');
  }
  syncThemeColor();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncThemeColor();
  });

  /* ---------- Мобільне меню ---------- */
  function setMenu(open) {
    if (!nav || !burger) return;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  if (burger) burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  if (nav) nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) {
    if (nav && nav.classList.contains('is-open') && !e.target.closest('.header')) setMenu(false);
  });

  /* ---------- Тінь шапки при прокрутці ---------- */
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Плавна поява блоків ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, i) {
      // невеликий каскад для сусідніх елементів
      el.style.transitionDelay = (i % 3) * 60 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Активний пункт меню ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('is-active'); });
          var a = map[en.target.id];
          if (a) a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Рік у футері ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
