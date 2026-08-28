import json, re, os, glob, sys, collections

TH = "/home/user/eudronecompany/theme"
findings = collections.defaultdict(list)

def liquid_files():
    for d in ("sections", "snippets", "layout", "templates"):
        for p in glob.glob(f"{TH}/{d}/**/*.liquid", recursive=True):
            yield p

def rel(p): return os.path.relpath(p, TH)

# ---------- inventory ----------
snippets = {os.path.basename(p)[:-7] for p in glob.glob(f"{TH}/snippets/*.liquid")}
sections = {os.path.basename(p)[:-7] for p in glob.glob(f"{TH}/sections/*.liquid")}
assets   = {os.path.basename(p) for p in glob.glob(f"{TH}/assets/*")}

# ---------- 1. render/include -> snippet exists ----------
for p in liquid_files():
    src = open(p, encoding="utf-8").read()
    for m in re.finditer(r"\{%-?\s*(?:render|include)\s+'([^']+)'", src):
        if m.group(1) not in snippets:
            findings["saknad snippet"].append(f"{rel(p)}: render '{m.group(1)}'")

# ---------- 2. asset_url -> asset exists ----------
for p in liquid_files():
    src = open(p, encoding="utf-8").read()
    for m in re.finditer(r"'([A-Za-z0-9_.\-]+\.(?:css|js|svg|png|jpg|jpeg|webp|woff2?))'\s*\|\s*asset_url", src):
        if m.group(1) not in assets:
            findings["saknad asset"].append(f"{rel(p)}: {m.group(1)}")

# ---------- 3. section schemas parse ----------
schemas = {}
for p in glob.glob(f"{TH}/sections/*.liquid"):
    src = open(p, encoding="utf-8").read()
    m = re.search(r"\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}", src, re.S)
    if not m: continue
    try:
        schemas[os.path.basename(p)[:-7]] = json.loads(m.group(1))
    except Exception as e:
        findings["trasigt schema"].append(f"{rel(p)}: {e}")

# ---------- 4. duplicate setting ids within a schema ----------
for name, sch in schemas.items():
    ids = [e["id"] for e in sch.get("settings", []) if "id" in e]
    dupes = {i for i in ids if ids.count(i) > 1}
    for d in dupes:
        findings["dubblett-id i schema"].append(f"sections/{name}.liquid: '{d}'")

# ---------- 5. settings.X used but not defined in settings_schema ----------
defined = set()
for group in json.load(open(f"{TH}/config/settings_schema.json", encoding="utf-8")):
    for e in group.get("settings", []):
        if "id" in e: defined.add(e["id"])
used = collections.defaultdict(set)
for p in liquid_files():
    src = open(p, encoding="utf-8").read()
    for m in re.finditer(r"(?<![\w.])settings\.([a-z0-9_]+)", src):
        used[m.group(1)].add(rel(p))
for k, where in sorted(used.items()):
    if k not in defined:
        findings["odefinierad global inställning"].append(f"settings.{k}  ({', '.join(sorted(where)[:3])})")

# ---------- 6. translation keys ----------
def flatten(d, pre=""):
    out = set()
    for k, v in d.items():
        key = f"{pre}{k}"
        if isinstance(v, dict): out |= flatten(v, key + ".")
        else: out.add(key)
    return out
sv = flatten(json.load(open(f"{TH}/locales/sv.json", encoding="utf-8")))
en = flatten(json.load(open(f"{TH}/locales/en.default.json", encoding="utf-8")))
schema_en = flatten(json.load(open(f"{TH}/locales/en.default.schema.json", encoding="utf-8")))

for p in liquid_files():
    src = open(p, encoding="utf-8").read()
    src = re.sub(r"\{%\s*schema\s*%\}.*?\{%\s*endschema\s*%\}", "", src, flags=re.S)
    for m in re.finditer(r"'([a-z0-9_]+(?:\.[a-z0-9_]+)+)'\s*\|\s*t\b", src):
        k = m.group(1)
        plural = {k + "." + f for f in ("one","other","zero","two","few","many")}
        if k not in en and not (plural & en):
            findings["saknad översättningsnyckel (en.default)"].append(f"{rel(p)}: {k}")
        elif k not in sv and not (plural & sv):
            findings["saknad svensk översättning"].append(f"{rel(p)}: {k}")

# schema t: keys
for name, sch in schemas.items():
    for m in re.finditer(r'"t:([a-z0-9_.\-]+)"', json.dumps(sch)):
        if m.group(1) not in schema_en:
            findings["saknad schema-översättning"].append(f"sections/{name}.liquid: t:{m.group(1)}")

# ---------- 7. color schemes referenced in templates ----------
valid_schemes = set(json.load(open(f"{TH}/config/settings_data.json", encoding="utf-8"))["presets"]["Default"]["color_schemes"])
for p in glob.glob(f"{TH}/templates/**/*.json", recursive=True) + glob.glob(f"{TH}/sections/*.json"):
    txt = open(p, encoding="utf-8").read()
    for m in re.finditer(r'"color_scheme":\s*"([^"]+)"', txt):
        if m.group(1) and m.group(1) not in valid_schemes:
            findings["okänt färgschema"].append(f"{rel(p)}: {m.group(1)}")

# ---------- report ----------
total = sum(len(v) for v in findings.values())
print(f"=== {total} fynd ===\n")
for cat in sorted(findings):
    items = findings[cat]
    print(f"## {cat} ({len(items)})")
    seen = set()
    for it in items:
        if it in seen: continue
        seen.add(it)
        print("  -", it)
    print()
