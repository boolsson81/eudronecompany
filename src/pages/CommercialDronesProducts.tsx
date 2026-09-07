import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Cpu, Package, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import {
  DRONE_PRODUCT_CATEGORIES,
  ENTERPRISE_DRONE_PRODUCTS,
  getDroneProductsByCategory,
  type DroneProductCategory,
} from "@/data/enterpriseDroneProducts";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

const CATEGORY_ORDER: DroneProductCategory[] = ["platform", "compact", "agriculture", "cinema"];

export default function CommercialDronesProducts() {
  return (
    <>
      <SeoHead
        title="Enterprise-drönare — hela DJI-sortimentet | EU Drone Company"
        description="Utforska DJI Enterprise-sortimentet hos EU Drone Company. Matrice 400, Matrice 350 RTK, Mavic 3 Enterprise, Agras T50, Inspire 3 och fler."
        canonical={droneUrl("/kommersiella-dronare/produkter")}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Produkter", url: droneUrl("/kommersiella-dronare/produkter") },
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
              <span className="text-white/70">Produkter</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Enterprise-drönare</h1>
              <p className="text-white/50 max-w-2xl mx-auto text-lg">
                Vi levererar hela DJI Enterprise-sortimentet — {ENTERPRISE_DRONE_PRODUCTS.length} plattformar från
                kompakt inspektion till tung LiDAR och cinema. Varje drönare har en egen sida med specar,
                användningsområden och kompatibla payloads.
              </p>
            </motion.div>

            {CATEGORY_ORDER.map((category) => {
              const products = getDroneProductsByCategory(category);
              if (products.length === 0) return null;
              const meta = DRONE_PRODUCT_CATEGORIES[category];

              return (
                <section key={category} className="mb-16">
                  <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-bold">{meta.label}</h2>
                    <p className="text-sm text-white/40 mt-1">{meta.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, i) => (
                      <motion.div
                        key={product.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <Link to={`/kommersiella-dronare/produkter/${product.slug}`} className="block h-full">
                          <div className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden group hover:border-orange-500/30 transition-colors h-full flex flex-col">
                            {product.imageUrl ? (
                              <div className="h-48 overflow-hidden">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  loading="lazy"
                                  width={800}
                                  height={600}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            ) : (
                              <div className="h-48 bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center">
                                <Cpu className="h-16 w-16 text-orange-500/40" />
                              </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold">
                                  {product.tag}
                                </span>
                                {product.badge && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-sm text-white/50 mb-4 leading-relaxed">{product.heroDesc}</p>
                              <div className="flex flex-wrap gap-2 mt-auto">
                                {product.features.slice(0, 3).map((f) => (
                                  <span
                                    key={f}
                                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="p-8 rounded-2xl bg-[#111] border border-white/10">
                <Package className="h-6 w-6 text-orange-500 mb-4" />
                <h2 className="text-xl font-bold mb-3">Färdiga paket</h2>
                <p className="text-white/50 mb-6">
                  Drönare, payload, batterier, transport och mjukvara som en enhet — per bransch och ambitionsnivå.
                </p>
                <Link to="/kommersiella-dronare/paket">
                  <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/5">
                    Se alla paket <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="p-8 rounded-2xl bg-[#111] border border-white/10">
                <Cpu className="h-6 w-6 text-orange-500 mb-4" />
                <h2 className="text-xl font-bold mb-3">Kameror & sensorer</h2>
                <p className="text-white/50 mb-6">
                  Zenmuse H30T, H20T, L2 LiDAR, P1 fotogrammetri och fler payloads för DJI Matrice.
                </p>
                <Link to="/kommersiella-dronare/kameror">
                  <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/5">
                    Se alla kameror <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-center mt-16">
              <Link to="/kommersiella-dronare/kontakt">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
                  Begär offert <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <footer className="border-t border-white/10 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">EU Drone Company Enterprise</span>
            </div>
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} EU Drone Company. Auktoriserad DJI Enterprise-partner.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
