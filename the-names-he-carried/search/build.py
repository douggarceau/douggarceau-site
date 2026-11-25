# Builds search-index.json for the site search box. Run from anywhere:
#   python3 the-names-he-carried/search/build.py
import json, re, html, os
from pathlib import Path
R = Path(__file__).resolve().parent.parent
def text(s):
    s = re.sub(r'(?is)<(script|style|noscript|svg|nav|header)\b.*?</\1>', ' ', s)
    s = re.sub(r'(?s)<!--.*?-->', ' ', s)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()
out = []
b = json.load(open(R/'book.json'))
for c in b['chapters']:
    t = text(c.get('html', ''))
    if not t: continue
    lab = c.get('label') or ''
    name = c['title'] if lab in ('', c['title']) else f"{lab}: {c['title']}"
    out.append({'t': name, 's': 'The book', 'u': f"index.html#chapter-{c['n']}", 'x': t})
for p in json.load(open(R/'people.json')):
    parts = [p.get('name', ''), p.get('dates', '')]
    for k, v in p.items():
        if k in ('name', 'slug', 'dates', 'homes', 'papers', 'ch', 'lineage', 'group'): continue
        if isinstance(v, str): parts.append(text(v))
        elif isinstance(v, list): parts += [text(x) for x in v if isinstance(x, str)]
    for l in p.get('lineage', []): parts.append(f"{l.get('rel','')} {l.get('who','')}")
    out.append({'t': p['name'], 's': 'People', 'u': f"index.html#person-{p['slug']}", 'x': ' '.join(x for x in parts if x)})
SKIP = {'index.html', '404.html'}
for f in sorted(R.rglob('*.html')):
    rel = f.relative_to(R).as_posix()
    if rel in SKIP or rel.startswith(('book-edition/', 'design/', 'search/')): continue
    s = f.read_text(errors='ignore')
    if 'http-equiv="refresh"' in s.lower() and len(s) < 3000: continue
    m = re.search(r'(?is)<title>(.*?)</title>', s)
    t = text(m.group(1)) if m else rel
    t = re.sub(r'\s*[|·–—-]\s*The Names He Carried.*$', '', t) or rel
    body = re.search(r'(?is)<body\b.*', s)
    x = text(body.group(0) if body else s)
    x = re.sub(r'^(Douglas Tartan\s*)?(Share\s*)?(The Names He Carried · The Research\s*)?', '', x)
    if x.startswith(t): x = x[len(t):].lstrip()
    if len(x) < 40: continue
    sec = rel.split('/')[0]
    sec = {'cold-case-file': 'Cold Case File', 'research': 'Research File', 'docs': 'Documents', 'archive': 'Archive', 'grand-jury': 'The Case', 'sir-nathaniel': 'The Case'}.get(sec, 'Explore')
    out.append({'t': t, 's': sec, 'u': rel, 'x': x[:60000]})
json.dump(out, open(R/'search'/'search-index.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'entries', os.path.getsize(R/'search'/'search-index.json')//1024, 'KB')
