export interface EdpIndustryApplication {
  title: string;
  description: string;
}

export interface EdpIndustryProduct {
  name: string;
  tag: string;
  description: string;
  features: string[];
  collectionUrl: string;
}

export interface EdpFaqItem {
  question: string;
  answer: string;
}

export interface EdpIndustryPage {
  handle: string;
  swedishHandle: string;
  title: string;
  titleEn: string;
  shortDesc: string;
  heroTitle: string;
  heroDesc: string;
  intro: string;
  templateSuffix: string;
  applications: EdpIndustryApplication[];
  recommendedProducts: EdpIndustryProduct[];
  benefits: string[];
  faq: EdpFaqItem[];
  relatedCollections: Array<{ label: string; url: string }>;
  metaTitle: string;
  metaDescription: string;
}

export const EDP_INDUSTRY_PAGES: EdpIndustryPage[] = [
  {
    handle: "energy-infrastructure",
    swedishHandle: "energi-infrastruktur",
    title: "Energi & Infrastruktur",
    titleEn: "Energy & Infrastructure",
    shortDesc: "Inspektion av kraftledningar, vindkraft och anläggningar.",
    heroTitle: "Drönarlösningar för energi & infrastruktur",
    heroDesc:
      "Inspektera kraftledningar, transformatorstationer, vindkraftverk och solparker säkert och effektivt — utan driftstopp, ställningar eller helikopter.",
    intro:
      "Energisektorn står inför ökande krav på tillförlitlighet, säkerhet och kostnadseffektivitet. Professionella enterprise-drönare med termisk kamera, högupplöst zoom och RTK-positionering gör det möjligt att upptäcka fel innan de leder till strömavbrott eller haverier. EuroDroneParts levererar kompletta lösningar med DJI Matrice-serien, Zenmuse-sensorer och tillbehör anpassade för energi- och infrastrukturinspektion.",
    templateSuffix: "industry",
    applications: [
      {
        title: "Kraftledningsinspektion",
        description:
          "Automatiserad inspektion av transmissions- och distributionsnät med termisk kamera och zoom. Identifiera skadade isolatorer, vegetation nära ledningar och mekaniska defekter utan att personal behöver klättra i master.",
      },
      {
        title: "Transformator- och ställverksinspektion",
        description:
          "Termisk avbildning av transformatorer, kopplingsstationer och ställverk avslöjar hotspots, dåliga anslutningar och överbelastade komponenter — ofta innan de syns visuellt.",
      },
      {
        title: "Vindkraftsinspektion",
        description:
          "Bladinspektion med AI-assisterad skadeklassificering minskar stilleståndstid. Automatiserade flygmönster runt turbinblad ger repeterbara resultat och historisk jämförelse över tid.",
      },
      {
        title: "Solparksinspektion",
        description:
          "Storskalig termisk analys av solcellsparker identifierar defekta moduler, hotspots och anslutningsfel. Täck MW-anläggningar på timmar istället för veckor.",
      },
      {
        title: "Infrastruktur & anläggningar",
        description:
          "Inspektion av broar, dammar, rörledningar och industriella anläggningar. Dokumentera tillstånd, upptäck korrosion och planera underhåll utan att stoppa produktionen.",
      },
    ],
    recommendedProducts: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Flaggskepp för energiinspektion",
        description:
          "Den mest använda enterprise-plattformen i energisektorn. IP55-skydd, 55 min flygtid och stöd för termisk, zoom och LiDAR-sensorer.",
        features: ["55 min flygtid", "IP55 väderskydd", "RTK-precision", "Multi-sensor"],
        collectionUrl: "/collections/dji-matrice-series",
      },
      {
        name: "Zenmuse H30T",
        tag: "Termisk + zoom",
        description:
          "Kombinerad wide, zoom och termisk kamera i ett. Idealisk för ledningsinspektion och transformatorövervakning med upp till 200× digital zoom.",
        features: ["Termisk 1280×1024", "56× optisk zoom", "Laseravståndsmätare", "Nattläge"],
        collectionUrl: "/collections/enterprise-sensors",
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb inspektion",
        description:
          "Kompakt drönare med termisk kamera för snabba inspektioner av enskilda master, transformatorer och mindre anläggningar.",
        features: ["45 min flygtid", "Termisk kamera", "RTK-modul", "Portabel"],
        collectionUrl: "/collections/dji-mavic-enterprise-series",
      },
    ],
    benefits: [
      "Inspektera utan driftstopp — inga avbrott i elproduktion eller distribution",
      "70–80 % lägre kostnad jämfört med helikopterinspektion",
      "Termisk detektion hittar fel veckor innan de orsakar haveri",
      "Repeterbara inspektionsrutter med RTK-precision och automatiserade rapporter",
      "Minska arbetsmiljörisker — ingen klättring i master eller arbete på höjd",
    ],
    faq: [
      {
        question: "Kan drönare inspektera kraftledningar under drift?",
        answer:
          "Ja. En av de största fördelarna är att inspektionen kan ske utan driftstopp. Med rätt utrustning och certifierad operatör flyger drönaren säkert i närheten av ledningar utan risk för personskada.",
      },
      {
        question: "Vilken drönare passar bäst för energiinspektion?",
        answer:
          "DJI Matrice 350 RTK med Zenmuse H30T är branschstandard för kraftledningar och transformatorer. För snabbare inspektioner av enskilda objekt räcker DJI Mavic 3 Enterprise med termisk kamera.",
      },
      {
        question: "Hur ofta bör energiinfrastruktur inspekteras med drönare?",
        answer:
          "Vi rekommenderar årlig inspektion av kraftledningar och transformatorer, med extra flygning efter stormar, extrema väderförhållanden eller vid misstanke om skada.",
      },
      {
        question: "Vilka regelverk gäller för drönarflygning vid energianläggningar?",
        answer:
          "I Sverige krävs normalt Specific-kategori enligt EASA, operatörsregistrering och ofta tillstånd från nätägare. EuroDroneParts hjälper er med rätt utrustning och kan förmedla kontakt med certifierade operatörer.",
      },
      {
        question: "Kan termisk kamera hitta dolda fel i transformatorer?",
        answer:
          "Ja. Termisk drönarinspektion avslöjar överbelastade komponenter, dåliga anslutningar och isolationsfel som inte syns med blotta ögat — ofta månader innan de orsakar haveri.",
      },
    ],
    relatedCollections: [
      { label: "Enterprise-drönare", url: "/collections/enterprise-drones" },
      { label: "Zenmuse & sensorer", url: "/collections/enterprise-sensors" },
      { label: "DJI Matrice-serien", url: "/collections/dji-matrice-series" },
      { label: "Enterprise-tillbehör", url: "/collections/enterprise-accessories" },
    ],
    metaTitle: "Drönare för energi & infrastruktur | EuroDroneParts",
    metaDescription:
      "Professionella drönarlösningar för inspektion av kraftledningar, vindkraft, solparker och energianläggningar. Termisk kamera, RTK och enterprise-utrustning.",
  },
  {
    handle: "gis-mapping",
    swedishHandle: "gis-kartlaggning",
    title: "Kartläggning & GIS",
    titleEn: "GIS & Mapping",
    shortDesc: "Geodata, mätning och GIS-arbetsflöden med UAV.",
    heroTitle: "Drönarlösningar för kartläggning & GIS",
    heroDesc:
      "Skapa exakta ortomosaiker, 3D-modeller och terrängmodeller med centimeterprecision. Snabbare och mer kostnadseffektivt än traditionell landmätning.",
    intro:
      "Drönarbaserad kartläggning har revolutionerat hur geodata samlas in. Med RTK-positionering, LiDAR och fotogrammetri kan du skapa ortomosaiker, digitala terrängmodeller (DTM/DSM) och punktmoln med noggrannhet som matchar traditionell landmätning — men på en bråkdel av tiden. EuroDroneParts erbjuder kompletta kartläggningslösningar med DJI Matrice, Zenmuse LiDAR och mjukvaruintegration mot Pix4D, DJI Terra och ArcGIS.",
    templateSuffix: "industry",
    applications: [
      {
        title: "Fotogrammetri & 3D-modellering",
        description:
          "Skapa fotorealistiska 3D-modeller och ortomosaiker med centimeterprecision. Perfekt för byggdokumentation, fastighetsinventering och kulturarvsdigitalisering.",
      },
      {
        title: "LiDAR-kartläggning",
        description:
          "Punktmoln med hög densitet genom vegetation och i skuggade områden. Zenmuse L2 ger upp till 5 cm vertikal noggrannhet för infrastruktur- och skogskartläggning.",
      },
      {
        title: "Volymberäkning",
        description:
          "Mät stockhögar, grushögar, schakt och materialupplag med noggrannhet inom 1–2 %. Ersätt tidskrävande manuell mätning med flygningar på minuter.",
      },
      {
        title: "Terrängmodeller (DTM/DSM)",
        description:
          "Digitala terrängmodeller för vägplanering, dagvattenhantering, massbalans och exploateringsprojekt. Export i standard GIS-format.",
      },
      {
        title: "BIM & bygguppföljning",
        description:
          "Jämför byggprojekt mot BIM-modell med regelbundna drönarflygningar. Identifiera avvikelser tidigt och dokumentera as-built med punktmoln i IFC-format.",
      },
    ],
    recommendedProducts: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Professionell kartläggning",
        description:
          "Tung plattform med RTK, lång flygtid och stöd för LiDAR och fotogrammetrikameror. Branschstandard för professionell mätning.",
        features: ["55 min flygtid", "RTK-precision", "LiDAR-stöd", "IP55"],
        collectionUrl: "/collections/dji-matrice-series",
      },
      {
        name: "Zenmuse L2 LiDAR",
        tag: "LiDAR-payload",
        description:
          "Integrerad LiDAR och RGB-kamera med IMU och RTK. Genererar georefererade punktmoln med upp till 5 cm noggrannhet.",
        features: ["5 cm vertikal noggrannhet", "450 m räckvidd", "240 000 pts/s", "Inbyggd RGB"],
        collectionUrl: "/collections/enterprise-sensors",
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb kartläggning",
        description:
          "Kompakt drönare med mekanisk slutare och RTK för effektiv kartläggning av mindre områden och snabba uppdrag.",
        features: ["45 min flygtid", "Mekanisk slutare", "RTK-modul", "4/3 CMOS"],
        collectionUrl: "/collections/dji-mavic-enterprise-series",
      },
    ],
    benefits: [
      "90 % tidsbesparing jämfört med traditionell landmätning",
      "Centimeterprecision med RTK — 1–3 cm horisontellt och vertikalt",
      "Kartlägg 50–100 hektar per dag beroende på upplösning",
      "Export till GeoTIFF, LAS/LAZ, DXF/DWG, OBJ och IFC",
      "Sömlös integration med Pix4D, DJI Terra, Agisoft och ArcGIS",
    ],
    faq: [
      {
        question: "Hur exakt är drönarbaserad kartläggning?",
        answer:
          "Med RTK-positionering uppnås centimeterprecision (1–3 cm) horisontellt och vertikalt. Med LiDAR (Zenmuse L2) kan vertikal noggrannhet ner till 5 cm uppnås, även genom vegetation.",
      },
      {
        question: "Vilka filformat kan jag exportera till?",
        answer:
          "Vi stödjer branschstandarder: GeoTIFF, LAS/LAZ (punktmoln), OBJ/FBX (3D-modeller), DXF/DWG (CAD) och IFC (BIM). Data bearbetas i Pix4D, DJI Terra eller Agisoft Metashape.",
      },
      {
        question: "Kan drönardata ersätta traditionell landmätning?",
        answer:
          "För topografikartor, volymberäkningar och terrängmodeller — ja. För juridiskt bindande gränsmätning krävs fortfarande auktoriserad lantmätare, men drönardata är utmärkt som underlag.",
      },
      {
        question: "Vad är skillnaden mellan fotogrammetri och LiDAR?",
        answer:
          "Fotogrammetri skapar 3D-modeller från överlappande bilder — kostnadseffektivt och fotorealistiskt. LiDAR mäter avstånd med laser och fungerar genom vegetation och i mörker, men ger inte färgade texturer.",
      },
      {
        question: "Behöver jag RTK-basstation?",
        answer:
          "För mätningskvalitet rekommenderas RTK. DJI D-RTK 2 basstation ger centimeterprecision utan SWEPOS. Många operatörer använder även nätverks-RTK (NTRIP).",
      },
    ],
    relatedCollections: [
      { label: "Kartläggningsdrönare", url: "/collections/mapping-survey-drones" },
      { label: "Enterprise-sensorer & LiDAR", url: "/collections/enterprise-sensors" },
      { label: "DJI Matrice-serien", url: "/collections/dji-matrice-series" },
      { label: "RTK & tillbehör", url: "/collections/enterprise-accessories" },
    ],
    metaTitle: "Drönare för kartläggning & GIS | EuroDroneParts",
    metaDescription:
      "Professionella UAV-lösningar för geodata, fotogrammetri, LiDAR och GIS-arbetsflöden. RTK-precision, 3D-modeller och volymberäkning.",
  },
  {
    handle: "emergency-services",
    swedishHandle: "raddningstjanst",
    title: "Räddningstjänst",
    titleEn: "Emergency Services",
    shortDesc: "Sök- och räddningsinsatser samt krisledning med UAV.",
    heroTitle: "Drönarlösningar för räddningstjänst",
    heroDesc:
      "Ge insatsledning omedelbar överblick vid bränder, olyckor och eftersökningar. Termisk kamera, spotlight och högtalare — flygklar på under 60 sekunder.",
    intro:
      "Vid räddningsinsatser räknas varje sekund. Enterprise-drönare ger insatsledningen realtidsöverblick, termisk persondetektion i mörker och rök, samt kommunikation via högtalare och spotlight. EuroDroneParts levererar utrustning som används av räddningstjänst, polis och krisledning i hela Norden — från kompakta Mavic 3 Enterprise till fullskaliga Matrice 350 RTK med termisk zoom.",
    templateSuffix: "industry",
    applications: [
      {
        title: "Brand & rökdykning",
        description:
          "Termisk överblick genom rök identifierar hotspots och personer. Ge brandmän vägledning innan de går in i byggnaden och övervaka spridningsriktning i realtid.",
      },
      {
        title: "Sök- och räddningsinsatser (SAR)",
        description:
          "Termisk kamera hittar personer i mörker, tät vegetation och vatten. Täck stora sökområden på bråkdelen av tiden jämfört med markpatrull.",
      },
      {
        title: "Trafikolyckor & incidenthantering",
        description:
          "Snabb överblick vid olycksplatser. Dokumentera skadeomfattning, dirigera trafik och stöd insatsledning med livevideo till ledningscentral.",
      },
      {
        title: "Naturkatastrofer & krisledning",
        description:
          "Kartlägg översvämningsområden, jordskred och stormskador. Stöd krisledning med georefererad bild- och videodokumentation för beslutsunderlag.",
      },
      {
        title: "Farlig miljö & CBRN",
        description:
          "Inspektera farliga områden utan att utsätta personal. Gasdetektering, termisk övervakning och luftprovtagning med specialiserade sensorer.",
      },
    ],
    recommendedProducts: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Professionell räddningsinsats",
        description:
          "Lång flygtid, IP55-skydd och stöd för termisk zoom, spotlight och högtalare. Tål regn, vind och krävande insatsmiljöer.",
        features: ["55 min flygtid", "IP55", "Termisk + zoom", "Multi-payload"],
        collectionUrl: "/collections/dji-matrice-series",
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb utryckning",
        description:
          "Kompakt och portabel — flygklar på under 60 sekunder. Termisk kamera, spotlight och högtalare i ett paket.",
        features: ["45 min flygtid", "Termisk kamera", "Spotlight", "Högtalare"],
        collectionUrl: "/collections/dji-mavic-enterprise-series",
      },
      {
        name: "Zenmuse H30T",
        tag: "Termisk sökning",
        description:
          "Kraftfull termisk sensor med 1280×1024 upplösning och 56× zoom. Identifierar värmesignaturer på hundratals meters avstånd.",
        features: ["Termisk 1280×1024", "56× zoom", "Persondetektion", "Nattläge"],
        collectionUrl: "/collections/enterprise-sensors",
      },
    ],
    benefits: [
      "Flygklar på under 60 sekunder — kritisk vid tidskänsliga insatser",
      "Termisk detektion dygnet runt, oavsett ljusförhållanden",
      "Täck stora sökområden 10× snabbare än markpatrull",
      "Realtidsvideo till insatsledning och ledningscentral",
      "Minska risken för insatspersonal i farliga miljöer",
    ],
    faq: [
      {
        question: "Hur snabbt kan en räddningsdrönare vara i luften?",
        answer:
          "Med DJI Mavic 3 Enterprise kan du vara flygklar på under 60 sekunder. Med DJI Dock 2 (automatisk dockningsstation) kan drönaren lyfta automatiskt vid larm på under 30 sekunder.",
      },
      {
        question: "Fungerar termisk kamera i rök och mörker?",
        answer:
          "Ja. Termisk kamera detekterar värmesignaturer oberoende av synligt ljus. I rök kan den identifiera hotspots och personer som inte syns med vanlig kamera. Zenmuse H30T har upplösning 1280×1024.",
      },
      {
        question: "Vilka regelverk gäller för räddningstjänstens drönarflygning?",
        answer:
          "Räddningstjänst kan ofta flyga under Specific-kategori med förenklat tillstånd vid akuta insatser. Krav på operatörsutbildning och registrering gäller fortfarande. EuroDroneParts hjälper med rätt utrustning och dokumentation.",
      },
      {
        question: "Kan drönaren kommunicera med personer på marken?",
        answer:
          "Ja. DJI Mavic 3 Enterprise Speaker och Matrice-serien med CZI-högtalare möjliggör livekommunikation och förinspelade meddelanden under pågående insats.",
      },
      {
        question: "Hur lång räckvidd har drönaren under insats?",
        answer:
          "DJI Matrice 350 RTK har upp till 20 km transmissionsräckvidd med O3 Enterprise. Operativ räckvidd begränsas av lokala flygbestämmelser och insatsledningens krav på visuell kontakt (VLOS/BVLOS).",
      },
    ],
    relatedCollections: [
      { label: "Enterprise-drönare", url: "/collections/enterprise-drones" },
      { label: "Termiska sensorer", url: "/collections/enterprise-sensors" },
      { label: "Spotlight & högtalare", url: "/collections/enterprise-lighting" },
      { label: "Enterprise-tillbehör", url: "/collections/enterprise-accessories" },
    ],
    metaTitle: "Drönare för räddningstjänst & SAR | EuroDroneParts",
    metaDescription:
      "Enterprise-drönare för sök- och räddningsinsatser, brand, krisledning och SAR. Termisk kamera, spotlight och snabb utryckning.",
  },
];

export function getEdpIndustryByHandle(handle: string): EdpIndustryPage | undefined {
  return EDP_INDUSTRY_PAGES.find(
    (p) => p.handle === handle || p.swedishHandle === handle,
  );
}
