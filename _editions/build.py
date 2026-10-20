"""Build a city edition of The Guitar Doug Report from the live Seattle page.

GDR_SRC=<seattlesinner clone> python3 build.py boston|nyc OUTDIR
Reads $GDR_SRC/index.html and <this folder>/<city>/*.json
Writes OUTDIR/<slug>/index.html plus its data/ folder.
"""
import json, re, sys, os, shutil, hashlib

SRC = os.environ.get('GDR_SRC', '/home/claude/seattlesinner')
ED = os.path.dirname(os.path.abspath(__file__))

CITIES = {
 'boston': dict(
   slug='boston', name='Boston', short='Boston', poss="Boston's", upper='BOSTON', pd='BPD', pdlong='Boston Police',
   state='MA', lat='42.3601', lon='-71.0589', tz='America/New_York',
   wire_area='from the North Shore to the South Shore',
   hoods=['Allston','Back Bay','Beacon Hill','Brighton','Charlestown','Chinatown','Dorchester','Downtown','East Boston','Fenway','Hyde Park','Jamaica Plain','Mattapan','Mission Hill','North End','Roslindale','Roxbury','Seaport','South Boston','South End','West End','West Roxbury'],
   tip_hoods='Dorchester, Southie, JP…',
   districts=[('A1','Downtown / North End / Chinatown'),('A7','East Boston'),('A15','Charlestown'),('B2','Roxbury'),('B3','Mattapan'),('C6','South Boston'),('C11','Dorchester'),('D4','South End / Back Bay / Fenway'),('D14','Allston / Brighton'),('E5','West Roxbury / Roslindale'),('E13','Jamaica Plain'),('E18','Hyde Park')],
   scan=[['46343','Boston Fire','Boston Fire Department dispatch','#ff2a14'],['36636','Boston EMS','Boston EMS dispatch','#ff6a00'],['43752','MBTA Transit Police','Transit police across the T','#1e90ff']],
   live=True,
   brand='The Boston Rambler', mast='img/rambler-masthead.png', cover='img/cover-rambler-fall2026.jpg',
 ),
 'nyc': dict(
   slug='nyc', name='New York', short='NYC', poss="New York's", upper='NYC', pd='NYPD', pdlong='New York police',
   state='NY', lat='40.7128', lon='-74.0060', tz='America/New_York',
   wire_area='across all five boroughs',
   hoods=['Harlem','Washington Heights','Upper West Side','Upper East Side','Midtown','Hell\'s Kitchen','Chelsea','Lower East Side','East Village','SoHo','Financial District','Williamsburg','Bushwick','Bed-Stuy','Crown Heights','Flatbush','East New York','Brownsville','Coney Island','Astoria','Long Island City','Jackson Heights','Flushing','Jamaica','South Bronx','Fordham','Mott Haven','Staten Island'],
   tip_hoods='Bushwick, Harlem, the LES…',
   districts=[('MANHATTAN','Manhattan'),('BROOKLYN','Brooklyn'),('QUEENS','Queens'),('BRONX','Bronx'),('STATEN ISLAND','Staten Island')],
   scan=[['47753','NYPD Citywide','NYPD citywide dispatch','#1e90ff'],['1189','NYPD Transit','Bronx and Manhattan transit police','#6fc3ff'],['47800','FDNY','Fire dispatch, all boroughs','#ff2a14']],
   live=False,
   brand='New York City Scream', mast='img/scream-masthead.png', cover='img/cover-scream-fall2026.jpg',
 ),
}

def load(city, name, default=None):
    p = f'{ED}/{city}/{name}.json'
    if not os.path.exists(p):
        return default
    return json.load(open(p))

def grab(h, marker):
    i = h.find(marker)
    assert i >= 0, marker
    j = i + len(marker)
    obj, end = json.JSONDecoder().raw_decode(h, j)
    return obj, j, end

def put(h, marker, obj):
    _, j, end = grab(h, marker)
    return h[:j] + json.dumps(obj, ensure_ascii=False) + h[end:]

