import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Cpu } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import RelatedPages from "@/components/RelatedPages";
import DroneAccessories from "@/components/DroneAccessories";
import EnterpriseNav from "@/components/EnterpriseNav";
import { getSolutionBySlug, getDroneMedia } from "@/data/commercialDroneIndustries";
import { siteUrl } from "@/lib/site";

export default function CommercialDroneSolution() {
  const { slug, solutionSlug } = useParams<{ slug: string; solutionSlug: string }>();
  const result = slug && solutionSlug ? getSolutionBySlug(slug, solutionSlug) : undefined;

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sidan hittades inte</h1>
          <Link to="/kommersiella-dronare" className="text-orange-500 hover:underline">
            ← Tillbaka till kommersiella drönare
          </Link>
        </div>
      </div>
    );
  }

  const { industry, solution } = result;

  const scrollToContact = () => {
    const el = document.getElementById("solution-cta");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SeoHead
        title={solution.seoTitle || `${solution.title} — ${industry.title} | EU Drone Company`}
        description={solution.seoDesc || solution.desc}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav onCtaClick={scrollToContact} />

        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-6">
              <Link to="/kommersiella-dronare" className="hover:text-white transition-colors">Kommersiella drönare</Link>
              <span>/</span>
              <Link to={`/kommersiella-dronare/${industry.slug}`} className="hover:text-white transition-colors">{industry.title}</Link>
              <span>/</span>
              <span className="text-white/70">{solution.title}</span>
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <industry.icon className="h-3.5 w-3.5" />
                {industry.title}
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                {solution.title} med Drönare
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
                {solution.longDesc || solution.desc}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Use Cases */}
        {solution.useCases && solution.useCases.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-10">Användningsområden</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {solution.useCases.map((uc, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10"
                  >
                    <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-white/70">{uc}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Key Features */}
        {solution.keyFeatures && solution.keyFeatures.length > 0 && (
          <section className="py-16 md:py-24 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-10">Nyckelfunktioner</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {solution.keyFeatures.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
                  >
                    <p className="text-white/80 font-medium">{f}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recommended Drones from parent industry */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Rekommenderade drönare för {solution.title.toLowerCase()}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {industry.recommendedDrones.map((drone, i) => (
                <motion.div
                  key={drone.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden"
                >
                  {(() => {
                    const media = getDroneMedia(drone.name);
                    return media ? (
                      <img src={media.image} alt={drone.name} loading="lazy" width={800} height={600} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center">
                        <Cpu className="h-14 w-14 text-orange-500/40" />
                      </div>
                    );
                  })()}
                  <div className="p-6">
                    <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">{drone.tag}</div>
                    <h3 className="text-xl font-bold mb-2">{drone.name}</h3>
                    <p className="text-sm text-white/50 mb-4 leading-relaxed">{drone.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {drone.features.map((f) => (
                        <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">{f}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Other solutions in same industry */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Fler lösningar inom {industry.title.toLowerCase()}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {industry.solutions
                .filter((s) => s.slug !== solution.slug)
                .map((s, i) => (
                  <Link key={s.slug} to={`/kommersiella-dronare/${industry.slug}/${s.slug}`} className="block active:opacity-80">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group cursor-pointer"
                    >
                      <h3 className="font-semibold mb-1 group-hover:text-orange-400 transition-colors">{s.title}</h3>
                      <p className="text-sm text-white/50">{s.desc}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-orange-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        Läs mer <ArrowRight className="h-3 w-3" />
                      </span>
                    </motion.div>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        <DroneAccessories
          droneNames={industry.recommendedDrones.map(d => d.name)}
          heading={`Tillbehör för ${solution.title.toLowerCase()}`}
        />
        <RelatedPages pageUrl={siteUrl(`/kommersiella-dronare/${industry.slug}/${solution.slug}`)} heading="Relaterade sidor" />

        {/* CTA */}
        <section id="solution-cta" className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Intresserad av {solution.title.toLowerCase()}?</h2>
            <p className="text-white/50 mb-8">Kontakta oss för en skräddarsydd offert eller boka en demo.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/kommersiella-dronare/kontakt">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-8 w-full sm:w-auto">
                  Begär offert <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/kommersiella-dronare/kontakt">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/5 text-base px-8 w-full sm:w-auto">
                  Konsultera en expert
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
