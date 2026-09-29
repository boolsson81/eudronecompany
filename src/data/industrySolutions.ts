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
    heroTitle: "Drönare för Industri & Tillverkning",
    heroDesc: "Inspektera fabrikshallar, processanläggningar och lager, dokumentera revisionsstopp och räkna lagervolymer — utan att stoppa produktionen eller bygga ställning.",
    solutions: [
      {
        slug: "fabriks-taklokalsinspektion",
        title: "Fabriks- & taklokalsinspektion",
        desc: "Inspektera höga fabrikshallar, takstolar, ventilation och rörinstallationer utan ställning eller lift.",
        longDesc: "I stora produktionshallar sitter ofta kritiska installationer — ventilation, kranbanor, rörbryggor och takkonstruktion — på höjder som annars kräver lift eller ställning för att nå. Drönare flyger säkert inomhus i GPS-fria miljöer och dokumenterar skick utan att störa pågående produktion.",
        seoTitle: "Fabriks- & Taklokalsinspektion med Drönare | EU Drone Company",
        seoDesc: "Inspektera fabrikshallar och taklokaler med drönare — utan ställning eller lift. Dokumentation av ventilation, kranbanor och takkonstruktion. Kontakta EU Drone Company.",
        useCases: [
          "Inspektion av takstolar och taklokaler i höga produktionshallar",
          "Kontroll av ventilations- och rörinstallationer på höjd",
          "Skadedokumentation efter incidenter i produktionslokaler",
          "Periodisk besiktning utan att stänga av produktionslinjer",
        ],
        keyFeatures: [
          "GPS-fri flygning inomhus med visuell positionering",
          "Zoom- och termisk kamera för detaljerad dokumentation",
          "Ingen ställning eller lift behövs",
          "Minimal störning av pågående produktion",
        ],
      },
      {
        slug: "processanlaggningsinspektion",
        title: "Processanläggnings- & skorstensinspektion",
        desc: "Inspektera skorstenar, cisterner och rörbryggor i raffinaderier och processindustri på säkert avstånd.",
        longDesc: "Skorstenar, cisterner och rörbryggor i process- och kemianläggningar är svåra och riskfyllda att inspektera manuellt. Drönare med zoom- och termisk kamera dokumenterar konstruktionens skick utan att personal behöver klättra eller vistas i riskfyllda zoner.",
        seoTitle: "Processanläggnings- & Skorstensinspektion med Drönare | EU Drone Company",
        seoDesc: "Inspektera skorstenar, cisterner och rörbryggor med drönare. Säker inspektion i raffinaderier och processindustri. Kontakta EU Drone Company.",
        useCases: [
          "Skorstens- och skorstensforingsinspektion",
          "Cisterninspektion utan tankentry",
          "Rörbrygge- och stålkonstruktionskontroll",
          "Dokumentation inför myndighetsbesiktning",
        ],
        keyFeatures: [
          "Inspektion utan confined space entry eller klättring",
          "Termisk kamera för isolerings- och läckagekontroll",
          "Högupplöst zoom för sprick- och korrosionsdetektion",
          "Rapporter anpassade för besiktningsunderlag",
        ],
      },
      {
        slug: "lagerinventering",
        title: "Lagerinventering & volymberäkning",
        desc: "Räkna höglager och materialupplag med drönare istället för manuell inventering eller skylift.",
        longDesc: "I höglager och vid materialupplag är manuell inventering tidskrävande och ofta beroende av skyliftar. Drönare flyger längs hyllgångar och över upplag för att dokumentera lagerstatus och beräkna volymer betydligt snabbare, med möjlighet att upprepa exakt samma flygning för jämförbara resultat.",
        seoTitle: "Lagerinventering & Volymberäkning med Drönare | EU Drone Company",
        seoDesc: "Inventera höglager och materialupplag med drönare. Snabbare volymberäkning utan skylift. Kontakta EU Drone Company.",
        useCases: [
          "Inventering i höglager och pallställ",
          "Volymberäkning av bulkmaterial och upplag",
          "Uppföljning av lagernivåer mellan inventeringstillfällen",
          "Dokumentation vid revision och bokslutsinventering",
        ],
        keyFeatures: [
          "Flygning längs hyllgångar i höglager",
          "Automatisk volymberäkning av materialupplag",
          "Repeterbara flygrutter för jämförbar data",
          "Export till lager- och affärssystem",
        ],
      },
      {
        slug: "underhallsstopp-dokumentation",
        title: "Underhållsstopp & revisionsdokumentation",
        desc: "Dokumentera anläggningens skick före och efter planerade underhållsstopp för att korta ner stopptiden.",
        longDesc: "Planerade underhållsstopp och revisioner är kostsamma varje timme de pågår. Drönardokumentation före och efter stoppet ger entreprenörer och driftpersonal en gemensam bild av utfört arbete, vilket minskar oklarheter och kortar tiden för slutbesiktning.",
        seoTitle: "Underhållsstopp & Revisionsdokumentation med Drönare | EU Drone Company",
        seoDesc: "Dokumentera underhållsstopp och revisioner med drönare. Snabbare slutbesiktning och mindre stilleståndstid. Kontakta EU Drone Company.",
        useCases: [
          "Statusdokumentation före planerat underhållsstopp",
          "Uppföljning av utfört arbete under revision",
          "Slutbesiktning och avvikelsedokumentation efter stopp",
          "Underlag för entreprenörers slutfakturering",
        ],
        keyFeatures: [
          "Snabb flygning anpassad efter stoppets tidsplan",
          "Jämförelse mellan före- och efterläge",
          "Delbar dokumentation för alla inblandade entreprenörer",
          "Minskar tid för manuell slutbesiktning",
        ],
      },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Processanläggning & revision",
        desc: "Robust plattform med stöd för termisk och zoomkamera — för skorstenar, cisterner och stora anläggningar.",
        features: ["55 min flygtid", "IP55 väderskydd", "RTK-precision", "Multi-sensor"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Inomhus & snabbinspektion",
        desc: "Kompakt format som passar för flygning i fabrikshallar och vid snabba punktinspektioner mellan produktionspass.",
        features: ["45 min flygtid", "Mekanisk slutare", "56× hybridzoom", "RTK-modul"],
      },
    ],
    benefits: [
      "Inspektera höga hallar, skorstenar och cisterner utan ställning eller klättring",
      "Minimal störning av pågående produktion",
      "Snabbare lagerinventering och volymberäkning än manuella metoder",
      "Kortare stopptid tack vare snabb dokumentation vid revisioner",
    ],
    faq: [
      {
        question: "Kan drönare flyga inomhus i fabrikshallar utan GPS?",
        answer: "Ja, moderna enterprise-drönare navigerar med visuell positionering och sensorer istället för GPS, vilket gör dem lämpade för flygning inomhus i hallar och lager.",
      },
      {
        question: "Behövs särskild drönare för explosionsfarlig miljö?",
        answer: "Ja, i klassade Ex-zoner krävs explosionsskyddad utrustning och särskild riskbedömning. EU Drone Company gör en anläggningsspecifik bedömning innan uppdrag i process- och kemianläggningar.",
      },
      {
        question: "Hur exakt är drönarbaserad lagerinventering jämfört med manuell räkning?",
        answer: "För volymberäkning av bulkmaterial ligger noggrannheten inom någon procent. För styckegodsinventering kompletteras drönardata ofta med streckkods- eller RFID-läsning för full spårbarhet." ,
      },
      {
        question: "Kan drönare användas under ett pågående underhållsstopp?",
        answer: "Ja, förutsatt att flygningen samordnas med stoppets säkerhetsrutiner och riskbedömning. Många kunder flyger både före och efter stoppet för att dokumentera utfört arbete.",
      },
    ],
  },
  {
    slug: "lantbruk-skogsbruk",
    icon: Wheat,
    title: "Lantbruk & Skogsbruk",
    titleEn: "Agriculture & Forestry",
    omfattar: ["Jordbruk", "Skogsbruk", "Vegetation", "Naturresurser"],
    heroTitle: "Drönare för Lantbruk & Skogsbruk",
    heroDesc: "Inventera skog, upptäck skogsskador tidigt, rädda vilt innan slåtter och planera avverkning — med multispektral och termisk drönardata över åker och skogsmark.",
    solutions: [
      {
        slug: "skogsinventering",
        title: "Skogsinventering & beståndsanalys",
        desc: "Kartlägg trädslagsblandning, beståndshöjd och virkesförråd med multispektral och LiDAR-data.",
        longDesc: "Traditionell skogsinventering bygger på stickprov och manuell bedömning. Drönare med multispektral kamera och LiDAR ger heltäckande data över beståndets höjd, täthet och trädslagsblandning, vilket ger ett bättre underlag för avverknings- och skötselplaner.",
        seoTitle: "Skogsinventering med Drönare — Beståndsanalys | EU Drone Company",
        seoDesc: "Inventera skog med drönare — multispektral och LiDAR-data för beståndshöjd och virkesförråd. Kontakta EU Drone Company.",
        useCases: [
          "Beståndsdata inför skogsbruksplan",
          "Uppskattning av virkesförråd inför avverkning",
          "Trädslagskartering och föryngringsuppföljning",
          "Underlag för certifiering och miljöhänsyn",
        ],
        keyFeatures: [
          "Multispektral sensor för vegetationsanalys",
          "LiDAR-stöd för beståndshöjd och skiktning",
          "Heltäckande data istället för stickprov",
          "Export till skogsbrukets planeringssystem",
        ],
      },
      {
        slug: "skogsskadeinspektion",
        title: "Skogsskadeinspektion",
        desc: "Upptäck stormfällning, granbarkborreangrepp och torkstress tidigare med multispektral drönardata.",
        longDesc: "Granbarkborre och andra skadegörare ger stressignaler i trädkronorna innan skadan syns med blotta ögat. Multispektral drönarkartläggning identifierar riskbestånd tidigt, medan snabb kartläggning efter storm ger en överblick över stormfällda ytor innan markarbetet påbörjas.",
        seoTitle: "Skogsskadeinspektion med Drönare — Granbarkborre & Storm | EU Drone Company",
        seoDesc: "Upptäck granbarkborreangrepp och stormskador tidigt med drönare. Multispektral analys av skogsskador. Kontakta EU Drone Company.",
        useCases: [
          "Tidig upptäckt av granbarkborreangrepp",
          "Kartläggning av stormfällda ytor",
          "Torkstressanalys i unga och äldre bestånd",
          "Uppföljning av skadeutveckling över säsong",
        ],
        keyFeatures: [
          "Multispektral stressdetektering i trädkronor",
          "Snabb överblick av stora skogsarealer",
          "Jämförelse mellan flygningar för trendanalys",
          "Prioriteringsunderlag för sanering och avverkning",
        ],
      },
      {
        slug: "viltraddning-slatter",
        title: "Viltinventering inför slåtter",
        desc: "Hitta rådjurskid och markhäckande fåglar med termisk kamera innan vallen slås.",
        longDesc: "Varje vår och sommar skadas eller dödas vilt vid slåtter eftersom rådjurskid och markhäckande fåglar gömmer sig i högt gräs. Med termisk kamera i gryningen, när marken är sval och djuren varma, hittar drönaren dem innan maskinerna kör — en etablerad metod som både räddar djur och minskar oro hos lantbrukaren.",
        seoTitle: "Viltinventering inför Slåtter med Drönare | EU Drone Company",
        seoDesc: "Hitta rådjurskid och markhäckande fåglar med termisk drönare innan slåtter. Kontakta EU Drone Company inför vallskörden.",
        useCases: [
          "Viltinventering av vallar och betesmarker före slåtter",
          "Skydd av markhäckande fåglar under häckningssäsong",
          "Dokumentation för lantbrukarens djurskyddsrutiner",
          "Samordning med grannfastigheter inför gemensam slåtter",
        ],
        keyFeatures: [
          "Termisk flygning i gryningen för bäst kontrast",
          "Snabb avsökning av stora vallareal",
          "Positionsmarkering av upptäckt vilt",
          "Kort inställelsetid inför slåtterstart",
        ],
      },
      {
        slug: "avverkningsplanering",
        title: "Avverkningsplanering & terrängkörning",
        desc: "Kartlägg blöta partier och terräng inför avverkning för att minska körskador och planera bästa väg.",
        longDesc: "Körskador i skogsmark uppstår ofta för att blöta partier och känslig terräng inte är kända i förväg. Drönarbaserade terrängmodeller visar var marken är bärig och var maskinerna bör undvika, vilket minskar körskador och underlättar planeringen av avlägg och basvägar.",
        seoTitle: "Avverkningsplanering med Drönare — Minska Körskador | EU Drone Company",
        seoDesc: "Planera avverkning med drönardata. Kartlägg blöta partier och terräng för att minska körskador. Kontakta EU Drone Company.",
        useCases: [
          "Terrängkartläggning inför avverkningsanmälan",
          "Planering av basvägar och avlägg",
          "Identifiering av känsliga våtmarker och körskadekänsliga partier",
          "Efterkontroll av körskador efter avverkning",
        ],
        keyFeatures: [
          "Digital terrängmodell med RTK-precision",
          "Identifiering av blöta och känsliga partier",
          "Underlag för maskinförarens ruttplanering",
          "Dokumentation före och efter avverkning",
        ],
      },
    ],
    recommendedDrones: [
      {
        name: "DJI Mavic 3 Multispectral",
        tag: "Skogs- & beståndsanalys",
        desc: "Multispektral kamera för vegetationsstress, skadedetektering och beståndsanalys i skog och på åkermark.",
        features: ["43 min flygtid", "Multispektral sensor", "RTK-precision", "Autonom flygning"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Viltinventering & terräng",
        desc: "Kompakt drönare med termisk kamera (3T) — perfekt för tidiga morgonflygningar inför slåtter och snabb terrängkartläggning.",
        features: ["45 min flygtid", "Termisk kamera (3T)", "RTK-modul", "56× hybridzoom"],
      },
    ],
    benefits: [
      "Heltäckande skogsdata istället för stickprovsinventering",
      "Tidig upptäckt av granbarkborre och andra skadegörare",
      "Räddar vilt och skyddar markhäckande fåglar inför slåtter",
      "Färre körskador tack vare kartlagd terräng inför avverkning",
    ],
    faq: [
      {
        question: "Är det obligatoriskt att leta rådjurskid med drönare innan slåtter?",
        answer: "Det finns inget generellt lagkrav, men det räknas som god praxis och efterfrågas alltmer av rådgivare, försäkringsbolag och lantbrukets branschorganisationer. Många lantbrukare gör det som en del av sitt djurskyddsansvar.",
      },
      {
        question: "Hur säkert hittar termisk kamera rådjurskid i högt gräs?",
        answer: "Flygningen görs tidigt på morgonen när temperaturskillnaden mellan djur och mark är som störst, vilket ger hög träffsäkerhet. Ingen metod är hundraprocentig, men termisk drönarinventering är den mest effektiva tillgängliga metoden idag.",
      },
      {
        question: "Kan drönardata ersätta traditionell skogsinventering?",
        answer: "För beståndsdata och skadeuppföljning ger drönare ofta bättre täckning än stickprov. För officiell skogsbruksplan kombineras drönardata normalt med fältkontroller enligt Skogsstyrelsens riktlinjer.",
      },
      {
        question: "När på året är det bäst att flyga för skogsskadeinspektion?",
        answer: "Granbarkborreangrepp syns tydligast i multispektral data under försommar och sommar, medan stormskador bör kartläggas så snart som möjligt efter händelsen för att kunna planera saneringsavverkning.",
      },
    ],
  },
  {
    slug: "sakerhet-raddning",
    icon: ShieldAlert,
    title: "Säkerhet & Räddning",
    titleEn: "Public Safety & Security",
    omfattar: ["Räddningstjänst", "Polis", "Säkerhet", "Bevakning"],
    heroTitle: "Drönare för Säkerhet & Räddning",
    heroDesc: "Drönare som första insats, eftersökning, insatsledning vid olyckor och bevakning — snabbare överblick för räddningstjänst, polis och väktarbolag när varje minut räknas.",
    solutions: [
      {
        slug: "dronare-som-forsta-insats",
        title: "Drönare som första insats",
        desc: "Dockningsbaserad drönare som lyfter automatiskt vid larm och ger insatsledning livebild innan första enhet är på plats.",
        longDesc: "Med en dockningsstation utplacerad strategiskt kan en drönare lyfta automatiskt vid inkommande larm och nå platsen innan första bil eller ambulans anländer. Livebild till ledningscentralen ger insatsledningen ett beslutsunderlag redan innan personal är på plats — särskilt värdefullt vid bränder, trafikolyckor och pågående brott.",
        seoTitle: "Drönare som Första Insats (DFR) | EU Drone Company",
        seoDesc: "Dockningsbaserad drönare som första insats vid larm. Livebild till ledningscentral innan enheter är på plats. Kontakta EU Drone Company.",
        useCases: [
          "Automatisk drönarrespons vid inkommande larm",
          "Livebild till ledningscentral för snabbare beslut",
          "Riskbedömning innan personal går in i en händelse",
          "Komplement till befintlig utryckningsorganisation",
        ],
        keyFeatures: [
          "Dockningsstation med automatisk laddning och lyft",
          "Flygklar på under 60 sekunder efter larm",
          "Realtidsvideo och termisk kamera till kontrollrum",
          "Integration med larm- och ledningssystem",
        ],
      },
      {
        slug: "eftersokning-forsvunna",
        title: "Eftersökning av försvunna personer",
        desc: "Systematisk avsökning av stora områden med termisk kamera, samordnat med räddningstjänst och polis.",
        longDesc: "Vid eftersökning av försvunna personer är tid avgörande. Drönare med termisk kamera avsöker stora och svårtillgängliga områden — skog, vatten, öppna fält — betydligt snabbare än sökpatruller till fots, och kan flyga i mörker när det är som svårast att söka manuellt.",
        seoTitle: "Eftersökning av Försvunna Personer med Drönare | EU Drone Company",
        seoDesc: "Systematisk eftersökning med termisk drönare. Snabbare avsökning av stora områden i samverkan med räddningstjänst. Kontakta EU Drone Company.",
        useCases: [
          "Eftersökning i skog, mark och vattennära områden",
          "Nattlig sökinsats med termisk kamera",
          "Samverkan med räddningstjänst, polis och frivilliga sökgrupper",
          "Dokumentation av avsökt område för insatsledning",
        ],
        keyFeatures: [
          "Termisk kamera för persondetektion i mörker",
          "Systematiska sökmönster med heltäckande dokumentation",
          "Lång flygtid för att täcka stora arealer",
          "Direktsänd video till insatsledning i fält",
        ],
      },
      {
        slug: "trafikolycka-insatsledning",
        title: "Trafikolycka & insatsledning",
        desc: "Snabb överblick av olycksplatsen för insatsledning, trafikavstängning och riskbedömning av farligt gods.",
        longDesc: "Vid större trafikolyckor ger en drönare insatsledningen en överblick av hela platsen på minuter — antal fordon, skadeomfattning och eventuellt läckage av farligt gods — utan att personal behöver exponeras för trafik eller riskzoner innan situationen är kartlagd.",
        seoTitle: "Trafikolycka & Insatsledning med Drönare | EU Drone Company",
        seoDesc: "Överblick av trafikolyckor med drönare för insatsledning och riskbedömning. Kontakta EU Drone Company.",
        useCases: [
          "Överblick vid större trafikolyckor och multiolyckor",
          "Riskbedömning av farligt gods innan personal går in",
          "Underlag för trafikavstängning och omledning",
          "Dokumentation för efterföljande olycksutredning",
        ],
        keyFeatures: [
          "Snabb lägesbild till insatsledning inom minuter",
          "Termisk kamera för att upptäcka brand eller läckage",
          "Video direkt till ledningsfordon eller kontrollrum",
          "Georefererad dokumentation för utredning",
        ],
      },
      {
        slug: "bevaknings-vaktartjanster",
        title: "Bevaknings- & väktartjänster",
        desc: "Schemalagda patrullflygningar och drönarverifiering av larm innan väktare skickas ut på plats.",
        longDesc: "För väktarbolag kan en drönare verifiera ett inkommet larm på plats innan en väktare skickas ut, vilket minskar kostnaden för falsklarm och prioriterar rätt insatser. Schemalagda patrullflygningar ger dessutom regelbunden överblick av stora fastigheter och industriområden mellan ordinarie rundor.",
        seoTitle: "Bevaknings- & Väktartjänster med Drönare | EU Drone Company",
        seoDesc: "Drönare för bevakningsbolag — larmverifiering och patrullflygningar. Minska kostnaden för falsklarm. Kontakta EU Drone Company.",
        useCases: [
          "Larmverifiering innan väktare skickas till plats",
          "Schemalagda patrullflygningar över stora fastigheter",
          "Nattlig bevakning med termisk kamera",
          "Komplement till stationär kamerabevakning",
        ],
        keyFeatures: [
          "Automatiserade patrullrutter mellan väktarrundor",
          "Termisk detektion dygnet runt",
          "Snabb larmverifiering minskar onödiga utryckningar",
          "Integration med väktarbolagets larmcentral",
        ],
      },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Insatsledning & dockning",
        desc: "Lång flygtid, IP55-skydd och stöd för termisk kamera — kompatibel med dockningsstation för första insats och bevakning.",
        features: ["55 min flygtid", "IP55 väderskydd", "Termisk + zoom", "Dockningskompatibel"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb utryckning",
        desc: "Kompakt och snabbt redo för eftersökning, olycksplatsöverblick och väktarbolagets rondering.",
        features: ["45 min flygtid", "Termisk kamera (3T)", "Högtalare", "Spotlight"],
      },
    ],
    benefits: [
      "Drönare på plats före första enheten vid dockningsbaserad respons",
      "Termisk detektion dygnet runt vid eftersökning och bevakning",
      "Säkrare riskbedömning innan personal exponeras för fara",
      "Färre kostsamma utryckningar tack vare drönarverifierade larm",
    ],
    faq: [
      {
        question: "Får en drönare flyga automatiskt från en dockningsstation över tätbebyggt område?",
        answer: "Ja, men det kräver särskilda BVLOS-tillstånd från Transportstyrelsen och samordning med luftrumsansvarig myndighet. EU Drone Company projekterar och söker tillstånd för dockningsbaserade lösningar utifrån platsens förutsättningar.",
      },
      {
        question: "Hur snabbt kan en drönare vara på plats vid ett larm?",
        answer: "Med en väl placerad dockningsstation kan drönaren vara i luften inom 60 sekunder och nå platsen på ett par minuter, ofta snabbare än en utryckande bil i tät trafik.",
      },
      {
        question: "Hur hanteras integritet och GDPR vid drönarövervakning?",
        answer: "Inspelat material hanteras enligt samma regelverk som annan kamerabevakning, med tydliga rutiner för lagring, åtkomst och radering. EU Drone Company hjälper kunden att utforma rutiner som följer gällande dataskyddslagstiftning.",
      },
      {
        question: "Kan drönare flyga i mörker vid eftersökning och bevakning?",
        answer: "Ja, med rätt behörighet och belysningsutrustning kan drönare flyga nattetid. Termisk kamera gör dessutom nattflygning särskilt effektiv för att hitta personer eller upptäcka rörelser.",
      },
    ],
  },
  {
    slug: "logistik-transport",
    icon: Truck,
    title: "Logistik & Transport",
    titleEn: "Logistics & Transportation",
    omfattar: ["Logistik", "Lager", "Transport", "Järnväg", "Trafik"],
    heroTitle: "Drönare för Logistik & Transport",
    heroDesc: "Inventera terminalytor, inspektera järnväg utan trafikpåverkan, analysera trafikflöden och utforska sista milen-leverans — med drönare anpassade för logistikkedjans behov.",
    solutions: [
      {
        slug: "terminal-lageryteinventering",
        title: "Terminal- & lagerytinventering",
        desc: "Räkna containrar, trailers och utomhuslagrat gods på terminalytor snabbare än manuell rondering.",
        longDesc: "Stora terminalytor med containrar, trailers och utomhuslagrat gods är tidskrävande att inventera till fots eller med truck. Drönare flyger över hela ytan och skapar en aktuell översikt som kan jämföras mot terminalsystemets uppgifter, vilket gör avvikelser synliga snabbt.",
        seoTitle: "Terminal- & Lagerytinventering med Drönare | EU Drone Company",
        seoDesc: "Inventera terminalytor och utomhuslager med drönare. Räkna containrar och trailers snabbare. Kontakta EU Drone Company.",
        useCases: [
          "Containerinventering på hamn- och godsterminaler",
          "Trailerräkning på uppställningsytor",
          "Avstämning mot terminalens hanteringssystem",
          "Kapacitetsplanering av utomhusytor",
        ],
        keyFeatures: [
          "Snabb översiktsflygning över stora ytor",
          "Positionsbestämd räkning av enheter",
          "Jämförelse mot terminalsystemets data",
          "Regelbunden uppföljning för kapacitetsplanering",
        ],
      },
      {
        slug: "jarnvagsinspektion",
        title: "Järnvägs- & spårinspektion",
        desc: "Inspektera spårområde, kontaktledning och vegetation längs banan utan att stänga av trafiken.",
        longDesc: "Inspektion av järnväg innebär ofta spårarbete med trafikavstängning eller riskfyllt arbete nära spänningssatt kontaktledning. Drönare dokumenterar spårets skick, kontaktledningens infästningar och vegetation som växer in mot spårområdet, utan att personal behöver vistas i spårmiljön.",
        seoTitle: "Järnvägs- & Spårinspektion med Drönare | EU Drone Company",
        seoDesc: "Inspektera järnväg, kontaktledning och vegetation med drönare utan trafikavstängning. Kontakta EU Drone Company.",
        useCases: [
          "Vegetationskontroll längs banvallen",
          "Inspektion av kontaktledning och stolpar",
          "Skadedokumentation av banvall och slänter",
          "Underlag för planerat underhåll av spårområdet",
        ],
        keyFeatures: [
          "Inspektion utan spårspärr eller trafikavstängning",
          "Zoom- och termisk kamera för detaljgranskning på avstånd",
          "Georefererad dokumentation längs bansträckningen",
          "Minskad exponering för personal i spårmiljö",
        ],
      },
      {
        slug: "trafikanalys",
        title: "Trafikanalys & flödesmätning",
        desc: "Filma och analysera trafikflöden vid korsningar och vägarbeten som underlag för planering.",
        longDesc: "Flygfilmning av trafikkorsningar och vägsträckor ger kommuner och trafikplanerare en överblick som är svår att få från marknivå. Drönardata används för att analysera trafikflöden, köbildning och effekter av tillfälliga vägarbeten inför beslut om åtgärder.",
        seoTitle: "Trafikanalys & Flödesmätning med Drönare | EU Drone Company",
        seoDesc: "Analysera trafikflöden och köbildning med drönarfilm. Underlag för kommunal trafikplanering. Kontakta EU Drone Company.",
        useCases: [
          "Trafikflödesanalys vid korsningar och rondeller",
          "Effektuppföljning av tillfälliga vägarbeten",
          "Underlag inför ombyggnation av gator och korsningar",
          "Dokumentation av trafiksituation vid stora evenemang",
        ],
        keyFeatures: [
          "Flygfilmning från fast position över trafikpunkter",
          "Underlag för flödes- och köanalys",
          "Jämförelse före och efter åtgärd",
          "Leverans av rådata och sammanställd rapport",
        ],
      },
      {
        slug: "sista-milen-leverans",
        title: "Sista milen & godsleverans",
        desc: "Utforska drönarleverans för svårtillgängliga sträckor, öar och tidskritiska försändelser.",
        longDesc: "För logistikaktörer som vill utvärdera drönarleverans finns idag pilotprojekt för sista milen till öar, glesbygd och tidskritiska försändelser som medicinska prover. EU Drone Company hjälper till att bedöma förutsättningar, tillståndskrav och vilken nytta ett pilotprojekt kan ge innan en fullskalig satsning.",
        seoTitle: "Sista Milen & Drönarleverans | EU Drone Company",
        seoDesc: "Utvärdera drönarleverans för sista milen — öar, glesbygd och tidskritiska försändelser. Kontakta EU Drone Company för pilotprojekt.",
        useCases: [
          "Leverans till öar och svårtillgängliga adresser",
          "Tidskritisk transport av medicinska prover",
          "Pilotprojekt för att utvärdera drönarleverans i egen verksamhet",
          "Komplement till befintlig sista milen-logistik",
        ],
        keyFeatures: [
          "Förstudie av förutsättningar och tillståndskrav",
          "Pilotupplägg anpassat efter verksamhetens behov",
          "Bedömning av nytta jämfört med befintlig leverans",
          "Stöd genom hela tillståndsprocessen",
        ],
      },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Terminal & järnväg",
        desc: "RTK-precision och lång flygtid för storskalig terminalinventering och järnvägsinspektion längs hela bansträckor.",
        features: ["55 min flygtid", "IP55 väderskydd", "RTK-precision", "Multi-sensor"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb trafik- & yteanalys",
        desc: "Kompakt och snabbt redo för trafikfilmning och punktvisa inventeringar utan att mobilisera större utrustning.",
        features: ["45 min flygtid", "Mekanisk slutare", "56× hybridzoom", "RTK-modul"],
      },
    ],
    benefits: [
      "Snabbare inventering av terminalytor än manuell rondering",
      "Järnvägsinspektion utan spårspärr eller trafikavstängning",
      "Datadrivet underlag för trafik- och kapacitetsplanering",
      "Tidig utvärdering av drönarleverans inför framtida satsningar",
    ],
    faq: [
      {
        question: "Får man flyga drönare nära järnväg med kontaktledning?",
        answer: "Ja, men det kräver riskbedömning och samordning med infrastrukturägaren på grund av spänningssatt kontaktledning. EU Drone Company planerar flygningen så att säkerhetsavstånd hålls genomgående.",
      },
      {
        question: "Hur exakt är drönarbaserad containerräkning jämfört med terminalsystemet?",
        answer: "Drönardata ger en visuell avstämning av vad som faktiskt står på ytan, vilket är ett bra komplement till terminalsystemets bokförda saldo — särskilt för att hitta avvikelser och feltolkade positioner.",
      },
      {
        question: "Är drönarleverans tillåtet i Sverige idag?",
        answer: "Kommersiell drönarleverans sker i Sverige främst inom avgränsade pilotprojekt med särskilda tillstånd, inte som ett generellt tillgängligt alternativ ännu. EU Drone Company hjälper till att bedöma vad som krävs för ett pilotprojekt i er verksamhet.",
      },
      {
        question: "Kan trafikanalys med drönare ersätta fasta trafikräknare?",
        answer: "Drönarfilmning kompletterar fasta trafikräknare väl genom att visa faktiska rörelsemönster och köbildning visuellt, men ersätter inte kontinuerlig mätning över längre perioder.",
      },
    ],
  },
  {
    slug: "sjofart-offshore",
    icon: Ship,
    title: "Sjöfart & Offshore",
    titleEn: "Maritime & Offshore",
    omfattar: ["Sjöfart", "Hamnar", "Offshore", "Kustnära verksamhet"],
    heroTitle: "Drönare för Sjöfart & Offshore",
    heroDesc: "Inspektera fartygsskrov, hamnanläggningar och offshoreplattformar utan dykinsats eller ställning — och håll koll på kustnära miljö med drönare byggda för tuffa väderförhållanden.",
    solutions: [
      {
        slug: "fartygsinspektion",
        title: "Fartygsinspektion",
        desc: "Inspektera skrov, överbyggnad och tankar medan fartyget ligger vid kaj — utan dykare eller stillestånd i docka.",
        longDesc: "Fartygsinspektion innebär traditionellt dykinsats för skrovet under vattenlinjen eller lift för överbyggnaden. Drönare dokumenterar synliga delar av skrov, överbyggnad, skorstenar och lastutrymmen snabbt medan fartyget ligger vid kaj, vilket minskar behovet av att gå in i docka för rutinbesiktning.",
        seoTitle: "Fartygsinspektion med Drönare — Skrov & Överbyggnad | EU Drone Company",
        seoDesc: "Inspektera fartygsskrov och överbyggnad med drönare vid kaj. Minska behovet av docka och dykinsats. Kontakta EU Drone Company.",
        useCases: [
          "Rutininspektion av skrov och överbyggnad vid kaj",
          "Dokumentation inför klassningssällskapets besiktning",
          "Tankinspektion i lastutrymmen utan confined space entry",
          "Skadedokumentation efter kollision eller hårt väder",
        ],
        keyFeatures: [
          "Inspektion utan dykinsats eller torrdocka",
          "Zoom- och termisk kamera för korrosions- och skadedetektion",
          "Flygning anpassad efter fartygets rörelse vid kaj",
          "Rapporter kompatibla med klassningsdokumentation",
        ],
      },
      {
        slug: "hamninfrastruktur-inspektion",
        title: "Hamninfrastruktur & kajinspektion",
        desc: "Inspektera kajkanter, fendrar och pirkonstruktioner utan att stänga av hamnverksamheten.",
        longDesc: "Kajkanter, fendersystem och pirkonstruktioner utsätts ständigt för slitage från fartyg, is och vågor. Drönare inspekterar dessa konstruktioner, inklusive undersidan av bryggor och pirar, utan att hamnverksamheten behöver stängas av eller att personal behöver arbeta nära vattnet.",
        seoTitle: "Hamninfrastruktur & Kajinspektion med Drönare | EU Drone Company",
        seoDesc: "Inspektera kajer, fendrar och pirkonstruktioner med drönare. Ingen driftstörning i hamnen. Kontakta EU Drone Company.",
        useCases: [
          "Periodisk kaj- och fenderinspektion",
          "Skadedokumentation efter islossning eller hårt väder",
          "Inspektion av bryggors och pirars undersida",
          "Underlag för underhållsplanering av hamninfrastruktur",
        ],
        keyFeatures: [
          "Flygning nära vattenlinjen utan att störa fartygstrafik",
          "Termisk och visuell dokumentation av betong och stål",
          "Ingen avstängning av hamnverksamheten krävs",
          "Georefererad skadekartering längs kajsträckan",
        ],
      },
      {
        slug: "offshore-inspektion",
        title: "Offshore-inspektion",
        desc: "Inspektera plattformar, fundament till havsbaserad vindkraft och offshore-installationer i tuff miljö.",
        longDesc: "Offshore-anläggningar — oljeplattformar, fundament till havsbaserad vindkraft och annan infrastruktur till havs — är kostsamma och riskfyllda att inspektera manuellt. Drönare byggda för tuffa väderförhållanden dokumenterar konstruktionens skick och minskar behovet av att personal arbetar på höjd eller i riskzoner ute till havs.",
        seoTitle: "Offshore-inspektion med Drönare | EU Drone Company",
        seoDesc: "Inspektera offshoreplattformar och vindkraftsfundament med drönare. Säkrare inspektion i tuff havsmiljö. Kontakta EU Drone Company.",
        useCases: [
          "Plattformsinspektion av stålkonstruktion och helikopterdäck",
          "Fundamentinspektion för havsbaserad vindkraft",
          "Korrosions- och skadeanalys i saltvattenmiljö",
          "Dokumentation inför planerat underhållsstopp offshore",
        ],
        keyFeatures: [
          "Väderbeständig plattform för blåsiga havsförhållanden",
          "Termisk och zoomkamera för detaljerad skadeanalys",
          "Minskad personalexponering i riskfylld miljö",
          "Planering anpassad efter offshore-logistik och väderfönster",
        ],
      },
      {
        slug: "kustovervakning",
        title: "Kustövervakning & miljötillsyn",
        desc: "Upptäck oljeutsläpp, erosion och otillåten verksamhet längs kusten med regelbundna flygningar.",
        longDesc: "Kustnära verksamhet kräver löpande tillsyn av stora och svårtillgängliga sträckor. Drönare kompletterar båt- och landbaserad tillsyn genom att snabbt täcka kuststräckor för att upptäcka oljeutsläpp, erosionsskador eller otillåten verksamhet i skyddade områden.",
        seoTitle: "Kustövervakning & Miljötillsyn med Drönare | EU Drone Company",
        seoDesc: "Övervaka kuststräckor med drönare — upptäck oljeutsläpp och erosion snabbt. Kontakta EU Drone Company för kustövervakning.",
        useCases: [
          "Tidig upptäckt av oljeutsläpp och föroreningar",
          "Erosionsuppföljning längs kust och strandlinje",
          "Tillsyn av skyddade kustområden",
          "Dokumentation vid miljöincidenter",
        ],
        keyFeatures: [
          "Snabb täckning av långa kuststräckor",
          "Visuell och multispektral dokumentation av föroreningar",
          "Jämförelse över tid för erosionsanalys",
          "Kompletterar befintlig båt- och landbaserad tillsyn",
        ],
      },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Offshore & tuff miljö",
        desc: "IP55-skydd, lång flygtid och stöd för termisk och zoomkamera — byggd för blåsiga och salta förhållanden till havs.",
        features: ["55 min flygtid", "IP55 väderskydd", "RTK-precision", "Multi-sensor"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb kaj- & fartygsinspektion",
        desc: "Kompakt och snabbt redo för punktinspektioner av fartyg och hamnkonstruktioner mellan angöringar.",
        features: ["45 min flygtid", "Mekanisk slutare", "56× hybridzoom", "RTK-modul"],
      },
    ],
    benefits: [
      "Inspektera skrov, kajer och plattformar utan dykinsats eller ställning",
      "Minskad personalexponering i riskfylld hamn- och offshoremiljö",
      "Snabbare täckning av kuststräckor för miljötillsyn",
      "Väderbeständig utrustning anpassad för blåsiga och salta förhållanden",
    ],
    faq: [
      {
        question: "Klarar drönare att flyga i den blåsiga miljön till havs och i hamn?",
        answer: "DJI Matrice 350 RTK är IP55-klassad och klarar vind upp till 12 m/s samt lätt regn, men flygningen planeras alltid utifrån aktuell väderprognos och platsens förutsättningar.",
      },
      {
        question: "Behövs särskilt tillstånd för att flyga över hamnområden?",
        answer: "Ja, hamnar räknas ofta som skyddsobjekt eller ligger nära kontrollerat luftrum, vilket kräver samordning med hamnbolag och i vissa fall Transportstyrelsen. EU Drone Company hanterar tillståndsprocessen.",
      },
      {
        question: "Kan drönare ersätta dykinspektion av fartygsskrov?",
        answer: "Drönare inspekterar delar av skrovet ovanför vattenlinjen samt överbyggnad och lastutrymmen, men skrovet under vattenlinjen kräver fortfarande dykinsats eller torrdocka.",
      },
      {
        question: "Hur ofta bör hamninfrastruktur inspekteras med drönare?",
        answer: "Vi rekommenderar årlig inspektion som grund, med extra insatser efter islossning, storm eller vid misstänkt skada på kaj- eller fenderkonstruktioner.",
      },
    ],
  },
  {
    slug: "gruvdrift-ravaror",
    icon: Mountain,
    title: "Gruvdrift & Råvaror",
    titleEn: "Mining & Resources",
    omfattar: ["Gruvor", "Stenbrott", "Täkter", "Råvaruutvinning"],
    heroTitle: "Drönare för Gruvdrift & Råvaror",
    heroDesc: "Övervaka slänters stabilitet, följ upp sprängningar, kartlägg dagbrott och håll koll på gruvavfallsdammar — med regelbunden drönardata som ger tidig varning innan det blir kostsamt.",
    solutions: [
      {
        slug: "dagbrottskartering",
        title: "Dagbrotts- & täktkartering",
        desc: "Regelbunden heltäckande kartläggning av dagbrott och täkter för uppföljning mot brytningsplanen.",
        longDesc: "Dagbrott och täkter förändras kontinuerligt i takt med brytningen. Regelbundna drönarflygningar ger en aktuell 3D-modell av hela området, vilket gör det möjligt att följa upp faktisk brytning mot planerad brytningsplan och beräkna kvarvarande volymer.",
        seoTitle: "Dagbrotts- & Täktkartering med Drönare | EU Drone Company",
        seoDesc: "Kartlägg dagbrott och täkter med drönare. Följ upp brytning mot plan med regelbunden 3D-data. Kontakta EU Drone Company.",
        useCases: [
          "Regelbunden uppföljning av dagbrott mot brytningsplan",
          "Volymberäkning av kvarvarande och brutna massor",
          "Underlag för produktionsrapportering",
          "Historisk jämförelse av brytningens utveckling",
        ],
        keyFeatures: [
          "Heltäckande 3D-modell vid varje flygning",
          "RTK-precision för jämförbara mätningar över tid",
          "Snabbare än traditionell totalstationsmätning",
          "Export till gruvans planeringssystem",
        ],
      },
      {
        slug: "slantstabilitet",
        title: "Slänt- & bergstabilitetsövervakning",
        desc: "Upptäck sprickor och rörelser i brottväggar innan de utvecklas till ras.",
        longDesc: "Instabila slänter och brottväggar är en av de största säkerhetsriskerna i dagbrott och täkter. Genom att jämföra punktmoln från återkommande drönarflygningar går det att upptäcka små rörelser och sprickbildningar långt innan de är synliga för blotta ögat, utan att personal behöver vistas nära riskzonen.",
        seoTitle: "Slänt- & Bergstabilitetsövervakning med Drönare | EU Drone Company",
        seoDesc: "Övervaka slänters stabilitet i dagbrott med drönare. Upptäck rörelser och sprickor tidigt. Kontakta EU Drone Company.",
        useCases: [
          "Periodisk övervakning av brottväggar och slänter",
          "Tidig upptäckt av sprickbildning och rörelser",
          "Riskbedömning inför fortsatt brytning i ett område",
          "Dokumentation efter sprängning eller kraftigt regn",
        ],
        keyFeatures: [
          "Jämförelse av punktmoln mellan flygningar",
          "Detektering av millimeterrörelser vid upprepade mätningar",
          "Ingen personal behöver vistas i riskzonen",
          "Larmunderlag vid avvikande rörelsemönster",
        ],
      },
      {
        slug: "sprangplanering-uppfoljning",
        title: "Sprängplanering & uppföljning",
        desc: "Dokumentera bergvägg före sprängning och analysera fragmentering och massvolym efteråt.",
        longDesc: "Noggrann dokumentation före och efter en sprängning ger bättre underlag för nästa sprängplan. Drönardata visar bergväggens geometri inför borrplanering, och efter sprängningen kan fragmentering och volymen av den sprängda massan analyseras utan att personal behöver gå in i området innan det är säkrat.",
        seoTitle: "Sprängplanering & Uppföljning med Drönare | EU Drone Company",
        seoDesc: "Dokumentera sprängningar med drönare — bergväggsgeometri, fragmentering och massvolym. Kontakta EU Drone Company.",
        useCases: [
          "Bergväggsdokumentation inför borr- och sprängplan",
          "Fragmenteringsanalys av sprängd massa",
          "Volymberäkning av sprängskutan efter sprängning",
          "Säkerhetsdokumentation innan personal återvänder till området",
        ],
        keyFeatures: [
          "Detaljerad geometri för borrplanering",
          "Automatisk fragmenteringsanalys",
          "Snabb volymberäkning av sprängd massa",
          "Flygning från säkert avstånd innan området är friklassat",
        ],
      },
      {
        slug: "damsakerhet-gruvavfall",
        title: "Dammsäkerhet för gruvavfall",
        desc: "Regelbunden tillsyn av sandmagasin och gruvavfallsdammar för att upptäcka avvikelser tidigt.",
        longDesc: "Dammar för gruvavfall och sandmagasin kräver noggrann och regelbunden tillsyn eftersom konsekvenserna av ett dammbrott kan vara allvarliga för både miljö och säkerhet. Drönare dokumenterar dammkrön, slänter och avvattningssystem vid varje inspektionstillfälle, vilket ger en jämförbar historik att följa avvikelser mot.",
        seoTitle: "Dammsäkerhet för Gruvavfall med Drönare | EU Drone Company",
        seoDesc: "Inspektera sandmagasin och gruvavfallsdammar med drönare. Tidig upptäckt av avvikelser i dammsäkerheten. Kontakta EU Drone Company.",
        useCases: [
          "Regelbunden tillsyn av dammkrön och slänter",
          "Kontroll av avvattnings- och dräneringssystem",
          "Dokumentation inför myndighetstillsyn av dammsäkerhet",
          "Uppföljning efter kraftig nederbörd eller snösmältning",
        ],
        keyFeatures: [
          "Regelbunden, jämförbar dokumentation av hela dammanläggningen",
          "Höjd- och deformationsanalys av dammkrön",
          "Snabb överblick efter extremväder",
          "Rapporter anpassade för dammsäkerhetsklassificering",
        ],
      },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Dagbrott & dammsäkerhet",
        desc: "RTK-precision och stöd för LiDAR och zoomkamera — för storskalig kartering och återkommande stabilitetsövervakning.",
        features: ["55 min flygtid", "IP55 väderskydd", "RTK-precision", "LiDAR-stöd"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb punktinspektion",
        desc: "Kompakt och snabbt redo för uppföljning efter sprängning eller punktinspektion av enskilda slänter.",
        features: ["45 min flygtid", "Mekanisk slutare", "RTK-modul", "56× hybridzoom"],
      },
    ],
    benefits: [
      "Upptäck slänt- och bergrörelser innan de utvecklas till ras",
      "Snabbare och säkrare uppföljning än manuell mätning i brottet",
      "Bättre underlag för sprängplanering och fragmenteringsanalys",
      "Regelbunden, jämförbar dokumentation för dammsäkerhet",
    ],
    faq: [
      {
        question: "Hur ofta bör slänter och brottväggar övervakas med drönare?",
        answer: "Frekvensen beror på riskklassificering och aktivitet i brottet — allt från veckovis vid pågående brytning nära en slänt till månadsvis för mer stabila områden. Vi tar fram ett upplägg tillsammans med er säkerhetsorganisation.",
      },
      {
        question: "Hur exakt kan drönardata upptäcka rörelser i en brottvägg?",
        answer: "Med RTK-precision och upprepade flygningar från samma position kan avvikelser ner mot någon centimeter identifieras genom att jämföra punktmoln mellan flygningar.",
      },
      {
        question: "Kan drönare flyga nära ett område efter sprängning?",
        answer: "Ja, men först efter att området är friklassat enligt gruvans säkerhetsrutiner. Drönaren kan då dokumentera resultatet utan att personal behöver gå in i området lika tidigt som annars.",
      },
      {
        question: "Ersätter drönarinspektion den formella dammsäkerhetstillsynen?",
        answer: "Drönardata är ett värdefullt komplement som ger tätare och mer heltäckande dokumentation, men den formella klassificeringen och tillsynen enligt gällande regelverk görs av behörig dammsäkerhetsansvarig.",
      },
    ],
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
