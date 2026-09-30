"""Draws the Level 7 drum kit in each configuration and splices it into level7.html.

Run from the repo root:  python3 _kit_src/build_kit.py
Everything between <!--KIT:BEGIN--> and <!--KIT:END--> in level7.html is replaced.
Coordinates are in a 1280 x 560 drawing; hit pads are placed in percentages so the
kit scales to any screen width.
"""
import re, pathlib

W, H = 1280, 560
ROOT = pathlib.Path(__file__).resolve().parent.parent

FINISHES = {
    # white marine pearl, the current Level 7 kit
    'pearl': (['#bdb3b8', '#f7f1f3', '#ffffff', '#ece3e7', '#b7adb2'], None),
    # blue sparkle, the original Level 7 kit
    'blue': (['#0c2266', '#3a74f0', '#8db8ff', '#2d5fd8', '#0a1d5c'], ['#ffffff', '#cfe0ff', '#9fc2ff']),
}

GLITTER = [(7.1, 3.3, 1.0, .84), (2.1, 12.8, 1.2, .37), (9.5, 1.5, .6, .39), (12.4, 20.8, 1.0, .92), (12.7, 8.7, 1.3, .68),
           (2.9, 9.2, .9, .54), (18.0, 4.0, 1.0, .46), (2.1, 15.7, 1.0, .47), (15.0, 9.4, .8, .90), (8.0, 5.5, .6, .40),
           (6.6, 10.9, .8, .52), (21.6, 2.6, .8, .44), (10.8, .9, 1.0, .69), (19.3, 6.9, 1.1, .65)]


def f(n):
    return ('%.1f' % n).rstrip('0').rstrip('.')


def defs(finish):
    stops, sparks = FINISHES[finish]
    offs = [0, .28, .36, .5, 1]
    g = ''.join('<stop offset="%s" stop-color="%s"></stop>' % (o, c) for o, c in zip(offs, stops))
    if sparks:
        dots = ''.join('<circle cx="%s" cy="%s" r="%s" fill="%s" opacity="%s"></circle>' % (x, y, r, sparks[i % 3], o)
                       for i, (x, y, r, o) in enumerate(GLITTER))
        pat = '<pattern id="glit" width="22" height="22" patternUnits="userSpaceOnUse">' + dots + '</pattern>'
    else:
        # marine pearl: irregular shimmering flakes with fine grey edges and a faint iridescent tint
        flakes = [('0,0 9,2 7,10 0,8', '#fbe9f0'), ('9,2 20,0 18,9 7,10', '#eef3fb'), ('20,0 28,3 26,12 18,9', '#fff7ea'),
                  ('0,8 7,10 5,19 0,17', '#f1ecf8'), ('7,10 18,9 16,18 5,19', '#fdf2f6'), ('18,9 26,12 28,20 16,18', '#e9f1f6'),
                  ('0,17 5,19 8,28 0,28', '#fff4ef'), ('5,19 16,18 17,28 8,28', '#f4eef9'), ('16,18 28,20 28,28 17,28', '#fbeef3')]
        pat = ('<pattern id="glit" width="28" height="28" patternUnits="userSpaceOnUse">' +
               ''.join('<polygon points="%s" fill="%s" opacity="0.8" stroke="#8f858a" stroke-opacity="0.5" stroke-width="0.6"></polygon>' % fl for fl in flakes) +
               '</pattern>')
    return ('<defs>'
            '<linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c8088"></stop><stop offset="0.3" stop-color="#f4f5f7"></stop><stop offset="0.5" stop-color="#a7abb2"></stop><stop offset="0.75" stop-color="#e9ebee"></stop><stop offset="1" stop-color="#6c7078"></stop></linearGradient>'
            '<linearGradient id="bronze" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9a15e"></stop><stop offset="0.5" stop-color="#9c7a3f"></stop><stop offset="1" stop-color="#d4b06a"></stop></linearGradient>'
            '<filter id="glow" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b"></feGaussianBlur><feFlood flood-color="#ffcd5a" flood-opacity="0.9"></feFlood><feComposite in2="b" operator="in"></feComposite><feMerge><feMergeNode></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter>'
            '<linearGradient id="fin" x1="0" y1="0" x2="1" y2="0">' + g + '</linearGradient>'
            + pat +
            '<linearGradient id="lugchrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a8f97"></stop><stop offset="0.35" stop-color="#ffffff"></stop><stop offset="0.6" stop-color="#b3b8bf"></stop><stop offset="1" stop-color="#6c7078"></stop></linearGradient>'
            '</defs>')


