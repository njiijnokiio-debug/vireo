/* ==========================================================================
   VIREO — main.js
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Header on scroll ---------- */
  function initHeader() {
    var header = $('#siteHeader');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var toggle = $('#navToggle');
    var nav = $('#mainNav');
    if (!toggle || !nav) return;

    var close = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Открыть меню');
      document.body.classList.remove('nav-open');
    };

    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('nav-open', open);
    });

    $$('a', nav).forEach(function (link) {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) close();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.slice.call(el.parentElement ? el.parentElement.children : []);
        var index = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(index * 70, 350) + 'ms';
        el.classList.add('is-in');
        observer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Cookie banner ---------- */
  function initCookie() {
    var banner = $('#cookieBanner');
    if (!banner) return;
    var KEY = 'vireo_cookie_choice';

    if (!localStorage.getItem(KEY)) {
      window.setTimeout(function () { banner.classList.add('is-visible'); }, 900);
    }

    $$('[data-cookie]', banner).forEach(function (btn) {
      btn.addEventListener('click', function () {
        localStorage.setItem(KEY, btn.getAttribute('data-cookie'));
        banner.classList.remove('is-visible');
      });
    });
  }

  /* ---------- Toast ---------- */
  var toastEl = null;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastEl._timer);
    toastEl._timer = window.setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 3200);
  }
  window.vireoToast = toast;

  /* ---------- Back to top ---------- */
  function initToTop() {
    var btn = document.createElement('button');
    btn.className = 'to-top';
    btn.setAttribute('aria-label', 'Наверх');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></svg>';
    document.body.appendChild(btn);

    var onScroll = function () {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Gallery ---------- */
  function initGallery() {
    var main = $('#galleryMain');
    var thumbs = $$('.gallery-thumb');
    if (!main || !thumbs.length) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = thumb.getAttribute('data-src');
        if (!src) return;
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
        main.style.opacity = '0';
        window.setTimeout(function () {
          main.src = src;
          main.style.opacity = '1';
        }, 140);
      });
    });
  }

  /* ---------- Catalog filters ---------- */
  function initFilters() {
    var filters = $$('.filter');
    var cards = $$('.product-card[data-category]');
    if (!filters.length || !cards.length) return;

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');

        var value = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var show = value === 'all' || card.getAttribute('data-category') === value;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Tabs ---------- */
  function initTabs() {
    var buttons = $$('.segmented [data-tab]');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var id = btn.getAttribute('data-tab');
        $$('[data-panel]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-panel') !== id;
        });
        var input = $('#docSearch');
        if (input) { input.value = ''; filterDocs(''); }
      });
    });
  }

  /* ---------- Document search ---------- */
  function filterDocs(query) {
    var q = query.toLowerCase().trim();
    $$('.doc-list').forEach(function (list) {
      var visible = 0;
      $$('.doc-card', list).forEach(function (row) {
        var match = row.textContent.toLowerCase().indexOf(q) !== -1;
        row.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      var empty = $('.no-results', list.parentElement);
      if (empty) empty.style.display = visible === 0 && q ? 'block' : 'none';
    });
  }

  function initSearch() {
    var input = $('#docSearch');
    if (!input) return;
    input.addEventListener('input', function () { filterDocs(input.value); });
  }

  /* ---------- Analytics goals ---------- */
  function reachGoal(goal) {
    if (typeof window.ym === 'function') {
      window.ym(window.vireoMetrikaId || 0, 'reachGoal', goal);
    }
  }

  function initTracking() {
    $$('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener('click', function () { reachGoal('PHONE_CLICK'); });
    });
    $$('a[href^="mailto:"]').forEach(function (a) {
      a.addEventListener('click', function () { reachGoal('EMAIL_CLICK'); });
    });
    $$('a[target="_blank"]').forEach(function (a) {
      a.addEventListener('click', function () { reachGoal('SOCIAL_CLICK'); });
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initNav();
    initReveal();
    initCookie();
    initToTop();
    initGallery();
    initFilters();
    initTabs();
    initSearch();
    initTracking();
  });
})();
