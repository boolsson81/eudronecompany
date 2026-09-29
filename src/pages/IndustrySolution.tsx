import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import { getIndustrySolutionBySlug } from "@/data/industrySolutions";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

/**
 * Mall för en enskild branschlösning. Fylls med egna sektioner (lösningar,
 * rekommenderade drönare, kundcase, FAQ) allt eftersom respektive bransch
 * får eget innehåll — se CommercialDroneIndustry.tsx för det utbyggda mönstret.
 */
export default function IndustrySolution() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug ? getIndustrySolutionBySlug(slug) : undefined;

  if (!industry) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sidan hittades inte</h1>
          <Link to="/kommersiella-dronare/branschlosningar" className="text-orange-500 hover:underline">
            ← Tillbaka till branschlösningar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={`${industry.title} — Drönarlösningar | EU Drone Company`}
        description={`Drönarlösningar för ${industry.title.toLowerCase()}: ${industry.omfattar.join(", ").toLowerCase()}.`}
        canonical={droneUrl(`/kommersiella-dronare/branschlosningar/${industry.slug}`)}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Branschlösningar", url: droneUrl("/kommersiella-dronare/branschlosningar") },
          { name: industry.title, url: droneUrl(`/kommersiella-dronare/branschlosningar/${industry.slug}`) },
        ]}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav />

        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <Link
              to="/kommersiella-dronare/branschlosningar"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Alla branschlösningar
            </Link>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <industry.icon className="h-3.5 w-3.5" />
                {industry.title}
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                Drönarlösningar för {industry.title.toLowerCase()}
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
                Skräddarsydda drönarlösningar för {industry.titleEn.toLowerCase()} — kontakta oss
                för att diskutera era behov.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Vad vi täcker */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Vad vi täcker</h2>
            <div className="flex flex-wrap gap-3">
              {industry.omfattar.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-sm text-white/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact-cta" className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Intresserad av drönarlösningar för {industry.title.toLowerCase()}?
            </h2>
            <p className="text-white/50 mb-8">
              Kontakta oss för en skräddarsydd offert eller boka en demo anpassad till er bransch.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/kommersiella-dronare/kontakt">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-8 w-full sm:w-auto">
                  Begär offert <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/kommersiella-dronare/kontakt">
                <Button variant="outline" size="lg" className="border-white/20 bg-transparent text-white hover:bg-white/5 text-base px-8 w-full sm:w-auto">
                  Konsultera en expert
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <EnterpriseFooter />
      </div>
    </>
  );
}