def line(x1, y1, x2, y2, stroke='#6f737a', w=3):
    return '<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="%s" stroke-linecap="round"></line>' % (f(x1), f(y1), f(x2), f(y2), stroke, w)


def stand(cx, cy, spread=44):
    return (line(cx, cy, cx, 500, w=4) + line(cx, 500, cx - spread, 540) + line(cx, 500, cx + spread, 540) + line(cx, 500, cx, 540))


def cymbal(pid, cx, cy, rx, ry, rot):
    return ('<g transform="rotate(%s %s %s)" filter="{{%s.filter}}">' % (rot, cx, cy, pid) +
            '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="#4a391f"></ellipse>' % (cx, cy + 2, rx, ry) +
            '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="{{%s.head}}"></ellipse>' % (cx, cy, rx, ry, pid) +
            '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"></ellipse>' % (cx, cy, f(rx * .7), f(ry * .7)) +
            '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"></ellipse>' % (cx, cy, f(rx * .45), f(ry * .45)) +
            '<path d="M %s %s Q %s %s %s %s Z" fill="{{%s.head}}" stroke="rgba(0,0,0,0.3)" stroke-width="1.2"></path>' % (f(cx - .2 * rx), cy, cx, f(cy - 1.5 * ry), f(cx + .2 * rx), cy, pid) +
            '<path d="M %s %s Q %s %s %s %s" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-linecap="round"></path>' % (f(cx - .1 * rx), f(cy - .45 * ry), f(cx - .04 * rx), f(cy - .825 * ry), f(cx + .02 * rx), f(cy - .75 * ry)) +
            '<rect x="%s" y="%s" width="14" height="9" rx="2" fill="#1a1a1a"></rect>' % (cx - 7, f(cy - 1.375 * ry)) +
            '</g>')


def lug(x, T, B, o):
    s = line(x, T + o, x, T + o + 9, '#d8dbe0', 2.2) + line(x, B + o, x, B + o - 9, '#d8dbe0', 2.2)
    s += '<rect x="%s" y="%s" width="13" height="3" rx="1" fill="#c9ccd1" stroke="#5f636a" stroke-width="0.6"></rect>' % (f(x - 6.5), f(T + o + 6))
    a = T + o + 9
    s += '<path d="M %s %s Q %s %s %s %s Q %s %s %s %s Q %s %s %s %s Z" fill="url(#lugchrome)" stroke="#5f636a" stroke-width="0.8"></path>' % (
        f(x - 5), f(a), f(x - 7.5), f(a + 10.5), f(x - 3), f(a + 21), f(x), f(a + 24), f(x + 3), f(a + 21), f(x + 7.5), f(a + 10.5), f(x + 5), f(a))
    s += '<path d="M %s %s Q %s %s %s %s" fill="none" stroke="#ffffff" stroke-width="1.3" opacity="0.85"></path>' % (f(x - 2), f(a + 2), f(x - 3.5), f(a + 10.5), f(x - 1.5), f(a + 19))
    b = B + o - 9
    s += '<rect x="%s" y="%s" width="13" height="3" rx="1" fill="#c9ccd1" stroke="#5f636a" stroke-width="0.6"></rect>' % (f(x - 6.5), f(b))
    s += '<path d="M %s %s Q %s %s %s %s Q %s %s %s %s Q %s %s %s %s Z" fill="url(#lugchrome)" stroke="#5f636a" stroke-width="0.8"></path>' % (
        f(x - 5), f(b), f(x - 7.5), f(b - 10.5), f(x - 3), f(b - 21), f(x), f(b - 24), f(x + 3), f(b - 21), f(x + 7.5), f(b - 10.5), f(x + 5), f(b))
    s += '<path d="M %s %s Q %s %s %s %s" fill="none" stroke="#ffffff" stroke-width="1.3" opacity="0.85"></path>' % (f(x - 2), f(b - 2), f(x - 3.5), f(b - 10.5), f(x - 1.5), f(b - 19))
    return s


