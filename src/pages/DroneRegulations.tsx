import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Radio, BookOpen, Shield, GraduationCap } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import RegulationSourceNote from "@/components/RegulationSourceNote";
import { DRONE_CATEGORIES, TRAINING_REQUIREMENTS } from "@/data/droneRegulations";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

export default function DroneRegulations() {
  return (
    <>
      <SeoHead
        title="Drönaregler & Utbildningskrav i Sverige — EASA | EU Drone Company"
        description="Komplett guide till drönaregler i Sverige. EASA-kategorier, utbildningskrav och certifikat per bransch. Allt du behöver veta innan du flyger."
        canonical={droneUrl("/kommersiella-dronare/regelverk")}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Regelverk", url: droneUrl("/kommersiella-dronare/regelverk") },
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
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                Begär offert
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <Link to="/kommersiella-dronare" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-6 transition-colors">
              ← Kommersiella drönare
            </Link>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <BookOpen className="h-3.5 w-3.5" />
                Regelverk & Utbildning
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                Drönaregler & Utbildningskrav i Sverige
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
                Komplett guide till EASA:s drönarkategorier, utbildningskrav och certifikat — anpassat per bransch och drönarmodell.
              </p>
            </motion.div>
          </div>
        </section>

        {/* EASA Categories */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <Shield className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">EASA-kategorier</h2>
            </div>
            <p className="text-white/50 max-w-2xl mb-10">
              Sedan 2021 gäller EU:s gemensamma drönarregelverk (EASA) i Sverige, administrerat av Transportstyrelsen. Alla drönare delas in i tre huvudkategorier: Open, Specific och Certified.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {DRONE_CATEGORIES.map((cat, i) => (
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
                    <p className="text-sm text-white/50 leading-relaxed mb-3">{cat.description.slice(0, 150)}...</p>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>Max vikt: {cat.maxWeight}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-orange-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Läs mer <ArrowRight className="h-3 w-3" />
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Training per industry */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <GraduationCap className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Utbildningskrav per bransch</h2>
            </div>
            <p className="text-white/50 max-w-2xl mb-10">
              Utbildningskraven varierar beroende på vilken typ av arbete du ska utföra och vilken drönare du använder. Välj din bransch för att se specifika krav.
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
                    <div className="mt-3 text-xs text-orange-400/70">{tr.requiredCategory}</div>
                    <span className="inline-flex items-center gap-1 text-xs text-orange-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Se krav <ArrowRight className="h-3 w-3" />
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Osäker på vilken kategori du behöver?</h2>
            <p className="text-white/50 mb-8">Kontakta oss så hjälper vi dig att identifiera rätt drönare, utbildning och tillstånd för just ditt behov.</p>
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
