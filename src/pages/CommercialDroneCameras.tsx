import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import { Camera, ArrowRight, Radio } from "lucide-react";
import {
  ENTERPRISE_CAMERA_PRODUCTS,
  CAMERA_CATEGORIES,
  type CameraCategory,
} from "@/data/enterpriseCameraProducts";

const CATEGORY_ORDER: CameraCategory[] = ["hybrid", "thermal", "lidar", "photogrammetry", "utility"];

export default function CommercialDroneCameras() {
  return (
    <>
      <SeoHead
        title="Enterprise-kameror & sensorer — Zenmuse | EU Drone Company"
        description="Utforska DJI Zenmuse enterprise-kameror och sensorer. H30T, H20T, L2 LiDAR, P1 fotogrammetri och specialpayloads för Matrice-serien."
        canonical="https://actionking.se/kommersiella-dronare/kameror"
        breadcrumbs={[
          { name: "Hem", url: "https://actionking.se/" },
          { name: "Kommersiella drönare", url: "https://actionking.se/kommersiella-dronare" },
          { name: "Kameror & sensorer", url: "https://actionking.se/kommersiella-dronare/kameror" },
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
              <span className="text-white/70">Kameror & sensorer</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Camera className="h-3.5 w-3.5" />
                Zenmuse & enterprise-sensorer
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Enterprise-kameror & sensorer</h1>
              <p className="text-white/50 max-w-2xl mx-auto text-lg">
                Professionella payloads för DJI Matrice — från hybridkameror och termisk avbildning till LiDAR och fotogrammetri.
              </p>
            </motion.div>

            {CATEGORY_ORDER.map((cat, catIdx) => {
              const cameras = ENTERPRISE_CAMERA_PRODUCTS.filter((c) => c.category === cat);
              if (cameras.length === 0) return null;
              const meta = CAMERA_CATEGORIES[cat];

              return (
                <section key={cat} className={catIdx > 0 ? "mt-16 md:mt-20" : ""}>
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{meta.label}</h2>
                    <p className="text-white/50">{meta.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cameras.map((camera, i) => (
                      <Link key={camera.slug} to={`/kommersiella-dronare/kameror/${camera.slug}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden group hover:border-orange-500/30 transition-colors h-full"
                        >
                          {camera.imageUrl ? (
                            <div className="h-48 overflow-hidden bg-white/5">
                              <img
                                src={camera.imageUrl}
                                alt={camera.name}
                                loading="lazy"
                                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ) : (
                            <div className="h-48 bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center">
                              <Camera className="h-16 w-16 text-orange-500/40" />
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold">
                                {camera.tag}
                              </span>
                              {camera.badge && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-medium">
                                  {camera.badge}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">
                              {camera.name}
                            </h3>
                            <p className="text-sm text-white/50 mb-4 leading-relaxed line-clamp-2">
                              {camera.heroDesc}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {camera.features.slice(0, 3).map((f) => (
                                <span
                                  key={f}
                                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Läs mer <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="text-center mt-16">
              <p className="text-white/50 mb-6">
                Osäker på vilken kamera som passar ditt uppdrag? Vi hjälper dig välja rätt payload och konfiguration.
              </p>
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
