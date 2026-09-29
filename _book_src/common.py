"""Shared helpers for writing chapters."""

def C(n, part, title, blurb, *blocks):
    return dict(n=n, part=part, title=title, blurb=blurb, blocks=list(blocks))

def P(text): return ('p', text)
def H(text): return ('h', text)
def UL(*items): return ('ul', list(items))
def OL(*items): return ('ol', list(items))
def TIP(title, text): return ('tip', title, text)
def BOX(title, body, tag='NOTE'): return ('box', title, body, tag)
def TABLE(head, *rows): return ('table', list(head), [list(r) for r in rows])
def RAW(h): return ('raw', h)

def E(title, cap=None, **spec):
    """A playable example. Pattern lines may contain spaces for readability."""
    d = dict(title=title, **spec)
    if cap: d['cap'] = cap
    return ('ex', d)

def PRACTICE(*rows):
    """Practice plan table: rows of (time, what)."""
    return TABLE(('TIME', 'WHAT TO PLAY'), *rows)

KEY = RAW('''<div class="box"><h3><span>Drum key</span><span>READ</span></h3><div class="bb">
<svg viewBox="0 0 560 150" role="img" aria-label="Drum key: where each drum and cymbal sits on the staff" style="width:100%;height:auto;display:block">
<g stroke="#fff" stroke-width="1.5"><line x1="20" y1="40" x2="330" y2="40"/><line x1="20" y1="56" x2="330" y2="56"/><line x1="20" y1="72" x2="330" y2="72"/><line x1="20" y1="88" x2="330" y2="88"/><line x1="20" y1="104" x2="330" y2="104"/></g>
<g stroke="#fff" stroke-width="2.2" fill="none">
<line x1="30" y1="24" x2="54" y2="24" stroke-width="1.5"/><line x1="37" y1="19" x2="47" y2="29"/><line x1="37" y1="29" x2="47" y2="19"/>
<line x1="75" y1="27" x2="85" y2="37"/><line x1="75" y1="37" x2="85" y2="27"/>
<line x1="115" y1="35" x2="125" y2="45"/><line x1="115" y1="45" x2="125" y2="35"/>
<line x1="305" y1="107" x2="315" y2="117"/><line x1="305" y1="117" x2="315" y2="107"/></g>
<g fill="#fff"><ellipse cx="160" cy="48" rx="8" ry="6" transform="rotate(-20 160 48)"/><ellipse cx="200" cy="64" rx="8" ry="6" transform="rotate(-20 200 64)"/><ellipse cx="240" cy="80" rx="8" ry="6" transform="rotate(-20 240 80)"/><ellipse cx="280" cy="96" rx="8" ry="6" transform="rotate(-20 280 96)"/></g>
<g font-family="IBM Plex Mono, monospace" font-size="12.5" fill="#ffd35c">
<text x="345" y="20">x on ledger line = crash</text><text x="345" y="34">x above staff = hi-hat</text><text x="345" y="48">x on top line = ride</text>
<text x="345" y="62">top space = rack tom</text><text x="345" y="78">3rd space up = snare</text><text x="345" y="94">2nd space up = floor tom</text>
<text x="345" y="110">bottom space = bass drum</text><text x="345" y="126">x below staff = hi-hat foot</text></g>
</svg></div></div>''')
