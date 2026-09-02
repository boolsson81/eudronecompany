import { droneUrl } from "@/lib/publicSite";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import FaqSection, { faqJsonLd, type FaqItem } from "@/components/FaqSection";
import {
  ArrowRight,
  Mail,
  Boxes,
  CheckCircle2,
  Clock,
  Cog,
  FileText,
  Hammer,
  Layers,
  Package,
  Radio,
  Ruler,
  Search,
  ShieldCheck,
  Upload,
  Wrench,
} from "lucide-react";

const CANONICAL = droneUrl("/kommersiella-dronare/specialtillverkning");

/** De två anledningarna kunder hör av sig: delen finns inte längre, eller den finns inte alls. */
const USE_CASES = [
  {
    icon: Search,
    title: "Delen går inte att få tag på",
    lead: "Utgången modell, avvecklad reservdel eller flera månaders väntan hos tillverkaren.",
    points: [
      "Vi måttar av originaldelen — eller det som är kvar av den — och ritar upp den på nytt.",
      "Trasiga delar går att rekonstruera från fragment, foton och monteringspunkter.",
      "Du får en ritning som är din, så delen kan tillverkas igen när du behöver den.",
    ],
  },
  {
    icon: Hammer,
    title: "Du vill designa din egen del",
    lead: "En payload som inte har något färdigt fäste, ett skydd för en specifik miljö eller en riggidé du vill testa.",
    points: [
      "Kom med en skiss, en CAD-fil eller bara en beskrivning av vad delen ska göra.",
      "Vi konstruerar mot de fästpunkter, vikter och laster som gäller för din drönare.",
      "Prototyp först, serie sedan — samma ritning hela vägen.",
    ],
  },
] as const;

const PROCESS = [
  {
    icon: FileText,
    title: "1. Underlag",
    body: "Skicka foton, mått, artikelnummer eller en CAD-fil. Har du bara den trasiga delen räcker det som start.",
  },
  {
    icon: Ruler,
    title: "2. Uppmätning & ritning",
    body: "Vi måttar av delen, 3D-skannar vid behov och bygger en måttsatt CAD-modell.",
  },
  {
    icon: Cog,
    title: "3. Materialval & metod",
    body: "Vi föreslår material och tillverkningsmetod utifrån last, temperatur, vikt och antal.",
  },
  {
    icon: Boxes,
    title: "4. Prototyp",
    body: "Du får ett provexemplar att passa in innan något tillverkas i antal.",
  },
  {
    icon: Package,
    title: "5. Serie & leverans",
    body: "Godkänd prototyp går i produktion. Ritningen sparas så att omkörningar går snabbt.",
  },
] as const;

const METHODS = [
  {
    icon: Layers,
    title: "3D-utskrift (FDM, SLS & MJF)",
    body: "Snabbast vägen från ritning till fysisk del. Passar kåpor, fästen, hållare och prototyper i små antal.",
    materials: ["PA12 nylon", "Kolfiberförstärkt nylon", "PETG", "ASA för UV-tåliga utomhusdelar"],
  },
  {
    icon: Wrench,
    title: "CNC-bearbetning",
    body: "För delar som ska bära last eller hålla snäva toleranser — gimbalfästen, adapterplattor, axlar och bussningar.",
    materials: ["Aluminium 6061 & 7075", "Rostfritt stål", "POM", "Mässing"],
  },
  {
    icon: Hammer,
    title: "Komposit & plåt",
    body: "Kolfiber- och glasfiberdetaljer där vikten är kritisk, samt laserskuren och kantpressad plåt för ramar och chassin.",
    materials: ["Kolfiberlaminat", "Glasfiber", "Laserskuren aluminiumplåt"],
  },
  {
    icon: Package,
    title: "Verktyg & formsprutning",
    body: "När volymen motiverar det tar vi fram verktyg så att styckpriset går ner vid återkommande beställningar.",
    materials: ["ABS", "PA6", "TPU för dämpande detaljer"],
  },
] as const;

const EXAMPLES = [
  "Landningsställ och benförstärkningar",
  "Propellerskydd och burar",
  "Gimbal- och payloadfästen",
  "Adapterplattor mellan drönare och sensor",
  "Batterihållare och låsmekanismer",
  "Kåpor, luckor och kapslingar",
  "Antenn- och GPS-fästen",
  "Vibrationsdämpare och gummiupphängningar",
  "Kylflänsar och luftriktare",
  "Kabelgenomföringar och dragavlastningar",
  "Sprutbommar och munstyckshållare för lantbruk",
  "Transportinredning och lådinsatser",
];

