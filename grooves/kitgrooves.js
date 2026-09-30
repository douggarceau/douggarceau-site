/* Groove Library: kit grooves (famous beats + every kit lesson groove), played on the real drum samples. */
(function () {
  var root = document.getElementById('kitg');
  if (!root) return;
  var G = [], cat = 'All', cur = -1, ctx = null, master = null, timer = null, step = 0, nextT = 0, bpm = 100, clickMode = 'off', beatN = 0;
  var SND = {
    hihat: ['hh', .42], hhopen: ['hh-open', .45], ride: ['ride', .5], crash: ['crash', .55],
    snare: ['snare-f', .8], rim: ['rim', .7], tom: ['tom', .75], floor: ['floor', .8],
    kick: ['kick-mf', .95], feather: ['kick-p', .32], hhfoot: ['hh-foot', .45]
  };
  var ROWS = [['crash', 'ride', 'hhopen', 'hihat'], ['snare', 'rim', 'tom', 'floor'], ['kick', 'feather', 'hhfoot']];
  var ROWN = ['Cymbals', 'Snare / toms', 'Feet'];
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function audio() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      ctx = new C(); master = ctx.createGain(); master.gain.value = .9;
      var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      if (window.KitSamples) KitSamples.load(ctx, '../sounds/kit/');
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function click(t, strong) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = strong ? 1760 : 1320;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .04);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + .06);
  }
  function stepDur(g) { return 60 / bpm / g.sub; }
  function offset(g, i) {
    var sw = g.swing; if (!sw || g.sub !== 2 || i % 2 === 0) return 0;
    var r = sw === true ? 2 / 3 : sw; return (r - .5) * 2 * stepDur(g);
  }
  function has(g, v, i) { var p = g.parts[v]; return p && p.indexOf(i) >= 0; }
  function playStep(g, i, t) {
    var tt = t + offset(g, i);
    Object.keys(g.parts).forEach(function (v) {
      if (!has(g, v, i)) return;
      var s = SND[v]; if (!s) return;
      var gain = s[1];
      if ((v === 'hihat' || v === 'ride') && i % g.sub === 0) gain *= 1.15;
      if (v === 'hihat' && has(g, 'snare', i)) gain *= .85;
      if (v === 'hihat' && i > 0 && has(g, 'hhopen', i - 1) && window.KitSamples) KitSamples.play(ctx, master, 'hh-foot', tt, .3, 0);
      var pan = v === 'hihat' || v === 'hhopen' || v === 'hhfoot' ? -.3 : v === 'ride' || v === 'floor' ? .3 : v === 'tom' ? .12 : 0;
      if (window.KitSamples) KitSamples.play(ctx, master, s[0], tt, gain, pan);
    });
    if (clickMode !== 'off' && i % g.sub === 0) {
      var beat = Math.floor(i / g.sub) % g.beats;
      if (clickMode === 'all' || beat % 2 === 1) click(t, beat === 0 && clickMode === 'all');
    }
    var d = Math.max(0, (tt - ctx.currentTime) * 1000);
    setTimeout(function () { light(i); }, d);
  }
  function light(i) {
    var card = root.querySelector('.kg[data-i="' + cur + '"]'); if (!card) return;
    [].forEach.call(card.querySelectorAll('.col'), function (c) { c.classList.toggle('on', +c.dataset.s === i); });
  }
  function tick() {
    var g = G[cur]; if (!g) return;
    while (nextT < ctx.currentTime + .12) { playStep(g, step, nextT); nextT += stepDur(g); step = (step + 1) % g.steps; }
  }
  function stop() {
    clearInterval(timer); timer = null;
    var card = root.querySelector('.kg.playing');
    if (card) { card.classList.remove('playing'); $('.kplay', card).setAttribute('aria-pressed', 'false'); $('.kplay', card).innerHTML = PLAY; [].forEach.call(card.querySelectorAll('.col'), function (c) { c.classList.remove('on'); }); }
    cur = -1; $('#kgNow').textContent = 'Pick a groove and press play.';
  }
  function start(i) {
    if (!audio()) return;
    stop(); cur = i; var g = G[i]; bpm = g.bpm; syncTempo();
    step = 0; nextT = ctx.currentTime + .12; timer = setInterval(tick, 25); tick();
    var card = root.querySelector('.kg[data-i="' + i + '"]'); card.classList.add('playing');
    var b = $('.kplay', card); b.setAttribute('aria-pressed', 'true'); b.innerHTML = STOP;
    $('#kgNow').innerHTML = '<b>' + esc(g.name) + '</b> · ' + esc(g.cat);
    if (window.gtag) gtag('event', 'kit_groove_play', { groove: g.id });
  }
  function syncTempo() { $('#kgBpm').value = bpm; $('#kgBpmV').textContent = bpm; }
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>';
  var STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/></svg>';

  function grid(g) {
    var h = '<div class="kgrid" style="grid-template-columns:repeat(' + g.steps + ',1fr)" aria-hidden="true">';
    for (var s = 0; s < g.steps; s++) {
      h += '<span class="col' + (s % g.sub === 0 ? ' beat' : '') + (g.bars > 1 && s === g.steps / 2 ? ' bar' : '') + '" data-s="' + s + '">';
      ROWS.forEach(function (row) {
        var v = null; row.forEach(function (x) { if (!v && has(g, x, s)) v = x; });
        h += '<i class="' + (v ? 'hit v-' + v : '') + '"></i>';
      });
      h += '</span>';
    }
    return h + '</div>';
  }
  function render() {
    var list = G.map(function (g, i) { return [g, i]; }).filter(function (p) { return cat === 'All' || p[0].cat === cat; });
    $('#kgList').innerHTML = list.map(function (p) {
      var g = p[0], i = p[1];
      return '<li class="kg" data-i="' + i + '"><div class="kh"><button type="button" class="kplay" aria-pressed="false" aria-label="Play ' + esc(g.name) + '">' + PLAY + '</button>' +
        '<div class="kt"><b>' + esc(g.name) + '</b><span>' + esc(g.cat) + ' · ' + g.bpm + ' BPM' + (g.swing ? ' · swung' : '') + (g.beats === 3 ? ' · 3/4' : '') + '</span></div></div>' +
        grid(g) + (g.desc ? '<p class="kd">' + esc(g.desc) + '</p>' : '') +
        '<a class="kl" href="' + g.link + '">' + (g.link.indexOf('level7') >= 0 ? 'Open in The Kit' : 'Learn this beat') + ' &rarr;</a></li>';
    }).join('');
    $('#kgCount').textContent = list.length + ' grooves';
  }
  function chips() {
    var cats = ['All']; G.forEach(function (g) { if (cats.indexOf(g.cat) < 0) cats.push(g.cat); });
    $('#kgChips').innerHTML = cats.map(function (c) { return '<button type="button" class="chip' + (c === cat ? ' on' : '') + '" aria-pressed="' + (c === cat) + '" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
  }
  root.addEventListener('click', function (e) {
    var c = e.target.closest('[data-c]');
    if (c) { stop(); cat = c.dataset.c; chips(); render(); return; }
    var p = e.target.closest('.kplay');
    if (p) { var i = +p.closest('.kg').dataset.i; if (i === cur) stop(); else start(i); }
  });
  $('#kgBpm').addEventListener('input', function (e) { bpm = +e.target.value; $('#kgBpmV').textContent = bpm; });
  $('#kgClick').addEventListener('change', function (e) { clickMode = e.target.value; });
  $('#kgStop').addEventListener('click', stop);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') stop(); });
  fetch('kit.json?v=1').then(function (r) { return r.json(); }).then(function (d) { G = d; chips(); render(); });
})();
