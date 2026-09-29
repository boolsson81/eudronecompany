import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Radio,
  Building2,
  ClipboardCheck,
  Scale,
  GraduationCap,
  FileText,
  ShieldAlert,
  ExternalLink,
  CheckCircle2,
  Users,
} from "lucide-react";
import SeoHead from "@/components/SeoHead";
import RegulationSourceNote from "@/components/RegulationSourceNote";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import { TRAINING_REQUIREMENTS } from "@/data/droneRegulations";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

const SETUP_STEPS = [
  {
    title: "Registrera företaget",
    body: "Har ni inte redan ett bolag krävs registrering hos Bolagsverket/Skatteverket och godkännande för F-skatt via verksamt.se innan ni kan bedriva kommersiell drönarverksamhet.",
    link: { label: "Starta och registrera företag — verksamt.se", href: "https://verksamt.se/starta-foretag/valj-foretagsform/enskild-naringsverksamhet" },
  },
  {
    title: "Registrera er som drönaroperatör",
    body: "Registrera bolaget som operatör hos Transportstyrelsen med organisationsnumret som identifierare. Varje drönare i flottan ska märkas med operatörs-ID:t.",
    link: { label: "Registrera operatör hos Transportstyrelsen", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/registrering-av-operator/" },
  },
  {
    title: "Säkerställ rätt kompetens hos fjärrpiloterna",
    body: "Alla som flyger i tjänst ska ha giltigt drönarkort (A1/A3), A2-certifikat vid arbete nära människor, och eventuell STS-utbildning för Specific-kategorin — innan de tar första uppdraget.",
  },
  {
    title: "Teckna flygansvarsförsäkring",
    body: "Obligatoriskt enligt EASA för drönare över 20 kg. Under 20 kg finns inget EU-krav, men de flesta uppdragsgivare kräver ansvarsförsäkring avtalsmässigt oavsett vikt — och en skada utan försäkring kan bli mycket kostsam.",
    link: { label: "EASA om drönarförsäkring", href: "https://www.easa.europa.eu/sv/light/topics/drone-insurance" },
  },
  {
    title: "Ta fram riskbedömning och drifthandbok",
    body: "Så fort verksamheten inte ryms i Open-kategorin krävs tillstånd i Specific-kategorin, med en dokumenterad drifthandbok (Operations Manual) och riskbedömning för varje uppdragstyp.",
  },
];

const CATEGORY_PATHS = [
  {
    title: "Open (A1/A2/A3)",
    body: "Samma regler som för privatpersoner, men i tjänst krävs oftast A2-certifikat för arbete nära människor och i bebyggelse. Passar lättare drönare och enklare uppdrag.",
    links: [
      { label: "Open A2", href: "/kommersiella-dronare/regelverk/open-a2" },
      { label: "Open A3", href: "/kommersiella-dronare/regelverk/open-a3" },
    ],
  },
  {
    title: "Specific — den vanligaste vägen för proffs",
    body: "De flesta kommersiella uppdrag (tyngre drönare, BVLOS, arbete i bebyggelse, sprutning) hamnar här. Tre sätt att få tillstånd:",
    subItems: [
      { label: "Standardscenario (STS-01/STS-02)", desc: "Deklareras hos Transportstyrelsen — snabbast om ert uppdrag matchar ett scenario.", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/deklarera-standardscenario/" },
      { label: "PDRA — fördefinierad riskanalys", desc: "Färdiga riskklasser för vanliga scenarier (G01–G03, S01–S02) som ni ansöker mot direkt.", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/tillstand-for-dronare/kategori-specifik/pdra--tillstand-med-fordefinerad-riskanalys/" },
      { label: "Full SORA-riskanalys", desc: "Egen riskbedömning för uppdrag som inte matchar ett standardscenario. Bifogas ansökan om operativt tillstånd.", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/tillstand-for-dronare/kategori-specifik/sora--en-metodik-for-riskanalys/" },
      { label: "LUC — Light UAS operator Certificate", desc: "Verksamhetstillstånd med egna privilegier för organisationer med etablerat säkerhetsledningssystem — slipper söka tillstånd per flygning.", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/tillstand-for-dronare/kategori-specifik/luc--ett-verksamhetstillstand-med-privilegier/" },
    ],
  },
  {
    title: "Certified",
    body: "Högsta risknivå — passagerartransport och liknande. Sällan aktuellt utanför nischade tillämpningar.",
    links: [{ label: "Kategori certifierad — Transportstyrelsen", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/tillstand-for-dronare/kategori-certifierad/" }],
  },
];

const OTHER_RULES = [
  {
    title: "GDPR & kamerabevakningslagen",
    body: "Som personuppgiftsansvarig vid filmning i tjänst måste ni informera om bevakningen, minimera datainsamlingen och ha en rättslig grund för behandlingen.",
    link: { label: "IMY — kamerabevakning med drönare (verksamhet)", href: "https://www.imy.se/verksamhet/kamerabevakning/olika-tekniker-for-kamerabevakning/kamerabevakning-med-dronare/" },
  },
  {
    title: "Naturskydd",
    body: "Flygning i naturreservat och nationalparker kräver dispens eller tillstånd från länsstyrelsen — även i kommersiellt syfte.",
  },
  {
    title: "Kemikalielagstiftning vid sprutdrönare",
    body: "Sprutning av växtskyddsmedel kräver behörighet från Jordbruksverket och att Kemikalieinspektionens regler följs, utöver det ordinarie drönartillståndet.",
  },
  {
    title: "Arbetsmiljö",
    body: "När drönaren är ett arbetsredskap gäller Arbetsmiljöverkets krav på systematiskt arbetsmiljöarbete: riskbedömning, rutiner och utbildning för operatörerna.",
  },
  {
    title: "Händelserapportering",
    body: "Allvarliga incidenter och olyckor med drönare i tjänst ska anmälas till Transportstyrelsen.",
    link: { label: "Rapportera händelse med drönare", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/rapportera-handelse-med-dronare/" },
  },
];

const CHECKLIST = [
  "Företaget är registrerat som operatör hos Transportstyrelsen med giltigt operatörs-ID",
  "Alla fjärrpiloter har de kompetensbevis uppdraget kräver (A1/A3, A2, ev. STS)",
  "Flygansvarsförsäkring finns och täcker den aktuella verksamheten",
  "Rätt tillstånd finns — standardscenario deklarerat, PDRA sökt eller SORA genomförd",
  "Drifthandbok och riskbedömning är uppdaterade för uppdragstypen",
  "Kunden är informerad om hur eventuell filmning/GDPR hanteras",
];

const LINKS = [
  { title: "Kategori specifik", desc: "Transportstyrelsens översikt över tillståndsvägarna inom Specific.", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/tillstand-for-dronare/kategori-specifik/" },
  { title: "SORA — riskanalysmetodik", desc: "Så genomför och ansöker ni med en fullständig SORA-riskbedömning.", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/tillstand-for-dronare/kategori-specifik/sora--en-metodik-for-riskanalys/" },
  { title: "LUC — verksamhetstillstånd", desc: "Kraven för att bli en Light UAS-operatör med egna privilegier.", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/tillstand-for-dronare/kategori-specifik/luc--ett-verksamhetstillstand-med-privilegier/" },
  { title: "Deklarera standardscenario", desc: "Snabbaste vägen till tillstånd om ert uppdrag matchar STS-01 eller STS-02.", href: "https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/dronare/deklarera-standardscenario/" },
  { title: "Starta företag — verksamt.se", desc: "Myndigheternas samlade guide för dig som ska starta eller driver företag.", href: "https://verksamt.se/" },
  { title: "F-skatt — Skatteverket", desc: "Ansök om F-skatt för näringsverksamheten.", href: "https://www.skatteverket.se/foretag/drivaforetag/startaochregistrera.4.58d555751259e4d661680006123.html" },
  { title: "EASA — Specific Category", desc: "EU:s regelverk för Specific-kategorin på engelska, med senaste ändringarna.", href: "https://www.easa.europa.eu/en/domains/drones-air-mobility/operating-drone/specific-category-civil-drones" },
  { title: "IMY — kamerabevakning (verksamhet)", desc: "GDPR- och kamerabevakningsregler för organisationer som filmar med drönare.", href: "https://www.imy.se/verksamhet/kamerabevakning/olika-tekniker-for-kamerabevakning/kamerabevakning-med-dronare/" },
];

export default function DroneRegulationsBusiness() {
  return (
    <>
      <SeoHead
        title="Drönarregler för företag — Specific, SORA & LUC | EU Drone Company"
        description="Guide för företag som använder drönare i verksamheten: registrering, tillstånd i Specific-kategorin (STS, PDRA, SORA, LUC), drifthandbok, försäkring och GDPR. Med länkar till Transportstyrelsen och EASA."
        canonical={droneUrl("/kommersiella-dronare/regelverk/foretag")}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Regelverk", url: droneUrl("/kommersiella-dronare/regelverk") },
          { name: "Företag", url: droneUrl("/kommersiella-dronare/regelverk/foretag") },
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
              <span className="text-white/70">Företag</span>
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Building2 className="h-3.5 w-3.5" />
                Regelverk · Företag
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                Drönarregler för företag
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
                Från registrering av verksamheten till Specific-tillstånd, SORA och drifthandbok — så uppfyller
                ni EASA:s och Transportstyrelsens krav som kommersiell drönaroperatör.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Setup steps */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <ClipboardCheck className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Kom igång: så registrerar ni verksamheten</h2>
            </div>
            <div className="space-y-4">
              {SETUP_STEPS.map((step, i) => (
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

        {/* Category paths */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <Scale className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Vilken kategori passar er verksamhet?</h2>
            </div>
            <div className="space-y-6">
              {CATEGORY_PATHS.map((cat, i) => (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
                >
                  <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{cat.body}</p>

                  {cat.subItems && (
                    <div className="grid md:grid-cols-2 gap-3 mb-2">
                      {cat.subItems.map((sub) => (
                        <a
                          key={sub.label}
                          href={sub.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-sm group-hover:text-orange-400 transition-colors">{sub.label}</span>
                            <ExternalLink className="h-3.5 w-3.5 text-white/30 shrink-0 mt-0.5" />
                          </div>
                          <p className="text-xs text-white/40 leading-relaxed">{sub.desc}</p>
                        </a>
                      ))}
                    </div>
                  )}

                  {cat.links && (
                    <div className="flex flex-wrap gap-3">
                      {cat.links.map((link) =>
                        link.href.startsWith("http") ? (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300"
                          >
                            {link.label} <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <Link
                            key={link.href}
                            to={link.href}
                            className="inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300"
                          >
                            {link.label} <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Training per industry */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Kompetens och certifiering per bransch</h2>
            </div>
            <p className="text-white/50 max-w-2xl mb-10">
              Vilken utbildning fjärrpiloterna behöver beror på uppdraget. Välj er bransch för en fullständig
              checklista över certifikat, tillstånd och rekommenderade drönare.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRAINING_REQUIREMENTS.map((tr, i) => (
                <Link key={tr.slug} to={`/kommersiella-dronare/utbildning/${tr.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group h-full"
                  >
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                      <tr.icon className="h-5 w-5 text-orange-400" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-orange-400 transition-colors">{tr.title.replace("Utbildningskrav för ", "")}</h3>
                    <p className="text-sm text-white/50 leading-relaxed line-clamp-3">{tr.description}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-orange-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Se krav <ArrowRight className="h-3 w-3" />
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Other rules */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <ShieldAlert className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Andra tillstånd och lagar att ha koll på</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {OTHER_RULES.map((rule, i) => (
                <motion.div
                  key={rule.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="p-5 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <h3 className="font-semibold mb-2">{rule.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{rule.body}</p>
                  {rule.link && (
                    <a
                      href={rule.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 mt-3"
                    >
                      {rule.link.label} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <ClipboardCheck className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Checklista: redo för uppdrag?</h2>
            </div>
            <div className="space-y-3">
              {CHECKLIST.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white/70 text-sm">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Useful links */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <FileText className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Nyttiga länkar</h2>
            </div>
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Vill ni ha hjälp att komma igång?</h2>
            <p className="text-white/50 mb-8">
              Vi hjälper er välja rätt drönare, navigera tillståndsprocessen och komma igång med rätt utrustning
              för er bransch.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/kommersiella-dronare/kontakt">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-8">
                  Begär rådgivning <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/kommersiella-dronare/paket" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
                Se färdiga paketlösningar för företag <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <Link to="/kommersiella-dronare/regelverk/privatpersoner" className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mt-6">
              <Users className="h-4 w-4" />
              Ska du flyga privat istället? Se reglerna för privatpersoner
            </Link>
          </div>
        </section>

        <RegulationSourceNote />

        <EnterpriseFooter />
      </div>
    </>
  );
}
