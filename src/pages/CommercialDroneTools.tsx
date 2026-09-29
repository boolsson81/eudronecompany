import { droneUrl } from "@/lib/publicSite";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import { Wrench, ArrowRight, ExternalLink, ArrowUpRight } from "lucide-react";
import { DRONE_TOOLS, TOOL_CATEGORIES, type DroneToolCategory } from "@/data/droneTools";

const CATEGORY_ORDER: DroneToolCategory[] = ["underhall", "kalibrering", "matning", "falt", "transport"];

export default function CommercialDroneTools() {
  return (
    <>
      <SeoHead
        title="Verktyg för drönare | EU Drone Company"
        description="Service-, kalibrerings- och fältverktyg för professionell drönardrift — skruvmejselset, batteritestare, landningsplattformar och transportväskor."
        canonical={droneUrl("/kommersiella-dronare/verktyg")}
        breadcrumbs={[
          { name: "Hem", url: droneUrl("/") },
          { name: "Kommersiella drönare", url: droneUrl("/kommersiella-dronare") },
          { name: "Verktyg", url: droneUrl("/kommersiella-dronare/verktyg") },
        ]}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav />

        <div className="pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-10">
              <Link to="/kommersiella-dronare" className="hover:text-white transition-colors">
                Kommersiella drönare
              </Link>
              <span>/</span>
              <span className="text-white/70">Verktyg</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Wrench className="h-3.5 w-3.5" />
                Service, kalibrering & fältutrustning
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Verktyg för drönare</h1>
              <p className="text-white/50 max-w-2xl mx-auto text-lg">
                Rätt verktyg håller flottan flygklar — från precisionsskruvmejslar och kalibreringsutrustning
                till mätinstrument och transportlösningar för fältuppdrag.
              </p>
            </motion.div>

            {CATEGORY_ORDER.map((cat, catIdx) => {
              const tools = DRONE_TOOLS.filter((t) => t.category === cat);
              if (tools.length === 0) return null;
              const meta = TOOL_CATEGORIES[cat];

              return (
                <section key={cat} className={catIdx > 0 ? "mt-16 md:mt-20" : ""}>
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{meta.label}</h2>
                    <p className="text-white/50">{meta.description}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool, i) => (
                      <motion.div
                        key={tool.name}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="group rounded-2xl bg-[#111] border border-white/10 p-6 hover:border-orange-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <Wrench className="h-5 w-5 text-orange-500/60" />
                          {tool.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-medium shrink-0">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-white/50 mb-4 leading-relaxed">{tool.desc}</p>
                        {tool.shopUrl && (
                          <a
                            href={tool.shopUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                          >
                            Se på ActionKing.se <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="text-center mt-16">
              <p className="text-white/50 mb-6">
                Hittar du inte rätt verktyg för din flotta? Vi hjälper dig sätta ihop en komplett service- och
                fältutrustning.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/kommersiella-dronare/kontakt">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
                    Begär offert <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <a href="https://actionking.se" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 text-base px-10"
                  >
                    Se hela sortimentet <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
        <EnterpriseFooter />
      </div>
    </>
  );
}
