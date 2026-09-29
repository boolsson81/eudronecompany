import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Cpu } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import FaqSection, { faqJsonLd } from "@/components/FaqSection";
import EnterpriseNav from "@/components/EnterpriseNav";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import { getIndustrySolutionBySlug } from "@/data/industrySolutions";
import { getDroneMedia } from "@/data/commercialDroneIndustries";
import { getDroneProductPathByName } from "@/data/enterpriseDroneProducts";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

/**
 * Mall för en enskild branschlösning. Rendrerar de utbyggda sektionerna
 * (lösningar, rekommenderade drönare, fördelar, FAQ) när branschen har
 * eget innehåll — se "infrastruktur-bygg" i industrySolutions.ts för
 * mönstret — annars bara hero + "Vad vi täcker"-chips tills branschen
 * fylls i.
 */
export default function IndustrySolution() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug ? getIndustrySolutionBySlug(slug) : undefined;
  const faqJsonLdData = useMemo(() => (industry?.faq ? faqJsonLd(industry.faq) : null), [industry]);

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

  const heroTitle = industry.heroTitle ?? `Drönarlösningar för ${industry.title.toLowerCase()}`;
  const heroDesc =
    industry.heroDesc ??
    `Skräddarsydda drönarlösningar för ${industry.titleEn.toLowerCase()} — kontakta oss för att diskutera era behov.`;

  return (
    <>
      <SeoHead
        title={`${industry.title} — Drönarlösningar | EU Drone Company`}
        description={heroDesc}
        canonical={droneUrl(`/kommersiella-dronare/branschlosningar/${industry.slug}`)}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Branschlösningar", url: droneUrl("/kommersiella-dronare/branschlosningar") },
          { name: industry.title, url: droneUrl(`/kommersiella-dronare/branschlosningar/${industry.slug}`) },
        ]}
        jsonLd={faqJsonLdData || undefined}
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
                {heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">{heroDesc}</p>
            </motion.div>
          </div>
        </section>

        {/* Vad vi täcker */}
        <section className="pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
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

        {/* Solutions */}
        {industry.solutions && industry.solutions.length > 0 && (
          <section className="py-16 md:py-24 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-10">Lösningar</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {industry.solutions.map((s, i) => (
                  <motion.div
                    key={s.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="p-6 rounded-2xl bg-[#111] border border-white/10 h-full"
                  >
                    <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
                    {s.useCases && s.useCases.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {s.useCases.map((uc) => (
                          <li key={uc} className="flex items-start gap-2 text-xs text-white/50">
                            <CheckCircle2 className="h-3.5 w-3.5 text-orange-500/70 mt-0.5 flex-shrink-0" />
                            {uc}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recommended drones */}
        {industry.recommendedDrones && industry.recommendedDrones.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-10">Rekommenderade drönare</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {industry.recommendedDrones.map((drone, i) => {
                  const media = getDroneMedia(drone.name);
                  const productPath = getDroneProductPathByName(drone.name);
                  return (
                    <motion.div
                      key={drone.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden"
                    >
                      {media ? (
                        <img
                          src={media.image}
                          alt={drone.name}
                          loading="lazy"
                          width={800}
                          height={600}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="h-40 bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center">
                          <Cpu className="h-14 w-14 text-orange-500/40" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">{drone.tag}</div>
                        <h3 className="text-xl font-bold mb-2">{drone.name}</h3>
                        <p className="text-sm text-white/50 mb-4 leading-relaxed">{drone.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {drone.features.map((f) => (
                            <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">{f}</span>
                          ))}
                        </div>
                        {productPath && (
                          <Link
                            to={productPath}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors mt-4"
                          >
                            Läs mer om {drone.name} <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Benefits */}
        {industry.benefits && industry.benefits.length > 0 && (
          <section className="py-16 md:py-24 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-10">Fördelar</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {industry.benefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10"
                  >
                    <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-white/70">{b}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {industry.faq && industry.faq.length > 0 && (
          <FaqSection items={industry.faq} variant="dark" heading={`Vanliga frågor om ${industry.title.toLowerCase()}`} />
        )}

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
