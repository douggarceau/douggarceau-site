"""Fetch the newest AI-in-music stories into assets/ai.json.
Runs on GitHub Actions with the news job. Keeps only headlines about AI and music,
puts drum-related ones first, and tags each as DRUMS, PROBLEM, PRODUCT or NEWS."""
import json, re, urllib.request, urllib.parse, email.utils, datetime, html
from xml.etree import ElementTree as ET

# (name, feed url, needs a music word too?) - tech-only feeds must also mention music
FEEDS = [
    ("MusicRadar", "https://www.musicradar.com/feeds/all", False),
    ("MusicRadar", "https://www.musicradar.com/feeds/tag/drums", False),
    ("Music Business Worldwide", "https://www.musicbusinessworldwide.com/feed/", False),
    ("Digital Music News", "https://www.digitalmusicnews.com/feed/", False),
    ("CDM", "https://cdm.link/feed/", False),
    ("Gearnews", "https://www.gearnews.com/feed/", False),
    ("MusicTech", "https://musictech.com/feed/", False),
    ("Rekkerd", "https://rekkerd.org/feed/", False),
    ("Music Ally", "https://musically.com/feed/", False),
    ("Hypebot", "https://www.hypebot.com/feed/", False),
    ("Attack Magazine", "https://www.attackmagazine.com/feed/", False),
    ("Billboard", "https://www.billboard.com/feed/", False),
    ("Modern Drummer", "https://www.moderndrummer.com/feed/", False),
    ("Drumming News Network", "https://drummingnewsnetwork.com/feed/", False),
    ("The Verge", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", True),
    ("TechCrunch", "https://techcrunch.com/category/artificial-intelligence/feed/", True),
    ("Ars Technica", "https://feeds.arstechnica.com/arstechnica/technology-lab", True),
    ("Google News", "https://news.google.com/rss/search?q=%22AI%22+drums+when:30d&hl=en-US&gl=US&ceid=US:en", True),
    ("Google News", "https://news.google.com/rss/search?q=%22AI%22+drummer+when:30d&hl=en-US&gl=US&ceid=US:en", True),
    ("Google News", "https://news.google.com/rss/search?q=%22AI+music%22+when:30d&hl=en-US&gl=US&ceid=US:en", True),
    ("Google News", "https://news.google.com/rss/search?q=Suno+OR+Udio+when:30d&hl=en-US&gl=US&ceid=US:en", True),
    ("Google News", "https://news.google.com/rss/search?q=%22AI%22+music+lawsuit+OR+copyright+when:30d&hl=en-US&gl=US&ceid=US:en", True),
    ("Google News", "https://news.google.com/rss/search?q=%22AI%22+music+producer+plugin+when:30d&hl=en-US&gl=US&ceid=US:en", True),
    ("Google News", "https://news.google.com/rss/search?q=%22AI%22+drum+plugin+OR+%22drum+machine%22+when:30d&hl=en-US&gl=US&ceid=US:en", True),
    ("Google News", "https://news.google.com/rss/search?q=%22AI%22+stem+separation+when:30d&hl=en-US&gl=US&ceid=US:en", True),
    ("Google News", "https://news.google.com/rss/search?q=%22AI%22+DAW+OR+%22Logic+Pro%22+OR+Ableton+OR+%22FL+Studio%22+when:30d&hl=en-US&gl=US&ceid=US:en", True),
    ("Google News", "https://news.google.com/rss/search?q=%22AI%22+MIDI+generator+OR+%22session+drummer%22+when:30d&hl=en-US&gl=US&ceid=US:en", True),

]
AI = re.compile(r"\bAI\b|\bA\.I\.|\bAI-")  # case-sensitive so words like "said" never match
AI_CI = re.compile(r"artificial intelligence|machine learning|generative|neural net|\bsuno\b|\budio\b|deepfake|voice[- ]clon|elevenlabs|lyria|musicgen|stable audio", re.I)
MUSIC = re.compile(r"music|song|drum|beat|audio|artist|label|record|sample|producer|studio|band|singer|vocal|spotify|grammy|daw|plugin|synth", re.I)
DRUMS = re.compile(r"drum|drummer|percussion|beat ?maker|groove|rhythm|cymbal|snare|\bkit\b|808", re.I)
PROBLEM = re.compile(r"lawsuit|\bsue[sd]?\b|copyright|infring|ban(s|ned)?\b|fake|deepfake|scam|fraud|strike|royalt|stream(ing)? farm|stolen|protest|backlash|threat|settle|unlicensed|backlash|lawmakers|regulat", re.I)
DEAL = re.compile(r"on sale|\bsale\b|% off|\bdeal\b|deals\b|discount|black friday|giveaway|coupon", re.I)
PRODUCT = re.compile(r"stem|integrat|\bDAW\b|logic pro|ableton|fl studio|session (drummer|player)|sampler|groovebox|instrument|launch|releas|unveil|introduc|debut|plugin|plug-in|\bapp\b|now available|beta|\btool", re.I)
# Google News results are kept only from these outlets
TRUSTED = {s.lower() for s in ["Billboard", "Rolling Stone", "Variety", "The Hollywood Reporter", "Music Business Worldwide", "MusicRadar",
    "Music Ally", "Digital Music News", "The Verge", "TechCrunch", "WIRED", "Wired", "Pitchfork", "NME", "The Guardian", "BBC", "BBC News",
    "Reuters", "Associated Press", "AP News", "The New York Times", "Mashable", "Engadget", "Gearnews", "gearnews.com", "MusicTech",
    "CDM Create Digital Music", "Rekkerd.org", "Mixmag", "DJ Mag", "Resident Advisor", "Forbes", "Fast Company", "Ars Technica",
    "Gizmodo", "Attack Magazine", "Sound On Sound", "Drumeo", "Modern Drummer", "The Independent", "Los Angeles Times", "NPR",
    "Bloomberg", "Bloomberg.com", "Financial Times", "The Wall Street Journal", "Axios", "CNN", "CNBC", "Consequence", "Stereogum",
    "Spin", "Complex", "Hypebot", "Music Week", "Synthtopia", "MusicRadar.com", "Tom's Guide", "TechRadar", "9to5Mac", "Mixmag Asia",
    "Yahoo", "Yahoo Entertainment", "Loudwire", "Guitar World", "Ultimate Classic Rock", "Drummer's Review", "edm.com", "EDM.com"]}
NOT_MUSIC = re.compile(r"washing|laundry|dryer|brake|oil drum|tumble", re.I)
RELEASE = re.compile(r"launch|releas|unveil|introduc|debut|announc|now available|rolls? out|\badds?\b|updates?\b|\bv\d|beta|arrives|\bdrops\b|unleash|reveal|brings|gets? (new|ai|an? )|\b\d+\.\d+\b|(new|free) .*(plugin|tool|app|model|feature|instrument|sampler|groovebox|software)", re.I)
NOT_RELEASE = re.compile(r"\braise[sd]?\b|funding|valuation|invest|acquir|\bIPO\b|advis[oe]r|hires|appoint|layoff|guest post|opinion|op-ed", re.I)
STRONG = re.compile(r"launch|releas|unveil|announc|introduc|debut|now available", re.I)
PRODUCT_INTRO = re.compile(r"(:|\bis|\bgets) (a|an|the) .{0,60}(sampler|groovebox|plugin|plug-in|synth|instrument|drum machine|app|tool|model|daw|place to)", re.I)
UA = {"User-Agent": "Mozilla/5.0 (compatible; AmadeusDrumNews/1.0; +https://douggarceau.com/)"}

def when(s):
    if not s: return None
    try: return email.utils.parsedate_to_datetime(s).astimezone(datetime.timezone.utc)
    except Exception: pass
    try: return datetime.datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(datetime.timezone.utc)
    except Exception: return None

items, log = [], {}
for name, url, need_music in FEEDS:
    try:
        root = ET.fromstring(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20).read())
        n = 0
        for it in root.iter():
            if it.tag.split('}')[-1] not in ("item", "entry"): continue
            def g(k):
                for c in it:
                    if c.tag.split('}')[-1] == k: return c
            t, l = g("title"), g("link")
            d = None
            for k in ("pubDate", "published", "updated", "date"):
                d = g(k)
                if d is not None: break
            title = html.unescape(re.sub(r"<[^>]+>", "", (t.text or "") if t is not None else "")).strip()
            link = ((l.text or "").strip() or (l.get("href") or "").strip()) if l is not None else ""
            dt = when(d.text if d is not None else None)
            src = name
            if name == "Google News":
                so = g("source")
                if so is not None and (so.text or "").strip():
                    src = so.text.strip()
                    title = re.sub(r"\s+-\s+" + re.escape(src) + r"\s*$", "", title)
                if src.lower() not in TRUSTED: continue
            if "%" in title: title = urllib.parse.unquote_plus(title)
            if not title or not link.startswith("http") or not dt: continue
            if NOT_MUSIC.search(title): continue
            if DEAL.search(title): continue
            if not (AI.search(title) or AI_CI.search(title)): continue
            if need_music and not MUSIC.search(title): continue
            kind = "DRUMS" if DRUMS.search(title) else "PROBLEM" if PROBLEM.search(title) else "PRODUCT" if PRODUCT.search(title) else "NEWS"
            rel = bool(STRONG.search(title) or PRODUCT_INTRO.search(title) or (RELEASE.search(title) and not PROBLEM.search(title))) and not NOT_RELEASE.search(title) and "?" not in title
            items.append({"title": title[:170], "link": link, "source": src, "date": dt.strftime("%Y-%m-%d"), "kind": kind, "release": rel})
            n += 1
        log[name + " " + (url.split('q=')[1].split('+when')[0] if 'q=' in url else url.split('/')[2])] = n
    except Exception as e:
        log[name + " " + url[8:60]] = "error: " + str(e)[:80]

