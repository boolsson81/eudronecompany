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

BRAND = "EU Drone Company"
RUN_TAG = "wisson-import"
REVIEW_TAG = "draft-granskas"

PRODUCT_TYPE = {
    "AP30-N1": "Flygburen manipulator",
    "AP3-G1": "Flygburet gripdon",
    "AP30-G2": "Flygburen lastsläppare",
    "AP3-P1": "Flygburen sprutmodul",
    "AP30-P2": "Flygburet tvättsystem",
    "AP3-P3": "Flygburet tvättsystem",
    "AP30-P4": "Flygburen sprutmodul",
    "AP30-P4H": "Flygburen sprutmodul",
    "AP3-P5": "Flygburen sprutmodul",
    "AP3-D1": "Flygburen inspektionsmodul",
}

TITLE_SV = {
    "AP30-N1": "Wisson Orion AP30-N1 — Pliabot flygburen manipulator (DJI FC30)",
    "AP3-G1": "Wisson Orion AP3-G1 — Pliabot flygburet gripdon (DJI M300/M350)",
    "AP30-G2": "Wisson Orion AP30-G2 — flygburen lastsläppare 40 kg (DJI FC30)",
    "AP3-P1": "Wisson Orion AP3-P1 — Pliabot flygburen sprutmodul (DJI M300/M350)",
    "AP30-P2": "Wisson Orion AP30-P2 — flygburen högtryckstvätt 30 l (DJI FC30)",
    "AP3-P3": "Wisson Orion AP3-P3 — Pliabot fasadtvättsystem (DJI M400)",
    "AP30-P4": "Wisson Orion AP30-P4 — Pliabot flygburen dimspruta",
    "AP30-P4H": "Wisson Orion AP30-P4H — Pliabot flygburen högtrycksspruta",
    "AP3-P5": "Wisson Orion AP3-P5 — Pliabot flygburen sprutmodul med luftridå (DJI M400)",
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
    "horizontal_spray_adjust_deg": ("Horisontell sprutjustering", "°"),
    "effective_range_m": ("Effektiv räckvidd", "m"),
    "distance_sensor": ("Avståndsmätning", ""),
    "nozzles": ("Munstycken", ""),
    "route_planning": ("Sprutbana", ""),
    "overspray_reduction": ("Minskat sprutspill", ""),
    "paint_brand_compatibility": ("Färgkompatibilitet", ""),
    "distance_adaptive_output": ("Avståndsstyrt utflöde", ""),
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
    "AP30-P2": ["industry:energy", "industry:inspection"],
    "AP3-P3": ["industry:inspection"],
    "AP30-P4": ["industry:energy", "industry:inspection"],
    "AP30-P4H": ["industry:energy", "industry:inspection"],
    "AP3-P5": ["industry:energy", "industry:inspection"],
    "AP3-D1": ["industry:inspection", "industry:energy"],
}

VALUE_SV = {
    "360° bending + telescoping": "360° böjning + teleskopering",
    "Integrated": "Integrerad",
    "medical-grade pure water": "Renvatten av medicinsk kvalitet",
    "Dual-patented DIC water treatment system": "DIC-vattenrening (dubbelpatenterad)",
    "4x efficiency": "4× jämfört med manuellt arbete",
}

