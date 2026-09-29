import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import FaqSection, { faqJsonLd } from "@/components/FaqSection";
import {
  ArrowRight,
  Camera,
  Droplets,
  Lightbulb,
  Radio,
  SprayCan,
  Wrench,
} from "lucide-react";
import {
  ENTERPRISE_CAMERA_PRODUCTS,
  CAMERA_CATEGORIES,
  type CameraCategory,
} from "@/data/enterpriseCameraProducts";
import {
  ENTERPRISE_PAYLOADS,
  PAYLOAD_CATEGORIES,
  getPayloadsByCategory,
  type PayloadCategory,
} from "@/data/enterprisePayloads";

const CANONICAL = droneUrl("/kommersiella-dronare/payloads");

const CAMERA_CATEGORY_ORDER: CameraCategory[] = ["hybrid", "thermal", "lidar", "photogrammetry"];

const ITEM_CATEGORY_ORDER: PayloadCategory[] = ["spraying", "lighting-audio", "positioning"];

const CATEGORY_ICON: Record<PayloadCategory, typeof Droplets> = {
  spraying: SprayCan,
  "lighting-audio": Lightbulb,
  positioning: Radio,
  cleaning: Droplets,
  custom: Wrench,
};

const FAQ = [
  {
    question: "Vilka payload-typer finns för DJI Enterprise-drönare?",
    answer:
      "Fyra huvudgrupper: kameror & optiska sensorer (hybrid, termisk, LiDAR, fotogrammetri), sprutnings- och spridningssystem för lantbruk, belysnings- och ljudpayloads för säkerhet och räddning, samt RTK-moduler för positionering. Utöver det bygger vi tvätt-/spolsystem och andra specialpayloads mot behov.",
  },
  {
    question: "Finns det drönarbaserade tvätt- eller spolsystem?",
    answer:
      "Industriell rengöring från luften — till exempel isolatortvätt på kraftledningar, fasadtvätt och rengöring av solpaneler på höga eller svåråtkomliga ytor — bygger vi som specialtillverkning snarare än en fast produkt i katalogen. Hör av dig så gör vi en behovsanalys och offert.",
  },
  {
    question: "Kan samma drönare bära flera olika payloads?",
    answer:
      "Ja. DJI Matrice-plattformarna är byggda för att växla payload mellan uppdrag — samma drönare kan bära en kamera en dag och en RTK-modul eller belysningspayload nästa. Nyttolastkapacitet varierar per modell, se respektive produktsida.",
  },
  {
    question: "Vad kostar en payload?",
    answer:
      "Priset beror på typ av sensor och konfiguration. Begär offert så återkommer vi med pris för den kombination av drönare och payload som passar ditt uppdrag.",
  },
];

