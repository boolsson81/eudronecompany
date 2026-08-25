// @ts-nocheck -- Migration split-brain: generated types.ts targets a different project schema.
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import FaqSection, { faqJsonLd } from "@/components/FaqSection";
import RelatedPages from "@/components/RelatedPages";
import DroneAccessories from "@/components/DroneAccessories";
import EnterpriseNav from "@/components/EnterpriseNav";
import type { FaqItem } from "@/data/commercialDroneIndustries";
import {
  Cpu, Shield, CheckCircle2, Radio, ArrowRight, Scale
} from "lucide-react";
import { INDUSTRY_DATA } from "@/data/commercialDroneIndustries";

const SHOWCASE_VIDEOS = [
  { id: "JPPHG5dSpwM", title: "DJI Matrice 350 RTK" },
  { id: "KH-ZReRtoec", title: "DJI Mavic 3 Enterprise" },
  { id: "OwUwgpqgcMA", title: "DJI Dock 3" },
  { id: "TxthvIgwPPc", title: "DJI Zenmuse H30 Series" },
];
import { DRONE_COMPARISONS } from "@/data/droneComparisons";
import { INDUSTRY_DATA, getDroneMedia } from "@/data/commercialDroneIndustries";

const HUB_FAQ: FaqItem[] = [
  { question: "Vilka drönare säljer EU Drone Company?", answer: "Vi är auktoriserad DJI Enterprise-partner och erbjuder hela DJI Enterprise-sortimentet, inklusive Matrice 350 RTK, Mavic 3 Enterprise, Agras T50, Inspire 3 och alla tillbehör." },
  { question: "Vad kostar en kommersiell drönare?", answer: "Priset varierar beroende på modell och tillbehör. DJI Mavic 3 Enterprise börjar runt 30 000 kr, medan DJI Matrice 350 RTK med payload kostar från ca 100 000 kr. Kontakta oss för exakt offert." },
  { question: "Ingår utbildning vid köp?", answer: "Ja, vi erbjuder skräddarsydd utbildning anpassad efter din bransch och tillämpning. Vi hjälper även med flygcertifiering och tillståndsansökningar." },
  { question: "Hur lång tid tar leveransen?", answer: "Vi har lager i Sverige och de flesta produkter levereras inom 2–5 arbetsdagar. Specialkonfigurationer kan ta något längre." },
  { question: "Erbjuder ni leasing eller finansiering?", answer: "Ja, vi erbjuder flera finansieringsalternativ inklusive leasing, avbetalning och hyra. Kontakta oss för ett upplägg som passar ert företag." },
  { question: "Vilken support ingår efter köpet?", answer: "Alla köp inkluderar 2 års DJI Enterprise-garanti, teknisk support och tillgång till vår serviceverkstad i Sverige. Vi erbjuder även DJI Care Enterprise för utökat skydd." },
];





