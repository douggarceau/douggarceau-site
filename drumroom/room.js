/* Drum Room sounds: snare, toms and suspended cymbal use the real recorded kit samples (sounds/kit);
   instruments with no recording yet are synthesized in the browser. */
(function () {
  var ctx, bus, noiseBuf;
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); if (window.KitSamples) KitSamples.load(ctx, '../sounds/kit/'); setTimeout(function () { Object.keys(PRE).forEach(function (k) { preload(PRE[k]); }); ['timp-pp-G', 'timp-ff-G', 'timp-mf-C', 'timp-mf-Bb'].forEach(obuf); }, 0);
      var len = ctx.sampleRate * 3; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
      var master = ctx.createGain(); master.gain.value = 0.8;
      // small room reverb
      var rl = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, rl, ctx.sampleRate);
      for (var c = 0; c < 2; c++) { var ch = ir.getChannelData(c); for (var j = 0; j < rl; j++) ch[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / rl, 3); }
      var verb = ctx.createConvolver(); verb.buffer = ir; var wet = ctx.createGain(); wet.gain.value = 0.18;
      bus = ctx.createGain(); bus.connect(comp); bus.connect(verb); verb.connect(wet); wet.connect(comp);
      comp.connect(master); master.connect(ctx.destination);
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
  function metal(t, dur, vol, base, bp, att) {
    var band = ctx.createBiquadFilter(); band.type = 'bandpass'; band.frequency.value = bp; band.Q.value = 0.6;
    band.connect(env(t, vol, dur, att));
    [1, 1.47, 2.09, 2.56, 3.21, 4.12, 5.3].forEach(function (r) { var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = base * r; o.connect(band); o.start(t); o.stop(t + dur + 0.05); });
  }
  var MIDI = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  var V = {
    xylophone: function (t, f) { sine(t, f, 0.5, 0.45); sine(t, f * 3, 0.12, 0.15); noise(t, 0.02, 0.2, 'bandpass', 3000, 1.5); },
    marimba: function (t, f) { sine(t, f, 0.6, 1.3, 'sine', 0, 0, 0.006); sine(t, f * 4, 0.12, 0.25); sine(t, f * 10, 0.03, 0.06); },
    glockenspiel: function (t, f) { sine(t, f, 0.35, 2.2); sine(t, f * 2.76, 0.12, 0.8); sine(t, f * 5.4, 0.05, 0.3); },
    vibraphone: function (t, f) {
      var g = ctx.createGain(); g.gain.value = 1; var lfo = ctx.createOscillator(); lfo.frequency.value = 5.5; var dep = ctx.createGain(); dep.gain.value = 0.35;
      lfo.connect(dep); dep.connect(g.gain); lfo.start(t); lfo.stop(t + 3.2);
      var e = env(t, 0.45, 3, 0.004); e.disconnect(); e.connect(g); g.connect(bus);
      var o = ctx.createOscillator(); o.frequency.value = f; o.connect(e); o.start(t); o.stop(t + 3.1);
      sine(t, f * 4, 0.06, 0.4);
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
    tambourine: function (t) { for (var i = 0; i < 3; i++) noise(t + i * 0.012, 0.35, 0.5, 'bandpass', 7500, 1.2); sine(t, 300, 0.2, 0.08); },
    woodblock: function (t, f) { sine(t, f || 900, 0.6, 0.09); noise(t, 0.02, 0.3, 'bandpass', (f || 900) * 2, 3); },
    templeblocks: function (t, f) { V.woodblock(t, f); },
    claves: function (t) { sine(t, 2500, 0.5, 0.07); },
    castanets: function (t) { noise(t, 0.03, 0.8, 'bandpass', 3200, 4); noise(t + 0.06, 0.03, 0.8, 'bandpass', 3000, 4); },
    maracas: function (t) { noise(t, 0.09, 0.5, 'highpass', 5000); noise(t + 0.16, 0.09, 0.5, 'highpass', 5000); },
    cowbell: function (t) { var b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 800; b.Q.value = 1.5; b.connect(env(t, 0.5, 0.35)); [540, 800].forEach(function (f) { var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(b); o.start(t); o.stop(t + 0.4); }); },
    sleighbells: function (t) { for (var i = 0; i < 14; i++) noise(t + Math.random() * 0.5, 0.18, 0.25, 'bandpass', 6000 + Math.random() * 3000, 3); },
    bongos: function (t, f) { sine(t, f * 1.2, 0.6, 0.22, 'sine', f, 0.03); noise(t, 0.02, 0.2, 'bandpass', 3000, 2); },
    congas: function (t, f) { sine(t, f * 1.25, 0.7, 0.45, 'sine', f, 0.04); sine(t, f * 2.3, 0.1, 0.12); noise(t, 0.02, 0.2, 'bandpass', 2500, 2); },
    fielddrum: function (t) { sine(t, 200, 0.5, 0.15, 'triangle', 150, 0.05); noise(t, 0.4, 0.8, 'bandpass', 2500, 0.5); },
    tenordrum: function (t) { sine(t, 150, 0.8, 0.8, 'sine', 110, 0.08); noise(t, 0.08, 0.3, 'lowpass', 1500); },
    rototoms: function (t, f) { sine(t, f * 1.2, 0.7, 0.6, 'sine', f, 0.05); noise(t, 0.03, 0.2, 'bandpass', f * 5, 1.5); },
    framedrum: function (t) { sine(t, 120, 0.7, 0.7, 'sine', 90, 0.1); noise(t, 0.05, 0.15, 'lowpass', 1200); },
    timbales: function (t, f) { sine(t, f, 0.5, 0.5); sine(t, f * 1.6, 0.25, 0.35); metal(t, 0.25, 0.08, f / 2, 3000); noise(t, 0.02, 0.3, 'bandpass', 4000, 2); },
    lionsroar: function (t) { var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(260, t + 1.1); o.frequency.linearRampToValueAtTime(120, t + 1.5);
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; o.connect(f); f.connect(env(t, 0.35, 1.6, 0.25)); o.start(t); o.stop(t + 1.7); noise(t, 1.5, 0.15, 'bandpass', 500, 2, 0.2); },
    crotales: function (t, f) { sine(t, f, 0.3, 3.5); sine(t, f * 2.4, 0.08, 1.2); sine(t, f * 4.1, 0.04, 0.5); },
    celesta: function (t, f) { sine(t, f, 0.35, 1.4, 'sine', 0, 0, 0.004); sine(t, f * 2, 0.1, 0.6); sine(t, f * 3, 0.04, 0.3); },
    fingercymbals: function (t) { sine(t, 2700, 0.2, 2.4); sine(t, 4300, 0.1, 1.6); sine(t, 6100, 0.05, 1); },
    gong: function (t, f) { sine(t, f, 0.6, 5, 'sine', 0, 0, 0.01); sine(t, f * 2, 0.15, 3); sine(t, f * 3.02, 0.08, 2); metal(t, 1, 0.05, f, f * 6); },
    herdenglocken: function (t) { for (var i = 0; i < 9; i++) { var tt = t + Math.random() * 0.9, f = 500 + Math.random() * 500; sine(tt, f, 0.12, 0.5); sine(tt, f * 2.7, 0.05, 0.25); } },
    almglocken: function (t, f) { sine(t, f, 0.4, 1.2); sine(t, f * 2.2, 0.15, 0.6); sine(t, f * 3.4, 0.06, 0.3); },
    anvil: function (t) { [1, 2.3, 3.9, 5.1].forEach(function (r, i) { sine(t, 820 * r, 0.3 / (i + 1), 1.4 - i * 0.2); }); noise(t, 0.02, 0.4, 'highpass', 3000); },
    brakedrum: function (t) { [1, 1.7, 2.9, 4.4].forEach(function (r, i) { sine(t, 620 * r, 0.25 / (i + 1), 0.9); }); noise(t, 0.02, 0.3, 'highpass', 2500); },
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
    if (!OL[name]) OL[name] = fetch(ORCH + name + '.mp3?v=1').then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
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
      case 'tamtam': d = dyn(note, 'mf'); return oplay('tamtam-' + (d === 'ff' ? 'f' : d === 'p' ? 'pp' : d), t, 1, 1);
      case 'gong': m = midiOf(note); if (m === null) return false;
        var g = m < 59 ? ['gong-E', 52] : ['gong-F', 65]; return oplay(g[0], t, .9, Math.pow(2, (m - g[1]) / 12));
      case 'chimes': m = midiOf(note); if (m === null) return false; return oplay('chime-F', t, .9, Math.pow(2, (m - 65) / 12));
      case 'woodblock': return oplay(note && note.indexOf('wb-') === 0 ? note : 'wb-mid_F', t, .9, 1);
      case 'templeblocks': var T = { '1040': 'wb-high_F', '880': 'wb-high_D', '740': 'wb-high_A', '620': 'wb-low_Bb', '520': 'wb-low_F' };
        return oplay(T[note] || 'wb-low_G', t, .9, 1);
      case 'snare': if (!K) return false;
        if (note === '__roll') { if (!K.ready('snare-mp')) return false; for (var j = 0; j < 30; j++) K.play(ctx, bus, j % 2 ? 'snare-mp' : 'snare-mf', t + j * .04 + Math.random() * .004, .35 + j / 60, j % 2 ? .1 : -.1); return true; }
        return K.play(ctx, bus, note === 'piccolo' ? 'snare-mf' : 'snare-f', t, .95, 0, note === 'piccolo' ? 1.25 : 1);
      case 'snareroll': return real('snare', t, f, '__roll');
      case 'toms': if (!K) return false; return K.play(ctx, bus, f && f < 120 ? 'floor' : 'tom', t, .9, 0, f && f < 120 ? f / 92 : Math.max(.6, Math.min(1.6, f / 150)));
      case 'crash': if (!K || !K.ready('crash')) return false; var r = note === '16' ? 1.14 : note === '20' ? .88 : 1;
        K.play(ctx, bus, 'crash', t, .75, -.25, r); K.play(ctx, bus, 'crash', t + .012, .6, .25, r * 1.03); return true;
      case 'suspended': if (!K || !K.ready('crash')) return false; var rr = note === '16' ? 1.14 : note === '20' ? .88 : 1;
        if (note === 'hit') return K.play(ctx, bus, 'crash', t, .8, 0, rr);
        for (var q = 0; q < 26; q++) K.play(ctx, bus, 'crash', t + q * .075, .04 + Math.pow(q / 26, 2) * .5, q % 2 ? .2 : -.2, rr);
        K.play(ctx, bus, 'crash', t + 26 * .075, .75, 0, rr); return true;
    }
    return false;
  }
  function play(inst, note, btn) {
    if (!audio()) return;
    var t = ctx.currentTime + 0.02, f = note ? (/^\d+(\.\d+)?$/.test(note) ? +note : MIDI(+note.replace('m', ''))) : 0;
    if (!real(inst, t, f, note)) V[inst](t, f, note);
    if (btn) { btn.classList.add('hit'); setTimeout(function () { btn.classList.remove('hit'); }, 180); }
    if (window.gtag) gtag('event', 'drum_room_play', { instrument: inst });
  }
  function scale(inst, notes, card) {
    if (!audio()) return;
    var keys = card.querySelectorAll('[data-note]');
    notes.forEach(function (n, i) { var at = i * 0.28; setTimeout(function () { play(inst, n, keys[i]); }, at * 1000); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-inst]'); if (!b) return;
    var card = b.closest('.inst');
    if (b.hasAttribute('data-scale')) { var ks = [].map.call(card.querySelectorAll('[data-note]'), function (k) { return k.getAttribute('data-note'); }); scale(b.getAttribute('data-inst'), ks, card); return; }
    play(b.getAttribute('data-inst'), b.getAttribute('data-note'), b);
  });
})();
