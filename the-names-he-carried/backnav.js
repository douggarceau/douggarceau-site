(function(){
 if(document.getElementById('tnhc-backnav'))return;
 var home=(document.currentScript&&document.currentScript.src||'').replace(/backnav\.js.*$/,'');
 var d=document.createElement('nav');d.id='tnhc-backnav';d.setAttribute('aria-label','Back and home');
 var css='#tnhc-backnav{position:fixed;left:14px;bottom:14px;z-index:9999;display:flex;gap:6px;font:600 14px/1 Inter,system-ui,-apple-system,sans-serif}#tnhc-backnav a{display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border-radius:999px;background:#14284bee;color:#fff;text-decoration:none;border:1px solid #8cc29a;box-shadow:0 4px 14px #0007}#tnhc-backnav a:hover{background:#1f4d2b}#tnhc-backnav a:focus-visible{outline:3px solid #8cc29a;outline-offset:2px}@media print{#tnhc-backnav{display:none}}';
 var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
 var b=document.createElement('a');b.href='#';b.textContent='← Back';
 b.onclick=function(e){e.preventDefault();if(history.length>1&&document.referrer&&document.referrer.indexOf(location.host)>-1)history.back();else location.href=home;};
 var h=document.createElement('a');h.href=home;h.textContent='Home';
 d.appendChild(b);d.appendChild(h);
 var go=function(){document.body.appendChild(d);if(document.querySelector('.ctrl'))d.style.bottom='96px';};
 if(document.body)go();else document.addEventListener('DOMContentLoaded',go);
})();
