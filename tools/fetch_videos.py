"""Fetch the newest videos from drum brand YouTube channels into assets/videos.json.
Runs on GitHub Actions with the news job. Uses YouTube's public channel feeds (no API key).
Each brand lists one or more @handles to try; the first that resolves to a channel is used."""
import json, re, urllib.request, urllib.parse, datetime, html
from xml.etree import ElementTree as ET

# (label, handles to try, search words, regex the channel's own name must match[, regex a title must match])
DRUMWORDS = r"drum|percussion|cymbal|snare|\bkit\b"
CHANNELS = [
    ("DW Drums", ["DWDrums"], "DW Drums", r"\bdw\b|drum workshop"),
    ("Ludwig", ["LudwigDrums"], "Ludwig Drums official", r"ludwig drum"),
    ("Meinl", ["MeinlCymbals"], "Meinl Cymbals", r"meinl"),
    ("Meinl Drum Festival", ["MeinlDrumFestival"], "Meinl Drum Festival", r"drum festival"),
    ("Roland", ["RolandGlobal"], "Roland channel", r"^roland", DRUMWORDS + r"|v-drum|\btd-|\bspd|octapad|handsonic"),
    ("Drumeo", ["drumeoofficial"], "Drumeo", r"drumeo"),
    ("Tama", ["TAMAdrums", "tamadrumsofficial"], "TAMA drums official", r"^tama"),
    ("Pearl", ["PearlDrumsUSA", "PearlDrums"], "Pearl Drums", r"pearl drums|pearl corporation|pearl music"),
    ("Gretsch", ["GretschDrums"], "Gretsch Drums", r"gretsch"),
    ("Sabian", ["SABIANcymbals", "sabian"], "SABIAN cymbals", r"sabian"),
    ("Paiste", ["PaisteCymbals", "paiste"], "Paiste cymbals", r"paiste"),
    ("Modern Drummer", ["ModernDrummer", "moderndrummermagazine"], "Modern Drummer magazine", r"modern drummer"),
    ("Drumtalk TV", ["DrumtalkTV"], "Drumtalk TV", r"drumtalk"),
    ("NAMM", ["NAMM", "NAMMvideos"], "NAMM", r"^namm", DRUMWORDS),
    ("Percussive Arts Society", ["PercussiveArtsSociety"], "Percussive Arts Society PASIC", r"percussive arts"),
]
# Only these kinds of videos are kept (checked in this order)
KINDS = [
    ("INTERVIEW", r"interview|in conversation|conversation with|sits down|\btalks?\b|q ?& ?a|podcast|chat with|catches up|story behind"),
    ("EVENT", r"\bnamm\b|pasic|drum ?fest|festival|drum show|drum-?off|clinic|musikmesse|summit|expo|convention|live at|\blive from"),
    ("DEMO", r"\bdemo\b|demonstration|sound ?test|comparison|first look|sound check|soundcheck|\bhear\b|in action"),
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

def search(q):
    page = get("https://www.youtube.com/results?search_query=" + urllib.parse.quote(q) + "&sp=EgIQAg%3D%3D").decode("utf-8", "ignore")
    return re.findall(r'"channelRenderer":\{"channelId":"(UC[\w-]{22})"', page)[:5]

cutoff = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=365)).strftime("%Y-%m-%d")
items, log = [], {}
for ch in CHANNELS:
    name, handles, q, want = ch[:4]
    only = ch[4] if len(ch) > 4 else None
    cands = []
    for h in handles:
        try:
            cid = channel_id(h)
            if cid: cands.append(("@" + h, cid))
        except Exception as ex:
            log[name + " @" + h] = "error: " + str(ex)[:60]
    try:
        cands += [("search", c) for c in search(q)]
    except Exception as ex:
        log[name + " search"] = "error: " + str(ex)[:60]
    for h, cid in cands:
        try:
            root = ET.fromstring(get("https://www.youtube.com/feeds/videos.xml?channel_id=" + cid))
            author = root.findtext("a:title", "", NS)
            if not re.search(want, author, re.I):
                log[name + " skip " + cid] = author[:40]; continue
            n = 0
            for e in root.findall("a:entry", NS):
                vid = e.findtext("yt:videoId", namespaces=NS)
                title = html.unescape(e.findtext("a:title", "", NS)).strip()
                pub = e.findtext("a:published", "", NS)
                link = e.find("a:link", NS)
                href = link.get("href") if link is not None else ""
                if not vid or not title or pub[:10] < cutoff: continue
                if only and not re.search(only, title, re.I): continue
                if "/shorts/" in href or "#shorts" in title.lower(): continue
                kind = next((k for k, rx in KINDS if re.search(rx, title, re.I)), None)
                if not kind: continue
                items.append({"id": vid, "title": title[:120], "source": name, "date": pub[:10], "kind": kind})
                n += 1
                if n >= 6: break
            log[name] = "%s %s %s (%d)" % (h, cid, author, n)
            if n: break
        except Exception as ex:
            log[name + " @" + h] = "error: " + str(ex)[:100]
    else:
        log.setdefault(name, "not found")

items.sort(key=lambda i: i["date"], reverse=True)
# keep the mix varied: at most 3 per channel, 16 total
per, out, seen = {}, [], set()
for i in items:
    k = re.sub(r"\W+", "", i["title"].lower())
    if k in seen: continue
    seen.add(k)
    if per.get(i["source"], 0) >= 3: continue
    per[i["source"]] = per.get(i["source"], 0) + 1
    out.append(i)
    if len(out) >= 16: break
print(json.dumps(log, indent=1))
if out:  # never wipe the file if YouTube was unreachable this run
    json.dump({"updated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
               "items": out, "log": log}, open("assets/videos.json", "w"), indent=1)
