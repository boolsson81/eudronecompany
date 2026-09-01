import { Building2, TreePine, Map, Eye, Zap, Camera } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import matriceImg from "@/assets/dji-matrice-350-rtk.jpg";
import mavicEntImg from "@/assets/dji-mavic-3-enterprise.jpg";
import agrasImg from "@/assets/dji-agras-t50.jpg";
import mavicMultiImg from "@/assets/dji-mavic-3-multispectral.jpg";
import inspireImg from "@/assets/dji-inspire-3.jpg";
import mavicProImg from "@/assets/dji-mavic-3-pro.jpg";

// Drone product image & video mapping
const DRONE_MEDIA: Record<string, { youtubeId: string; image: string }> = {
  "DJI Matrice 350 RTK": { youtubeId: "JPPHG5dSpwM", image: matriceImg },
  "DJI Mavic 3 Enterprise": { youtubeId: "KH-ZReRtoec", image: mavicEntImg },
  "DJI Agras T50": { youtubeId: "G8gjm2HALEM", image: agrasImg },
  "DJI Mavic 3 Multispectral": { youtubeId: "4f8NiLApHLk", image: mavicMultiImg },
  "DJI Inspire 3": { youtubeId: "IwIoeaGim6Q", image: inspireImg },
  "DJI Mavic 3 Pro": { youtubeId: "BNEmDcQr6hk", image: mavicProImg },
};

export function getDroneMedia(name: string) {
  return DRONE_MEDIA[name];
}

export interface DroneProduct {
  name: string;
  tag: string;
  desc: string;
  features: string[];
  youtubeId?: string;
  image?: string;
}

