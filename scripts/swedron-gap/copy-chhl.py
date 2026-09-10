# -*- coding: utf-8 -*-
"""Genererar egen svensk säljtext för Chasing- och Hollyland-importen.

Texten sätts ihop av egenskrivna mallar per produktfamilj plus sakuppgifter
som plockas ur produktsidans specifikationstabell och sifferuppgifter.
Konkurrentens brödtext återanvänds inte.
"""
import re, html

LEAD = {
 'chasing-rov':
  "{t} är en fjärrstyrd undervattensfarkost från Chasing. Den styrs från ytan via "
  "kabel och används för inspektion, dokumentation och sök under vattnet, där en "
  "luftburen drönare inte kommer åt.",
 'chasing-pool':
  "{t} är en självgående undervattensrobot från Chasing för rengöring av bassänger.",
 'chasing-sonar':
  "{t} är en sonar- eller sensorenhet till Chasings undervattensfarkoster. Den ger "
  "sikt och mätdata i grumligt vatten där kameran inte räcker till.",
 'chasing-sensor':
  "{t} är en tilläggssensor till Chasings undervattensfarkoster och utökar vad "
  "farkosten kan dokumentera under ytan.",
 'chasing-arm':
  "{t} hör till Chasings manipulatorsystem. Med gripklo och provtagare kan farkosten "
  "hämta upp föremål och ta prover utan att någon behöver dyka.",
 'chasing-power':
  "{t} hör till kraftförsörjningen för Chasings undervattensfarkoster. Extra batteri "
  "eller laddare håller igång arbetet mellan dyken.",
 'chasing-tether':
  "{t} hör till Chasings kabelsystem. Kabeln bär både styrsignal och video mellan "
  "farkosten och operatören på ytan, och kabellängden avgör hur långt ut du når.",
 'chasing-light':
  "{t} är belysning till Chasings undervattensfarkoster. Ljus är avgörande för "
  "bildkvaliteten på djup och i grumligt vatten.",
 'chasing-rc':
  "{t} hör till styrningen av Chasings undervattensfarkoster.",
 'chasing-case':
  "{t} skyddar utrustningen mellan uppdragen och gör den lättare att bära med sig ut "
  "till vattnet.",
 'chasing-part':
  "{t} är en originalreservdel till Chasings undervattensfarkoster. Rätt del på plats "
  "håller tätningen intakt och farkosten i drift.",
 'chasing-acc':
  "{t} är ett tillbehör till Chasings undervattensfarkoster.",
 'holly-video':
  "{t} hör till Hollylands system för trådlös videoöverföring. Bilden går från kamera "
  "till monitor utan kabel, vilket är praktiskt vid flygfoto, inspektion och "
  "produktion där operatör och bildgranskare står på olika platser.",
 'holly-mic':
  "{t} tillhör Hollylands Lark-serie med trådlösa mygg- och kameramikrofoner. "
  "Sändaren fästs på den som talar och ljudet går trådlöst till kamera eller telefon.",
 'holly-intercom':
  "{t} tillhör Hollylands Solidcom-system för trådlös intercom. Hela arbetslaget hör "
  "varandra i realtid utan basstation eller kablage mellan positionerna.",
 'holly-tally':
  "{t} hör till Hollylands tallysystem för flerkameraproduktion och märker ut vilken "
  "kamera som är i sändning.",
 'holly-antenna':
  "{t} är en antenn till Hollylands trådlösa system. Rätt antenn påverkar räckvidd "
  "och stabilitet mer än något annat i länken.",
 'holly-rig':
  "{t} är ett riggtillbehör till Hollylands monitorer och sändare.",
 'holly-cable':
  "{t} är en kabel eller adapter till Hollylands system.",
 'holly-power':
  "{t} hör till kraftförsörjningen för Hollylands trådlösa system. Extra batteri "
  "eller laddningsbas håller sändare och headset igång under hela inspelningsdagen.",
 'holly-case':
  "{t} skyddar utrustningen mellan uppdragen och håller ihop delarna i ett system "
  "som annars är lätt att tappa bort.",
 'holly-acc':
  "{t} är ett tillbehör till Hollylands trådlösa system.",
}

CLOSE = {
 'chasing': "Originaldel från Chasing Innovation. Kontakta oss om du är osäker på vilken "
            "modell delen passar till.",
 'holly':   "Originalprodukt från Hollyland. Hör av dig om du vill ha hjälp att sätta ihop "
            "ett komplett paket.",
}

# Sifferfakta vi själva formulerar om till svenska punkter.
FACTS = [
 (r'(\d+(?:[.,]\d+)?)\s*km\b',            "Räckvidd upp till {0} km fri sikt"),
 (r'upp till (\d{2,4})\s*m\b(?!m)',       "Räckvidd upp till {0} meter"),
 (r'\b(\d{2,3})\s*ms\b',                  "Latens ner till {0} ms"),
 (r'\b(4K ?\d{2,3}|3840\s*[x×]\s*2160p?\d{0,2})\b', "Video i {0}"),
 (r'\b(\d{2,4})\s*Wh\b',                  "Batterikapacitet {0} Wh"),
 (r'\b(\d{1,2})\s*(?:personer|person)\b', "Dimensionerat för {0} personer"),
 (r'\b(\d{2,3})\s*m(?:eter)?\s*(?:kabel|tether)\b', "{0} meter kabel"),
 (r'\b(\d{1,3})\s*W\b',                   "Effektförbrukning {0} W"),
]

SKIPSPEC = re.compile(r'^(EC Rep|Tillverkare|Manufacturer|Importer|Importör|Adress|Address|Produktnamn|Kontakt)', re.I)


def esc(s):
    return html.escape(s, quote=False)


def facts_from(rec):
    """Plockar sifferfakta ur produktsidans text och formulerar om dem."""
    blob = ' '.join(rec.get('usp', []) + rec.get('intro', []) + rec.get('feats', []))
    out = []
    for rx, tmpl in FACTS:
        m = re.search(rx, blob, re.I)
        if m:
            line = tmpl.format(m.group(1).replace(',', '.'))
            if line not in out:
                out.append(line)
    return out[:5]


def body_html(rec):
    fam = rec['family']
    kind = 'chasing' if fam.startswith('chasing') else 'holly'
    title = rec['title']
    short = re.sub(r'^(Chasing Innovation|Hollyland)\s+', '', title)
    short = short[:1].upper() + short[1:]
    p = [f"<p>{esc(LEAD[fam].format(t=short))}</p>"]

    f = facts_from(rec)
    if f:
        p.append("<h3>Kort om produkten</h3><ul>" +
                 ''.join(f"<li>{esc(x)}</li>" for x in f) + "</ul>")

    specs = [(k, v) for k, v in rec.get('specs', []) if not SKIPSPEC.match(k)]
    if specs:
        rows = ''.join(f"<tr><th>{esc(k)}</th><td>{esc(v)}</td></tr>" for k, v in specs[:20])
        p.append("<h3>Specifikation</h3><table>" + rows + "</table>")

    if rec.get('ean'):
        p.append(f"<p>EAN: {esc(rec['ean'])}</p>")
    p.append(f"<p>{esc(CLOSE[kind])}</p>")
    return ''.join(p)