cutoff = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=60)).strftime("%Y-%m-%d")
items = [i for i in items if i["date"] >= cutoff]
items.sort(key=lambda i: i["date"], reverse=True)
STOP = set("the a an and of to in for on with is are its it at by from as new ai music says say".split())
def words(t): return {w for w in re.findall(r"[a-z0-9$]+", t.lower()) if w not in STOP and len(w) > 2}
# the same story from several outlets: keep the first (newest), prefer music outlets for ties
COMMON = {"suno", "udio", "spotify", "sony", "universal", "umg", "warner", "billboard", "youtube", "tiktok", "apple", "google", "openai"}
def names(t): return {w.lower() for w in re.findall(r"\b[A-Z][a-zA-Z]{3,}\b", t)[1:]} - COMMON - STOP
out, keys = [], set()
for i in items:
    key = re.sub(r"\W+", "", i["title"].lower())
    if key in keys or i["title"].lower().startswith("all the latest"): continue
    w, n = words(i["title"]), names(i["title"]) | ({re.findall(r"[A-Za-z]+", i["title"])[0].lower()} if re.match(r"[A-Z][a-z]{3,}", i["title"]) else set())
    n -= COMMON | STOP
    dup = False
    for o in out:
        shared = len(w & o["_w"])
        if shared >= max(3, 0.3 * min(len(w), len(o["_w"]))) or (n & o["_n"] and shared >= 2):
            dup = True; break
    if dup: continue
    keys.add(key); i["_w"], i["_n"] = w, n; out.append(i)
