"""Fetch the newest videos from drum brand YouTube channels into assets/videos.json.
Runs on GitHub Actions with the news job. Uses YouTube's public channel feeds (no API key).
Each brand lists one or more @handles to try; the first that resolves to a channel is used."""
import json, re, urllib.request, datetime, html
from xml.etree import ElementTree as ET

CHANNELS = [
    ("Vic Firth", ["vicfirth", "VicFirthCompany"]),
    ("Zildjian", ["zildjian", "ZildjianCompany"]),
    ("DW Drums", ["DWDrums", "dwdrums"]),
    ("Ludwig", ["LudwigDrums", "ludwigdrums", "Ludwig"]),
    ("Roland", ["RolandDrums", "RolandChannel"]),
    ("Meinl", ["MeinlCymbals", "MeinlPercussion", "MeinlDrumFestival", "MEINLcymbals"]),
    ("Drumeo", ["drumeo"]),
]
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9", "Cookie": "CONSENT=YES+1"}
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015",
      "media": "http://search.yahoo.com/mrss/"}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20).read()

def channel_id(handle):
    page = get("https://www.youtube.com/@" + handle).decode("utf-8", "ignore")
    for pat in (r'<link rel="canonical" href="https://www\.youtube\.com/channel/(UC[\w-]{22})"',
                r'"externalId":"(UC[\w-]{22})"', r'"channelId":"(UC[\w-]{22})"'):
        m = re.search(pat, page)
        if m: return m.group(1)
    return None

items, log = [], {}
for name, handles in CHANNELS:
    for h in handles:
        try:
            cid = channel_id(h)
            if not cid: continue
            root = ET.fromstring(get("https://www.youtube.com/feeds/videos.xml?channel_id=" + cid))
            n = 0
            for e in root.findall("a:entry", NS):
                vid = e.findtext("yt:videoId", namespaces=NS)
                title = html.unescape(e.findtext("a:title", "", NS)).strip()
                pub = e.findtext("a:published", "", NS)
                link = e.find("a:link", NS)
                href = link.get("href") if link is not None else ""
                if not vid or not title or "/shorts/" in href: continue
                items.append({"id": vid, "title": title[:120], "source": name, "date": pub[:10]})
                n += 1
                if n >= 6: break
            log[name] = "@%s %s (%d)" % (h, cid, n)
            break
        except Exception as ex:
            log[name + " @" + h] = "error: " + str(ex)[:100]
    else:
        log.setdefault(name, "not found")

items.sort(key=lambda i: i["date"], reverse=True)
# keep the mix varied: at most 3 per channel, 16 total
per, out = {}, []
for i in items:
    if per.get(i["source"], 0) >= 3: continue
    per[i["source"]] = per.get(i["source"], 0) + 1
    out.append(i)
    if len(out) >= 16: break
print(json.dumps(log, indent=1))
if out:  # never wipe the file if YouTube was unreachable this run
    json.dump({"updated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
               "items": out, "log": log}, open("assets/videos.json", "w"), indent=1)
