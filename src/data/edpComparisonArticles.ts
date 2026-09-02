import type { EdpFaqItem } from "@/data/edpIndustryPages";

export interface EdpComparisonArticle {
  handle: string;
  title: string;
  eyebrow: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  cameraIds: string[];
  introParagraphs: string[];
  verdictParagraphs: string[];
  faq: EdpFaqItem[];
}

export const EDP_COMPARISON_BLOG = {
  handle: "jamforer",
  title: "Jämförer",
  metaTitle: "Jämför drönarkameror & Zenmuse-sensorer | EU Drone Company",
  metaDescription:
    "Jämför professionella drönarkameror och Zenmuse-payloads sida vid sida. Hitta rätt kamera för inspektion, termisk avbildning, LiDAR och fotogrammetri.",
  templateSuffix: "jamforer",
} as const;

export const EDP_COMPARISON_ARTICLES: EdpComparisonArticle[] = [
  {
    handle: "zenmuse-h30t-vs-h30",
    title: "Zenmuse H30T vs H30 — vilken ska du välja?",
    eyebrow: "Inspektion & zoom",
    excerpt:
      "Jämför Zenmuse H30T och H30 — samma 34× optisk zoom men H30T har termisk sensor. Se vilken payload som passar ditt uppdrag.",
    metaTitle: "Zenmuse H30T vs H30 — jämförelse | EU Drone Company",
    metaDescription:
      "Jämför Zenmuse H30T och H30. Skillnader i termisk sensor, vikt och användningsområden. Hitta rätt inspektionskamera för Matrice 350 RTK.",
    tags: ["jämförelse", "zenmuse", "h30", "inspektion"],
    cameraIds: ["zenmuse-h30t", "zenmuse-h30"],
    introParagraphs: [
      "Zenmuse H30-serien är DJI:s senaste generation av hybridpayloads med 34× optisk zoom och laser-avståndsmätare. Den centrala skillnaden mellan H30T och H30 är termisk sensor — men det påverkar både pris, vikt och användningsområden.",
      "I den här jämförelsen går vi igenom specifikationerna sida vid sida så du kan välja rätt payload för dina inspektions- och säkerhetsuppdrag.",
    ],
    verdictParagraphs: [
      "Välj Zenmuse H30T om du behöver termisk avbildning för energiinspektion, räddningstjänst eller säkerhetsövervakning. Termisk sensorn (1280×1024) ger betydligt bättre upplösning än föregående generation.",
      "Välj Zenmuse H30 om du primärt behöver högupplöst zoom och laser-avståndsmätning utan termisk kamera — ett kostnadseffektivt val för visuell inspektion och kartläggning.",
    ],
    faq: [
      {
        question: "Kan jag uppgradera från H30 till H30T senare?",
        answer:
          "Ja, båda monteras på samma Matrice-plattformar. Många operatörer börjar med H30 och kompletterar med H30T när termiska uppdrag tillkommer.",
      },
      {
        question: "Hur mycket tyngre är H30T?",
        answer: "H30T väger cirka 60 g mer än H30 (920 g vs 860 g) på grund av den integrerade termiska sensorn.",
      },
    ],
  },
  {
    handle: "zenmuse-h30t-vs-h20t",
    title: "Zenmuse H30T vs H20T — är uppgraderingen värd det?",
    eyebrow: "Termisk inspektion",
    excerpt:
      "Jämför nästa generations H30T med etablerade H20T. Se skillnader i zoom, termisk upplösning och laser-räckvidd.",
    metaTitle: "Zenmuse H30T vs H20T — jämförelse | EU Drone Company",
    metaDescription:
      "Jämför Zenmuse H30T och H20T för termisk inspektion. 34× vs 23× zoom, 1280×1024 vs 640×512 termisk, och förbättrad laser-avståndsmätare.",
    tags: ["jämförelse", "zenmuse", "termisk", "inspektion"],
    cameraIds: ["zenmuse-h30t", "zenmuse-h20t"],
    introParagraphs: [
      "Zenmuse H20T har varit branschstandard för termisk drönarinspektion i flera år. Med H30T tar DJI ett stort steg framåt med högre zoom, bättre termisk upplösning och längre laser-räckvidd.",
      "Här jämför vi de två modellerna för att hjälpa dig bedöma om det är dags att uppgradera din flotta.",
    ],
    verdictParagraphs: [
      "Uppgradera till H30T om du regelbundet inspekterar på långt avstånd (34× zoom vs 23×), behöver skarpare termiska bilder (1280×1024 vs 640×512), eller mäter avstånd över 1200 meter.",
      "H20T är fortfarande ett kapabelt val om budgeten är begränsad och dina inspektionsuppdrag inte kräver den extra räckvidden och upplösningen.",
    ],
    faq: [
      {
        question: "Fungerar H20T på samma drönare som H30T?",
        answer:
          "Båda fungerar på Matrice 300 RTK och Matrice 350 RTK. H30T stöds även på Matrice 400 RTK.",
      },
      {
        question: "Är termisk upplösningen märkbar i praktiken?",
        answer:
          "Ja — H30T:s 1280×1024 termiska sensor ger fyrdubblad pixeldensitet jämfört med H20T:s 640×512, vilket gör det enklare att identifiera mindre temperaturavvikelser.",
      },
    ],
  },
  {
    handle: "zenmuse-p1-vs-l2",
    title: "Zenmuse P1 vs L2 — fotogrammetri eller LiDAR?",
    eyebrow: "Kartläggning",
    excerpt:
      "Jämför Zenmuse P1 (45 MP fotogrammetri) och L2 (LiDAR + RGB). Vilken kartläggningspayload passar ditt GIS-projekt?",
    metaTitle: "Zenmuse P1 vs L2 — jämförelse | EU Drone Company",
    metaDescription:
      "Jämför Zenmuse P1 och L2 för drönarbaserad kartläggning. Fotogrammetri vs LiDAR — noggrannhet, vegetation, användningsområden och pris.",
    tags: ["jämförelse", "zenmuse", "lidar", "fotogrammetri", "gis"],
    cameraIds: ["zenmuse-p1", "zenmuse-l2"],
    introParagraphs: [
      "För professionell kartläggning med enterprise-drönare finns två huvudsakliga Zenmuse-alternativ: P1 för fotogrammetri och L2 för LiDAR. De komplettrar varandra men löser olika problem.",
      "Fotogrammetri ger högkvalitativa ortofoton och 3D-modeller, medan LiDAR penetrerar vegetation och levererar exakta punktmoln oberoende av ljusförhållanden.",
    ],
    verdictParagraphs: [
      "Välj Zenmuse P1 för fotogrammetrisk kartläggning, ortomosaiker och 3D-modellering där visuell detalj och färginformation är viktigt. 45 MP fullformats-sensor med mekanisk slutare ger branschledande bildkvalitet.",
      "Välj Zenmuse L2 för LiDAR-baserad kartläggning genom vegetation, skogsinventering, volymberäkning och infrastrukturmätning där punktmoln med hög densitet krävs.",
    ],
    faq: [
      {
        question: "Kan jag använda både P1 och L2?",
        answer:
          "Ja — payloads byts snabbt på Matrice-plattformarna. Många kartläggningsföretag har båda och väljer payload per uppdrag.",
      },
      {
        question: "Vilken ger bäst noggrannhet?",
        answer:
          "P1 med RTK ger centimeterprecision i fotogrammetri. L2 levererar upp till 5 cm vertikal noggrannhet med LiDAR, särskilt genom vegetation där fotogrammetri har begränsningar.",
      },
    ],
  },
  {
    handle: "jamfor-inspektionskameror",
    title: "Jämför inspektionskameror — H30T, H30, H20T & H20N",
    eyebrow: "Översikt",
    excerpt:
      "Komplett jämförelse av Zenmuse inspektionskameror. Se zoom, termisk sensor och nattseende sida vid sida.",
    metaTitle: "Jämför Zenmuse inspektionskameror | EU Drone Company",
    metaDescription:
      "Jämför alla Zenmuse inspektionskameror: H30T, H30, H20T och H20N. Specifikationer, zoom, termisk sensor och rekommendationer.",
    tags: ["jämförelse", "zenmuse", "inspektion", "översikt"],
    cameraIds: ["zenmuse-h30t", "zenmuse-h30", "zenmuse-h20t", "zenmuse-h20n"],
    introParagraphs: [
      "Att välja rätt inspektionskamera beror på dina specifika krav: behöver du termisk avbildning, nattseende, eller räcker visuell zoom? Här jämför vi alla aktuella Zenmuse-modeller för inspektion.",
    ],
    verdictParagraphs: [
      "H30T är det mest mångsidiga valet för professionell inspektion med termisk sensor. H30 passar visuella inspektionsuppdrag utan termisk krav. H20T är ett beprövat alternativ med lägre investeringskostnad. H20N är specialiserad för mörker och nattinspektion med starlight-sensorer.",
    ],
    faq: [
      {
        question: "Vilken kamera är bäst för nybörjare?",
        answer:
          "Zenmuse H30 erbjuder senaste zoom-teknologin utan termisk kamera till en lägre prispunkt — ett bra startval för visuell inspektion.",
      },
    ],
  },
  {
    handle: "jamfor-termiska-kameror",
    title: "Jämför termiska drönarkameror — H30T, H20T & H20N",
    eyebrow: "Termisk avbildning",
    excerpt:
      "Alla Zenmuse-modeller med termisk sensor jämförda. Upplösning, zoom och nattseende i en översikt.",
    metaTitle: "Jämför termiska drönarkameror | EU Drone Company",
    metaDescription:
      "Jämför termiska Zenmuse-kameror: H30T, H20T och H20N. Termisk upplösning, zoom och användningsområden för energi, säkerhet och räddning.",
    tags: ["jämförelse", "zenmuse", "termisk", "översikt"],
    cameraIds: ["zenmuse-h30t", "zenmuse-h20t", "zenmuse-h20n"],
    introParagraphs: [
      "Termiska drönarkameror är oumbärliga för energiinspektion, brandövervakning, sök-och-räddning och säkerhet. Här jämför vi alla Zenmuse-modeller med termisk sensor.",
    ],
    verdictParagraphs: [
      "För de flesta termiska inspektionsuppdrag rekommenderar vi H30T med sin 1280×1024 termiska sensor och 34× zoom. H20T är ett kostnadseffektivt alternativ med beprövad teknik. H20N är specialbyggd för mörkeroperatörer med starlight-sensorer kombinerat med termisk avbildning.",
    ],
    faq: [
      {
        question: "Vad är radiometrisk termisk mätning?",
        answer:
          "Radiometrisk mätning innebär att varje pixel har ett temperaturvärde, inte bara en färg. Alla tre modellerna i denna jämförelse stöder radiometrisk mätning.",
      },
    ],
  },
  {
    handle: "zenmuse-h20t-vs-h20n",
    title: "Zenmuse H20T vs H20N — daginspektion eller nattseende?",
    eyebrow: "Termisk inspektion",
    excerpt:
      "Jämför H20T och H20N — samma termiska upplösning men H20N har starlight-sensorer optimerade för mörker och nattinspektion.",
    metaTitle: "Zenmuse H20T vs H20N — jämförelse | EU Drone Company",
    metaDescription:
      "Jämför Zenmuse H20T och H20N. Skillnader i starlight-sensorer, nattseende, zoom och användningsområden för säkerhet och räddning.",
    tags: ["jämförelse", "zenmuse", "termisk", "nattseende"],
    cameraIds: ["zenmuse-h20t", "zenmuse-h20n"],
    introParagraphs: [
      "Både H20T och H20N har termisk sensor med 640×512 upplösning, men de är optimerade för olika miljöer. H20T har vanliga CMOS-sensorer för dagsljusinspektion, medan H20N har starlight-sensorer som presterar i extremt svagt ljus.",
      "Valet mellan dem handlar om när och var du flyger — inte bara om du behöver termisk avbildning.",
    ],
    verdictParagraphs: [
      "Välj H20T för dagtidsinspektion av infrastruktur, energi och industri där du behöver högupplösta visuella bilder kombinerat med termisk avbildning.",
      "Välj H20N för nattinspektion, räddningstjänst, gränsbevakning och säkerhetsoperationer i mörker där starlight-sensorerna ger avgörande fördel.",
    ],
    faq: [
      {
        question: "Har H20N bättre termisk sensor än H20T?",
        answer:
          "Nej — båda har 640×512 termisk sensor. Skillnaden ligger i de visuella/starlight-sensorerna, inte den termiska.",
      },
      {
        question: "Kan H20N användas på dagen?",
        answer:
          "Ja, men H20T ger betydligt bättre visuella bilder i dagsljus tack vare sina högupplösta CMOS-sensorer (12 MP + 20 MP vs 4 MP starlight).",
      },
    ],
  },
  {
    handle: "zenmuse-h20-vs-h20t",
    title: "Zenmuse H20 vs H20T — behöver du termisk sensor?",
    eyebrow: "Inspektion & zoom",
    excerpt:
      "Samma 23× zoom och laser-avståndsmätare — men H20T har termisk kamera. Se om den extra kostnaden motiveras.",
    metaTitle: "Zenmuse H20 vs H20T — jämförelse | EU Drone Company",
    metaDescription:
      "Jämför Zenmuse H20 och H20T. Skillnaden är termisk sensor, vikt och pris. Hitta rätt payload för visuell vs termisk inspektion.",
    tags: ["jämförelse", "zenmuse", "h20", "inspektion"],
    cameraIds: ["zenmuse-h20", "zenmuse-h20t"],
    introParagraphs: [
      "Zenmuse H20 och H20T delar samma zoom- och vidvinkelsensorer samt laser-avståndsmätare. Den enda skillnaden är att H20T har en integrerad termisk sensor — men det påverkar vikt, pris och användningsområden.",
    ],
    verdictParagraphs: [
      "Välj H20T om du behöver identifiera temperaturavvikelser — värmeläckor, överhettade komponenter, persondetektion i mörker eller fuktproblem.",
      "Välj H20 om dina uppdrag enbart kräver visuell inspektion med zoom och avståndsmätning. Du sparar vikt och budget utan att ge upp optisk prestanda.",
    ],
    faq: [
      {
        question: "Är zoom och vidvinkel identiska?",
        answer:
          "Ja — båda har 12 MP vidvinkel, 20 MP zoom med 23× optisk zoom och laser-avståndsmätare upp till 1200 m.",
      },
    ],
  },
  {
    handle: "zenmuse-l1-vs-l2",
    title: "Zenmuse L1 vs L2 — uppgradera LiDAR-payloaden?",
    eyebrow: "LiDAR",
    excerpt:
      "Jämför första generationens L1 med L2. Fler returer, längre räckvidd och bättre penetration genom vegetation.",
    metaTitle: "Zenmuse L1 vs L2 — LiDAR-jämförelse | EU Drone Company",
    metaDescription:
      "Jämför Zenmuse L1 och L2 LiDAR-sensorer. Skillnader i returer, räckvidd, punktmolnstäthet och noggrannhet för kartläggning.",
    tags: ["jämförelse", "zenmuse", "lidar", "kartläggning"],
    cameraIds: ["zenmuse-l1", "zenmuse-l2"],
    introParagraphs: [
      "Zenmuse L2 är en betydande uppgradering från L1 med fler laserreturer, längre detektionsräckvidd och förbättrad penetration genom vegetation. Båda monteras på Matrice 300/350 RTK.",
    ],
    verdictParagraphs: [
      "Uppgradera till L2 om du arbetar med skogskartläggning, komplex vegetation eller behöver tätare punktmoln. 5 returer (vs 1) ger dramatiskt bättre 3D-modeller under trädkronor.",
      "L1 kan fortfarande räcka för enklare terrängmodeller och infrastrukturprojekt med öppen terräng, särskilt om budgeten är begränsad.",
    ],
    faq: [
      {
        question: "Fungerar L1 och L2 på samma drönare?",
        answer: "Ja — båda är kompatibla med DJI Matrice 300 RTK och Matrice 350 RTK.",
      },
      {
        question: "Hur stor är skillnaden i vegetation?",
        answer:
          "L2 med 5 returer penetrerar vegetation betydligt bättre än L1 med enstaka retur, vilket ger mer kompletta terrängmodeller under träd och buskar.",
      },
    ],
  },
  {
    handle: "zenmuse-l2-vs-l3",
    title: "Zenmuse L2 vs L3 — nästa generations LiDAR",
    eyebrow: "LiDAR",
    excerpt:
      "Jämför L2 och L3. 950 m räckvidd, 16 returer, dubbla 100 MP-kameror — men L3 kräver Matrice 400.",
    metaTitle: "Zenmuse L2 vs L3 — LiDAR-jämförelse | EU Drone Company",
    metaDescription:
      "Jämför Zenmuse L2 och L3. Nästa generations LiDAR med 950 m räckvidd och 16 returer vs etablerade L2. Plattformskrav och användningsområden.",
    tags: ["jämförelse", "zenmuse", "lidar", "l3"],
    cameraIds: ["zenmuse-l2", "zenmuse-l3"],
    introParagraphs: [
      "Zenmuse L3 representerar ett generationsskifte inom DJI:s LiDAR-sortiment med 1535 nm-laser, upp till 16 returer och 950 meters detektionsräckvidd. Men det finns viktiga skillnader i plattformskrav och investeringsnivå jämfört med L2.",
    ],
    verdictParagraphs: [
      "Välj L3 om du behöver storskalig kartläggning (upp till 100 km²/dag), långa korridorer, kraftledningar eller maximal vegetation penetration. Dubbla 100 MP-kameror ger överlägsen färgsättning av punktmoln.",
      "L2 är fortfarande rätt val för de flesta kartläggningsföretag med Matrice 350 RTK. Den levererar utmärkt noggrannhet till en lägre total investeringskostnad.",
    ],
    faq: [
      {
        question: "Fungerar L3 på Matrice 350 RTK?",
        answer:
          "Nej — Zenmuse L3 kräver DJI Matrice 400 RTK med dedikerad L3-gimbalanslutning.",
      },
      {
        question: "Hur mycket bättre är L3:s räckvidd?",
        answer:
          "L3 detekterar objekt upp till 950 m (vid 10% reflektivitet) jämfört med L2:s 250 m — nästan fyrdubblad räckvidd.",
      },
    ],
  },
  {
    handle: "jamfor-lidar-sensorer",
    title: "Jämför LiDAR-sensorer — L1, L2 & L3",
    eyebrow: "Översikt",
    excerpt:
      "Alla Zenmuse LiDAR-payloads jämförda. Returer, räckvidd, kameror och plattformskrav.",
    metaTitle: "Jämför Zenmuse LiDAR-sensorer | EU Drone Company",
    metaDescription:
      "Komplett jämförelse av Zenmuse L1, L2 och L3 LiDAR-sensorer. Specifikationer, noggrannhet och rekommendationer för kartläggning.",
    tags: ["jämförelse", "zenmuse", "lidar", "översikt"],
    cameraIds: ["zenmuse-l1", "zenmuse-l2", "zenmuse-l3"],
    introParagraphs: [
      "DJI erbjuder tre generationer LiDAR-payloads för enterprise-drönare. Här jämför vi alla modeller så du kan välja rätt sensor för ditt kartläggningsuppdrag.",
    ],
    verdictParagraphs: [
      "L1 är ingångsnivå för enklare LiDAR-projekt. L2 är branschstandard med 5 returer och utmärkt pris/prestanda på Matrice 350 RTK. L3 är flaggskeppet för storskalig kartläggning men kräver Matrice 400.",
    ],
    faq: [
      {
        question: "Behöver jag LiDAR eller räcker fotogrammetri?",
        answer:
          "LiDAR penetrerar vegetation och fungerar i mörker. Fotogrammetri (t.ex. Zenmuse P1) ger bättre visuell detalj. Många företag använder båda beroende på uppdrag.",
      },
    ],
  },
  {
    handle: "jamfor-kartlaggningskameror",
    title: "Jämför kartläggningskameror — P1, L1, L2 & L3",
    eyebrow: "Översikt",
    excerpt:
      "Fotogrammetri vs LiDAR — alla Zenmuse kartläggningspayloads i en jämförelse.",
    metaTitle: "Jämför kartläggningskameror & sensorer | EU Drone Company",
    metaDescription:
      "Jämför Zenmuse P1, L1, L2 och L3 för drönarbaserad kartläggning. Fotogrammetri vs LiDAR — specifikationer och rekommendationer.",
    tags: ["jämförelse", "zenmuse", "kartläggning", "översikt"],
    cameraIds: ["zenmuse-p1", "zenmuse-l1", "zenmuse-l2", "zenmuse-l3"],
    introParagraphs: [
      "Professionell drönarkartläggning kräver rätt sensor. Fotogrammetri (P1) och LiDAR (L1/L2/L3) löser olika problem — här jämför vi alla alternativ.",
    ],
    verdictParagraphs: [
      "P1 för fotogrammetri och ortofoton. L1/L2/L3 för LiDAR-punktmoln — välj generation efter budget, plattform och projektstorlek. L2 är sweet spot för de flesta, L3 för storskaliga projekt.",
    ],
    faq: [
      {
        question: "Kan P1 och L2 kombineras i samma projekt?",
        answer:
          "Ja — payloads byts på Matrice-plattformen. Vissa projekt använder LiDAR för terräng och fotogrammetri för fasaddetaljer.",
      },
    ],
  },
  {
    handle: "mavic-3e-vs-mavic-3t",
    title: "Mavic 3 Enterprise vs Mavic 3T — foto eller termisk?",
    eyebrow: "Kompakt enterprise",
    excerpt:
      "Jämför Mavic 3E och Mavic 3T. Mekanisk slutare och 4/3\"-sensor vs termisk kamera — vilken kompakt enterprise-drönare passar dig?",
    metaTitle: "Mavic 3E vs Mavic 3T — jämförelse | EU Drone Company",
    metaDescription:
      "Jämför DJI Mavic 3 Enterprise och Mavic 3T. Fotogrammetri med mekanisk slutare vs termisk inspektion i kompakt format.",
    tags: ["jämförelse", "mavic", "enterprise", "termisk"],
    cameraIds: ["mavic-3e", "mavic-3t"],
    introParagraphs: [
      "DJI Mavic 3 Enterprise-serien erbjuder professionella kameror i ett kompakt format som passar i en ryggsäck. Mavic 3E och Mavic 3T ser likadana ut men är optimerade för helt olika uppdrag.",
      "Mavic 3E har en större 4/3\"-sensor med mekanisk slutare för kartläggning. Mavic 3T har en integrerad termisk sensor för inspektion och räddning.",
    ],
    verdictParagraphs: [
      "Välj Mavic 3E för fotogrammetri, 3D-modellering och inspektion där bildkvalitet och mekanisk slutare är viktigt. RTK-modulen ger centimeterprecision.",
      "Välj Mavic 3T för termisk inspektion, räddningstjänst, brandövervakning och säkerhet. Termisk sensor (640×512) i ett format du kan ha med dig överallt.",
    ],
    faq: [
      {
        question: "Kan Mavic 3T användas för kartläggning?",
        answer:
          "Begränsat. Mavic 3T saknar mekanisk slutare och har mindre sensor, vilket ger sämre fotogrammetriska resultat än Mavic 3E.",
      },
      {
        question: "Har båda samma flygtid?",
        answer: "Ja — båda erbjuder upp till 45 minuters flygtid och samma 56× hybridzoom på telekameran.",
      },
    ],
  },
  {
    handle: "mavic-3e-vs-mavic-3m",
    title: "Mavic 3 Enterprise vs Multispectral — inspektion eller jordbruk?",
    eyebrow: "Kompakt enterprise",
    excerpt:
      "Jämför Mavic 3E och Mavic 3 Multispectral. Inspektion och kartläggning vs NDVI och precisionsjordbruk.",
    metaTitle: "Mavic 3E vs Mavic 3M — jämförelse | EU Drone Company",
    metaDescription:
      "Jämför DJI Mavic 3 Enterprise och Mavic 3 Multispectral. Inspektionskamera vs multispektral sensor för jordbruk och växtanalys.",
    tags: ["jämförelse", "mavic", "multispektral", "jordbruk"],
    cameraIds: ["mavic-3e", "mavic-3m"],
    introParagraphs: [
      "Inom Mavic 3 Enterprise-serien finns specialiserade modeller för olika branscher. Mavic 3E är byggd för inspektion och kartläggning, medan Mavic 3 Multispectral är designad för precisionsjordbruk med NDVI och växtstressanalys.",
    ],
    verdictParagraphs: [
      "Välj Mavic 3E för generell enterprise-användning: inspektion, kartläggning, säkerhet och 3D-modellering med RTK-precision.",
      "Välj Mavic 3 Multispectral om du arbetar med jordbruk, skogsbruk eller vegetation — den kombinerar RGB med fyra multispektrala band för detaljerad växtanalys.",
    ],
    faq: [
      {
        question: "Har Mavic 3M samma RGB-kamera som Mavic 3E?",
        answer:
          "Ja — båda har 4/3\" CMOS 20 MP med mekanisk slutare. Mavic 3M har dessutom fyra separata 5 MP multispektrala sensorer (G/R/RE/NIR).",
      },
    ],
  },
  {
    handle: "zenmuse-h30t-vs-h20n",
    title: "Zenmuse H30T vs H20N — bäst för nattinspektion?",
    eyebrow: "Termisk & natt",
    excerpt:
      "Jämför senaste H30T med nattspecialisten H20N. Termisk upplösning, starlight och zoom i mörker.",
    metaTitle: "Zenmuse H30T vs H20N — jämförelse | EU Drone Company",
    metaDescription:
      "Jämför Zenmuse H30T och H20N för nattinspektion. 1280×1024 vs 640×512 termisk, starlight-sensorer och 34× vs 20× zoom.",
    tags: ["jämförelse", "zenmuse", "termisk", "nattseende"],
    cameraIds: ["zenmuse-h30t", "zenmuse-h20n"],
    introParagraphs: [
      "För nattliga inspektions- och räddningsuppdrag finns två starka alternativ: den nya H30T med överlägsen termisk upplösning och zoom, eller H20N som är specialbyggd med starlight-sensorer för extremt svagt ljus.",
    ],
    verdictParagraphs: [
      "Välj H30T om du behöver bästa termiska upplösning (1280×1024), längst zoom (34×) och laser-räckvidd (3000 m) — den klarar både dag och natt bra.",
      "Välj H20N om dina uppdrag nästan uteslutande sker i mörker och du prioriterar starlight-sensorernas prestanda i svagt ljus framför maximal zoom och termisk upplösning.",
    ],
    faq: [
      {
        question: "Vilken har bäst termisk sensor?",
        answer:
          "H30T med 1280×1024 — dubbla upplösningen jämfört med H20N:s 640×512.",
      },
    ],
  },
  {
    handle: "matrice-payload-vs-mavic-3e",
    title: "Matrice-payload vs Mavic 3E — när behöver du Zenmuse?",
    eyebrow: "Plattform & kamera",
    excerpt:
      "Jämför Zenmuse H30 (Matrice-payload) med integrerad Mavic 3E-kamera. Zoom, sensor och portabilitet.",
    metaTitle: "Zenmuse H30 vs Mavic 3E — payload vs kompakt | EU Drone Company",
    metaDescription:
      "Jämför Zenmuse H30 på Matrice med DJI Mavic 3 Enterprise. När lönar sig en tung payload-plattform vs kompakt enterprise-drönare?",
    tags: ["jämförelse", "zenmuse", "mavic", "plattform"],
    cameraIds: ["zenmuse-h30", "mavic-3e"],
    introParagraphs: [
      "Ett vanligt val för enterprise-kunder är mellan en kompakt drönare med integrerad kamera (Mavic 3E) och en tung plattform med utbytbar payload (Matrice 350 RTK + Zenmuse H30). Båda har 34×/56× zoom men skiljer sig i sensor, portabilitet och expansion.",
    ],
    verdictParagraphs: [
      "Välj Matrice 350 RTK + Zenmuse H30 om du behöver 34× optisk zoom, laser-avståndsmätare, längre flygtid och möjlighet att byta payload (termisk, LiDAR, fotogrammetri).",
      "Välj Mavic 3E om portabilitet, snabb utryckning och fotogrammetri med mekanisk slutare är viktigare. Perfekt som komplement eller för mindre team.",
    ],
    faq: [
      {
        question: "Kan Mavic 3E ersätta Matrice + Zenmuse?",
        answer:
          "För snabba inspektioner och kartläggning — ja. För avancerad zoom, termisk sensor, LiDAR eller långa flyguppdrag — nej, då behövs Matrice-plattformen.",
      },
    ],
  },
  {
    handle: "jamfor-alla-zenmuse-kameror",
    title: "Jämför alla Zenmuse-kameror — komplett översikt",
    eyebrow: "Översikt",
    excerpt:
      "Alla Zenmuse payloads i en tabell. Inspektion, termisk, fotogrammetri och LiDAR — sida vid sida.",
    metaTitle: "Jämför alla Zenmuse-kameror & sensorer | EU Drone Company",
    metaDescription:
      "Komplett jämförelse av alla Zenmuse-kameror: H30T, H30, H20T, H20N, H20, P1, L1, L2 och L3. Specifikationer och rekommendationer.",
    tags: ["jämförelse", "zenmuse", "översikt", "alla"],
    cameraIds: [
      "zenmuse-h30t",
      "zenmuse-h30",
      "zenmuse-h20t",
      "zenmuse-h20n",
      "zenmuse-h20",
      "zenmuse-p1",
      "zenmuse-l1",
      "zenmuse-l2",
      "zenmuse-l3",
    ],
    introParagraphs: [
      "Zenmuse-sortimentet täcker allt från inspektions-zoom till termisk avbildning, fotogrammetri och LiDAR. Här är en komplett översikt av alla aktuella payloads.",
    ],
    verdictParagraphs: [
      "Inspektion: H30/H30T (senaste generationen). Termisk: H30T > H20T > H20N (natt). Fotogrammetri: P1. LiDAR: L2 (standard) eller L3 (storskalig). Välj payload efter uppdrag, inte tvärtom.",
    ],
    faq: [
      {
        question: "Vilken Zenmuse-kamera är mest mångsidig?",
        answer:
          "Zenmuse H30T — termisk + zoom + laser i en payload. För enbart visuell inspektion räcker H30 till lägre kostnad.",
      },
    ],
  },
];

export function getEdpComparisonArticleByHandle(handle: string): EdpComparisonArticle | undefined {
  return EDP_COMPARISON_ARTICLES.find((a) => a.handle === handle);
}
