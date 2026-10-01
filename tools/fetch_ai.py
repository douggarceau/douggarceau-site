"""Fetch the newest AI-in-music stories into assets/ai.json.
Runs on GitHub Actions with the news job. Keeps only headlines about AI and music,
puts drum-related ones first, and tags each as DRUMS, PROBLEM, PRODUCT or NEWS."""
import json, re, urllib.request, email.utils, datetime, html
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
]
AI = re.compile(r"\bAI\b|\bA\.I\.|\bAI-")  # case-sensitive so words like "said" never match
AI_CI = re.compile(r"artificial intelligence|machine learning|generative|neural net|\bsuno\b|\budio\b|deepfake|voice[- ]clon|elevenlabs|lyria|musicgen|stable audio", re.I)
MUSIC = re.compile(r"music|song|drum|beat|audio|artist|label|record|sample|producer|studio|band|singer|vocal|spotify|grammy|daw|plugin|synth", re.I)
DRUMS = re.compile(r"drum|drummer|percussion|beat ?maker|groove|rhythm|cymbal|snare|\bkit\b|808", re.I)
PROBLEM = re.compile(r"lawsuit|\bsue[sd]?\b|copyright|infring|ban(s|ned)?\b|fake|deepfake|scam|fraud|strike|royalt|stream(ing)? farm|stolen|protest|backlash|threat|settle|unlicensed|backlash|lawmakers|regulat", re.I)
DEAL = re.compile(r"on sale|\bsale\b|% off|\bdeal\b|deals\b|discount|black friday|giveaway|coupon", re.I)
PRODUCT = re.compile(r"sampler|groovebox|instrument|model\b|launch|releas|unveil|introduc|debut|plugin|plug-in|app\b|update|announc|new\b|now available|beta|tool", re.I)
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
            if not title or not link.startswith("http") or not dt: continue
            if DEAL.search(title): continue
            if not (AI.search(title) or AI_CI.search(title)): continue
            if need_music and not MUSIC.search(title): continue
            kind = "DRUMS" if DRUMS.search(title) else "PROBLEM" if PROBLEM.search(title) else "PRODUCT" if PRODUCT.search(title) else "NEWS"
            items.append({"title": title[:170], "link": link, "source": src, "date": dt.strftime("%Y-%m-%d"), "kind": kind})
            n += 1
        log[name + " " + (url.split('q=')[1].split('+when')[0] if 'q=' in url else url.split('/')[2])] = n
    except Exception as e:
        log[name + " " + url[8:60]] = "error: " + str(e)[:80]

cutoff = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=60)).strftime("%Y-%m-%d")
items = [i for i in items if i["date"] >= cutoff]
items.sort(key=lambda i: i["date"], reverse=True)
seen, out = set(), []
for i in items:
    k = re.sub(r"\W+", "", i["title"].lower())
    if k in seen: continue
    seen.add(k); out.append(i)
# drum stories from the last 30 days go to the front, then the newest of the rest
recent = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
out = [i for i in out if i["kind"] == "DRUMS" and i["date"] >= recent] + [i for i in out if not (i["kind"] == "DRUMS" and i["date"] >= recent)]
print(json.dumps(log, indent=1)); print(len(out), "AI stories")
if out:
    json.dump({"updated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
               "items": out[:24], "log": log}, open("assets/ai.json", "w"), indent=1)
