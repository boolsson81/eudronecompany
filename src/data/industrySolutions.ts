import {
  HardHat,
  Zap,
  Factory,
  Wheat,
  ShieldAlert,
  Truck,
  Ship,
  Mountain,
  Leaf,
  Clapperboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IndustrySolution as SolutionItem, DroneProduct } from "./commercialDroneIndustries";
import type { FaqItem } from "@/lib/faqJsonLd";

/**
 * Branschlösningar — en bredare "efter kundens bransch"-taxonomi som
 * kompletterar de användningsområden (INDUSTRY_DATA) som redan finns i
 * commercialDroneIndustries.ts. Detta är en mall: bara `slug`, `icon`,
 * `title`, `titleEn` och `omfattar` krävs — resten fylls i allt eftersom
 * varje bransch får eget innehåll (se "infrastruktur-bygg" nedan för hur
 * en fullt utbyggd post ser ut).
 */
export interface IndustrySolutionVertical {
  slug: string;
  icon: LucideIcon;
  title: string;
  titleEn: string;
  omfattar: string[];
  heroTitle?: string;
  heroDesc?: string;
  solutions?: SolutionItem[];
  recommendedDrones?: DroneProduct[];
  benefits?: string[];
  faq?: FaqItem[];
}

export const INDUSTRY_SOLUTIONS: IndustrySolutionVertical[] = [
  {
    slug: "infrastruktur-bygg",
    icon: HardHat,
    title: "Infrastruktur & Bygg",
    titleEn: "Infrastructure & Construction",
    omfattar: ["Bygg", "Fastigheter", "Vägar", "Broar", "Tunnlar", "Anläggningar"],
    heroTitle: "Drönare för Infrastruktur & Bygg",
    heroDesc: "Följ byggprojekt från schakt till slutbesiktning, inspektera vägar, broar och tunnlar, och beräkna massor med centimeterprecision — utan ställning, avstängningar eller stillestånd.",
    solutions: [
      {
        slug: "byggplatsuppfoljning",
        title: "Byggplatsuppföljning",
        desc: "Regelbunden flygdokumentation som följer projektet från schakt till slutbesiktning.",
        longDesc: "Med återkommande drönarflygningar över byggarbetsplatsen får projektledning, beställare och entreprenörer samma bild av läget varje vecka. Ortomosaiker och 3D-modeller jämförs mot tidplan och BIM-modell, vilket gör avvikelser synliga innan de blir dyra.",
        seoTitle: "Byggplatsuppföljning med Drönare — Framdrift & BIM | EU Drone Company",
        seoDesc: "Följ byggprojekt från luften med regelbundna drönarflygningar. Ortomosaik, 3D-modell och jämförelse mot BIM. Kontakta EU Drone Company.",
        useCases: [
          "Veckovis framdriftsrapportering till beställare",
          "Jämförelse av utfört arbete mot tidplan och BIM-modell",
          "Dokumentation inför besiktning och garantiärenden",
          "Tidslaps och marknadsföringsmaterial för pågående projekt",
        ],
        keyFeatures: [
          "Automatiserade flygrutter med samma position varje gång",
          "Ortomosaik och 3D-modell efter varje flygning",
          "Export till BIM/CAD för avvikelsejämförelse",
          "Molnbaserad delning med beställare och entreprenörer",
        ],
      },
      {
        slug: "bro-tunnelinspektion",
        title: "Bro- & tunnelinspektion",
        desc: "Inspektera undersidor, valv och svårtillgängliga konstruktioner utan liftar eller trafikavstängning.",
        longDesc: "Broar och tunnlar har konstruktionsdetaljer som är svåra och riskfyllda att nå manuellt. Drönare med zoom- och termisk kamera inspekterar undersidor, landfästen, valv och betongytor utan lift, ställning eller långvariga trafikavstängningar.",
        seoTitle: "Bro- & Tunnelinspektion med Drönare | EU Drone Company",
        seoDesc: "Inspektera broar och tunnlar med drönare — undersidor, valv och landfästen utan lift eller avstängning. Kontakta EU Drone Company.",
        useCases: [
          "Periodisk statusbesiktning av broar och viadukter",
          "Sprickkartering och betongskadeanalys",
          "Tunnelinspektion av valv, installationer och dränering",
          "Dokumentation efter olyckor eller extremväder",
        ],
        keyFeatures: [
          "Uppåtriktad och sidledes flygning i trånga utrymmen",
          "Zoom och termisk kamera för sprick- och fuktanalys",
          "Minimal störning av trafik under inspektion",
          "Rapporter georefererade till konstruktionsritningar",
        ],
      },
      {
        slug: "vaginspektion",
        title: "Väg- & beläggningsinspektion",
        desc: "Kartlägg vägnät, beläggningsskador och dräneringsproblem snabbare än med manuell besiktning.",
        longDesc: "Drönare kartlägger längre vägsträckor på en bråkdel av tiden jämfört med manuell besiktning till fots eller bil. Högupplösta ortomosaiker avslöjar sprickor, spårbildning och dräneringsproblem längs hela sträckan, med exakt lägesangivelse för varje skada.",
        seoTitle: "Väginspektion med Drönare — Beläggning & Dränering | EU Drone Company",
        seoDesc: "Kartlägg vägar och beläggning med drönare. Hitta sprickor, spårbildning och dräneringsproblem snabbt. Kontakta EU Drone Company.",
        useCases: [
          "Tillståndsbedömning av kommunala och statliga vägnät",
          "Beläggningsanalys inför underhållsplanering",
          "Dräneringskontroll längs vägbanan",
          "Dokumentation vid garantibesiktning av nya vägar",
        ],
        keyFeatures: [
          "Snabb kartläggning av långa sträckor",
          "Georefererad skadekartering med exakt position",
          "Jämförelse över tid för underhållsprioritering",
          "Export till vägförvaltningens GIS-system",
        ],
      },
      {
        slug: "markarbeten-volymberakning",
        title: "Markarbeten & volymberäkning",
        desc: "Beräkna schakt-, fyllnads- och materialvolymer med drönare istället för manuell mätning.",
        longDesc: "Vid schaktning, markutjämning och materialupplag ger drönarbaserad volymberäkning exakta resultat på minuter istället för dagar. Jämför utfört mot projekterat och håll koll på massbalansen genom hela projektet.",
        seoTitle: "Volymberäkning för Markarbeten med Drönare | EU Drone Company",
        seoDesc: "Beräkna schakt- och fyllnadsvolymer med drönare. Exakt massbalans för byggprojekt. Kontakta EU Drone Company för offert.",
        useCases: [
          "Massbalansberäkning vid schaktning och markutjämning",
          "Uppföljning av materialupplag på byggarbetsplats",
          "Jämförelse mellan projekterad och utförd markmodell",
          "Fakturaunderlag för mängdreglering",
        ],
        keyFeatures: [
          "Noggrannhet inom 1–2 % av verklig volym",
          "RTK-precision för exakta markmodeller",
          "Automatisk volymrapport efter varje flygning",
          "Historisk jämförelse mellan flygningar",
        ],
      },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Professionell byggplats & anläggning",
        desc: "RTK-precision och stöd för zoom-, termisk- och LiDAR-payload för allt från volymberäkning till broinspektion.",
        features: ["55 min flygtid", "IP55 väderskydd", "RTK-precision", "LiDAR-stöd"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb byggplatsuppföljning",
        desc: "Kompakt och snabbt redo för veckovisa flygningar över byggarbetsplatsen — mekanisk slutare och RTK-modul.",
        features: ["45 min flygtid", "Mekanisk slutare", "RTK-modul", "56× hybridzoom"],
      },
    ],
    benefits: [
      "90 % snabbare uppföljning jämfört med manuell mätning och besiktning",
      "Inspektera broar, tunnlar och tak utan lift, ställning eller trafikavstängning",
      "Centimeterprecision i volymberäkningar och markmodeller",
      "Dokumentation som håller för besiktning, garantiärenden och tvister",
    ],
    faq: [
      {
        question: "Behöver vi flygtillstånd nära vägar och broar?",
        answer: "Ja, flygning nära trafikerad infrastruktur kan kräva tillstånd från väghållaren och hänsyn till Transportstyrelsens regelverk. EU Drone Company hanterar tillstånd och riskbedömning inför varje uppdrag.",
      },
      {
        question: "Hur ofta bör en byggarbetsplats flygas över?",
        answer: "De flesta projekt följs upp veckovis eller varannan vecka, men frekvensen anpassas efter projektfas — tätare vid kritiska moment som schaktning eller gjutning.",
      },
      {
        question: "Kan drönardata ersätta traditionell lantmätning på byggarbetsplatsen?",
        answer: "För volymberäkningar, framdriftsuppföljning och markmodeller — ja. För juridiskt bindande gränsmätning och utsättning krävs fortfarande en auktoriserad lantmätare.",
      },
      {
        question: "Hur inspekteras undersidan av en bro utan att stänga av trafiken?",
        answer: "Drönaren flyger under och runt brokonstruktionen från vattnet, marken eller sidan, utan att beröra eller belasta konstruktionen. I de flesta fall behövs ingen eller endast kortvarig trafikpåverkan." ,
      },
    ],
  },
  {
    slug: "energi-forsorjning",
    icon: Zap,
    title: "Energi & Försörjning",
    titleEn: "Energy & Utilities",
    omfattar: ["El", "Kraft", "Vatten", "VA", "Fjärrvärme", "Vindkraft"],
    heroTitle: "Drönare för Energi & Försörjning",
    heroDesc: "Inspektera elnät, vattenverk, fjärrvärmenät och vindkraftsparker utan driftstopp — med termisk och visuell dokumentation som håller för underhållsplanering och tillsyn.",
    solutions: [
      {
        slug: "elnatsinspektion",
        title: "Elnätsinspektion",
        desc: "Inspektera regionnät och lokalnät — stolpar, ledningar och transformatorstationer — utan att bryta strömmen.",
        longDesc: "Nätägare behöver löpande koll på stolpar, ledningar och stationer över stora geografiska områden. Drönare med zoom- och termisk kamera inspekterar hela sträckor på en bråkdel av tiden jämfört med manuell besiktning, och upptäcker skadade isolatorer, växtlighet nära ledningar och överhettade komponenter innan de orsakar avbrott.",
        seoTitle: "Elnätsinspektion med Drönare — Region- & Lokalnät | EU Drone Company",
        seoDesc: "Inspektera elnät med drönare utan driftstopp. Termisk och visuell kontroll av stolpar, ledningar och stationer. Kontakta EU Drone Company.",
        useCases: [
          "Periodisk nätinspektion för regionala och lokala nätägare",
          "Stormberedskap och skadeinventering efter extremväder",
          "Vegetationskontroll längs ledningsgator",
          "Dokumentation inför myndighetstillsyn",
        ],
        keyFeatures: [
          "Automatiserade flygrutter längs ledningssträckor",
          "Termisk hotspot-detektion på stationer och komponenter",
          "200× zoom för isolator- och anslutningsdetaljer",
          "Georefererade avvikelserapporter till underhållssystem",
        ],
      },
      {
        slug: "vattenverk-va-inspektion",
        title: "VA- & vattenverksinspektion",
        desc: "Inspektera dammar, reservoarer, vattentorn och ledningsnät utan att tömma anläggningen eller stänga av leveransen.",
        longDesc: "VA-anläggningar har konstruktioner som är svåra att komma åt utan avstängning eller dykinsats — dammkrön, reservoartak, vattentorn och kulvertar. Drönare dokumenterar tillståndet visuellt och termiskt utan att påverka driften, vilket gör periodisk tillsyn både snabbare och säkrare.",
        seoTitle: "VA- & Vattenverksinspektion med Drönare | EU Drone Company",
        seoDesc: "Inspektera dammar, reservoarer och vattentorn med drönare utan driftpåverkan. Kontakta EU Drone Company för VA-inspektion.",
        useCases: [
          "Dammsäkerhetsinspektion och krönkontroll",
          "Reservoar- och vattentornsbesiktning",
          "Läcksökning i ledningsnät med termisk kamera",
          "Dokumentation inför tillsyn och dammsäkerhetsklassificering",
        ],
        keyFeatures: [
          "Inspektion utan avstängning eller dykinsats",
          "Termisk kamera för fukt- och läckagedetektion",
          "Högupplöst dokumentation av betong- och tätskikt",
          "Historisk jämförelse mellan inspektionstillfällen",
        ],
      },
      {
        slug: "fjarrvarmeinspektion",
        title: "Fjärrvärmeinspektion",
        desc: "Hitta läckor och värmeförluster i fjärrvärmenätet med termisk kartläggning ovanifrån.",
        longDesc: "Läckor och isoleringsbrister i fjärrvärmenätet syns ofta som temperaturavvikelser i marken ovanför kulvertarna. Termisk drönarkartläggning täcker hela ledningssträckningar snabbt och pekar ut exakt var grävinsatser behövs, istället för att gräva blint.",
        seoTitle: "Fjärrvärmeinspektion med Drönare — Termisk Läcksökning | EU Drone Company",
        seoDesc: "Hitta läckor i fjärrvärmenätet med termisk drönarkartläggning. Minska onödiga grävinsatser. Kontakta EU Drone Company.",
        useCases: [
          "Läcksökning längs kulvertsträckningar",
          "Kartläggning av värmeförluster i äldre nätdelar",
          "Prioritering av underhållsinsatser inför renovering",
          "Uppföljning efter genomförda reparationer",
        ],
        keyFeatures: [
          "Termisk kartläggning av hela ledningssträckor",
          "Exakt positionering av avvikelser för riktade grävningar",
          "Snabbare än manuell termografi till fots",
          "Rapporter i GIS-format för nätägarens system",
        ],
      },
      {
        slug: "vindkraftsparksinspektion",
        title: "Vindkraftsparksinspektion",
        desc: "Följ upp hela vindkraftsparker — on- och offshore — med samlad status över samtliga turbiner.",
        longDesc: "För parkägare handlar inspektion inte bara om enskilda turbinblad utan om att hålla koll på en hel parks status och underhållsbehov över tid. Drönare ger regelbunden, jämförbar dokumentation av samtliga turbiner, fundament och tillfartsvägar, och kan integreras med parkens driftuppföljning.",
        seoTitle: "Vindkraftsparksinspektion med Drönare | EU Drone Company",
        seoDesc: "Inspektera hela vindkraftsparker med drönare — on- och offshore. Samlad status för underhållsplanering. Kontakta EU Drone Company.",
        useCases: [
          "Regelbunden statusuppföljning av hela parker",
          "Site-bedömning inför nyetablering eller utbyggnad",
          "Skadeinventering efter storm för hela parken samtidigt",
          "Underlag för underhållsbudget och driftuppföljning",
        ],
        keyFeatures: [
          "Samlad rapportering för samtliga turbiner i parken",
          "Planering anpassad för on- och offshore-förhållanden",
          "Jämförbar data mellan inspektionstillfällen",
          "Integration med parkens driftuppföljningssystem",
        ],
      },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Professionell nät- & anläggningsinspektion",
        desc: "Lång flygtid, IP55-skydd och stöd för termisk och zoomkamera — för elnät, VA-anläggningar och vindkraftsparker.",
        features: ["55 min flygtid", "IP55 väderskydd", "RTK-precision", "Multi-sensor"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb punktinspektion",
        desc: "Kompakt och snabbt redo för enskilda stationer, vattentorn eller turbiner utan att mobilisera större utrustning.",
        features: ["45 min flygtid", "Termisk kamera (3T)", "56× hybridzoom", "RTK-modul"],
      },
    ],
    benefits: [
      "Inspektera utan driftstopp eller avstängd leverans",
      "Termisk detektion av läckor och överhettning innan haveri",
      "Täck långa nät- och ledningssträckor på en bråkdel av tiden",
      "Samlad, jämförbar dokumentation för hela anläggningar och parker",
    ],
    faq: [
      {
        question: "Behöver vi tillstånd för att flyga nära kraftledningar och dammar?",
        answer: "Ja, flygning nära kritisk infrastruktur kräver ofta samråd med anläggningsägaren och hänsyn till Transportstyrelsens regelverk. EU Drone Company hanterar riskbedömning och tillstånd inför varje uppdrag.",
      },
      {
        question: "Kan termisk drönarinspektion ersätta manuell termografi?",
        answer: "För de flesta tillämpningar — ja. Drönare täcker längre sträckor och större ytor på kortare tid, med samma eller bättre upplösning än handhållen termisk kamera.",
      },
      {
        question: "Hur ofta bör ett elnät eller en fjärrvärmeanläggning inspekteras?",
        answer: "Vi rekommenderar årlig inspektion som grund, med extra insatser efter stormar eller vid misstänkta läckor. Kritiska anläggningar som dammar kan behöva tätare tillsyn enligt dammsäkerhetsklassificering.",
      },
      {
        question: "Går det att inspektera offshore-vindkraft med drönare?",
        answer: "Ja, med rätt planering för väder, sjösäkerhet och avstånd till land. EU Drone Company projekterar flygningen utifrån parkens specifika förutsättningar och gällande tillstånd.",
      },
    ],
  },
  {
    slug: "industri-tillverkning",
    icon: Factory,
    title: "Industri & Tillverkning",
    titleEn: "Industry & Manufacturing",
    omfattar: ["Tillverkning", "Fabriker", "Processindustri", "Kemi"],
  },
  {
    slug: "lantbruk-skogsbruk",
    icon: Wheat,
    title: "Lantbruk & Skogsbruk",
    titleEn: "Agriculture & Forestry",
    omfattar: ["Jordbruk", "Skogsbruk", "Vegetation", "Naturresurser"],
  },
  {
    slug: "sakerhet-raddning",
    icon: ShieldAlert,
    title: "Säkerhet & Räddning",
    titleEn: "Public Safety & Security",
    omfattar: ["Räddningstjänst", "Polis", "Säkerhet", "Bevakning"],
  },
  {
    slug: "logistik-transport",
    icon: Truck,
    title: "Logistik & Transport",
    titleEn: "Logistics & Transportation",
    omfattar: ["Logistik", "Lager", "Transport", "Järnväg", "Trafik"],
  },
  {
    slug: "sjofart-offshore",
    icon: Ship,
    title: "Sjöfart & Offshore",
    titleEn: "Maritime & Offshore",
    omfattar: ["Sjöfart", "Hamnar", "Offshore", "Kustnära verksamhet"],
  },
  {
    slug: "gruvdrift-ravaror",
    icon: Mountain,
    title: "Gruvdrift & Råvaror",
    titleEn: "Mining & Resources",
    omfattar: ["Gruvor", "Stenbrott", "Täkter", "Råvaruutvinning"],
  },
  {
    slug: "miljo-forskning",
    icon: Leaf,
    title: "Miljö & Forskning",
    titleEn: "Environmental & Research",
    omfattar: ["Miljöövervakning", "Natur", "Forskning", "Universitet"],
  },
  {
    slug: "media-tjanster",
    icon: Clapperboard,
    title: "Media & Tjänsteföretag",
    titleEn: "Media & Professional Services",
    omfattar: ["Film", "Foto", "Media", "Inspektion", "Serviceföretag"],
  },
];

export function getIndustrySolutionBySlug(slug: string): IndustrySolutionVertical | undefined {
  return INDUSTRY_SOLUTIONS.find((i) => i.slug === slug);
}
