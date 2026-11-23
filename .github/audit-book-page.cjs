// Collect what readers can actually reach through the book, including client-rendered pages.
module.exports = function inspectPage() {
  const visible = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
  const main = document.querySelector('#view,main') || document.body;
  const text = e => (e.innerText || e.textContent || '').trim().replace(/\s+/g, ' ');
  const links = [...document.querySelectorAll('a[href], [data-go], object[data], [src], [poster],link[rel=stylesheet]')].flatMap(e => {
    const attrs = [e.href?.baseVal || e.getAttribute('href'), e.getAttribute('src'), e.getAttribute('poster'),e.getAttribute('data')];
    if (e.dataset.go) attrs.push('/the-names-he-carried/#' + e.dataset.go);
    return attrs.filter(Boolean).map(s => [new URL(s, location.href).href, text(e).slice(0,100) || e.getAttribute('alt') || e.tagName]);
  });
  const luminance = rgb => rgb.slice(0,3).map(i => i/255).map(i => i<=.04045 ? i/12.92 : ((i+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
  const pixels = c => (c.match(/[\d.]+/g)||[]).map(Number);
  function background(el) {
    for (let n=el; n; n=n.parentElement) {
      const c=getComputedStyle(n), rgba=pixels(c.backgroundColor);
      if (c.backgroundImage!=='none' || Number(c.opacity)<1 || (rgba.length===4 && rgba[3]>0 && rgba[3]<1)) return null;
      if(rgba.length===3 || rgba[3]===1) return luminance(rgba);
    }
    return 1;
  }
  const styles=new Set(),low=new Set(), small=new Set();
  for(const e of document.querySelectorAll('body *')) {
    if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()) || !visible(e) || /^(SCRIPT|STYLE|OPTION|TITLE)$/.test(e.tagName))continue;
    const c=getComputedStyle(e), fs=parseFloat(c.fontSize), t=text(e).slice(0,80);
    styles.add([c.fontFamily,c.fontSize,c.fontWeight,c.fontStyle].join(' | '));
    if(fs<12)small.add(t);
    const bg=background(e), fg=pixels(c.color);
    if(bg===null || !fg.length || (fg.length===4&&fg[3]<1))continue;
    const l=luminance(fg),ratio=(Math.max(bg,l)+.05)/(Math.min(bg,l)+.05);
    if(ratio+.005<(fs>=24 || (fs>=18.66 && parseInt(c.fontWeight)>=700)?3:4.5))low.add([ratio.toFixed(2),e.tagName+'.'+e.className,t].join(' | '));
  }
  const issues=[];
  for(const img of document.images) if(!img.hasAttribute('alt'))issues.push('Missing alt: '+img.getAttribute('src'));
  for(const e of document.querySelectorAll('button,a[href],select,input:not([type=hidden])')) if(visible(e)&&!text(e)&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')&&!e.getAttribute('title')&&!e.querySelector('img[alt]'))issues.push('Unnamed control: '+e.outerHTML.slice(0,130));
  const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
  for(const id of new Set(ids.filter((x,i)=>ids.indexOf(x)!==i)))issues.push('Duplicate id: '+id);
  const width=document.documentElement.clientWidth;
  const overflow=document.documentElement.scrollWidth-width;
  const wide=overflow>1?[...document.querySelectorAll('body *')].filter(e=>visible(e)&&e.getBoundingClientRect().right>width+1).slice(0,7).map(e=>e.tagName+'.'+e.className):[];
  const opening=main.querySelector('.opening-line');
  return {title:document.title,heading:text(main.querySelector('h1,h2')||main).slice(0,120),links,styles:[...styles],low:[...low],small:[...small],issues,overflow,wide,ids,opening:opening&&[text(opening).slice(0,80),getComputedStyle(opening,'::first-letter').fontSize],records:[...main.querySelectorAll('a.rec')].map(a=>a.getAttribute('href')),blocks:[...main.querySelectorAll('p,li,dt,dd,blockquote,figcaption,td,th,pre,h1,h2,h3,h4,.ref,.fam>div,.tl li,.recrow')].filter(e=>visible(e)&&!e.closest('nav')&&!e.querySelector('p,ul,ol,td,dd')).map(text).filter(Boolean)};
};
