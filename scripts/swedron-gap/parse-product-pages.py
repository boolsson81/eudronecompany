import json,re,glob,urllib.parse,os,sys

MDLINK=re.compile(r'\[([^\]]*)\]\([^)]*\)')
def clean(s):
    s=s.replace('\xa0',' ')
    s=MDLINK.sub(r'\1',s)
    s=re.sub(r'\*\*([^*]+)\*\*',r'\1',s)
    s=re.sub(r'^\s*[*\-]\s*','',s)
    return re.sub(r'[ \t]+',' ',s).strip()

def unwrap(u):
    m=re.search(r'_next/image\?url=([^&]+)',u)
    return urllib.parse.unquote(m.group(1)) if m else u

TABS='BeskrivningTeknisk specifikationTillbehörDokumentRecensioner'
DROP=re.compile(r'^(Beskrivning|Teknisk(a)? specifikation(er)?|Tillbeh.*|Dokument|Recensioner|Slut i lager|I lager|Lägg i varukorg|Köp nu|Köp|Finns i lager|EAN:?|Artikelnummer:?|ctrlk|Startsida|\+|\-|Läs mer.*|Visa mer|Fri frakt.*|Delbetala.*|Boka demo.*|Kontakta oss.*|\d[\d ]* kr.*)$',re.I)
SPECHDR=re.compile(r'^(Teknisk|Specifikation|Tekniska)',re.I)

def parse(fp):
    try: d=json.load(open(fp))
    except Exception: return None
    c=(d.get('content') or '').replace('\xa0',' ')
    url=(d.get('url') or '').rstrip('/')
    if '/produkt/' not in url: return None
    lines=c.split('\n')
    h1s=[i for i,l in enumerate(lines) if re.match(r'\s*#\s+\S',l)]
    if not h1s: return None
    top=h1s[0]
    title=clean(re.sub(r'^\s*#\s+','',lines[top]))
    mb=re.match(r'\s*#\s+\[([^\]]+)\]',lines[top])
    brand=(mb.group(1).strip() if mb else None)
    start=h1s[1] if len(h1s)>1 else top
    head=lines[top:start]
    headtxt='\n'.join(head)
    m=re.search(r'EAN[:\s]*([0-9]{8,14})',headtxt)
    ean=m.group(1) if m else None
    in_stock='Slut i lager' not in headtxt
    price=None
    mp=re.search(r'(\d[\d ]{2,})\s*kr',headtxt)
    if mp:
        v=mp.group(1).replace(' ','')
        if v.isdigit(): price=int(v)
    body=lines[start:]
    for i,l in enumerate(body):
        if re.match(r'\s*##\s+(Varför välja|Relaterade|Liknande|Andra kunder|Fungerar tillsammans|Vanliga frågor)',clean(l)):
            body=body[:i];break
    imgs=[]
    for m in re.finditer(r'!\[[^\]]*\]\((https://swedron\.se/_next/image\?url=[^)]+)\)',c):
        u=unwrap(m.group(1))
        if 'cdn.shopify.com' in u and u not in imgs: imgs.append(u)
    usp=[]
    for l in head:
        s=clean(l)
        if re.match(r'^\s*[*\-]\s',l) and 8<len(s)<100 and not DROP.match(s) and 'http' not in s:
            if s not in usp: usp.append(s)
    intro=[];specs=[];sections=[]
    mode='intro'
    for l in body[1:]:
        s=clean(l)
        if not s or s==TABS or s.startswith('!['): continue
        if re.match(r'^#{2,4}\s',l.strip()):
            h=re.sub(r'^#+\s*','',s)
            if SPECHDR.match(h): mode='spec'
            else:
                mode='sec'; sections.append({'h':h,'p':[]})
            continue
        if DROP.match(s): continue
        if mode=='spec':
            if ':' in s and len(s)<160: specs.append(s)
            continue
        if re.match(r'^\s*[*\-]\s',l):
            if len(s)<140:
                (sections[-1]['p'] if sections else intro).append('• '+s)
            continue
        if len(s)>50:
            (sections[-1]['p'] if sections else intro).append(s)
    return {'url':url,'title':title,'brand':brand,'ean':ean,'price':price,'in_stock':in_stock,
            'images':imgs[:8],'usp':usp[:6],'intro':intro[:4],'specs':specs[:40],
            'sections':[s for s in sections if s['p']][:8]}

files=sorted(glob.glob('/root/.claude/projects/-home-user-eudronecompany/9777b35c-12e4-5c37-8615-1226c825974c/tool-results/mcp-Nimble-nimble_extract-*.txt'))
seen={};res=[]
for fp in files:
    r=parse(fp)
    if not r or r['url'] in seen: continue
    seen[r['url']]=1; res.append(r)
json.dump(res,open('scraped.json','w'),ensure_ascii=False,indent=1)
print("parsed",len(res))
print("with specs:",sum(1 for r in res if r['specs']),"| with imgs:",sum(1 for r in res if r['images']),"| with ean:",sum(1 for r in res if r['ean']),"| with price:",sum(1 for r in res if r['price']))