const DELIVERABLES = [
  {
    icon: Upload,
    title: "Det här hjälper oss komma igång",
    items: [
      "Foton på delen från flera håll, gärna med en linjal eller ett mynt i bild",
      "Drönarmodell och artikelnummer om du har det",
      "CAD-fil (STEP, STL, IGES) eller skiss om delen är ny",
      "Vad som gick sönder och hur — det avgör om konstruktionen ska förstärkas",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Det här får du tillbaka",
    items: [
      "Måttsatt CAD-modell och ritning på delen",
      "Materialförslag med motivering utifrån last och miljö",
      "Prototyp för inpassning innan serieproduktion",
      "Fast pris per styck och ledtid för omkörningar",
    ],
  },
] as const;

const LEAD_TIMES = [
  { label: "Offert på underlag", value: "1–3 arbetsdagar" },
  { label: "Ritning & prototyp", value: "1–3 veckor" },
  { label: "Serie efter godkänd prototyp", value: "2–5 veckor" },
  { label: "Omkörning på befintlig ritning", value: "3–10 arbetsdagar" },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Kan ni tillverka en del som inte finns kvar hos tillverkaren?",
    answer:
      "Ja. Vi måttar av originaldelen eller det som är kvar av den, bygger en CAD-modell och tillverkar delen på nytt. Går delen inte att rädda utgår vi från foton, mått på infästningarna och den drönare den sitter i.",
  },
  {
    question: "Vad behöver ni för att kunna lämna offert?",
    answer:
      "Foton från flera håll med något som ger skala, drönarmodell och gärna artikelnummer. Har du en CAD-fil eller ritning går det snabbare. Vi återkommer med offert inom 1–3 arbetsdagar.",
  },
  {
    question: "Kan jag beställa en enda del, eller krävs en minsta volym?",
    answer:
      "Enstaka delar går bra. 3D-utskrift och CNC har ingen minsta volym. Först vid formsprutning tillkommer en verktygskostnad, och då räknar vi på om volymen motiverar det.",
  },
  {
    question: "Vem äger ritningen på min egen konstruktion?",
    answer:
      "Du gör det. Konstruktionsunderlaget för en del vi tar fram åt dig är ditt, och vi tillverkar den inte åt någon annan. Ritningen sparas hos oss så att du kan beställa fler exemplar utan att börja om.",
  },
  {
    question: "Håller en specialtillverkad del lika bra som originaldelen?",
    answer:
      "Materialet väljs utifrån den last, temperatur och miljö delen faktiskt utsätts för, vilket ofta ger en starkare del än originalet. Var uppmärksam på att en modifierad drönare kan påverka tillverkarens garanti och att ändringar som rör flygsäkerheten ska stämmas av mot gällande regelverk.",
  },
  {
    question: "Tillverkar ni delar till andra märken än DJI?",
    answer:
      "Ja. Metoden bygger på uppmätning och konstruktion, inte på ett visst fabrikat. Vi tar fram delar till drönare, markstationer, transportlådor och kringutrustning oavsett tillverkare.",
  },
];

