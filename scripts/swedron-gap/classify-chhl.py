# -*- coding: utf-8 -*-
"""Klassificerar Chasing- och Hollyland-produkter i familj och produkttyp.

Familjen styr vilken svensk inledningstext som används, produkttypen blir
Shopifys productType. Reglerna är märkesstyrda: Chasings nyckelord får aldrig
träffa en Hollyland-produkt och tvärtom. Rent regelbaserat på titeln, inget
hämtas från konkurrentens kategorisering.
"""
import re

# Kompletta farkoster och paket hos Chasing. Vit lista: allt annat med samma
# modellnamn i titeln är tillbehör eller reservdel.
ROV = [
    r'^Chasing Innovation M2( S| Pro| PRO| Pro Max| PRO MAX)? \d+m( Value Pack)?$',
    r'^Chasing Innovation Gladius Mini S? ?\d+m$',
    r'Gladius Mini S Flash Pack \d+m',
    r'\bADVANCED SET\b',
    r'\bROV only\b',
    r'\bValuepack\b',
    r'^Chasing Innovation Kit Gladius',
    r'^Chasing Innovation Dory Flash Pack$',
]

# (regex mot titel, familj, produkttyp, extra taggar). Prövas i ordning.
CHASING_RULES = [
    (r'\bCM600\b',                      'chasing-pool',   'Undervattensrobot',            ['poolrobot']),
    (r'\b(Sonar|USBL|DVL|Ping 360|Omniscan|Omiscan|Oculus|Gemini)\b',
                                        'chasing-sonar',  'Sonar och sensorer',           ['sonar']),
    (r'(Grabber|Robot Arm|Robot arm|Robotic Arm|Claw|Sediment Sampler|Water Sampler)',
                                        'chasing-arm',    'Manipulatorarm',               ['gripklo']),
    (r'(Laser Scaler|Auxiliary Camera|Rotatable Camera)',
                                        'chasing-sensor', 'Sonar och sensorer',           ['sensor']),
    (r'(Remote Control|Remote Controller|Control Console)',
                                        'chasing-rc',     'Fjärrkontroll',                ['fjarrkontroll']),
    (r'(Base Station|Adapter Box|Smartphone holder)',
                                        'chasing-acc',    'Tillbehör',                    ['tillbehor']),
    (r'(Floodlight|Led Module|LED Protection)',
                                        'chasing-light',  'Undervattensbelysning',        ['belysning']),
    (r'(Battery|Batteri|Charger|Power Supply|A/C Adapter|AC-Power)',
                                        'chasing-power',  'Batteri och laddning',         ['kraft']),
    (r'(Tether|Theter|Cable|Reel|Winder|E-Reel)',
                                        'chasing-tether', 'Kabel och vinsch',             ['tether']),
    (r'(Backpack|Hardcase|Carrying)',   'chasing-case',   'Väska och transport',          ['vaska']),
    (r'(Service Kit|O-ring|Screw|Frame|Motor|Propeller|Holder|Bracket|Handle|Nut|Socket|'
     r'Slot|Clip|Cover|Support Rod|Connector)',
                                        'chasing-part',   'Reservdelar',                  ['reservdel']),
]

HOLLY_RULES = [
    (r'\bTally\b|HL-TCB|HL-WTS|HL-HATN|HL-HCS|HL-NS01|Walkie-Talkie',
                                        'holly-tally',    'Tally och studiokablage',      ['tally', 'studio']),
    (r'\bSolidcom\b',                   'holly-intercom', 'Trådlöst intercom',            ['intercom']),
    (r'\bLark\b',                       'holly-mic',      'Trådlös mikrofon',             ['mikrofon']),
    (r'\b(Pyro|Mars|Cosmo|Vcore)\b',    'holly-video',    'Trådlös videolänk',            ['videolank']),
    (r'\b(Antenn|Antenna|Atenna)\b',    'holly-antenna',  'Antenner',                     ['antenn']),
    (r'(Battery|Batteri|Charging|Charger|D-Tap|Power Adapter)',
                                        'holly-power',    'Batteri och laddning',         ['kraft']),
    (r'(Carrying Case|Hard-shell|Waterproof Bag)',
                                        'holly-case',     'Väska och transport',          ['vaska']),
    (r'(Cold Shoe|Screw Fitting|Battery Plate|Handle|Shoulder Strap|Monitor Hood|Glass)',
                                        'holly-rig',      'Riggtillbehör',                ['rigg']),
    (r'(Cable|kabel|Adapter)',          'holly-cable',    'Kablar och adaptrar',          ['kabel']),
]

# Undertyper som får styra om produkttypen även när familjen redan är satt.
RETYPE = [
    (r'(Charging Case|Charging Base|Battery|Batteri|Li-ion|Battery charger)',
     'Batteri och laddning', ['kraft']),
    (r'(Carrying Case|Hard-shell|Waterproof Bag|Hardcase|Backpack)',
     'Väska och transport', ['vaska']),
]
# Undertyper som bara lägger till taggar.
TAGONLY = [
    (r'(Ear Pads|Earmuff|Cushion|Headset|Hörlur|Windshield|Sticker|Magnet Set|Back Clip)', ['tillbehor']),
    (r'(Receiver|Mottagare|\bRX\b)', ['mottagare']),
    (r'(Transmitter|Sändare|\bTX\b)', ['sandare']),
]


def classify(title, vendor='Chasing'):
    if vendor == 'Chasing':
        if any(re.search(rx, title) for rx in ROV):
            tags = ['rov'] + (['paket'] if re.search(r'(SET|Pack|Kit)', title, re.I) else [])
            return 'chasing-rov', 'Undervattensdrönare', sorted(set(tags))
        rules, fallback = CHASING_RULES, ('chasing-acc', 'Tillbehör', ['tillbehor'])
    else:
        rules, fallback = HOLLY_RULES, ('holly-acc', 'Tillbehör', ['tillbehor'])

    fam = typ = None
    tags = []
    for rx, f, t, tg in rules:
        if re.search(rx, title, re.I):
            fam, typ, tags = f, t, list(tg)
            break
    if fam is None:
        fam, typ, tags = fallback[0], fallback[1], list(fallback[2])

    for rx, t, tg in RETYPE:
        if re.search(rx, title, re.I):
            typ = t
            tags += tg
            break
    for rx, tg in TAGONLY:
        if re.search(rx, title, re.I):
            tags += tg
    return fam, typ, sorted(set(tags))
