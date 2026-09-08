# -*- coding: utf-8 -*-
import json,re,html
from copy_sv2 import COPY

d=json.load(open('round2_import.json'))

def esc(s): return html.escape(s,quote=False)

def vendor_of(r):
    b=(r['brand'] or '').strip()
    return b or 'DJI'

def ptype(t):
    t=t.lower()
    if 'guldpaket' in t or 'paket' in t and ('zenmuse' in t or 'orion' in t or 'renskötsel' in t): return 'Drönarpaket'
    if 'agras t30' == t.strip().replace('dji ','') or t.strip()=='dji agras t30': return 'Drönare'
    if 'romo a' in t: return 'Robotdammsugare'
    if 'propell' in t: return 'Propellrar'
    if 'batteri' in t or 'laddar' in t or 'laddstation' in t or 'laddpaket' in t or 'charge cable' in t: return 'Batteri & laddning'
    if 'drop kit' in t or 'gimbal bracket' in t: return 'Lastsläpp'
    if 'lamp' in t or 'spotlight' in t or 'loudspeaker' in t: return 'Drönarpayload'
    if 'airai' in t or 'manifold' in t: return 'Beräkningsmodul'
    if 'neos' in t: return 'Värmekamera'
    if 'filter' in t: return 'Filter'
    if 'monitorpaket' in t or 'monitor mount' in t or 'tablet holder' in t: return 'Skärm & fäste'
    if 'range extender' in t or 'transmission system' in t: return 'Signalförstärkning'
    if 'balansring' in t: return 'Gimbaltillbehör'
    if 'mätpaket' in t or 'skogspaket' in t or 'guldpaket' in t or 'silverpaket' in t or 'fältpaket' in t or 'heldagspaket' in t or 'combo' in t or 'inspektion' in t or 'renskötsel' in t or 'solcells' in t: return 'Drönarpaket'
    if 'spridningssystem' in t or 'spreading system' in t or 'spray' in t: return 'Jordbrukstillbehör'
    if 'romo' in t: return 'Tillbehör robotdammsugare'
    return 'Drönartillbehör'

def tags(r):
    t=r['title'].lower(); out={'swedron-gap-import','draft-granskas'}
    for k,v in [('matrice 400','Matrice 400'),('matrice 350','Matrice 350'),('matrice 300','Matrice 300'),
                ('matrice 30t','Matrice 30T'),('matrice 4d','Matrice 4D'),('matrice 4','Matrice 4-serien'),
                ('agras','Agras'),('inspire 2','Inspire 2'),('inspire 3','Inspire 3'),('romo','ROMO'),
                ('zenmuse','Zenmuse'),('orion','Wisson Orion'),('airai','AirAI'),('phantom','Phantom'),
                ('lito','Lito'),('power sdc','DJI Power'),('drop kit','Lastsläpp'),('guldpaket','Paket'),
                ('mavic 3','Mavic 3'),('global forester','Global Forester'),('emlid','Emlid'),
                ('renskötsel','Renskötsel'),('skogspaket','Skogsbruk'),('mätpaket','Mätning'),
                ('rc plus','RC Plus'),('neos','Hikmicro NEOS'),('neo 2','Neo 2'),('mini 5','Mini 5 Pro')]:
        if k in t: out.add(v)
    out.add(vendor_of(r))
    return sorted(out)

def build_html(i,r):
    p=[]
    p.append('<p>'+esc(COPY[i])+'</p>')
    facts=[f for f in r['facts'] if len(f)>3][:8]
    if facts:
        p.append('<h3>Nyckelegenskaper</h3><ul>'+''.join('<li>'+esc(f)+'</li>' for f in facts)+'</ul>')
    if r['specs']:
        p.append('<h3>Tekniska specifikationer</h3><ul>'+''.join('<li>'+esc(s)+'</li>' for s in r['specs'][:25])+'</ul>')
    p.append('<h3>Bra att veta</h3><ul>'
             '<li>Levereras från EU Drone Company med support på svenska.</li>'
             '<li>Kontakta oss för aktuell leveranstid och pris för din verksamhet.</li></ul>')
    return ''.join(p)

out=[]
for i,r in enumerate(d):
    out.append({
      'title': re.sub(r'^DJI DJI ','DJI ',r['title']).strip(),
      'vendor': vendor_of(r),
      'productType': ptype(r['title']),
      'tags': tags(r),
      'descriptionHtml': build_html(i,r),
      'images': [{'url':u,'altText':r['title'][:120]} for u in r['images'][:6]],
      'source': r['url'],
    })
json.dump(out,open('round2_payloads.json','w'),ensure_ascii=False,indent=1)
print("payloads:",len(out))
import collections
print("types:",dict(collections.Counter(p['productType'] for p in out)))
print("vendors:",dict(collections.Counter(p['vendor'] for p in out)))
print("\nSAMPLE:");print(json.dumps(out[46],ensure_ascii=False)[:1400])
