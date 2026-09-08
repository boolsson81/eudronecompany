import json,re,sys,unicodedata
from collections import defaultdict

SYN={
 'batteri':'battery','batterier':'battery','batteriet':'battery','batteries':'battery',
 'propellrar':'prop','propeller':'prop','propellers':'prop','props':'prop','propellrarna':'prop',
 'laddare':'charger','laddaren':'charger','laddning':'charging','laddhubb':'charginghub',
 'charginghub':'charginghub','hubb':'hub','laddstation':'chargingstation',
 'vaska':'case','vaskan':'case','bag':'case','hardcase':'case','fodral':'case','transportvaska':'case',
 'skydd':'protector','skyddet':'protector','guard':'protector','protection':'protector','cover':'protector',
 'fjarrkontroll':'remotecontroller','remote':'remotecontroller','controller':'remotecontroller','rc':'remotecontroller',
 'kabel':'cable','kablar':'cable','sladd':'cable',
 'filterset':'filter','filters':'filter','filterkit':'filter',
 'paket':'combo','combo':'combo','kit':'combo','set':'combo','bundle':'combo','pack':'combo',
 'station':'station','batteristation':'batterystation','batterystation':'batterystation',
 'lins':'lens','linser':'lens','objektiv':'lens',
 'skruv':'screw','faste':'mount','fastet':'mount','montering':'mount','holder':'mount','hallare':'mount',
 'adapter':'adapter','adaptern':'adapter','modul':'module','module':'module',
 'ar':'year','year':'year','yr':'year',
 'flight':'', 'intelligent':'', 'original':'', 'dji':'dji','for':'','till':'','till':'','med':'','utan':'without',
 'och':'','the':'','and':'','of':'','en':'','ett':'',
 'gimbalfaste':'gimbalmount','gimbal':'gimbal',
 'spridningssystem':'spreadingsystem','spreading':'spreading','system':'system',
 'sprutsystem':'sprayingsystem','spraying':'spraying','spray':'spray',
 'landningsstall':'landinggear','arm':'arm',
}
STOP=set(['','for','till','med','och','the','and','of','a','i','pa','pcs','st','nya','ny','till'])

def base(s):
    s=s.lower()
    s=unicodedata.normalize('NFKD',s)
    s=''.join(c for c in s if not unicodedata.combining(c))
    s=s.replace('ö','o').replace('ä','a').replace('å','a')
    s=re.sub(r'[^a-z0-9]+',' ',s)
    return s

RAND=re.compile(r'^(?=.*[0-9])(?=.*[a-z])[a-z0-9]{3}$')
def toks(s, slug=False):
    parts=[p for p in base(s).split() if p]
    if slug and parts and RAND.match(parts[-1]) and len(parts)>2:
        parts=parts[:-1]          # drop Swedron's random truncation suffix
    out=set()
    for p in parts:
        p=SYN.get(p,p)
        if p and p not in STOP: out.add(p)
    return out

def prefixmatch(a,B):
    """token a matches set B exactly or as a prefix (>=4 chars) - handles truncated slugs"""
    if a in B: return True
    if len(a)>=4:
        for b in B:
            if b.startswith(a) or a.startswith(b):
                if min(len(a),len(b))>=4: return True
    return False

ours=[]
for line in open('our_products.jsonl'):
    p=json.loads(line)
    t=toks((p.get('title') or '')+' '+(p.get('handle') or '')+' '+(p.get('vendor') or ''))
    ours.append((t,p))
idx=defaultdict(list)
for i,(t,p) in enumerate(ours):
    for tok in t: idx[tok].append(i)
    for tok in t:
        if len(tok)>4: idx[tok[:4]].append(i)

def best(q):
    cand=set()
    for tok in q:
        for key in (tok, tok[:4] if len(tok)>4 else tok):
            lst=idx.get(key)
            if lst and len(lst)<4000: cand.update(lst)
    bs,bi=0.0,None
    for i in cand:
        t=ours[i][0]
        hit=sum(1 for a in q if prefixmatch(a,t))
        cont=hit/max(1,len(q))
        jac=hit/max(1,len(q|t))
        s=max(cont*0.97, jac)
        if s>bs: bs,bi=s,i
    return bs,bi

src,out=sys.argv[1],sys.argv[2]
rows=[]
for line in open(src):
    pid,slug=line.rstrip('\n').split('\t')
    q=toks(slug,slug=True)
    s,i=best(q)
    m=ours[i][1] if i is not None else {}
    rows.append({'id':pid,'slug':slug,'score':round(s,3),'match_title':m.get('title'),
                 'match_handle':m.get('handle'),'match_status':m.get('status'),'match_vendor':m.get('vendor')})
json.dump(rows,open(out,'w'),ensure_ascii=False,indent=0)
print('total',len(rows))
for th in (0.95,0.85,0.75,0.65,0.55):
    print(f'score<{th}:',sum(1 for r in rows if r['score']<th))
