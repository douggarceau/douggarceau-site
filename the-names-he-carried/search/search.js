/* Site search box for The Names He Carried. Shown on every page.
   Index: search/search-index.json (rebuild with search/build.py). */
(function(){
 if(window.__tnhcSearch)return;window.__tnhcSearch=1;
 var src=(document.currentScript&&document.currentScript.src)||'';
 var base=src.replace(/search\/search\.js.*$/,'');
 if(!base){var s=document.querySelector('script[src*="search/search.js"]');base=s?s.src.replace(/search\/search\.js.*$/,''):'';}
 var IDX=null,loading=null;
 function load(){if(IDX)return Promise.resolve(IDX);if(loading)return loading;
  loading=fetch(base+'search/search-index.json').then(function(r){return r.json()}).then(function(d){
   d.forEach(function(e){e.lt=e.t.toLowerCase();e.lx=e.x.toLowerCase()});IDX=d;return d});return loading}
 var css='#tnhc-search{position:fixed;right:14px;bottom:14px;z-index:10000;font:500 18px/1.3 Inter,system-ui,-apple-system,sans-serif}'+
 '#tnhc-search form{display:flex;align-items:center;gap:0;background:#fff;border:3px solid #1f4a35;border-radius:999px;box-shadow:0 4px 16px #0006;overflow:hidden}'+
 '#tnhc-search input{border:0;outline:0;font:500 20px/1.2 Inter,system-ui,sans-serif;padding:12px 6px 12px 18px;width:230px;color:#111;background:#fff}'+
 '#tnhc-search button.go{border:0;background:#1f4a35;color:#fff;font:700 18px/1 Inter,system-ui,sans-serif;padding:15px 18px;cursor:pointer}'+
 '#tnhc-res{position:fixed;right:14px;bottom:84px;width:min(640px,calc(100vw - 28px));max-height:min(70vh,640px);overflow:auto;background:#fff;color:#111;border:3px solid #1f4a35;border-radius:12px;box-shadow:0 8px 30px #0008;z-index:10001;padding:6px 0}'+
 '#tnhc-res[hidden]{display:none}#tnhc-res .hd{display:flex;justify-content:space-between;align-items:center;padding:8px 16px 10px;border-bottom:1px solid #ddd;font:700 17px Inter,system-ui,sans-serif;color:#1f4a35}'+
 '#tnhc-res .x{border:0;background:#eee;border-radius:8px;font:700 17px Inter,system-ui,sans-serif;padding:8px 14px;cursor:pointer;color:#111}'+
 '#tnhc-res a{display:block;padding:14px 16px;border-bottom:1px solid #e6e6e6;text-decoration:none;color:#111}#tnhc-res a:hover,#tnhc-res a:focus{background:#eef5ef;outline:0}'+
 '#tnhc-res b.t{display:block;font:700 20px/1.25 Inter,system-ui,sans-serif;color:#14352b}#tnhc-res i.sec{font-style:normal;font-size:14px;color:#2e6b3e;font-weight:700;text-transform:uppercase;letter-spacing:.06em}'+
 '#tnhc-res span.sn{display:block;font:400 17px/1.45 Georgia,serif;color:#333;margin-top:4px}#tnhc-res mark,mark.tnhc-hit{background:#ffe27a;color:inherit;padding:0 1px}'+
 '#tnhc-res .none{padding:18px 16px;font-size:18px}'+
 '@media(max-width:760px){#tnhc-search{left:14px;right:14px;bottom:72px}#tnhc-search form{width:100%}#tnhc-search input{flex:1;width:auto;min-width:0}#tnhc-res{right:14px}}'+
 '@media print{#tnhc-search,#tnhc-res{display:none}}';
 function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function rx(w){return w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
 function snip(x,words){var lx=x.toLowerCase(),i=-1;for(var k=0;k<words.length&&i<0;k++)i=lx.indexOf(words[k]);
  var a=Math.max(0,i-80);if(a){var sp=x.indexOf(' ',a);if(sp>-1&&sp<i)a=sp+1}var s=(a?'… ':'')+x.slice(a,a+220)+(a+220<x.length?' …':'');s=esc(s);
  words.forEach(function(w){s=s.replace(new RegExp('('+rx(esc(w))+')','gi'),'<mark>$1</mark>')});return s}
 function find(q){var words=q.toLowerCase().split(/\s+/).filter(function(w){return w.length>1||/\d/.test(w)});if(!words.length)return[];
  var phrase=q.toLowerCase().trim(),r=[];
  IDX.forEach(function(e){var sc=0;for(var k=0;k<words.length;k++){var w=words[k],inT=e.lt.indexOf(w)>-1,inX=e.lx.indexOf(w)>-1;if(!inT&&!inX)return;sc+=inT?50:0;
    if(inX){var n=0,p=0;while((p=e.lx.indexOf(w,p))>-1&&n<20){n++;p+=w.length}sc+=n}}
   if(words.length>1&&(e.lt.indexOf(phrase)>-1||e.lx.indexOf(phrase)>-1))sc+=40;
   if(e.s==='The book')sc+=60;else if(e.s==='People')sc+=30;r.push([sc,e])});
  r.sort(function(a,b){return b[0]-a[0]});return r.slice(0,40).map(function(x){return x[1]})}
 var TOP=/\/archive\//.test(location.pathname);
 function build(){
 if(TOP)css+='#tnhc-search.top{position:sticky;top:0;left:0;right:0;bottom:auto;z-index:10000;background:#f4f6f3;border-bottom:2px solid #1f4a35;padding:10px 14px;box-shadow:0 2px 8px #0002}#tnhc-search.top form{max-width:900px;width:100%;box-sizing:border-box;margin:0 auto;box-shadow:none}#tnhc-search.top{box-sizing:border-box}#tnhc-search.top input{flex:1;width:auto;min-width:0}#tnhc-res.top{top:78px;bottom:auto!important;left:50%;right:auto;transform:translateX(-50%);width:min(900px,calc(100vw - 28px))}@media(max-width:760px){#tnhc-search.top{left:0;right:0;bottom:auto}#tnhc-res.top{bottom:auto!important}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var box=document.createElement('div');box.id='tnhc-search';box.setAttribute('role','search');
  box.innerHTML='<form><label for="tnhc-q" style="position:absolute;left:-9999px">Search the site</label><input id="tnhc-q" type="search" placeholder="Search the site" autocomplete="off"><button class="go" type="submit">Search</button></form>';
  var res=document.createElement('div');res.id='tnhc-res';res.hidden=true;res.setAttribute('aria-live','polite');
  if(TOP){box.className='top';res.className='top';document.body.insertBefore(box,document.body.firstChild);document.body.appendChild(res)}else{document.body.appendChild(res);document.body.appendChild(box)}
  var bn=document.getElementById('tnhc-backnav');
  var inp=box.querySelector('input'),t=null;
  function show(){var q=inp.value.trim();if(q.length<2){res.hidden=true;return}
   load().then(function(){var L=find(q),words=q.toLowerCase().split(/\s+/).filter(Boolean);
    var h='<div class="hd"><span>'+(L.length?L.length+(L.length===40?'+':'')+' results for “'+esc(q)+'”':'Search')+'</span><button class="x" type="button">Close</button></div>';
    h+=L.length?L.map(function(e){return '<a href="'+esc(base+e.u)+'" data-q="'+esc(q)+'"><i class="sec">'+esc(e.s)+'</i><b class="t">'+esc(e.t)+'</b><span class="sn">'+snip(e.x,words)+'</span></a>'}).join(''):'<div class="none">Nothing found for “'+esc(q)+'”. Try a name, a place or a year.</div>';
    res.innerHTML=h;if(TOP)res.style.top=(Math.max(0,box.getBoundingClientRect().bottom)+8)+'px';res.hidden=false;res.querySelector('.x').onclick=function(){res.hidden=true;inp.focus()}})
   .catch(function(){res.innerHTML='<div class="none">Search is not available right now.</div>';res.hidden=false})}
  inp.addEventListener('focus',load);
  inp.addEventListener('input',function(){clearTimeout(t);t=setTimeout(show,180)});
  box.querySelector('form').addEventListener('submit',function(e){e.preventDefault();show()});
  res.addEventListener('click',function(e){var a=e.target.closest('a[data-q]');if(!a)return;try{sessionStorage.setItem('tnhc-q',a.dataset.q)}catch(_){}
   res.hidden=true;
   var here=location.pathname.replace(/index\.html$/,''),there=new URL(a.href,location.href);
   if(there.pathname.replace(/index\.html$/,'')===here&&there.hash){e.preventDefault();if(location.hash===there.hash)hit();else{location.hash=there.hash;setTimeout(hit,900)}}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!res.hidden){res.hidden=true}});
  document.addEventListener('click',function(e){if(!res.hidden&&!res.contains(e.target)&&!box.contains(e.target))res.hidden=true});
  function lift(){box.style.visibility='hidden';res.style.visibility='hidden';var off=0;
   [[innerWidth-60,innerHeight-4],[innerWidth-250,innerHeight-4],[innerWidth/2,innerHeight-4]].forEach(function(pt){var el=document.elementFromPoint(pt[0],pt[1]);
    while(el&&el!==document.body&&el!==document.documentElement){var cs=getComputedStyle(el);if(cs.position==='fixed'||cs.position==='sticky'){if(el.id!=='tnhc-backnav'||innerWidth<=760){var r=el.getBoundingClientRect();if(r.top>innerHeight/2)off=Math.max(off,innerHeight-r.top)}break}el=el.parentElement}});
   box.style.visibility='';res.style.visibility='';
   var basebot=innerWidth<=760?72:14;if(innerWidth<=760&&!document.getElementById('tnhc-backnav'))basebot=14;
   var bb=off?Math.max(basebot,off+10):basebot;box.style.bottom=bb+'px';res.style.bottom=(bb+70)+'px'}
  if(!TOP){lift();setTimeout(lift,800);setTimeout(lift,2000);addEventListener('resize',lift);addEventListener('hashchange',function(){setTimeout(lift,400)});}
  setTimeout(hit,1200);
 }
 function hit(){var q;try{q=sessionStorage.getItem('tnhc-q');sessionStorage.removeItem('tnhc-q')}catch(_){}if(!q)return;
  var words=q.toLowerCase().split(/\s+/).filter(function(w){return w.length>1});var root=document.querySelector('article.chap .body')||document.querySelector('main')||document.body;
  var tries=[q.toLowerCase()].concat(words);
  for(var k=0;k<tries.length;k++){var w=tries[k],tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n;
   while(n=tw.nextNode()){if(n.parentNode.closest('#tnhc-search,#tnhc-res,script,style'))continue;var i=n.data.toLowerCase().indexOf(w);
    if(i>-1){var r=n.splitText(i);r.splitText(w.length);var m=document.createElement('mark');m.className='tnhc-hit';r.parentNode.insertBefore(m,r);m.appendChild(r);
     m.scrollIntoView({block:'center'});return}}}}
 if(document.body)build();else document.addEventListener('DOMContentLoaded',build);
})();
