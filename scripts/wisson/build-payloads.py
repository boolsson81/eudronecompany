# -*- coding: utf-8 -*-
"""Bygger ProductCreateInput-payloads för Wisson Orion-sortimentet.

Fakta kommer från data/wisson-source-extract.json, säljtext från copy_sv.py.
Kör:  python3 scripts/wisson/build-payloads.py
Ut:   data/wisson-catalog.json
"""
import json, os, sys, html

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, "scripts", "wisson"))
from copy_sv import COPY

SRC = json.load(open(os.path.join(ROOT, "data", "wisson-source-extract.json"), encoding="utf-8"))

RUN_TAG = "wisson-import"
REVIEW_TAG = "draft-granskas"
# Sortimentet säljs inte i kassan. Taggen styr temat: buy-buttons.liquid byter
# köpknappen mot "Begär offert" och price.liquid visar "Pris på förfrågan".
QUOTE_TAG = "offert"
TEMPLATE_SUFFIX = "enterprise-accessories"

PRODUCT_TYPE = {
    "AP30-N1": "Flygburen manipulator",
    "AP3-G1": "Flygburet gripdon",
    "AP30-G2": "Flygburen lastsläppare",
    "AP3-P1": "Flygburen sprutmodul",
    "AP3-P3": "Flygburet tvättsystem",
    "AP30-P4": "Flygburen sprutmodul",
    "AP30-P4H": "Flygburen sprutmodul",
    "AP3-D1": "Flygburen inspektionsmodul",
}

TITLE_SV = {
    "AP30-N1": "Wisson Orion AP30-N1 — Pliabot flygburen manipulator (DJI FC30)",
    "AP3-G1": "Wisson Orion AP3-G1 — Pliabot flygburet gripdon (DJI M300/M350)",
    "AP30-G2": "Wisson Orion AP30-G2 — flygburen lastsläppare 40 kg (DJI FC30)",
    "AP3-P1": "Wisson Orion AP3-P1 — Pliabot flygburen sprutmodul (DJI M300/M350)",
    "AP3-P3": "Wisson Orion AP3-P3 — Pliabot fasadtvättsystem (DJI M400)",
    "AP30-P4": "Wisson Orion AP30-P4 — Pliabot flygburen dimspruta",
    "AP30-P4H": "Wisson Orion AP30-P4H — Pliabot flygburen högtrycksspruta",
    "AP3-D1": "Wisson Orion AP3-D1 — flygburen kontaktinspektionsrobot (DJI M300/M350)",
}

SPEC_LABEL = {
    "system_weight_kg": ("Systemvikt", "kg"),
    "controllable_motions": ("Rörelser", ""),
    "manipulator_diameter_mm": ("Armdiameter", "mm"),
    "vertical_length_retracted_mm": ("Längd infälld", "mm"),
    "vertical_length_extended_mm": ("Längd utfälld", "mm"),
    "max_payload_vertical_kg": ("Max last (vertikalt)", "kg"),
    "max_payload_kg": ("Max last", "kg"),
    "operating_power_w": ("Effekt i drift", "W"),
    "holding_power_w": ("Effekt vid hållning", "W"),
    "operator_console": ("Operatörspanel", ""),
    "min_temperature_c": ("Lägsta arbetstemperatur", "°C"),
    "install_time_s": ("Monteringstid", "s"),
    "setup_time_min": ("Riggtid", "min"),
    "suspension_height_m": ("Hisshöjd", "m"),
    "liquid_capacity_l": ("Vätskevolym", "l"),
    "folded_length_m": ("Hopfälld längd", "m"),
    "paired_drone_payload_kg": ("Avsedd drönarlastkapacitet", "kg"),
    "efficiency_claim": ("Effektivitet (tillverkarens uppgift)", ""),
    "squeegee_fan_angle_deg": ("Skrapans solfjädervinkel", "°"),
    "vertical_spray_adjust_deg": ("Vertikal sprutjustering", "°"),
    "water": ("Vatten", ""),
    "water_system": ("Vattenrening", ""),
    "max_contact_force_n": ("Max kontaktkraft", "N"),
    "contact_duration_s": ("Kontakttid", "s"),
    "module_swap_time_min": ("Modulbyte", "min"),
}

COMPAT_TAG = {
    "DJI FC30": "compat:flycart-30",
    "DJI M300": "compat:matrice-300",
    "DJI M350": "compat:matrice-350",
    "DJI M400": "compat:matrice-400",
}

INDUSTRY_TAG = {
    "AP30-N1": ["industry:energy", "industry:inspection", "industry:public-safety", "industry:logistics", "industry:agriculture"],
    "AP3-G1": ["industry:public-safety"],
    "AP30-G2": ["industry:energy", "industry:public-safety", "industry:logistics"],
    "AP3-P1": ["industry:energy", "industry:inspection"],
    "AP3-P3": ["industry:inspection"],
    "AP30-P4": ["industry:energy", "industry:inspection"],
    "AP30-P4H": ["industry:energy", "industry:inspection"],
    "AP3-D1": ["industry:inspection", "industry:energy"],
}

