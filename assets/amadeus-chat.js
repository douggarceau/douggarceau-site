/* Ask Amadeus: the AI chat helper. Talks to the Cloudflare Worker in /worker. */
(function () {
  if (window.__amadeusChat) return; window.__amadeusChat = 1;

  /* Paste the Worker address here once it's set up (see worker/README.md). Empty = chat stays hidden. */
  var RELAY = '';
  if (!RELAY) return;

  var KEY = 'amadeus-chat-v1', msgs = [];
  try { msgs = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { msgs = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-20))); } catch (e) {} }

  var css = '' +
    '.amc-fab{position:fixed;right:16px;bottom:16px;z-index:1995;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:11px 16px 11px 13px;background:#e7bd42;color:#050606;font:700 15px "IBM Plex Sans",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.55),0 0 0 2px #050606;cursor:pointer}' +
    '.amc-fab:hover{filter:brightness(1.08)}.amg .amc-fab{position:static;align-self:flex-end;margin-right:6px}.amc-fab svg{width:20px;height:20px}' +
    '.amc{position:fixed;right:16px;bottom:16px;z-index:1996;width:min(400px,calc(100vw - 32px));height:min(600px,calc(100dvh - 32px));display:flex;flex-direction:column;background:#101316;color:#f5f3ed;border:1px solid #2a2d31;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.7);font:15.5px/1.5 "IBM Plex Sans",system-ui,sans-serif;overflow:hidden}' +
    '.amc[hidden]{display:none}' +
    '.amc-h{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #2a2d31;background:#050606}' +
    '.amc-h img{width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #e7bd42}' +
    '.amc-h b{display:block;font:400 24px/1 "Bebas Neue",Impact,sans-serif;letter-spacing:1px;color:#e7bd42}' +
    '.amc-h small{color:#aaa9a3;font-size:12.5px}' +
    '.amc-h button{margin-left:auto;background:none;border:0;color:#aaa9a3;font-size:26px;line-height:1;padding:4px 8px;cursor:pointer}' +
    '.amc-l{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}' +
    '.amc-m{max-width:88%;padding:9px 13px;border-radius:14px;white-space:normal;overflow-wrap:anywhere}' +
    '.amc-m.u{align-self:flex-end;background:#e7bd42;color:#050606;border-bottom-right-radius:4px}' +
    '.amc-m.a{align-self:flex-start;background:#1c2024;border-bottom-left-radius:4px}' +
    '.amc-m.a a{color:#e7bd42}.amc-m p{margin:0 0 6px}.amc-m p:last-child{margin:0}.amc-m ul{margin:4px 0;padding-left:18px}' +
    '.amc-m.err{background:#3a1416;color:#ffd0d0}' +
    '.amc-dots span{display:inline-block;width:7px;height:7px;margin:0 2px;border-radius:50%;background:#aaa9a3;animation:amcb 1s infinite}' +
    '.amc-dots span:nth-child(2){animation-delay:.15s}.amc-dots span:nth-child(3){animation-delay:.3s}' +
    '@keyframes amcb{0%,80%,100%{opacity:.25}40%{opacity:1}}' +
    '.amc-s{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}' +
    '.amc-s button{border:1px solid #3a3e43;background:none;color:#f5f3ed;border-radius:999px;padding:6px 11px;font:13.5px "IBM Plex Sans",system-ui,sans-serif;cursor:pointer}' +
    '.amc-s button:hover{border-color:#e7bd42;color:#e7bd42}' +
    '.amc-f{display:flex;gap:8px;padding:10px;border-top:1px solid #2a2d31;background:#050606}' +
    '.amc-f textarea{flex:1;resize:none;height:44px;max-height:120px;border:1px solid #3a3e43;border-radius:10px;background:#101316;color:#f5f3ed;padding:10px 12px;font:16px/1.4 "IBM Plex Sans",system-ui,sans-serif}' +
    '.amc-f textarea:focus{outline:none;border-color:#e7bd42}' +
    '.amc-f button{border:0;border-radius:10px;background:#e7bd42;color:#050606;font-weight:700;padding:0 16px;cursor:pointer}' +
    '.amc-f button:disabled{opacity:.45;cursor:default}' +
    '@media (max-width:520px){.amc{right:0;left:0;bottom:0;width:100%;height:100dvh;border-radius:0;border:0}.amc-fab{right:12px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fab = document.createElement('button');
  fab.className = 'amc-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Ask Amadeus a question');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>Ask Amadeus';

  var box = document.createElement('section');
  box.className = 'amc'; box.hidden = true; box.setAttribute('aria-label', 'Ask Amadeus chat');
  box.innerHTML =
    '<div class="amc-h"><img src="/assets/amadeus-face.jpg" alt=""><div><b>Ask Amadeus</b><small>Your drum school guide</small></div><button type="button" aria-label="Close chat">&times;</button></div>' +
    '<div class="amc-l" role="log" aria-live="polite"></div>' +
    '<div class="amc-s"></div>' +
    '<form class="amc-f"><textarea rows="1" placeholder="Ask about drums or the site…" aria-label="Your question" maxlength="1200"></textarea><button type="submit">Send</button></form>';

  var list = box.querySelector('.amc-l'), sug = box.querySelector('.amc-s'),
      form = box.querySelector('form'), ta = box.querySelector('textarea'), send = form.querySelector('button');
  var busy = false;

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(t) {
    var h = esc(t)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\(((?:\/|https:\/\/(?:www\.)?(?:douggarceau|amadeusschoolofdrums)\.com\/)[^\s)]*)\)/g, '<a href="$2">$1</a>');
    return h.split(/\n{2,}/).map(function (p) {
      var lines = p.split('\n');
      if (lines.every(function (l) { return /^\s*([-*•]|\d+\.)\s+/.test(l); })) {
        return '<ul>' + lines.map(function (l) { return '<li>' + l.replace(/^\s*([-*•]|\d+\.)\s+/, '') + '</li>'; }).join('') + '</ul>';
      }
      return '<p>' + lines.join('<br>') + '</p>';
    }).join('');
  }
  function add(role, text, cls) {
    var d = document.createElement('div');
    d.className = 'amc-m ' + (role === 'user' ? 'u' : 'a') + (cls ? ' ' + cls : '');
    d.innerHTML = role === 'user' ? esc(text).replace(/\n/g, '<br>') : fmt(text);
    list.appendChild(d); list.scrollTop = list.scrollHeight; return d;
  }
  function render() {
    list.innerHTML = '';
    add('assistant', "Hi, I'm Amadeus. Ask me anything about drumming, practice, gear, or where to find something on the site.");
    msgs.forEach(function (m) { add(m.role, m.content); });
    sug.innerHTML = '';
    if (!msgs.length) {
      ['Where should a beginner start?', 'How do I practice paradiddles?', 'What snare for jazz?', 'What is a time feel?'].forEach(function (q) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = q;
        b.onclick = function () { ask(q); }; sug.appendChild(b);
      });
    }
  }

  function ask(q) {
    q = (q || '').trim(); if (!q || busy) return;
    busy = true; send.disabled = true; sug.innerHTML = '';
    msgs.push({ role: 'user', content: q }); save(); add('user', q);
    ta.value = ''; ta.style.height = '';
    var wait = add('assistant', ''); wait.innerHTML = '<span class="amc-dots"><span></span><span></span><span></span></span>';
    fetch(RELAY, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs, page: location.pathname + ' (' + document.title + ')' })
    }).then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        wait.remove();
        if (d && d.reply) { msgs.push({ role: 'assistant', content: d.reply }); save(); add('assistant', d.reply); }
        else { msgs.pop(); save(); add('assistant', (d && d.error) || 'Something went wrong. Try again?', 'err'); }
      })
      .catch(function () { wait.remove(); msgs.pop(); save(); add('assistant', "I can't reach the internet right now. Try again in a moment.", 'err'); })
      .then(function () { busy = false; send.disabled = false; });
  }

  function guide() { return document.querySelector('.amg'); }
  function open() {
    render(); box.hidden = false; fab.hidden = true;
    var g = guide(); if (g) g.style.visibility = 'hidden';
    if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
    if (window.gtag) gtag('event', 'amadeus_chat_open');
    setTimeout(function () { ta.focus(); }, 50);
  }
  function close() { box.hidden = true; fab.hidden = false; var g = guide(); if (g) g.style.visibility = ''; fab.focus(); }

  fab.onclick = open;
  box.querySelector('.amc-h button').onclick = close;
  form.onsubmit = function (e) { e.preventDefault(); ask(ta.value); };
  ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(ta.value); } });
  ta.addEventListener('input', function () { ta.style.height = ''; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });

  /* If the talking Amadeus guide is on the page, put the button on his card instead of a corner of its own. */
  function mount() {
    document.body.appendChild(fab); document.body.appendChild(box);
    var tries = 0, t = setInterval(function () {
      var g = guide(), f = g && g.querySelector('.amg-f');
      if (f) { fab.innerHTML = fab.innerHTML.replace('Ask Amadeus', 'Ask me anything'); g.insertBefore(fab, f); clearInterval(t); }
      else if (++tries > 12) clearInterval(t);
    }, 250);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
