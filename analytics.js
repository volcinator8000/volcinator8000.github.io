/* ============================================================
   Privacy-friendly page counting, off by default.

   The site is static, so counting visitors needs a service that
   receives the hits. GoatCounter (goatcounter.com) is open source,
   free for personal sites, sets no cookies and needs no consent banner.

   To switch it on:
     1. create a free account at goatcounter.com and pick a code, e.g.
        "khalil" -> your dashboard is https://khalil.goatcounter.com
     2. put that code below:  const GOATCOUNTER = 'khalil';
   Nothing loads while the code is empty. Visitors who send the
   Do Not Track or Global Privacy Control signal are never counted.
   ============================================================ */

'use strict';

const GOATCOUNTER = 'volcinator';

(function () {
  if (!GOATCOUNTER) return;
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  // page path only, no query string, no hash (deep-link slugs stay private)
  window.goatcounter = { path: location.pathname, no_onload: false, allow_local: false };

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', `https://${GOATCOUNTER}.goatcounter.com/count`);
  document.head.appendChild(s);

  // one custom event per landing choice and per language switch, no identifiers
  window.trackEvent = function (name) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: name, title: name, event: true });
    }
  };
})();