VALUE_SV = {
    "360° bending + telescoping": "360° böjning + teleskopering",
    "Integrated": "Integrerad",
    "medical-grade pure water": "Renvatten av medicinsk kvalitet",
    "Dual-patented DIC water treatment system": "DIC-vattenrening (dubbelpatenterad)",
    "4x efficiency": "4× jämfört med manuellt arbete",
}

COMPAT_SV = {
    "DJI FC30": "DJI FlyCart 30",
    "DJI M300": "DJI Matrice 300 RTK",
    "DJI M350": "DJI Matrice 350 RTK",
    "DJI M400": "DJI Matrice 400",
    "other drones with payload under 5 kg": "övriga drönare med lastkapacitet under 5 kg",
    "leading industrial drones (model not stated on source page)": "ledande industridrönare — plattform bekräftas vid offert",
    "industry-leading drones (model not stated on source page)": "ledande industridrönare — plattform bekräftas vid offert",
}


def esc(s):
    return html.escape(str(s), quote=False)


def sv_num(v):
    """Svenskt decimaltecken för flyttal."""
    if isinstance(v, float):
        return ("%g" % v).replace(".", ",")
    return v

def spec_rows(p):
    rows = []
    for key, val in (p.get("specs") or {}).items():
        label, unit = SPEC_LABEL.get(key, (key, ""))
        val = VALUE_SV.get(val, val) if isinstance(val, str) else sv_num(val)
        v = f"{val} {unit}".strip() if unit else str(val)
        rows.append(f"<tr><th scope=\"row\">{esc(label)}</th><td>{esc(v)}</td></tr>")
    return rows

def build_description(p, c):
    parts = [f"<p>{esc(c['intro'])}</p>"]
    parts.append("<h3>Nyckelegenskaper</h3><ul>" + "".join(f"<li>{esc(u)}</li>" for u in c["usp"]) + "</ul>")
    rows = spec_rows(p)
    if rows:
        parts.append("<h3>Specifikation</h3><table>" + "".join(rows) + "</table>")
    compat = ", ".join(COMPAT_SV.get(d, d) for d in (p.get("drone_compatibility") or []))
    if compat:
        parts.append(f"<h3>Kompatibilitet</h3><p>{esc(compat)}.</p>")
    parts.append(f"<h3>Användning</h3><p>{esc(c['usecase'])}</p>")
    parts.append(
        "<h3>Bra att veta</h3><ul>"
        "<li>Säljs av EU Drone Company med support på svenska.</li>"
        "<li>Enterprise-produkt som offereras per uppdrag — kontakta oss för pris, leveranstid och konfiguration.</li>"
        "<li>Specifikationerna är tillverkarens uppgifter och bekräftas vid offert.</li>"
        "</ul>"
    )
    return "".join(parts)

SEO_NAME_SV = {
    "AP30-N1": "flygburen Pliabot-manipulator",
    "AP3-G1": "flygburet Pliabot-gripdon",
    "AP30-G2": "flygburen lastsläppare 40 kg",
    "AP3-P1": "flygburen Pliabot-sprutmodul",
    "AP3-P3": "flygburet fasadtvättsystem",
    "AP30-P4": "flygburen Pliabot-dimspruta",
    "AP30-P4H": "flygburen högtrycksspruta",
    "AP3-D1": "flygburen kontaktinspektion",
}


def seo_title(model, name_en, limit=70):
    suffix = " | EU Drone Company"
    room = limit - len(suffix) - len(model) - 3
    name = SEO_NAME_SV.get(model, name_en)
    if len(name) > room:
        name = name[:room].rsplit(" ", 1)[0]
    return f"{model} — {name}{suffix}"


def build():
    out = []
    for p in SRC["products"]:
        m = p["model"]
        c = COPY[m]
        tags = ["Wisson", "Orion", "Pliabot", f"model:{m.lower()}",
                "brand:wisson", "manufacturer:wisson",
                f"serie:{p['series'].lower()}", RUN_TAG, REVIEW_TAG, QUOTE_TAG]
        for d in p.get("drone_compatibility") or []:
            if d in COMPAT_TAG:
                tags.append(COMPAT_TAG[d])
        tags.extend(INDUSTRY_TAG.get(m, []))
        out.append({
            "model": m,
            "title": TITLE_SV[m],
            "vendor": "Wisson",
            "productType": PRODUCT_TYPE[m],
            "tags": sorted(set(tags)),
            "templateSuffix": TEMPLATE_SUFFIX,
            "descriptionHtml": build_description(p, c),
            "seo": {
                "title": seo_title(m, p["name_en"]),
                "description": (c["intro"][:150].rsplit(" ", 1)[0] + "…"),
            },
            "source": p["source"],
        })
    return out

if __name__ == "__main__":
    cat = build()
    dest = os.path.join(ROOT, "data", "wisson-catalog.json")
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(cat, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"Skrev {len(cat)} produkter till data/wisson-catalog.json")
