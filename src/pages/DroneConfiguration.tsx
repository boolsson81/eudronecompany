import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Radio, Package, Wrench, CheckCircle2, Star } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import { getConfigBySlug, INDUSTRY_CONFIGS } from "@/data/droneConfigurations";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  standard: { label: "Bas", color: "bg-white/10 text-white/70 border-white/20" },
  pro: { label: "Pro", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  enterprise: { label: "Enterprise", color: "bg-orange-500/20 text-orange-300 border-orange-400/30" },
};

export default function DroneConfiguration() {
  const { configSlug } = useParams<{ configSlug: string }>();
  const config = configSlug ? getConfigBySlug(configSlug) : undefined;

  if (!config) {
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

  return (
    <>
      <SeoHead
        title={config.seoTitle}
        description={config.seoDesc}
        canonical={droneUrl(`/kommersiella-dronare/konfiguration/${config.slug}`)}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: config.title, url: droneUrl(`/kommersiella-dronare/konfiguration/${config.slug}`) },
        ]}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Nav */}
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
              <Link to={`/kommersiella-dronare/${config.industrySlug}`} className="hover:text-white transition-colors">{config.title}</Link>
              <span>/</span>
              <span className="text-white/70">Konfiguration</span>
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Package className="h-3.5 w-3.5" />
                Konfiguration & Tillbehör
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                Konfiguration för {config.title}
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">{config.description}</p>
            </motion.div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <Package className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Rekommenderade paket</h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              {config.packages.map((pkg, i) => {
                const level = LEVEL_LABELS[pkg.level];
                return (
                  <motion.div
                    key={pkg.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl bg-[#111] border overflow-hidden flex flex-col ${pkg.level === "pro" ? "border-orange-500/30 ring-1 ring-orange-500/10" : "border-white/10"}`}
                  >
                    <div className="p-6 flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${level.color}`}>
                          {level.label}
                        </span>
                        {pkg.level === "pro" && (
                          <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 flex items-center gap-1">
                            <Star className="h-3 w-3" /> Populärast
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                      <p className="text-xs text-orange-400 mb-3">{pkg.drone}</p>
                      <p className="text-sm text-white/50 mb-6 leading-relaxed">{pkg.description}</p>

                      <div className="space-y-2 mb-6">
                        {pkg.components.map((comp) => (
                          <div key={comp} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-white/70">{comp}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <p className="text-xs text-white/40 mb-1">Idealiskt för</p>
                        <p className="text-sm text-white/70">{pkg.idealFor}</p>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <Link to="/kommersiella-dronare/kontakt">
                        <Button className={`w-full ${pkg.level === "pro" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white/10 hover:bg-white/15 text-white"} border-0`}>
                          Begär offert <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Accessories */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <Wrench className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Tillbehör & Kringutrustning</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.accessories.map((acc, i) => (
                <motion.div
                  key={acc.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
                >
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                    <acc.icon className="h-5 w-5 text-orange-400" />
                  </div>
                  <h3 className="font-bold mb-1">{acc.name}</h3>
                  <p className="text-sm text-white/50 mb-3">{acc.description}</p>
                  <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                    <p className="text-xs text-orange-400 font-medium mb-0.5">Varför behövs det?</p>
                    <p className="text-sm text-white/60">{acc.why}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Link to industry solutions */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Utforska fler resurser</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to={`/kommersiella-dronare/${config.industrySlug}`}>
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group flex items-center gap-3">
                  <config.icon className="h-5 w-5 text-orange-400" />
                  <span className="font-semibold group-hover:text-orange-400 transition-colors">Lösningar för {config.title.toLowerCase()}</span>
                  <ArrowRight className="h-4 w-4 text-orange-400 ml-auto" />
                </div>
              </Link>
              <Link to={`/kommersiella-dronare/utbildning/${config.industrySlug}`}>
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group flex items-center gap-3">
                  <config.icon className="h-5 w-5 text-orange-400" />
                  <span className="font-semibold group-hover:text-orange-400 transition-colors">Utbildningskrav för {config.title.toLowerCase()}</span>
                  <ArrowRight className="h-4 w-4 text-orange-400 ml-auto" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Other configs */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Konfigurationer för andra branscher</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDUSTRY_CONFIGS.filter((c) => c.slug !== config.slug).map((c, i) => (
                <Link key={c.slug} to={`/kommersiella-dronare/konfiguration/${c.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group"
                  >
                    <h3 className="font-semibold mb-1 group-hover:text-orange-400 transition-colors text-sm">{c.title}</h3>
                    <p className="text-xs text-white/40">{c.packages.length} paket · {c.accessories.length} tillbehör</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Vill du ha en skräddarsydd konfiguration?</h2>
            <p className="text-white/50 mb-8">Vi sätter ihop exakt rätt paket för dina behov — kontakta oss för en personlig offert.</p>
            <Link to="/kommersiella-dronare/kontakt">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-8">
                Begär offert <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