for i in out: i.pop("_w"); i.pop("_n")
# drum stories from the last 30 days go to the front, then the newest of the rest
recent = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
# drum stories first, then good news about new AI tools, then everything else (each group newest first)
rank = lambda i: 0 if (i["kind"] == "DRUMS" and i["date"] >= recent) else 1 if (i["kind"] == "PRODUCT" and i["date"] >= recent) else 2
out.sort(key=rank)
# releases: newest first, one per story (same company named within 3 days = same story)
def caps(t): return {w.lower() for w in re.findall(r"\b[A-Z][A-Za-z0-9]{3,}\b", t)} - STOP - {"music", "launches", "releases", "announces", "with", "new"}
def day(i): return datetime.date.fromisoformat(i["date"])
releases = []
for i in sorted([i for i in out if i.get("release") and i["date"] >= recent], key=lambda i: i["date"], reverse=True):
    c = caps(i["title"])
    if any(c & caps(r["title"]) and abs((day(i) - day(r)).days) <= 3 for r in releases): continue
    releases.append(i)
print(json.dumps(log, indent=1)); print(len(out), "AI stories,", len(releases), "releases")
if out:
    json.dump({"updated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
               "items": out[:24],
               "releases": releases[:8], "log": log}, open("assets/ai.json", "w"), indent=1)
