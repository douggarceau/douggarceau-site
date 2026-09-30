/* Groove Library player: seamless looping of recorded drum loops, waveform playhead, click overlay. */
(function () {
  var list = document.getElementById('list'), chips = document.getElementById('chips'), nowEl = document.getElementById('now');
  var STYLES = [
    ['all', 'All'], ['Swing Sticks', 'Swing (sticks)'], ['Brushes', 'Brushes'], ['Bossa', 'Bossa nova'], ['Bossa Sticks', 'Bossa nova (sticks)'], ['Boogaloo', 'Boogaloo'], ['Jungle', 'Jungle']
  ];
  var data = [], filter = 'all', ctx, master, clickBus, cur = null, clickMode = 'off', raf, timer;
  try { var h = decodeURIComponent((location.hash || '').slice(1)); if (h) filter = h; } catch (e) {}

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      clickBus = ctx.createGain(); clickBus.gain.value = 0.5; clickBus.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  var cache = {};
  function load(item) {
    if (!cache[item.id]) cache[item.id] = fetch('../sounds/loops/' + item.id + '.mp3?v=1').then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(function (b) { return new Promise(function (res, rej) { ctx.decodeAudioData(b, res, rej); }); });
    return cache[item.id];
  }
  // Find where the first hit lands in the decoded audio, so encoder padding never breaks the loop point.
  function onsetOf(buf) {
    var d = buf.getChannelData(0), mx = 0, i;
    for (i = 0; i < d.length; i++) { var a = Math.abs(d[i]); if (a > mx) mx = a; }
    var thr = mx * 0.25;
    for (i = 0; i < d.length; i++) if (Math.abs(d[i]) > thr) return i / buf.sampleRate;
    return 0;
  }
  function tick(t, accent) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = accent ? 1760 : 1320;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = accent ? 1760 : 1320; f.Q.value = 4;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(accent ? 0.9 : 0.6, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(f); f.connect(g); g.connect(clickBus); o.start(t); o.stop(t + 0.06);
  }
  function stop() {
    if (!cur) return;
    try { cur.src.stop(); } catch (e) {}
    cur.row.classList.remove('on'); cur.btn.innerHTML = '&#9654;'; cur.btn.setAttribute('aria-pressed', 'false');
    cur.head.setAttribute('x1', -10); cur.head.setAttribute('x2', -10);
    cur = null; cancelAnimationFrame(raf); clearTimeout(timer); nowEl.textContent = '';
  }
  function play(item, row) {
    if (cur && cur.item === item) { stop(); return; }
    stop();
    if (!audio()) return;
    var btn = row.querySelector('.pp'); btn.textContent = '…';
    var token = {}; cur = { item: item, row: row, btn: btn, head: row.querySelector('.head'), token: token };
    load(item).then(function (buf) {
      if (!cur || cur.token !== token) return;
      var off = Math.max(0, onsetOf(buf) - item.on), len = Math.min(item.dur, buf.duration - off);
      var src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = off; src.loopEnd = off + len;
      src.connect(master);
      var t0 = ctx.currentTime + 0.08; src.start(t0, off);
      cur.src = src; cur.t0 = t0; cur.len = len; cur.beat = len / item.beats; cur.next = 0;
      row.classList.add('on'); btn.innerHTML = '&#9632;'; btn.setAttribute('aria-pressed', 'true');
      if (window.gtag) gtag('event', 'groove_play', { loop: item.id });
      schedule(); draw();
    }).catch(function () { if (cur && cur.token === token) { btn.innerHTML = '&#9654;'; cur = null; } });
  }
  function schedule() {
    if (!cur) return;
    var c = cur, horizon = ctx.currentTime + 0.15;
    while (true) {
      var k = c.next, loopN = Math.floor(k / c.item.beats), b = k % c.item.beats;
      var t = c.t0 + loopN * c.len + b * c.beat;
      if (t > horizon) break;
      var inBar = b % 4;
      if (clickMode === 'all') tick(t, inBar === 0);
      else if (clickMode === '24' && (inBar === 1 || inBar === 3)) tick(t, false);
      c.next++;
    }
    timer = setTimeout(schedule, 25);
  }
  function draw() {
    if (!cur || !cur.src) return;
    var el = (ctx.currentTime - cur.t0) % cur.len; if (el < 0) el = 0;
    var x = 2 + (el / cur.len) * 236;
    cur.head.setAttribute('x1', x); cur.head.setAttribute('x2', x);
    var beat = Math.floor(el / cur.beat), bars = Math.max(1, Math.round(cur.item.beats / 4));
    nowEl.textContent = cur.item.title + '  ·  bar ' + (Math.floor(beat / 4) % bars + 1) + ' of ' + bars + ', beat ' + (beat % 4 + 1);
    raf = requestAnimationFrame(draw);
  }
  function wave(p) {
    var d = '';
    for (var i = 0; i < p.length; i++) { var h = Math.max(1, p[i] / 99 * 26), x = 2 + i * 2; d += 'M' + x + ' ' + (28 - h) + 'V' + (28 + h); }
    return d;
  }
  function styleName(s) { for (var i = 0; i < STYLES.length; i++) if (STYLES[i][0] === s) return STYLES[i][1]; return s; }
  function render() {
    chips.innerHTML = STYLES.map(function (s) { return '<button type="button" class="chip' + (s[0] === filter ? ' sel' : '') + '" data-f="' + s[0] + '">' + s[1] + '</button>'; }).join('');
    var items = data.filter(function (x) { return filter === 'all' || x.s === filter; });
    items.sort(function (a, b) { return a.s === b.s ? (a.bpm - b.bpm || a.n - b.n) : a.s < b.s ? -1 : 1; });
    list.innerHTML = items.map(function (x, i) {
      var bars = x.beats / 4, len = (bars === Math.round(bars) ? bars : bars.toFixed(1)) + (bars === 1 ? ' bar' : ' bars');
      return '<li class="row" data-i="' + data.indexOf(x) + '"><button type="button" class="pp" aria-pressed="false" aria-label="Play ' + x.title + '">&#9654;</button>' +
        '<div class="meta"><b>' + styleName(x.s) + '</b><span>' + x.bpm + ' BPM · ' + len + ' · take ' + x.n + '</span></div>' +
        '<svg class="wv" viewBox="0 0 240 56" preserveAspectRatio="none" aria-hidden="true"><path d="' + wave(x.p) + '"/><line class="head" x1="-10" y1="0" x2="-10" y2="56"/></svg></li>';
    }).join('');
    document.getElementById('count').textContent = items.length + (items.length === 1 ? ' groove' : ' grooves');
  }
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]'); if (!b) return;
    stop(); filter = b.getAttribute('data-f'); try { history.replaceState(null, '', filter === 'all' ? location.pathname : '#' + encodeURIComponent(filter)); } catch (e2) {}
    render();
  });
  list.addEventListener('click', function (e) {
    var row = e.target.closest('.row'); if (!row) return;
    play(data[+row.getAttribute('data-i')], row);
  });
  document.getElementById('click').addEventListener('change', function (e) { clickMode = e.target.value; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') stop(); });
  fetch('loops.json?v=1').then(function (r) { return r.json(); }).then(function (d) {
    data = d.map(function (x) { x.title = styleName(x.s) + ' ' + x.bpm + ' BPM, take ' + x.n; return x; });
    render();
  });
})();