export default function CustomParts() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Specialtillverkning av drönardelar",
    serviceType: "Konstruktion och tillverkning av reservdelar och specialdelar för drönare",
    url: CANONICAL,
    areaServed: "EU",
    provider: {
      "@type": "Organization",
      name: "EU Drone Company",
      url: "https://eudronecompany.com",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Tillverkningsmetoder",
      itemListElement: METHODS.map((method) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: method.title, description: method.body },
      })),
    },
  };

  return (
    <>
      <SeoHead
        title="Specialtillverkade drönardelar — reservdelar & egen design | EU Drone Company"
        description="Vi tillverkar drönardelar som inte längre går att få tag på och konstruerar egna delar från din skiss eller CAD-fil. 3D-utskrift, CNC, komposit och serieproduktion."
        canonical={CANONICAL}
        breadcrumbs={[
          { name: "Hem", url: droneUrl("/") },
          { name: "Kommersiella drönare", url: droneUrl("/kommersiella-dronare") },
          { name: "Specialtillverkning", url: CANONICAL },
        ]}
        jsonLd={[jsonLd, faqJsonLd(FAQ_ITEMS)]}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav />

        <div className="pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-10">
              <Link to="/kommersiella-dronare" className="hover:text-white transition-colors">
                Kommersiella drönare
              </Link>
              <span>/</span>
              <span className="text-white/70">Specialtillverkning</span>
            </div>

            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16 md:mb-20"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Wrench className="h-3.5 w-3.5" />
                Konstruktion & tillverkning
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-5 max-w-4xl mx-auto leading-tight">
                Delen finns inte att köpa. Vi tillverkar den åt dig.
              </h1>
              <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
                Utgången reservdel, avvecklad modell eller en idé som ingen tillverkare gjort ännu — vi
                mäter upp, konstruerar och tillverkar delen så att drönaren kommer i luften igen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Link to="/kommersiella-dronare/kontakt">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-8">
                    Skicka din förfrågan <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <a href="#process">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-white/15 text-white hover:bg-white/5 hover:text-white text-base px-8 w-full sm:w-auto"
                  >
                    Så går det till
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Två ingångar */}
            <section className="grid md:grid-cols-2 gap-6 mb-20 md:mb-28">
              {USE_CASES.map((useCase, i) => {
                const Icon = useCase.icon;
                return (
                  <motion.div
                    key={useCase.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl bg-[#111] border border-white/10 p-7 md:p-9"
                  >
                    <div className="h-11 w-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
                      <Icon className="h-5 w-5 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{useCase.title}</h2>
                    <p className="text-white/50 leading-relaxed mb-6">{useCase.lead}</p>
                    <ul className="space-y-3">
                      {useCase.points.map((point) => (
                        <li key={point} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-orange-500/80" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </section>

            {/* Process */}
            <section id="process" className="mb-20 md:mb-28 scroll-mt-24">
              <div className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Så går det till</h2>
                <p className="text-white/50">Från trasig del eller skiss till färdig komponent i din hand.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {PROCESS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 h-full"
                    >
                      <Icon className="h-5 w-5 text-orange-500 mb-4" />
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{step.body}</p>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Metoder */}
            <section className="mb-20 md:mb-28">
              <div className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Tillverkningsmetoder</h2>
                <p className="text-white/50">
                  Metoden väljs efter delens uppgift — inte tvärtom. Vi föreslår den som ger rätt hållfasthet
                  till rätt pris för ditt antal.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {METHODS.map((method, i) => {
                  const Icon = method.icon;
                  return (
                    <motion.div
                      key={method.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-2xl bg-[#111] border border-white/10 p-7 hover:border-orange-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="h-5 w-5 text-orange-500" />
                        <h3 className="text-lg font-bold">{method.title}</h3>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed mb-5">{method.body}</p>
                      <div className="flex flex-wrap gap-2">
                        {method.materials.map((material) => (
                          <span
                            key={material}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Exempel */}
            <section className="mb-20 md:mb-28">
              <div className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Exempel på delar vi tar fram</h2>
                <p className="text-white/50">Sitter din del inte med i listan? Fråga ändå — listan är inte uttömmande.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {EXAMPLES.map((example) => (
                  <div
                    key={example}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4"
                  >
                    <Cog className="h-4 w-4 shrink-0 text-orange-500/70" />
                    <span className="text-sm text-white/70">{example}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Underlag & leverans */}
            <section className="mb-20 md:mb-28 grid md:grid-cols-2 gap-6">
              {DELIVERABLES.map((block, i) => {
                const Icon = block.icon;
                return (
                  <motion.div
                    key={block.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl bg-[#111] border border-white/10 p-7 md:p-9"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <Icon className="h-5 w-5 text-orange-500" />
                      <h2 className="text-xl font-bold">{block.title}</h2>
                    </div>
                    <ul className="space-y-3">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-orange-500/80" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </section>

            {/* Ledtider */}
            <section className="mb-20 md:mb-28">
              <div className="mb-10 flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <h2 className="text-2xl md:text-3xl font-bold">Ledtider</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {LEAD_TIMES.map((row) => (
                  <div key={row.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <p className="text-2xl font-bold text-orange-400 mb-1">{row.value}</p>
                    <p className="text-sm text-white/50">{row.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/40 mt-5 max-w-3xl leading-relaxed">
                Ledtiderna är riktvärden. Komplexa delar, materialbrist och krav på provning kan förlänga dem —
                du får en bindande ledtid i offerten.
              </p>
            </section>

            {/* CTA */}
            <section className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-8 md:p-14 text-center">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Skicka in delen — så återkommer vi med pris</h2>
              <p className="text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed">
                Beskriv delen i formuläret, eller mejla foton och CAD-filer direkt till oss. Du får besked om vi
                kan tillverka den, med förslag på material och ledtid, inom 1–3 arbetsdagar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/kommersiella-dronare/kontakt">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10 w-full sm:w-auto">
                    Begär offert <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <a href="mailto:Sales@actionking.se?subject=Specialtillverkning%20%E2%80%94%20f%C3%B6rfr%C3%A5gan">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-white/15 text-white hover:bg-white/5 hover:text-white text-base px-8 w-full sm:w-auto"
                  >
                    <Mail className="h-4 w-4 mr-2" /> Mejla underlaget
                  </Button>
                </a>
              </div>
            </section>
          </div>
        </div>

        <FaqSection items={FAQ_ITEMS} variant="dark" heading="Vanliga frågor om specialtillverkning" />

        <footer className="border-t border-white/10 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">EU Drone Company Enterprise</span>
            </div>
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} EU Drone Company. Auktoriserad DJI Enterprise-partner.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