def shell(pid, cx, T, rx, h, lugs):
    ry = rx * 17 / 62 if rx < 75 else rx * 24 / 90
    B = T + h
    s = '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="url(#fin)"></ellipse>' % (cx, B, rx, f(ry))
    s += '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="url(#glit)"></ellipse>' % (cx, B, rx, f(ry))
    s += '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="none" stroke="#e6e8eb" stroke-width="5"></ellipse>' % (cx, B, rx, f(ry))
    s += '<rect x="%s" y="%s" width="%s" height="%s" fill="url(#fin)"></rect>' % (cx - rx, T, 2 * rx, h)
    s += '<rect x="%s" y="%s" width="%s" height="%s" fill="url(#glit)"></rect>' % (cx - rx, T, 2 * rx, h)
    for k in lugs:
        s += lug(cx + k * rx, T, B, ry * .6)
    s += '<g filter="{{%s.filter}}"><ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="{{%s.head}}"></ellipse></g>' % (pid, cx, T, rx, f(ry), pid)
    s += '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="none" stroke="#f0f2f4" stroke-width="5"></ellipse>' % (cx, T, rx, f(ry))
    s += '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="none" stroke="#8a8f97" stroke-width="1.2"></ellipse>' % (cx, T + 2, rx, f(ry))
    return s


RACK_LUGS = [-.726, -.242, .242, .726]
FLOOR_LUGS = [-.8, -.36, .11, .58, .87]


def rack(pid, cx, T, rx, h, side=1):
    B = T + h
    return line(cx + 12 * side, B + 2, cx + 40 * side, B + 52, '#c9ccd1', 7) + shell(pid, cx, T, rx, h, RACK_LUGS)


def floor(pid, cx, T, rx, h):
    return (line(cx - 68 * rx / 90, T + 114, cx - 85 * rx / 90, 540, '#d8dbe0') +
            line(cx + 68 * rx / 90, T + 114, cx + 85 * rx / 90, 540, '#d8dbe0') +
            shell(pid, cx, T, rx, h, FLOOR_LUGS))


def kick(cx, cy, r, label):
    s = r / 152
    out = '<g filter="{{kick.filter}}"><circle cx="%s" cy="%s" r="%s" fill="#0b0b0b"></circle>' % (cx, cy, f(r))
    out += '<circle cx="%s" cy="%s" r="%s" fill="none" stroke="#f3eef0" stroke-width="3"></circle>' % (cx, cy, f(r - 3))
    out += '<circle cx="%s" cy="%s" r="%s" fill="#111111"></circle>' % (cx, cy, f(r - 5))
    out += '<circle cx="%s" cy="%s" r="%s" fill="{{kick.head}}"></circle></g>' % (cx, cy, f(r - 14))
    import math
    for k in range(10):
        a = math.radians(18 + 36 * k)
        x, y = cx + (r - 6) * math.cos(a), cy + (r - 6) * math.sin(a)
        out += '<rect x="%s" y="%s" width="10" height="18" rx="3" fill="url(#lugchrome)" stroke="#5f636a" stroke-width="0.8" transform="rotate(%s %s %s)"></rect>' % (
            f(x - 5), f(y - 9), 108 + 36 * k, f(x), f(y))
    if label:
        out += '<text x="%s" y="%s" text-anchor="middle" font-family="Bebas Neue, sans-serif" font-size="%s" fill="{{kick.ink}}" letter-spacing="3">%s</text>' % (cx, cy, f(46 * s), label)
    out += line(cx - 135 * s, cy + 95 * s, cx - 170 * s, 540, '#d8dbe0', 4) + line(cx + 135 * s, cy + 95 * s, cx + 170 * s, 540, '#d8dbe0', 4)
    return out


