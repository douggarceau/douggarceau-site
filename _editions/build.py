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
    national = [x for x in seattle_st if x['slug'] in feats]
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
     ('href="/tech/"', 'href="https://seattlesinner.com/tech/"'), ("href='/tech/'", "href='https://seattlesinner.com/tech/'"),
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
      + "  let [n,s]=await Promise.all([j('data/crime.json?'+Math.floor(Date.now()/6e5)),bp]);let f=null;\n"
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
    man = json.load(open(f'{SRC}/manifest.webmanifest'))
    man.update(name=f'The Guitar Doug Report — {N}', short_name=f'GDR {S}', id=f'/{C["slug"]}/', start_url=f'/{C["slug"]}/?source=app', scope=f'/{C["slug"]}/')
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
