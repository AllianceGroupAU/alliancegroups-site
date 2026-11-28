// Google Ads tag AW-18006768389. Cloudflare Google Tag Gateway still
// injects the first-party loader at /metrics/ for G-ERL9GEWR1B.
// Share one dataLayer and one gtag function. Do not load the removed
// second GA4 property.
// Performance: the gtag.js library is loaded after the first user
// interaction or shortly after the page has finished loading, whichever
// comes first. gtag() calls made before then are queued in dataLayer and
// sent when the library loads, so conversions and form tracking still work.
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

(function () {
  var ID = 'AW-18006768389';
  if (window.__allianceAwTag) return;
  window.__allianceAwTag = 1;
  window.gtag('config', ID);
  var loaded = false;
  var events = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  function load() {
    if (loaded) return;
    loaded = true;
    events.forEach(function (e) { window.removeEventListener(e, load, { passive: true }); });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }
  events.forEach(function (e) { window.addEventListener(e, load, { once: true, passive: true }); });
  function later() {
    var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 1); };
    setTimeout(function () { idle(load, { timeout: 2000 }); }, 3500);
  }
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
})();