SNARE = open(ROOT / '_kit_src' / 'snare.svgpart').read()
HIHAT = open(ROOT / '_kit_src' / 'hihat.svgpart').read()

CONFIGS = {
    'four': dict(finish='pearl', label='', kick=(640, 385, 152),
                 racks=[('tom', 560, 112, 62, 86, 1)], floors=[('floor', 880, 326, 90, 140)]),
}

NAMES = {'crashL': 'Crash cymbal, left', 'crashR': 'Crash cymbal, right', 'ride': 'Ride cymbal', 'hihat': 'Hi-hats',
         'kick': 'Bass drum', 'tom': 'Rack tom', 'tom2': 'Second rack tom', 'floor': 'Floor tom', 'floor2': 'Second floor tom',
         'snare': 'Snare drum'}


def pad(pid, x, y, w, h, round_=False):
    p = lambda v, tot: f(100 * v / tot)
    return ('<button type="button" class="pad%s" aria-label="%s" onClick="{{%s.hit}}" style="left:%s%%;top:%s%%;width:%s%%;height:%s%%"></button>'
            % (' round' if round_ else '', NAMES[pid], pid, p(x, W), p(y, H), p(w, W), p(h, H)))


def config(key):
    c = CONFIGS[key]
    kx, ky, kr = c['kick']
    svg = '<svg viewBox="0 0 %d %d" aria-hidden="true">' % (W, H) + defs(c['finish'])
    svg += '<ellipse cx="640" cy="538" rx="580" ry="20" fill="#171717"></ellipse>'
    svg += stand(200, 120, 48) + stand(960, 235, 48)
    svg += cymbal('crashL', 200, 120, 112, 17, 6) + cymbal('ride', 960, 235, 132, 19, -5)
    svg += kick(kx, ky, kr, c['label'])
    for pid, cx, T, rx, h, side in c['racks']:
        svg += rack(pid, cx, T, rx, h, side)
    for pid, cx, T, rx, h in c['floors']:
        svg += floor(pid, cx, T, rx, h)
    svg += SNARE + HIHAT + '</svg>'
    pads = pad('kick', kx - kr + 4, ky - kr + 4, 2 * kr - 8, 2 * kr - 8, True)
    pads += pad('crashL', 80, 70, 240, 100) + pad('ride', 820, 185, 280, 75)
    pads += pad('hihat', 240, 160, 180, 100)
    for pid, cx, T, rx, h, side in c['racks']:
        pads += pad(pid, cx - rx - 2, T - 20, 2 * rx + 4, h + 42)
    for pid, cx, T, rx, h in c['floors']:
        pads += pad(pid, cx - rx - 2, T - 26, 2 * rx + 4, h + 54)
    pads += pad('snare', 392, 250, 156, 116)
    return '<sc-if value="{{kitIs.%s}}"><div class="kitstage">%s%s</div></sc-if>' % (key, svg, pads)


def main():
    page = ROOT / 'level7.html'
    html = page.read_text()
    block = '<!--KIT:BEGIN-->\n' + '\n'.join(config(k) for k in CONFIGS) + '\n<!--KIT:END-->'
    html, n = re.subn(r'<!--KIT:BEGIN-->.*?<!--KIT:END-->', lambda m: block, html, flags=re.S)
    assert n == 1, 'KIT markers not found in level7.html'
    page.write_text(html)
    print('kit written:', ', '.join(CONFIGS), '(%d bytes)' % len(block))


if __name__ == '__main__':
    main()
