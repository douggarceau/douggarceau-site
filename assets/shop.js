/* Amadeus School of Drums: "Gear for this lesson" boxes.
   Usage: <div class="gearbox" data-items="pad,sticks5a"></div> then load this script.
   Not used on Bear's Drum Lab or other pages made for young children. */
(function(){
var SHOP={amazonTag:'douggarceau05-20',sweetwaterParam:''};
var ITEMS={
 pad:['Practice pad','Evans RealFeel 12 inch 2-sided practice pad'],
 stand:['Pad stand','Evans RealFeel practice pad stand'],
 sticks5a:['Sticks, 5A','Vic Firth American Classic 5A'],
 sticks7a:['Sticks, 7A','Vic Firth American Classic 7A'],
 brushes:['Brushes','Vic Firth Heritage brush'],
 metronome:['Metronome','Boss DB-90 metronome'],
 iso:['Hearing protection','Vic Firth SIH2 isolation headphones']
};
var css='.gearbox{border:1px solid rgba(255,255,255,.14);border-radius:12px;background:#101316;padding:20px 22px;margin:40px 0 8px}'+
'.gearbox h3{margin:0 0 4px;font-family:"Bebas Neue",Impact,sans-serif;font-weight:400;font-size:30px;letter-spacing:1px;color:#fff}'+
'.gearbox .gb-sub{color:var(--muted,#aaa);font-size:15px;margin:0 0 14px}'+
'.gearbox .gb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}'+
'.gearbox .gb-item{border-top:1px solid rgba(255,255,255,.1);padding:10px 0}'+
'.gearbox .gb-item b{display:block;color:#fff;font-weight:600}.gearbox .gb-item span{display:block;color:var(--gold,#c8102e);font-size:15px;margin:2px 0 8px}'+
'.gearbox .gb-item a{display:inline-flex;align-items:center;min-height:38px;padding:0 12px;margin:0 6px 0 0;border:1px solid var(--gold,#c8102e);border-radius:4px;text-decoration:none;font-size:14px;color:var(--gold,#c8102e)}'+
'.gearbox .gb-item a:hover{background:var(--gold,#c8102e);color:#0a0a0a}'+
'.gearbox .gb-note{color:var(--muted,#aaa);font-size:13px;margin:12px 0 0}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
document.querySelectorAll('.gearbox').forEach(function(box){
 var keys=(box.dataset.items||'').split(','),h='<h3>Gear for this lesson</h3><p class="gb-sub">What this lesson is practiced with.</p><div class="gb-grid">';
 keys.forEach(function(k){var it=ITEMS[k.trim()];if(!it)return;var q=encodeURIComponent(it[1]).replace(/%20/g,'+');
  var az='https://www.amazon.com/s?k='+q+(SHOP.amazonTag?'&tag='+encodeURIComponent(SHOP.amazonTag):'');
  var sw='https://www.sweetwater.com/store/search.php?s='+q+(SHOP.sweetwaterParam?'&'+SHOP.sweetwaterParam:'');
  h+='<div class="gb-item"><b>'+it[0]+'</b><span>'+it[1]+'</span><a rel="sponsored noopener" target="_blank" data-shop="sweetwater" data-item="'+it[0]+'" href="'+sw+'">Sweetwater &rarr;</a><a rel="sponsored noopener" target="_blank" data-shop="amazon" data-item="'+it[0]+'" href="'+az+'">Amazon &rarr;</a></div>';});
 h+='</div><p class="gb-note">Affiliate links: Amadeus School of Drums may earn a small commission at no extra cost to you. As an Amazon Associate I earn from qualifying purchases.</p>';
 box.innerHTML=h;
 box.querySelectorAll('a[data-shop]').forEach(function(a){a.addEventListener('click',function(){if(window.gtag)gtag('event','shop_click',{shop:a.dataset.shop,item:a.dataset.item,page:location.pathname});});});
});
})();
