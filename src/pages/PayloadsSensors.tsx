import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import { ArrowRight, Boxes } from "lucide-react";
import { PAYLOAD_CATEGORIES } from "@/data/payloadCategories";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

export default function PayloadsSensors() {
  return (
    <>
      <SeoHead
        title="Payloads & sensorer | EU Drone Company"
        description="Utforska payload- och sensorkategorier för Enterprise-drönare — från kamera och termisk avbildning till LiDAR, sprutsystem och specialpayloads."
        canonical={droneUrl("/kommersiella-dronare/payloads-sensorer")}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Payloads & sensorer", url: droneUrl("/kommersiella-dronare/payloads-sensorer") },
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
              <span className="text-white/70">Payloads & sensorer</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Boxes className="h-3.5 w-3.5" />
                Payloadöversikt
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Payloads & sensorer</h1>
              <p className="text-white/50 max-w-2xl mx-auto text-lg">
                Hela payloadfamiljen samlad på ett ställe — från kamera och termisk avbildning till lyft, leverans och specialpayloads.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PAYLOAD_CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors h-full"
                >
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                    <cat.icon className="h-5 w-5 text-orange-400" />
                  </div>
                  <h2 className="text-lg font-bold mb-3">{cat.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    {cat.examples.map((example) => (
                      <span
                        key={example}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-16">
              <p className="text-white/50 mb-6">
                Osäker på vilken payload som passar ditt uppdrag? Vi hjälper dig välja rätt sensor och konfiguration.
              </p>
              <Link to="/kommersiella-dronare/kontakt">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
                  Begär offert <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <EnterpriseFooter />
      </div>
    </>
  );
}
