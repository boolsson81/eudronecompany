import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Radio, CheckCircle2, AlertTriangle, Cpu } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import RegulationSourceNote from "@/components/RegulationSourceNote";
import { getCategoryBySlug, DRONE_CATEGORIES } from "@/data/droneRegulations";
import { getDroneMedia } from "@/data/commercialDroneIndustries";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

export default function DroneRegulationCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  if (!category) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sidan hittades inte</h1>
          <Link to="/kommersiella-dronare/regelverk" className="text-orange-500 hover:underline">
            ← Tillbaka till regelverk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={category.seoTitle}
        description={category.seoDesc}
        canonical={droneUrl(`/kommersiella-dronare/regelverk/${category.slug}`)}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Regelverk", url: droneUrl("/kommersiella-dronare/regelverk") },
          { name: category.name, url: droneUrl(`/kommersiella-dronare/regelverk/${category.slug}`) },
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
              <span className="text-white/70">{category.name}</span>
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <category.icon className="h-3.5 w-3.5" />
                {category.name}
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                {category.name} — {category.subtitle}
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">{category.description}</p>
            </motion.div>
          </div>
        </section>

        {/* Key info grid */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Krav & begränsningar</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { label: "Max vikt", value: category.maxWeight },
                { label: "Utbildning", value: category.trainingRequired },
                { label: "Åldersgräns", value: category.pilotAge },
                { label: "Registrering", value: category.requiresRegistration ? "Ja — hos Transportstyrelsen" : "Nej" },
                { label: "Försäkring", value: category.requiresInsurance ? "Ja — ansvarsförsäkring krävs" : "Nej" },
                { label: "Prov", value: category.examRequired ? "Ja — teoriprov" : "Nej" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="p-5 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <div className="text-xs text-orange-400 uppercase tracking-widest font-semibold mb-2">{item.label}</div>
                  <p className="text-white/80 text-sm">{item.value}</p>
                </motion.div>
              ))}
            </div>

            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Operativa begränsningar
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {category.operationalLimitations.map((lim, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white/70 text-sm">{lim}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Allowed Drones */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Drönare i {category.name}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {category.allowedDrones.map((drone, i) => (
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
                      <img src={media.image} alt={drone.name} loading="lazy" width={800} height={600} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center">
                        <Cpu className="h-12 w-12 text-orange-500/40" />
                      </div>
                    );
                  })()}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">{drone.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">{drone.classLabel}</span>
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">{drone.weight}</span>
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">{drone.category}</span>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{drone.notes}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Other categories */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Andra kategorier</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DRONE_CATEGORIES.filter((c) => c.slug !== category.slug).map((c, i) => (
                <Link key={c.slug} to={`/kommersiella-dronare/regelverk/${c.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group"
                  >
                    <h3 className="font-semibold mb-1 group-hover:text-orange-400 transition-colors">{c.name}</h3>
                    <p className="text-xs text-white/40">{c.subtitle}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Behöver du hjälp att komma igång?</h2>
            <p className="text-white/50 mb-8">Vi hjälper dig att välja rätt drönare och navigera regelverket — kontakta oss för rådgivning.</p>
            <Link to="/kommersiella-dronare/kontakt">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-8">
                Begär rådgivning <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </section>

        <RegulationSourceNote />
      </div>
    </>
  );
}
