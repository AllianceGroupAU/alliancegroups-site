(() => {
  'use strict';

  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 28);
  };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  if (toggle && nav && navLinks) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('menu-open', !open);
    });
    navLinks.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('menu-open');
      }
    });
  }

  const reveals = document.querySelectorAll('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -42px 0px' });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  const range = document.querySelector('[data-ba-range]');
  const after = document.querySelector('[data-ba-after]');
  const divider = document.querySelector('[data-ba-divider]');
  if (range && after && divider) {
    const updateBeforeAfter = () => {
      const value = Math.max(0, Math.min(100, Number(range.value) || 50));
      after.style.clipPath = 'inset(0 0 0 ' + value + '%)';
      divider.style.left = value + '%';
      range.setAttribute('aria-valuetext', value + '% after image');
    };
    range.addEventListener('input', updateBeforeAfter);
    updateBeforeAfter();
  }

  const email = document.querySelector('#quick-email');
  const reply = document.querySelector('#quick-replyto');
  if (email && reply) {
    const syncReply = () => { reply.value = email.value.trim(); };
    email.addEventListener('input', syncReply);
    email.addEventListener('change', syncReply);
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const selector = anchor.getAttribute('href');
      if (!selector || selector === '#') return;
      const target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();