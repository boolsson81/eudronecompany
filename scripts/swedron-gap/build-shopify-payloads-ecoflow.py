# -*- coding: utf-8 -*-
import json,html
from copy_ecoflow import COPY
def esc(s): return html.escape(s,quote=False)
d=json.load(open('ecoflow.json'))
def ptype(t):
    t=t.lower()
    if 'solpanel' in t or 'solar panel' in t: return 'Solpanel'
    if 'tilt mount' in t or 'bracket' in t or 'mounting feet' in t or 'strap kit' in t: return 'Solpanelsfäste'
    if 'kabel' in t or 'cable' in t or 'connect' in t: return 'Kablar & adaptrar'
    if 'powerbank' in t or 'rapid' in t: return 'Powerbank'
    if 'laddare' in t or 'charger' in t or 'charging' in t: return 'Laddare'
    if 'extrabatteri' in t or 'extra battery' in t: return 'Extrabatteri'
    if 'inverter' in t or 'power hub' in t or 'monitor' in t: return 'Kraftsystem'
    if 'trolley' in t: return 'Transport'
    return 'Kraftstation'
def tags(t):
    t2=t.lower(); out={'swedron-gap-import','draft-granskas','EcoFlow','Fältkraft'}
    for k,v in [('delta pro ultra','DELTA Pro Ultra'),('delta pro 3','Delta Pro 3'),
                ('delta 3','Delta 3'),('delta max','DELTA Max'),('river 3','River 3'),
                ('trail','TRAIL'),('rapid','RAPID'),('solpanel','Solpanel'),
                ('solar panel','Solpanel'),('power kits','Power Kits')]:
        if k in t2: out.add(v)
    return sorted(out)
out=[]
for i,r in enumerate(d):
    p=['<p>'+esc(COPY[i])+'</p>']
    f=[x for x in r['facts'] if len(x)>3][:6]
    if f: p.append('<h3>Nyckelegenskaper</h3><ul>'+''.join('<li>'+esc(x)+'</li>' for x in f)+'</ul>')
    if r['specs']: p.append('<h3>Tekniska specifikationer</h3><ul>'+''.join('<li>'+esc(s)+'</li>' for s in r['specs'][:20])+'</ul>')
    p.append('<h3>Bra att veta</h3><ul><li>Levereras från EU Drone Company med support på svenska.</li>'
             '<li>Kontakta oss för aktuell leveranstid och pris för din verksamhet.</li></ul>')
    t=r['title'].replace('EcoFlow EcoFlow ','EcoFlow ').strip()
    out.append({'title':t,'vendor':'EcoFlow','productType':ptype(t),'tags':tags(t),
                'descriptionHtml':''.join(p),
                'images':[{'url':u,'altText':t[:120]} for u in r['images'][:3]],'source':r['url']})
json.dump(out,open('ecoflow_payloads.json','w'),ensure_ascii=False,indent=1)
import collections
print("payloads:",len(out));print(dict(collections.Counter(x['productType'] for x in out)))
B=7
for bi in range(0,len(out),B):
    v={}
    for j,x in enumerate(out[bi:bi+B]):
        v[f"p{j}"]={"title":x['title'],"vendor":x['vendor'],"productType":x['productType'],
                    "tags":x['tags'],"descriptionHtml":x['descriptionHtml'],"status":"DRAFT"}
        v[f"m{j}"]=[{"originalSource":i['url'],"alt":i['altText'],"mediaContentType":"IMAGE"} for i in x['images']]
    json.dump({"variables":v},open(f'efb{bi//B}.json','w'),ensure_ascii=False)
print("batches:",(len(out)+B-1)//B)