export default function CommercialDrones() {

  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const hubFaqJsonLd = useMemo(() => faqJsonLd(HUB_FAQ), []);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EU Drone Company Enterprise",
    url: "https://actionking.se",
    description: "Auktoriserad DJI Enterprise-partner i Sverige. Kommersiella drönare för inspektion, kartläggning, lantbruk och säkerhet.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+46320123456",
      contactType: "sales",
      availableLanguage: "Swedish",
    },
  };

  return (
    <>
      <SeoHead
        title="Kommersiella Drönare för Företag — DJI Enterprise | EU Drone Company"
        description="Köp professionella DJI Enterprise-drönare för inspektion, kartläggning, lantbruk och säkerhet. Auktoriserad återförsäljare i Sverige med lager, support och utbildning."
        canonical="https://actionking.se/kommersiella-dronare"
        breadcrumbs={[
          { name: "Hem", url: "https://actionking.se/" },
          { name: "Kommersiella drönare", url: "https://actionking.se/kommersiella-dronare" },
        ]}
        jsonLd={[hubFaqJsonLd, organizationJsonLd]}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav onCtaClick={scrollToForm} />

        {/* Hero */}
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Cpu className="h-3.5 w-3.5" />
                Auktoriserad DJI Enterprise-återförsäljare
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
                Kommersiella<br />
                <span className="text-orange-500">drönare</span> för<br />
                ditt företag
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl mb-8 leading-relaxed">
                Effektivisera inspektion, kartläggning och övervakning med professionella DJI Enterprise-drönare. 
                Vi hjälper dig välja rätt lösning.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={scrollToForm} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-8">
                  Begär offert <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button onClick={scrollToForm} variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/5 text-base px-8">
                  Konsultera en expert
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-y border-white/10 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Företagskunder" },
              { value: "DJI", label: "Enterprise Partner" },
              { value: "24/7", label: "Support & Service" },
              { value: "Sverige", label: "Lager & Leverans" },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-orange-500">{item.value}</div>
                <div className="text-xs text-white/50 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Användningsområden</h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                Professionella drönarlösningar anpassade efter din bransch och dina behov.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INDUSTRY_DATA.map((uc, i) => (
                <Link key={uc.slug} to={`/kommersiella-dronare/${uc.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all duration-300 cursor-pointer h-full"
                  >
                    <uc.icon className="h-8 w-8 text-orange-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-400 transition-colors">{uc.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-3">{uc.shortDesc}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-orange-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Läs mer <ArrowRight className="h-3 w-3" />
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Drone comparisons */}
        <section className="py-20 md:py-28 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-4">
                <Scale className="h-3.5 w-3.5" />
                Jämförelser
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Vilken drönare passar dig?</h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                Läs våra jämförelseguider och hitta rätt DJI-modell för ditt företag.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {DRONE_COMPARISONS.map((comparison, i) => (
                <Link key={comparison.slug} to={`/kommersiella-dronare/jamforelser/${comparison.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group h-full"
                  >
                    <span className="text-xs text-orange-400">{comparison.category}</span>
                    <h3 className="text-base font-semibold mt-2 mb-2 group-hover:text-orange-400 transition-colors leading-snug">
                      {comparison.title}
                    </h3>
                    <p className="text-sm text-white/50 line-clamp-2">{comparison.excerpt}</p>
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link to="/kommersiella-dronare/jamforelser">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                  Se alla jämförelser <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Products CTA */}
        <section id="products" className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Utvalda produkter</h2>
              <p className="text-white/50 mb-8 max-w-2xl mx-auto">
                Vi erbjuder hela DJI Enterprise-sortimentet — från kompakta inspektionsdrönare till tunga industriella plattformar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/kommersiella-dronare/produkter">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
                    Se produkter <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/kommersiella-dronare/jamfor-kameror">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 text-base px-10">
                    Jämför kameror
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Video Showcase */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Se drönarna i aktion</h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                Upptäck kapaciteten hos DJI:s Enterprise-drönare genom officiella produktfilmer.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {SHOWCASE_VIDEOS.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]"
                >
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white/80">{video.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why EU Drone Company */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Varför EU Drone Company?</h2>
                <div className="space-y-4">
                  {[
                    "Auktoriserad DJI Enterprise-partner i Sverige",
                    "Komplett support — från val av drönare till flygutbildning",
                    "Lager i Sverige — snabb leverans utan tull",
                    "Service och reparation på plats",
                    "Skräddarsydda lösningar för din bransch",
                    "Finansiering och leasingupplägg",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 p-8 md:p-10"
              >
                <Shield className="h-10 w-10 text-orange-500 mb-4" />
                <h3 className="text-xl font-bold mb-3">Enterprise-garanti</h3>
                <p className="text-white/60 leading-relaxed mb-4">
                  Alla våra kommersiella drönare levereras med DJI Enterprise-garanti, 
                  professionell support och möjlighet till utökat serviceavtal (DJI Care Enterprise).
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <div className="text-2xl font-bold text-orange-500">2 år</div>
                    <div className="text-xs text-white/40 mt-1">Garanti</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <div className="text-2xl font-bold text-orange-500">48h</div>
                    <div className="text-xs text-white/40 mt-1">Servicerespons</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA to Contact Page */}
        <section id="lead-form" className="py-20 md:py-28 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Redo att komma igång?</h2>
              <p className="text-white/50 mb-8 leading-relaxed max-w-2xl mx-auto">
                Berätta om ditt behov så hjälper vi dig hitta rätt drönarlösning.
                Vi återkommer inom 24 timmar med en personlig rekommendation.
              </p>
              <Link to="/kommersiella-dronare/kontakt">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
                  Kontakta oss <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>


        <DroneAccessories
          droneNames={["DJI Matrice 350 RTK", "DJI Mavic 3 Enterprise", "DJI Agras T50", "DJI Inspire 3", "DJI Mavic 3 Pro"]}
          heading="Tillbehör & Konfigurationer"
        />
        <FaqSection items={HUB_FAQ} variant="dark" heading="Vanliga frågor om kommersiella drönare" />
        <RelatedPages pageUrl="https://actionking.se/kommersiella-dronare" heading="Relaterade sidor" />

        {/* Footer */}
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
