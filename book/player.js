/* Amadeus School of Drums — playable drum notation.
   Each <div class="ex" data-spec='{...}'> becomes sheet music with Play, tempo and metronome.
   Spec: { ts:[4,4], sub:4, bars:1, bpm:80, swing:false, compound:false,
           lines:{ hh:"x.x.", sn:"..o.", bd:"o...", ... }, st:"RLRL", acc:">..." }
   Instruments: cr crash, hh hi-hat (O = open), rd ride, t1 rack tom, sn snare, t2 floor tom, bd bass drum, hf hi-hat foot.
   Line chars: . nothing, x/o hit, g ghost, f flam, d drag, z buzz roll, w double-stroke roll, O open hi-hat. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var Y = { cr: 24, hh: 32, rd: 40, t1: 48, sn: 64, t2: 80, bd: 96, hf: 112 };
  var XHEAD = { cr: 1, hh: 1, rd: 1, hf: 1 };
  var HANDS = ["cr", "hh", "rd", "t1", "sn", "t2"], FEET = ["bd", "hf"];
  var STEM_TOP = 4, STEM_BOT = 140;
  var SRC = (document.currentScript && document.currentScript.src) || location.href;
  var SAMPLES = { rd: new URL("../sounds/ride.mp3?v=2", SRC).href, rj: new URL("../sounds/ride-jazz.mp3?v=2", SRC).href }, BUFS = {}, BYTES = {};
  Object.keys(SAMPLES).forEach(function (k) {
    BYTES[k] = fetch(SAMPLES[k]).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); });
  });

  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function onLine(y) { return y >= 40 && y <= 104 && (y - 40) % 16 === 0; }

  function prep(spec) {
    var ts = spec.ts || [4, 4], compound = !!spec.compound || (ts[1] === 8 && ts[0] % 3 === 0 && ts[0] > 3);
    var beats = compound ? ts[0] / 3 : ts[0], sub = spec.sub || (compound ? 3 : 2), bars = spec.bars || 1;
    var steps = beats * sub * bars, lines = spec.lines || {};
    Object.keys(lines).forEach(function (k) {
      var s = lines[k].replace(/\s/g, "");
      if (s.length !== steps) throw new Error("line " + k + " has " + s.length + " steps, expected " + steps);
      lines[k] = s;
    });
    ["st", "acc"].forEach(function (k) { if (spec[k]) { spec[k] = spec[k].replace(/ /g, "").replace(/_/g, " "); if (spec[k].length !== steps) throw new Error(k + " has " + spec[k].length + " steps, expected " + steps); } });
    return { ties: spec.ties || [], ts: ts, compound: compound, beats: beats, sub: sub, bars: bars, steps: steps, lines: lines, st: spec.st || "", acc: spec.acc || "", swing: !!spec.swing, bpm: spec.bpm || 80, triplet: sub === 3 && !compound };
  }

  function isNote(c) { return !!c && c !== "." && c !== "-"; }
  function voiceNotes(P, set, i) { var out = []; set.forEach(function (k) { var c = P.lines[k] && P.lines[k][i]; if (isNote(c)) out.push({ k: k, c: c }); }); return out; }

  function countLabel(P, i) {
    var inBar = i % (P.beats * P.sub), b = Math.floor(inBar / P.sub), p = inBar % P.sub;
    if (P.compound) return String(b * 3 + p + 1);
    if (P.sub === 4) return p === 0 ? String(b + 1) : ["", "e", "&", "a"][p];
    if (P.sub === 3) return p === 0 ? String(b + 1) : ["", "trip", "let"][p];
    return p === 0 ? String(b + 1) : "&";
  }

  function render(host, P, label) {
    var stepW = Math.min(46, Math.max(22, 760 / P.steps)), x0 = 84, W = x0 + P.steps * stepW + 26;
    var svg = el("svg", { viewBox: "0 -30 " + W + " 216", role: "img", "aria-label": label || "Drum notation", class: "nb", style: "width:" + Math.round(W * 0.92) + "px" });
    if (P.swing) { var sw = el("text", { x: 16, y: -14, class: "swl" }, svg); sw.textContent = "Swing (play eighths long-short)"; }
    var X = function (i) { return x0 + i * stepW + stepW / 2; };
    for (var l = 0; l < 5; l++) el("line", { x1: 10, y1: 40 + l * 16, x2: W - 10, y2: 40 + l * 16, class: "sl" }, svg);
    el("rect", { x: 22, y: 56, width: 5, height: 32, class: "k" }, svg); el("rect", { x: 33, y: 56, width: 5, height: 32, class: "k" }, svg);
    var t1 = el("text", { x: 60, y: 70, class: "tsn" }, svg); t1.textContent = P.ts[0];
    var t2 = el("text", { x: 60, y: 102, class: "tsn" }, svg); t2.textContent = P.ts[1];
    for (var b = 1; b < P.bars; b++) { var bx = x0 + b * P.beats * P.sub * stepW; el("line", { x1: bx, y1: 40, x2: bx, y2: 104, class: "bl" }, svg); }
    el("line", { x1: W - 20, y1: 40, x2: W - 20, y2: 104, class: "bl" }, svg); el("rect", { x: W - 16, y: 40, width: 6, height: 64, class: "k" }, svg);
    el("circle", { cx: W - 27, cy: 64, r: 3, class: "k" }, svg); el("circle", { cx: W - 27, cy: 80, r: 3, class: "k" }, svg);

    var groups = [];
    for (var i = 0; i < P.steps; i++) {
      var g = el("g", { class: "st", "data-s": i }, svg); groups.push(g);
      if (P.st[i] && P.st[i] !== " ") { var s = el("text", { x: X(i), y: 162, class: "stk " + P.st[i] }, g); s.textContent = P.st[i]; }
      var c = el("text", { x: X(i), y: 181, class: "cnt" }, g); c.textContent = countLabel(P, i);
    }
    var hasFeet = FEET.some(function (k) { return P.lines[k] && /[^.\-]/.test(P.lines[k]); });
    var hasHands = HANDS.some(function (k) { return P.lines[k] && /[^.\-]/.test(P.lines[k]); });

    function head(g, k, c, x, i, open) {
      var y = Y[k];
      if (k === "cr") el("line", { x1: x - 10, y1: 24, x2: x + 10, y2: 24, class: "sl" }, g);
      if (XHEAD[k]) { el("path", { d: "M" + (x - 5.5) + " " + (y - 5.5) + "L" + (x + 5.5) + " " + (y + 5.5) + "M" + (x - 5.5) + " " + (y + 5.5) + "L" + (x + 5.5) + " " + (y - 5.5), class: "xh" }, g); }
      else el("ellipse", { cx: x, cy: y, rx: open ? 7.4 : 7, ry: open ? 5 : 5.2, transform: "rotate(-20 " + x + " " + y + ")", class: open ? "oh" : "hd" }, g);
      if (c === "g") { var lp = el("text", { x: x - 12, y: y + 5, class: "gh" }, g); lp.textContent = "("; var rp = el("text", { x: x + 12, y: y + 5, class: "gh" }, g); rp.textContent = ")"; }
      if (c === "O") { el("circle", { cx: x, cy: -8, r: 4, class: "oo" }, g); }
      if (c === "f" || c === "d") {
        var n = c === "f" ? 1 : 2, gx0 = x - (c === "f" ? 17 : 24);
        for (var q = 0; q < n; q++) { var gx = gx0 + q * 8; el("ellipse", { cx: gx, cy: y, rx: 4.2, ry: 3.2, transform: "rotate(-20 " + gx + " " + y + ")", class: "hd" }, g); el("line", { x1: gx + 3.8, y1: y - 1, x2: gx + 3.8, y2: y - 22, class: "sm" }, g); }
        if (c === "f") { el("path", { d: "M" + (gx0 + 3.8) + " " + (y - 22) + "q6 4 5 11", class: "fl" }, g); el("line", { x1: gx0 - 3, y1: y - 8, x2: gx0 + 9, y2: y - 20, class: "sm" }, g); }
        else { el("rect", { x: gx0 + 3, y: y - 22, width: 9.6, height: 2.6, class: "k" }, g); el("rect", { x: gx0 + 3, y: y - 17.5, width: 9.6, height: 2.6, class: "k" }, g); }
      }
    }
    function rest(g, x, dur, up, sub) {
      var y0 = up ? 50 : 96;
      if (sub === 1 || dur >= 4 || (sub === 2 && dur === 2) || (sub === 3 && dur >= 3)) {
        el("path", { d: "M" + (x - 3) + " " + y0 + "l8 11l-9 10l9 12q-13 -5 -5 16", class: "rs" }, g);
        if (P.compound && sub === 3 && dur >= 3) el("circle", { cx: x + 12, cy: y0 + 14, r: 2.6, class: "k" }, g);
        return;
      }
      var flags = (sub === 4 && dur === 1) ? 2 : 1, dotted = sub === 4 && dur === 3;
      for (var f = 0; f < flags; f++) { el("circle", { cx: x - 3 - f * 3, cy: y0 + 8 + f * 8, r: 3.2, class: "k" }, g); }
      el("path", { d: "M" + (x - 3) + " " + (y0 + 10) + "q5 1 8 -5l-" + (6 + flags * 3) + " " + (22 + flags * 6), class: "rs thin" }, g);
      if (dotted) el("circle", { cx: x + 9, cy: y0 + 10, r: 2.4, class: "k" }, g);
    }

    function barRest(g, x, up, kind) {
      if (kind === "whole") el("rect", { x: x - 10, y: up ? 56 : 88, width: 20, height: 7, class: "k" }, g);
      else el("rect", { x: x - 10, y: up ? 65 : 97, width: 20, height: 7, class: "k" }, g);
    }
    function drawVoice(set, up) {
      var nb = P.beats * P.bars, info = [];
      for (var b0 = 0; b0 < nb; b0++) {
        var ps = [], sus = true;
        for (var p0 = 0; p0 < P.sub; p0++) {
          var st = b0 * P.sub + p0;
          if (voiceNotes(P, set, st).length) ps.push(p0);
          if (!set.some(function (k) { return P.lines[k] && P.lines[k][st] === "-"; })) sus = false;
        }
        info.push({ pos: ps, sus: !ps.length && sus, empty: !ps.length && !sus, long: 1 });
      }
      // dotted quarter across the beat (sub 2): "o- -o" = dotted quarter + eighth
      var dash = function (st) { return set.some(function (k) { return P.lines[k] && P.lines[k][st] === "-"; }); };
      for (var b2 = 0; b2 + 1 < nb; b2++) {
        if (P.sub === 2 && !P.compound && info[b2].pos.length === 1 && info[b2].pos[0] === 0 && dash(b2 * 2 + 1) && dash(b2 * 2 + 2) && info[b2 + 1].pos.length === 1 && info[b2 + 1].pos[0] === 1 && Math.floor((b2 + 1) / P.beats) === Math.floor(b2 / P.beats)) {
          info[b2].dq = true; info[b2 + 1].afterDot = true;
        }
      }
      for (var b1 = 0; b1 < nb; b1++) {
        var I = info[b1];
        if (I.pos.length === 1 && I.pos[0] === 0 && !P.compound) { var L = 1; while (b1 + L < nb && info[b1 + L].sus && Math.floor((b1 + L) / P.beats) === Math.floor(b1 / P.beats)) L++; I.long = L; }
      }
      var handled = {};
      for (var bar = 0; bar < P.bars; bar++) {
        var bs = bar * P.beats, all = true;
        for (var q = 0; q < P.beats; q++) if (!info[bs + q].empty) all = false;
        if (all) { barRest(groups[bs * P.sub], (X(bs * P.sub) + X((bs + P.beats) * P.sub - 1)) / 2, up, "whole"); for (q = 0; q < P.beats; q++) handled[bs + q] = 1; continue; }
        if (P.beats === 4 && !P.compound) [[0, 1], [2, 3]].forEach(function (pr) {
          if (info[bs + pr[0]].empty && info[bs + pr[1]].empty) { barRest(groups[(bs + pr[0]) * P.sub], X((bs + pr[0]) * P.sub) + 10, up, "half"); handled[bs + pr[0]] = handled[bs + pr[1]] = 1; }
        });
      }
      for (var bt = 0; bt < nb; bt++) {
        var base = bt * P.sub, pos = info[bt].pos;
        if (info[bt].sus || handled[bt]) continue;
        if (!pos.length) { rest(groups[base], X(base) + 6, P.sub, up, P.sub); continue; }
        if (info[bt].long > 1) {
          var LL = info[bt].long, gi = groups[base], xx = X(base), nsl = voiceNotes(P, set, base), ysl = nsl.map(function (n) { return Y[n.k]; });
          nsl.forEach(function (n) { head(gi, n.k, n.c, xx, base, true); });
          if (LL < 4) { var sxl = up ? xx + 7 : xx - 7, fr = up ? Math.max.apply(null, ysl) : Math.min.apply(null, ysl); el("line", { x1: sxl, y1: fr - (up ? 2 : -2), x2: sxl, y2: up ? STEM_TOP + 14 : STEM_BOT - 14, class: "sm" }, gi); }
          if (LL === 3) nsl.forEach(function (n) { var yy = onLine(Y[n.k]) ? Y[n.k] - 6 : Y[n.k]; el("circle", { cx: xx + 14, cy: yy, r: 2.6, class: "k" }, gi); });
          if (up && P.acc[base] === ">") el("path", { d: "M" + (xx - 7) + " -24l14 5l-14 5", class: "ac" }, gi);
          continue;
        }
        var durs = pos.map(function (p, j) { return (j + 1 < pos.length ? pos[j + 1] : P.sub) - p; });
        var quarterAlone = pos.length === 1 && pos[0] === 0;
        var dottedQ = quarterAlone && P.compound;
        if (pos[0] > 0 && !info[bt].afterDot) {
          if (P.sub === 3) { for (var r = 0; r < pos[0]; r++) rest(groups[base + r], X(base + r), 1, up, 3); }
          else rest(groups[base], X(base), pos[0], up, P.sub);
        }
        if (P.sub === 3 && !(pos.length === 1 && pos[0] === 0)) for (var e = pos[0] + 1; e < P.sub; e++) if (pos.indexOf(e) < 0) rest(groups[base + e], X(base + e), 1, up, 3);
        var stemX = [];
        pos.forEach(function (p, j) {
          var i = base + p, g = groups[i], x = X(i), ns = voiceNotes(P, set, i), ys = ns.map(function (n) { return Y[n.k]; });
          ns.forEach(function (n) { head(g, n.k, n.c, x, i); });
          var sx = up ? x + 7 : x - 7, from = up ? Math.max.apply(null, ys) : Math.min.apply(null, ys);
          el("line", { x1: sx, y1: from - (up ? 2 : -2), x2: sx, y2: up ? STEM_TOP : STEM_BOT, class: "sm" }, g);
          stemX.push(sx);
          var d = durs[j];
          if (dottedQ || info[bt].dq) ns.forEach(function (n) { var yy = onLine(Y[n.k]) ? Y[n.k] - 6 : Y[n.k]; el("circle", { cx: x + 13, cy: yy, r: 2.6, class: "k" }, g); });
          if (P.sub === 4 && d === 3) ns.forEach(function (n) { var yy = onLine(Y[n.k]) ? Y[n.k] - 6 : Y[n.k]; el("circle", { cx: x + 13, cy: yy, r: 2.6, class: "k" }, g); });
          if (up && P.acc[i] === ">") el("path", { d: "M" + (x - 7) + " -24l14 5l-14 5", class: "ac" }, g);
          var roll = ns.filter(function (n) { return n.c === "z" || n.c === "w"; })[0];
          if (roll) {
            var beamsHere = quarterAlone ? 0 : (P.sub === 4 && d === 1 ? 2 : 1);
            var slashes = roll.c === "z" ? 0 : Math.max(1, 3 - beamsHere);
            for (var sl = 0; sl < slashes; sl++) el("line", { x1: sx - 7, y1: 30 + sl * 7 + 4, x2: sx + 7, y2: 30 + sl * 7 - 2, class: "sl2" }, g);
            if (roll.c === "z") el("path", { d: "M" + (sx - 6) + " 26h12l-12 9h12", class: "zz" }, g);
            var nx = i + d; var nxRoll = nx < P.steps && HANDS.some(function (q) { var cc = P.lines[q] && P.lines[q][nx]; return cc === "z" || cc === "w"; }); if (nx < P.steps && !nxRoll) el("path", { d: "M" + (x + 2) + " " + (Y[roll.k] + 10) + "Q" + ((x + X(nx)) / 2) + " " + (Y[roll.k] + 24) + " " + (X(nx) - 2) + " " + (Y[roll.k] + 10), class: "tie" }, svg);
          }
        });
        if (quarterAlone) continue;
        var by = up ? STEM_TOP : STEM_BOT - 5, by2 = up ? STEM_TOP + 7 : STEM_BOT - 12;
        if (pos.length === 1) {
          var sx1 = stemX[0], nfl = (P.sub === 4 && durs[0] === 1) ? 2 : 1;
          for (var f2 = 0; f2 < nfl; f2++) el("path", { d: up ? "M" + sx1 + " " + (STEM_TOP + f2 * 8) + "q12 8 8 26" : "M" + sx1 + " " + (STEM_BOT - f2 * 8) + "q12 -8 8 -26", class: "fl" }, groups[base + pos[0]]);
          continue;
        }
        el("rect", { x: stemX[0] - 1.2, y: by, width: stemX[stemX.length - 1] - stemX[0] + 2.4, height: 5, class: "k" }, svg);
        if (P.sub === 4) {
          for (var j2 = 0; j2 < pos.length; j2++) {
            if (durs[j2] !== 1) continue;
            if (j2 + 1 < pos.length && durs[j2 + 1] === 1) el("rect", { x: stemX[j2] - 1.2, y: by2, width: stemX[j2 + 1] - stemX[j2] + 2.4, height: 5, class: "k" }, svg);
            else if (!(j2 > 0 && durs[j2 - 1] === 1)) { var right = j2 === 0; el("rect", { x: right ? stemX[j2] - 1.2 : stemX[j2] - 11, y: by2, width: 12.2, height: 5, class: "k" }, svg); }
          }
        }
        if (P.triplet && up) { var tx = (X(base) + X(base + 2)) / 2 + 7; var tt = el("text", { x: tx, y: -6, class: "tup" }, svg); tt.textContent = "3"; }
      }
    }
    if (hasHands) drawVoice(HANDS, true);
    if (hasFeet) drawVoice(FEET, false);
    P.ties.forEach(function (i) {
      var k = HANDS.concat(FEET).filter(function (q) { return isNote(P.lines[q] && P.lines[q][i]); })[0]; if (!k) return;
      for (var j = i + 1; j < P.steps; j++) if (isNote(P.lines[k][j])) break;
      if (j >= P.steps) return;
      var y = Y[k], a = X(i), z = X(j);
      el("path", { d: "M" + (a + 3) + " " + (y + 9) + "Q" + ((a + z) / 2) + " " + (y + 24) + " " + (z - 3) + " " + (y + 9), class: "tie" }, svg);
    });
    host.appendChild(svg);
    return groups;
  }

  /* ---------- sound ---------- */
  var ctx = null, bus = null, noiseBuf = null;
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC();
      var len = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      var master = ctx.createGain(); master.gain.value = 0.8; comp.connect(master); master.connect(ctx.destination);
      var rl = Math.floor(ctx.sampleRate * 1.0), ir = ctx.createBuffer(2, rl, ctx.sampleRate);
      for (var ch = 0; ch < 2; ch++) { var c = ir.getChannelData(ch); for (var j = 0; j < rl; j++) c[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / rl, 3); }
      var verb = ctx.createConvolver(); verb.buffer = ir; var wet = ctx.createGain(); wet.gain.value = 0.14;
      bus = ctx.createGain(); bus.connect(comp); bus.connect(verb); verb.connect(wet); wet.connect(comp);
      Object.keys(SAMPLES).forEach(function (k) {
        BYTES[k].then(function (b) { return ctx.decodeAudioData(b.slice(0)); }).then(function (buf) { BUFS[k] = buf; }).catch(function () {});
      });
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function env(t, peak, dur, att) { var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + (att || 0.002)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); g.connect(bus); return g; }
  function noise(t, dur, vol, type, freq, q, hp) { var s = ctx.createBufferSource(); s.buffer = noiseBuf; var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7; var last = f; s.connect(f); if (hp) { var h = ctx.createBiquadFilter(); h.type = "highpass"; h.frequency.value = hp; f.connect(h); last = h; } last.connect(env(t, vol, dur)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05); }
  function tone(t, type, a, b, sw, dur, vol) { var o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(a, t); o.frequency.exponentialRampToValueAtTime(b, t + sw); o.connect(env(t, vol, dur)); o.start(t); o.stop(t + dur + 0.05); }
  function metal(t, dur, vol, bp, hp, base) { var bn = ctx.createBiquadFilter(); bn.type = "bandpass"; bn.frequency.value = bp; bn.Q.value = 0.8; var hn = ctx.createBiquadFilter(); hn.type = "highpass"; hn.frequency.value = hp; bn.connect(hn); hn.connect(env(t, vol, dur, 0.001)); [2, 3, 4.16, 5.43, 6.79, 8.21].forEach(function (r) { var o = ctx.createOscillator(); o.type = "square"; o.frequency.value = (base || 40) * r; o.connect(bn); o.start(t); o.stop(t + dur + 0.05); }); }
  function sample(k, t, v) {
    var s = ctx.createBufferSource(); s.buffer = BUFS[k]; s.playbackRate.value = 0.99 + Math.random() * 0.02;
    var g = ctx.createGain(); g.gain.value = v; s.connect(g); g.connect(bus); s.start(t);
  }
  function hit(k, t, v) {
    v = v * (0.9 + Math.random() * 0.1);
    if (BUFS[k]) { sample(k, t, v * 1.1); return; }
    switch (k) {
      case "bd": tone(t, "sine", 160, 48, 0.09, 0.5, v); tone(t, "triangle", 90, 45, 0.12, 0.22, 0.3 * v); noise(t, 0.012, 0.3 * v, "highpass", 2500); break;
      case "sn": tone(t, "triangle", 240, 180, 0.04, 0.12, 0.55 * v); noise(t, 0.24, 0.9 * v, "bandpass", 4200, 0.6, 1400); noise(t, 0.03, 0.35 * v, "highpass", 5000); break;
      case "t1": tone(t, "sine", 255, 150, 0.07, 0.5, 0.9 * v); noise(t, 0.04, 0.25 * v, "bandpass", 900, 1.2); break;
      case "t2": tone(t, "sine", 156, 92, 0.07, 0.75, 0.95 * v); noise(t, 0.04, 0.25 * v, "bandpass", 550, 1.2); break;
      case "hh": metal(t, 0.07, 0.45 * v, 10000, 7000); noise(t, 0.05, 0.16 * v, "highpass", 8000); break;
      case "ho": metal(t, 0.36, 0.42 * v, 9000, 6000); noise(t, 0.3, 0.15 * v, "highpass", 7000); break;
      case "hf": metal(t, 0.05, 0.3 * v, 7500, 4500, 36); break;
      case "rd": metal(t, 1.0, 0.2 * v, 7000, 4500, 45); tone(t, "sine", 2350, 2300, 0.4, 0.8, 0.05 * v); break;
      case "cr": metal(t, 1.7, 0.38 * v, 8000, 4000, 42); noise(t, 1.5, 0.28 * v, "highpass", 5500); break;
    }
  }
  function click(t, strong) { var o = ctx.createOscillator(), g = ctx.createGain(); o.type = "square"; o.frequency.value = strong ? 1760 : 1175; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(strong ? 0.3 : 0.18, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.06); }

  /* ---------- player ---------- */
  var current = null;
  function Player(box) {
    var spec = JSON.parse(box.getAttribute("data-spec"));
    this.P = prep(spec); this.box = box; this.bpm = this.P.bpm; this.met = true; this.running = false;
    var P0 = this.P, tieT = {};
    P0.ties.forEach(function (i) {
      var k = HANDS.concat(FEET).filter(function (q) { return isNote(P0.lines[q] && P0.lines[q][i]); })[0]; if (!k) return;
      for (var j = i + 1; j < P0.steps; j++) if (isNote(P0.lines[k][j])) { tieT[k + ":" + j] = 1; break; }
    });
    this.tieT = tieT;
    var host = box.querySelector(".exsvg");
    this.groups = render(host, this.P, box.getAttribute("data-label"));
    var self = this;
    this.btn = box.querySelector(".pl"); this.bv = box.querySelector(".bpm"); this.mb = box.querySelector(".mt");
    this.bv.textContent = this.bpm;
    this.btn.addEventListener("click", function () { self.running ? self.stop() : self.start(); });
    box.querySelector(".tm").addEventListener("click", function () { self.setBpm(-5); });
    box.querySelector(".tp").addEventListener("click", function () { self.setBpm(5); });
    this.mb.addEventListener("click", function () { self.met = !self.met; self.mb.setAttribute("aria-pressed", self.met ? "true" : "false"); self.mb.textContent = "Metronome " + (self.met ? "on" : "off"); });
  }
  Player.prototype.setBpm = function (d) { this.bpm = Math.max(30, Math.min(220, this.bpm + d)); this.bv.textContent = this.bpm; };
  Player.prototype.stepDur = function (i) {
    var beat = 60 / this.bpm, P = this.P;
    if (P.swing && P.sub === 2) return (i % 2 === 0 ? 2 / 3 : 1 / 3) * beat;
    return beat / P.sub;
  };
  Player.prototype.start = function () {
    if (!audio()) return;
    if (current && current !== this) current.stop();
    current = this; this.running = true; this.btn.textContent = "Stop"; this.btn.setAttribute("aria-pressed", "true");
    var P = this.P, t = ctx.currentTime + 0.1, beat = 60 / this.bpm;
    for (var b = 0; b < P.beats; b++) { click(t + b * beat, b === 0); }     // one bar count-in
    this.beatT = t + P.beats * beat; this.beatI = 0; this.nextT = this.beatT; this.step = 0;
    var self = this; this.timer = setInterval(function () { self.tick(); }, 25); this.tick();
  };
  Player.prototype.stop = function () {
    this.running = false; clearInterval(this.timer); this.btn.textContent = "Play"; this.btn.setAttribute("aria-pressed", "false");
    this.groups.forEach(function (g) { g.classList.remove("on"); });
    if (current === this) current = null;
  };
  Player.prototype.tick = function () {
    var P = this.P, h = ctx.currentTime + 0.12, self = this;
    while (this.beatT < h) { if (this.met) click(this.beatT, this.beatI % P.beats === 0); this.beatT += 60 / this.bpm; this.beatI++; }
    while (this.nextT < h) {
      var i = this.step % P.steps, t = this.nextT, d = this.stepDur(i);
      ["cr", "hh", "rd", "t1", "sn", "t2", "bd", "hf"].forEach(function (k) {
        var c = P.lines[k] && P.lines[k][i]; if (!isNote(c)) return;
        if (self.tieT[k + ":" + i]) return;
        var v = P.acc[i] === ">" ? 1 : (c === "g" ? 0.22 : 0.62);
        if (k === "hh" && c === "O") { hit("ho", t, v); return; }
        if (k === "rd" && (P.swing || P.triplet) && BUFS.rj) { hit("rj", t, v); return; }
        if (c === "f") hit(k, t - 0.03, 0.2);
        if (c === "d") { hit(k, t - 0.06, 0.18); hit(k, t - 0.03, 0.18); }
        if (c === "z" || c === "w") {
          var len = 1, j = i + 1; while (j < P.steps && !HANDS.some(function (q) { return isNote(P.lines[q] && P.lines[q][j]); })) { len++; j++; }
          var total = 0; for (var q = 0; q < len; q++) total += self.stepDur((i + q) % P.steps);
          var n = c === "w" ? Math.round(total / (60 / self.bpm) * 8) : Math.round(total / (60 / self.bpm) * 16);
          for (var s2 = 0; s2 < n; s2++) hit(k, t + s2 * total / n, c === "w" ? 0.45 : 0.22 + Math.random() * 0.08);
          return;
        }
        hit(k, t, v);
      });
      (function (gi, when) { setTimeout(function () { if (!self.running) return; self.groups.forEach(function (g, n) { g.classList.toggle("on", n === gi); }); }, Math.max(0, (when - ctx.currentTime) * 1000)); })(i, t);
      this.nextT += d; this.step++;
    }
  };

  function init() {
    [].forEach.call(document.querySelectorAll(".ex[data-spec]"), function (box) {
      try { new Player(box); } catch (e) { box.querySelector(".exsvg").textContent = "Notation error: " + e.message; if (window.console) console.error(e); }
    });
  }
  window.AmadeusBook = { prep: prep, render: render };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
