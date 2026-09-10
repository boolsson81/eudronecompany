# -*- coding: utf-8 -*-
"""Egenförfattad svensk säljtext för Wisson Orion-sortimentet.

Regel (scripts/swedron-gap/README.md): specifikationer är fakta och hämtas från
data/wisson-source-extract.json. Brödtexten nedan är skriven av oss — Wissons
egen marknadstext kopieras inte.
"""

COPY = {
  "AP30-N1": {
    "intro": "AP30-N1 gör drönaren till ett verktyg som kan gripa, lyfta och arbeta i luften, inte bara filma. Armen bygger på Wissons Pliabot-teknik: mjuka bioniska muskler med pneumatisk drivning som både böjer sig 360 grader och teleskoperar. Den väger 8 kg och lyfter 15 kg rakt upp, alltså nästan dubbla sin egen vikt. Verktyget byts på plats utan verktyg, så samma arm klarar gripning, provtagning, sprutning och kontaktmätning under en och samma flygning.",
    "usp": [
      "Lyfter 15 kg vid 8 kg egenvikt",
      "360° böjning kombinerat med teleskopisk räckvidd",
      "60 W i drift och 0 W när armen håller sin position",
      "Verktygsbyte i ett steg, gripdon eller vision-modul",
      "Testad ned till -40 °C, med skydd mot vatten, damm och korrosion",
    ],
    "usecase": "Byggd för DJI FC30, med stöd för anpassning till andra plattformar. Används för underhåll i energianläggningar, räddningsinsatser, infrastrukturinspektion, logistik och lantbruk.",
  },
  "AP3-G1": {
    "intro": "AP3-G1 är ett mjukt gripdon för DJI M300 och M350. Klon är byggd i flexibla material med bionisk struktur, vilket gör att den formar sig efter oregelbundna föremål i stället för att kräva en plan yta. Greppkraften styrs steglöst och visas i realtid på skärmen, så operatören ser exakt hur hårt det hålls. När greppet sitter låser det sig mekaniskt och drar noll ström — föremålet kan inte lossna under flygning även om strömmen bryts.",
    "usp": [
      "2 kg maxlast med självlåsning utan strömförbrukning",
      "Anpassar greppet efter oregelbundna föremål",
      "Greppkraften styrs och visas i realtid",
      "Dubbla kameror för exakt positionering",
      "Monteras på 30 sekunder, styrs från DJI-kontrollen",
    ],
    "usecase": "För blåljus, räddningstjänst och sjukvårdstransport där små föremål behöver hämtas eller levereras exakt, ofta upprepade gånger under samma insats.",
  },
  "AP30-G2": {
    "intro": "AP30-G2 flyttar tung last dit marken inte bär. Systemet är integrerat med DJI FC30:s flygkontroll och hisssystem, greppar upp till 40 kg och kan sänka ned lasten på lina från 100 meters höjd. Drönaren känner av lasten automatiskt och operatören placerar den med AR-positionering direkt i kontrollbilden. Utlösningen är aktiv, alltså styrd på kommando i stället för att lasten släpps när linan slaknar — det ger kontrollerad, skonsam avlämning nära marken.",
    "usp": [
      "40 kg last med stabilt grepp",
      "100 meters hisshöjd, linlängden anpassas efter uppdraget",
      "AR-positionering för precis avlämning",
      "Aktiv utlösning styrd på kommando",
      "Riggad på 3 minuter tack vare modulär uppbyggnad",
    ],
    "usecase": "För geoteknik, räddningsinsatser, kraftnätsunderhåll och byggnation på svåråtkomlig mark — stup, raserade vägar och kraftledningsstolpar.",
  },
  "AP3-P1": {
    "intro": "AP3-P1 är en sprutmodul för DJI M300 och M350, byggd för lätta plattformar och trånga utrymmen. Munstycket sitter på en led med flera frihetsgrader och sprutar åt alla håll, så konvexa och oregelbundna ytor täcks utan blinda fläckar. Den mjuka upphängningen dämpar både pendling under flygning och en eventuell kollision, vilket skyddar drönaren. Behållaren rymmer 2 liter och byts under drift; modulen fälls ihop till 0,7 meter för transport.",
    "usp": [
      "Sprutar åt alla håll, även i trånga utrymmen",
      "2 liters behållare som byts snabbt",
      "Mjuk upphängning dämpar pendling och kollision",
      "FPV med långt fokus för exakt sikte och mindre spill",
      "Vatten, olja, färg, kylvätska och rostskydd",
      "Fälls till 0,7 m för transport",
    ],
    "usecase": "För energi, elnät och byggnation. Flyg och sprutning styrs från samma DJI-kontroll, och anpassning till andra flygplattformar går att beställa.",
  },
  "AP3-P3": {
    "intro": "AP3-P3 är ett slangmatat tvättsystem för DJI M400 som rengör fasader och höga konstruktioner utan att skada ytan. Det arbetar med medicinskt rent vatten genom Wissons dubbelpatenterade DIC-vattenrening, vilket betyder att ytan torkar utan ränder och att inga kemikalier hamnar i marken. Pliabot-lederna bär en 40 graders solfjäderformad gummiskrapa och låter munstycket vinklas 60 grader i höjdled, så drönaren kan arbeta tätt intill ytan i stället för att spruta på avstånd.",
    "usp": [
      "40° solfjäderformad Pliabot-skrapa",
      "60° vertikal vinkling av sprutbilden",
      "Rent vatten utan kemikalier, torkar utan ränder",
      "Dubbelpatenterad DIC-vattenrening",
      "Slangmatat, alltså ingen tankbegränsning i luften",
    ],
    "usecase": "För fasadtvätt och höghöjdsrengöring där ställning eller lift annars krävs. Anpassad för DJI M400.",
  },
  "AP30-P4": {
    "intro": "AP30-P4 är en dimsprutningsmodul för höghöjdsarbete. Pliabot-leden har taktil avkänning och dämpar pendling aktivt, vilket håller drönaren stabil även när sprutstrålen ger rekyl, och gör en kontakt med ytan ofarlig i stället för att slå ut flygningen. Atomiseringen är konstruerad för att lägga ett jämnt skikt utan överskott — vätskan rinner inte och droppar inte ned från arbetsytan.",
    "usp": [
      "Taktil Pliabot-led som dämpar pendling",
      "Kollision mot ytan är ofarlig",
      "Stora arbetsvinklar för komplexa former",
      "Atomisering som minskar överskott och dropp",
    ],
    "usecase": "För vindkraftverk, broar, isolatorer, väggar och master. Kompatibel med ledande industridrönare — bekräfta plattform med oss innan beställning.",
  },
  "AP30-P4H": {
    "intro": "AP30-P4H är högtrycksvarianten i P-serien, för rengöring och sprutning där dimsprutning inte räcker. Samma taktila Pliabot-led som i AP30-P4 håller drönaren stabil och gör kontakt med arbetsytan ofarlig. Arbetsenheterna är modulära, så samma bärare kan användas för olika arbetsmoment och kravnivåer i stället för att kräva en egen rigg per uppgift.",
    "usp": [
      "Högtryck för rengöring och sprutning",
      "Taktil Pliabot-led som dämpar pendling",
      "Stora arbetsvinklar med fin justering",
      "Modulära arbetsenheter för flera uppgifter",
    ],
    "usecase": "För vindkraftverk, solpaneler, isolatorer, väggar och master. Kompatibel med ledande industridrönare — bekräfta plattform med oss innan beställning.",
  },
  "AP3-D1": {
    "intro": "AP3-D1 gör kontaktmätning från luften möjlig. Modulen arbetar i sidled ut från drönaren och trycker en givare mot ytan med upp till 20 newton i 30 sekunder, medan den mjuka upphängningen dämpar anslaget och håller drönaren i balans. Kraften visas i realtid och kan justeras under pågående mätning. En inbyggd sprutfunktion väter ytan innan mätning och kan märka upp mätpunkter med färg för dokumentation.",
    "usp": [
      "20 N kontaktkraft i upp till 30 sekunder",
      "Kraftåterkoppling i realtid, justerbar under mätning",
      "Mjuk upphängning som håller balansen vid sidoarbete",
      "Inbyggd sprutning för vätning och färgmarkering",
      "Modulbyte på under 1 minut",
      "Fälls i Z-form till 0,8 m",
    ],
    "usecase": "För byggnadsprovning, brokontroll och vindkraftsunderhåll. Integrerad med DJI M300 och M350, med stöd för fler plattformar på beställning.",
  },
  "AP30-P2": {
    "intro": "AP30-P2 är Wissons högtryckstvätt för tunga drönare. Munstycket sitter på en led som vrids -60 till +35 grader i höjdled och ±45 grader i sidled, så en yta kan sopas av medan drönaren står stilla i luften. Tanken rymmer 30 liter, vilket räcker för stora ytor mellan påfyllningarna. En laser mäter avståndet till ytan i realtid och visar det för operatören, och sprutbanan planeras i förväg och körs automatiskt tillsammans med flygrutten. Sprutmodulen fälls ihop till en meter för transport.",
    "usp": [
      "30 liters tank för stora ytor mellan påfyllningar",
      "Munstycket vrids -60 till +35° i höjdled och ±45° i sidled",
      "Laser mäter arbetsavståndet i realtid",
      "6 meters räckvidd håller drönaren på säkert avstånd",
      "Sprutbana och flygrutt körs som ett automatiserat moment",
      "Modulära munstycken byts efter uppdrag",
      "Fälls ihop till 1 meter för transport",
    ],
    "usecase": "För rengöring av vingar på vindkraftverk, solpaneler, isolatorer, fasader, murar och torn — ytor som annars kräver ställning, lift eller reparbete.",
  },
  "AP3-P5": {
    "intro": "AP3-P5 sprutar färg från luften utan att spilla den i vinden. Runt strålen bygger modulen en luftridå som håller ihop sprutbilden, och Wisson uppger att spillet minskar med över 80 procent jämfört med sprutning utan ridå. Färgmängd och lufttryck justeras automatiskt efter avståndet till ytan, så resultatet blir jämnt även när drönaren rör sig in och ut. Färgen matas genom slang från marken, vilket ger obruten drift på stora ytor, och flödesstyrningen är anpassad till fler än tio ledande färgmärken.",
    "usp": [
      "Luftridå som enligt tillverkaren minskar spillet med över 80 %",
      "Färgmängd och lufttryck följer arbetsavståndet automatiskt",
      "Fungerar med fler än tio ledande färgmärken",
      "Slangmatad färg ger obruten drift på stora ytor",
      "Pliabot-leder och taktil AI håller modulen stabil i flykten",
    ],
    "usecase": "För målning av isolatorer, murar, fasader och torn. Lanserad som komplement till AP30-P4, som täcker de grövre sprutuppdragen.",
  },
}
