/* Amadeus School of Drums phone app: offline support and the install button. */
(function () {
  /* iPhone: play sound even when the ring/silent switch is on (Safari 17+). */
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
  var deferred = null;
  window.amadeusApp = {
    installed: function () { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; },
    ios: function () { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); },
    canPrompt: function () { return !!deferred; },
    install: function () {
      if (!deferred) return Promise.resolve('unavailable');
      deferred.prompt();
      return deferred.userChoice.then(function (c) { deferred = null; if (window.gtag) gtag('event', 'app_install_' + c.outcome); return c.outcome; });
    }
  };
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    document.dispatchEvent(new Event('amadeus-installable'));
  });
  window.addEventListener('appinstalled', function () { if (window.gtag) gtag('event', 'app_installed'); });
  if (window.amadeusApp.installed() && window.gtag) gtag('event', 'app_open');
})();
