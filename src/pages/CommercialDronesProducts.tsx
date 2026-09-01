import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import { Cpu, Radio, ArrowRight } from "lucide-react";
import { getDroneMedia } from "@/data/commercialDroneIndustries";
import { siteUrl } from "@/lib/site";

const PRODUCTS = [
  {
    name: "DJI Matrice 350 RTK",
    tag: "Industriell flaggskepp",
    desc: "Kraftfull inspektion och kartläggning med upp till 55 min flygtid och IP45-skydd.",
    features: ["55 min flygtid", "IP45 väderskydd", "RTK-precision", "Multi-sensor"],
  },
  {
    name: "DJI Mavic 3 Enterprise",
    tag: "Kompakt & mångsidig",
    desc: "Mekanisk slutare, termisk kamera och RTK — i ett smidigt format.",
    features: ["45 min flygtid", "Termisk kamera", "RTK-modul", "4/3 CMOS sensor"],
  },
  {
    name: "DJI Agras T50",
    tag: "Lantbruk & Sprutning",
    desc: "Automatiserad precisionsspruta med 40 liter tank och centimeterprecision.",
    features: ["40L spruttank", "Terrängföljning", "AI-sprutning", "50 kg nyttolast"],
  },
];

export default function CommercialDronesProducts() {
  return (
    <>
      <SeoHead
        title="Produkter — EU Drone Company Enterprise | Kommersiella drönare"
        description="Utforska DJI Enterprise-sortimentet hos EU Drone Company. Matrice 350 RTK, Mavic 3 Enterprise, Agras T50 och fler professionella drönarlösningar."
        canonical={siteUrl("/kommersiella-dronare/produkter")}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav />

        <div className="pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-10">
              <Link to="/kommersiella-dronare" className="hover:text-white transition-colors">Kommersiella drönare</Link>
              <span>/</span>
              <span className="text-white/70">Produkter</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Våra produkter</h1>
              <p className="text-white/50 max-w-2xl mx-auto text-lg">
                Vi erbjuder hela DJI Enterprise-sortimentet. Här är några av våra mest populära lösningar.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {PRODUCTS.map((product, i) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden group hover:border-orange-500/30 transition-colors"
                >
                  {(() => {
                    const media = getDroneMedia(product.name);
                    return media ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={media.image}
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
                    );
                  })()}
                  <div className="p-6">
                    <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">{product.tag}</div>
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-sm text-white/50 mb-4 leading-relaxed">{product.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((f) => (
                        <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 p-8 rounded-2xl bg-[#111] border border-white/10 text-center">
              <h2 className="text-2xl font-bold mb-3">Enterprise-kameror & sensorer</h2>
              <p className="text-white/50 mb-6 max-w-xl mx-auto">
                Zenmuse H30T, H20T, L2 LiDAR, P1 fotogrammetri och fler payloads för DJI Matrice.
              </p>
              <Link to="/kommersiella-dronare/kameror">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5">
                  Se alla kameror <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="text-center mt-12">
              <Link to="/kommersiella-dronare/kontakt">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
                  Begär offert <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
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