MODULE_SV = {
    "AP3-P3 Pliabot® Aerial Tethered Cleaning Robot": "AP3-P3 — Pliabot flygburen tvättrobot med 40° gummiskrapa",
    "DJI Matrice 400 drone": "Flygplattform — DJI Matrice 400 eller Matrice 350 RTK, ingår bara i det kompletta paketet",
    "AP-P Series dedicated dynamic intelligent control (DIC) water treatment system": "AP-P DIC-vattenrening — dubbelpatenterad, ger medicinskt rent vatten",
    "AP-P Series dedicated water management system": "AP-P vattenhanteringssystem",
    "AP-P Series dedicated curtain wall cleaning agent": "AP-P rengöringsmedel för glasfasad",
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

def build_system_description(sysdef, c):
    """Paketprodukt: modullistan ersätter specifikationstabellen."""
    parts = [f"<p>{esc(c['intro'])}</p>"]
    pkgs = sysdef.get("packages") or []
    if pkgs:
        parts.append(
            "<h3>Två paket</h3><ul>"
            + "".join(f"<li><strong>{esc(p['namn_sv'])}</strong> — {esc(p['innehall'])}</li>" for p in pkgs)
            + "</ul>"
        )
    parts.append(
        "<h3>Tre kärnmoduler</h3><ul>"
        + "".join(f"<li>{esc(MODULE_SV.get(m, m))}</li>" for m in sysdef["core_modules_en"])
        + "</ul>"
    )
    parts.append(
        "<h3>Kringutrustning</h3><ul>"
        + "".join(f"<li>{esc(MODULE_SV.get(m, m))}</li>" for m in sysdef["supporting_components_en"])
        + "</ul>"
    )
    parts.append("<h3>Nyckelegenskaper</h3><ul>" + "".join(f"<li>{esc(u)}</li>" for u in c["usp"]) + "</ul>")
    parts.append(f"<h3>Användning</h3><p>{esc(c['usecase'])}</p>")
    parts.append(
        "<h3>Bra att veta</h3><ul>"
        "<li>Säljs av EU Drone Company med support på svenska.</li>"
        "<li>Paketet konfigureras per uppdrag — innehåll, pris och leveranstid bekräftas i offert.</li>"
        "<li>Välj paketet utan drönare om ni redan flyger Matrice 400 eller Matrice 350 RTK.</li>"
        "<li>Specifikationerna är tillverkarens uppgifter och bekräftas vid offert.</li>"
        "</ul>"
    )
    return "".join(parts)


SEO_NAME_SV = {
    "AP30-N1": "flygburen Pliabot-manipulator",
    "AP3-G1": "flygburet Pliabot-gripdon",
    "AP30-G2": "flygburen lastsläppare 40 kg",
    "AP3-P1": "flygburen Pliabot-sprutmodul",
    "AP30-P2": "flygburen högtryckstvätt 30 l",
    "AP3-P3": "flygburet fasadtvättsystem",
    "AP30-P4": "flygburen Pliabot-dimspruta",
    "AP30-P4H": "flygburen högtrycksspruta",
    "AP3-P5": "flygburen spruta med luftridå",
    "AP3-D1": "flygburen kontaktinspektion",
}


def seo_title(model, name_en, limit=70):
    suffix = f" | {BRAND}"
    room = limit - len(suffix) - len(model) - 3
    name = SEO_NAME_SV.get(model, name_en)
    if len(name) > room:
        name = name[:room].rsplit(" ", 1)[0]
    return f"{model} — {name}{suffix}"


def build_systems():
    out = []
    for sysdef in SRC.get("systems", []):
        code = sysdef["code"]
        c = COPY[code]
        tags = ["Wisson", "Orion", "Pliabot", f"model:{code.lower()}",
                "brand:wisson", "manufacturer:wisson", "serie:s",
                "typ:paket", "compat:matrice-400",
                "industry:inspection", RUN_TAG, REVIEW_TAG]
        out.append({
            "model": code,
            "title": "Wisson Orion AP3-S1 — fasadtvättsystem i paket",
            "vendor": "Wisson",
            "productType": "Fasadtvättsystem (paket)",
            "tags": sorted(set(tags)),
            "descriptionHtml": build_system_description(sysdef, c),
            "options": [{
                "name": "Paket",
                "values": ["Komplett med DJI Matrice 400",
                           "Komplett med DJI Matrice 350 RTK",
                           "Utan drönare"],
            }],
            "seo": {
                "title": f"AP3-S1 — fasadtvättsystem i paket | {BRAND}",
                "description": (c["intro"][:150].rsplit(" ", 1)[0] + "…"),
            },
            "source": sysdef["source"],
        })
    return out


def build():
    out = []
    for p in SRC["products"]:
        m = p["model"]
        c = COPY[m]
        tags = ["Wisson", "Orion", "Pliabot", f"model:{m.lower()}",
                "brand:wisson", "manufacturer:wisson",
                f"serie:{p['series'].lower()}", RUN_TAG, REVIEW_TAG]
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
            "descriptionHtml": build_description(p, c),
            "seo": {
                "title": seo_title(m, p["name_en"]),
                "description": (c["intro"][:150].rsplit(" ", 1)[0] + "…"),
            },
            "source": p["source"],
        })
    return out

if __name__ == "__main__":
    cat = build() + build_systems()
    dest = os.path.join(ROOT, "data", "wisson-catalog.json")
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(cat, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"Skrev {len(cat)} produkter till data/wisson-catalog.json")
