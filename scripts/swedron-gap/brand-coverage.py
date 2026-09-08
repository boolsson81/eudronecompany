# -*- coding: utf-8 -*-
import json,re,unicodedata
from collections import defaultdict

def norm(s):
    s=s.lower()
    s=unicodedata.normalize('NFKD',s); s=''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+',' ',s)

# tvåordsvarumärken först, annars första token i slugen
MULTI=['peak design','think tank','smallrig','gomatic','polarpro','hollyland','ecoflow','nanlite',
 'vallerret','quartzline','seetec','hikmicro','insta360','sandisk','sunnylife','startrc','pgytech',
 'freewell','saramonic','feelworld','hoodman','jlidrone','wisson','lifthor','4hawks','manfrotto',
 'benro','joby','rode','zhiyun','godox','aputure','atomos','delkin','lexar','anker','kupo','chasing',
 'dji','velbon','nisi','rusan','polaroid','energizer','brinno','dreame','hprc','smallhd','tilta',
 'lowepro','wandrd','shimoda','fjallraven','osmo','mavic','matrice','zenmuse','ronin','inspire',
 'phantom','avata','neo','flip','lito','agras','amflow','emlid','pix4d']

def brand_of(slug):
    s=slug.replace('-',' ')
    for b in MULTI:
        if s.startswith(b+' ') or s==b: return b
    return s.split(' ')[0]

ours=[]
for line in open('our_products.jsonl'):
    p=json.loads(line)
    ours.append(norm((p.get('vendor') or '')+' '+(p.get('title') or '')+' '+(p.get('handle') or '')))
ourblob='\n'.join(ours)

sw=defaultdict(list)
for line in open('swedron_products.tsv'):
    pid,slug=line.rstrip('\n').split('\t')
    sw[brand_of(slug)].append((pid,slug))

rows=[]
for b,items in sw.items():
    # hur många produkter i vår katalog nämner varumärket?
    n=len(re.findall(r'(?m)^.*\b'+re.escape(b)+r'\b.*$', ourblob)) if len(b)>2 else 0
    rows.append((b,len(items),n))
rows.sort(key=lambda r:-r[1])
json.dump(rows,open('brand_coverage.json','w'),ensure_ascii=False,indent=1)

tot=sum(r[1] for r in rows)
print(f"Swedron: {tot} produkter fördelade på {len(rows)} varumärkes-/modellgrupper\n")
print(f"{'grupp':<18}{'Swedron':>8}{'våra':>8}  status")
noll=0
for b,ns,no in rows[:45]:
    st = 'saknas helt' if no==0 else ('tunt' if no < ns*0.2 else 'täckt')
    if no==0: noll+=ns
    print(f"{b:<18}{ns:>8}{no:>8}  {st}")
print(f"\nProdukter i grupper där vi har NOLL träffar: {sum(ns for b,ns,no in rows if no==0)}")