export default function CommercialDronePayloads() {
  return (
    <>
      <SeoHead
        title="Payloads för Enterprise-drönare | EU Drone Company"
        description="Alla payload-typer för DJI Enterprise-drönare: kameror & sensorer, sprutning & spridning, belysning & ljud, RTK-positionering och skräddarsydda tvätt-/spolsystem."
        canonical={CANONICAL}
        breadcrumbs={[...DRONE_BREADCRUMB_ROOT, { name: "Payloads", url: CANONICAL }]}
        jsonLd={faqJsonLd(FAQ)}
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
              <span className="text-white/70">Payloads</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Wrench className="h-3.5 w-3.5" />
                Alla payload-typer på ett ställe
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Payloads för Enterprise-drönare</h1>
              <p className="text-white/50 max-w-2xl mx-auto text-lg">
                Kameror, sensorer, sprutningssystem, belysning, ljud, RTK-positionering och skräddarsydda
                tvätt-/spolsystem — allt som kan monteras på en DJI Matrice- eller Mavic Enterprise-drönare.
              </p>
            </motion.div>

            {/* Kameror & optiska sensorer — sammanfattning, full katalog på /kameror */}
            <section className="mb-16 md:mb-20">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-5 w-5 text-orange-500" />
                    <h2 className="text-2xl md:text-3xl font-bold">Kameror & optiska sensorer</h2>
                  </div>
                  <p className="text-white/50">
                    {ENTERPRISE_CAMERA_PRODUCTS.length} sensorpayloads fördelat på hybrid, termisk, LiDAR och
                    fotogrammetri.
                  </p>
                </div>
                <Link to="/kommersiella-dronare/kameror">
                  <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/5">
                    Se alla kameror & sensorer <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CAMERA_CATEGORY_ORDER.map((cat) => {
                  const meta = CAMERA_CATEGORIES[cat];
                  const count = ENTERPRISE_CAMERA_PRODUCTS.filter((c) => c.category === cat).length;
                  if (count === 0) return null;
                  return (
                    <Link
                      key={cat}
                      to="/kommersiella-dronare/kameror"
                      className="p-5 rounded-2xl bg-[#111] border border-white/10 hover:border-orange-500/30 transition-colors"
                    >
                      <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">
                        {count} {count === 1 ? "payload" : "payloads"}
                      </div>
                      <h3 className="font-bold mb-1">{meta.label}</h3>
                      <p className="text-sm text-white/50">{meta.description}</p>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Övriga payload-typer: sprutning, belysning/ljud, positionering */}
            {ITEM_CATEGORY_ORDER.map((cat, idx) => {
              const items = getPayloadsByCategory(cat);
              if (items.length === 0) return null;
              const meta = PAYLOAD_CATEGORIES[cat];
              const Icon = CATEGORY_ICON[cat];

              return (
                <section key={cat} className="mb-16 md:mb-20">
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-orange-500" />
                      <h2 className="text-2xl md:text-3xl font-bold">{meta.label}</h2>
                    </div>
                    <p className="text-white/50">{meta.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, i) => {
                      const CardContent = (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06 }}
                          className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden group hover:border-orange-500/30 transition-colors h-full flex flex-col"
                        >
                          {item.imageUrl ? (
                            <div className="h-40 overflow-hidden bg-white/5">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                loading="lazy"
                                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ) : (
                            <div className="h-40 bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center">
                              <Icon className="h-12 w-12 text-orange-500/40" />
                            </div>
                          )}
                          <div className="p-6 flex-1 flex flex-col">
                            {item.badge && (
                              <span className="self-start text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-medium mb-2">
                                {item.badge}
                              </span>
                            )}
                            <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                          </div>
                        </motion.div>
                      );

                      return item.internalUrl ? (
                        <Link key={item.name} to={item.internalUrl} className="block h-full">
                          {CardContent}
                        </Link>
                      ) : item.shopUrl ? (
                        <a
                          key={item.name}
                          href={item.shopUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block h-full"
                        >
                          {CardContent}
                        </a>
                      ) : (
                        <div key={item.name} className="h-full">
                          {CardContent}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* Tvätt- & spolsystem + specialtillverkning — inget fast produktblad, drivs mot offert */}
            <section className="mb-16 md:mb-20 grid md:grid-cols-2 gap-6">
              <div className="p-8 rounded-2xl bg-[#111] border border-white/10">
                <Droplets className="h-6 w-6 text-orange-500 mb-4" />
                <h2 className="text-xl font-bold mb-3">{PAYLOAD_CATEGORIES.cleaning.label}</h2>
                <p className="text-white/50 mb-6">
                  Industriell rengöring från luften — isolatortvätt på kraftledningar, fasadtvätt och rengöring av
                  solpaneler på höga eller svåråtkomliga ytor. Vi bygger spol- och sprutpayloaden mot ert behov
                  snarare än att sälja den som ett standardpaket.
                </p>
                <Link to="/kommersiella-dronare/specialtillverkning">
                  <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/5">
                    Diskutera ett tvätt-/spolsystem <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="p-8 rounded-2xl bg-[#111] border border-white/10">
                <Wrench className="h-6 w-6 text-orange-500 mb-4" />
                <h2 className="text-xl font-bold mb-3">{PAYLOAD_CATEGORIES.custom.label}</h2>
                <p className="text-white/50 mb-6">
                  Payload utan färdigt fäste, ett skydd för en specifik miljö eller en helt egen riggidé. Vi
                  konstruerar mot de fästpunkter, vikter och laster som gäller för din drönare.
                </p>
                <Link to="/kommersiella-dronare/specialtillverkning">
                  <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/5">
                    Se specialtillverkning <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </section>

            <div className="text-center mb-16">
              <p className="text-white/50 mb-6">
                {ENTERPRISE_CAMERA_PRODUCTS.length + ENTERPRISE_PAYLOADS.length} payloads i sortimentet — osäker på
                vilken som passar ditt uppdrag? Vi hjälper dig välja rätt kombination av drönare och payload.
              </p>
              <Link to="/kommersiella-dronare/kontakt">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
                  Begär offert <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <FaqSection items={FAQ} heading="Vanliga frågor om payloads" />
          </div>
        </div>
        <EnterpriseFooter />
      </div>
    </>
  );
}