def main(city, out):
    C = CITIES[city]
    h = open(f'{SRC}/index.html').read()
    N, U, S = C['name'], C['upper'], C['short']

    # ---------- data ----------
    seattle_st, _, _ = grab(h, 'const STORIES=')
    m = re.search(r"const FEATURES=new Set\((\[[^\]]*\])\)", h)
    feats = set(json.loads(m.group(1).replace("'", '"')))
    iss = re.search(r'const ISSUES=\[\{.*?lines:\[(.*?)\]\}', h, re.S)
    if iss:
        feats |= set(re.findall(r'\["([a-z0-9-]+)"', iss.group(1)))
    national = [json.loads(json.dumps(x)) for x in seattle_st if x['slug'] in feats]
    for x in national:
        if x['slug'] == 'homeless-by-choice':
            x['dek'] = "You're a 23-year-old Seattle resident with no car, no loans and a job you hate. The city will feed you, wash you, insure you and, if you get in, house you for free. We ran the numbers on quitting. Here's the bill."
            x['body'] = [p.replace('Picture a 23-year-old who never went to college', 'Picture a 23-year-old Seattle resident who never went to college', 1) for p in x['body']]
    local = load(city, 'stories', [])
    for x in local:
        x['date'] = x.get('date') or '2026-10-19'
    local.sort(key=lambda x: x['date'], reverse=True)
    stories = local + national
    wire = load(city, 'wire', [])
    wire.sort(key=lambda x: x.get('date', ''), reverse=True)
    crime = load(city, 'crime', {'asof': '', 'items': []})
    for x in crime['items']:
        sp = x.get('spd') or []
        if city == 'boston':
            x['spd'] = [s.replace('-', '').replace(' ', '').upper() for s in sp]
        else:
            x['spd'] = []
    cal = load(city, 'cal', [])
    cal = [e for e in cal if e.get('date') and e.get('artists')]
    cal.sort(key=lambda e: (e['date'], e.get('time', '')))
    scene = load(city, 'scene', [])
    venues = load(city, 'venues', [])
    vst = load(city, 'vst', {})
    vnews = load(city, 'vnews', [])
    vup = load(city, 'vup', [])
    bands = load(city, 'bands', [])
    bst = load(city, 'bst', {})
    bnews = load(city, 'bnews', [])
    bev = load(city, 'bev', [])
    sports = load(city, 'sports', {'asof': '', 'events': []})

    # our own short stories for wire/crime items; items we have not rewritten wait in the queue
    briefs, dropped = [], []
    import glob
    for fp in sorted(glob.glob(f'{ED}/{city}/briefs_*.json')):
        d0 = json.load(open(fp)); briefs += d0.get('stories', []); dropped += d0.get('dropped', [])
    byurl, seen_slug = {}, {x['slug'] for x in stories}
    for b in briefs:
        if not b.get('slug') or not b.get('body') or b['slug'] in seen_slug:
            continue
        seen_slug.add(b['slug']); b.setdefault('minutes', 1)
        byurl.setdefault(b.get('item_url', ''), b)
    for x in stories:
        for so in x.get('sources', []):
            byurl.setdefault(so.get('url', ''), x)
    queue = []
    def link(L):
        out = []
        for x in L:
            st_ = byurl.get(x.get('url', ''))
            if st_:
                x = dict(x, src_url=x.get('url', ''), url='?story=' + st_['slug'], story=st_['slug'])
                out.append(x)
            else:
                queue.append(x)
        return out
    wire = link(wire); crime['items'] = link(crime['items'])
    used = {b['slug'] for b in byurl.values()}
    brief_list = [b for b in briefs if b['slug'] in used and b not in stories]
    brief_list.sort(key=lambda x: x.get('date', ''), reverse=True)
    stories = stories + [b for b in brief_list if b['slug'] not in {y['slug'] for y in stories}]
    json.dump({'queued': queue, 'dropped': dropped}, open(f'{ED}/{city}/queue.json', 'w'), ensure_ascii=False, indent=0)
    # Tech & AI desk items rewritten as our own stories
    tech_by = {}
    for fp in sorted(glob.glob(f'{ED}/tech/briefs_*.json')):
        for t in json.load(open(fp)).get('stories', []):
            if t.get('slug') and t.get('body') and t.get('item_url') and t['slug'] not in {y['slug'] for y in stories}:
                t.setdefault('minutes', 1); stories.append(t); tech_by[t['item_url']] = t['slug']
    TECHOBJ, _, _ = grab(h, 'const TECH=/*TECH_START*/')
    def tlink(o):
        if isinstance(o, dict):
            for k in ('u', 'url', 'link'):
                if isinstance(o.get(k), str) and o[k] in tech_by:
                    o['src_' + k] = o[k]; o[k] = '?story=' + tech_by[o[k]]
            for v in o.values(): tlink(v)
        elif isinstance(o, list):
            for v in o: tlink(v)
    tlink(TECHOBJ)
    h = put(h, 'const TECH=/*TECH_START*/', TECHOBJ)

    # voice rewrites (one writer, one tone) and hand-written features
    vo = {}
    for fp in sorted(glob.glob(f'{ED}/voices/out_*.json')):
        vo.update(json.load(open(fp)))
    for x in stories + [y for y in locals().get('brief_list', [])]:
        v = vo.get(x['slug'])
        if v and v.get('body'):
            x['title'], x['dek'], x['body'] = v.get('title') or x['title'], v.get('dek') or x['dek'], v['body']
    feats_ = []
    for fp in sorted(glob.glob(f'{ED}/features/*.json')):
        for ft in json.load(open(fp)):
            if ft['slug'] not in {y['slug'] for y in stories}:
                feats_.append(ft)
    stories = feats_ + stories
    TECHOBJ2, _, _ = grab(h, 'const TECH=/*TECH_START*/')
    for ft in reversed(feats_):
        if ft.get('feature_tech'):
            e = dict(ft['feature_tech']); e['u'] = '?story=' + ft['slug']; TECHOBJ2['news'].insert(0, e)
    h = put(h, 'const TECH=/*TECH_START*/', TECHOBJ2)

    # house bylines: one writer per column
    COLS = {
      'crime': ('Ray Kessler', 'Crime Watch'), 'courts': ('Miriam Sloane', 'The Courts'), 'cold': ('Agnes Ward', 'Cold File'),
      'politics': ('Tom Brannigan', 'City Hall'), 'surveillance': ('Nina Reyes', 'Overreach'), 'nightlife': ('Jules Marlow', 'After Dark'),
      'music': ('Cass Delaney', 'The Bill'), 'bands': ('Joey Vance', 'Local Noise'), 'venues': ('Harold Finch', 'The Rooms'),
      'culture': ('Tess Morrow', 'The Scene'), 'tech': ('Evan Cole', 'Machine Age'), 'markets': ('Gil Mercer', 'The Ticker'),
    }
    natl = {x['slug'] for x in national}
    def column(x):
        t = (x.get('title', '') + ' ' + x.get('dek', '')).lower(); tp = x.get('topic', '')
        if x.get('by'): return None
        if tp == 'streets' and re.search(r'years ago|anniversary|remembered', t): return 'cold'
        if tp == 'tech':
            return 'markets' if re.search(r'stock|shares|futures|nasdaq|s&p|analyst|upgrade|downgrade|earnings|investor|valuation|%|premarket|capex|financing|debt', t) else 'tech'
        if tp == 'surveillance': return 'surveillance'
        if tp == 'politics': return 'politics'
        if tp == 'nightlife': return 'nightlife'
        if tp == 'music': return 'music'
        if tp == 'culture': return 'venues' if re.search(r'\b(bar|club|venue|tavern|restaurant|hotel|lounge|theater|theatre)\b', t) else 'culture'
        if re.search(r'trial|jury|verdict|sentenc|plead|plea|arraign|indict|judge|court|convicted|acquitted|guilty', t): return 'courts'
        return 'crime'
    for x in stories:
        if x['slug'] in natl: continue
        k = column(x)
        if k: x['col'], x['by'] = COLS[k][1], COLS[k][0]

    # rule: no drag / gay content
    bad = re.compile(r'\bdrag\b|\bqueer\b|\bgay\b|lgbt|\bpride\b|drag (show|brunch|queen)', re.I)
    def ok(x):
        return not bad.search(json.dumps(x, ensure_ascii=False))
    wire = [x for x in wire if ok(x)]; cal = [x for x in cal if ok(x)]; scene = [x for x in scene if ok(x)]
    vnews = [x for x in vnews if ok(x)]; vup = [x for x in vup if ok(x)]; crime['items'] = [x for x in crime['items'] if ok(x)]

    for marker, obj in [('const STORIES=', stories), ('const CAL=', cal), ('const SCENE=', scene), ('const VENUES=', venues),
                        ('const VST=/*VST_START*/', vst), ('const BANDS=', bands), ('const BST=/*BST_START*/', bst),
                        ('const BNEWS=/*BNEWS_START*/', bnews), ('const BEV=/*BEV_START*/', bev), ('const VNEWS=/*VNEWS_START*/', vnews),
                        ('const VUP=/*VUP_START*/', vup), ('const BARS=/*WIRE_START*/', wire)]:
        h = put(h, marker, obj)

    # protect the data lines from text replacement
    keep = {}
    def stash(mo):
        k = f'@@KEEP{len(keep)}@@'; keep[k] = mo.group(0); return k
    h = re.sub(r'^const (?:STORIES|CAL|SCENE|VENUES|VST|BANDS|BST|BNEWS|BEV|VNEWS|VUP|TECH|BARS)=.*$', stash, h, flags=re.M)
    # Newspace's own tagline stays
    h = h.replace('The network for Seattle and beyond', '@@NSTAG@@')

    # ---------- code / labels ----------
    R = [
     ('https://seattlesinner.com/report/masthead.png', 'https://seattlesinner.com/report/masthead.png'),
     ('https://seattlesinner.com/', f'https://douggarceau.com/{C["slug"]}/'),
     ('seattlesinner.com%2F', f'douggarceau.com%2F{C["slug"]}%2F'),
     ("'/data/", "'data/"), ('"/data/', '"data/'),
     ("'/snd/", "'https://seattlesinner.com/snd/"),
     ('href="/tech/"', 'href="https://seattlesinner.com/tech/"'), ('href:"/tech/"', 'href:"https://seattlesinner.com/tech/"'), ("href='/tech/'", "href='https://seattlesinner.com/tech/'"),
     ('"/manifest.webmanifest"', '"manifest.webmanifest"'), ("'/sw.js'", "'sw.js'"),
     ('"/app/', '"https://seattlesinner.com/app/'), ("'/app/", "'https://seattlesinner.com/app/"),
     ('lat=47.6062&amp;lon=-122.3321', f'lat={C["lat"]}&amp;lon={C["lon"]}'),
     ('latitude=47.6062&longitude=-122.3321', f'latitude={C["lat"]}&longitude={C["lon"]}'),
     ('America/Los_Angeles', C['tz']), ('America%2FLos_Angeles', C['tz'].replace('/', '%2F')),
     ('from Everett to Tacoma', C['wire_area']), ('Everett to Tacoma', C['wire_area']),
     ('Capitol Hill, Ballard, the Ave…', C['tip_hoods']),
     ('Thanks for keeping Seattle weird.', 'Thanks.'),
     ("', Seattle, WA'", f"', {N}, {C['state']}'"),
     ("Seattle\\'s 100", f"{C['poss'].replace(chr(39), chr(92)+chr(39))} 100"),
     ('Seattle Police Department', C['pdlong'] + ' Department'),
     ('Seattle Police', C['pdlong']), ('Seattle police', C['pdlong'].replace('Police', 'police')),
     ('Seattle PD', C['pd']), ('SPD', C['pd']),
     ('Seattle Fire', C['name'] + ' Fire'),
     ('WEST SEATTLE', U), ('SEATTLE', U),
     ("Seattle's", C['poss']),
    ]
    for a, b in R:
        h = h.replace(a, b)
    # menu labels use the short name; everything else the full name
    for lab in ['Stories', 'News', 'Crime Watch', 'Music', 'Scene', 'Venues', 'Bands', 'Crime', 'Top Story']:
        h = h.replace(f'Seattle {lab}', f'{S} {lab}')
    h = h.replace('Seattle', N)

    # city brand (Boston = The Boston Rambler, a Guitar Doug Report)
    if C.get('brand'):
        B = C['brand']
        h = h.replace('img/gdr-masthead-tight.webp', C['mast']).replace('img/cover-gdr-fall2026.jpg', C['cover'])
        h = h.replace(f'<div class="edition">{N} Edition</div>', '')
        h = h.replace('NEW SOFTWARE BY GUITAR DOUG', 'NEW SOFTWARE').replace('New software by Guitar Doug', 'New software')
        h = h.replace('A new social media platform by Guitar Doug', 'A new social media platform')
        h = h.replace('The%20Guitar%20Doug%20Report', B.replace(' ', '%20'))
        h = h.replace('content="Guitar Doug"', f'content="{B}"')
        h = h.replace('sole property of Guitar Doug', 'sole property of ' + B).replace('© 2026 Guitar Doug', '© 2026 ' + B)
        h = h.replace('THE GUITAR DOUG REPORT', B.upper()).replace('The Guitar Doug Report', B).replace('the Guitar Doug Report', B)
        h = h.replace('Guitar Doug Report', B).replace('Guitar Doug', B)
        h = h.replace('The The ', 'The ').replace('THE THE ', 'THE ').replace('the The ', 'The ')
        if not B.startswith('The '):
            h = h.replace('The ' + B, B).replace('THE ' + B.upper(), B.upper()).replace('the ' + B, B)
        h = h.replace('THE GUITAR DOUG REPORT', B.upper()).replace('The Guitar Doug Report', B).replace('the Guitar Doug Report', B)
        h = h.replace('alt="' + B + '" width="1000" height="240"', 'alt="' + B + '" width="' + ('942' if city == 'nyc' else '961') + '" height="' + ('217' if city == 'nyc' else '214') + '"')
    # every carried-over story counts as a feature, not local news
    h = re.sub(r"const FEATURES=new Set\(\[[^\]]*\]\)", 'const FEATURES=new Set(' + json.dumps(sorted(x['slug'] for x in national)) + ')', h, count=1)
    # bylines on the story page and story cards
    h = h.replace(f'<div class="byl"><span>By <b>{C.get("brand") or "The Guitar Doug Report"}</b></span>',
                  '<div class="byl"><span>By <b>${esc(s.by||"' + (C.get('brand') or 'The Guitar Doug Report') + '")}</b>${s.col?" · "+esc(s.col):""}</span>', 1)
    h = h.replace('<p>${esc(s.dek)}</p><span class="meta">${s.minutes} min read</span>', '<p>${esc(s.dek)}</p><span class="meta">${s.by?esc(s.by)+" · ":""}${s.minutes} min read</span>', 1)
    # neighborhood ticker
    span = ''.join(f'<span>{x}</span>' for x in C['hoods'])
    h = re.sub(r'<span class="nhm-r">(?:<span>[^<]*</span>)+</span>', f'<span class="nhm-r">{span}{span}</span>', h, count=1)

    # Crime Watch neighborhood lists
    codes = [d[0] for d in C['districts']]
    names = {d[0]: d[1] for d in C['districts']}
    h = re.sub(r'const CWH=\[[^\]]*\];', 'const CWH=' + json.dumps(codes) + ';', h, count=1)
    h = re.sub(r'const cwHL=h=>\(\{.*?\}\)\[h\]\|\|', 'const cwHL=h=>(' + json.dumps(names) + ')[h]||', h, count=1, flags=re.S)
    h = re.sub(r"const CWWS=\[[^\]]*\];", 'const CWWS=[];', h, count=1)
    h = re.sub(r"const cwHoods=\(\)=>\[\['WS','[^']*'\],\.\.\.CWH", 'const cwHoods=()=>[...CWH', h, count=1)

    # scanner channels
    h = re.sub(r"const SCAN=\[\[.*?\]\];", 'const SCAN=' + json.dumps(C['scan']) + ';', h, count=1, flags=re.S)

    # police data: Boston = city open data (daily); NYC = Report crime desk
    i = h.find('async function cwLoad(force)')
    j = h.find('if(n&&n.items)', i)
    assert i > 0 and j > 0
    boston_q = (
      "const bq=`SELECT \"INCIDENT_NUMBER\",\"OFFENSE_DESCRIPTION\",\"DISTRICT\",\"SHOOTING\",\"OCCURRED_ON_DATE\",\"STREET\" FROM \"b973d8cb-eeb2-4e7e-99da-c92938efc9c0\" WHERE \"OCCURRED_ON_DATE\" > '${ago(CW.hood?720:96).replace('T',' ')}'`"
      "+(CW.hood?` AND \"DISTRICT\"='${CW.hood.replace(/'/g,\"''\")}'`:'')"
      "+` AND \"OFFENSE_DESCRIPTION\" ~* '(ASSAULT|ROBBERY|BURGLARY|LARCENY|THEFT|SHOOT|FIREARM|WEAPON|MURDER|HOMICIDE|STAB|KIDNAP|THREAT|DRUG|AUTO THEFT|VANDAL|ARSON)' ORDER BY \"OCCURRED_ON_DATE\" DESC LIMIT 200`;"
    )
    newload = (
      "async function cwLoad(force){if(!force&&Date.now()-CW.t<240000)return;const ago=h=>new Date(Date.now()-h*36e5).toLocaleString('sv-SE',{timeZone:'" + C['tz'] + "'}).replace(' ','T');\n"
      "  const j=u=>fetch(u,{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);\n"
      + ("  " + boston_q + "\n  const bp=j('https://data.boston.gov/api/3/action/datastore_search_sql?sql='+encodeURIComponent(bq)).then(d=>d&&d.result&&Array.isArray(d.result.records)?d.result.records.map(r=>({report_number:r.INCIDENT_NUMBER,offense_date:String(r.OCCURRED_ON_DATE||'').replace(' ','T').replace(/\\+00(:?00)?$/,''),nibrs_offense_code_description:String(r.OFFENSE_DESCRIPTION||'').toLowerCase().replace(/\\b\\w/g,c=>c.toUpperCase()),offense_sub_category:'',shooting_type_group:(r.SHOOTING==='1'||r.SHOOTING===1||r.SHOOTING==='Y')?'shooting':'-',block_address:r.STREET||'',neighborhood:(CITYD[r.DISTRICT]||r.DISTRICT||''),precinct:r.DISTRICT||''})):null);\n" if C['live'] else "  const bp=Promise.resolve(null);\n")
      + "  let n=await j('data/crime.json?'+Math.floor(Date.now()/6e5));let s=await Promise.race([bp,new Promise(r=>setTimeout(()=>r(null),1500))]);let f=null;\n"
      "  if(s===null)bp.then(x=>{if(Array.isArray(x)&&x.length){const u=[],sn=new Set();for(const r of x){if(sn.has(r.report_number))continue;sn.add(r.report_number);u.push(r)}CW.spd=u.slice(0,60);cwFill()}});\n"
      "  if(n&&n.items){const it=n.items.filter(x=>cwMatch(x));if(!Array.isArray(s)||!s.length)s=it.map(x=>({report_number:x.url||x.headline,offense_date:(x.date||'')+'T12:00',nibrs_offense_code_description:x.headline,offense_sub_category:x.kind,shooting_type_group:x.kind==='shooting'?'shooting':'-',block_address:'',neighborhood:x.hood||'',precinct:'',_u:x.url,_k:x.kind}));\n"
      "   f=n.items.filter(x=>['fire','crash'].includes(x.kind)||/fire|blaze|crash|rescue|collision/i.test(x.headline||'')).slice(0,25).map(x=>({type:x.headline,address:x.hood||'',datetime:(x.date||'')+'T12:00',_u:x.url}))}\n  "
    )
    h = h[:i] + newload + h[j:]
    # rows built from the Report desk link to the story, not a map
    h = h.replace('function cwSpdRow(r){const k=CRK[cwSpdKind(r)];', 'function cwSpdRow(r){const k=CRK[r._k&&CRK[r._k]?r._k:cwSpdKind(r)];', 1)
    h = h.replace('href="${esc(cwMap(cwBlk(r.block_address)||((r.neighborhood||\'\')+\' neighborhood\')))}"', 'href="${esc(r._u||cwMap(cwBlk(r.block_address)||((r.neighborhood||\'\')+\' neighborhood\')))}"', 1)
    h = h.replace('href="${esc(cwMap(r.address||\'\'))}"', 'href="${esc(r._u||cwMap(r.address||\'\'))}"', 1)
    h = h.replace('const CW={news:[]', 'const CITYD=' + json.dumps(names) + ';\nconst CW={news:[]', 1)
    if not C['live']:
        h = h.replace(f'{C["pdlong"]} Department crime reports via data.seattle.gov, block-level, refreshed every 5 minutes. Reports post with a delay of several hours to a day.',
                      f'The latest {C["pd"]} arrests, shootings and robberies from the Report crime desk, refreshed through the day.')
    h = re.sub(r'(Department crime reports) via data\.seattle\.gov[^<]*', r'\1 via data.boston.gov, refreshed every 5 minutes. Reports post with a delay of up to a day.' if C['live'] else r'\1', h)
    h = re.sub(r'(<div id="cwFire"></div><div class="crnote">)[^<]*', r'\1Fires, crashes and rescues from the Report crime desk.', h)
    h = h.replace('last 12 hours</span></div><div id="cwFire">', 'latest</span></div><div id="cwFire">')

    # the Top Story banner: first local story
    h = h.replace("STORIES.find(x=>x.slug==='ballard-light-rail-2042-forum')||", '')
    # ---------- layout tweaks for the city editions ----------
    h = re.sub(r'<style id="edtweak">.*?</style>', '', h, flags=re.S)
    h = re.sub(r'<script>\(\(\)=>\{const go=\(\)=>\{const b=document\.querySelector\("\.clsbar\.(?:bot|top)".*?</script>', '', h, flags=re.S)
    # section menu sits at the very top, right under the top strip
    mn = re.search(r'\n  <nav class="navbar" id="nav".*?</nav>\n', h, re.S)
    if mn:
        h = h[:mn.start()] + '\n' + h[mn.end():]
        h = h.replace('<div class="wrap">\n  <header class="mast">', '<div class="wrap">\n' + mn.group(0).strip('\n') + '\n  <header class="mast">', 1)
    css = (
      '<style id="edtweak">'
      # top strip in brushed steel, like the cover lettering
      '.clsbar.top{background:linear-gradient(180deg,#f4f5f6 0%,#c9cdd2 38%,#9da3aa 62%,#d2d5d9 100%)!important;color:#15181b!important;border-bottom:1px solid #6d737a!important;text-shadow:0 1px 0 rgba(255,255,255,.55)!important}'
      '.clsbar.top *{color:#15181b!important}.clsbar.top .rec i{background:#c40d00!important;box-shadow:none!important}'
      # lower masthead, no orange glow
      '.mast .lgimg{margin:4px auto 6px!important;max-width:520px!important}'
      '.lgimg img{width:min(100%,520px)!important;filter:drop-shadow(0 2px 6px rgba(0,0,0,.7))!important;animation:none!important}'
      '.wrap>.navbar{margin:8px auto 6px}'
      '#vstrip{margin-left:14px;opacity:.9}'
      ''
      '</style>'
    )
    h = h.replace('</head>', css + '</head>', 1)
    js = (
      '<script>'
      # our own stories open in place
      'document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest(\'a[href^="?story="]\');if(!a)return;const q=a.getAttribute("href").slice(7);'
      'if(typeof STORIES==="undefined"||!STORIES.some(s=>s.slug===q))return;e.preventDefault();STATE.prev=STATE.view==="read"?(STATE.prev||"front"):(STATE.view||"front");STATE.story=q;STATE.view="read";render();scrollTo(0,0)},true);'
      'document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(\'a[href^="?story="][target]\').forEach(a=>a.removeAttribute("target"))});'
      'new MutationObserver(()=>{document.querySelectorAll(\'a[href^="?story="][target]\').forEach(a=>a.removeAttribute("target"))}).observe(document.documentElement,{childList:true,subtree:true});'
      # tiny share button in the top strip
      '(()=>{const go=()=>{const n=document.getElementById("nav");if(!n||document.getElementById("nbShare"))return;const mk=(id,t)=>{const x=document.createElement("button");x.type="button";x.className="nb";x.id=id;x.textContent=t;n.appendChild(x);return x};const s=mk("nbShare","Share");s.onclick=async()=>{const u=location.href.split("#")[0];try{if(navigator.share){await navigator.share({title:document.title,url:u})}else{await navigator.clipboard.writeText(u);s.textContent="Link copied";setTimeout(()=>s.textContent="Share",1500)}}catch(e){}};const r=mk("nbReg","Register");r.onclick=()=>{const b=document.getElementById("subBox");if(!b)return;b.classList.add("open");scrollTo({top:0,behavior:"smooth"});setTimeout(()=>{const i=document.getElementById("sbEmail");i&&i.focus()},300)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",go):go()})();'
      # visitor counter in the bottom strip
      '(()=>{const go=()=>{const b=document.querySelector(".clsbar.bot");if(!b)return;const s=document.createElement("span");s.id="vstrip";b.appendChild(s);'
      'fetch("https://api.counterapi.dev/v1/douggarceau-com/' + C['slug'] + '-visits/up").then(r=>r.ok?r.json():null).then(d=>{if(d&&d.count)s.textContent="VISITORS "+Number(d.count).toLocaleString("en-US")}).catch(()=>{})};'
      'document.readyState==="loading"?document.addEventListener("DOMContentLoaded",go):go()})();'
      '</script>'
    )
    h = h.replace('</body>', js + '</body>', 1)
    h = h.replace("<div class=\"lbl\"><b>AI gone rogue</b>", "${(()=>{const fs=STORIES.filter(s=>s.topic==='tech'&&s.by&&['AI','Chips & Power'].includes(s.col));return fs.length?`<div class=\"lbl\"><b>Features</b><span>${fs.length}</span></div><div class=\"stack\">${fs.map(storyCard).join('')}</div>`:''})()}<div class=\"lbl\"><b>AI gone rogue</b>", 1)
    h = h.replace('@@NSTAG@@', 'The network for Seattle and beyond')
    for k, v in keep.items():
        h = h.replace(k, v)
    h = h.replace('<title>', '<title>', 1)

    d = f'{out}/{C["slug"]}'
    os.makedirs(d + '/data', exist_ok=True)
    open(d + '/index.html', 'w').write(h)
    json.dump(crime, open(d + '/data/crime.json', 'w'), ensure_ascii=False)
    json.dump({'asof': '2026-10-19T17:00:00-04:00', 'sources_last_run': [], 'events': cal}, open(d + '/data/cal.json', 'w'), ensure_ascii=False)
    json.dump(sports, open(d + '/data/sports.json', 'w'), ensure_ascii=False)
    shutil.copy(f'{SRC}/data/pm-teaser.json', d + '/data/pm-teaser.json')
    shutil.copytree(f'{SRC}/img', d + '/img', dirs_exist_ok=True)
    if os.path.isdir(f'{ED}/{city}_assets'):
        shutil.copytree(f'{ED}/{city}_assets', d + '/img', dirs_exist_ok=True)
    man = json.load(open(f'{SRC}/manifest.webmanifest'))
    man.update(name=C.get('brand') or f'The Guitar Doug Report — {N}', short_name=(C.get('brand','').replace('The ','') or f'GDR {S}'), id=f'/{C["slug"]}/', start_url=f'/{C["slug"]}/?source=app', scope=f'/{C["slug"]}/')
    man['icons'] = [dict(i, src='https://seattlesinner.com' + i['src']) for i in man['icons']]
    json.dump(man, open(d + '/manifest.webmanifest', 'w'), indent=1)
    sw = open(f'{SRC}/sw.js').read().replace("const V='gdr-app-v1'", f"const V='gdr-{C['slug']}-v1'").replace("['/','/app/icon-192.png','/app/icon-512.png','/img/gdr-masthead-tight.webp']", f"['/{C['slug']}/','/{C['slug']}/img/gdr-masthead-tight.webp']").replace("caches.match('/')", f"caches.match('/{C['slug']}/')")
    open(d + '/sw.js', 'w').write(sw)
    left = [l for l in h.split('\n') if len(l) < 3000 and re.search(r'Seattle|Ballard|SPD\b|data\.seattle', l) and 'network for Seattle' not in l]
    print(city, 'stories', len(local), '+', len(national), 'wire', len(wire), 'crime', len(crime['items']), 'cal', len(cal), 'scene', len(scene),
          'venues', len(venues), 'vup', len(vup), 'vnews', len(vnews), 'bands', len(bands), 'bnews', len(bnews), 'bev', len(bev))
    print('seattle leftovers in code lines:', len(left))
    for l in left[:12]:
        mm = re.search(r'.{0,60}(Seattle|Ballard|SPD\b|data\.seattle).{0,40}', l)
        print('   ', mm.group(0) if mm else l[:100])

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
