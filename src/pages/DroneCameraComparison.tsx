import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import FaqSection, { faqJsonLd } from "@/components/FaqSection";
import EnterpriseNav from "@/components/EnterpriseNav";
import DroneCameraComparison from "@/components/DroneCameraComparison";
import type { FaqItem } from "@/data/commercialDroneIndustries";
import { Camera, ArrowRight } from "lucide-react";
import { siteUrl } from "@/lib/site";

const PAGE_FAQ: FaqItem[] = [
  {
    question: "Vilken Zenmuse-kamera passar bäst för inspektion?",
    answer:
      "För de flesta inspektionsuppdrag rekommenderar vi Zenmuse H30T om du behöver termisk sensor, eller Zenmuse H30 om du enbart behöver högupplöst zoom. H30-serien erbjuder 40× optisk zoom och förbättrad bildkvalitet jämfört med H20T.",
  },
  {
    question: "Vad är skillnaden mellan H30 och H30T?",
    answer:
      "Zenmuse H30T har en integrerad termisk sensor (1280×1024) utöver vidvinkel- och zoomkamerorna. H30 har samma optiska zoom och laser-avståndsmätare men saknar termisk kamera — vilket gör den något lättare och mer prisvärd.",
  },
  {
    question: "Behöver jag P1 eller L2 för kartläggning?",
    answer:
      "Zenmuse P1 är bäst för fotogrammetri och ortofoton med 45 MP fullformats-sensor. Zenmuse L2 är rätt val om du behöver LiDAR-punktmoln, till exempel för skogskartläggning eller terrängmodeller genom vegetation.",
  },
  {
    question: "Vilka drönare är kamerorna kompatibla med?",
    answer:
      "De flesta Zenmuse-kameror i vår jämförelse monteras på DJI Matrice 300 RTK och Matrice 350 RTK. H30-serien stöds även på Matrice 400 RTK. Kontakta oss om du är osäker på kompatibilitet med din befintliga plattform.",
  },
  {
    question: "Kan jag byta kamera mellan olika uppdrag?",
    answer:
      "Ja, Zenmuse-payloads är utbytbara på Matrice-plattformarna. Många kunder har en inspektionskamera (H30T) och en kartläggningspayload (P1 eller L2) som de växlar mellan beroende på uppdrag.",
  },
];

export default function DroneCameraComparisonPage() {
  const faqJsonLdData = useMemo(() => faqJsonLd(PAGE_FAQ), []);

  const scrollToComparison = () => {
    document.getElementById("camera-comparison")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SeoHead
        title="Jämför drönarkameror — Zenmuse H30, H20T, P1 & L2 | EU Drone Company"
        description="Jämför professionella drönarkameror och Zenmuse-sensorer sida vid sida. Se specifikationer för termisk kamera, zoom, LiDAR och fotogrammetri — hitta rätt payload för ditt uppdrag."
        canonical={siteUrl("/kommersiella-dronare/jamfor-kameror")}
        breadcrumbs={[
          { name: "Hem", url: siteUrl("/") },
          { name: "Kommersiella drönare", url: siteUrl("/kommersiella-dronare") },
          { name: "Jämför kameror", url: siteUrl("/kommersiella-dronare/jamfor-kameror") },
        ]}
        jsonLd={[faqJsonLdData]}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav onCtaClick={scrollToComparison} />

        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-6">
              <Link to="/kommersiella-dronare" className="hover:text-white transition-colors">
                Kommersiella drönare
              </Link>
              <span>/</span>
              <span className="text-white/70">Jämför kameror</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Camera className="h-3.5 w-3.5" />
                Zenmuse-kameror & sensorer
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                Jämför<br />
                <span className="text-orange-500">drönarkameror</span>
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed mb-8">
                Välj rätt Zenmuse-payload genom att jämföra specifikationer sida vid sida.
                Termisk sensor, optisk zoom, LiDAR och fotogrammetri — allt på ett ställe.
              </p>
              <Button
                onClick={scrollToComparison}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white border-0"
              >
                Börja jämföra <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Comparison tool */}
        <section id="camera-comparison" className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Interaktiv jämförelse</h2>
              <p className="text-white/50 max-w-2xl">
                Välj upp till fyra kameror och jämför specifikationer. Skillnader markeras automatiskt
                så du snabbt ser vad som skiljer modellerna åt.
              </p>
            </motion.div>

            <DroneCameraComparison defaultPresetId="inspection" />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Behöver du hjälp att välja?</h2>
            <p className="text-white/50 mb-8 max-w-2xl mx-auto">
              Våra drönarexperter hjälper dig hitta rätt kamera och payload för ditt specifika uppdrag.
              Vi erbjuder demo, offert och kompletta systemlösningar.
            </p>
            <Link to="/kommersiella-dronare/kontakt">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 px-10">
                Kontakta en expert <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <FaqSection items={PAGE_FAQ} heading="Vanliga frågor om drönarkameror" />
          </div>
        </section>
      </div>
    </>
  );
}
