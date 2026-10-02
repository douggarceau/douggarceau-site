/* Amadeus School of Drums: site-wide "what's new" banner and rotating box.
   Loaded on every page except the kids' pages. Flashing is kept at about 1 per second. */
(function () {
  if (window.__hype) return; window.__hype = 1;
  var TICK = [
    ['/app/', 'NEW: Get the Amadeus app on your phone'],
    ['/studio/hart/', 'ALL NEW: 200 samples, the sounds of Mickey Hart of the Grateful Dead'],
    ['/studio/fx/', 'Hollywood movie sound FX'],
    ['/studio/beats/', 'Drum machine: hip-hop, trap, electronic and acoustic kits'],
    ['/studio/fx/#industrial', 'Industrial loops and metal hits'],
    ['/ontour/', 'On Tour: who is behind the kit for 50 currently touring acts'],
    ['/vintage/', '10 of America\'s best vintage drum shops'],
    ['/drumroom/', 'The Drum Room: 59 percussion instruments'],
    ['/level7.html', 'Plug in your e-kit or MIDI pads and play The Kit'],
    ['/grooves/', '263 grooves to play along with'],
    ['/shop/', 'Gear Shop: drums, cymbals, heads and sticks']
  ];
  var BOX = [
    ['/studio/hart/', 'ALL NEW', '200 SAMPLES', 'The Sounds of Mickey Hart', 'of the Grateful Dead', 'PLAY THEM NOW', '#f0932b'],
    ['/shop/#drumsets', 'IN OUR GEAR SHOP', 'DRUM SETS', 'DW Drums', 'Pro drum sets, explained', 'SEE THEM', '#ffd35c'],
    ['/shop/#cymbals', 'IN OUR GEAR SHOP', 'CYMBALS', 'Zildjian Cymbals', 'Crashes, rides, hats and more', 'SEE THEM', '#e6b450'],
    ['/shop/#hardware', 'IN OUR GEAR SHOP', 'DRUMHEADS', 'Evans Drumheads', 'The right head for your sound', 'SEE THEM', '#5dade2'],
    ['/shop/#sticks', 'IN OUR GEAR SHOP', 'STICKS', 'Vic Firth Sticks', 'Sticks, brushes and mallets', 'SEE THEM', '#e67e22'],
    ['/shop/#drumsets', 'IN OUR GEAR SHOP', 'DRUM SETS', 'Ludwig Drums', 'Classic kits and snares', 'SEE THEM', '#e74c3c'],
    ['/shop/#hardware', 'IN OUR GEAR SHOP', 'DRUMHEADS', 'Remo Drumheads', 'Heads for every drum', 'SEE THEM', '#a6acaf'],
    ['/shop/#cymbals', 'IN OUR GEAR SHOP', 'CYMBALS', 'Paiste Cymbals', 'Bright, musical cymbals', 'SEE THEM', '#f1c40f'],
    ['/shop/#electronic', 'IN OUR GEAR SHOP', 'ELECTRONIC DRUMS', 'Roland V-Drums', 'Electronic kits and pads', 'SEE THEM', '#9477ff'],
    ['/shop/#percussion', 'IN OUR GEAR SHOP', 'PERCUSSION', 'LP Percussion', 'Congas, bongos, shakers and more', 'SEE THEM', '#58d68d'],
    ['/advertise/', 'ADVERTISE', 'YOUR BRAND HERE', 'Your Drum Shop Here', 'Put your brand in front of drummers', 'GET IN TOUCH', '#ff3b2f']
  ];
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var css = ''
    + '.hy-tick{position:relative;z-index:1001;display:flex;height:32px;background:#ffd35c;color:#0a0a0a;overflow:hidden;font:600 13px/32px "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.04em}'
    + '.hy-new{flex:none;background:#c0392b;color:#fff;padding:0 12px;letter-spacing:.2em;animation:hyfl 1.1s steps(2,start) infinite}'
    + '.hy-view{flex:1;overflow:hidden}.hy-track{display:flex;width:max-content;animation:hysc 42s linear infinite}'
    + '.hy-tick:hover .hy-track,.hy-tick:focus-within .hy-track{animation-play-state:paused}'
    + '.hy-run{display:flex;white-space:nowrap}.hy-run a{color:#0a0a0a!important;text-decoration:none;padding:0 15px}.hy-run a:hover{text-decoration:underline}.hy-run i{font-style:normal;opacity:.55}'
    + '@keyframes hysc{to{transform:translateX(-50%)}}@keyframes hyfl{0%{background:#c0392b}50%{background:#ff3b2f}}'
    + '.hy-box{position:fixed;left:16px;bottom:16px;z-index:900;width:250px;display:grid}'
    + '.hy-box a{grid-area:1/1;display:flex;flex-direction:column;padding:12px 16px;border-radius:12px;border:2px solid var(--c);text-decoration:none!important;color:#fff!important;background:radial-gradient(ellipse at 15% 30%,color-mix(in srgb,var(--c) 45%,transparent),transparent 60%),#15130f;opacity:0;visibility:hidden;transition:opacity .6s,visibility .6s;animation:hygl 1.2s ease-in-out infinite;font-family:"IBM Plex Sans",system-ui,sans-serif}'
    + '.hy-box a.on{opacity:1;visibility:visible}.hy-box a.on .hy-h{animation:hypop .5s ease-out}'
    + '.hy-t{font:700 11px "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.14em;color:#ffc078}.hy-t b{background:#c0392b;color:#fff;padding:2px 6px;border-radius:3px;margin-right:6px;animation:hyfl 1.1s steps(2,start) infinite}'
    + '.hy-h{font-family:"Bebas Neue",Impact,sans-serif;font-size:26px;line-height:1.05;margin-top:6px;letter-spacing:.02em}.hy-s{font-size:13px;color:#ddd}.hy-g{margin-top:5px;font:700 11px "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.14em;color:#ffd35c}'
    + '.hy-x{position:absolute;top:-9px;right:-9px;z-index:2;width:24px;height:24px;border-radius:50%;border:0;background:#333;color:#fff;font:700 14px/24px sans-serif;cursor:pointer;padding:0}'
    + '@keyframes hygl{0%,100%{box-shadow:0 0 12px color-mix(in srgb,var(--c) 40%,transparent)}50%{box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 55%,transparent),0 0 40px var(--c)}}'
    + '@keyframes hypop{0%{transform:scale(1.25);opacity:0;filter:blur(4px)}to{transform:none;opacity:1;filter:none}}'
    + '@media (max-width:900px){.hy-box{display:none}}'
    + '@media (prefers-reduced-motion:reduce){.hy-track{animation:none}.hy-view{overflow-x:auto}.hy-new,.hy-box a,.hy-t b,.hy-box a.on .hy-h{animation:none!important}}';
  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    // ticker
    var one = TICK.map(function (x) { return '<a href="' + x[0] + '">' + esc(x[1]) + '</a><i aria-hidden="true">&#9670;</i>'; }).join('');
    var t = document.createElement('div'); t.className = 'hy-tick'; t.setAttribute('role', 'region'); t.setAttribute('aria-label', 'New on the site');
    t.innerHTML = '<span class="hy-new">NEW</span><div class="hy-view"><div class="hy-track"><span class="hy-run">' + one + '</span><span class="hy-run" aria-hidden="true">' + one.replace(/<a /g, '<a tabindex="-1" ') + '</span></div></div>';
    document.body.insertBefore(t, document.body.firstChild);
    // rotating box (computers only)
    var closed = false; try { closed = sessionStorage.getItem('hyBox') === 'x'; } catch (e) {}
    if (closed) return;
    var b = document.createElement('div'); b.className = 'hy-box'; b.setAttribute('aria-live', 'polite');
    b.innerHTML = '<button class="hy-x" aria-label="Close">&times;</button>' + BOX.map(function (x, i) {
      return '<a href="' + x[0] + '" style="--c:' + x[6] + '"' + (i ? ' class="" aria-hidden="true" tabindex="-1"' : ' class="on"') + '><span class="hy-t"><b>' + x[1] + '</b>' + x[2] + '</span><span class="hy-h">' + esc(x[3]) + '</span><span class="hy-s">' + esc(x[4]) + '</span><span class="hy-g">' + x[5] + ' &rarr;</span></a>';
    }).join('');
    document.body.appendChild(b);
    var s = b.querySelectorAll('a'), i = 0, paused = false;
    b.addEventListener('mouseenter', function () { paused = true; }); b.addEventListener('mouseleave', function () { paused = false; });
    b.querySelector('.hy-x').onclick = function () { b.remove(); try { sessionStorage.setItem('hyBox', 'x'); } catch (e) {} };
    b.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a && a.getAttribute('href') === '#advertise-mail') { e.preventDefault(); location.href = '/contact/?r=advertising'; } if (a && window.gtag) gtag('event', 'side_box_click', { target: a.getAttribute('href') }); });
    setInterval(function () {
      if (paused || document.hidden) return;
      s[i].classList.remove('on'); s[i].setAttribute('aria-hidden', 'true'); s[i].tabIndex = -1;
      i = (i + 1) % s.length;
      s[i].classList.add('on'); s[i].removeAttribute('aria-hidden'); s[i].removeAttribute('tabindex');
    }, 30000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
  // Amadeus, the site guide
  var am = document.createElement('script'); am.src = '/assets/amadeus-ask.js?v=15'; am.defer = true; document.head.appendChild(am);
})();
