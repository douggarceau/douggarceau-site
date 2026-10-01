/* Famous Beats player: plays window.BEAT and draws it on a drum staff. */
(function () {
  var B = window.BEAT, root = document.getElementById('player');
  if (!B || !root) return;
  var steps = B.steps, sub = B.sub, bars = B.bars || 1, per = steps / bars;
  var P = B.parts, HANDS = ['hihat', 'hhopen', 'ride', 'snare', 'rim', 'tom', 'floor'], FEET = ['kick', 'hhfoot'];
  var has = function (v, i) { return (P[v] || []).indexOf(i) >= 0; };
  var acc = function (i) { return (B.accent || []).indexOf(i) >= 0; };

  // ---------- UI ----------
  var labs = sub === 4 ? ['1', 'e', '&', 'a'] : ['1', '&'];
  var counts = '';
  for (var i = 0; i < steps; i++) {
    var b = Math.floor((i % per) / sub) + 1, p = i % sub;
    counts += '<span class="c' + (p ? '' : ' beat') + '" data-i="' + i + '">' + (p ? labs[p] : b) + '</span>';
    if (bars > 1 && i === per - 1) counts += '<span class="bar">|</span>';
  }
  root.innerHTML =
    '<div class="pl"><div class="ctl"><button type="button" class="go" id="go" aria-pressed="false">&#9654; PLAY</button>' +
    '<label class="tempo">TEMPO <input type="range" id="bpm" min="40" max="260" value="' + B.bpm + '" aria-label="Tempo in beats per minute"> <b id="bpmv">' + B.bpm + '</b> BPM</label></div>' +
    '<div class="counts' + (steps > 8 ? ' sm' : '') + '">' + counts + '</div>' +
    '<div class="staff" id="staff"></div>' +
    '<p class="legend">' + (B.legend || '') + (B.swing ? ' · swing the 8ths' : '') + '</p></div>';
  var bpm = B.bpm, go = document.getElementById('go'), slider = document.getElementById('bpm'), bv = document.getElementById('bpmv');
  slider.addEventListener('input', function () { bpm = +slider.value; bv.textContent = bpm; });

  // ---------- Notation ----------
  var W = 1140, x0 = 150, dx = Math.round(930 / steps);
  var X = function (i) { return x0 + i * dx + (bars > 1 && i >= per ? 20 : 0); };
  var Y = { hihat: 34, hhopen: 34, ride: 40, tom: 46, snare: 58, rim: 58, floor: 70, kick: 82, hhfoot: 94 };
  var XH = { hihat: 1, hhopen: 1, ride: 1, rim: 1, hhfoot: 1 };
  function draw(cur) {
    var o = { fW: '', fG: '', tW: '', tG: '', kW: '', kG: '' };
    var G = function (i) { return i === cur ? 'G' : 'W'; };
    var xh = function (x, y, i) { o['k' + G(i)] += 'M' + (x - 5) + ' ' + (y - 5) + 'L' + (x + 5) + ' ' + (y + 5) + 'M' + (x - 5) + ' ' + (y + 5) + 'L' + (x + 5) + ' ' + (y - 5); };
    var oh = function (x, y, i) { o['f' + G(i)] += 'M' + (x - 7) + ' ' + y + 'a7 5.5 0 1 0 14 0a7 5.5 0 1 0 -14 0Z'; };
    var dot = function (x, y) { o.fW += 'M' + (x - 2.5) + ' ' + y + 'a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0Z'; };
    var rect = function (x, y, w, h) { o.fW += 'M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + (-w) + 'Z'; };
    var qrest = function (x, y) { o.kW += 'M' + (x - 2) + ' ' + y + 'L' + (x + 4) + ' ' + (y + 8) + 'L' + (x - 2) + ' ' + (y + 15) + 'L' + (x + 4) + ' ' + (y + 23) + 'Q' + (x - 6) + ' ' + (y + 19) + ' ' + x + ' ' + (y + 30); };
    var erest = function (x, y, two) {
      o.fW += 'M' + (x - 3) + ' ' + y + 'a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z';
      if (two) o.fW += 'M' + (x - 5) + ' ' + (y + 8) + 'a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z';
      o.kW += 'M' + (x + 3) + ' ' + y + 'L' + (x - 3) + ' ' + (y + (two ? 26 : 20));
    };
    function voice(list, up) {
      for (var bt = 0; bt < steps / sub; bt++) {
        var pos = [], xs = X(bt * sub);
        for (var p = 0; p < sub; p++) { var i = bt * sub + p; if (list.some(function (v) { return has(v, i); })) pos.push(p); }
        if (!pos.length) { qrest(xs + 4, up ? 44 : 88); continue; }
        if (pos[0] > 0) { // leading rest
          var r = pos[0];
          if (sub === 2 || r === 2) erest(xs + 2, up ? 44 : 92, false);
          else if (r === 1) erest(xs + 2, up ? 44 : 88, true);
          else { erest(xs + 2, up ? 44 : 92, false); dot(xs + 12, up ? 46 : 94); }
        }
        var dur = pos.map(function (q, k) { return (k + 1 < pos.length ? pos[k + 1] : sub) - q; });
        var sxs = [];
        pos.forEach(function (q, k) {
          var i = bt * sub + q, x = X(i), lo = up ? 0 : 999;
          list.forEach(function (v) {
            if (!has(v, i)) return;
            var y = Y[v];
            if (XH[v]) xh(x, y, i); else oh(x, y, i);
            if (v === 'hhopen') o['k' + G(i)] += 'M' + (x - 4.5) + ' -9a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0';
            if (v === 'rim') o['k' + G(i)] += 'M' + (x - 8) + ' ' + y + 'a8 8 0 1 0 16 0a8 8 0 1 0 -16 0';
            lo = up ? Math.max(lo, y) : Math.min(lo, y);
          });
          if (up && acc(i)) o.kW += 'M' + (x - 6) + ' -14L' + (x + 6) + ' -10L' + (x - 6) + ' -6';
          var sx = up ? x + 6 : x - 6; sxs.push(sx);
          o['t' + G(i)] += 'M' + sx + ' ' + lo + 'L' + sx + ' ' + (up ? 4 : 124);
          var sixteenths = sub === 4 ? dur[k] : dur[k] * 2;
          if (sixteenths === 3) dot(x + 13, Y[list.filter(function (v) { return has(v, i); })[0]] + (up ? -2 : 2));
        });
        var yb = up ? 4 : 119.5, ys = up ? 11 : 112.5;
        if (pos.length === 1) {
          var s = sub === 4 ? dur[0] : dur[0] * 2, i1 = bt * sub + pos[0], sx1 = sxs[0];
          if (s < 4) {
            o['k' + G(i1)] += up ? ('M' + sx1 + ' 4q10 8 8 22') : ('M' + sx1 + ' 124q10 -8 8 -22');
            if (s === 1) o['k' + G(i1)] += up ? ('M' + sx1 + ' 12q10 8 8 22') : ('M' + sx1 + ' 116q10 -8 8 -22');
          }
          continue;
        }
        rect(sxs[0] - 0.8, yb, sxs[sxs.length - 1] - sxs[0] + 1.6, 4.5);
        if (sub === 4) {
          var covered = pos.map(function () { return false; });
          for (var k = 0; k + 1 < pos.length; k++) if (dur[k] === 1 && dur[k + 1] === 1) { rect(sxs[k] - 0.8, ys, sxs[k + 1] - sxs[k] + 1.6, 4.5); covered[k] = covered[k + 1] = true; }
          pos.forEach(function (q, k) {
            if (dur[k] !== 1 || covered[k]) return;
            if (k === pos.length - 1) rect(sxs[k] - 12, ys, 12.8, 4.5); else rect(sxs[k] - 0.8, ys, 12, 4.5);
          });
        }
      }
    }
    voice(HANDS, true); voice(FEET, false);
    var mid = bars > 1 ? '<line x1="' + (X(per) - dx / 2 - 10) + '" y1="40" x2="' + (X(per) - dx / 2 - 10) + '" y2="88" stroke="#fff" stroke-width="1.6"/>' : '';
    var st = '';
    for (var l = 0; l < 5; l++) st += '<line x1="30" y1="' + (40 + l * 12) + '" x2="' + (W - 30) + '" y2="' + (40 + l * 12) + '" stroke="#fff" stroke-width="1.4"/>';
    document.getElementById('staff').innerHTML = '<svg viewBox="0 -20 ' + W + ' 150" role="img" aria-label="' + B.aria + '">' + st +
      '<line x1="30" y1="40" x2="30" y2="88" stroke="#fff" stroke-width="1.6"/><rect x="42" y="52" width="5" height="24" fill="#fff"/><rect x="53" y="52" width="5" height="24" fill="#fff"/>' +
      '<text x="95" y="62" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="30" fill="#fff">' + B.beats + '</text><text x="95" y="86" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="30" fill="#fff">4</text>' + mid +
      '<circle cx="' + (W - 52) + '" cy="58" r="3" fill="#fff"/><circle cx="' + (W - 52) + '" cy="70" r="3" fill="#fff"/><line x1="' + (W - 42) + '" y1="40" x2="' + (W - 42) + '" y2="88" stroke="#fff" stroke-width="1.6"/><rect x="' + (W - 37) + '" y="40" width="7" height="48" fill="#fff"/>' +
      '<path d="' + o.fW + '" fill="#fff"/><path d="' + o.fG + '" fill="#e3242b"/><path d="' + o.tW + '" fill="none" stroke="#fff" stroke-width="1.6"/><path d="' + o.tG + '" fill="none" stroke="#e3242b" stroke-width="1.6"/>' +
      '<path d="' + o.kW + '" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/><path d="' + o.kG + '" fill="none" stroke="#e3242b" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var cs = root.querySelectorAll('.counts .c');
    for (var c = 0; c < cs.length; c++) cs[c].classList.toggle('on', +cs[c].getAttribute('data-i') === cur);
  }
  draw(-1);

  // ---------- Sound ----------
  var ctx, bus, noiseBuf, rideBuf;
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC();
      var len = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var n = 0; n < len; n++) d[n] = Math.random() * 2 - 1;
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      var master = ctx.createGain(); master.gain.value = 0.8; comp.connect(master); master.connect(ctx.destination);
      bus = ctx.createGain(); bus.connect(comp);
      if (window.KitSamples) KitSamples.load(ctx, '../sounds/kit/');
      fetch('../sounds/ride.mp3?v=3').then(function (r) { return r.arrayBuffer(); }).then(function (b) { return ctx.decodeAudioData(b); }).then(function (buf) { rideBuf = buf; }).catch(function () {});
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function env(t, peak, dur) { var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); g.connect(bus); return g; }
  function noise(t, dur, vol, type, freq, q, hp) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7; s.connect(f); var last = f;
    if (hp) { var h = ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp; f.connect(h); last = h; }
    last.connect(env(t, vol, dur)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  function tone(t, type, from, to, sweep, dur, vol) {
    var o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + sweep);
    o.connect(env(t, vol, dur)); o.start(t); o.stop(t + dur + 0.05);
  }
  function metal(t, dur, vol, bp, hp, base) {
    var band = ctx.createBiquadFilter(); band.type = 'bandpass'; band.frequency.value = bp; band.Q.value = 0.8;
    var high = ctx.createBiquadFilter(); high.type = 'highpass'; high.frequency.value = hp; band.connect(high); high.connect(env(t, vol, dur));
    [2, 3, 4.16, 5.43, 6.79, 8.21].forEach(function (r) { var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = (base || 40) * r; o.connect(band); o.start(t); o.stop(t + dur + 0.05); });
  }
  function hit(id, t, a) {
    var v = (0.85 + Math.random() * 0.15) * (a === 1 ? 1 : a === 2 ? 1.25 : 0.55);
    if (window.KitSamples) {
      var K = { kick: ['kick-f', 0.95], snare: [a === 0 ? 'snare-mp' : 'snare-f', a === 0 ? 0.5 : 0.8], rim: ['rim', 0.8], hihat: ['hh', 0.55], hhopen: ['hh-open', 0.55],
        hhfoot: ['hh-foot', 0.5], ride: ['ride', 0.5], tom: ['tom', 0.85], floor: ['floor', 0.9] }[id];
      var pan = { hihat: -0.35, hhopen: -0.35, hhfoot: -0.3, snare: -0.12, rim: -0.12, ride: 0.4, floor: 0.35, tom: -0.1 }[id] || 0;
      if (K && KitSamples.play(ctx, bus, K[0], t, K[1] * v / (a === 2 ? 1.25 : a === 0 ? 0.55 : 1) * (a === 2 ? 1.15 : 1), pan)) return;
    }
    if (id === 'kick') { tone(t, 'sine', 184, 55, 0.09, 0.55, v); tone(t, 'triangle', 104, 52, 0.12, 0.25, 0.35 * v); noise(t, 0.012, 0.35 * v, 'highpass', 2500); }
    else if (id === 'snare') { tone(t, 'triangle', 240, 180, 0.04, 0.12, 0.55 * v); noise(t, 0.24, 0.9 * v, 'bandpass', 4200, 0.6, 1400); noise(t, 0.03, 0.4 * v, 'highpass', 5000); }
    else if (id === 'rim') { tone(t, 'square', 1650, 1500, 0.01, 0.05, 0.25 * v); noise(t, 0.04, 0.5 * v, 'bandpass', 2200, 3); }
    else if (id === 'tom' || id === 'floor') { var f = id === 'tom' ? 150 : 92; tone(t, 'sine', f * 1.7, f, 0.07, id === 'tom' ? 0.55 : 0.8, 0.9 * v); noise(t, 0.04, 0.3 * v, 'bandpass', f * 6, 1.2); }
    else if (id === 'hhfoot') { metal(t, 0.05, 0.3 * v, 7500, 4500, 36); }
    else if (id === 'hhopen') { metal(t, 0.38, 0.45 * v, 9000, 6000); noise(t, 0.32, 0.16 * v, 'highpass', 7000); }
    else if (id === 'hihat') { metal(t, 0.07, 0.5 * v, 10000, 7000); noise(t, 0.05, 0.18 * v, 'highpass', 8000); }
    else if (id === 'ride') {
      if (rideBuf) { var s = ctx.createBufferSource(); s.buffer = rideBuf; var g = ctx.createGain(); g.gain.value = 0.5 * v; s.connect(g); g.connect(bus); s.start(t); }
      else { metal(t, 1.2, 0.22 * v, 7000, 4500, 45); }
    }
  }
  var playing = false, step = 0, next = 0, timer, marks = [];
  function dur(i) {
    var beat = 60 / bpm; if (!B.swing) return beat / sub;
    var r = typeof B.swing === 'number' ? B.swing : 2 / 3; return i % 2 === 0 ? beat * r : beat * (1 - r);
  }
  function tick() {
    if (!playing) return;
    while (next < ctx.currentTime + 0.12) {
      var i = step % steps, t = next;
      Object.keys(P).forEach(function (v) {
        if (!has(v, i)) return;
        var a = B.accent ? (acc(i) ? 2 : (v === 'snare' || v === 'rim') && B.ghostUnaccented ? 0 : 1) : 1;
        hit(v, t, a);
      });
      marks.push([t, i]);
      next += dur(i); step++;
    }
    while (marks.length && marks[0][0] <= ctx.currentTime) { draw(marks[0][1]); marks.shift(); }
    timer = setTimeout(tick, 20);
  }
  go.addEventListener('click', function () {
    if (playing) { playing = false; clearTimeout(timer); marks = []; draw(-1); go.innerHTML = '&#9654; PLAY'; go.setAttribute('aria-pressed', 'false'); return; }
    if (!audio()) return;
    playing = true; step = 0; next = ctx.currentTime + 0.08; go.innerHTML = '&#9632; STOP'; go.setAttribute('aria-pressed', 'true');
    if (window.gtag) gtag('event', 'play_beat', { beat: B.id });
    tick();
  });
})();
