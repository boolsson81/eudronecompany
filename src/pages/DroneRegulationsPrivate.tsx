import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Radio,
  Users,
  ClipboardCheck,
  MapPin,
  ShieldCheck,
  Camera,
  Lightbulb,
  AlertTriangle,
  ExternalLink,
  Building2,
} from "lucide-react";
import SeoHead from "@/components/SeoHead";
import RegulationSourceNote from "@/components/RegulationSourceNote";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import { DRONE_CATEGORIES } from "@/data/droneRegulations";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

const STEPS = [
  {
    title: "Ta reda på vikt och C-klass",
    body: "De flesta konsumentdrönare väger under 900 g och är C0- (< 250 g) eller C1-märkta (< 900 g). Vikten och C-klassen avgör vilken underkategori (A1, A2 eller A3) du flyger i och vilken utbildning som krävs.",
  },
  {
    title: "Registrera dig som operatör",
    body: "Nästan alla drönare med kamera kräver att du registrerar dig som operatör hos Transportstyrelsen — oavsett vikt (undantaget är godkända leksaker). Du får ett operatörs-ID (UAS.SWE...) som ska sättas som en dekal på drönaren.",
    link: { label: "Registrera dig som operatör", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/registrering-av-operator/" },
  },
  {
    title: "Ta ditt drönarkort (A1/A3)",
    body: "Gratis teoriprov online hos Transportstyrelsen: 40 flervalsfrågor om flygsäkerhet, luftrum, integritet och försäkring. Minst 75 % rätt krävs och kortet gäller i 5 år. Obligatoriskt för C1-drönare och för omärkta drönare mellan 250 g och 25 kg.",
    link: { label: "Ta drönarkort och läs på inför provet", href: "https://www.transportstyrelsen.se/dronarkort-och-utbildning/" },
  },
  {
    title: "Komplettera med A2-certifikat vid behov",
    body: "Ska du flyga en tyngre C2-märkt drönare (upp till 4 kg) nära människor du inte kan skydda, t.ex. i tätort? Då krävs A2-certifikatet utöver A1/A3 — praktiska självstudier du intygar själv plus ett teoriprov.",
  },
  {
    title: "Kolla luftrummet före varje flygning",
    body: "LFV:s drönarkarta visar kontrollzoner, permanenta restriktionsområden (flygplatser, kärnkraftverk, fängelser, militära anläggningar) och tillfälliga restriktioner, t.ex. vid skogsbränder eller stora evenemang — i realtid.",
    link: { label: "Öppna LFV:s drönarkarta", href: "https://dronechart.lfv.se/" },
  },
  {
    title: "Fundera på försäkring",
    body: "EU-kravet på ansvarsförsäkring gäller drönare över 20 kg — sällan aktuellt för en hobbypilot. Men de flesta hemförsäkringar undantar drönarskador, så en egen drönarförsäkring är klokt om du flyger dyr utrustning nära andras egendom eller människor.",
    link: { label: "Läs EASA om drönarförsäkring", href: "https://www.easa.europa.eu/sv/light/topics/drone-insurance" },
  },
  {
    title: "Följ grundreglerna varje gång",
    body: "Håll drönaren inom synhåll (VLOS), flyg aldrig högre än 120 meter, ge alltid företräde för bemannad luftfart, flyg aldrig påverkad av alkohol eller droger, och respektera andra människors integritet.",
  },
];

const NO_FLY = [
  "Nationalparker och många naturreservat — det är förbjudet att landa eller flyga luftfartyg (inklusive drönare) där utan dispens från länsstyrelsen.",
  "Kontrollzoner runt flygplatser utan samordning eller tillstånd — kolla alltid LFV:s drönarkarta först.",
  "Permanenta restriktionsområden: militära anläggningar, kärnkraftverk, fängelser och liknande skyddsobjekt.",
  "Över folksamlingar, oavsett drönarens vikt eller klassning.",
  "Nära eller över oskyddade personer med en drönare som väger mer än 250 g, om du saknar rätt certifikat.",
  "I mörker utan grönt blinkande ljus och övrig belysning enligt EASA:s krav.",
];

const TIPS = [
  "Kalibrera kompassen när du flyger på en ny plats, särskilt långt hemifrån.",
  "Kolla väderprognosen — undvik vind över 8–10 m/s för lätta drönare och kall väderlek som dränerar batterier snabbt.",
  "Ställ in Return-to-Home-höjden högre än det högsta hindret i området (träd, master, byggnader).",
  "Håll utkik efter fåglar, särskilt rovfåglar som kan attackera drönare under häckningssäsong.",
  "Undvik flygning nära kraftledningar — de kan störa kompass och GPS.",
  "Ha alltid extra batterier laddade och ett SD-kort med gott om utrymme innan du åker ut.",
];

const LINKS = [
  { title: "Drönarflygguiden", desc: "Transportstyrelsens interaktiva guide — svara på frågor om var och hur du ska flyga.", href: "https://www.transportstyrelsen.se/dronarflygguiden" },
  { title: "Registrera dig som operatör", desc: "E-tjänsten där du registrerar dig och får ditt operatörs-ID.", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/registrering-av-operator/" },
  { title: "Drönarkort & utbildning", desc: "Boka och genomför A1/A3-provet online, kostnadsfritt.", href: "https://www.transportstyrelsen.se/dronarkort-och-utbildning/" },
  { title: "LFV:s drönarkarta", desc: "Aktuell lägesbild över restriktionsområden i svenskt luftrum.", href: "https://dronechart.lfv.se/" },
  { title: "EASA — Drones & Air Mobility", desc: "EU:s regelverk i grunden, med officiella tolkningar och nyheter.", href: "https://www.easa.europa.eu/en/domains/civil-drones" },
  { title: "IMY — kamerabevakning med drönare", desc: "Vad som gäller för GDPR och kamerabevakningslagen när du filmar med drönare.", href: "https://www.imy.se/privatperson/kamerabevakning/regler-for-dig-som-kamerabevakar/dronare/" },
];

export default function DroneRegulationsPrivate() {
  return (
    <>
      <SeoHead
        title="Drönarregler för privatpersoner i Sverige — Guide | EU Drone Company"
        description="Allt du som privatperson behöver veta för att flyga drönare lagligt i Sverige: registrering, drönarkort, försäkring, no-fly-zoner och GDPR. Med länkar till Transportstyrelsen, LFV och IMY."
        canonical={droneUrl("/kommersiella-dronare/regelverk/privatpersoner")}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Regelverk", url: droneUrl("/kommersiella-dronare/regelverk") },
          { name: "Privatpersoner", url: droneUrl("/kommersiella-dronare/regelverk/privatpersoner") },
        ]}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/kommersiella-dronare" className="flex items-center gap-3">
              <Radio className="h-6 w-6 text-orange-500" />
              <span className="font-bold text-lg tracking-tight">EU Drone Company <span className="text-orange-500">Enterprise</span></span>
            </Link>
            <Link to="/kommersiella-dronare/kontakt">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-0">Begär offert</Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-6">
              <Link to="/kommersiella-dronare" className="hover:text-white transition-colors">Kommersiella drönare</Link>
              <span>/</span>
              <Link to="/kommersiella-dronare/regelverk" className="hover:text-white transition-colors">Regelverk</Link>
              <span>/</span>
              <span className="text-white/70">Privatpersoner</span>
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Users className="h-3.5 w-3.5" />
                Regelverk · Privatpersoner
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                Drönarregler för privatpersoner
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
                Så flyger du lagligt och tryggt som hobbypilot i Sverige — registrering, drönarkort, försäkring
                och var du får (och inte får) flyga. Med direktlänkar till Transportstyrelsen, LFV och IMY.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <ClipboardCheck className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Steg-för-steg innan din första flygning</h2>
            </div>
            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-5 p-6 rounded-2xl bg-white/[0.03] border border-white/10"
                >
                  <div className="h-9 w-9 shrink-0 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1.5">{step.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{step.body}</p>
                    {step.link && (
                      <a
                        href={step.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 mt-3"
                      >
                        {step.link.label} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Which category */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Vilken EASA-kategori gäller dig?</h2>
            </div>
            <p className="text-white/50 max-w-2xl mb-10">
              De allra flesta privatpersoner flyger i Open-kategorin. Klicka på en underkategori för fullständiga
              krav, avstånd och vilka drönare som ingår.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {DRONE_CATEGORIES.filter((c) => c.slug !== "specific").map((cat, i) => (
                <Link key={cat.slug} to={`/kommersiella-dronare/regelverk/${cat.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group h-full"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <cat.icon className="h-5 w-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-orange-400 transition-colors">{cat.name}</h3>
                        <p className="text-xs text-white/40">{cat.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed mb-3">Max vikt: {cat.maxWeight}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Läs mer <ArrowRight className="h-3 w-3" />
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* No-fly zones */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <MapPin className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Var får du inte flyga?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {NO_FLY.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white/70 text-sm">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Camera & privacy */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Kamera, integritet och GDPR</h2>
            </div>
            <div className="max-w-3xl space-y-4 text-white/60 leading-relaxed">
              <p>
                Filmar du bara din egen tomt och ditt eget hus omfattas det av <strong className="text-white/80">privatundantaget</strong> —
                då behöver du inte följa dataskyddsförordningen. Men så fort du flyger över och filmar områden
                utanför din privata sfär blir du <strong className="text-white/80">personuppgiftsansvarig</strong> för
                identifierbara personer och registreringsskyltar som kameran fångar.
              </p>
              <p>
                Reglerna gäller bara om du flyger tillräckligt lågt för att människor eller andra personuppgifter
                går att identifiera. Flyger du högt nog för att ingen ska kunna kännas igen sker ingen behandling
                av personuppgifter enligt IMY.
              </p>
              <p>
                Praktiska tips: undvik att publicera material där grannar eller förbipasserande syns tydligt utan
                samtycke, och tänk på att smygfilmning av enskilda personer även kan vara straffbart enligt
                brottsbalkens bestämmelser om kränkande fotografering.
              </p>
              <a
                href="https://www.imy.se/privatperson/kamerabevakning/regler-for-dig-som-kamerabevakar/dronare/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300"
              >
                Läs IMY:s fullständiga vägledning om drönare <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <Lightbulb className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Praktiska tips från erfarna piloter</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {TIPS.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <Lightbulb className="h-5 w-5 text-orange-400/70 mt-0.5 flex-shrink-0" />
                  <span className="text-white/70 text-sm">{tip}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Useful links */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Nyttiga länkar</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group block"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold group-hover:text-orange-400 transition-colors">{link.title}</h3>
                    <ExternalLink className="h-3.5 w-3.5 text-white/30 shrink-0 mt-1" />
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{link.desc}</p>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ska du köpa din första drönare?</h2>
            <p className="text-white/50 mb-8">
              Vårt systerbolag ActionKing.se har ett brett sortiment av drönare för privat bruk, från nybörjarmodeller
              till avancerade fotodrönare.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="https://actionking.se" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-8">
                  Se sortimentet på ActionKing.se <ExternalLink className="h-4 w-4 ml-1.5" />
                </Button>
              </a>
              <Link to="/kommersiella-dronare/regelverk/foretag" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
                <Building2 className="h-4 w-4" />
                Ska drönaren användas i en verksamhet istället?
              </Link>
            </div>
          </div>
        </section>

        <RegulationSourceNote />

        <EnterpriseFooter />
      </div>
    </>
  );
}
