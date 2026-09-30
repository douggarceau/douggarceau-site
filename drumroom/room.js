/* Drum Room sounds: snare, toms and suspended cymbal use the real recorded kit samples (sounds/kit);
   instruments with no recording yet are synthesized in the browser. */
(function () {
  var ctx, bus, noiseBuf, ROOT, IB = {}, SCT = {};
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
      ROOT = bus;
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
  var WC = {
    brass: { n: 24, lo: 2300, hi: 6200, gap: 0.035, after: 6, spread: 1.2, vol: 0.05, tau: 1, click: 0.4, modes: [[1, 1, 1.6], [2.76, .3, .5], [5.4, .1, .2]] },
    aluminum: { n: 5, tuned: [523, 587, 659, 784, 880], gap: 0.09, after: 10, spread: 3, vol: 0.1, tau: 1, click: 0.2, modes: [[1, 1, 3.2], [2.76, .45, 1.2], [5.4, .18, .5], [8.93, .07, .2]] },
    steel: { n: 8, lo: 1400, hi: 3600, gap: 0.06, after: 12, spread: 2.5, vol: 0.07, tau: 1, click: 0.4, modes: [[1, 1, 2.2], [1.006, .6, 2.2], [2.76, .4, .8], [5.4, .15, .3]] },
    bronze: { n: 6, lo: 880, hi: 1900, gap: 0.08, after: 9, spread: 3, vol: 0.08, tau: 1, click: 0.2, modes: [[0.5, .3, 2.2], [1, 1, 1.7], [1.19, .5, 1.1], [1.5, .35, .8], [2, .3, .6], [2.5, .15, .3]] },
    glass: { n: 10, lo: 2600, hi: 5600, gap: 0.045, after: 16, spread: 1.6, vol: 0.07, tau: 1, click: 0.9, modes: [[1, 1, .38], [2.91, .45, .14], [5.6, .18, .06]] },
    bamboo: { n: 6, lo: 380, hi: 900, gap: 0.07, after: 14, spread: 1.8, vol: 0.35, tau: 0.07, wood: 1 },
    hardwood: { n: 7, lo: 900, hi: 1900, gap: 0.06, after: 14, spread: 1.6, vol: 0.28, tau: 0.035, wood: 1 },
    shell: { n: 16, lo: 3000, hi: 8000, gap: 0.025, after: 30, spread: 1.4, vol: 0.22, tau: 0.03, wood: 1 }
  };
  function rain(t, dur, peak, vol, burst) {
    var sr = 44100, len = Math.floor(sr * (dur + 0.3)), b = ctx.createBuffer(2, len, sr), L = b.getChannelData(0), R = b.getChannelData(1), tt = 0;
    while (tt < dur) {
      var env = burst ? Math.sin(Math.PI * Math.min(1, tt / dur)) : (1 - Math.exp(-tt / 0.25)) * Math.exp(-tt / (dur * 0.45)) * (1 + 0.35 * Math.sin(tt * 2.3 + Math.sin(tt * 0.7) * 2));
      var rate = Math.max(6, peak * env); tt += -Math.log(1 - Math.random()) / rate;
      var a = Math.pow(Math.random(), 2.2) * 0.9 + 0.1, f1 = 2400 + Math.random() * 4800, f2 = 800 + Math.random() * 1400, t1 = 0.0006 + Math.random() * 0.0014, t2 = 0.002 + Math.random() * 0.003;
      var pan = Math.random(), s0 = Math.floor(tt * sr), n = Math.min(len - s0, Math.floor(sr * 0.02));
      for (var k = 0; k < n; k++) { var x = k / sr, y = a * (Math.exp(-x / t1) * Math.sin(6.283 * f1 * x) + 0.45 * Math.exp(-x / t2) * Math.sin(6.283 * f2 * x)); L[s0 + k] += y * (1 - pan * 0.7); R[s0 + k] += y * (0.3 + pan * 0.7); }
    }
    var src = ctx.createBufferSource(); src.buffer = b;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8500; var tube = ctx.createBiquadFilter(); tube.type = 'peaking'; tube.frequency.value = 1300; tube.Q.value = 1.2; tube.gain.value = 5;
    var g = ctx.createGain(); g.gain.value = 0.6 * vol; src.connect(lp); lp.connect(tube); tube.connect(g); g.connect(bus); src.start(t);
  }
  // Noise whose loudness, pitch and flutter follow a speed curve sp[] (0..1) over dur seconds.
  function speedNoise(t, dur, sp, f0, f1, q, vol, fl0, fl1) {
    var src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q; var bp2 = ctx.createBiquadFilter(); bp2.type = 'bandpass'; bp2.Q.value = q * 2;
    var fc = new Float32Array(sp.length), fc2 = new Float32Array(sp.length), gc = new Float32Array(sp.length), lc = new Float32Array(sp.length);
    for (var i = 0; i < sp.length; i++) { fc[i] = f0 + (f1 - f0) * sp[i]; fc2[i] = fc[i] * 2.3; gc[i] = vol * 0.35 * Math.pow(sp[i], 1.3); lc[i] = fl0 + (fl1 - fl0) * sp[i]; }
    bp.frequency.setValueCurveAtTime(fc, t, dur); bp2.frequency.setValueCurveAtTime(fc2, t, dur);
    var g = ctx.createGain(); g.gain.setValueCurveAtTime(gc, t, dur);
    var am = ctx.createGain(); am.gain.value = 0.75; var lfo = ctx.createOscillator(); lfo.frequency.setValueCurveAtTime(lc, t, dur); var lg = ctx.createGain(); lg.gain.value = 0.25; lfo.connect(lg); lg.connect(am.gain);
    var g2 = ctx.createGain(); g2.gain.value = 0.45;
    src.connect(bp); bp.connect(am); src.connect(bp2); bp2.connect(g2); g2.connect(am); am.connect(g); g.connect(bus);
    src.start(t, Math.random() * 2); src.stop(t + dur + 0.05); lfo.start(t); lfo.stop(t + dur + 0.05);
  }
  function blast(t, vol, far) {
    var sh = ctx.createWaveShaper(), cv = new Float32Array(2048); for (var k = 0; k < 2048; k++) { var x = k / 1023.5 - 1; cv[k] = Math.tanh(4 * x) / Math.tanh(4); } sh.curve = cv;
    var out = ctx.createGain(); out.gain.value = vol * (far ? 0.7 : 1); var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = far ? 450 : 16000;
    sh.connect(lp); lp.connect(out); out.connect(bus);
    // echoes: darker, later copies of the blast
    var echoIn = ctx.createGain(); echoIn.gain.value = 1; lp.connect(echoIn);
    [[0.32, .45, 900], [0.75, .32, 700], [1.3, .22, 500], [2.1, .14, 400], [3.0, .08, 300]].forEach(function (e) {
      var d = ctx.createDelay(4); d.delayTime.value = e[0] * (far ? 1.3 : 1); var el = ctx.createBiquadFilter(); el.type = 'lowpass'; el.frequency.value = e[2]; var eg = ctx.createGain(); eg.gain.value = e[1] * (far ? 1.4 : 1);
      echoIn.connect(d); d.connect(el); el.connect(eg); eg.connect(bus);
    });
    function src(dur, type, fq, q, peak, tau, att) { var n = ctx.createBufferSource(); n.buffer = noiseBuf; var fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = fq; fl.Q.value = q || 0.7; var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + (att || 0.0008)); g.gain.setTargetAtTime(0, t + (att || 0.0008), tau); n.connect(fl); fl.connect(g); g.connect(sh); n.start(t, Math.random() * 1.5); n.stop(t + dur); }
    if (!far) { src(0.2, 'highpass', 600, 0.7, 1.6, 0.02); src(0.4, 'bandpass', 1800, 0.6, 0.9, 0.06); }
    src(3, 'lowpass', far ? 180 : 260, 0.9, 1.4, far ? 0.9 : 0.55, far ? 0.03 : 0.002);
    src(4.5, 'lowpass', 110, 1.2, 0.8, 1.4, 0.05);
    var o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.setValueAtTime(far ? 55 : 95, t); o.frequency.exponentialRampToValueAtTime(26, t + 0.9);
    var oa = far ? 0.03 : 0.004; og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(far ? 0.8 : 1.3, t + oa); og.gain.setTargetAtTime(0, t + oa, far ? 0.8 : 0.5);
    o.connect(og); og.connect(sh); o.start(t); o.stop(t + 4);
  }
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
    // Claves: two dense hardwood sticks. One rests on the cupped hand, which acts as a resonating chamber;
    // the other strikes it. The result is a bright, clearly pitched ring with a short but real sustain, plus a
    // hard wooden click. Bigger claves are lower and ring a little longer.
    claves: function (t, f, note) {
      var P = { small: [2650, 0.085], medium: [2250, 0.1], large: [1800, 0.12] }[note || 'medium'] || [2250, 0.1], fq = P[0] * (1 + (Math.random() - .5) * .006), tau = P[1];
      ring(t, fq, 0.55, tau); ring(t, fq * 1.004, 0.25, tau * 0.9); ring(t, fq * 2.76, 0.1, tau * 0.3); ring(t, fq * 0.33, 0.12, tau * 0.6);
      noise(t, 0.004, 0.7, 'bandpass', fq * 1.6, 1.5, 0.0003);
    },
    // Castanets: two hollowed hardwood shells. Each shell gives a very short, pitched, hollow "tock" from its
    // cavity, plus a dry knock; the two shells land a hair apart. The small (hembra, right hand) is higher, the
    // large (macho, left hand) lower. Paddle castanets strike against a wooden paddle: drier, with a board knock.
    // Roll: the flamenco finger roll, four fingers in turn.
    castanets: function (t, f, note) {
      var v = note || 'small';
      function shell(tt, fq, a, tau) {
        ring(tt, fq, a * 0.5, tau); ring(tt, fq * 1.58, a * 0.18, tau * 0.6); ring(tt, fq * 0.46, a * 0.15, tau * 0.5);
        noise(tt, 0.005, a * 0.8, 'bandpass', fq * 1.25, 1.8, 0.0003);
      }
      function click(tt, fq, a) { shell(tt, fq, a, 0.012); shell(tt + 0.0012 + Math.random() * 0.0015, fq * 1.07, a * 0.8, 0.011); }
      if (v === 'small') click(t, 2700, 1);
      else if (v === 'large') click(t, 1850, 1.05);
      else if (v === 'paddle') { click(t, 2200, 0.9); ring(t, 620, 0.25, 0.01); noise(t, 0.012, 0.35, 'bandpass', 900, 1.5, 0.0005); }
      else if (v === 'roll') { for (var i = 0; i < 16; i++) click(t + i * 0.036 + Math.random() * 0.004, 2700 * (1 + (i % 4) * 0.01), 0.45 + 0.25 * ((i % 4) === 3 ? 1 : 0) + 0.2 * Math.random()); click(t + 16 * 0.036, 2700, 1); }
    },
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
    // Bell tree: about 20 nested brass cup bells on a rod, smallest (highest) at the top. Gliding the beater
    // down goes high to low; gliding up goes low to high. Each bell has a few inharmonic partials and rings on
    // while the next ones sound, and the glide speeds up slightly as it goes.
    belltree: function (t, f, note) {
      var v = note || 'down', N = 20, fr = [];
      for (var i = 0; i < N; i++) fr.push(5200 * Math.pow(1300 / 5200, i / (N - 1)) * (1 + (Math.random() - .5) * .03));
      if (v === 'up') fr.reverse();
      var order = v === 'both' ? fr.concat(fr.slice(0, -1).reverse()) : fr, at = t;
      order.forEach(function (fq, k) {
        var n = k / order.length, vol = 0.09 * (0.7 + 0.3 * Math.sin(n * Math.PI));
        [[1, 1, 1.4], [2.02, .4, .6], [2.93, .25, .35], [4.13, .12, .2]].forEach(function (m) { ring(at, fq * m[0], vol * m[1], m[2] * (fq < 2500 ? 1.2 : 0.9)); });
        noise(at, 0.004, 0.05, 'highpass', 6000, 0.7, 0.0005);
        at += 0.05 * (1 - 0.35 * (k % N) / N);
      });
    },
    // Wind chimes. The material decides everything: metal tubes and rods ring for seconds with bar-like overtones
    // (aluminum lowest and longest, steel brighter, bronze bells with a hum and a minor-third partial), the brass
    // mark tree is a fast shimmering glissando, glass is a high brittle "tink" with a short ring, bamboo is a
    // hollow "tok", hardwood a dry click, and capiz shell a papery clatter. A stroke sweeps across the set, then
    // the pieces keep bumping into each other as they settle.
    marktree: function (t, f, note) {
      var v = note || 'brass', M = WC[v] || WC.brass, fr = [], i, k;
      for (i = 0; i < M.n; i++) fr.push(M.tuned ? M.tuned[i] : M.hi * Math.pow(M.lo / M.hi, i / (M.n - 1)) * (1 + (Math.random() - .5) * .04));
      function hit(at, fq, vol) {
        if (M.wood) { sine(at, fq, vol, M.tau * 1.4); sine(at, fq * 2.4, vol * 0.4, M.tau * 0.6); noise(at, M.tau, vol * 0.6, 'bandpass', fq * 1.8, 2.5, 0.0005); return; }
        M.modes.forEach(function (m) { ring(at, fq * m[0], vol * m[1], m[2] * M.tau); });
        if (M.click) noise(at, 0.004, vol * M.click, 'highpass', 5000, 0.7, 0.0004);
      }
      for (i = 0; i < M.n; i++) hit(t + i * M.gap, fr[i], M.vol);
      var at = t + M.n * M.gap;
      for (k = 0; k < M.after; k++) { at += 0.04 + Math.random() * M.spread / M.after * 2; var n = 1 - k / M.after; hit(at, fr[Math.floor(Math.random() * M.n)], M.vol * (0.25 + 0.5 * n * Math.random())); }
    },
    flexatone: function (t) { var o = ctx.createOscillator(); o.frequency.value = 880; var l = ctx.createOscillator(); l.frequency.value = 9; var d = ctx.createGain(); d.gain.value = 40;
      l.connect(d); d.connect(o.frequency); o.frequency.setValueAtTime(700, t); o.frequency.linearRampToValueAtTime(1100, t + 1.2); o.connect(env(t, 0.25, 1.5, 0.02)); o.start(t); o.stop(t + 1.6); l.start(t); l.stop(t + 1.6); },
    // Thunder sheet: a large, thin steel sheet hung by one edge. Shaking it bends the whole sheet, so its low
    // tones warble and the rumble rolls in waves with the hand; struck with a mallet it booms, then shimmers on
    // for many seconds. Distant thunder is soft and dark; the thunderclap is a hard hit plus a violent shake.
    thundersheet: function (t, f, note) {
      var v = note || 'shake', P = {
        shake: { dur: 7, vol: .9, cut: 700, shake: 5, roll: .45, boom: .3, crack: 0, att: .15 },
        strike: { dur: 8.5, vol: .8, cut: 900, shake: 2.5, roll: .15, boom: 1, crack: .2, att: .004 },
        distant: { dur: 7.5, vol: .55, cut: 260, shake: 3, roll: .6, boom: .2, crack: 0, att: .9 },
        clap: { dur: 8, vol: 1, cut: 1400, shake: 7, roll: .5, boom: 1, crack: 1, att: .003 }
      }[v] || null; if (!P) return;
      var end = t + P.dur, out = ctx.createGain();
      out.gain.setValueAtTime(0.0001, t); out.gain.linearRampToValueAtTime(P.vol, t + P.att); out.gain.setTargetAtTime(0, t + P.att + 0.05, P.dur / 3.5); out.connect(bus);
      var rollL = ctx.createOscillator(), rollG = ctx.createGain(); rollL.frequency.value = 0.35 + Math.random() * 0.3; rollG.gain.setValueAtTime(P.roll * P.vol * 0.5, t); rollG.gain.setTargetAtTime(0, t + P.att + 0.05, P.dur / 3.5); rollL.connect(rollG); rollG.connect(out.gain); rollL.start(t); rollL.stop(end);
      var src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = P.cut; lp.Q.value = 0.8; var lg = ctx.createGain(); lg.gain.value = 0.9; src.connect(lp); lp.connect(lg); lg.connect(out);
      [[140, .7], [300, .5], [620, .35], [1200, .15]].forEach(function (b) {
        var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = Math.min(b[0], P.cut * 1.6); bp.Q.value = 3;
        var l = ctx.createOscillator(), lgn = ctx.createGain(); l.frequency.value = P.shake * (0.8 + Math.random() * 0.4); lgn.gain.value = bp.frequency.value * 0.45; l.connect(lgn); lgn.connect(bp.frequency); l.start(t); l.stop(end);
        var g = ctx.createGain(); g.gain.value = b[1]; src.connect(bp); bp.connect(g); g.connect(out);
      });
      src.start(t, Math.random() * 2); src.stop(end + 0.1);
      [48, 67, 93, 131, 177, 242, 318, 437, 590].forEach(function (fq, k) {
        if (fq > P.cut * 1.2) return;
        var o = ctx.createOscillator(), g = ctx.createGain(), w = ctx.createOscillator(), wg = ctx.createGain();
        o.frequency.value = fq * (1 + (Math.random() - .5) * .04); w.frequency.value = P.shake * (0.6 + Math.random() * 0.8); wg.gain.value = fq * 0.05; w.connect(wg); wg.connect(o.frequency);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.1 / (1 + k * 0.3), t + P.att + 0.01); g.gain.setTargetAtTime(0, t + P.att + 0.01, P.dur / (3 + k * 0.4));
        o.connect(g); g.connect(out); o.start(t); w.start(t); o.stop(end); w.stop(end);
      });
      if (P.boom) { sine(t, 70, 0.6 * P.boom * P.vol, 1.2, 'sine', 45, 0.4, 0.004); noise(t, 0.5, 0.4 * P.boom, 'lowpass', 500, 0.7, 0.004); }
      if (P.crack) { noise(t, 0.25, 0.7 * P.crack, 'highpass', 1800, 0.7, 0.001); noise(t + 0.02, 0.6, 0.45 * P.crack, 'bandpass', 2500, 1, 0.002); }
    },
    hammer: function (t) { sine(t, 60, 1, 0.5, 'sine', 40, 0.1); noise(t, 0.15, 0.9, 'lowpass', 700); },
    slapstick: function (t) { noise(t, 0.05, 1, 'highpass', 1500); sine(t, 900, 0.3, 0.04); },
    // Ratchet: turning the handle drags wooden tongues over a wooden cog. Each tooth gives a sharp wooden snap
    // plus the hollow resonance of the frame; the orchestral ratchet has two tongues, so every tooth is a thick
    // double clack. Cranking by hand makes the speed swell and sag slightly with each turn.
    ratchet: function (t, f, note) {
      var v = note || 'slow', P = { slow: [13, 1.6, 1], fast: [26, 1.6, 1], burst: [22, 0.45, 1], small: [30, 0.9, 0.55] }[v] || [13, 1.6, 1];
      var rate = P[0], dur = P[1], big = P[2], small = v === 'small', at = t, ph = 0;
      function clack(tt, a) {
        noise(tt, 0.006, a * 0.9, 'bandpass', small ? 3800 : 2600, 1.4, 0.0003);
        noise(tt, 0.035, a * 0.7, 'bandpass', small ? 1500 : 650, 3, 0.0008);
        [[small ? 900 : 420, .5, .035], [small ? 1600 : 780, .35, .025], [small ? 2500 : 1150, .2, .015]].forEach(function (m) { ring(tt, m[0], a * m[1] * 0.6, m[2]); });
      }
      while (at < t + dur) {
        var env = Math.min(1, (at - t) / 0.08) * (at > t + dur - 0.15 ? (t + dur - at) / 0.15 : 1);
        var a = big * (0.55 + 0.45 * env) * (0.85 + Math.random() * 0.15);
        clack(at, a); if (!small) clack(at + 0.009 + Math.random() * 0.004, a * 0.7);
        ph += 0.35; at += 1 / (rate * (1 + 0.15 * Math.sin(ph)));
      }
    },
    logdrum: function (t, f) { sine(t, f, 0.6, 0.35); sine(t, f * 2.5, 0.12, 0.12); noise(t, 0.02, 0.2, 'bandpass', f * 3, 2); },
    rute: function (t) { for (var i = 0; i < 10; i++) noise(t + Math.random() * 0.03, 0.03, 0.4, 'bandpass', 3000 + Math.random() * 2000, 2); },
    // Güiro: a hollow gourd with ridges, scraped with a stick. Each ridge the stick crosses is a tiny click that
    // excites the gourd's hollow cavity, so the scrape is a rasp with a woody, vowel-like body. The stick speeds
    // up through the middle of a stroke. Long = down-stroke, short = quick up-stroke, tap = stick on the ridges.
    // Güira: the metal scraper of merengue, scraped with a wire brush, brighter and with no hollow body.
    guiro: function (t, f, note) {
      var v = note || 'long', metal = /^gu/.test(v);
      var P = { long: [0.36, 30], short: [0.085, 8], gulong: [0.22, 34], gushort: [0.07, 10] }[v];
      var cav = ctx.createGain(); cav.gain.value = 1;
      if (!metal) [[620, 6, 5], [1250, 5, 2.6], [2300, 4, 1]].forEach(function (b) { var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = b[0] * (v === 'short' ? 1.05 : 1); bp.Q.value = b[1]; var g = ctx.createGain(); g.gain.value = b[2]; cav.connect(bp); bp.connect(g); g.connect(bus); });
      function tick(tt, a) {
        var sN = ctx.createBufferSource(); sN.buffer = noiseBuf; var g = ctx.createGain(); g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(a, tt + 0.0006); g.gain.setTargetAtTime(0, tt + 0.0006, metal ? 0.0025 : 0.002);
        var hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = metal ? 6000 : 2600; hp.Q.value = metal ? 1.5 : 1.2; var dg = ctx.createGain(); dg.gain.value = metal ? 1 : 0.35; sN.connect(g); g.connect(hp); hp.connect(dg); dg.connect(bus); if (!metal) g.connect(cav);
        sN.start(tt, Math.random() * 2); sN.stop(tt + 0.03);
        if (metal) { ring(tt, 3300 + Math.random() * 400, a * 0.08, 0.015); ring(tt, 5100 + Math.random() * 500, a * 0.05, 0.01); }
      }
      if (v === 'tap') { tick(t, 1); ring(t, 620, 0.3, 0.035); ring(t, 1250, 0.12, 0.02); return; }
      var dur = P[0], n = P[1];
      for (var i = 0; i < n; i++) { var x = i / (n - 1), pos = (1 - Math.cos(Math.PI * x)) / 2; tick(t + dur * (0.5 * x + 0.5 * pos) + Math.random() * 0.001, (metal ? 0.5 : 0.7) * (0.6 + 0.4 * Math.sin(Math.PI * x)) * (0.85 + Math.random() * 0.3)); }
    },
    cabasa: function (t) { noise(t, 0.12, 0.5, 'highpass', 6000, 0.7, 0.03); noise(t + 0.2, 0.08, 0.4, 'highpass', 6000); },
    // Vibraslap: the palm hits the ball, the bent wire whips back and forth, and the loose metal teeth chatter
    // inside the hollow wooden box. Each swing of the wire is one burst of several teeth clicking, colored by the
    // box's woody resonance; the swings come fast at first and slow slightly as the energy dies away.
    // Quijada: the original, a dried jawbone whose loose teeth give a drier, bonier rattle with no box.
    vibraslap: function (t, f, note) {
      var v = note || 'large', P = { large: [27, 1.5, 850, 1], small: [34, 1.1, 1300, 0.85], quijada: [22, 0.9, 1600, 0.9] }[v] || [27, 1.5, 850, 1];
      var rate = P[0], dur = P[1], box = P[2], vol = P[3], bone = v === 'quijada';
      // the first slap: all the teeth hit at once and the whole box knocks
      sine(t, 190, 0.5 * vol, 0.08, 'sine', 120, 0.05);
      if (!bone) { ring(t, box * 0.55, 0.7 * vol, 0.045); ring(t, box, 0.55 * vol, 0.035); ring(t, box * 1.7, 0.3 * vol, 0.02); }
      else { ring(t, 1100, 0.5 * vol, 0.02); ring(t, 1900, 0.3 * vol, 0.012); }
      noise(t, 0.012, 1.1 * vol, 'bandpass', bone ? 3000 : 2400, 1.2, 0.0003);
      for (var z = 0; z < 6; z++) noise(t + Math.random() * 0.006, 0.008, 0.7 * vol, 'bandpass', 3500 + Math.random() * 3000, 5, 0.0003);
      var at = t + 0.012, i = 0;
      while (at < t + dur) {
        var a = vol * Math.exp(-(at - t) / (dur * 0.33)) * (0.8 + Math.random() * 0.2);
        for (var k = 0; k < 4; k++) { var tk = at + Math.random() * 0.006;
          noise(tk, 0.008, a * 1.5, 'bandpass', bone ? 2200 + Math.random() * 1500 : 3500 + Math.random() * 3000, bone ? 2 : 6, 0.0003); }
        if (!bone) { noise(at, 0.035, a * 1.5, 'bandpass', box, 4, 0.001); ring(at, box * 0.55, a * 0.35, 0.025); ring(at, box, a * 0.25, 0.02); }
        else ring(at, 1100 + Math.random() * 200, a * 0.25, 0.012);
        i++; at += (1 / rate) * (1 + i * 0.012);
      }
    },
    // Sandpaper blocks: two wooden blocks faced with sandpaper, rubbed together. The grit changes the sound, not
    // just the volume: coarse paper is louder, lower and audibly grainy (you hear individual scratches); medium is
    // a smoother rasp; fine paper is a soft, high, even hiss. Slap: the blocks struck face to face.
    sandpaper: function (t, f, note) {
      var v = note || 'medium';
      if (v === 'slap') { ring(t, 520, 0.45, 0.03); ring(t, 1150, 0.25, 0.018); noise(t, 0.03, 0.8, 'bandpass', 2200, 0.8, 0.0005); noise(t, 0.06, 0.3, 'bandpass', 5000, 0.7, 0.002); return; }
      var P = { coarse: [1700, 0.6, 1, 260, 0.26], medium: [3000, 0.7, 0.75, 110, 0.24], fine: [5600, 0.9, 0.5, 0, 0.22] }[v] || [3000, 0.7, 0.75, 110, 0.24];
      var dur = P[4], src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = P[0]; bp.Q.value = P[1];
      var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = P[0] * 0.35;
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t);
      for (var k = 0; k <= 12; k++) g.gain.linearRampToValueAtTime(P[2] * 0.75 * Math.pow(Math.sin(Math.PI * k / 12), 0.6), t + dur * k / 12);
      src.connect(bp); bp.connect(hp); hp.connect(g); g.connect(bus); src.start(t, Math.random() * 2); src.stop(t + dur + 0.05);
      var grains = Math.round(P[3] * dur);
      for (var i = 0; i < grains; i++) { var x = Math.random(); noise(t + x * dur, 0.004, P[2] * 0.5 * Math.sin(Math.PI * x) * (0.4 + Math.random() * 0.6), 'bandpass', 1200 + Math.random() * 3500, 3, 0.0003); }
      ring(t, 600, 0.08 * P[2], 0.012);
    },
    // Rainstick: a dried cactus tube with thorns pushed through it in a spiral, filled with pebbles or seeds.
    // Tipped over, the pebbles trickle down past the thorns: a rush as the pile starts to slide, a dense, soft
    // patter, then the flow thins out to the last few pebbles. Each pebble-on-thorn is a tiny bright tick with a
    // little woody knock, and the hollow tube warms the whole sound.
    rainstick: function (t, f, note) {
      var v = note || 'medium';
      if (v === 'shake') { [0, 0.35, 0.7].forEach(function (o, k) { rain(t + o, 0.45, 260, k === 2 ? 1 : 0.8, true); }); return; }
      var P = { slow: [7.5, 170], medium: [5.5, 200], quick: [2.4, 320] }[v] || [5.5, 200];
      rain(t, P[0], P[1], 1, false);
    },
    // Wind machine: a slatted wooden drum turned by a crank against a canvas sheet. Speed is everything: faster
    // turning makes the whoosh louder and higher, and the slats passing the canvas add a soft flutter whose rate
    // follows the speed. Lengths from a single gust to a full storm of gusts.
    windmachine: function (t, f, note) {
      var v = note || 'medium', D = { gust: 2.2, medium: 4.5, long: 8, storm: 12 }[v] || 4.5, N = 200, sp = new Float32Array(N);
      for (var i = 0; i < N; i++) { var x = i / (N - 1), e = Math.sin(Math.PI * Math.pow(x, v === 'gust' ? 0.8 : 0.7));
        if (v === 'storm') e = 0.45 * e + 0.55 * e * Math.pow(Math.abs(Math.sin(x * Math.PI * 4.5 + 0.4)), 1.5);
        if (v === 'long') e *= 0.85 + 0.15 * Math.sin(x * Math.PI * 3);
        sp[i] = Math.max(0.0001, e); }
      speedNoise(t, D, sp, 260, 1500, 0.8, 1.6, 7, 22);
    },
    // Siren: a hand-cranked mechanical siren. A spinning rotor chops air through the ports, so the pitch is the
    // chopping rate: a buzzy, breathy tone. The heavy rotor rises slowly while cranked and coasts down for
    // seconds after it is let go; the brake stops it fast.
    siren: function (t, f, note) {
      var v = note || 'wail', P = { wail: [2.6, 0, 820, 5.5], whoop: [0.8, 0, 560, 2.2], brake: [2.6, 1.2, 820, 0.45] }[v] || [2.6, 0, 820, 5.5];
      var up = P[0], hold = P[1], top = P[2], down = P[3], end = t + up + hold + down + 0.3;
      var o = ctx.createOscillator(), h = 24, re = new Float32Array(h), im = new Float32Array(h);
      for (var k = 1; k < h; k++) im[k] = (k % 2 ? 1 : 0.55) / Math.pow(k, 0.9);
      o.setPeriodicWave(ctx.createPeriodicWave(re, im));
      var fq = o.frequency; fq.setValueAtTime(70, t); fq.setTargetAtTime(top, t, up / 2.2); fq.setValueAtTime(top * 0.98, t + up + hold);
      fq.setTargetAtTime(v === 'brake' ? 60 : 55, t + up + hold, down / (v === 'brake' ? 2.5 : 3));
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(500, t); lp.frequency.setTargetAtTime(top * 4, t, up / 2.2); lp.frequency.setTargetAtTime(400, t + up + hold, down / 3);
      var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.setTargetAtTime(0.24, t, up / 2.5); g.gain.setTargetAtTime(0, t + up + hold, down / 3);
      o.connect(lp); lp.connect(g); g.connect(bus); o.start(t); o.stop(end);
      var air = ctx.createBufferSource(); air.buffer = noiseBuf; air.loop = true; var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.5;
      bp.frequency.setValueAtTime(300, t); bp.frequency.setTargetAtTime(top * 3, t, up / 2.2); bp.frequency.setTargetAtTime(250, t + up + hold, down / 3);
      var ag = ctx.createGain(); ag.gain.setValueAtTime(0.0001, t); ag.gain.setTargetAtTime(0.18, t, up / 2.5); ag.gain.setTargetAtTime(0, t + up + hold, down / 3.5);
      air.connect(bp); bp.connect(ag); ag.connect(bus); air.start(t, Math.random() * 2); air.stop(end);
    },
    // Cannon: the muzzle blast is a violent, distorted crack, then a huge low boom that drops in pitch, a
    // rumbling tail, and echoes coming back off the landscape. From far away the crack is lost: you hear a dark,
    // softer boom and a long roll. A volley is several guns firing a moment apart.
    cannon: function (t, f, note) {
      var v = note || 'near';
      if (v === 'volley') { [0, 0.42, 0.95].forEach(function (o, k) { blast(t + o, k === 1 ? 0.8 : 1, false); }); return; }
      blast(t, 1, v === 'distant');
    },
    // Taxi horns: squeeze-bulb horns, a reed buzzing into a small brass bell. Nasal and buzzy; the pitch scoops
    // up as the bulb is squeezed and sags as the air runs out. Klaxon: the old motor horn, "ah-oo-gah", its pitch
    // and vowel swinging as the motor spins up and down. Modern car horn: two electric horns sounding together.
    taxihorn: function (t, f, note) {
      var v = note || 'mid';
      function horn(tt, fq, dur, vol, glide, form) {
        var o = ctx.createOscillator(), h = 30, re = new Float32Array(h), im = new Float32Array(h); for (var k = 1; k < h; k++) im[k] = 1 / Math.pow(k, 0.75); o.setPeriodicWave(ctx.createPeriodicWave(re, im));
        if (glide) o.frequency.setValueCurveAtTime(glide, tt, dur); else { o.frequency.setValueAtTime(fq * 0.92, tt); o.frequency.exponentialRampToValueAtTime(fq, tt + 0.045); o.frequency.setValueAtTime(fq, tt + dur * 0.7); o.frequency.exponentialRampToValueAtTime(fq * 0.96, tt + dur); }
        var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
        var f1 = ctx.createBiquadFilter(); f1.type = 'peaking'; f1.frequency.value = form || 1900; f1.Q.value = 2; f1.gain.value = 12;
        var f2 = ctx.createBiquadFilter(); f2.type = 'peaking'; f2.frequency.value = (form || 1900) * 1.6; f2.Q.value = 2.5; f2.gain.value = 7;
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6000;
        var g = ctx.createGain(); g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(vol, tt + 0.02); g.gain.setValueAtTime(vol, tt + dur - 0.06); g.gain.linearRampToValueAtTime(0, tt + dur);
        o.connect(hp); hp.connect(f1); f1.connect(f2); f2.connect(lp); lp.connect(g); g.connect(bus); o.start(tt); o.stop(tt + dur + 0.02);
        return f1;
      }
      if (v === 'high') horn(t, 700, 0.32, 0.16);
      else if (v === 'mid') horn(t, 520, 0.36, 0.17);
      else if (v === 'low') horn(t, 370, 0.4, 0.18, null, 1500);
      else if (v === 'klaxon') {
        var N = 60, gl = new Float32Array(N); for (var i = 0; i < N; i++) { var x = i / (N - 1); gl[i] = 230 + 330 * Math.sin(Math.PI * Math.min(1, x * 1.35)) * (x < 0.74 ? 1 : 0.75); }
        var fm = horn(t, 0, 1.0, 0.17, gl, 900); fm.frequency.setValueAtTime(700, t); fm.frequency.linearRampToValueAtTime(1500, t + 0.3); fm.frequency.linearRampToValueAtTime(800, t + 0.65); fm.frequency.linearRampToValueAtTime(1200, t + 1);
      }
      else if (v === 'car') { horn(t, 415, 0.55, 0.11, null, 2200); horn(t, 518, 0.55, 0.1, null, 2400); }
    },
    // Typewriter: each key sends a steel typebar slamming into the rubber platen (a sharp clack with a metallic
    // ring and a thud through the frame), then the escapement ticks the carriage along. The space bar only moves
    // the carriage (a dull thunk). Near the margin a small bell dings. The carriage return lever ratchets the paper
    // up a line, then the carriage slides back and slams.
    typewriter: function (t, f, note) {
      var v = note || 'typing';
      function key(tt, a) {
        noise(tt - 0.02, 0.006, a * 0.15, 'bandpass', 1500, 1.5, 0.0005);
        noise(tt, 0.007, a * 0.9, 'bandpass', 2800 + Math.random() * 800, 1.1, 0.0003);
        ring(tt, 1150 + Math.random() * 60, a * 0.18, 0.018); ring(tt, 2450 + Math.random() * 100, a * 0.12, 0.012); ring(tt, 3900, a * 0.06, 0.008);
        ring(tt, 170, a * 0.35, 0.025); noise(tt + 0.018, 0.004, a * 0.25, 'highpass', 4000, 0.7, 0.0003);
      }
      function space(tt) { ring(tt, 240, 0.35, 0.03); noise(tt, 0.02, 0.35, 'lowpass', 1400, 0.7, 0.001); noise(tt + 0.02, 0.004, 0.25, 'highpass', 4000, 0.7, 0.0003); }
      function bell(tt) { ring(tt, 2780, 0.3, 0.45); ring(tt, 2780 * 2.41, 0.08, 0.18); ring(tt, 2780 * 4.1, 0.03, 0.08); noise(tt, 0.004, 0.2, 'highpass', 5000, 0.7, 0.0003); }
      function ret(tt) {
        for (var i = 0; i < 3; i++) { noise(tt + i * 0.045, 0.006, 0.5, 'bandpass', 2200, 2, 0.0003); ring(tt + i * 0.045, 900, 0.1, 0.01); }
        var sN = ctx.createBufferSource(); sN.buffer = noiseBuf; var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(900, tt + 0.15); bp.frequency.linearRampToValueAtTime(1600, tt + 0.5); bp.Q.value = 1.2;
        var g = ctx.createGain(); g.gain.setValueAtTime(0, tt + 0.15); g.gain.linearRampToValueAtTime(0.25, tt + 0.45); g.gain.linearRampToValueAtTime(0, tt + 0.52);
        sN.connect(bp); bp.connect(g); g.connect(bus); sN.start(tt + 0.15, Math.random()); sN.stop(tt + 0.55);
        ring(tt + 0.52, 150, 0.7, 0.05); ring(tt + 0.52, 820, 0.3, 0.04); ring(tt + 0.52, 1900, 0.15, 0.03); noise(tt + 0.52, 0.03, 0.8, 'bandpass', 1500, 0.8, 0.0005);
      }
      if (v === 'typing') { var at = t; for (var i = 0; i < 8; i++) { if (i === 4) { space(at); at += 0.1 + Math.random() * 0.05; continue; } key(at, 0.75 + Math.random() * 0.25); at += 0.08 + Math.random() * 0.07; } }
      else if (v === 'key') key(t, 1);
      else if (v === 'space') space(t);
      else if (v === 'bell') bell(t);
      else if (v === 'return') ret(t);
    },
    // Slide whistle: a breathy, flute-like tone whose pitch follows the plunger. Pushing the plunger in shortens
    // the tube (pitch rises); pulling it out lowers it. The shape of the slide is the whole joke.
    slidewhistle: function (t, f, note) {
      var v = note || 'up', lo = 560, hi = 2100, S = {
        up: [0.55, function (x) { return Math.pow(x, 0.8); }],
        down: [0.55, function (x) { return 1 - Math.pow(x, 0.8); }],
        updown: [1.1, function (x) { return Math.sin(Math.PI * x); }],
        wobble: [1.3, function (x) { return 0.45 + 0.2 * Math.sin(x * Math.PI * 2 * 7) * (0.4 + 0.6 * x); }],
        bomb: [2.4, function (x) { return 1 - Math.pow(x, 1.6); }],
        zip: [0.18, function (x) { return x; }]
      }[v] || null; if (!S) return;
      var dur = S[0], N = 120, c = new Float32Array(N); for (var i = 0; i < N; i++) c[i] = lo * Math.pow(hi / lo, Math.max(0, Math.min(1, S[1](i / (N - 1)))));
      var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain(); o.frequency.setValueCurveAtTime(c, t, dur);
      var c2 = new Float32Array(N); for (i = 0; i < N; i++) c2[i] = c[i] * 2; o2.frequency.setValueCurveAtTime(c2, t, dur); g2.gain.value = 0.12;
      var vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 5.5; vg.gain.value = 6; vib.connect(vg); vg.connect(o.frequency);
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.03); g.gain.setValueAtTime(0.22, t + dur - 0.05); g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus);
      var br = ctx.createBufferSource(); br.buffer = noiseBuf; var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3; bp.frequency.setValueCurveAtTime(c, t, dur); var bg = ctx.createGain();
      bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(0.1, t + 0.02); bg.gain.setValueAtTime(0.1, t + dur - 0.05); bg.gain.linearRampToValueAtTime(0, t + dur); br.connect(bp); bp.connect(bg); bg.connect(bus);
      [o, o2, vib].forEach(function (x) { x.start(t); x.stop(t + dur + 0.02); }); br.start(t, Math.random()); br.stop(t + dur + 0.02);
    },
    // Bird whistles. Water warbler: a whistle half full of water; the bubbles make the pitch jump and gurgle
    // like a nightingale. Cuckoo: two hollow notes falling a third. Songbird: quick bright chirps and a trill.
    // Twist call: a metal stem turned in a wooden barrel, rubbed with rosin, gives scratchy squeaks. Owl: a low,
    // breathy "hoo, hoo-hoo".
    birdwhistle: function (t, f, note) {
      var v = note || 'warbler', i, at;
      function tone(tt, dur, curve, vol, breath, h3) {
        var o = ctx.createOscillator(); o.frequency.setValueCurveAtTime(curve, tt, dur);
        var g = ctx.createGain(); g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(vol, tt + Math.min(0.02, dur / 4)); g.gain.setValueAtTime(vol, tt + dur * 0.75); g.gain.linearRampToValueAtTime(0, tt + dur);
        o.connect(g); g.connect(bus); o.start(tt); o.stop(tt + dur + 0.02);
        if (h3) { var o3 = ctx.createOscillator(), c3 = new Float32Array(curve.length); for (var k = 0; k < curve.length; k++) c3[k] = curve[k] * 3; o3.frequency.setValueCurveAtTime(c3, tt, dur); var g3 = ctx.createGain(); g3.gain.value = h3; o3.connect(g3); g3.connect(g); o3.start(tt); o3.stop(tt + dur + 0.02); }
        if (breath) { var n = ctx.createBufferSource(); n.buffer = noiseBuf; var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2; bp.frequency.setValueCurveAtTime(curve, tt, dur); var bg = ctx.createGain(); bg.gain.value = breath; n.connect(bp); bp.connect(bg); bg.connect(g); n.start(tt, Math.random()); n.stop(tt + dur + 0.02); }
      }
      function curve(n, fn) { var c = new Float32Array(n); for (var k = 0; k < n; k++) c[k] = fn(k / (n - 1)); return c; }
      if (v === 'warbler') {
        var ph = 0, c = curve(400, function (x) { ph += 0.2 + Math.random() * 0.25; return 2600 + 700 * Math.sin(ph) * (Math.random() < 0.15 ? 1.6 : 1) + 300 * Math.sin(x * 9); });
        tone(t, 1.6, c, 0.16, 0.8, 0.05);
        for (i = 0; i < 18; i++) noise(t + Math.random() * 1.6, 0.012, 0.05, 'bandpass', 1500 + Math.random() * 1500, 4, 0.002);
      } else if (v === 'cuckoo') {
        [0, 0.75].forEach(function (o) { tone(t + o, 0.24, curve(20, function (x) { return 780 * (1 - 0.01 * x); }), 0.26, 0.35, 0.06); tone(t + o + 0.3, 0.34, curve(20, function (x) { return 622 * (1 - 0.015 * x); }), 0.24, 0.35, 0.06); });
      } else if (v === 'songbird') {
        at = t;
        for (i = 0; i < 5; i++) { var up = i % 2 === 0; tone(at, 0.07, curve(30, function (x) { return up ? 3200 + 2200 * x : 5600 - 2000 * x; }), 0.22, 0.15); at += 0.11; }
        at += 0.12; for (i = 0; i < 10; i++) { tone(at, 0.035, curve(12, function (x) { return 4200 + 900 * Math.sin(Math.PI * x); }), 0.2, 0.1); at += 0.045; }
        tone(at + 0.08, 0.16, curve(30, function (x) { return 4800 - 1800 * x; }), 0.22, 0.15);
      } else if (v === 'twist') {
        at = t;
        for (i = 0; i < 6; i++) { var d = 0.09 + Math.random() * 0.05, b = 2300 + Math.random() * 800;
          tone(at, d, curve(40, function (x) { return b + 900 * Math.sin(Math.PI * x) + 250 * Math.sin(x * 60); }), 0.13, 1.4, 0.2); at += d + 0.035 + (i === 2 ? 0.15 : 0); }
      } else if (v === 'owl') {
        [[0, 0.5], [0.8, 0.22], [1.08, 0.55]].forEach(function (p) { tone(t + p[0], p[1], curve(20, function (x) { return 390 - 25 * x; }), 0.3, 0.6, 0.03); });
      }
    },
    // Ocean drum: a double-headed frame drum filled with small steel beads. Tilting it rolls the beads across the
    // head: thousands of tiny bead-on-skin taps blur into a "shhh" that swells and recedes like a wave, the skin
    // hums low underneath, and on a big wave the beads crash into the rim. A hand tap splashes the beads.
    oceandrum: function (t, f, note) {
      var v = note || 'gentle', P = { gentle: [3.2, 0.7, 1, 0], big: [4.2, 1, 1, 1], rolling: [9, 0.75, 3, 0], tap: [0.9, 0.7, 1, 0] }[v] || [3.2, 0.7, 1, 0];
      var dur = P[0], vol = P[1], waves = P[2], N = 300, e = new Float32Array(N), br = new Float32Array(N);
      for (var i = 0; i < N; i++) { var x = i / (N - 1), w;
        if (v === 'tap') w = Math.exp(-x * 4) * (1 - Math.exp(-x * 60));
        else { var ph = (x * waves) % 1; w = Math.pow(Math.sin(Math.PI * ph), 1.4); if (v === 'big') w = Math.pow(Math.sin(Math.PI * Math.pow(x, 0.75)), 1.2); }
        e[i] = Math.max(0.0001, w * vol * 0.55); br[i] = 2200 + 3200 * w; }
      var src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.6; bp.frequency.setValueCurveAtTime(br, t, dur);
      var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
      var g = ctx.createGain(); g.gain.setValueCurveAtTime(e, t, dur);
      src.connect(bp); bp.connect(hp); hp.connect(g); g.connect(bus);
      var lo = ctx.createBiquadFilter(); lo.type = 'lowpass'; lo.frequency.value = 160; var lg = ctx.createGain(), le = new Float32Array(N); for (i = 0; i < N; i++) le[i] = e[i] * 0.9; lg.gain.setValueCurveAtTime(le, t, dur);
      src.connect(lo); lo.connect(lg); lg.connect(bus); src.start(t, Math.random() * 2); src.stop(t + dur + 0.05);
      var grains = Math.round(dur * 140);
      for (i = 0; i < grains; i++) { var gx = Math.random(), gi = Math.floor(gx * (N - 1)); if (Math.random() > e[gi] / (vol * 0.55)) continue; noise(t + gx * dur, 0.003, 0.12 * vol, 'bandpass', 3000 + Math.random() * 4000, 3, 0.0003); }
      if (v === 'tap') { ring(t, 110, 0.5, 0.12); noise(t, 0.02, 0.4, 'lowpass', 900, 0.7, 0.001); }
      if (P[3]) { var tc = t + dur * 0.62; for (i = 0; i < 40; i++) noise(tc + Math.random() * 0.25, 0.006, 0.35 * Math.random(), 'bandpass', 2500 + Math.random() * 3000, 2, 0.0003); ring(tc, 95, 0.35, 0.2); }
    },
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
    woodblock: ['wb-high_D', 'wb-mid_F', 'wb-low_G'], xylophone: ['xylo-Db5'], framedrum: ['frame-low', 'frame-open', 'frame-high', 'frame-short'], taxihorn: ['honker'], belltree: ['belltree-real'], rainstick: ['rainstick-real'], triangle: ['triangle-real'], templeblocks: ['wb-high_F', 'wb-high_D', 'wb-high_A', 'wb-low_Bb', 'wb-low_F']
  };
  function real(inst, t, f, note) {
    var K = window.KitSamples, d, m, s;
    if (PRE[inst]) preload(PRE[inst]);
    switch (inst) {
      // Real recordings from Doug's own Splice library (Cinematic Percussion, Mickey Hart, Murda Beatz packs).
      case 'xylophone': m = midiOf(note); if (m === null) return false; return oplay('xylo-Db5', t, .85, Math.pow(2, (m - 73) / 12));
      case 'framedrum': return oplay({ low: 'frame-low', open: 'frame-open', high: 'frame-high', short: 'frame-short' }[note || 'open'] || 'frame-open', t, .9, 1);
      case 'taxihorn': var hr = { high: 1.3, mid: 1, low: 0.72 }[note]; if (!hr) return false; return oplay('honker', t, .8, hr);
      case 'belltree': if (note && note !== 'down') return false; return oplay('belltree-real', t, .9, 1);
      case 'rainstick': if (note !== 'medium') return false; return oplay('rainstick-real', t, .9, 1);
      case 'triangle':
        var tv = (note || 'medium').split(':')[0]; if (/roll|muffled/.test(note || '')) return false;
        if (!oplay('triangle-real', t, .75, { small: 1.15, medium: 1, large: .86 }[tv] || 1)) return false;
        var tb = bus, tg = ctx.createGain(); tg.gain.value = 0.35; tg.connect(tb); bus = tg; try { V.triangle(t, 0, note); } finally { bus = tb; }
        return true;
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
    var saved = bus, ib = instBus(inst); bus = ib; if (gain && gain !== 1) { var gg = ctx.createGain(); gg.gain.value = gain; gg.connect(ib); bus = gg; }
    try { if (!real(inst, t, f, note)) V[inst](t, f, note); } finally { bus = saved; }
    if (btn) { var dl = Math.max(0, (t - ctx.currentTime) * 1000); setTimeout(function () { btn.classList.add('hit'); setTimeout(function () { btn.classList.remove('hit'); }, 160); }, dl); }
    if (!when && window.gtag) gtag('event', 'drum_room_play', { instrument: inst });
  }
  function scale(inst, notes, card) {
    if (!audio()) return;
    var keys = card.querySelectorAll('[data-note]');
    SCT[inst] = (SCT[inst] || []).concat(notes.map(function (n, i) { return setTimeout(function () { play(inst, n, keys[i]); }, i * 280); }));
  }
  // ---------- Stop ----------
  // Every instrument plays through its own channel. Stopping fades that channel out in a few milliseconds and
  // throws it away, which silences everything it was playing: notes already scheduled by a pattern, long rolls,
  // ringing vibes, thunder, rain. The next note simply gets a fresh channel.
  function instBus(name) {
    if (!IB[name]) { var g = ctx.createGain(); g.gain.value = 1; g.connect(ROOT); IB[name] = g; }
    return IB[name];
  }
  function hush(name) {
    (SCT[name] || []).forEach(clearTimeout); SCT[name] = [];
    var g = IB[name]; if (!g || !ctx) return; delete IB[name];
    g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setTargetAtTime(0, ctx.currentTime, 0.012);
    setTimeout(function () { try { g.disconnect(); } catch (e) {} }, 250);
    if (name === 'vibraphone') VIBE.ring = [];
  }
  function stopInst(snd) {
    if (patBtn && patBtn.getAttribute('data-inst') === snd) stopPat();
    hush(snd); if (snd === 'snare') hush('snareroll');
  }
  function stopAll() { stopPat(); Object.keys(SCT).concat(Object.keys(IB)).forEach(hush); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') stopAll(); });

  // ---------- Patterns: three rhythmic ideas per instrument, played twice ----------
  var patTimer = null, patBtn = null;
  function stopPat() { if (patTimer) { patTimer.forEach(clearTimeout); patTimer = null; } if (patBtn) { patBtn.classList.remove('on'); patBtn = null; } }
  function playPat(btn) {
    if (!audio()) return;
    var was = btn === patBtn; if (patBtn) hush(patBtn.getAttribute('data-inst')); stopPat(); if (was) return;
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
    var sb = e.target.closest('[data-stop]'); if (sb) { var w = sb.getAttribute('data-stop'); if (w === '*') stopAll(); else stopInst(w); return; }
    var pb = e.target.closest('[data-pat]'); if (pb) { playPat(pb); return; }
    var vp = e.target.closest('[data-vpedal]'); if (vp) { audio(); setPedal(vp.getAttribute('data-vpedal')); if (window.gtag) gtag('event', 'vibe_pedal', { pedal: vp.getAttribute('data-vpedal') }); return; }
    var b = e.target.closest('[data-inst]'); if (!b) return;
    var card = b.closest('.inst');
    if (b.hasAttribute('data-scale')) { var ks = [].map.call(card.querySelectorAll('[data-note]'), function (k) { return k.getAttribute('data-note'); }); scale(b.getAttribute('data-inst'), ks, card); return; }
    play(b.getAttribute('data-inst'), b.getAttribute('data-note'), b);
  });
})();
