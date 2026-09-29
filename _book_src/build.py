"""Build the Amadeus drum method book into /book.  Run from the repo root:  python3 _book_src/build.py"""
import html, json, os, sys, importlib, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
OUT = os.path.join(HERE, '..', 'book')
def _v(f): return hashlib.md5(open(os.path.join(OUT, f), 'rb').read()).hexdigest()[:8]
CSSV, JSV = _v('book.css'), _v('player.js')

PARTS = [
    (1, 'Getting Started'), (2, 'Reading Rhythm'), (3, 'Rudiments'), (4, 'Rock Grooves'),
    (5, 'Other Styles'), (6, 'Jazz'), (7, 'Fills'), (8, 'Reading & Musicianship'),
]

def load_chapters():
    chs = []
    for mod in sorted(f[:-3] for f in os.listdir(HERE) if f.startswith('ch_') and f.endswith('.py')):
        chs += importlib.import_module(mod).CHAPTERS
    chs.sort(key=lambda c: c['n'])
    return chs

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="book.css?v={cssv}">
</head>
<body>
<div class="wrap">
'''

def ex_html(n, k, ex):
    spec = {kk: v for kk, v in ex.items() if kk not in ('title', 'cap')}
    label = ex['title'] + (': ' + ex['cap'] if ex.get('cap') else '')
    return ('<div class="ex" data-label="{lab}" data-spec=\'{spec}\'>'
            '<div class="exh"><span class="exn">EXAMPLE {n}.{k}</span><span class="ext">{title}</span></div>'
            '<div class="exsvg"></div>'
            '<div class="exc"><button type="button" class="pl" aria-pressed="false">Play</button>'
            '<span class="bl2">TEMPO</span><button type="button" class="tm" aria-label="Slower">&minus;</button><span class="bpm" aria-live="polite"></span>'
            '<button type="button" class="tp" aria-label="Faster">+</button>'
            '<button type="button" class="mt" aria-pressed="true">Metronome on</button></div>'
            '{cap}</div>').format(
        lab=html.escape(label, quote=True), spec=json.dumps(spec).replace("'", '&#39;'), n=n, k=k,
        title=html.escape(ex['title']), cap=('<p class="cap">' + ex['cap'] + '</p>') if ex.get('cap') else '')

def block_html(ch, b, counter):
    t = b[0]
    if t == 'p': return '<p>' + b[1] + '</p>'
    if t == 'h': return '<h2>' + html.escape(b[1]) + '</h2>'
    if t == 'ul': return '<ul>' + ''.join('<li>' + i + '</li>' for i in b[1]) + '</ul>'
    if t == 'ol': return '<ol>' + ''.join('<li>' + i + '</li>' for i in b[1]) + '</ol>'
    if t == 'table':
        head = ''.join('<th>' + html.escape(c) + '</th>' for c in b[1])
        rows = ''.join('<tr>' + ''.join('<td>' + c + '</td>' for c in r) + '</tr>' for r in b[2])
        return '<table><tr>' + head + '</tr>' + rows + '</table>'
    if t in ('tip', 'box'):
        body = b[2] if isinstance(b[2], str) else '<ul>' + ''.join('<li>' + i + '</li>' for i in b[2]) + '</ul>'
        if isinstance(b[2], str): body = '<p>' + body + '</p>'
        tag = 'TIP' if t == 'tip' else (b[3] if len(b) > 3 else 'NOTE')
        return '<div class="box {c}"><h3><span>{h}</span><span>{tag}</span></h3><div class="bb">{body}</div></div>'.format(
            c='tip' if t == 'tip' else '', h=html.escape(b[1]), tag=tag, body=body)
    if t == 'ex':
        counter[0] += 1
        ex = dict(b[1])
        if ch['part'] == 6: ex['jazz'] = True
        return ex_html(ch['n'], counter[0], ex)
    if t == 'raw': return b[1]
    raise ValueError('unknown block ' + t)

def chapter_page(ch, prev, nxt):
    part = dict(PARTS)[ch['part']]
    counter = [0]
    body = '\n'.join(block_html(ch, b, counter) for b in ch['blocks'])
    pv = '<a class="btn" href="{}">&larr; {}. {}</a>'.format(fname(prev), prev['n'], html.escape(prev['title'])) if prev else '<span></span>'
    nx = '<a class="btn" href="{}">{}. {} &rarr;</a>'.format(fname(nxt), nxt['n'], html.escape(nxt['title'])) if nxt else '<a class="btn" href="index.html">Contents</a>'
    return (HEAD.format(cssv=CSSV, title='{}. {} · Amadeus Drum Method'.format(ch['n'], html.escape(ch['title'])), desc=html.escape(ch['blurb'], quote=True))
            + '<nav class="top"><a href="index.html">&larr; Contents</a><a href="../index.html">Amadeus School of Drums</a></nav>\n'
            + '<p class="kicker">Part {} · {} · Chapter {}</p>\n<h1>{}</h1>\n'.format(ch['part'], html.escape(part), ch['n'], html.escape(ch['title']))
            + body
            + '\n<div class="pager">{}{}</div>\n</div>\n<script src="player.js?v={jsv}"></script>\n</body>\n</html>\n'.format(pv, nx, jsv=JSV))

def fname(ch): return 'ch-{:03d}.html'.format(ch['n'])

def index_page(chs):
    parts = ''
    for pn, pname in PARTS:
        items = [c for c in chs if c['part'] == pn]
        if not items: continue
        parts += '<h2>Part {} · {}</h2><ol>'.format(pn, html.escape(pname)) + ''.join(
            '<li><a href="{}"><span class="n">{}</span><span class="t">{}</span><span class="d">{}</span></a></li>'.format(
                fname(c), c['n'], html.escape(c['title']), html.escape(c['blurb'])) for c in items) + '</ol>'
    return (HEAD.format(cssv=CSSV, title='The Amadeus Drum Method', desc='A 100-chapter drum method with playable sheet music.')
            + '<nav class="top"><a href="../index.html">&larr; Amadeus School of Drums</a><a href="../learn/index.html">Level 7 lessons</a></nav>\n'
            + '<p class="kicker">Amadeus School of Drums</p><h1>The Amadeus Drum Method</h1>\n'
            + '<p>A complete method in {} chapters, from holding the sticks to reading charts. Every chapter has sheet music you can press play on: it counts you in, keeps a metronome going, and lights up each note as it plays.</p>'.format(len(chs))
            + '<p><a class="btn solid" href="{}">Start at chapter 1 &rarr;</a></p>'.format(fname(chs[0]))
            + '<div class="toc">' + parts + '</div>\n</div>\n</body>\n</html>\n')

def main():
    chs = load_chapters()
    nums = [c['n'] for c in chs]
    assert len(nums) == len(set(nums)), 'duplicate chapter numbers'
    os.makedirs(OUT, exist_ok=True)
    for i, c in enumerate(chs):
        with open(os.path.join(OUT, fname(c)), 'w') as f:
            f.write(chapter_page(c, chs[i - 1] if i else None, chs[i + 1] if i + 1 < len(chs) else None))
    with open(os.path.join(OUT, 'index.html'), 'w') as f:
        f.write(index_page(chs))
    print('built', len(chs), 'chapters,', sum(1 for c in chs for b in c['blocks'] if b[0] == 'ex'), 'examples')

if __name__ == '__main__':
    main()
