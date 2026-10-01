/* Ask Amadeus: a site guide that answers common questions with links, and talks out loud.
   It is not a general AI; it matches questions to answers about this site. */
(function(){
if(window.__askAmadeus)return;window.__askAmadeus=1;
var TOURS=[["Metallica", "Lars Ulrich", "", "metallica"], ["Eagles", "Scott F. Crago", "Greg Smith", "eagles"], ["Bruno Mars", "Eric Hernandez", "Daniel Rodriguez", "bruno-mars"], ["Maroon 5", "Matt Flynn", "", "maroon-5"], ["Foo Fighters", "Ilan Rubin", "", "foo-fighters"], ["Journey", "Deen Castronovo", "", "journey"], ["Rod Stewart", "David Palmer", "Julia Thornton", "rod-stewart"], ["System Of A Down", "John Dolmayan", "", "system-of-a-down"], ["Andrea Bocelli", "", "", "andrea-bocelli"], ["Snoop Dogg", "", "", "snoop-dogg"], ["Bryan Adams", "Pat Steward", "", "bryan-adams"], ["Slipknot", "Eloy Casagrande", "Shawn \"Clown\" Crahan, Michael Pfaff", "slipknot"], ["Chicago - The Band", "Walfredo Reyes Jr.", "Ray Yslas", "chicago-the-band"], ["Nickelback", "Daniel Adair", "", "nickelback"], ["Styx", "Todd Sucherman", "", "styx"], ["Foreigner", "Chris Frazier", "", "foreigner"], ["Backstreet Boys", "Keith Harris", "", "backstreet-boys"], ["Blink-182", "Travis Barker", "", "blink-182"], ["Yes", "Jay Schellen", "", "yes"], ["John Legend", "", "", "john-legend"], ["Lil Wayne", "Matthew Mayberry (Yayo the Drummer)", "", "lil-wayne"], ["Five Finger Death Punch", "Charlie Engen", "", "five-finger-death-punch"], ["David Guetta", "", "", "david-guetta"], ["The Beach Boys", "Jon Bolton", "Chris Cron, Randy Leago", "the-beach-boys"], ["André Rieu", "", "Marcel Falize, Glenn Falize", "andre-rieu"], ["Evanescence", "Will Hunt", "", "evanescence"], ["Joe Bonamassa", "Lemar Carter", "", "joe-bonamassa"], ["Tom Jones", "Gary Wallis", "", "tom-jones"], ["Zac Brown Band", "Chris Fryar", "Daniel de los Reyes", "zac-brown-band"], ["30 Seconds to Mars", "Shannon Leto", "", "30-seconds-to-mars"], ["Eric Church", "Craig Wright", "", "eric-church"], ["Jason Aldean", "Rich Redmond", "", "jason-aldean"], ["Megadeth", "Dirk Verbeuren", "", "megadeth"], ["Fantasia", "", "", "fantasia"], ["Black Veil Brides", "Christian \"CC\" Coma", "", "black-veil-brides"], ["Hans Zimmer", "Holly Madge, Aicha Djidjelli", "Aleksandra Šuklar, Steven Doar", "hans-zimmer"], ["Norah Jones", "", "", "norah-jones"], ["Eros Ramazzotti", "Brian Frasier-Moore", "Ramon Montagner", "eros-ramazzotti"], ["Rush", "Anika Nilles", "", "rush"], ["Weezer", "Patrick Wilson, Josh Freese", "", "weezer"], ["Jethro Tull", "Scott Hammond", "", "jethro-tull"], ["The Script", "Adam Marcello", "", "the-script"], ["Il Volo", "", "", "il-volo"], ["Celtic Thunder", "", "", "celtic-thunder"], ["Harry Styles", "", "", "harry-styles"], ["A$AP Rocky", "", "", "a-ap-rocky"], ["Dropkick Murphys", "Matt Kelly", "", "dropkick-murphys"], ["Luke Combs", "Jake Sommers", "", "luke-combs"], ["Celine Dion", "", "", "celine-dion"], ["Paul Anka", "", "", "paul-anka"]];

/* ---------- voice ---------- */
var muted=false;try{muted=localStorage.getItem('amadeusMute')==='1';}catch(e){}
var voice=null;
function pickVoice(){if(!('speechSynthesis' in window))return;var v=speechSynthesis.getVoices();if(!v.length)return;
 var pref=[/Google UK English Male/i,/Daniel/i,/Alex/i,/Fred/i,/Microsoft (Guy|Davis|Andrew|Christopher|Mark)/i,/Male/i,/en-GB/i,/en-US/i];
 for(var i=0;i<pref.length;i++){for(var j=0;j<v.length;j++){if(pref[i].test(v[j].name+' '+v[j].lang)&&/^en/i.test(v[j].lang)){voice=v[j];return;}}}
 voice=v.filter(function(x){return /^en/i.test(x.lang);})[0]||v[0];}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function plain(h){var d=document.createElement('div');d.innerHTML=h;return (d.textContent||'').replace(/\s+/g,' ').trim();}
function speak(text,force){
 if(!('speechSynthesis' in window))return false;
 if(muted&&!force)return false;
 try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(plain(text).replace(/Woof!?/gi,'Woof!'));
  if(voice)u.voice=voice;u.rate=0.98;u.pitch=0.85;u.volume=1;speechSynthesis.speak(u);return true;}catch(e){return false;}
}
function setMute(m){muted=m;try{localStorage.setItem('amadeusMute',m?'1':'0');}catch(e){}if(m&&'speechSynthesis' in window)speechSynthesis.cancel();
 document.querySelectorAll('[data-amute]').forEach(function(b){b.textContent=m?'🔇 Voice off':'🔊 Voice on';b.setAttribute('aria-pressed',m?'true':'false');});}
window.amadeusSpeak=speak;window.amadeusMute=setMute;window.amadeusIsMuted=function(){return muted;};
document.addEventListener('click',function(e){var b=e.target.closest('[data-amute]');if(b){e.preventDefault();setMute(!muted);if(!muted)speak('Voice on. Woof!');}});

/* ---------- answers ---------- */
var A=[
 [/\b(start|begin|beginner|new to|first lesson|learn (the )?drums|where do i start|never played)\b/,'Start with <a href="/bear.html">Bear\'s Drum Lab</a>: 24 lessons for beginners and kids, with notation that lights up and play-along. Grown-up beginners love it too. Then try <a href="/level7.html">The Kit</a> to play along with grooves.'],
 [/\b(kid|kids|child|children|son|daughter|young)\b/,'For kids, <a href="/bear.html">Bear\'s Drum Lab</a> is the place to start. Parents, see the <a href="/parents.html">Parents\' Guide</a> for tips on practice, gear and noise.'],
 [/\b(intermediate|next level|level up|fills?)\b/,'The <a href="/intermediate-lab.html">Intermediate Lab</a> has 48 lessons: rock, funk, reggae, jazz, Latin and fills, plus accents, triplets and rolls.'],
 [/\b(advanced|conservatory|double (kick|bass)|odd (meter|time)|linear|bebop|samba)\b/,'Go deeper in <a href="/conservatory-lab.html">The Conservatory</a>: 48 advanced lessons with linear grooves, double kick, bebop, samba and odd meters.'],
 [/\b(rudiments?|paradiddles?|flams?|drags?|rolls?|sticking)\b/,'All 40 PAS rudiments are in <a href="/rudiments/">The 40 Rudiments</a>, each with notation and playback. Tip: practice slowly with a click and speed up only when it\'s clean.'],
 [/\b(book|method|sheet music|read(ing)? music|notation)\b/,'<a href="/book/">The Amadeus Drum Method</a> has 100 chapters of playable sheet music, from first notes to fills and reading.'],
 [/\b(grooves?|play ?along|jazz loops?|swing|brushes|metronome|click|tempo)\b/,'The <a href="/grooves/">Groove Library</a> has 263 grooves to play along with: 100 kit grooves plus 163 recorded jazz loops. Change the tempo and add a click.'],
 [/\b(famous|songs?|billie jean|back in black|we will rock|motown|boom ?bap|disco|bossa)\b/,'Play along with <a href="/beats/">100 famous drum beats</a>, plus a list of 105 songs every drummer should know.'],
 [/\b(midi|e-?kit|electronic (kit|drums)|usb|roland td|alesis|plug (it )?in|connect)\b/,'Plug your electronic kit or MIDI pads into your computer by USB, then open <a href="/level7.html">The Kit</a> and play. It works in Chrome and Edge. Then try the <a href="/studio/beats/">Beat Maker</a>.'],
 [/\b(mickey hart|grateful dead|beam|balafon|didgeridoo|kalimba)\b/,'Play all 200 of Mickey Hart\'s samples in <a href="/studio/hart/">The Sounds of Mickey Hart</a>. Loops lock in time so you can jam.'],
 [/\b(sound ?fx|sound effects?|movie|horror|trailer|thunder|scene|score)\b/,'The <a href="/studio/fx/">Movie FX board</a> has thunder, horror, trailer hits, sci-fi and industrial sounds, plus one-button scenes. You can also tap the 36 pads on the homepage.'],
 [/\b(beat ?maker|drum machine|808|trap|hip.?hop|make a beat|techno|house)\b/,'Make a beat in the <a href="/studio/beats/">Beat Maker</a>: a 16-step drum machine with hip-hop and trap (a real 808), electronic and acoustic kits. Share your beat with a link.'],
 [/\b(sound studio|studio|samples?)\b/,'The <a href="/studio/">Sound Studio</a> has Mickey Hart\'s samples, the Movie FX board and the Beat Maker, all playable in your browser.'],
 [/\b(timpani|marimba|xylophone|vibes|chimes|glockenspiel|gongs?|cowbell|congas?|bongos?|tambourine|triangle|percussion|orchestra|instruments?)\b/,'Hear and learn every percussion instrument in <a href="/drumroom/">The Drum Room</a>: 59 instruments, from timpani and marimba to gongs and a cannon.'],
 [/\b(cymbals?|ride|crash|hi-?hats?|zildjian|sabian|paiste|meinl)\b/,'For cymbals, choose by sound: dark and complex for jazz, bright and loud for rock. See the picks in the <a href="/shop/#cymbals">Gear Shop: Cymbals</a>.'],
 [/\b(sticks?|7a|5a|5b|2b|mallets?)\b/,'Most players start with 5A sticks; 7A are lighter for jazz, and 5B or 2B are heavier for rock. Every stick, brush and mallet is explained in the <a href="/shop/#sticks">Gear Shop</a>.'],
 [/\b(drum ?set|drum ?kit|first kit|buy|cheap|budget|gear|snare|pedal|throne|heads?|shop)\b/,'The <a href="/shop/">Gear Shop</a> explains 174 pieces of gear with links to buy, from a first kit to DW. Not sure where to start? Read the <a href="/gear.html">Gear Guide</a>.'],
 [/\b(practice pad|quiet|apartment|neighbors|noise)\b/,'Practice quietly with a practice pad or an electronic kit. Both are in the <a href="/shop/#misc">Gear Shop</a>, and the <a href="/parents.html">Parents\' Guide</a> has more noise tips.'],
 [/\b(tune|tuning)\b/,'Tuning tip: tighten each tension rod a little at a time in a star pattern, tap near each rod, and match the pitch all the way around. More in <a href="/level7.html">The Kit</a>.'],
 [/\b(vintage|old drums?|antique|supraphonic|slingerland|radio king)\b/,'See <a href="/vintage/">America\'s 10 best vintage drum shops</a>, with history, hours and phone numbers.'],
 [/\b(on tour|touring|concerts?|who (drums|plays) for|drummer for|tickets?)\b/,'See who\'s drumming with 50 touring acts on <a href="/ontour/">On Tour</a>, with links to tour dates and tickets.'],
 [/\b(news|interviews?|videos?|demos?)\b/,'The latest drum news, video demos and interviews are on the <a href="/#drum-news">homepage</a>. They update automatically all day.'],
 [/\b(ai|artificial|robots?|suno|udio)\b/,'Catch up on <a href="/#ai-music">AI in Music</a>, including the newest AI tools and the Robot Drummers videos.'],
 [/\b(chat|forum|community|classifieds?|sell|for sale|trade)\b/,'<a href="/chat/">Drum Chat</a> is our forum with free classifieds for buying and selling gear. It\'s opening soon.'],
 [/\b(sign ?up|newsletter|email|updates?)\b/,'Sign up at the top of the <a href="/#signup">homepage</a>. It\'s just your email address, and I\'ll let you know when new lessons drop.'],
 [/\b(free|cost|pay|subscription|how much)\b/,'Everything here is free during early release. Just pick a lesson and play!'],
 [/\b(advertis\w*|sponsor\w*|partner)\b/,'See <a href="/advertise/">Advertise with us</a> for sponsorships and placements.'],
 [/\b(contact|doug|owner|who made|who runs)\b/,'Amadeus School of Drums was created by Doug Garceau, a formally trained drummer and percussionist. For business questions, see the <a href="/advertise/">contact page</a>.'],
 [/\b(amadeus|your name|who are you|dog|good boy)\b/,'I\'m Amadeus, the namesake of this drum school. I\'m here to show you around. Woof!'],
 [/\b(hi|hello|hey|yo|sup)\b/,'Hi! I\'m Amadeus. Ask me how to start, where to find something, or what gear to get.']
];
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function answer(q){
 var s=q.toLowerCase();
 for(var i=0;i<TOURS.length;i++){var a=TOURS[i][0].toLowerCase().replace(/ - the band/,'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if(new RegExp('(^|[^a-z0-9])'+a+'([^a-z0-9]|$)').test(s)){var t=TOURS[i];
   return t[1]?esc(t[0])+'\'s drummer on tour is <b>'+esc(t[1])+'</b>'+(t[2]?' (percussion: '+esc(t[2])+')':'')+'. <a href="/ontour/#'+t[3]+'">See '+esc(t[0])+' on On Tour</a>.'
              :'The touring drummer for '+esc(t[0])+' hasn\'t been announced. <a href="/ontour/#'+t[3]+'">See tour dates</a>.';}}
 var hits=[];A.forEach(function(x){if(x[0].test(s))hits.push(x[1]);});
 if(hits.length)return hits.slice(0,2).join('<br><br>');
 return 'Hmm, I\'m not sure about that one yet. I\'m a site guide, so I know my way around here best. Try <a href="/bear.html">starting lessons</a>, the <a href="/studio/">Sound Studio</a>, the <a href="/shop/">Gear Shop</a> or <a href="/ontour/">On Tour</a>.';
}


/* ---------- site-wide tour and per-page hello ---------- */
var STOUR=[
 ['/studio/','Welcome to the Sound Studio! Mickey Hart\'s samples, movie sound effects and drum machines all live here.'],
 ['/studio/fx/','The Movie FX board. Loop the weather, stack the horror, or play a whole scene with one button.'],
 ['/studio/hart/','The Sounds of Mickey Hart: 200 samples from the Grateful Dead drummer. The loops lock in time so you can jam.'],
 ['/studio/beats/','The Beat Maker. Pick a kit, tap the grid and press play. Hip-hop, trap, electronic or acoustic.'],
 ['/level7.html','The Kit! Play along with rock, swing and funk. Plug in an electronic kit and play it for real.'],
 ['/grooves/','The Groove Library: 263 grooves to play along with. Change the tempo and add a click.'],
 ['/drumroom/','The Drum Room: 59 percussion instruments. Tap any one to hear it.'],
 ['/shop/','The Gear Shop: every piece of gear explained. Tap a brand button to see just their gear.'],
 ['/ontour/','On Tour: who\'s drumming with 50 touring acts. Tap a band for tour dates and tickets.'],
 ['/vintage/','America\'s best vintage drum shops. Call ahead and tell them Amadeus sent you!'],
 ['/chat/','Drum Chat: our forum and free classifieds. That\'s the whole tour. Thanks for walking with me. Woof!']];
var HELLO={'/rudiments/':'All 40 rudiments are here. Start slow, then speed up!','/beats/':'Famous beats to play along with. Find your favorite song!','/book/':'The Amadeus Drum Method: 100 chapters, from first notes to fills.','/advertise/':'Want your brand in front of drummers? You\'re in the right place.','/intermediate-lab.html':'Ready to level up? 48 lessons in rock, funk, reggae, jazz and Latin.','/conservatory-lab.html':'The Conservatory. This is where it gets serious!','/gear.html':'Not sure what gear to get? Start here.','/parents.html':'Hi parents! Here\'s how to help your drummer.'};
STOUR.forEach(function(x){HELLO[x[0]]=HELLO[x[0]]||x[1];});
function here(){var p=location.pathname.replace(/index\.html$/,'');return p;}
var tcss='.atour{position:fixed;right:16px;bottom:78px;z-index:1996;width:min(340px,calc(100vw - 32px));background:#fffdf5;color:#141414;border-radius:14px;padding:12px 14px 10px;box-shadow:0 0 0 3px #ffd35c,0 12px 34px rgba(0,0,0,.6);font:600 15px/1.4 "IBM Plex Sans",system-ui,sans-serif}'+
'.atour::after{content:"";position:absolute;right:34px;bottom:-12px;border:10px solid transparent;border-bottom:0;border-top:12px solid #fffdf5}'+
'.atour .n{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:9px}.atour .n span{font:600 11px "IBM Plex Mono",monospace;color:#777;margin-right:auto}'+
'.atour .n a,.atour .n button{font:700 12px "IBM Plex Sans",sans-serif;border:1px solid #ccc;background:#fff;color:#222;border-radius:6px;padding:5px 9px;cursor:pointer;text-decoration:none}.atour .n .go{background:#ffd35c;border-color:#d9a520;color:#111}'+
'.atour.hello{font-weight:600}.atour .x{position:absolute;top:4px;right:8px;background:none;border:0;font-size:18px;cursor:pointer;color:#777}';
function bubble(html,nav){var st=document.createElement('style');st.textContent=tcss;document.head.appendChild(st);
 var b=document.createElement('div');b.className='atour'+(nav?'':' hello');b.setAttribute('role','status');
 b.innerHTML='<button class="x" aria-label="Close">&times;</button><div class="t">'+html+'</div>'+(nav||'');document.body.appendChild(b);
 b.querySelector('.x').onclick=function(){b.remove();if('speechSynthesis' in window)speechSynthesis.cancel();};return b;}
function siteTour(){
 var m=location.search.match(/[?&]stour=(\d+)/);if(!m)return false;var k=+m[1]-1,path=here();
 if(!STOUR[k]||STOUR[k][0]!==path){for(var i=0;i<STOUR.length;i++)if(STOUR[i][0]===path){k=i;break;}}
 if(!STOUR[k])return false;var nx=STOUR[k+1];
 var nav='<div class="n"><span>Stop '+(k+1)+' of '+STOUR.length+'</span><button data-amute aria-pressed="false"></button>'+(nx?'<a class="go" href="'+nx[0]+'?stour='+(k+2)+'">Next page &rarr;</a>':'<a class="go" href="/">Back home</a>')+'</div>';
 var b=bubble(STOUR[k][1],nav);setMute(muted);speak(STOUR[k][1]);
 if(window.gtag)gtag('event','site_tour',{stop:k+1});return true;}
function hello(){var path=here(),t=HELLO[path];if(!t||path==='/')return;var key='amHello'+path;try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');}catch(e){}
 var b=bubble(t+' <a href="/?tour=1" style="color:#8a5a00">Take my tour</a>');setTimeout(function(){if(b.parentNode)b.style.transition='opacity .5s',b.style.opacity='0',setTimeout(function(){b.remove();},500);},7000);}
window.amadeusSiteTourStart=function(){location.href=STOUR[0][0]+'?stour=1';};

/* ---------- chat window ---------- */
var css='.ask-l{position:fixed;right:16px;bottom:16px;z-index:1990;display:flex;align-items:center;gap:8px;padding:5px 14px 5px 5px;border-radius:999px;border:2px solid #ffd35c;background:#111;color:#fff;font:700 13px "IBM Plex Sans",system-ui,sans-serif;cursor:pointer;box-shadow:0 0 18px rgba(255,211,92,.45);animation:askp 2.2s ease-in-out infinite}'+
'.ask-l img{width:40px;height:40px;border-radius:50%;object-fit:cover}@keyframes askp{50%{box-shadow:0 0 30px rgba(255,211,92,.8)}}'+
'.ask{position:fixed;right:16px;bottom:16px;z-index:1995;width:min(370px,calc(100vw - 32px));height:min(520px,calc(100vh - 100px));display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#fffdf5;color:#141414;box-shadow:0 0 0 3px #ffd35c,0 14px 40px rgba(0,0,0,.6);font:15px/1.45 "IBM Plex Sans",system-ui,sans-serif}'+
'.ask[hidden],.ask-l[hidden]{display:none}.ask-h{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#141414;color:#fff}.ask-h img{width:40px;height:40px;border-radius:50%;border:2px solid #ffd35c;object-fit:cover}.ask-h b{display:block;color:#ffd35c}.ask-h small{font-size:11px;color:#aaa}'+
'.ask-h .x{margin-left:auto;background:none;border:0;color:#fff;font-size:22px;cursor:pointer}.ask-h [data-amute]{background:#222;border:1px solid #444;color:#ddd;border-radius:6px;font:600 11px "IBM Plex Sans",sans-serif;padding:4px 7px;cursor:pointer}'+
'.ask-log{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px}.ask-m{max-width:88%;padding:8px 11px;border-radius:12px;background:#f0ebdc}.ask-m.me{align-self:flex-end;background:#ffd35c}.ask-m a{color:#8a5a00;font-weight:700}'+
'.ask-q{display:flex;flex-wrap:wrap;gap:5px;padding:0 12px 8px}.ask-q button{font:600 12px "IBM Plex Sans",sans-serif;border:1px solid #d9c690;background:#fff;border-radius:999px;padding:4px 9px;cursor:pointer}'+
'.ask-f{display:flex;gap:6px;padding:8px;border-top:1px solid #e6dfc8}.ask-f input{flex:1;min-width:0;border:1px solid #ccc;border-radius:8px;padding:8px 10px;font:inherit}.ask-f button{border:0;border-radius:8px;background:#ffd35c;font-weight:700;padding:0 14px;cursor:pointer}'+
'@media (prefers-reduced-motion:reduce){.ask-l{animation:none}}';
function build(){
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 var l=document.createElement('button');l.className='ask-l';l.innerHTML='<img src="/assets/amadeus-face.jpg" alt="">Ask Amadeus';document.body.appendChild(l);
 var p=document.createElement('div');p.className='ask';p.hidden=true;p.setAttribute('role','dialog');p.setAttribute('aria-label','Ask Amadeus');
 p.innerHTML='<div class="ask-h"><img src="/assets/amadeus-face.jpg" alt=""><div><b>Amadeus</b><small>Site guide &middot; ask about the school</small></div><button class="x" aria-label="Close">&times;</button></div><div class="ask-log"></div><div class="ask-q"></div><form class="ask-f"><input placeholder="Ask a question" aria-label="Ask a question" maxlength="200"><button>Ask</button></form>';
 p.querySelector('.ask-h .x').insertAdjacentHTML('beforebegin','<button data-amute aria-pressed="false"></button>');
 document.body.appendChild(p);setMute(muted);
 var log=p.querySelector('.ask-log'),inp=p.querySelector('input');
 function add(h,me){var d=document.createElement('div');d.className='ask-m'+(me?' me':'');d.innerHTML=h;log.appendChild(d);log.scrollTop=1e6;if(!me)speak(h);}
 var Q=['How do I start?','Connect my e-kit','What sticks should I get?','Who drums for Rush?','Take the tour'];
 p.querySelector('.ask-q').innerHTML=Q.map(function(q){return '<button type="button">'+q+'</button>';}).join('');
 function ask(q){q=q.trim();if(!q)return;add(esc(q),true);
  if(/\btour\b/i.test(q)){if(window.amadeusTour){setTimeout(function(){close();window.amadeusTour();},500);add('Follow me!');}else add('The tour starts on the <a href="/?tour=1">homepage</a>. Follow me!');return;}
  setTimeout(function(){add(answer(q));},300);if(window.gtag)gtag('event','ask_amadeus',{q:q.slice(0,80)});}
 function open(){p.hidden=false;l.hidden=true;if(!log.children.length)add('Woof! I\'m Amadeus. What can I help you find?');setTimeout(function(){inp.focus();},50);}
 function close(){p.hidden=true;l.hidden=false;if('speechSynthesis' in window)speechSynthesis.cancel();}
 l.onclick=open;p.querySelector('.ask-h .x').onclick=close;
 p.querySelector('.ask-q').onclick=function(e){var b=e.target.closest('button');if(b)ask(b.textContent);};
 p.querySelector('form').onsubmit=function(e){e.preventDefault();ask(inp.value);inp.value='';};
 window.askAmadeus={open:open,close:close};
 var t=document.getElementById('tour');if(t){new MutationObserver(function(){l.hidden=!t.hidden||!p.hidden;}).observe(t,{attributes:true});}
}
function init(){build();if(!siteTour())setTimeout(hello,1500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
