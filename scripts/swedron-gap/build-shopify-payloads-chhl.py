# -*- coding: utf-8 -*-
"""Bygger ProductCreateInput för Chasing- och Hollyland-importen.

Läser den parsade produktdatan, klassificerar, genererar svensk text och
skriver ut GraphQL-variabler i batchar om sju alias per anrop.
"""
import json, sys, os, importlib.util, collections

HERE = os.path.dirname(os.path.abspath(__file__))


def load(name, path):
    s = importlib.util.spec_from_file_location(name, os.path.join(HERE, path))
    m = importlib.util.module_from_spec(s)
    s.loader.exec_module(m)
    return m


copy = load('copy_chhl', 'copy-chhl.py')
cls = load('classify_chhl', 'classify-chhl.py')

BASE = {'swedron-gap-import', 'draft-granskas'}
VENDOR = {'Chasing Innovation': 'Chasing', 'Hollyland': 'Hollyland'}
SERIES = [('Gladius Mini', 'Gladius Mini'), ('M2 Pro Max', 'M2 Pro Max'), ('M2 Pro', 'M2 Pro'),
          ('M2 S', 'M2 S'), ('Dory', 'Dory'), ('F1', 'F1'),
          ('Lark M2S', 'Lark M2S'), ('Lark M2', 'Lark M2'), ('Lark Max 2', 'Lark Max 2'),
          ('Lark Max', 'Lark Max'), ('Lark A1', 'Lark A1'), ('Lark 150', 'Lark 150'),
          ('Solidcom SE', 'Solidcom SE'), ('Solidcom C1', 'Solidcom C1'), ('Solidcom M1', 'Solidcom M1'),
          ('Pyro Ultra', 'Pyro Ultra'), ('Pyro 7', 'Pyro 7'), ('Pyro 5', 'Pyro 5'),
          ('Pyro S', 'Pyro S'), ('Pyro H', 'Pyro H'), ('Mars M1', 'Mars M1'),
          ('Mars 4K', 'Mars 4K'), ('Mars 400S', 'Mars 400S'), ('Cosmo C2', 'Cosmo C2'),
          ('Cosmo C1', 'Cosmo C1')]


def build(recs):
    out = []
    for r in recs:
        vendor = VENDOR.get(r['brand'] or '', 'Hollyland')
        fam, ptype, tg = cls.classify(r['title'], vendor)
        r['family'] = fam
        tags = BASE | set(tg) | {vendor}
        low = r['title'].lower()
        for needle, tag in SERIES:
            if needle.lower() in low:
                tags.add(tag)
                break
        out.append({'title': r['title'], 'vendor': vendor, 'productType': ptype,
                    'tags': sorted(tags), 'descriptionHtml': copy.body_html(r),
                    'images': [{'url': u, 'alt': r['title'][:120]} for u in r['images'][:4]],
                    'source': r['url']})
    return out


if __name__ == '__main__':
    recs = json.load(open(sys.argv[1]))
    outdir = sys.argv[2]
    os.makedirs(outdir, exist_ok=True)
    out = build(recs)
    json.dump(out, open(os.path.join(outdir, 'chhl_payloads.json'), 'w'), ensure_ascii=False, indent=1)
    B = 7
    for bi in range(0, len(out), B):
        v = {}
        for j, x in enumerate(out[bi:bi + B]):
            v[f'p{j}'] = {'title': x['title'], 'vendor': x['vendor'], 'productType': x['productType'],
                          'tags': x['tags'], 'descriptionHtml': x['descriptionHtml'], 'status': 'DRAFT'}
            v[f'm{j}'] = [{'originalSource': i['url'], 'alt': i['alt'], 'mediaContentType': 'IMAGE'}
                          for i in x['images']]
        json.dump({'variables': v}, open(os.path.join(outdir, f'b{bi // B:03d}.json'), 'w'), ensure_ascii=False)
    print('payloads:', len(out), '| batchar:', (len(out) + B - 1) // B)
    print(dict(collections.Counter(x['productType'] for x in out)))
    print('utan bild:', sum(1 for x in out if not x['images']))
