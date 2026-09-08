import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Package, Radio, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import {
  ENTERPRISE_PACKAGES,
  getPackagesForIndustry,
  PACKAGE_LEVELS,
  type PackageLevel,
} from "@/data/enterprisePackages";
import { INDUSTRY_CONFIGS } from "@/data/droneConfigurations";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

const LEVEL_BADGE: Record<PackageLevel, string> = {
  standard: "bg-white/10 text-white/70 border-white/20",
  pro: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  enterprise: "bg-orange-500/20 text-orange-300 border-orange-400/30",
};

const LEVEL_ORDER: PackageLevel[] = ["standard", "pro", "enterprise"];

export default function EnterprisePackages() {
  return (
    <>
      <SeoHead
        title="Enterprise-paket — färdiga drönarlösningar | EU Drone Company"
        description="Färdiga drönarpaket för inspektion, lantbruk, kartläggning, säkerhet, energi och film. Drönare, payload, mjukvara och utbildning i en leverans."
        canonical={droneUrl("/kommersiella-dronare/paket")}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Paket", url: droneUrl("/kommersiella-dronare/paket") },
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
              <span className="text-white/70">Paket</span>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Package className="h-3.5 w-3.5" />
                {ENTERPRISE_PACKAGES.length} paket i sex branscher
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Enterprise-paket</h1>
              <p className="text-white/50 max-w-2xl mx-auto text-lg">
                Ett paket är allt som krävs för att komma i luften och leverera: drönare, payload, batterier,
                transport, mjukvara och utbildning. Vi justerar innehållet efter er verksamhet innan offert.
              </p>
            </motion.div>

            {/* Levels */}
            <div className="grid md:grid-cols-3 gap-4 mb-16">
              {LEVEL_ORDER.map((level) => (
                <div key={level} className="p-5 rounded-xl bg-[#111] border border-white/10">
                  <span
                    className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${LEVEL_BADGE[level]}`}
                  >
                    {PACKAGE_LEVELS[level].label}
                  </span>
                  <p className="text-sm text-white/50 mt-3 leading-relaxed">{PACKAGE_LEVELS[level].description}</p>
                </div>
              ))}
            </div>

            {INDUSTRY_CONFIGS.map((config) => {
              const packages = getPackagesForIndustry(config.slug);
              if (packages.length === 0) return null;

              return (
                <section key={config.slug} className="mb-16">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <config.icon className="h-6 w-6 text-orange-500" />
                      <h2 className="text-xl md:text-2xl font-bold">{config.title}</h2>
                    </div>
                    <Link
                      to={`/kommersiella-dronare/konfiguration/${config.slug}`}
                      className="text-sm text-white/50 hover:text-orange-400 transition-colors"
                    >
                      Konfiguration & tillbehör →
                    </Link>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {packages.map((pkg, i) => (
                      <motion.div
                        key={pkg.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="h-full"
                      >
                        <Link to={`/kommersiella-dronare/paket/${pkg.slug}`} className="block h-full">
                          <div
                            className={`rounded-2xl bg-[#111] border overflow-hidden h-full flex flex-col group transition-colors ${
                              pkg.level === "pro"
                                ? "border-orange-500/30 ring-1 ring-orange-500/10 hover:border-orange-500/50"
                                : "border-white/10 hover:border-orange-500/30"
                            }`}
                          >
                            <div className="p-6 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span
                                  className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${LEVEL_BADGE[pkg.level]}`}
                                >
                                  {PACKAGE_LEVELS[pkg.level].label}
                                </span>
                                {pkg.level === "pro" && (
                                  <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 flex items-center gap-1">
                                    <Star className="h-3 w-3" /> Populärast
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl font-bold mb-1 group-hover:text-orange-400 transition-colors">
                                {pkg.name}
                              </h3>
                              <p className="text-xs text-orange-400 mb-3">{pkg.drone}</p>
                              <p className="text-sm text-white/50 mb-5 leading-relaxed">{pkg.description}</p>

                              <div className="space-y-2">
                                {pkg.components.slice(0, 4).map((component) => (
                                  <div key={component} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                    <span className="text-sm text-white/70">{component}</span>
                                  </div>
                                ))}
                                {pkg.components.length > 4 && (
                                  <p className="text-xs text-white/40 pl-6">
                                    + {pkg.components.length - 4} delar till
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="p-6 pt-0">
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-400">
                                Läs mer om paketet <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="p-8 rounded-2xl bg-[#111] border border-white/10 text-center">
              <h2 className="text-2xl font-bold mb-3">Hittar du inte rätt paket?</h2>
              <p className="text-white/50 mb-6 max-w-xl mx-auto">
                Paketen är utgångspunkter, inte artikelnummer. Berätta vad ni ska göra så sätter vi ihop en
                konfiguration som passar — och räknar bort det ni redan har.
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
