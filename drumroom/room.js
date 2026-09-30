/* Drum Room sounds: every instrument is synthesized in the browser, no audio files. */
(function () {
  var ctx, bus, noiseBuf;
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC();
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
    timpani: function (t, f) { sine(t, f * 1.03, 0.9, 2.4, 'sine', f, 0.15, 0.004); sine(t, f * 1.5, 0.3, 1.2); sine(t, f * 2, 0.18, 0.8); noise(t, 0.12, 0.35, 'lowpass', 600); },
    snare: function (t) { sine(t, 240, 0.5, 0.1, 'triangle', 185, 0.04); noise(t, 0.25, 0.9, 'bandpass', 4000, 0.6); },
    snareroll: function (t) { for (var i = 0; i < 24; i++) V.snare(t + i * 0.045 + Math.random() * 0.004, 0); },
    bassdrum: function (t) { sine(t, 70, 1, 2.2, 'sine', 42, 0.4, 0.01); noise(t, 0.3, 0.3, 'lowpass', 300); },
    toms: function (t, f) { sine(t, f * 1.4, 0.8, 0.9, 'sine', f, 0.08); noise(t, 0.05, 0.25, 'bandpass', f * 6, 1.2); },
    crash: function (t) { noise(t, 3, 0.7, 'highpass', 4500, 0.7, 0.002); metal(t, 2.6, 0.35, 330, 6000); noise(t, 0.8, 0.4, 'bandpass', 2500, 0.5); },
    suspended: function (t) { noise(t, 3.2, 0.5, 'highpass', 5000, 0.7, 1.8); metal(t, 3.2, 0.2, 360, 6500, 1.8); },
    tamtam: function (t) { metal(t, 7, 0.3, 45, 700, 0.5); sine(t, 62, 0.4, 6, 'sine', 0, 0, 0.3); noise(t, 6, 0.15, 'bandpass', 900, 1, 0.8); },
    triangle: function (t) { sine(t, 1180, 0.25, 3.5); sine(t, 1180 * 2.76, 0.12, 2.5); sine(t, 1180 * 5.4, 0.06, 1.6); },
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
  function play(inst, note, btn) {
    if (!audio()) return;
    var t = ctx.currentTime + 0.02, f = note ? (/^\d+(\.\d+)?$/.test(note) ? +note : MIDI(+note.replace('m', ''))) : 0;
    V[inst](t, f);
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
