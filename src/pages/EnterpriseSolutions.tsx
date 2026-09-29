import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Package,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import { INDUSTRY_DATA } from "@/data/commercialDroneIndustries";
import { ENTERPRISE_PACKAGES, PACKAGE_LEVELS } from "@/data/enterprisePackages";
import { ENTERPRISE_DRONE_PRODUCTS } from "@/data/enterpriseDroneProducts";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

const BENEFITS = [
  {
    icon: Wrench,
    title: "Konfiguration efter verksamheten",
    description:
      "Vi sätter ihop drönare, payload och tillbehör efter vad ni faktiskt ska göra — inte efter ett fast artikelnummer.",
  },
  {
    icon: ShieldCheck,
    title: "Funktionstest före leverans",
    description: "Varje enhet kontrolleras och konfigureras innan den skickas, så den är flygklar direkt.",
  },
  {
    icon: GraduationCap,
    title: "Genomgång och utbildning",
    description: "Genomgång på plats eller digitalt vid uppstart, så teamet kommer igång utan onödiga stopp.",
  },
  {
    icon: Package,
    title: "En leverantör, en offert",
    description: "Drönare, sensorer, batterier, mjukvara och tillbehör i en och samma leverans och affär.",
  },
];

const STEPS = [
  {
    step: "01",
    icon: Building2,
    title: "Berätta om verksamheten",
    description: "Vilken bransch, vilka uppdrag och vilken data ni behöver samla in.",
  },
  {
    step: "02",
    icon: Package,
    title: "Vi föreslår en konfiguration",
    description: "Plattform, payload, tillbehör och tjänstenivå — utgångspunkt i våra enterprise-paket.",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Leverans och uppstart",
    description: "Flygklar utrustning, genomgång och support när ni är igång.",
  },
];

export default function EnterpriseSolutions() {
  return (
    <>
      <SeoHead
        title="Enterprise-lösningar för företag | EU Drone Company"
        description="Skräddarsydda drönarlösningar för företag — branschanpassade konfigurationer, DJI Enterprise-sortiment och färdiga paket för inspektion, lantbruk, kartläggning, säkerhet, energi och film."
        canonical={droneUrl("/kommersiella-dronare/enterprise-losningar")}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Enterprise-lösningar", url: droneUrl("/kommersiella-dronare/enterprise-losningar") },
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
              <span className="text-white/70">Enterprise-lösningar</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Building2 className="h-3.5 w-3.5" />
                Enterprise-lösningar för företag
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Drönarlösningar byggda för er verksamhet</h1>
              <p className="text-white/50 max-w-2xl mx-auto text-lg">
                Från enstaka plattform till drift i skala — vi kombinerar DJI Enterprise-sortimentet med rätt
                payload, mjukvara och tjänster för er bransch, och sätter ihop en konfiguration innan offert.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-16">
              <div className="p-5 rounded-xl bg-[#111] border border-white/10 text-center">
                <p className="text-2xl md:text-3xl font-bold text-orange-400">{INDUSTRY_DATA.length}</p>
                <p className="text-xs md:text-sm text-white/50 mt-1">Branscher</p>
              </div>
              <div className="p-5 rounded-xl bg-[#111] border border-white/10 text-center">
                <p className="text-2xl md:text-3xl font-bold text-orange-400">{ENTERPRISE_PACKAGES.length}</p>
                <p className="text-xs md:text-sm text-white/50 mt-1">Enterprise-paket</p>
              </div>
              <div className="p-5 rounded-xl bg-[#111] border border-white/10 text-center">
                <p className="text-2xl md:text-3xl font-bold text-orange-400">{ENTERPRISE_DRONE_PRODUCTS.length}</p>
                <p className="text-xs md:text-sm text-white/50 mt-1">DJI-plattformar</p>
              </div>
            </div>

            {/* Branschlösningar */}
            <section className="mb-16">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold">Branschlösningar</h2>
                <p className="text-sm text-white/40 mt-1">
                  Varje bransch har egna krav på payload, precision och arbetsflöde.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {INDUSTRY_DATA.map((industry, i) => (
                  <motion.div
                    key={industry.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link to={`/kommersiella-dronare/${industry.slug}`} className="block h-full">
                      <div className="rounded-2xl bg-[#111] border border-white/10 p-6 h-full flex flex-col group hover:border-orange-500/30 transition-colors">
                        <industry.icon className="h-8 w-8 text-orange-500 mb-4" />
                        <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">
                          {industry.title}
                        </h3>
                        <p className="text-sm text-white/50 mb-4 leading-relaxed">{industry.shortDesc}</p>
                        <span className="inline-flex items-center gap-1 text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                          Utforska lösningar <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Så går det till */}
            <section className="mb-16">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold">Så sätter vi ihop en lösning</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {STEPS.map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="p-6 rounded-2xl bg-[#111] border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold text-orange-400">{item.step}</span>
                      <item.icon className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Vad ingår / Benefits */}
            <section className="mb-16">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold">Vad ni får</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {BENEFITS.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4 p-5 rounded-xl bg-[#111] border border-white/10">
                    <benefit.icon className="h-6 w-6 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Paket & sortiment cross-links */}
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="p-8 rounded-2xl bg-[#111] border border-white/10">
                <Package className="h-6 w-6 text-orange-500 mb-4" />
                <h2 className="text-xl font-bold mb-3">Enterprise-paket</h2>
                <p className="text-white/50 mb-6">
                  {ENTERPRISE_PACKAGES.length} färdiga paket i tre nivåer — {PACKAGE_LEVELS.standard.label},{" "}
                  {PACKAGE_LEVELS.pro.label} och {PACKAGE_LEVELS.enterprise.label} — som utgångspunkt för offert.
                </p>
                <Link to="/kommersiella-dronare/paket">
                  <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/5">
                    Se alla paket <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="p-8 rounded-2xl bg-[#111] border border-white/10">
                <Cpu className="h-6 w-6 text-orange-500 mb-4" />
                <h2 className="text-xl font-bold mb-3">DJI Enterprise-sortiment</h2>
                <p className="text-white/50 mb-6">
                  Hela DJI Enterprise-sortimentet — Matrice, Mavic Enterprise, Agras och Inspire — plus payloads och
                  tillbehör som passar varje drönare.
                </p>
                <Link to="/kommersiella-dronare/dji-enterprise">
                  <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/5">
                    Se sortimentet <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-16 md:py-20">
          <div className="flex items-center justify-center gap-2 text-white/50 mb-4">
            <CheckCircle2 className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Vi justerar innehållet efter er verksamhet innan offert</span>
          </div>
          <Link to="/kommersiella-dronare/kontakt">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
              Begär offert <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        <EnterpriseFooter />
      </div>
    </>
  );
}
