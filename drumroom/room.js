/* Drum Room sounds: snare, toms and suspended cymbal use the real recorded kit samples (sounds/kit);
   instruments with no recording yet are synthesized in the browser. */
(function () {
  var ctx, bus, noiseBuf;
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); if (window.KitSamples) KitSamples.load(ctx, '../sounds/kit/'); setTimeout(function () { Object.keys(PRE).forEach(function (k) { preload(PRE[k]); }); ['timp-pp-G', 'timp-ff-G', 'timp-mf-C', 'timp-mf-Bb'].forEach(obuf); }, 0); setTimeout(jingBank, 400);
      var len = ctx.sampleRate * 3; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
      var master = ctx.createGain(); master.gain.value = 0.8;
      // small room reverb
      var rl = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, rl, ctx.sampleRate);
      for (var c = 0; c < 2; c++) { var ch = ir.getChannelData(c); for (var j = 0; j < rl; j++) ch[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / rl, 3); }
      var verb = ctx.createConvolver(); verb.buffer = ir; var wet = ctx.createGain(); wet.gain.value = 0.18;
      bus = ctx.createGain(); bus.connect(comp); bus.connect(verb); verb.connect(wet); wet.connect(comp);
      var lim = ctx.createDynamicsCompressor(); lim.threshold.value = -6; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.15;
      comp.connect(master); master.connect(lim); lim.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function env(t, peak, dur, att) {
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + (att || 0.003)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(bus); return g;
  }
  function sine(t, f, vol, dur, type, f2, sweep, att) {
    var o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + (sweep || 0.1));
    o.connect(env(t, vol, dur, att)); o.start(t); o.stop(t + dur + 0.05); return o;
  }
  function noise(t, dur, vol, type, freq, q, att) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7;
    s.connect(f); f.connect(env(t, vol, dur, att)); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  function ring(t, f, vol, tau) {
    var o = ctx.createOscillator(); o.frequency.value = f; var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.002); g.gain.setTargetAtTime(0, t + 0.002, tau);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + tau * 7);
  }
  function metal(t, dur, vol, base, bp, att) {
    var band = ctx.createBiquadFilter(); band.type = 'bandpass'; band.frequency.value = bp; band.Q.value = 0.6;
    band.connect(env(t, vol, dur, att));
    [1, 1.47, 2.09, 2.56, 3.21, 4.12, 5.3].forEach(function (r) { var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = base * r; o.connect(band); o.start(t); o.stop(t + dur + 0.05); });
  }
  // ---- tambourine jingles: pre-rendered clash buffers (warm = bronze/silver concert jingles, bright = steel) ----
  var JING = null, JRAW = null;
  function jingRaw() {
    if (JRAW) return JRAW; JRAW = { warm: [], bright: [] };
    var sr = 44100, len = Math.floor(sr * 0.32);
    ['warm', 'bright'].forEach(function (kind) {
      for (var k = 0; k < 6; k++) {
        var d = new Float32Array(len), lo = kind === 'warm' ? 2600 : 4200, hi = kind === 'warm' ? 9000 : 13000;
        var parts = []; for (var p = 0; p < 14; p++) parts.push([lo * Math.pow(hi / lo, Math.random()), 0.3 + Math.random(), 0.025 + Math.random() * (kind === 'warm' ? 0.16 : 0.12), Math.random() * 6.283]);
        var echo = [0, 0.002 + Math.random() * 0.004, 0.009 + Math.random() * 0.012];
        for (var j = 0; j < len; j++) {
          var x = 0, tt;
          for (var e = 0; e < echo.length; e++) { tt = j / sr - echo[e]; if (tt < 0) continue; var a = e ? 0.45 / e : 1;
            for (var q = 0; q < parts.length; q++) { var P = parts[q]; x += a * P[1] * Math.exp(-tt / P[2]) * Math.sin(6.283 * P[0] * tt + P[3] + e); }
            x += a * (Math.random() * 2 - 1) * 2.2 * Math.exp(-tt / 0.0025); }
          d[j] = x;
        }
        var m = 0; for (j = 0; j < len; j++) m = Math.max(m, Math.abs(d[j])); for (j = 0; j < len; j++) d[j] /= m;
        JRAW[kind].push(d);
      }
    });
    return JRAW;
  }
  // Build the jingle sounds while the page is idle, so the first tambourine tap plays at once.
  (window.requestIdleCallback || function (f) { setTimeout(f, 1500); })(function () { jingRaw(); });
  function jingBank() {
    if (JING) return JING; var R = jingRaw(); JING = { warm: [], bright: [] };
    ['warm', 'bright'].forEach(function (kind) { R[kind].forEach(function (d) { var b = ctx.createBuffer(1, d.length, 44100); b.getChannelData(0).set(d); JING[kind].push(b); }); });
    return JING;
  }
  var BELL = null, BRAW = null;
  function bellRaw() {
    if (BRAW) return BRAW; BRAW = [];
    var sr = 44100, len = Math.floor(sr * 0.55);
    for (var k = 0; k < 12; k++) {
      var d = new Float32Array(len), f0 = 2300 * Math.pow(2.1, Math.random());
      var parts = [[1, 1, 0.22 + Math.random() * 0.15], [1.004, 0.5, 0.25], [2.02, 0.35, 0.09], [2.93, 0.2, 0.05], [3.96, 0.1, 0.03]];
      var hits = [[0, 1]], at = 0, a = 1; for (var h = 0; h < 3 + Math.floor(Math.random() * 4); h++) { at += 0.006 + Math.random() * 0.02; a *= 0.45 + Math.random() * 0.25; hits.push([at, a]); }
      for (var j = 0; j < len; j++) {
        var x = 0;
        for (var e = 0; e < hits.length; e++) { var tt = j / sr - hits[e][0]; if (tt < 0) continue;
          for (var q = 0; q < parts.length; q++) { var P = parts[q]; x += hits[e][1] * P[1] * Math.exp(-tt / P[2]) * Math.sin(6.283 * f0 * P[0] * tt + e * 1.3); }
          x += hits[e][1] * (Math.random() * 2 - 1) * 1.5 * Math.exp(-tt / 0.0012); }
        d[j] = x;
      }
      var m = 0; for (j = 0; j < len; j++) m = Math.max(m, Math.abs(d[j])); for (j = 0; j < len; j++) d[j] /= m;
      BRAW.push(d);
    }
    return BRAW;
  }
  (window.requestIdleCallback || function (f) { setTimeout(f, 2500); })(function () { bellRaw(); });
  function bells(t, count, vol, spread) {
    if (!BELL) BELL = bellRaw().map(function (d) { var b = ctx.createBuffer(1, d.length, 44100); b.getChannelData(0).set(d); return b; });
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500; var out = ctx.createGain(); out.gain.value = vol * 0.28; hp.connect(out); out.connect(bus);
    for (var i = 0; i < count; i++) {
      var s = ctx.createBufferSource(); s.buffer = BELL[Math.floor(Math.random() * BELL.length)]; s.playbackRate.value = 0.97 + Math.random() * 0.06;
      var g = ctx.createGain(); g.gain.value = 0.6 + Math.random() * 0.4; s.connect(g);
      if (ctx.createStereoPanner) { var pn = ctx.createStereoPanner(); pn.pan.value = Math.random() * 0.8 - 0.4; g.connect(pn); pn.connect(hp); } else g.connect(hp);
      s.start(t + Math.random() * spread);
    }
  }
  function clashes(t, count, vol, kind, spread) {
    var bank = jingBank()[kind];
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800; var out = ctx.createGain(); out.gain.value = vol * 0.5; hp.connect(out); out.connect(bus);
    for (var i = 0; i < count; i++) {
      var s = ctx.createBufferSource(); s.buffer = bank[Math.floor(Math.random() * bank.length)]; s.playbackRate.value = 0.94 + Math.random() * 0.12;
      var g = ctx.createGain(); g.gain.value = (i ? 0.7 * Math.pow(0.82, i) : 1) * (0.8 + Math.random() * 0.4);
      s.connect(g); g.connect(hp); s.start(t + (i ? -Math.log(1 - Math.random()) * spread : 0));
    }
  }
  function skin(t, vol) { sine(t, 260, 0.42 * vol, 0.12, 'sine', 170, 0.05); noise(t, 0.05, 0.25 * vol, 'bandpass', 1100, 1); }
  var VIBE = { pedal: 'down', ring: [] };
  function setPedal(v, card) {
    VIBE.pedal = v;
    if (v === 'up' && ctx) { var now = ctx.currentTime; VIBE.ring.forEach(function (r) { if (r.end > now) { r.g.gain.setTargetAtTime(0, now, 0.03); } }); VIBE.ring = []; }
    [].forEach.call(document.querySelectorAll('[data-vpedal]'), function (b) { var on = b.getAttribute('data-vpedal') === v; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
  }
  var MIDI = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  var V = {
    xylophone: function (t, f) { sine(t, f, 0.5, 0.45); sine(t, f * 3, 0.12, 0.15); noise(t, 0.02, 0.2, 'bandpass', 3000, 1.5); },
    marimba: function (t, f) { sine(t, f, 0.6, 1.3, 'sine', 0, 0, 0.006); sine(t, f * 4, 0.12, 0.25); sine(t, f * 10, 0.03, 0.06); },
    glockenspiel: function (t, f) { sine(t, f, 0.35, 2.2); sine(t, f * 2.76, 0.12, 0.8); sine(t, f * 5.4, 0.05, 0.3); },
    // Vibraphone: aluminum bar (fundamental, a tuned 4th partial and a faint 10th) with motor tremolo.
    // Pedal down: dampers off, notes ring and blend. Pedal up: the damper bar sits on the bars, so each
    // note stops almost at once, and lifting the pedal cuts off anything still ringing.
    vibraphone: function (t, f) {
      var down = VIBE.pedal === 'down', dur = down ? 8 : 0.6;
      var g = ctx.createGain(); g.gain.value = 1; var lfo = ctx.createOscillator(); lfo.frequency.value = 5.5; var dep = ctx.createGain(); dep.gain.value = 0.3;
      lfo.connect(dep); dep.connect(g.gain); lfo.start(t); lfo.stop(t + dur + 0.2);
      var damp = ctx.createGain(); damp.gain.value = 1; g.connect(damp); damp.connect(bus);
      var e = ctx.createGain(); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(0.45, t + 0.004); e.gain.setTargetAtTime(0, t + 0.004, down ? 1.5 : 0.07); e.connect(g);
      [[1, 1], [4, 0.14], [10, 0.03]].forEach(function (p) { var o = ctx.createOscillator(); o.frequency.value = f * p[0]; var pg = ctx.createGain(); pg.gain.setValueAtTime(p[1], t); pg.gain.setTargetAtTime(0, t + 0.004, p[0] === 1 ? 10 : 0.3 / p[0] * 4); o.connect(pg); pg.connect(e); o.start(t); o.stop(t + dur + 0.1); });
      noise(t, 0.012, 0.08, 'bandpass', 2500, 1.2);
      VIBE.ring.push({ g: damp, end: t + dur }); VIBE.ring = VIBE.ring.filter(function (r) { return r.end > ctx.currentTime; });
    },
    chimes: function (t, f) { [[0.5, .12], [1, .35], [1.19, .2], [1.56, .18], [2, .14], [2.51, .1], [3.01, .06]].forEach(function (p) { sine(t, f * p[0], p[1], 4 - p[0] * 0.6); }); noise(t, 0.03, 0.15, 'bandpass', 2500, 2); },
    // Timpani: modal model of a kettledrum membrane. The pitch you hear is the (1,1) mode; its overtones sit near
    // 1.5, 2, 2.5 and 3 times it, which is why a timpano has a clear note. The (0,1) mode is a short low thud,
    // the felt mallet adds a soft attack, and the pitch settles slightly after the stroke.
    timpani: function (t, f) {
      [[1, 1, 3.2], [1.504, .5, 2.2], [1.742, .22, 1.6], [2.0, .32, 1.8], [2.245, .12, 1.2], [2.494, .16, 1.3], [2.8, .08, .9], [2.98, .07, .9]].forEach(function (m) {
        sine(t, f * m[0] * 1.012, 0.55 * m[1], m[2], 'sine', f * m[0], 0.25, 0.006);
      });
      sine(t, f * 0.62, 0.45, 0.35, 'sine', f * 0.55, 0.2, 0.003);
      noise(t, 0.09, 0.35, 'lowpass', 380, 0.8, 0.002);
      noise(t, 0.04, 0.08, 'bandpass', 1800, 1.2, 0.001);
    },
    snare: function (t) { sine(t, 240, 0.5, 0.1, 'triangle', 185, 0.04); noise(t, 0.25, 0.9, 'bandpass', 4000, 0.6); },
    snareroll: function (t) { for (var i = 0; i < 24; i++) V.snare(t + i * 0.045 + Math.random() * 0.004, 0); },
    bassdrum: function (t) { sine(t, 70, 1, 2.2, 'sine', 42, 0.4, 0.01); noise(t, 0.3, 0.3, 'lowpass', 300); },
    toms: function (t, f) { sine(t, f * 1.4, 0.8, 0.9, 'sine', f, 0.08); noise(t, 0.05, 0.25, 'bandpass', f * 6, 1.2); },
    crash: function (t) { noise(t, 3, 0.7, 'highpass', 4500, 0.7, 0.002); metal(t, 2.6, 0.35, 330, 6000); noise(t, 0.8, 0.4, 'bandpass', 2500, 0.5); },
    suspended: function (t) { noise(t, 3.2, 0.5, 'highpass', 5000, 0.7, 1.8); metal(t, 3.2, 0.2, 360, 6500, 1.8); },
    tamtam: function (t) { metal(t, 7, 0.3, 45, 700, 0.5); sine(t, 62, 0.4, 6, 'sine', 0, 0, 0.3); noise(t, 6, 0.15, 'bandpass', 900, 1, 0.8); },
    // Triangle: inharmonic partials of a bent steel bar. Size sets the pitch (small is higher and brighter);
    // 'roll' alternates between two sides of a corner, 'muffled' is a short choked note.
    triangle: function (t, f, note) {
      var base = f || 1180, sizes = { small: 1550, medium: 1180, large: 880 }, v = (note || '').split(':')[0];
      if (sizes[v]) base = sizes[v];
      var one = function (tt, vol, dur) { [[1, .25], [2.76, .13], [5.4, .07], [8.93, .035], [13.3, .02]].forEach(function (p) { sine(tt, base * p[0], vol * p[1] / .25, dur - p[0] * .12); }); };
      if (/roll/.test(note || '')) { for (var i = 0; i < 24; i++) one(t + i * .06, .1 + .12 * Math.sin(i / 23 * Math.PI), 1.2); return; }
      if (/muffled/.test(note || '')) { one(t, .25, .25); return; }
      one(t, .25, 3.6);
    },
    // Tambourine: each jingle pair is a pair of thin metal discs. A stroke makes several quick clashes spread
    // over a few milliseconds, each a burst of bright, inharmonic ringing. A headed tambourine adds the skin's thump.
    tambourine: function (t, f, note) {
      var v = (note || 'concert').split(':')[0], i, n;
      if (v === 'concert') { skin(t, 1); clashes(t, 7, 0.95, 'warm', 0.014); }
      else if (v === 'double') { skin(t, 0.9); clashes(t, 13, 0.9, 'warm', 0.02); clashes(t + 0.004, 5, 0.5, 'bright', 0.02); }
      else if (v === 'headless') { clashes(t, 8, 1, 'bright', 0.012); }
      else if (v === 'tap') { skin(t, 0.35); clashes(t, 3, 0.4, 'warm', 0.008); }
      else if (v === 'shake') { for (i = 0; i < 16; i++) { n = Math.sin((i + 1) / 17 * Math.PI); clashes(t + i * 0.075 + Math.random() * 0.01, 3, 0.25 + 0.5 * n, 'warm', 0.018); } }
      else if (v === 'thumb') { noise(t, 1.25, 0.05, 'bandpass', 900, 0.8, 0.05); for (i = 0; i < 40; i++) { n = 0.5 + 0.5 * Math.sin((i + 1) / 41 * Math.PI); clashes(t + i * 0.031 + Math.random() * 0.008, 1, 0.22 + 0.3 * n, 'warm', 0.004); } clashes(t + 1.26, 6, 0.9, 'warm', 0.014); skin(t + 1.26, 0.7); }
    },
    woodblock: function (t, f) { sine(t, f || 900, 0.6, 0.09); noise(t, 0.02, 0.3, 'bandpass', (f || 900) * 2, 3); },
    templeblocks: function (t, f) { V.woodblock(t, f); },
    claves: function (t) { sine(t, 2500, 0.5, 0.07); },
    castanets: function (t) { noise(t, 0.03, 0.8, 'bandpass', 3200, 4); noise(t + 0.06, 0.03, 0.8, 'bandpass', 3000, 4); },
    maracas: function (t) { noise(t, 0.09, 0.5, 'highpass', 5000); noise(t + 0.16, 0.09, 0.5, 'highpass', 5000); },
    // Cowbells: a bent steel box struck with a stick. A few strong, unevenly spaced modes (the two lowest sit
    // about a fifth apart, which is the "clank"), each dying at its own rate, plus the stick's click. Bigger bells
    // are lower and ring longer. Agogô: two welded bells, low and high. 808: the drum machine's two square waves.
    cowbell: function (t, f, note) {
      var v = note || 'rock';
      if (v === '808') {
        var b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 2640; b.Q.value = 0.5; var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3500;
        var g8 = ctx.createGain(); g8.gain.setValueAtTime(0, t); g8.gain.linearRampToValueAtTime(0.35, t + 0.001); g8.gain.setTargetAtTime(0.1, t + 0.001, 0.012); g8.gain.setTargetAtTime(0, t + 0.03, 0.12);
        b.connect(lp); lp.connect(g8); g8.connect(bus);
        [540, 800].forEach(function (fq) { var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = fq; o.connect(b); o.start(t); o.stop(t + 0.8); });
        return;
      }
      var P = { rock: [560, 0.16, 0.9], mambo: [470, 0.28, 1], chacha: [820, 0.12, 0.8], bongo: [420, 0.34, 1], agogolow: [880, 0.35, 0.7], agogohigh: [1320, 0.3, 0.65] }[v] || [560, 0.16, 0.9];
      var base = P[0], tau = P[1], vol = P[2], agogo = /agogo/.test(v);
      var modes = agogo ? [[1, 1, 1], [2.71, .35, .5], [5.2, .12, .25]] : [[1, 1, 1], [1.505, .85, .8], [2.53, .38, .45], [3.87, .22, .3], [5.3, .12, .18]];
      var sh = ctx.createWaveShaper(), cv = new Float32Array(1024); for (var k = 0; k < 1024; k++) { var x = k / 511.5 - 1; cv[k] = Math.tanh(2.2 * x) / Math.tanh(2.2); } sh.curve = cv;
      var og = ctx.createGain(); og.gain.value = vol * 0.4; sh.connect(og); og.connect(bus);
      modes.forEach(function (m, n) {
        var o = ctx.createOscillator(), g = ctx.createGain(), fq = base * m[0] * (1 + (Math.random() - 0.5) * 0.004);
        o.frequency.setValueAtTime(fq * 1.012, t); o.frequency.exponentialRampToValueAtTime(fq, t + 0.012);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(m[1] * 0.45, t + 0.0015); g.gain.setTargetAtTime(0, t + 0.0015, tau * m[2]);
        o.connect(g); g.connect(sh); o.start(t); o.stop(t + tau * m[2] * 7 + 0.05);
      });
      noise(t, 0.012, 0.35 * vol, 'bandpass', agogo ? 5000 : 3800, 1.5, 0.0008);
    },
    // Sleigh bells: a strap of small closed pellet bells. Each bell rings at its own pitch while the loose
    // pellet inside bounces a few times, so every bell gives a short pitched "chink" with a rattle.
    // Handle hit: fist on the handle, all bells sound together, tight and precise. Shake: looser, with a softer
    // return swing. Roll: continuous shaking that swells and fades.
    sleighbells: function (t, f, note) {
      var v = note || 'shake', i, n;
      if (v === 'hit') { bells(t, 18, 1, 0.006); return; }
      if (v === 'shake') { bells(t, 16, 0.9, 0.018); bells(t + 0.11, 10, 0.35, 0.02); return; }
      for (i = 0; i < 28; i++) { n = Math.sin((i + 1) / 29 * Math.PI); bells(t + i * 0.055 + Math.random() * 0.008, 6, 0.25 + 0.5 * n, 0.02); }
    },
    bongos: function (t, f) { sine(t, f * 1.2, 0.6, 0.22, 'sine', f, 0.03); noise(t, 0.02, 0.2, 'bandpass', 3000, 2); },
    congas: function (t, f) { sine(t, f * 1.25, 0.7, 0.45, 'sine', f, 0.04); sine(t, f * 2.3, 0.1, 0.12); noise(t, 0.02, 0.2, 'bandpass', 2500, 2); },
    fielddrum: function (t) { sine(t, 200, 0.5, 0.15, 'triangle', 150, 0.05); noise(t, 0.4, 0.8, 'bandpass', 2500, 0.5); },
    tenordrum: function (t) { sine(t, 150, 0.8, 0.8, 'sine', 110, 0.08); noise(t, 0.08, 0.3, 'lowpass', 1500); },
    rototoms: function (t, f) { sine(t, f * 1.08, 1.0, 1.8, 'sine', f, 0.06); sine(t, f * 1.59, 0.28, 1.1); sine(t, f * 2.14, 0.12, 0.7); noise(t, 0.035, 0.35, 'bandpass', f * 5, 1.5); },
    framedrum: function (t) { sine(t, 120, 0.7, 0.7, 'sine', 90, 0.1); noise(t, 0.05, 0.15, 'lowpass', 1200); },
    timbales: function (t, f) { sine(t, f, 0.5, 0.5); sine(t, f * 1.6, 0.25, 0.35); metal(t, 0.25, 0.08, f / 2, 3000); noise(t, 0.02, 0.3, 'bandpass', 4000, 2); },
    lionsroar: function (t) { var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(260, t + 1.1); o.frequency.linearRampToValueAtTime(120, t + 1.5);
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; o.connect(f); f.connect(env(t, 0.35, 1.6, 0.25)); o.start(t); o.stop(t + 1.7); noise(t, 1.5, 0.15, 'bandpass', 500, 2, 0.2); },
    crotales: function (t, f) { sine(t, f, 0.3, 3.5); sine(t, f * 2.4, 0.08, 1.2); sine(t, f * 4.1, 0.04, 0.5); },
    celesta: function (t, f) { sine(t, f, 0.35, 1.4, 'sine', 0, 0, 0.004); sine(t, f * 2, 0.1, 0.6); sine(t, f * 3, 0.04, 0.3); },
    // Finger cymbals: two small bronze plates struck edge to edge. Each plate rings with its own set of
    // inharmonic plate modes; the two plates are never exactly the same, so their tones beat against each
    // other, which gives the shimmer. The lowest mode rings for several seconds; upper modes fade sooner.
    fingercymbals: function (t, f, note) {
      var big = note === 'large', f0 = big ? 1850 : 2650;
      [0, 1].forEach(function (plate) {
        var fp = f0 * (plate ? 1.017 : 1);
        [[1, .16, 1.9], [1.73, .1, 1.1], [2.33, .08, .8], [3.91, .04, .35], [4.11, .03, .3]].forEach(function (m) { ring(t, fp * m[0], m[1] * (big ? 1.1 : 1), m[2] * (big ? 1.25 : 1)); });
      });
      noise(t, 0.012, 0.2, 'highpass', 6000, 0.7);
    },
    gong: function (t, f) { sine(t, f, 0.6, 5, 'sine', 0, 0, 0.01); sine(t, f * 2, 0.15, 3); sine(t, f * 3.02, 0.08, 2); metal(t, 1, 0.05, f, f * 6); },
    herdenglocken: function (t) { for (var i = 0; i < 9; i++) { var tt = t + Math.random() * 0.9, f = 500 + Math.random() * 500; sine(tt, f, 0.12, 0.5); sine(tt, f * 2.7, 0.05, 0.25); } },
    almglocken: function (t, f) { sine(t, f, 0.4, 1.2); sine(t, f * 2.2, 0.15, 0.6); sine(t, f * 3.4, 0.06, 0.3); },
    // Anvil: steel struck with a steel hammer. A hard, bright "tink" and a piercing ring made of a few strong
    // bar modes plus clustered, slightly detuned modes that beat against each other (the clang). Smaller anvils
    // are higher and ring shorter; a damped stroke has the other hand on the steel.
    anvil: function (t, f, note) {
      var v = (note || 'medium').split(':')[0], damp = /damp/.test(note || '');
      var P = { small: [2350, 0.45], medium: [1560, 0.6], large: [980, 0.8] }[v] || [1560, 0.6], base = P[0], tau = damp ? 0.05 : P[1];
      var sh = ctx.createWaveShaper(), cv = new Float32Array(1024); for (var k = 0; k < 1024; k++) { var x = k / 511.5 - 1; cv[k] = Math.tanh(1.8 * x) / Math.tanh(1.8); } sh.curve = cv;
      var og = ctx.createGain(); og.gain.value = 0.45; sh.connect(og); og.connect(bus);
      [[1, 1, 1], [1.007, .6, .9], [1.41, .35, .5], [2.76, .55, .45], [2.79, .3, .4], [3.62, .2, .25], [5.4, .22, .2], [8.93, .1, .1]].forEach(function (m) {
        var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = base * m[0];
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(m[1] * 0.3, t + 0.001); g.gain.setTargetAtTime(0, t + 0.001, tau * m[2]);
        o.connect(g); g.connect(sh); o.start(t); o.stop(t + tau * m[2] * 7 + 0.05);
      });
      noise(t, 0.006, 0.6, 'bandpass', 7500, 1.2, 0.0005); noise(t, 0.02, 0.25, 'bandpass', base * 2.2, 3, 0.0008);
    },
    // Brake drum: a cast-iron car brake drum resting on padding. Cast iron is duller than steel, so it has a
    // dense cluster of inharmonic modes that die quickly: a dry clank, not a long ring. The rim (lip) is higher
    // and brighter; the side of the body is lower and darker; a bigger drum is lower still.
    brakedrum: function (t, f, note) {
      var v = (note || 'rim').split(':')[0], damp = /damp/.test(note || '');
      var P = { rim: [1180, 0.2, 9000], body: [760, 0.16, 5500], large: [540, 0.24, 6000] }[v] || [1180, 0.2, 9000], base = P[0], tau = damp ? 0.03 : P[1];
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = P[2]; var sh = ctx.createWaveShaper(), cv = new Float32Array(1024);
      for (var k = 0; k < 1024; k++) { var x = k / 511.5 - 1; cv[k] = Math.tanh(2.5 * x) / Math.tanh(2.5); } sh.curve = cv;
      var og = ctx.createGain(); og.gain.value = 0.5; sh.connect(lp); lp.connect(og); og.connect(bus);
      [[1, 1, 1], [1.19, .7, .8], [1.61, .6, .7], [2.05, .5, .6], [2.37, .45, .5], [2.98, .35, .45], [3.51, .25, .35], [4.46, .18, .25], [5.3, .12, .2]].forEach(function (m) {
        var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = base * m[0] * (1 + (Math.random() - .5) * .006);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(m[1] * 0.22, t + 0.001); g.gain.setTargetAtTime(0, t + 0.001, tau * m[2]);
        o.connect(g); g.connect(sh); o.start(t); o.stop(t + tau * m[2] * 7 + 0.05);
      });
      noise(t, 0.008, 0.5, 'bandpass', 4500, 1, 0.0005); noise(t, 0.05, 0.12, 'bandpass', base * 1.6, 2, 0.001);
    },
    belltree: function (t) { for (var i = 0; i < 12; i++) { var f = 3200 - i * 170; sine(t + i * 0.06, f, 0.12, 1.2); } },
    marktree: function (t) { for (var i = 0; i < 20; i++) { var f = 2400 + i * 160; sine(t + i * 0.04, f, 0.06, 1.5); } },
    flexatone: function (t) { var o = ctx.createOscillator(); o.frequency.value = 880; var l = ctx.createOscillator(); l.frequency.value = 9; var d = ctx.createGain(); d.gain.value = 40;
      l.connect(d); d.connect(o.frequency); o.frequency.setValueAtTime(700, t); o.frequency.linearRampToValueAtTime(1100, t + 1.2); o.connect(env(t, 0.25, 1.5, 0.02)); o.start(t); o.stop(t + 1.6); l.start(t); l.stop(t + 1.6); },
    thundersheet: function (t) { noise(t, 3, 0.8, 'lowpass', 400, 0.7, 0.05); noise(t, 2, 0.3, 'bandpass', 900, 1, 0.3); metal(t, 2.5, 0.08, 38, 500, 0.2); },
    hammer: function (t) { sine(t, 60, 1, 0.5, 'sine', 40, 0.1); noise(t, 0.15, 0.9, 'lowpass', 700); },
    slapstick: function (t) { noise(t, 0.05, 1, 'highpass', 1500); sine(t, 900, 0.3, 0.04); },
    ratchet: function (t) { for (var i = 0; i < 18; i++) noise(t + i * 0.035, 0.02, 0.6, 'bandpass', 2200, 3); },
    logdrum: function (t, f) { sine(t, f, 0.6, 0.35); sine(t, f * 2.5, 0.12, 0.12); noise(t, 0.02, 0.2, 'bandpass', f * 3, 2); },
    rute: function (t) { for (var i = 0; i < 10; i++) noise(t + Math.random() * 0.03, 0.03, 0.4, 'bandpass', 3000 + Math.random() * 2000, 2); },
    guiro: function (t) { for (var i = 0; i < 14; i++) noise(t + i * 0.022, 0.015, 0.5, 'bandpass', 2800, 4); for (var j = 0; j < 4; j++) noise(t + 0.4 + j * 0.03, 0.015, 0.5, 'bandpass', 2800, 4); },
    cabasa: function (t) { noise(t, 0.12, 0.5, 'highpass', 6000, 0.7, 0.03); noise(t + 0.2, 0.08, 0.4, 'highpass', 6000); },
    vibraslap: function (t) { for (var i = 0; i < 16; i++) noise(t + i * 0.045, 0.03, 0.6 * Math.pow(0.85, i), 'bandpass', 1800, 5); },
    sandpaper: function (t) { noise(t, 0.35, 0.45, 'bandpass', 3500, 0.8, 0.1); noise(t + 0.45, 0.35, 0.45, 'bandpass', 3500, 0.8, 0.1); },
    rainstick: function (t) { for (var i = 0; i < 70; i++) { var tt = t + Math.random() * 2.2; noise(tt, 0.012, 0.25, 'bandpass', 2500 + Math.random() * 4000, 3); } },
    windmachine: function (t) { var s = ctx.createBufferSource(); s.buffer = noiseBuf; var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 3;
      f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(1100, t + 1.5); f.frequency.linearRampToValueAtTime(400, t + 3); s.connect(f); f.connect(env(t, 0.7, 3.2, 1)); s.start(t); s.stop(t + 3.3); },
    siren: function (t) { var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(1200, t + 1.6); o.frequency.exponentialRampToValueAtTime(300, t + 3);
      o.connect(env(t, 0.3, 3.1, 0.3)); o.start(t); o.stop(t + 3.2); },
    cannon: function (t) { sine(t, 55, 1, 2.5, 'sine', 30, 0.5, 0.005); noise(t, 1.8, 1, 'lowpass', 500); noise(t, 0.1, 0.6, 'lowpass', 3000); },
    taxihorn: function (t) { [370, 466].forEach(function (f) { var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; var fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1800; o.connect(fl); fl.connect(env(t, 0.18, 0.6, 0.02)); o.start(t); o.stop(t + 0.65); }); },
    typewriter: function (t) { for (var i = 0; i < 7; i++) noise(t + i * 0.11 + Math.random() * 0.03, 0.02, 0.7, 'bandpass', 2500, 2); sine(t + 0.95, 2100, 0.3, 1.2); },
    slidewhistle: function (t) { var o = ctx.createOscillator(); o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(1800, t + 0.6); o.frequency.exponentialRampToValueAtTime(700, t + 1.2); o.connect(env(t, 0.25, 1.3, 0.05)); o.start(t); o.stop(t + 1.4); },
    birdwhistle: function (t) { for (var i = 0; i < 5; i++) { var o = ctx.createOscillator(), tt = t + i * 0.16; o.frequency.setValueAtTime(2600, tt); o.frequency.exponentialRampToValueAtTime(3400, tt + 0.07); o.frequency.exponentialRampToValueAtTime(2800, tt + 0.12); o.connect(env(tt, 0.2, 0.13, 0.01)); o.start(tt); o.stop(tt + 0.15); } },
    oceandrum: function (t) { var s = ctx.createBufferSource(); s.buffer = noiseBuf; var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3000; f.Q.value = 0.5; s.connect(f); f.connect(env(t, 0.5, 3, 1.3)); s.start(t); s.stop(t + 3.1); },
  };
  // ---------- Real recordings ----------
  // Orchestral one-shots (Cinematic Percussion, Splice Originals, licensed to Doug Garceau) in sounds/orch,
  // and the drum-kit samples in sounds/kit. Anything not covered falls back to the synthesized voice.
  var OB = {}, OL = {}, ORCH = '../sounds/orch/';
  function obuf(name) {
    if (OB[name]) return OB[name];
    if (!OL[name]) OL[name] = fetch(ORCH + name + '.mp3?v=2').then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(function (b) { return new Promise(function (res, rej) { ctx.decodeAudioData(b, res, rej); }); })
      .then(function (b) { OB[name] = b; return b; }).catch(function () { OB[name] = null; });
    return null;
  }
  function oplay(name, t, gain, rate) {
    var b = obuf(name);
    if (!b) { if (OB[name] === null) return false; var p = OL[name]; if (p) { p.then(function (bb) { if (bb) oplay(name, ctx.currentTime + .01, gain, rate); }); return true; } return false; }
    var s = ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = rate || 1;
    var g = ctx.createGain(); g.gain.value = gain; s.connect(g); g.connect(bus); s.start(t); return true;
  }
  function preload(list) { list.forEach(obuf); }
  var TIMP = { 36: 'C', 37: 'lowDb', 41: 'F', 45: 'A', 46: 'Bb', 47: 'B', 49: 'highDb', 52: 'E', 55: 'G' };
  var TIMP_PP = { 37: 1, 41: 1, 45: 1, 47: 1, 49: 1, 52: 1, 55: 1 };
  function nearest(map, m) { var best = null; Object.keys(map).forEach(function (k) { if (best === null || Math.abs(k - m) < Math.abs(best - m)) best = +k; }); return best; }
  function dyn(note, dflt) { var d = /:(pp|p|mp|mf|f|ff)$/.exec(note || ''); return d ? d[1] : dflt; }
  function midiOf(note) { var m = /^m(\d+)/.exec(note || ''); return m ? +m[1] : null; }
  var PRE = {
    timpani: ['timp-mf-lowDb', 'timp-mf-F', 'timp-mf-A', 'timp-mf-B', 'timp-mf-E', 'timp-mf-G', 'timp-mf-highDb'],
    bassdrum: ['bd-mp', 'bd-mf', 'bd-ff'], tamtam: ['tamtam-pp', 'tamtam-mf', 'tamtam-f'], gong: ['gong-E', 'gong-F'], chimes: ['chime-F'],
    woodblock: ['wb-high_D', 'wb-mid_F', 'wb-low_G'], templeblocks: ['wb-high_F', 'wb-high_D', 'wb-high_A', 'wb-low_Bb', 'wb-low_F']
  };
  function real(inst, t, f, note) {
    var K = window.KitSamples, d, m, s;
    if (PRE[inst]) preload(PRE[inst]);
    switch (inst) {
      case 'timpani':
        m = midiOf(note); if (m === null) return false; d = dyn(note, 'mf');
        var map = d === 'pp' ? TIMP_PP : TIMP; s = nearest(map, m);
        return oplay('timp-' + d + '-' + TIMP[s], t, d === 'ff' ? .95 : d === 'pp' ? .9 : .9, Math.pow(2, (m - s) / 12));
      case 'bassdrum': d = dyn(note, 'mf'); if (d === 'roll') return false;
        if (note === 'roll') { if (!obuf('bd-mp')) return false; for (var i = 0; i < 20; i++) oplay('bd-mp', t + i * .09, .25 + i * .03, 1); return true; }
        return oplay('bd-' + (d === 'f' ? 'ff' : d === 'p' || d === 'pp' ? 'mp' : d), t, 1, 1);
      case 'tamtam': d = dyn(note, 'mf'); return oplay('tamtam-' + (d === 'ff' ? 'f' : d === 'p' ? 'pp' : d), t, /f/.test(d) && d !== 'mf' ? 1 : /p/.test(d) && d !== 'mp' ? .45 : .7, 1);
      case 'gong': m = midiOf(note); if (m === null) return false;
        var g = m < 59 ? ['gong-E', 52] : ['gong-F', 65]; return oplay(g[0], t, .9, Math.pow(2, (m - g[1]) / 12));
      case 'chimes': m = midiOf(note); if (m === null) return false; return oplay('chime-F', t, .65, Math.pow(2, (m - 65) / 12));
      case 'woodblock': return oplay(note && note.indexOf('wb-') === 0 ? note : 'wb-mid_F', t, .9, 1);
      case 'templeblocks': var T = { '1040': 'wb-high_F', '880': 'wb-high_D', '740': 'wb-high_A', '620': 'wb-low_Bb', '520': 'wb-low_F' };
        return oplay(T[note] || 'wb-low_G', t, .9, 1);
      case 'snare': if (!K) return false;
        if (note === '__roll') { if (!K.ready('snare-mp')) return false; for (var j = 0; j < 30; j++) K.play(ctx, bus, j % 2 ? 'snare-mp' : 'snare-mf', t + j * .04 + Math.random() * .004, .35 + j / 60, j % 2 ? .1 : -.1); return true; }
        return K.play(ctx, bus, note === 'piccolo' ? 'snare-mf' : 'snare-f', t, .95, 0, note === 'piccolo' ? 1.25 : 1);
      case 'snareroll': return real('snare', t, f, '__roll');
      // Field drum: a deep snare, so the real snare recorded louder and tuned down; tenor drum: snares off, a deep tom.
      case 'fielddrum': if (!K || !K.ready('snare-ff')) return false; K.play(ctx, bus, 'snare-ff', t, .95, 0, .8); return K.play(ctx, bus, 'floor', t, .35, 0, 1.35);
      // Roto-toms: the real tom tuned to each pitch, with a long singing tone added for their open, ringing sound.
      case 'rototoms': if (!K || !K.ready('tom')) return false; K.play(ctx, bus, 'tom', t, 1, 0, Math.max(.8, Math.min(2.6, f / 125)));
        sine(t, f * 1.06, 0.55, 1.9, 'sine', f, 0.07); sine(t, f * 1.59, 0.12, 1.0); return true;
      case 'tenordrum': if (!K || !K.ready('tom')) return false; return K.play(ctx, bus, 'tom', t, .95, 0, .72);
      case 'toms': if (!K) return false; return K.play(ctx, bus, f && f < 120 ? 'floor' : 'tom', t, .9, 0, f && f < 120 ? f / 92 : Math.max(.6, Math.min(1.6, f / 150)));
      case 'crash': if (!K || !K.ready('crash')) return false; var r = note === '16' ? 1.14 : note === '20' ? .88 : 1;
        K.play(ctx, bus, 'crash', t, .75, -.25, r); K.play(ctx, bus, 'crash', t + .012, .6, .25, r * 1.03); return true;
      // Suspended cymbal (recorded crash cymbal). Stick: a stick tip on the bow, a ping with a little wash.
      // Crash: a full stroke. Roll: yarn mallets on opposite edges; the recording is entered after its stick
      // attack, so the roll is a smooth swell of wash with no clicks, ending in a crash at the top.
      case 'suspended': if (!K || !K.ready('crash')) return false;
        var v = (note || 'crash').split(':')[0];
        if (v === 'stick') { if (K.ready('ride')) K.play(ctx, bus, 'ride', t, .55, 0, 1.12); K.play(ctx, bus, 'crash', t, .18, 0, 1.05); return true; }
        if (v === 'crash') { K.play(ctx, bus, 'crash', t, .8, -.15, 1); K.play(ctx, bus, 'crash', t + .008, .45, .15, 1.02); return true; }
        var cb = K.buf && K.buf('crash'); if (!cb) return false;
        var rl = 2.2, out = ctx.createGain(); out.gain.setValueAtTime(0.12, t); out.gain.linearRampToValueAtTime(1.1, t + rl); out.gain.setTargetAtTime(0.0001, t + rl, 0.05);
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2500, t); lp.frequency.exponentialRampToValueAtTime(14000, t + rl); lp.connect(out); out.connect(bus);
        for (var q = 0; q < 30; q++) { var sb = ctx.createBufferSource(); sb.buffer = cb; sb.playbackRate.value = 0.97 + Math.random() * 0.06; var gq = ctx.createGain(), tq = t + q * rl / 30;
          gq.gain.setValueAtTime(0, tq); gq.gain.linearRampToValueAtTime(0.35, tq + 0.06); gq.gain.setTargetAtTime(0, tq + 0.12, 0.25);
          if (ctx.createStereoPanner) { var pq = ctx.createStereoPanner(); pq.pan.value = q % 2 ? .3 : -.3; sb.connect(gq); gq.connect(pq); pq.connect(lp); } else { sb.connect(gq); gq.connect(lp); }
          sb.start(tq, 0.12 + Math.random() * 0.2); sb.stop(tq + 1.2); }
        K.play(ctx, bus, 'crash', t + rl, .8, 0, 1); return true;
    }
    return false;
  }
  function play(inst, note, btn, when, gain) {
    if (!audio()) return;
    var t = when || ctx.currentTime + 0.02, f = note ? (/^\d+(\.\d+)?$/.test(note) ? +note : MIDI(+note.replace('m', ''))) : 0;
    if (note === '__roll') { inst = 'snareroll'; note = ''; }
    var saved = bus; if (gain && gain !== 1) { var gg = ctx.createGain(); gg.gain.value = gain; gg.connect(saved); bus = gg; }
    try { if (!real(inst, t, f, note)) V[inst](t, f, note); } finally { bus = saved; }
    if (btn) { var dl = Math.max(0, (t - ctx.currentTime) * 1000); setTimeout(function () { btn.classList.add('hit'); setTimeout(function () { btn.classList.remove('hit'); }, 160); }, dl); }
    if (!when && window.gtag) gtag('event', 'drum_room_play', { instrument: inst });
  }
  function scale(inst, notes, card) {
    if (!audio()) return;
    var keys = card.querySelectorAll('[data-note]');
    notes.forEach(function (n, i) { var at = i * 0.28; setTimeout(function () { play(inst, n, keys[i]); }, at * 1000); });
  }

  // ---------- Patterns: three rhythmic ideas per instrument, played twice ----------
  var patTimer = null, patBtn = null;
  function stopPat() { if (patTimer) { patTimer.forEach(clearTimeout); patTimer = null; } if (patBtn) { patBtn.classList.remove('on'); patBtn = null; } }
  function playPat(btn) {
    if (!audio()) return;
    var was = btn === patBtn; stopPat(); if (was) return;
    var id = btn.getAttribute('data-pat').split(':'), D = (window.ORCH_PATTERNS || {})[id[0]]; if (!D) return;
    var P = D.p[+id[1]], bpm = P[0], sub = P[1], seq = P[2].trim().split(/\s+/), card = btn.closest('.inst');
    if (P[3]) setPedal(P[3]);
    var keysEl = card ? card.querySelectorAll('.keys [data-inst]:not([data-scale])') : [];
    patTimer = []; patBtn = btn; btn.classList.add('on');
    var need = (PRE[D.snd] || []).concat(D.snd === 'timpani' ? ['timp-pp-G', 'timp-ff-G'] : []);
    need.forEach(obuf);
    var waits = need.map(function (n) { return OL[n]; }).filter(Boolean);
    Promise.all(waits).then(function () { if (patBtn !== btn) return; schedule(); });
    function schedule() {
    var step = 60 / bpm / sub, t0 = ctx.currentTime + 0.12, reps = 2, total = seq.length * step;
    for (var r = 0; r < reps; r++) seq.forEach(function (tok, i) {
      if (tok === '.') return;
      var acc = tok.slice(-1) === '>', ks = tok.replace('>', '').split('+');
      ks.forEach(function (k) {
        var note = D.keys[+k], inst = D.snd;
        play(inst, note || '', keysEl[+k], t0 + r * total + i * step, acc ? 1 : .62);
      });
    });
    patTimer.push(setTimeout(stopPat, (reps * total + 1.2) * 1000));
    }
    if (window.gtag) gtag('event', 'drum_room_pattern', { pattern: btn.getAttribute('data-pat') });
  }
  document.addEventListener('click', function (e) {
    var pb = e.target.closest('[data-pat]'); if (pb) { playPat(pb); return; }
    var vp = e.target.closest('[data-vpedal]'); if (vp) { audio(); setPedal(vp.getAttribute('data-vpedal')); if (window.gtag) gtag('event', 'vibe_pedal', { pedal: vp.getAttribute('data-vpedal') }); return; }
    var b = e.target.closest('[data-inst]'); if (!b) return;
    var card = b.closest('.inst');
    if (b.hasAttribute('data-scale')) { var ks = [].map.call(card.querySelectorAll('[data-note]'), function (k) { return k.getAttribute('data-note'); }); scale(b.getAttribute('data-inst'), ks, card); return; }
    play(b.getAttribute('data-inst'), b.getAttribute('data-note'), b);
  });
})();
