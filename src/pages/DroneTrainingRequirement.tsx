import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Radio, CheckCircle2, GraduationCap, AlertTriangle, Cpu } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import RegulationSourceNote from "@/components/RegulationSourceNote";
import { getTrainingBySlug, TRAINING_REQUIREMENTS } from "@/data/droneRegulations";
import { getDroneMedia } from "@/data/commercialDroneIndustries";

export default function DroneTrainingRequirement() {
  const { trainingSlug } = useParams<{ trainingSlug: string }>();
  const training = trainingSlug ? getTrainingBySlug(trainingSlug) : undefined;

  if (!training) {
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
      <SeoHead title={training.seoTitle} description={training.seoDesc} />

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
              <span className="text-white/70">Utbildning</span>
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <GraduationCap className="h-3.5 w-3.5" />
                Utbildningskrav
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                {training.title}
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">{training.description}</p>
            </motion.div>
          </div>
        </section>

        {/* Category & Training overview */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-xs text-orange-400 uppercase tracking-widest font-semibold mb-2">Kategori</div>
                <p className="text-white/80">{training.requiredCategory}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-xs text-orange-400 uppercase tracking-widest font-semibold mb-2">Utbildning</div>
                <p className="text-white/80">{training.requiredTraining}</p>
              </div>
            </div>

            {/* Certifications */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-orange-500" />
              Certifieringar som krävs
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-16">
              {training.certifications.map((cert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white/70 text-sm">{cert}</span>
                </motion.div>
              ))}
            </div>

            {/* Additional requirements */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Ytterligare krav
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {training.additionalRequirements.map((req, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <CheckCircle2 className="h-5 w-5 text-white/30 mt-0.5 flex-shrink-0" />
                  <span className="text-white/70 text-sm">{req}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended drones */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Rekommenderade drönare</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {training.recommendedDrones.map((droneName, i) => (
                <motion.div
                  key={droneName}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden"
                >
                  {(() => {
                    const media = getDroneMedia(droneName);
                    return media ? (
                      <img src={media.image} alt={droneName} loading="lazy" width={800} height={600} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center">
                        <Cpu className="h-12 w-12 text-orange-500/40" />
                      </div>
                    );
                  })()}
                  <div className="p-6">
                    <h3 className="text-xl font-bold">{droneName}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Link to industry page */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Se lösningar för branschen</h2>
            <Link to={`/kommersiella-dronare/${training.industrySlug}`}>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group inline-flex items-center gap-3">
                <training.icon className="h-6 w-6 text-orange-400" />
                <span className="font-semibold group-hover:text-orange-400 transition-colors">
                  Se alla drönarlösningar för {training.title.replace("Utbildningskrav för ", "").toLowerCase()}
                </span>
                <ArrowRight className="h-4 w-4 text-orange-400" />
              </div>
            </Link>
          </div>
        </section>

        {/* Other training pages */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Utbildningskrav för andra branscher</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRAINING_REQUIREMENTS.filter((t) => t.slug !== training.slug).map((t, i) => (
                <Link key={t.slug} to={`/kommersiella-dronare/utbildning/${t.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group"
                  >
                    <h3 className="font-semibold mb-1 group-hover:text-orange-400 transition-colors text-sm">
                      {t.title.replace("Utbildningskrav för ", "")}
                    </h3>
                    <p className="text-xs text-white/40">{t.requiredCategory}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Behöver du hjälp att komma igång?</h2>
            <p className="text-white/50 mb-8">Vi hjälper dig att välja rätt drönare och utbildning — kontakta oss för skräddarsydd rådgivning.</p>
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
