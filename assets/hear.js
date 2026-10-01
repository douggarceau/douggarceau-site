/* "Hear it" buttons: <button class="hear" data-hear="snare">. Plays the real kit samples (sounds/kit). */
(function () {
  var ctx = null, bus = null;
  var base = (document.currentScript && document.currentScript.src || '').replace(/assets\/hear\.js.*$/, '') + 'sounds/kit/';
  var A = function (n, t, g, p) { return [n, t, g || .8, p || 0]; };
  var SEQ = {
    kit: [A('crash', 0, .5, -.3), A('kick-f', 0, 1), A('hh', .25, .45, -.3), A('snare-f', .5, .85), A('hh', .75, .45, -.3), A('kick-mf', 1, .95), A('hh', 1.25, .45, -.3), A('snare-f', 1.5, .85),
      A('tom', 1.75, .8, -.1), A('tom', 1.875, .75, -.1), A('floor', 2, .85, .3), A('floor', 2.125, .8, .3), A('kick-f', 2.25, 1), A('crash', 2.25, .55, -.3)],
    jazzkit: [A('ride', 0, .55, .3), A('kick-p', 0, .5), A('ride', .5, .55, .3), A('hh-foot', .5, .5, -.3), A('ride', .83, .45, .3), A('ride', 1, .55, .3), A('snare-mp', 1.33, .4),
      A('ride', 1.5, .55, .3), A('hh-foot', 1.5, .5, -.3), A('ride', 1.83, .45, .3), A('ride', 2, .6, .3), A('kick-mf', 2, .6)],
    snare: [A('snare-mp', 0, .5), A('snare-mf', .3, .7), A('snare-f', .6, .9), A('snare-ff', .9, 1), A('rim', 1.3, .7)],
    kick: [A('kick-p', 0, .6), A('kick-mf', .45, .9), A('kick-f', .9, 1)],
    tom: [A('tom', 0, .85), A('tom', .35, .8)],
    toms: [A('tom', 0, .85, -.1), A('tom', .25, .8, -.1), A('floor', .5, .9, .3), A('floor', .75, .85, .3)],
    floor: [A('floor', 0, .9, .2), A('floor', .35, .85, .2)],
    hihat: [A('hh', 0, .5), A('hh2', .2, .45), A('hh', .4, .5), A('hh-open', .6, .5), A('hh-foot', 1, .6)],
    ride: [A('ride', 0, .6), A('ride2', .35, .55), A('ride', .6, .55), A('crash-bell', 1, .5)],
    crash: [A('crash', 0, .6)],
    cymbals: [A('ride', 0, .55, .3), A('ride2', .3, .5, .3), A('hh', .6, .5, -.3), A('hh-open', .8, .5, -.3), A('crash', 1.2, .6)],
    brushes: [A('br-sweep', 0, .8), A('br-snare', .5, .8), A('br-swish', .8, .7), A('br-snare2', 1.2, .8), A('br-ride', 1.6, .7, .3)],
    pedal: [A('kick-mf', 0, .9), A('kick-mf', .25, .8), A('kick-f', .5, 1)],
    hhstand: [A('hh-foot', 0, .7), A('hh', .3, .5), A('hh-open', .55, .5), A('hh-foot', .9, .7)]
  };
  function audio() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      ctx = new C(); bus = ctx.createGain(); bus.gain.value = .9; bus.connect(ctx.destination);
      if (window.KitSamples) KitSamples.load(ctx, base);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function play(kind, btn) {
    if (!audio() || !window.KitSamples) return;
    var seq = SEQ[kind] || SEQ.kit, t0 = ctx.currentTime + .05, tries = 0;
    (function go() {
      if (!KitSamples.ready(seq[0][0]) && tries++ < 40) { setTimeout(go, 100); return; }
      t0 = ctx.currentTime + .05;
      seq.forEach(function (s) { KitSamples.play(ctx, bus, s[0], t0 + s[1], s[2], s[3]); });
      btn.classList.add('on'); setTimeout(function () { btn.classList.remove('on'); }, 1200);
    })();
    if (window.gtag) gtag('event', 'hear_gear', { sound: kind });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-hear]'); if (!b) return;
    e.preventDefault(); play(b.getAttribute('data-hear'), b);
  });
  var st = document.createElement('style');
  st.textContent = '.hear{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;margin:0 0 10px;border:1px solid var(--lab-acc,#e7bd42);border-radius:999px;background:rgba(var(--lab-glow,231,189,66),.12);color:var(--lab-acc2,#ffd98a);font:600 13px "IBM Plex Mono",monospace;letter-spacing:.06em;cursor:pointer}' +
    '.hear::before{content:"";width:0;height:0;border-left:9px solid currentColor;border-top:6px solid transparent;border-bottom:6px solid transparent}' +
    '.hear:hover,.hear.on{background:var(--lab-acc,#e7bd42);color:#140d02;box-shadow:0 0 16px rgba(var(--lab-glow,231,189,66),.45)}';
  document.head.appendChild(st);
})();