export interface IndustrySolution {
  slug: string;
  title: string;
  desc: string;
  longDesc?: string;
  seoTitle?: string;
  seoDesc?: string;
  useCases?: string[];
  keyFeatures?: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface IndustryData {
  slug: string;
  icon: LucideIcon;
  title: string;
  shortDesc: string;
  heroTitle: string;
  heroDesc: string;
  solutions: IndustrySolution[];
  recommendedDrones: DroneProduct[];
  benefits: string[];
  faq: FaqItem[];
}

export const INDUSTRY_DATA: IndustryData[] = [
  {
    slug: "inspektion",
    icon: Building2,
    title: "Inspektion & Underhåll",
    shortDesc: "Tak, fasader, solpaneler, vindkraftverk och infrastruktur — snabbare och säkrare inspektioner med drönare.",
    heroTitle: "Drönare för Inspektion & Underhåll",
    heroDesc: "Inspektera tak, fasader, vindkraftverk och infrastruktur snabbare, säkrare och billigare med professionella drönare.",
    solutions: [
      { slug: "takinspektion", title: "Takinspektion", desc: "Dokumentera skador och slitage utan byggnadsställning. Spara tid och minska risker.", longDesc: "Drönare revolutionerar takinspektioner genom att eliminera behovet av byggnadsställning och manuell klättring. Med högupplösta kameror och termisk avbildning kan du snabbt identifiera skador, läckor och slitage — säkrare, snabbare och billigare.", seoTitle: "Takinspektion med Drönare — Snabbare & Säkrare | EU Drone Company", seoDesc: "Inspektera tak med drönare utan byggnadsställning. Termisk och visuell dokumentation av skador och slitage. Kontakta EU Drone Company för offert.", useCases: ["Bostadsrättsföreningar och fastighetsbolag", "Försäkringsärenden och skadedokumentation", "Förebyggande underhåll av kommersiella fastigheter", "Storskalig inspektion av lager- och industritak"], keyFeatures: ["Termisk kamera för att hitta dolda läckor", "Högupplösta bilder med zoom upp till 200×", "Automatisk rapportgenerering med AI", "Ingen byggnadsställning behövs"] },
      { slug: "fasadinspektion", title: "Fasadinspektion", desc: "Detaljerade bilder av fasader och konstruktioner med zoom- och termisk kamera.", longDesc: "Med drönare kan fasader inspekteras i detalj utan att personal behöver arbeta på höjd. Zoom- och termiska kameror avslöjar sprickor, fuktskador och isoleringsbrister som inte syns med blotta ögat.", seoTitle: "Fasadinspektion med Drönare — Detaljerad Dokumentation | EU Drone Company", seoDesc: "Inspektera fasader med drönare. Hitta sprickor, fuktskador och isoleringsbrister med termisk och visuell kamera. Begär offert.", useCases: ["Fasadrenoveringar och tillståndsbesiktningar", "Fuktanalys av bostadshus och kontor", "Kulturarvsinventering och dokumentation", "Kvalitetskontroll vid nybyggnation"], keyFeatures: ["56× optisk zoom för detaljgranskning", "Termisk kamera för fukt- och isoleringsanalys", "3D-modellering av hela fasaden", "Säker inspektion utan lift eller ställning"] },
      { slug: "vindkraftinspektion", title: "Vindkraftinspektion", desc: "Automatiserad inspektion av turbinblad med AI-baserad skadedetektering.", longDesc: "Vindkraftverk kräver regelbunden inspektion av blad, nacelle och torn. Drönare med AI-baserad bildanalys automatiserar processen och identifierar sprickor, erosion och delaminering snabbt och kostnadseffektivt.", seoTitle: "Vindkraftinspektion med Drönare — AI-analys | EU Drone Company", seoDesc: "Inspektera vindkraftverk med drönare. AI-baserad skadedetektering av turbinblad. Minska stilleståndstid med EU Drone Company.", useCases: ["Bladinspektion av on- och offshore-vindkraftverk", "Periodiskt underhåll och skadeuppföljning", "Garantiärenden och dokumentation", "Storskalig inspektion av vindparker"], keyFeatures: ["AI-baserad skadedetektering", "Automatiserade flygmönster runt turbinblad", "Jämförelse över tid med historisk data", "Detaljerad rapportering med skadeklassificering"] },
      { slug: "solpanelsinspektion", title: "Solpanelsinspektion", desc: "Termisk analys av solcellsanläggningar för att hitta hotspots och defekta celler.", longDesc: "Termisk drönarinspektion av solcellsanläggningar identifierar snabbt defekta celler, hotspots och anslutningsfel som minskar produktionen. Täck stora anläggningar på en bråkdel av tiden jämfört med manuell inspektion.", seoTitle: "Solpanelsinspektion med Drönare — Termisk Analys | EU Drone Company", seoDesc: "Hitta hotspots och defekta solceller med termisk drönarinspektion. Maximera energiproduktionen. Kontakta EU Drone Company.", useCases: ["Storskaliga solcellsparker och industrianläggningar", "Villatak med solpaneler", "Kvalitetskontroll vid installation", "Periodisk underhållsinspektion"], keyFeatures: ["Termisk kamera med hög upplösning", "Automatisk hotspot-detektering", "Täck 100+ paneler per timme", "Exporterbara rapporter för underhållsteam"] },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Bäst för inspektion",
        desc: "Kraftfull plattform med stöd för termisk, zoom och multispektralkamera. IP55-skydd.",
        features: ["55 min flygtid", "IP55 väderskydd", "RTK-precision", "Multi-sensor"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Kompakt inspektion",
        desc: "4/3-sensor med mekanisk slutare i ett portabelt format. Perfekt för snabba inspektioner; 3T-varianten har termisk kamera.",
        features: ["45 min flygtid", "4/3 CMOS, mekanisk slutare", "RTK-modul", "56× hybridzoom"],
      },
    ],
    benefits: [
      "80% snabbare inspektioner jämfört med traditionella metoder",
      "Eliminerar behov av byggnadsställning och klättring",
      "Dokumentation med termisk och visuell data i hög upplösning",
      "AI-assisterad analys och automatiserad rapportgenerering",
    ],
    faq: [
      { question: "Hur snabbt kan en drönarinspektion genomföras?", answer: "En typisk takinspektion tar 15–30 minuter jämfört med en hel dag med byggnadsställning. Stora anläggningar som vindparker kan inspekteras på timmar istället för veckor." },
      { question: "Behöver jag flygtillstånd för inspektion med drönare?", answer: "I de flesta fall krävs registrering hos Transportstyrelsen och en drönaroperatör med rätt behörighet. EU Drone Company hjälper dig med alla tillstånd och kan utföra flygningen åt dig." },
      { question: "Vilken upplösning får jag på inspektionsbilderna?", answer: "Med DJI Matrice 350 RTK och 200× zoom kan du se detaljer ner till millimeternivå. Termisk kamera detekterar temperaturskillnader på 0,1°C." },
      { question: "Kan drönare inspektera i dåligt väder?", answer: "DJI Matrice 350 RTK har IP55-skydd och klarar lätt regn och vind upp till 12 m/s. Vid kraftig storm rekommenderar vi att vänta." },
    ],
  },
  {
    slug: "lantbruk",
    icon: TreePine,
    title: "Lantbruk & Precision",
    shortDesc: "Fältkartläggning, växtanalys, sprutning och skördeövervakning med hög precision.",
    heroTitle: "Drönare för Lantbruk & Precision",
    heroDesc: "Maximera skördar och minimera resurser med precisionsdrönare för fältkartläggning, sprutning och växtanalys.",
    solutions: [
      { slug: "precisionsspruta", title: "Precisionsspruta", desc: "Automatiserad sprutning med centimeterprecision. Reducera kemikalieanvändning med upp till 30%.", longDesc: "Sprutdrönare som DJI Agras T50 möjliggör precisionsbekämpning med centimeterprecision. Terrängföljning och AI-styrda sprutmönster reducerar kemikalieanvändning med upp till 30% jämfört med konventionella metoder.", seoTitle: "Precisionsspruta med Drönare — Minska Kemikalier | EU Drone Company", seoDesc: "Automatiserad precisionsspruta med drönare. Reducera kemikalieanvändning upp till 30%. Kontakta EU Drone Company för lantbruksdrönare.", useCases: ["Växtskydd i spannmål och oljeväxter", "Precisionsbekämpning av ogräs", "Behandling av svårtillgängliga fält", "Storskalig odling med minskad miljöpåverkan"], keyFeatures: ["40L spruttank med terrängföljning", "AI-styrd sprutoptimering", "Centimeterprecision med RTK", "Täck upp till 20 hektar per timme"] },
      { slug: "faltkartlaggning", title: "Fältkartläggning", desc: "Skapa NDVI-kartor och ortomosaiker för att identifiera problemområden tidigt.", longDesc: "Multispektrala drönare skapar NDVI-kartor och ortomosaiker som avslöjar variationer i grödors hälsa. Identifiera stresszoner, näringsbrister och bevattningsproblem innan de syns med blotta ögat.", seoTitle: "Fältkartläggning med Drönare — NDVI & Ortomosaik | EU Drone Company", seoDesc: "Kartlägg fält med multispektral drönare. NDVI-kartor och ortomosaiker för precisionsodling. Begär offert från EU Drone Company.", useCases: ["Säsongsövervakning av grödor", "Bevattningsoptimering", "Jordbruksplanering och zonindelning", "Dokumentation för EU-stöd och miljöcertifiering"], keyFeatures: ["Multispektral sensor (NDVI, NDRE)", "RTK-precision för exakta kartor", "Automatisk ortomosaikgenerering", "Integration med Farm Management-system"] },
      { slug: "vaxtanalys", title: "Växtanalys", desc: "Multispektralkameror avslöjar stress, sjukdomar och näringsbrist innan de syns med blotta ögat.", longDesc: "Med multispektral drönardata kan du identifiera växtsjukdomar, skadedjursangrepp och näringsbrister veckor innan problemen blir synliga. Detta möjliggör riktade åtgärder och sparar både resurser och skörd.", seoTitle: "Växtanalys med Drönare — Tidig Detektion | EU Drone Company", seoDesc: "Upptäck sjukdomar och näringsbrist tidigt med multispektral drönaranalys. Skydda din skörd med EU Drone Company.", useCases: ["Tidig sjukdomsdetektion i potatis och sockerbetor", "Skadedjursövervakning i fruktodlingar", "Näringsanalys för variabel giva", "Kvalitetsuppföljning under växtsäsongen"], keyFeatures: ["Multispektral bildanalys", "AI-driven anomalidetektering", "Historisk jämförelse över säsonger", "Exporterbara rapporter till agronomer"] },
      { slug: "godslingsspridning", title: "Gödslingsspridning", desc: "Granulat- och frögödselspridning med hög precision och jämn fördelning.", longDesc: "Spridningsdrönare kan sprida granulat, utsäde och gödsel med hög precision och jämn fördelning. Idealiskt för svårtillgängliga fält, blöta marker eller situationer där tunga maskiner skadar jorden.", seoTitle: "Gödslingsspridning med Drönare — Precisionsgödsling | EU Drone Company", seoDesc: "Sprid gödsel och utsäde med drönare. Hög precision utan markpackning. Kontakta EU Drone Company för offert.", useCases: ["Gödsling av blöta eller lutande fält", "Utsädesspridning i svårtillgängliga områden", "Kompletterande gödsling under växtsäsongen", "Kalkspridning och pH-korrigering"], keyFeatures: ["50 kg spridarlast per flygning", "Variabel spridning baserat på kartor", "Ingen markpackning", "GPS-styrda spridningsmönster"] },
    ],
    recommendedDrones: [
      {
        name: "DJI Agras T50",
        tag: "Lantbruk & Sprutning",
        desc: "Automatiserad precisionsspruta med 40 liter tank och terrängföljning.",
        features: ["40 L spruttank", "Terrängföljning", "AI-sprutning", "50 kg spridarlast"],
      },
      {
        name: "DJI Mavic 3 Multispectral",
        tag: "Fältkartläggning",
        desc: "Multispektralkamera för NDVI-analys och vegetationsövervakning.",
        features: ["43 min flygtid", "Multispektral sensor", "RTK-precision", "Autonom flygning"],
      },
    ],
    benefits: [
      "Upp till 30% reducerad kemikalieanvändning",
      "Täck 100+ hektar per dag med sprutdrönare",
      "Tidig detektering av sjukdomar och skadedjur",
      "Exakt data för variabel giva och precisionsodling",
    ],
    faq: [
      { question: "Hur mycket areal kan en sprutdrönare täcka per dag?", answer: "DJI Agras T50 kan täcka upp till 20 hektar per timme, vilket innebär att du kan behandla över 100 hektar på en arbetsdag." },
      { question: "Är det lagligt att spruta med drönare i Sverige?", answer: "Ja, men det krävs särskilt tillstånd från Kemikalieinspektionen och Jordbruksverket. EU Drone Company hjälper dig med ansökan och regelefterlevnad." },
      { question: "Vilka grödor passar bäst för drönarspruta?", answer: "Sprutdrönare fungerar utmärkt för spannmål, oljeväxter, potatis, fruktodlingar och skog. Särskilt effektivt på blöta eller kuperade fält där traktorer har svårt att köra." },
      { question: "Hur exakt är multispektral växtanalys?", answer: "Med DJI Mavic 3 Multispectral och RTK-positionering kan du identifiera stresszoner redan 2–3 veckor innan de syns med blotta ögat, med centimeterprecision." },
    ],
  },
  {
    slug: "kartlaggning",
    icon: Map,
    title: "Kartläggning & Mätning",
    shortDesc: "3D-modeller, ortomosaiker och volymberäkningar för bygg, gruva och samhällsplanering.",
    heroTitle: "Drönare för Kartläggning & Mätning",
    heroDesc: "Skapa exakta 3D-modeller, ortomosaiker och volymberäkningar med RTK-precision för bygg, gruva och planering.",
    solutions: [
      { slug: "3d-modellering", title: "3D-modellering", desc: "Fotogrammetri med centimeterprecision för arkitektur, bygg och kulturarv.", longDesc: "Skapa fotorealistiska 3D-modeller med centimeterprecision genom drönarbaserad fotogrammetri. Perfekt för byggdokumentation, arkitektur, kulturarvsinventering och marknadsföring av fastigheter.", seoTitle: "3D-modellering med Drönare — Fotogrammetri | EU Drone Company", seoDesc: "Skapa exakta 3D-modeller med drönarbaserad fotogrammetri. Bygg, arkitektur och kulturarv. Kontakta EU Drone Company.", useCases: ["Byggdokumentation och projektuppföljning", "Kulturarvsinventering och digitalisering", "Fastighetspresentation med 3D-modell", "Arkitekturplanering och visualisering"], keyFeatures: ["Centimeterprecision med RTK", "Fotorealistiska 3D-modeller", "Export till CAD/BIM-format", "Automatisk punktmolnsgenerering"] },
      { slug: "volymberakning", title: "Volymberäkning", desc: "Mät stockhögar, gravar och materialvolymer med drönare istället för manuell mätning.", longDesc: "Drönarbaserad volymberäkning ersätter tidskrävande manuell mätning med exakta resultat på minuter. Beräkna volymer av stockhögar, grushögar, grävda schakt och materialupplag med hög noggrannhet.", seoTitle: "Volymberäkning med Drönare — Exakt & Snabbt | EU Drone Company", seoDesc: "Mät volymer med drönare istället för manuell mätning. Stockhögar, grushögar och schakt. Kontakta EU Drone Company.", useCases: ["Lagervolymberäkning i gruvor och täkter", "Stockmätning i skogsindustrin", "Massabalansberäkning vid schaktarbeten", "Inventering av materialupplag"], keyFeatures: ["Noggrannhet inom 1-2% av verklig volym", "RTK-precision", "Automatisk rapport med volymdata", "Jämförelse över tid med historisk data"] },
      { slug: "terrangmodeller", title: "Terrängmodeller", desc: "Digitala terrängmodeller (DTM/DSM) för markplanering och infrastrukturprojekt.", longDesc: "Skapa digitala terrängmodeller (DTM) och ytmodeller (DSM) med drönardata för markplanering, väg- och ledningsprojekt och hydrologisk analys. Snabbare och billigare än traditionella metoder.", seoTitle: "Terrängmodeller med Drönare — DTM/DSM | EU Drone Company", seoDesc: "Skapa digitala terrängmodeller med drönare. DTM/DSM för bygg, infrastruktur och planering. Kontakta EU Drone Company.", useCases: ["Vägplanering och projektering", "Hydrologisk analys och dagvattenhantering", "Markförberedelse och massbalans", "Detaljplaner och exploateringsprojekt"], keyFeatures: ["Hög punktdensitet med LiDAR eller fotogrammetri", "DTM/DSM i standard GIS-format", "Höjdkurvor och sektionsritningar", "Integration med CAD och GIS-system"] },
      { slug: "bim-integration", title: "BIM-integration", desc: "Exportera drönardata direkt till BIM-system för byggprojektsuppföljning.", longDesc: "Integrera drönardata direkt i BIM-system för att jämföra planerat bygge mot verklighet. Följ upp byggprojekt med regelbundna drönarflygningar och identifiera avvikelser tidigt.", seoTitle: "BIM-integration med Drönardata — Bygguppföljning | EU Drone Company", seoDesc: "Integrera drönardata i BIM-system. Jämför planerat mot byggt och följ upp byggprojekt. Kontakta EU Drone Company.", useCases: ["Regelbunden byggplatsuppföljning", "Avvikelseanalys mot BIM-modell", "As-built dokumentation", "Kvalitetssäkring vid betonggjutningar"], keyFeatures: ["Automatisk jämförelse med BIM", "Punktmoln i IFC/RCP-format", "Regelbunden flygschemaläggning", "Avvikelserapporter med visualisering"] },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Professionell kartläggning",
        desc: "Hög precision med RTK och stöd för LiDAR och fotogrammetrikameror.",
        features: ["55 min flygtid", "RTK-precision", "LiDAR-stöd", "Multi-payload"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb kartläggning",
        desc: "Mekanisk slutare och RTK för effektiv kartläggning i kompakt format.",
        features: ["45 min flygtid", "Mekanisk slutare", "RTK-modul", "4/3 CMOS"],
      },
    ],
    benefits: [
      "90% tidsbesparing jämfört med traditionell landmätning",
      "Centimeterprecision med RTK-positionering",
      "Automatisk generering av ortomosaiker och 3D-modeller",
      "Sömlös integration med CAD och BIM-system",
    ],
    faq: [
      { question: "Hur exakt är drönarbaserad kartläggning?", answer: "Med RTK-positionering uppnår vi centimeterprecision (1–3 cm) horisontellt och vertikalt, jämförbart med traditionell landmätning men mycket snabbare." },
      { question: "Vilka filformat kan jag exportera drönardata till?", answer: "Vi stödjer alla branschstandarder: GeoTIFF, LAS/LAZ (punktmoln), OBJ/FBX (3D-modeller), DXF/DWG (CAD) och IFC (BIM). Integration med Pix4D, DJI Terra och Agisoft." },
      { question: "Hur stor yta kan kartläggas på en dag?", answer: "Med DJI Matrice 350 RTK kan du kartlägga 50–100 hektar per dag beroende på önskad upplösning och överlappning." },
      { question: "Kan drönardata ersätta traditionell landmätning?", answer: "För de flesta tillämpningar ja — topografikartor, volymberäkningar och terrängmodeller. För juridiskt bindande gränsmätning krävs fortfarande auktoriserad lantmätare." },
    ],
  },
  {
    slug: "sakerhet",
    icon: Eye,
    title: "Säkerhet & Övervakning",
    shortDesc: "Bevakningsflygningar, perimetersäkerhet och räddningsinsatser med realtidsvideo.",
    heroTitle: "Drönare för Säkerhet & Övervakning",
    heroDesc: "Förbättra säkerheten med drönarbaserad övervakning, perimeterskydd och snabb insats vid incidenter.",
    solutions: [
      { slug: "perimetersakerhet", title: "Perimetersäkerhet", desc: "Automatiserade bevakningsrutter med realtidsvideo och termisk detektion.", longDesc: "Drönare möjliggör automatiserad perimetersäkerhet med programmerade bevakningsrutter, realtidsvideo och termisk detektion. Täck stora områden snabbt och kostnadseffektivt dygnet runt.", seoTitle: "Perimetersäkerhet med Drönare — Bevakning | EU Drone Company", seoDesc: "Automatiserad perimetersäkerhet med drönare. Realtidsvideo och termisk detektion dygnet runt. Kontakta EU Drone Company.", useCases: ["Industriområden och lager", "Hamnar och logistikanläggningar", "Kritisk infrastruktur", "Evenemang och tillfälliga säkerhetszoner"], keyFeatures: ["Automatiserade bevakningsrutter", "Termisk detektion dygnet runt", "Realtidsvideo till kontrollcentral", "Larmdetektion med AI"] },
      { slug: "raddningsinsatser", title: "Räddningsinsatser", desc: "Snabb uppsikt vid olyckor, bränder och eftersökning med termisk kamera.", longDesc: "Vid olyckor och räddningsinsatser ger drönare omedelbar överblick. Termisk kamera hittar personer i mörker och rök, medan realtidsvideo hjälper insatsledningen att fatta snabbare beslut.", seoTitle: "Räddningsinsatser med Drönare — Snabb Insats | EU Drone Company", seoDesc: "Drönare för räddningsinsatser. Termisk kamera för eftersökning och överblick vid olyckor. Kontakta EU Drone Company.", useCases: ["Brand och rökdykning — överblick och termisk sökning", "Eftersökning av försvunna personer", "Trafikolyckor och incidenthantering", "Naturkatastrofer och översvämningar"], keyFeatures: ["Termisk kamera för persondetektion", "Flygklar på under 60 sekunder", "Realtidsvideo till insatsledning", "Spotlight och högtalare"] },
      { slug: "eventbevakning", title: "Eventbevakning", desc: "Överblick vid stora evenemang och folksamlingar med livestreaming.", longDesc: "Vid stora evenemang ger drönare en unik överblick för säkerhetspersonal. Livestreaming till kontrollcentral, folkströmsanalys och snabb insats vid incidenter.", seoTitle: "Eventbevakning med Drönare — Livestreaming | EU Drone Company", seoDesc: "Bevakning av evenemang med drönare. Livestreaming och folkströmsanalys. Kontakta EU Drone Company.", useCases: ["Konserter och festivaler", "Sportevenemang och matcher", "Demonstrationer och manifestationer", "Företagsevent och mässor"], keyFeatures: ["Livestreaming i 4K", "Folkströmsanalys med AI", "Diskret övervakning på hög höjd", "Lång flygtid för hela evenemang"] },
      { slug: "industriell-sakerhet", title: "Industriell säkerhet", desc: "Gasläckedetektion och säkerhetsinspektion i farliga miljöer.", longDesc: "I farliga industrimiljöer kan drönare utföra inspektioner utan att utsätta personal för risk. Gasläckedetektion, termisk övervakning och inspektion av svårtillgängliga anläggningar.", seoTitle: "Industriell Säkerhet med Drönare — Gasläckedetektion | EU Drone Company", seoDesc: "Drönare för industriell säkerhet. Gasläckedetektion och inspektion i farliga miljöer. Kontakta EU Drone Company.", useCases: ["Raffinaderier och kemianläggningar", "Gasrörsinspektion och läcksökning", "Cisterninspektion utan entry", "Miljöövervakning vid industriområden"], keyFeatures: ["Gasdetekteringssensorer", "Explosionsskyddad design", "Termisk övervakning", "Inspektion utan confined space entry"] },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Professionell bevakning",
        desc: "Lång flygtid, termisk kamera och zoom för krävande uppdrag.",
        features: ["55 min flygtid", "IP55 väderskydd", "Termisk + zoom", "Realtidsvideo"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabb insats",
        desc: "Kompakt och snabbt redo — perfekt för snabba utryckningar och patrullering.",
        features: ["45 min flygtid", "Termisk kamera (3T)", "Högtalare", "Spotlight"],
      },
    ],
    benefits: [
      "Täck stora områden snabbt med realtidsöverblick",
      "Termisk detektion dygnet runt, oavsett ljusförhållanden",
      "Minska behovet av fysisk patrullering",
      "Snabb deployment — flygklar på under 60 sekunder",
    ],
    faq: [
      { question: "Kan drönare användas för nattlig bevakning?", answer: "Ja, med termisk kamera kan drönare detektera människor och fordon i totalt mörker. DJI Matrice 350 RTK har även spotlight för belysning." },
      { question: "Hur lång räckvidd har bevakningsdrönare?", answer: "DJI Matrice 350 RTK har en räckvidd på upp till 20 km med O3 Enterprise-transmission, men operativ räckvidd begränsas av lokala flygbestämmelser." },
      { question: "Kan drönare integreras med befintliga säkerhetssystem?", answer: "Ja, DJI FlightHub 2 kan integreras med de flesta VMS-system (Video Management System) och larmsystem för automatiserad respons." },
      { question: "Hur snabbt kan en bevakningsdrönare vara i luften?", answer: "Med DJI Dock 2 (dockningsstation) kan drönaren vara i luften automatiskt på under 60 sekunder efter larmaktivering, helt utan mänsklig intervention." },
    ],
  },
  {
    slug: "energi",
    icon: Zap,
    title: "Energi & Elnät",
    shortDesc: "Inspektion av kraftledningar, transformatorer och energianläggningar utan driftstopp.",
    heroTitle: "Drönare för Energi & Elnät",
    heroDesc: "Inspektera kraftledningar, transformatorstationer och energiinfrastruktur säkert och effektivt utan driftstopp.",
    solutions: [
      { slug: "ledningsinspektion", title: "Ledningsinspektion", desc: "Automatiserad inspektion av kraftledningar med zoom och termisk kamera.", longDesc: "Drönare inspekterar kraftledningar snabbt och säkert utan att personal behöver klättra i master eller använda helikopter. Termisk kamera identifierar hotspots och zoom avslöjar mekaniska skador.", seoTitle: "Ledningsinspektion med Drönare — Kraftledningar | EU Drone Company", seoDesc: "Inspektera kraftledningar med drönare. Termisk och visuell inspektion utan helikopter. Kontakta EU Drone Company.", useCases: ["Regionsinspektion av transmissionsnät", "Vegetationsanalys längs ledningsgator", "Stormskadeinspektion", "Periodisk underhållsinspektion"], keyFeatures: ["Automatiserade flygmönster längs ledningar", "Termisk hotspot-detektion", "200× zoom för detaljgranskning", "AI-assisterad skadeklassificering"] },
      { slug: "transformatorinspektion", title: "Transformatorinspektion", desc: "Detektera hotspots och anomalier i transformatorer och ställverk.", longDesc: "Termisk drönarinspektion av transformatorer och ställverk identifierar överbelastade komponenter, dåliga anslutningar och begynnande fel innan de leder till haveri och strömavbrott.", seoTitle: "Transformatorinspektion med Drönare — Termisk Analys | EU Drone Company", seoDesc: "Inspektera transformatorer med termisk drönare. Hitta hotspots innan de orsakar haveri. Kontakta EU Drone Company.", useCases: ["Ställverksinspektion utan avbrott", "Termisk övervakning av transformatorer", "Dokumentation för underhållsplanering", "Kabelbropps- och isolatorinspektion"], keyFeatures: ["Termisk kamera med hög upplösning", "Zoom för isolator- och anslutningsdetaljer", "Inspektion utan driftstopp", "Automatiserade rapporter med termogrammer"] },
      { slug: "solparksinspektion", title: "Solparksinspektion", desc: "Storskalig termisk analys av solcellsparker för att maximera produktion.", longDesc: "Drönare med termisk kamera kan snabbt täcka stora solcellsparker och identifiera defekta moduler, hotspots och anslutningsfel som minskar energiproduktionen.", seoTitle: "Solparksinspektion med Drönare — Maximera Produktion | EU Drone Company", seoDesc: "Termisk inspektion av solcellsparker med drönare. Hitta defekta moduler och maximera produktion. Kontakta EU Drone Company.", useCases: ["Storskaliga solcellsparker (MW-klassen)", "Garantiärenden och modulreklamationer", "Periodisk underhållsinspektion", "Kvalitetskontroll vid nyinstallation"], keyFeatures: ["Termisk avbildning av hela parken", "Automatisk defektklassificering", "MW-skala på timmar istället för veckor", "IEC-kompatibla inspektionsrapporter"] },
      { slug: "vindkraftsinspektion-energi", title: "Vindkraftsinspektion", desc: "Bladinspektion med AI-analys och automatiserad rapportering.", longDesc: "Vindkraftsinspektioner med drönare minskar stilleståndstid och inspektionskostnader drastiskt. AI-baserad bildanalys klassificerar skador och genererar underhållsrekommendationer automatiskt.", seoTitle: "Vindkraftsinspektion med Drönare — AI-analys | EU Drone Company", seoDesc: "Inspektera vindkraftverk med drönare och AI. Minska stillestånd och inspektionskostnader. Kontakta EU Drone Company.", useCases: ["On- och offshore-vindparker", "Periodisk bladinspektion", "Stormskadeinspektion", "Garantiuppföljning och dokumentation"], keyFeatures: ["AI-baserad skadeklassificering", "Automatiserade inspektionsmönster", "Jämförelse med tidigare inspektioner", "Integration med CMMS-system"] },
    ],
    recommendedDrones: [
      {
        name: "DJI Matrice 350 RTK",
        tag: "Kraftverksinspektion",
        desc: "Den mest använda drönaren i energisektorn med stöd för alla sensortyper.",
        features: ["55 min flygtid", "IP55 väderskydd", "RTK-precision", "Multi-sensor"],
      },
      {
        name: "DJI Mavic 3 Enterprise",
        tag: "Snabbinspektion",
        desc: "Snabb och enkel inspektion av enskilda master och anläggningar.",
        features: ["45 min flygtid", "Termisk kamera (3T)", "56× hybridzoom", "RTK-modul"],
      },
    ],
    benefits: [
      "Inspektera utan driftstopp och utan att klättra i master",
      "Identifiera termiska anomalier innan de orsakar haveri",
      "Automatiserade inspektionsrutter med repeterbara resultat",
      "Drastiskt minskade inspektionskostnader",
    ],
    faq: [
      { question: "Kan drönare inspektera kraftledningar under drift?", answer: "Ja, en av de stora fördelarna är att inspektionen kan ske utan driftstopp. Drönaren flyger säkert nära ledningarna utan risk för personskada." },
      { question: "Hur ofta bör energiinfrastruktur inspekteras?", answer: "Vi rekommenderar årliga inspektioner av kraftledningar och transformatorer, med extra inspektion efter stormar eller extremväder." },
      { question: "Kan termisk kamera hitta dolda fel?", answer: "Ja, termisk drönarinspektion avslöjar överbelastade komponenter, dåliga anslutningar och isolationsfel som inte syns visuellt — innan de orsakar haveri." },
      { question: "Vad kostar en drönarinspektion jämfört med helikopter?", answer: "Drönarinspektion kostar typiskt 70–80% mindre än helikopterinspektion, samtidigt som datakvaliteten ofta är högre tack vare närmare flygning och bättre kameror." },
    ],
  },
  {
    slug: "film-media",
    icon: Camera,
    title: "Film & Media",
    shortDesc: "Professionell flygfotografering och videoproduktion för fastigheter, event och marknadsföring.",
    heroTitle: "Drönare för Film & Media",
    heroDesc: "Professionell flygfotografering och filmproduktion för fastigheter, marknadsföring och kreativa projekt.",
    solutions: [
      { slug: "fastighetsfotografi", title: "Fastighetsfotografi", desc: "Flygbilder och video som säljer fastigheter snabbare. 360°-vyer och virtuella turer.", longDesc: "Flygfotografering och video med drönare säljer fastigheter snabbare och till bättre pris. 360°-vyer, virtuella turer och dramatiska flygbilder ger köpare en unik upplevelse av fastigheten.", seoTitle: "Fastighetsfotografi med Drönare — Sälj Snabbare | EU Drone Company", seoDesc: "Flygfotografering av fastigheter med drönare. Sälj snabbare med professionella flygbilder och video. Kontakta EU Drone Company.", useCases: ["Villaförsäljning och bostadsrätter", "Kommersiella fastigheter och kontor", "Nyproduktion och byggprojekt", "Lantbruksfastigheter och skogsfastigheter"], keyFeatures: ["4K/5.1K flygvideo", "360°-panorama och virtuella turer", "Hasselblad-kvalitet", "Samma dag-leverans möjlig"] },
      { slug: "filmproduktion", title: "Filmproduktion", desc: "Cinematic 5.1K-video med professionell färgåtergivning för reklamfilm och dokumentär.", longDesc: "Professionell filmproduktion med drönare ger cinematiska flygsekvenser i upp till 8K RAW. Utbytbara objektiv, FPV-flygning och professionell färgåtergivning för reklamfilm, dokumentärer och spelfilm.", seoTitle: "Filmproduktion med Drönare — 8K Cinematic | EU Drone Company", seoDesc: "Professionell filmproduktion med drönare. 8K RAW, utbytbara objektiv och FPV-flygning. Kontakta EU Drone Company.", useCases: ["Reklamfilm och varumärkesvideo", "Dokumentärfilm och TV-produktion", "Musikvideor", "Spelfilmsproduktion"], keyFeatures: ["8K RAW-video med full-frame sensor", "Utbytbara objektiv (DL-mount)", "FPV-styrning för dynamiska sekvenser", "D-Log och Apple ProRes-stöd"] },
      { slug: "eventfilmning", title: "Eventfilmning", desc: "Dynamiska flygtagningar av konserter, sportevent och företagsevent.", longDesc: "Fånga evenemang från en unik vinkel med drönarfilmning. Dynamiska flygtagningar, livestreaming och efterproduktionsfärdigt material för konserter, sportevent och företagsevent.", seoTitle: "Eventfilmning med Drönare — Dynamiska Flygbilder | EU Drone Company", seoDesc: "Filma evenemang med drönare. Dynamiska flygtagningar av konserter, sport och företagsevent. Kontakta EU Drone Company.", useCases: ["Musikfestivaler och konserter", "Sporttävlingar och matcher", "Företagskonferenser och kickoffs", "Bröllopsfotografi och video"], keyFeatures: ["4K/5.1K livestreaming", "Tyst flygning med låg ljudnivå", "Snabb setup och professionell pilot", "Efterproduktionsfärdigt material"] },
      { slug: "byggdokumentation", title: "Byggdokumentation", desc: "Tidslaps och projektuppföljning från luften genom hela byggprocessen.", longDesc: "Dokumentera hela byggprocessen från luften med regelbundna drönarflygningar. Skapa tidslaps, ortomosaiker och 3D-modeller för projektuppföljning, kvalitetssäkring och marknadsföring.", seoTitle: "Byggdokumentation med Drönare — Tidslaps & 3D | EU Drone Company", seoDesc: "Dokumentera byggprojekt med drönare. Tidslaps, ortomosaiker och 3D-modeller. Kontakta EU Drone Company.", useCases: ["Löpande projektdokumentation", "Tidslaps för marknadsföring", "Kvalitetssäkring och avvikelseanalys", "Slutdokumentation och as-built"], keyFeatures: ["Regelbundna flygningar med samma position", "Automatisk tidslaps-generering", "Ortomosaik och 3D-modell vid varje flygning", "Jämförelse mot ritningar och BIM"] },
    ],
    recommendedDrones: [
      {
        name: "DJI Inspire 3",
        tag: "Professionell film",
        desc: "8K RAW-video med utbytbara objektiv. Branschstandard för filmbranschen.",
        features: ["8K RAW video", "Full-frame sensor", "Utbytbara objektiv", "FPV-styrning"],
      },
      {
        name: "DJI Mavic 3 Pro",
        tag: "Allround kreativ",
        desc: "Tre kameror i ett kompakt format — 24mm, 70mm och 166mm för maximal kreativ frihet.",
        features: ["43 min flygtid", "3 kameror", "5.1K video", "Hasselblad"],
      },
    ],
    benefits: [
      "Professionell 4K/8K-video för alla produktionstyper",
      "Snabb setup — flygklar på minuter istället för timmar",
      "Drastiskt lägre kostnad jämfört med helikopterfilmning",
      "Kreativa vinklar och rörelser som inte är möjliga annars",
    ],
    faq: [
      { question: "Behöver jag flygcertifikat för drönarfilmning?", answer: "Ja, kommersiell drönarflygning kräver registrering hos Transportstyrelsen och relevant behörighet. EU Drone Company erbjuder utbildning och kan även tillhandahålla certifierade piloter." },
      { question: "Vilken bildkvalitet kan jag förvänta mig?", answer: "DJI Inspire 3 levererar 8K RAW-video med full-frame sensor och utbytbara objektiv — samma kvalitet som används i Hollywood-produktioner och internationella reklamfilmer." },
      { question: "Kan man filma inomhus med drönare?", answer: "Ja, med övningsflyg och manuellt läge. DJI Avata 2 och FPV-drönare är populära för dynamiska inomhussekvenser i lager, fabriker och evenemangslokaler." },
      { question: "Hur lång tid tar det att få färdigt material?", answer: "Enkla flygtagningar kan levereras samma dag. Komplexa produktioner med efterbearbetning tar vanligtvis 3–5 arbetsdagar." },
    ],
  },
];

export function getIndustryBySlug(slug: string): IndustryData | undefined {
  return INDUSTRY_DATA.find((i) => i.slug === slug);
}

export function getSolutionBySlug(industrySlug: string, solutionSlug: string): { industry: IndustryData; solution: IndustrySolution } | undefined {
  const industry = getIndustryBySlug(industrySlug);
  if (!industry) return undefined;
  const solution = industry.solutions.find((s) => s.slug === solutionSlug);
  if (!solution) return undefined;
  return { industry, solution };
}
