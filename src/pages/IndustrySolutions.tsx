import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import { INDUSTRY_SOLUTIONS } from "@/data/industrySolutions";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

export default function IndustrySolutions() {
  const scrollToContact = () => {
    const el = document.getElementById("contact-cta");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SeoHead
        title="Branschlösningar — Kommersiella Drönare | EU Drone Company"
        description="Drönarlösningar anpassade efter din bransch — från infrastruktur och energi till lantbruk, sjöfart och media. Hitta din bransch och se vad EU Drone Company kan göra för er."
        canonical={droneUrl("/kommersiella-dronare/branschlosningar")}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Branschlösningar", url: droneUrl("/kommersiella-dronare/branschlosningar") },
        ]}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav onCtaClick={scrollToContact} />

        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                Branschlösningar
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                Drönarlösningar för din bransch
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
                Från infrastruktur och energi till lantbruk, sjöfart och media — hitta din bransch
                och se hur EU Drone Company kan hjälpa er att flyga smartare.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Industry grid */}
        <section className="pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INDUSTRY_SOLUTIONS.map((industry, i) => (
                <Link key={industry.slug} to={`/kommersiella-dronare/branschlosningar/${industry.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all duration-300 cursor-pointer h-full"
                  >
                    <industry.icon className="h-8 w-8 text-orange-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-400 transition-colors">
                      {industry.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-3">
                      {industry.omfattar.join(", ")}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-orange-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Läs mer <ArrowRight className="h-3 w-3" />
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact-cta" className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Hittar du inte din bransch?</h2>
            <p className="text-white/50 mb-8">
              Vi skräddarsyr drönarlösningar oavsett verksamhet. Kontakta oss så tar vi fram ett
              förslag anpassat till er.
            </p>
            <Link
              to="/kommersiella-dronare/kontakt"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
            >
              Begär offert <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <EnterpriseFooter />
      </div>
    </>
  );
}
