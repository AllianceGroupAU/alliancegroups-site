(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var configs = [
    { selector: 'header, .hero, .banner', threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    { selector: '.services, .service-grid, .service-card', threshold: 0.2, rootMargin: '0px 0px -5% 0px' },
    { selector: '.process, .steps, .step', threshold: 0.25, rootMargin: '0px 0px -5% 0px' },
    { selector: '.jobs, .job-card, .project, li', threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  ];
  var staggerCounters = {};
  configs.forEach(function (cfg) {
    var elements = document.querySelectorAll(cfg.selector);
    if (!elements.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var key = cfg.selector;
          if (!staggerCounters[key]) staggerCounters[key] = 0;
          entry.target.style.setProperty('--stagger', staggerCounters[key]++);
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: cfg.threshold, rootMargin: cfg.rootMargin });
    elements.forEach(function (el) { el.classList.add('reveal'); observer.observe(el); });
  });
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
    var key = 'manual';
    if (!staggerCounters[key]) staggerCounters[key] = 0;
    el.style.setProperty('--stagger', staggerCounters[key]++);
  });
})();
