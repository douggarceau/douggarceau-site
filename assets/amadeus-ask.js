/* Amadeus, the site guide: a talking speech bubble that explains each page, plus the site-wide tour. */
(function(){
if(window.__askAmadeus)return;window.__askAmadeus=1;

/* ---------- what Amadeus says on each page ---------- */
var PAGES={
'/':"Hi, I'm Amadeus, and this is my drum school. Up top you can sign up for new lessons, and right below is everything that's new: the Sound Studio, who's drumming on tour, America's best vintage drum shops, live drum news and videos, and what AI is doing to music. Scroll down to tap the 36 sound pads, then pick your level and start learning. Want me to walk you through it? Press Take the tour.",
'/studio/':"Welcome to the Sound Studio. Everything here plays right in your browser, so turn your sound up. Start with the Sounds of Mickey Hart, 200 samples from the Grateful Dead drummer. Then score a scene on the Movie FX board, or build a beat on the drum machine. Headphones make it sound even better.",
'/studio/fx/':"This is the Movie FX board. Every pad plays a real, studio-quality sound effect: thunder, creaking doors, wolf howls, trailer booms, lasers, factory machines and more. Tap the loop pads to keep weather or a factory running in the background, then layer hits on top. Or press a scene button and play a whole movie moment at once. Press stop to silence everything.",
'/studio/hart/':"These are the sounds of Mickey Hart of the Grateful Dead: 200 samples from his own pack. You'll hear the Beam, balafon, kalimba, berimbau, didgeridoo, gongs, drum loops and textures. Loops that share a tempo lock to the same beat, so you can start one, add another, and jam. Use the search box or the filter chips to find a sound fast.",
'/studio/beats/':"This is the Beat Maker, a 16-step drum machine. Pick a kit up top: hip-hop and trap with a real 808, electronic house and techno, or a real acoustic drum set. Tap the squares to turn notes on, press play, and change the tempo and swing. Try a preset to get started, add hi-hat rolls, and when you love it, share your beat with a link.",
'/level7.html':"This is The Kit, an interactive drum set. Pick a groove like rock, swing, bebop or sixteenth notes, press play, and watch the notation light up as it plays. Slow it down with the tempo control, isolate the metronome, and tap any drum to hear it. If you have an electronic kit or MIDI pads, plug them in by USB and play along for real.",
'/grooves/':"Welcome to the Groove Library: 263 grooves to play along with. There are 100 kit grooves, from rock, funk and metal to samba, reggae and bebop, plus 163 jazz loops recorded on a real kit. Pick one, set the tempo, add a click if you want, and play along. It's the best way to build time feel.",
'/drumroom/':"This is the Drum Room, where you can hear every instrument in the percussion section. There are 59 of them, from timpani, marimba and chimes to cowbells, anvils, a thunder sheet and even a cannon. Tap any instrument to hear it, and read how it's played and where you'd hear it in music.",
'/shop/':"Welcome to the Gear Shop. Every piece of drum gear is explained here, from a first kit to DW, snares for every style, sticks and mallets, cymbals, electronic kits, recording gear and beat making. Tap a category tile to jump to it, or tap a brand button to see only that brand. Each item has links to buy, and some links help support the school.",
'/ontour/':"This is On Tour. It shows who's behind the kit for 50 of the biggest acts touring now, from Metallica and Foo Fighters to Rush and Bruno Mars. Search for a band or a drummer, filter by style, and tap through for tour dates. The ticket buttons search Ticketmaster, StubHub and SeatGeek for you.",
'/vintage/':"These are ten of America's best vintage drum shops. Each one has its story, the owner, what they're known for, and the address, hours and phone number. Tap a state to narrow it down, tap the phone number to call, or tap the address for directions. Hours change, so call ahead, and tell them Amadeus sent you.",
'/chat/':"This is Drum Chat, our forum. Talk gear, practice, vintage drums, gigs and electronic kits, and vote on the best posts. There are free classifieds too, for buying, selling and trading gear. To post, enter your email and tap the login link we send you. Be kind, and stay safe when you buy and sell.",
'/rudiments/':"Here are all 40 rudiments, the building blocks of drumming. Each one has notation and playback so you can see it and hear it. Start slowly with a metronome, keep your sticks low and relaxed, and only speed up when it's clean. Five minutes a day makes a big difference.",
'/beats/':"These are 100 famous drum beats you can play along with, from Billie Jean and Back in Black to Motown, boom bap and bossa nova. Pick a beat, read the notation, and press play to hear it. There's also a list of 105 songs every drummer should know.",
'/book/':"This is the Amadeus Drum Method: 100 chapters of playable sheet music. It starts with your first notes and builds up to fills and reading. Every example plays, so you can hear exactly how it should sound. Work through it in order, one chapter at a time.",
'/intermediate-lab.html':"Welcome to the Intermediate Lab: 48 lessons that take you to the next level. You'll learn the five core styles, rock, funk, reggae, jazz and Latin, plus fills, accents, triplets and rolls. The notation lights up as it plays, and you can slow anything down. Take one lesson at a time and master it before moving on.",
'/conservatory-lab.html':"This is the Conservatory, the advanced lab. Here you'll work on linear grooves, double kick, bebop, samba, hand-and-foot fills and odd meters, plus advanced rudiments. Use the tempo control, start slow, and challenge yourself. This is where good drummers get great.",
'/gear.html':"This is the Gear Guide. It explains what each piece of gear is for and which to use where, so you can buy the right thing the first time. When you know what you need, the Gear Shop has picks and links for every category.",
'/parents.html':"Hi, parents! This guide is for you. It covers how to help your child practice, what gear they really need, how to keep the noise down, and how to keep it fun. When your drummer is ready, start them in Bear's Drum Lab.",
'/advertise/':"This page is for brands and shops that want to reach drummers. It shows what's on the site, who visits, and all the places your brand can appear, from the homepage rotation to sponsoring a section. Press the email button and Doug will get back to you.",
'/intermediate/':"This is the intermediate lesson track. Work through the lessons in order, play along with each one, and use the tempo control to start slow. When a lesson feels easy, move on to the next.",
'/advanced/':"This is the advanced lesson track. These lessons are challenging, so take your time, use a metronome, and focus on playing cleanly before playing fast."
};

/* ---------- site-wide tour ---------- */
var STOUR=['/studio/','/studio/fx/','/studio/hart/','/studio/beats/','/level7.html','/grooves/','/drumroom/','/shop/','/ontour/','/vintage/','/chat/'];

/* ---------- voice ---------- */
var muted=false;try{muted=localStorage.getItem('amadeusMute')==='1';}catch(e){}
var voice=null,spoken=false;
function pickVoice(){if(!('speechSynthesis' in window))return;var v=speechSynthesis.getVoices();if(!v.length)return;
 var pref=[/Google UK English Male/i,/Daniel/i,/Alex/i,/Microsoft (Guy|Davis|Andrew|Christopher|Mark)/i,/Fred/i,/Male/i,/en-GB/i,/en-US/i];
 for(var i=0;i<pref.length;i++)for(var j=0;j<v.length;j++)if(pref[i].test(v[j].name+' '+v[j].lang)&&/^en/i.test(v[j].lang)){voice=v[j];return;}
 voice=v.filter(function(x){return /^en/i.test(x.lang);})[0]||v[0];}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function plain(h){var d=document.createElement('div');d.innerHTML=h;return (d.textContent||'').replace(/\s+/g,' ').trim();}
function speak(text){if(!('speechSynthesis' in window)||muted||!text)return false;
 try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(plain(text));if(voice)u.voice=voice;u.rate=0.97;u.pitch=0.85;
  u.onstart=function(){spoken=true;talking(true);};u.onend=u.onerror=function(){talking(false);};speechSynthesis.speak(u);return true;}catch(e){return false;}}
function stop(){if('speechSynthesis' in window)speechSynthesis.cancel();talking(false);}
function setMute(m){muted=m;try{localStorage.setItem('amadeusMute',m?'1':'0');}catch(e){}if(m)stop();
 document.querySelectorAll('[data-amute]').forEach(function(b){b.innerHTML=m?'&#128263; Voice off':'&#128266; Voice on';b.setAttribute('aria-pressed',m?'true':'false');});}
window.amadeusSpeak=function(t){return speak(t);};window.amadeusMute=setMute;
document.addEventListener('click',function(e){var b=e.target.closest('[data-amute]');if(b){e.preventDefault();e.stopPropagation();setMute(!muted);if(!muted&&cur)speak(cur);}},true);

/* ---------- the bubble ---------- */
var css='.amg{position:fixed;right:16px;bottom:16px;z-index:1990;display:flex;flex-direction:column;align-items:flex-end;gap:10px;pointer-events:none}'+
'.amg>*{pointer-events:auto}'+
'.amg-b{position:relative;width:min(380px,calc(100vw - 32px));background:#fffdf5;color:#141414;border-radius:14px;padding:13px 15px 11px;box-shadow:0 0 0 3px #ffd35c,0 12px 34px rgba(0,0,0,.6),0 0 30px rgba(255,211,92,.3);font:500 15.5px/1.5 "IBM Plex Sans",system-ui,sans-serif;transform-origin:85% 100%;transition:opacity .25s,transform .25s}'+
'.amg-b[hidden]{display:block;opacity:0;transform:scale(.85) translateY(10px);pointer-events:none;visibility:hidden}'+
'.amg-b::after{content:"";position:absolute;right:38px;bottom:-12px;border:10px solid transparent;border-bottom:0;border-top:12px solid #fffdf5}'+
'.amg-t{max-height:min(46vh,320px);overflow:auto;padding-right:14px}.amg-t i{display:inline-block;width:2px;height:1em;background:#141414;vertical-align:-2px;margin-left:2px;animation:amgbl .8s steps(2,start) infinite}@keyframes amgbl{50%{opacity:0}}'+
'.amg-n{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:9px}.amg-n span{font:600 11px "IBM Plex Mono",monospace;color:#777;margin-right:auto}'+
'.amg-n a,.amg-n button{display:inline-flex;align-items:center;line-height:1.2;height:auto;min-height:0;width:auto;margin:0;box-shadow:none;letter-spacing:0;text-transform:none;font:700 12px "IBM Plex Sans",sans-serif;border:1px solid #ccc;background:#fff;color:#222;border-radius:6px;padding:5px 9px;cursor:pointer;text-decoration:none}.amg-n .go{background:#ffd35c;border-color:#d9a520;color:#111}'+
'.amg-x{position:absolute;top:4px;right:8px;background:none;border:0;font-size:18px;cursor:pointer;color:#888}'+
'.amg-f{display:flex;align-items:center;gap:8px;padding:4px 16px 4px 4px;border-radius:999px;border:2px solid #ffd35c;background:#111;color:#fff;font:700 15px "IBM Plex Sans",system-ui,sans-serif;cursor:pointer;box-shadow:0 0 18px rgba(255,211,92,.45)}'+
'.amg-f video{width:64px;height:64px;border-radius:50%;object-fit:cover;object-position:center 20%;border:2px solid #ffd35c;background:#000}'+
'.amg-f span{text-align:left;line-height:1.15}.amg-f small{display:block;font:600 10px "IBM Plex Mono",monospace;color:#e8c27a;letter-spacing:.06em;margin-top:2px}'+
'.amg.talk .amg-f video{animation:amgtalk .35s ease-in-out infinite alternate}@keyframes amgtalk{to{transform:scale(1.07)}}'+
'.amg.talk .amg-f{box-shadow:0 0 30px rgba(255,211,92,.9)}'+
'@media (max-width:520px){.amg-f video{width:52px;height:52px}.amg-f{font-size:13px}.amg-b{font-size:14.5px}}'+
'@media (prefers-reduced-motion:reduce){.amg.talk .amg-f video,.amg-t i{animation:none}}';
var root,bub,txt,nav,cur='',typer;
function talking(on){if(root)root.classList.toggle('talk',!!on);}
function here(){return location.pathname.replace(/index\.html$/,'');}
function pageText(){var p=here();if(PAGES[p])return PAGES[p];
 var t=(document.title||'').split('·')[0].trim();
 var ch=t.match(/^(\d+)\.\s*(.+)$/);if(ch)t='chapter '+ch[1]+', '+ch[2];
 if(/^\/book\//.test(p))return 'This is '+t+' from the Amadeus Drum Method. Read the music, press play to hear each example, and play along slowly before speeding up. Use the arrows at the bottom to move to the next chapter.';
 if(/^\/beats\//.test(p))return 'This page is '+t+'. Read the beat, press play to hear it, and play along. Start slow, lock in with the click, and then bring it up to tempo.';
 if(/^\/rudiments\//.test(p))return 'This is '+t+'. Watch the sticking, press play to hear it, and practice slowly with a metronome. Speed up only when it sounds clean and even.';
 return t?'This page is '+t+'. Take a look around, press play on anything you see, and have fun. If you want the full tour of my school, press Take my tour.':'';}
function type(t){clearInterval(typer);var n=0;txt.innerHTML='<i></i>';typer=setInterval(function(){n+=2;txt.innerHTML=t.slice(0,n).replace(/&/g,'&amp;').replace(/</g,'&lt;')+(n<t.length?'<i></i>':'');if(n>=t.length)clearInterval(typer);},24);}
function show(t,navHtml){cur=t;bub.hidden=false;type(t);nav.innerHTML=navHtml;setMute(muted);speak(t);}
function hide(){bub.hidden=true;stop();clearInterval(typer);}
function navFor(){var m=location.search.match(/[?&]stour=(\d+)/),p=here(),k=STOUR.indexOf(p);
 if(m&&k>=0){var nx=STOUR[k+1];return '<span>Tour stop '+(k+1)+' of '+STOUR.length+'</span><button data-amute></button>'+(nx?'<a class="go" href="'+nx+'?stour='+(k+2)+'">Next page &rarr;</a>':'<a class="go" href="/">Back home</a>');}
 if(p==='/')return '<button data-amute></button>'+(window.amadeusTour?'<a class="go" href="#" data-tour>Take the tour &rarr;</a>':'<a class="go" href="/?tour=1">Take the tour &rarr;</a>');
 return '<button data-amute></button><a class="go" href="'+STOUR[0]+'?stour=1">Take my tour &rarr;</a>';}
window.amadeusSiteTourStart=function(){location.href=STOUR[0]+'?stour=1';};
function build(){
 var t=pageText();if(!t)return;
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 root=document.createElement('div');root.className='amg';
 root.innerHTML='<div class="amg-b" role="status" aria-live="polite" hidden><button class="amg-x" aria-label="Close">&times;</button><div class="amg-t"></div><div class="amg-n"></div></div>'+
  '<button class="amg-f" aria-label="Amadeus: hear about this page"><video src="/assets/amadeus-dog.mp4" poster="/assets/amadeus-face.jpg" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video><span>Amadeus<small>Tap me to hear about this page</small></span></button>';
 document.body.appendChild(root);
 bub=root.querySelector('.amg-b');txt=root.querySelector('.amg-t');nav=root.querySelector('.amg-n');
 root.querySelector('.amg-x').onclick=hide;
 root.querySelector('.amg-f').onclick=function(){var sp=('speechSynthesis' in window)&&speechSynthesis.speaking;if(!bub.hidden&&sp){hide();return;}show(t,navFor());if(window.gtag)gtag('event','amadeus_talk',{page:here()});};
 /* browsers only allow speech after the visitor's first tap or key press: say it then */
 var first=function(e){document.removeEventListener('pointerdown',first,true);document.removeEventListener('keydown',first,true);
  if(e.target&&e.target.closest&&e.target.closest('.amg'))return; if(!bub.hidden&&!spoken)setTimeout(function(){speak(cur);},60);};
 document.addEventListener('pointerdown',first,true);document.addEventListener('keydown',first,true);
 var tour=document.getElementById('tour');
 if(tour)new MutationObserver(function(){root.style.display=tour.hidden?'':'none';if(!tour.hidden)hide();}).observe(tour,{attributes:true});
 if(here()==='/'&&/[?&]tour=1/.test(location.search))return;
 setTimeout(function(){show(t,navFor());},/[?&]stour=\d+/.test(location.search)?300:1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
