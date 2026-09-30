/* Rudiment player: parses window.RUD, draws snare notation with sticking, plays it with L/R panning. */
(function () {
  var R = window.RUD, root = document.getElementById('player');
  if (!R || !root) return;
  var g = R.g, beats = R.beats || 4, barU = g * beats;
  // Parse tokens: prefixes > accent, f flam, d drag, z buzz; hand R/L or - for rest; :n duration in grid units.
  var notes = [], t = 0;
  R.seq.trim().split(/\s+/).forEach(function (tok) {
    var m = /^([>fdz]*)([RL-])(?::(\d+))?$/.exec(tok);
    if (!m) throw new Error('bad token ' + tok);
    var d = m[3] ? +m[3] : 1;
    notes.push({ t: t, d: d, h: m[2], rest: m[2] === '-', a: m[1].indexOf('>') >= 0, f: m[1].indexOf('f') >= 0, dr: m[1].indexOf('d') >= 0, z: m[1].indexOf('z') >= 0 });
    t += d;
  });
  if (t !== barU) console.warn('bar length', t, 'expected', barU);
  var played = notes.filter(function (n) { return !n.rest; });

  root.innerHTML =
    '<div class="pl"><div class="ctl"><button type="button" class="go" id="go" aria-pressed="false">&#9654; PLAY</button>' +
    '<label class="tempo">TEMPO <input type="range" id="bpm" min="40" max="200" value="' + R.bpm + '" aria-label="Tempo in beats per minute"> <b id="bpmv">' + R.bpm + '</b> BPM</label>' +
    '<label class="clk"><input type="checkbox" id="clk" checked> Click</label></div>' +
    '<div class="staff" id="staff"></div>' +
    '<p class="legend">Right hand panned right, left hand panned left. Small letters are grace notes.</p></div>';
  var bpm = R.bpm, go = document.getElementById('go'), sl = document.getElementById('bpm'), bv = document.getElementById('bpmv'), clk = document.getElementById('clk');
  sl.addEventListener('input', function () { bpm = +sl.value; bv.textContent = bpm; });

  // ---------- Notation ----------
  var X0 = 112, XE = 1030, BW = (XE - X0 - 24) / beats, LY = 70, SY = 20;
  var X = function (u) { return X0 + 18 + (u / g) * BW; };
  var q = function (n) { return n.d / g; };
  var nb = function (n) { var v = q(n); return v >= 1 - 1e-6 ? 0 : v >= 1 / 3 - 1e-6 ? 1 : v >= 1 / 6 - 1e-6 ? 2 : 3; };
  var other = function (h) { return h === 'R' ? 'L' : 'R'; };
  function draw(cur) {
    var W = '', G = '';
    var add = function (s, on) { if (on) G += s; else W += s; };
    var head = function (x, y, s, on) { add('<ellipse cx="' + x + '" cy="' + y + '" rx="' + (7 * s) + '" ry="' + (5.2 * s) + '" transform="rotate(-20 ' + x + ' ' + y + ')" class="f"/>', on); };
    var line = function (x1, y1, x2, y2, w, on) { add('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke-width="' + w + '" class="s"/>', on); };
    var rect = function (x, y, w, h) { W += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="f"/>'; };
    var txt = function (x, y, s, size, on, cls) { add('<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + size + '" class="t ' + (cls || '') + '">' + s + '</text>', on); };
    // grouping per beat
    for (var b = 0; b < beats; b++) {
      var inB = notes.filter(function (n) { return n.t >= b * g && n.t < (b + 1) * g; });
      var hn = inB.filter(function (n) { return !n.rest && nb(n) > 0; });
      // beams
      if (hn.length >= 2) {
        var sx = function (n) { return X(n.t) + 6; };
        rect(sx(hn[0]) - 0.8, SY, sx(hn[hn.length - 1]) - sx(hn[0]) + 1.6, 4.5);
        for (var lv = 2; lv <= 3; lv++) {
          var i = 0;
          while (i < hn.length) {
            if (nb(hn[i]) < lv) { i++; continue; }
            var j = i; while (j + 1 < hn.length && nb(hn[j + 1]) >= lv) j++;
            var y = SY + (lv - 1) * 7;
            if (j > i) rect(sx(hn[i]) - 0.8, y, sx(hn[j]) - sx(hn[i]) + 1.6, 4.5);
            else { var left = i === hn.length - 1 || (i > 0 && nb(hn[i - 1]) >= 1 && false); rect(i === hn.length - 1 ? sx(hn[i]) - 11 : sx(hn[i]) - 0.8, y, 11.8, 4.5); }
            i = j + 1;
          }
        }
      } else if (hn.length === 1) {
        var n1 = hn[0], fx = X(n1.t) + 6;
        for (var k = 0; k < nb(n1); k++) W += '<path d="M' + fx + ' ' + (SY + k * 8) + 'q12 9 9 24" class="s" fill="none" stroke-width="2.2"/>';
      }
      // tuplets
      var lab = '';
      if (g === 3) lab = '3';
      else if (g === 6) {
        var ones = inB.filter(function (n) { return n.d === 1; }).length;
        if (ones === 6) lab = '6';
        else if (inB.some(function (n) { return n.d === 2; })) lab = '3';
        else {
          [0, 3].forEach(function (o) {
            var run = inB.filter(function (n) { return n.t >= b * g + o && n.t < b * g + o + 3 && n.d === 1; });
            if (run.length === 3) txt((X(run[0].t) + X(run[2].t)) / 2 + 6, SY - 8, '3', 15, false, 'tup');
          });
        }
      }
      if (lab && inB.length) {
        var a0 = X(inB[0].t), a1 = X(inB[inB.length - 1].t);
        txt((a0 + a1) / 2 + 6, SY - 8, lab, 15, false, 'tup');
      }
    }
    // notes
    var pi = 0;
    notes.forEach(function (n) {
      var x = X(n.t);
      if (n.rest) {
        var v = q(n);
        if (v >= 1) W += '<path d="M' + (x - 2) + ' ' + (LY - 16) + 'L' + (x + 4) + ' ' + (LY - 8) + 'L' + (x - 2) + ' ' + (LY - 1) + 'L' + (x + 4) + ' ' + (LY + 7) + 'Q' + (x - 6) + ' ' + (LY + 3) + ' ' + x + ' ' + (LY + 14) + '" class="s" fill="none" stroke-width="2.3"/>';
        else {
          W += '<circle cx="' + x + '" cy="' + (LY - 6) + '" r="3" class="f"/><path d="M' + (x + 3) + ' ' + (LY - 6) + 'L' + (x - 3) + ' ' + (LY + 14) + '" class="s" stroke-width="2"/>';
          if (v < 0.5) W += '<circle cx="' + (x - 2) + '" cy="' + (LY + 2) + '" r="3" class="f"/>';
        }
        return;
      }
      var on = pi === cur; pi++;
      head(x, LY, 1, on);
      line(x + 6, LY - 1, x + 6, SY, 1.6, on);
      if (Math.abs(q(n) - 0.75) < 1e-6 || Math.abs(q(n) - 0.375) < 1e-6) W += '<circle cx="' + (x + 14) + '" cy="' + (LY - 3) + '" r="2.4" class="f"/>';
      if (n.a) txt(x, LY + 22, '&gt;', 18, on, 'acc');
      if (n.z) add('<path d="M' + (x + 1) + ' 38h10l-10 9h10" class="s" fill="none" stroke-width="1.6"/>', on);
      var gh = other(n.h).toLowerCase();
      if (n.f) {
        var gx = x - 17;
        head(gx, LY - 2, 0.6, on); line(gx + 3.6, LY - 3, gx + 3.6, 44, 1.2, on);
        add('<path d="M' + (gx + 3.6) + ' 44q7 5 5 13" class="s" fill="none" stroke-width="1.2"/>', on);
        line(gx - 2, 58, gx + 9, 48, 1.2, on);
        txt(gx, 128, gh, 14, on, 'gr');
      }
      if (n.dr) {
        var d1 = x - 26, d2 = x - 16;
        head(d1, LY - 2, 0.6, on); head(d2, LY - 2, 0.6, on);
        line(d1 + 3.6, LY - 3, d1 + 3.6, 44, 1.2, on); line(d2 + 3.6, LY - 3, d2 + 3.6, 44, 1.2, on);
        add('<rect x="' + (d1 + 3) + '" y="44" width="11.2" height="2.6" class="f"/><rect x="' + (d1 + 3) + '" y="49" width="11.2" height="2.6" class="f"/>', on);
        txt(d1 - 1, 128, gh, 14, on, 'gr'); txt(d2 + 1, 128, gh, 14, on, 'gr');
      }
      txt(x, 128, n.h, 19, on, 'st');
    });
    var st = '<line x1="20" y1="' + LY + '" x2="' + XE + '" y2="' + LY + '" class="s" stroke-width="1.4"/>' +
      '<rect x="24" y="' + (LY - 12) + '" width="5" height="24" class="f"/><rect x="35" y="' + (LY - 12) + '" width="5" height="24" class="f"/>' +
      '<text x="76" y="' + (LY - 3) + '" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="26" class="t">' + beats + '</text>' +
      '<text x="76" y="' + (LY + 20) + '" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="26" class="t">4</text>' +
      '<circle cx="' + (XE - 22) + '" cy="' + (LY - 7) + '" r="2.6" class="f"/><circle cx="' + (XE - 22) + '" cy="' + (LY + 7) + '" r="2.6" class="f"/>' +
      '<line x1="' + (XE - 12) + '" y1="' + (LY - 16) + '" x2="' + (XE - 12) + '" y2="' + (LY + 16) + '" class="s" stroke-width="1.6"/><rect x="' + (XE - 7) + '" y="' + (LY - 16) + '" width="7" height="32" class="f"/>';
    document.getElementById('staff').innerHTML = '<svg viewBox="0 -8 1040 150" role="img" aria-label="' + R.aria + '"><g class="w">' + st + W + '</g><g class="gd">' + G + '</g></svg>';
  }
  draw(-1);

  // ---------- Sound ----------
  var ctx, bus, noiseBuf;
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC();
      var len = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var dd = noiseBuf.getChannelData(0); for (var i = 0; i < len; i++) dd[i] = Math.random() * 2 - 1;
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      var m = ctx.createGain(); m.gain.value = 0.85; comp.connect(m); m.connect(ctx.destination); bus = comp;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function out(t, peak, dur, pan) {
    var gn = ctx.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + 0.002); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (ctx.createStereoPanner) { var p = ctx.createStereoPanner(); p.pan.value = pan; gn.connect(p); p.connect(bus); } else gn.connect(bus);
    return gn;
  }
  function snare(t, v, pan, short) {
    var dur = short ? 0.1 : 0.22;
    var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(250, t); o.frequency.exponentialRampToValueAtTime(185, t + 0.04);
    o.connect(out(t, 0.5 * v, 0.1, pan)); o.start(t); o.stop(t + 0.15);
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 4000; bp.Q.value = 0.6;
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1300;
    s.connect(bp); bp.connect(hp); hp.connect(out(t, 0.9 * v, dur, pan)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  function click(t, down) {
    var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = down ? 1800 : 1300;
    o.connect(out(t, 0.12, 0.03, 0)); o.start(t); o.stop(t + 0.05);
  }
  function play(n, t) {
    var pan = n.h === 'R' ? 0.35 : -0.35, v = n.a ? 1 : 0.5, gp = -pan;
    var gap = Math.min(0.035, 60 / bpm / 10);
    if (n.f) snare(t - gap, 0.18, gp, true);
    if (n.dr) { snare(t - gap * 1.8, 0.16, gp, true); snare(t - gap * 0.9, 0.16, gp, true); }
    if (n.z) { var len = Math.min(n.d / g * 60 / bpm, 0.25); for (var k = 0; k < 5; k++) snare(t + k * len / 5, v * (1 - k * 0.15), pan, true); }
    else snare(t, v, pan);
  }
  var playing = false, bar = 0, next = 0, idx = 0, timer, marks = [];
  var ev = []; (function () { var pi = 0; notes.forEach(function (n) { if (!n.rest) ev.push({ n: n, pi: pi++ }); }); })();
  function tick() {
    if (!playing) return;
    var spb = 60 / bpm;
    while (true) {
      var e = ev[idx], at = next + (e.n.t / g) * spb;
      if (at > ctx.currentTime + 0.12) break;
      play(e.n, at); marks.push([at, e.pi]);
      idx++;
      if (idx >= ev.length) { idx = 0; next += beats * spb; schedClicks(next); }
    }
    while (marks.length && marks[0][0] <= ctx.currentTime) { draw(marks[0][1]); marks.shift(); }
    timer = setTimeout(tick, 20);
  }
  function schedClicks(start) { if (!clk.checked) return; var spb = 60 / bpm; for (var b = 0; b < beats; b++) click(start + b * spb, b === 0); }
  go.addEventListener('click', function () {
    if (playing) { playing = false; clearTimeout(timer); marks = []; draw(-1); go.innerHTML = '&#9654; PLAY'; go.setAttribute('aria-pressed', 'false'); return; }
    if (!audio()) return;
    playing = true; idx = 0; next = ctx.currentTime + 0.12; schedClicks(next);
    go.innerHTML = '&#9632; STOP'; go.setAttribute('aria-pressed', 'true');
    if (window.gtag) gtag('event', 'play_rudiment', { rudiment: R.id });
    tick();
  });
})();
