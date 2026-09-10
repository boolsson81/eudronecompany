"""Parser för Swedrons produktsidor i enkel-H1-layout (Chasing/Hollyland).

Skiljer sig från parse-product-pages.py: sidorna har bara en H1 och delas i
stället av flikraden "BeskrivningTeknisk specifikationRecensioner". Specarna
står som "EtikettVärde" utan avgränsare och delas på skiftläget.
"""
import json, re, os, sys, urllib.parse

MDLINK = re.compile(r'\[([^\]]*)\]\([^)]*\)')
TABLINE = re.compile(r'^Beskrivning(Teknisk specifikation)?(Tillbeh.r)?(Dokument)?(Recensioner)?$')
STOP = re.compile(r'^(Andra tittade även på|Relaterade|Liknande produkter)')
SECT = re.compile(r'^\*\s+(Beskrivning|Teknisk specifikation|Tillbeh.r|Dokument|Recensioner)\s*$')
DROP = re.compile(r'^(SEK|Slut i lager|I lager|EAN:?|\d+ i lager|LÄMNA EN RECENSION|Baserat på.*|[-+]|\d+)$', re.I)
SPLITKV = re.compile(r'^([A-ZÅÄÖ][^:]{1,40}?)(?=[A-ZÅÄÖ0-9])')


def clean(s):
    s = s.replace('\xa0', ' ')
    s = MDLINK.sub(r'\1', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'\1', s)
    s = s.replace('\\-', '-').replace('\\_', '_')
    s = re.sub(r'^\s*\*\s+', '', s)
    return re.sub(r'[ \t]+', ' ', s).strip()


def unwrap(u):
    m = re.search(r'_next/image\?url=([^&]+)', u)
    return urllib.parse.unquote(m.group(1)) if m else u


def splitspec(s):
    """"PekskärmNej" -> ("Pekskärm", "Nej"). Delar på första skiftlägesbytet.

    Hoppar över byten som ger en etikett som slutar på siffra eller ett värde på
    ett enda tecken. Det fångar fall som "Videoupplösning4K", där siffran hör
    till värdet och inte till etiketten.
    """
    for m in re.finditer(r'[a-zåäöé0-9)."]([A-ZÅÄÖ])', s):
        i = m.start(1)
        key, val = s[:i].strip(), s[i:].strip()
        if i < 3 or len(val) < 2 or key[-1:].isdigit():
            continue
        return key, val
    return None


def parse(fp):
    try:
        d = json.load(open(fp))
    except Exception:
        return None
    c = (d.get('content') or '').replace('\xa0', ' ')
    url = (d.get('url') or '').rstrip('/')
    if '/produkt/' not in url:
        return None
    lines = c.split('\n')
    h1 = next((i for i, l in enumerate(lines) if re.match(r'\s*#\s+\S', l)), None)
    if h1 is None:
        return None
    title = clean(re.sub(r'^\s*#\s+', '', lines[h1]))
    mb = re.match(r'\s*#\s+\[([^\]]+)\]', lines[h1])
    brand = mb.group(1).strip() if mb else None

    tab = next((i for i in range(h1, len(lines)) if TABLINE.match(lines[i].strip())), None)
    end = next((i for i in range(tab or h1, len(lines)) if STOP.match(clean(lines[i]))), len(lines))
    head = lines[h1:tab if tab else len(lines)]
    body = lines[tab + 1:end] if tab else []

    headtxt = '\n'.join(head)
    m = re.search(r'EAN[:\s]*([0-9]{8,14})', headtxt)
    ean = m.group(1) if m else None
    in_stock = 'Slut i lager' not in headtxt

    # Galleribilderna har alt-text lika med produkttiteln. Karusellen "Andra
    # tittade även på" ligger i samma block men bär grannproduktens alt-text,
    # så alt är det enda som skiljer dem åt.
    def norm(s):
        return re.sub(r'[^a-z0-9]', '', s.lower())

    imgs = []
    want = norm(title)
    for m in re.finditer(r'!\[([^\]]*)\]\((https://swedron\.se/_next/image\?url=[^)]+)\)',
                         '\n'.join(lines[h1:end])):
        if norm(m.group(1)) != want:
            continue
        u = unwrap(m.group(2))
        if 'cdn.shopify.com' in u and u not in imgs:
            imgs.append(u)

    usp = []
    for l in head:
        s = clean(l)
        if re.match(r'^\s*\*\s', l) and 6 < len(s) < 90 and not DROP.match(s) and 'http' not in s:
            if s not in usp:
                usp.append(s)

    mode = None
    intro, feats, specs = [], [], []
    for l in body:
        ms = SECT.match(l.strip())
        if ms:
            mode = ms.group(1)
            continue
        s = clean(l)
        if not s or DROP.match(s) or s.startswith('![') or 'http' in s:
            continue
        if mode == 'Teknisk specifikation':
            kv = splitspec(s)
            if kv:
                specs.append(kv)
            continue
        if mode == 'Beskrivning':
            if re.match(r'^\s*\*\s', l):
                feats.append(s)
            elif len(s) > 40:
                intro.append(s)
    return {'url': url, 'title': title, 'brand': brand, 'ean': ean, 'in_stock': in_stock,
            'images': imgs[:8], 'usp': usp[:6], 'intro': intro[:5],
            'feats': feats[:8], 'specs': specs[:30]}


if __name__ == '__main__':
    d = sys.argv[1]
    out = sys.argv[2]
    only = set(open(sys.argv[3]).read().split()) if len(sys.argv) > 3 else None
    res = {}
    for f in sorted(os.listdir(d)):
        if not f.startswith('mcp-Nimble-nimble_extract'):
            continue
        r = parse(os.path.join(d, f))
        if not r:
            continue
        if only and r['url'] + '/' not in only and r['url'] not in only:
            continue
        res[r['url']] = r
    v = list(res.values())
    json.dump(v, open(out, 'w'), ensure_ascii=False, indent=1)
    print('parsade', len(v), '| bild', sum(1 for r in v if r['images']),
          '| spec', sum(1 for r in v if r['specs']), '| usp', sum(1 for r in v if r['usp']),
          '| ean', sum(1 for r in v if r['ean']), '| intro', sum(1 for r in v if r['intro']))
