"""Fetch drum industry headlines from public RSS feeds into assets/news.json.
Runs on GitHub Actions every few hours. Only titles, links, source and date are kept."""
import json, re, urllib.request, email.utils, datetime, html
from xml.etree import ElementTree as ET
FEEDS = [
    ("Modern Drummer", "https://www.moderndrummer.com/feed/"),
    ("Drumming News Network", "https://drummingnewsnetwork.com/feed/"),
    ("Drummer's Review", "https://drummersreview.com/feed/"),
    ("Beat It", "https://en.beatit.tv/feed/"),
    ("Drumeo", "https://www.drumeo.com/beat/feed/"),
    ("Sick Drummer Magazine", "https://sickdrummermagazine.com/feed/"),
    ("The UK Drum Show", "https://theukdrumshow.com/feed/"),
    ("Drummerworld", "https://www.drummerworld.com/feed/"),
    ("Scott K Fish", "https://scottkfish.com/category/drummusic-news/feed/"),
    ("The Drum Ninja", "https://thedrumninja.com/feed/"),
    ("Electronic Drum Advisor", "https://electronicdrumadvisor.com/feed/"),
    ("drum-tec", "https://www.drum-tec.com/blog/news?sRss=1"),
    ("The Drummer's Journal", "https://www.thedrummersjournal.com/blog?format=RSS"),
    ("MusicRadar", "https://www.musicradar.com/feeds/tag/drums"),
]
UA = {"User-Agent": "Mozilla/5.0 (compatible; AmadeusDrumNews/1.0; +https://douggarceau.com/)"}
def when(s):
    if not s: return None
    try: return email.utils.parsedate_to_datetime(s).astimezone(datetime.timezone.utc)
    except Exception: pass
    try: return datetime.datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(datetime.timezone.utc)
    except Exception: return None
items, ok, errs = [], [], {}
for name, url in FEEDS:
    try:
        raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20).read()
        root = ET.fromstring(raw)
        n = 0
        for it in root.iter():
            tag = it.tag.split('}')[-1]
            if tag not in ("item", "entry"): continue
            def g(k):
                for c in it:
                    if c.tag.split('}')[-1] == k: return c
            t = g("title"); l = g("link")
            d = None
            for k in ("pubDate", "published", "updated", "date"):
                d = g(k)
                if d is not None: break
            title = html.unescape(re.sub(r"<[^>]+>", "", (t.text or "") if t is not None else "")).strip()
            link = ((l.text or "").strip() or (l.get("href") or "").strip()) if l is not None else ""
            dt = when(d.text if d is not None else None)
            if not title or not link.startswith("http") or not dt: continue
            items.append({"title": title[:160], "link": link, "source": name, "date": dt.strftime("%Y-%m-%d")})
            n += 1
            if n >= 8: break
        ok.append(name + ' (' + str(n) + ')')
    except Exception as e:
        print("skip", name, e); errs[name] = str(e)[:120]
cutoff = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=120)).strftime("%Y-%m-%d")
items = [i for i in items if i["date"] >= cutoff]
items.sort(key=lambda i: i["date"], reverse=True)
seen, out = set(), []
for i in items:
    k = i["title"].lower()
    if k in seen: continue
    seen.add(k); out.append(i)
data = {"updated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "sources": ok, "errors": errs, "raw_count": len(items), "items": out[:40]}
json.dump(data, open("assets/news.json", "w"), indent=1)
print(len(out), "headlines from", ok)
