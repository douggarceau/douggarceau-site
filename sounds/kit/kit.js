/* Shared real-drum sample player (Andreas Klein Jazz Drums via Splice, licensed to Doug Garceau).
   KitSamples.load(ctx, baseUrl) starts fetching; KitSamples.play(...) returns false until a sample is ready,
   so callers can fall back to their synthesized sound. */
(function () {
  var NAMES = ['kick-p', 'kick-mf', 'kick-f', 'snare-mp', 'snare-mf', 'snare-f', 'snare-ff', 'rim', 'hh', 'hh2', 'hh-open', 'hh-foot', 'ride', 'ride2', 'crash', 'tom', 'floor',
    'br-snare', 'br-snare2', 'br-snare-soft', 'br-swish', 'br-sweep', 'br-ride', 'br-crash', 'br-hh', 'br-tom', 'br-floor', 'crash-bell'];
  var bufs = {}, started = false, rr = {};
  function load(ctx, base) {
    if (started) return; started = true;
    NAMES.forEach(function (n) {
      fetch(base + n + '.mp3?v=1').then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(function (b) { return new Promise(function (res, rej) { ctx.decodeAudioData(b, res, rej); }); })
        .then(function (buf) { bufs[n] = buf; }).catch(function () {});
    });
  }
  // Round-robin between alternates so repeated notes do not sound machine-gunned.
  var ALT = { hh: ['hh', 'hh2'], ride: ['ride', 'ride2'], 'br-snare': ['br-snare', 'br-snare2'] };
  function pick(n) { var a = ALT[n]; if (!a) return n; rr[n] = ((rr[n] || 0) + 1) % a.length; return bufs[a[rr[n]]] ? a[rr[n]] : n; }
  function play(ctx, dest, name, t, gain, pan, rate) {
    var n = pick(name), buf = bufs[n];
    if (!buf) return false;
    var s = ctx.createBufferSource(); s.buffer = buf;
    s.playbackRate.value = (rate || 1) * (0.995 + Math.random() * 0.01);
    var g = ctx.createGain(); g.gain.value = gain * (0.93 + Math.random() * 0.07);
    s.connect(g);
    if (pan && ctx.createStereoPanner) { var p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(dest); } else g.connect(dest);
    s.start(Math.max(t, ctx.currentTime));
    return true;
  }
  function ready(name) { return !!bufs[name]; }
  window.KitSamples = { load: load, play: play, ready: ready };
})();
