"""Builds the Level 7 interactive kit from the front-view photo of the white marine pearl kit.

Run from the repo root:  python3 _kit_src/build_kit.py
Everything between <!--KIT:BEGIN--> and <!--KIT:END--> in level7.html is replaced.
Hit areas are measured on the 766 x 501 photo (images/kit-front.jpg) and placed in
percentages, so they line up at any screen width. Each area glows gold when its
drum or cymbal plays.
"""
import re, pathlib

W, H = 766, 501
ROOT = pathlib.Path(__file__).resolve().parent.parent

# id: (label, x, y, w, h, round)
PIECES = {
    'crashL': ('Crash cymbal', 178, 38, 170, 72, True),
    'ride': ('Ride cymbal', 478, 40, 176, 90, True),
    'hihat': ('Hi-hats', 55, 108, 140, 44, True),
    'tom': ('Rack tom', 330, 115, 112, 98, False),
    'snare': ('Snare drum', 185, 185, 150, 88, False),
    'kick': ('Bass drum', 314, 218, 216, 214, True),
    'floor': ('Floor tom', 535, 213, 153, 172, False),
}


def pct(v, tot):
    return ('%.2f' % (100 * v / tot)).rstrip('0').rstrip('.')


def main():
    pads = ''
    for pid, (label, x, y, w, h, rnd) in PIECES.items():
        pads += ('<button type="button" class="pad%s {{%s.cls}}" aria-label="%s" onClick="{{%s.hit}}" '
                 'style="left:%s%%;top:%s%%;width:%s%%;height:%s%%"></button>'
                 % (' round' if rnd else '', pid, label, pid, pct(x, W), pct(y, H), pct(w, W), pct(h, H)))
    block = ('<!--KIT:BEGIN-->\n<div class="kitstage"><picture>'
             '<source type="image/webp" srcset="images/kit-front.webp">'
             '<img src="images/kit-front.jpg" width="766" height="501" alt="Vintage white marine pearl four-piece drum kit in a music classroom" decoding="async">'
             '</picture>' + pads + '</div>\n<!--KIT:END-->')
    page = ROOT / 'level7.html'
    html = page.read_text()
    html, n = re.subn(r'<!--KIT:BEGIN-->.*?<!--KIT:END-->', lambda m: block, html, flags=re.S)
    assert n == 1, 'KIT markers not found in level7.html'
    page.write_text(html)
    print('kit written (%d bytes)' % len(block))


if __name__ == '__main__':
    main()
