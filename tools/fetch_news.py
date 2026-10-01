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
]
UA = {"User-Agent": "Mozilla/5.0 (compatible; AmadeusDrumNews/1.0; +https://douggarceau.com/)"}
def when(s):
    if not s: return None
    try: return email.utils.parsedate_to_datetime(s).astimezone(datetime.timezone.utc)
    except Exception: pass
    try: return datetime.datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(datetime.timezone.utc)
    except Exception: return None
items, ok = [], []
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
            t = g("title"); l = g("link"); d = g("pubDate") or g("published") or g("updated")
            title = html.unescape(re.sub(r"<[^>]+>", "", (t.text or "") if t is not None else "")).strip()
            link = (l.text or l.get("href") or "").strip() if l is not None else ""
            dt = when(d.text if d is not None else None)
            if not title or not link.startswith("http") or not dt: continue
            items.append({"title": title[:160], "link": link, "source": name, "date": dt.strftime("%Y-%m-%d")})
            n += 1
            if n >= 5: break
        ok.append(name)
    except Exception as e:
        print("skip", name, e)
cutoff = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=120)).strftime("%Y-%m-%d")
items = [i for i in items if i["date"] >= cutoff]
items.sort(key=lambda i: i["date"], reverse=True)
seen, out = set(), []
for i in items:
    k = i["title"].lower()
    if k in seen: continue
    seen.add(k); out.append(i)
data = {"updated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "sources": ok, "items": out[:24]}
if out or not __import__("os").path.exists("assets/news.json"):
    json.dump(data, open("assets/news.json", "w"), indent=1)
print(len(out), "headlines from", ok)
