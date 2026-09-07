import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Cpu, Package, Radio, Sparkles, Star, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import FaqSection, { faqJsonLd } from "@/components/FaqSection";
import EnterpriseNav from "@/components/EnterpriseNav";
import {
  getPackageBySlug,
  getPackageServices,
  getPackagesForIndustry,
  getRelatedPackages,
  PACKAGE_LEVELS,
} from "@/data/enterprisePackages";
import { getDroneProductBySlug } from "@/data/enterpriseDroneProducts";
import { getCameraBySlug } from "@/data/enterpriseCameraProducts";
import { getIndustryBySlug } from "@/data/commercialDroneIndustries";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

const LEVEL_BADGE: Record<string, string> = {
  standard: "bg-white/10 text-white/70 border-white/20",
  pro: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  enterprise: "bg-orange-500/20 text-orange-300 border-orange-400/30",
};

export default function EnterprisePackage() {
  const { packageSlug } = useParams<{ packageSlug: string }>();
  const pkg = packageSlug ? getPackageBySlug(packageSlug) : undefined;
  const faqJsonLdData = useMemo(() => (pkg ? faqJsonLd(pkg.faq) : null), [pkg]);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sidan hittades inte</h1>
          <Link to="/kommersiella-dronare/paket" className="text-orange-500 hover:underline">
            ← Tillbaka till paket
          </Link>
        </div>
      </div>
    );
  }

  const level = PACKAGE_LEVELS[pkg.level];
  const drones = pkg.droneSlugs
    .map((slug) => getDroneProductBySlug(slug))
    .filter((drone): drone is NonNullable<typeof drone> => !!drone);
  const payloads = pkg.payloadSlugs
    .map((slug) => getCameraBySlug(slug))
    .filter((camera): camera is NonNullable<typeof camera> => !!camera);
  const industry = getIndustryBySlug(pkg.industrySlug);
  const levelSiblings = getPackagesForIndustry(pkg.industrySlug);
  const related = getRelatedPackages(pkg.slug);
  const services = getPackageServices(pkg);
  const heroImage = drones.find((d) => d.imageUrl)?.imageUrl;

  return (
    <>
      <SeoHead
        title={pkg.seoTitle}
        description={pkg.seoDesc}
        canonical={droneUrl(`/kommersiella-dronare/paket/${pkg.slug}`)}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Paket", url: droneUrl("/kommersiella-dronare/paket") },
          { name: pkg.name, url: droneUrl(`/kommersiella-dronare/paket/${pkg.slug}`) },
        ]}
        jsonLd={faqJsonLdData || undefined}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav />

        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-6">
              <Link to="/kommersiella-dronare" className="hover:text-white transition-colors">
                Kommersiella drönare
              </Link>
              <span>/</span>
              <Link to="/kommersiella-dronare/paket" className="hover:text-white transition-colors">
                Paket
              </Link>
              <span>/</span>
              <span className="text-white/70">{pkg.name}</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span
                    className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${LEVEL_BADGE[pkg.level]}`}
                  >
                    {level.label}
                  </span>
                  {pkg.level === "pro" && (
                    <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 flex items-center gap-1">
                      <Star className="h-3 w-3" /> Populärast
                    </span>
                  )}
                  <span className="text-xs text-white/40">{pkg.drone}</span>
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                  {pkg.name}
                </h1>
                <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed mb-8">{pkg.heroDesc}</p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/kommersiella-dronare/kontakt">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                      Begär offert <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to={`/kommersiella-dronare/konfiguration/${pkg.industrySlug}`}>
                    <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/5">
                      Se konfiguration & tillbehör
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden"
              >
                {heroImage ? (
                  <div className="aspect-video">
                    <img src={heroImage} alt={pkg.drone} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-orange-500/10 to-transparent">
                    <Package className="h-24 w-24 text-orange-500/30" />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Overview & outcomes */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Om paketet</h2>
                <p className="text-white/60 leading-relaxed text-lg mb-6">{pkg.longDesc}</p>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="text-xs text-white/40 mb-1">Passar för</p>
                  <p className="text-white/70">{pkg.idealFor}</p>
                </div>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Vad du får ut av det</h2>
                <ul className="space-y-3">
                  {pkg.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-white/70">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <Package className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Detta ingår</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {pkg.components.map((component, i) => (
                <motion.div
                  key={component}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#111] border border-white/10"
                >
                  <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/70">{component}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-4">
              <Wrench className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Tjänster som ingår</h2>
            </div>
            <p className="text-white/50 mb-10 max-w-2xl">
              Hårdvaran är halva leveransen. Det här ingår utan extra kostnad när du köper paketet av oss.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service} className="flex items-start gap-3 p-4 rounded-xl bg-[#111] border border-white/10">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/70">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hardware in the package */}
        {(drones.length > 0 || payloads.length > 0) && (
          <section className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-10">Utrustningen i paketet</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drones.map((drone) => (
                  <Link key={drone.slug} to={`/kommersiella-dronare/produkter/${drone.slug}`}>
                    <div className="rounded-2xl bg-[#111] border border-white/10 hover:border-orange-500/30 transition-colors group h-full overflow-hidden">
                      {drone.imageUrl ? (
                        <img
                          src={drone.imageUrl}
                          alt={drone.name}
                          loading="lazy"
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="h-40 bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center">
                          <Cpu className="h-12 w-12 text-orange-500/30" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">
                          Drönare
                        </div>
                        <h3 className="font-bold group-hover:text-orange-400 transition-colors">{drone.name}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
                {payloads.map((camera) => (
                  <Link key={camera.slug} to={`/kommersiella-dronare/kameror/${camera.slug}`}>
                    <div className="rounded-2xl bg-[#111] border border-white/10 hover:border-orange-500/30 transition-colors group h-full overflow-hidden">
                      {camera.imageUrl ? (
                        <div className="h-40 bg-white/5 flex items-center justify-center p-6">
                          <img
                            src={camera.imageUrl}
                            alt={camera.name}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-40 bg-gradient-to-br from-orange-500/10 to-transparent" />
                      )}
                      <div className="p-5">
                        <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">
                          Payload
                        </div>
                        <h3 className="font-bold group-hover:text-orange-400 transition-colors">{camera.name}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Level comparison */}
        {levelSiblings.length > 1 && (
          <section className="py-16 md:py-24 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Jämför nivåerna</h2>
              <p className="text-white/50 mb-10 max-w-2xl">
                Samma bransch, tre ambitionsnivåer. Välj den som matchar hur ofta ni flyger och vad leveransen ska hålla för.
              </p>
              <div className="rounded-2xl border border-white/10 overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="bg-white/[0.04]">
                      <th className="px-6 py-4 text-left font-medium text-white/60 w-1/4">Paket</th>
                      <th className="px-6 py-4 text-left font-medium text-white/60">Drönare</th>
                      <th className="px-6 py-4 text-left font-medium text-white/60">Antal delar</th>
                      <th className="px-6 py-4 text-left font-medium text-white/60">Passar för</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelSiblings.map((sibling, i) => (
                      <tr
                        key={sibling.slug}
                        className={`${i % 2 === 0 ? "bg-white/[0.02]" : ""} ${sibling.slug === pkg.slug ? "ring-1 ring-inset ring-orange-500/30" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/kommersiella-dronare/paket/${sibling.slug}`}
                            className="font-medium text-white hover:text-orange-400 transition-colors"
                          >
                            {sibling.name}
                          </Link>
                          <div className="text-xs text-white/40 mt-1">{PACKAGE_LEVELS[sibling.level].label}</div>
                        </td>
                        <td className="px-6 py-4 text-white/60">{sibling.drone}</td>
                        <td className="px-6 py-4 text-white/60">{sibling.components.length}</td>
                        <td className="px-6 py-4 text-white/60">{sibling.idealFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <FaqSection items={pkg.faq} />

        {/* Related */}
        {related.length > 0 && (
          <section className="py-16 md:py-24 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-10">Andra paket</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link key={rel.slug} to={`/kommersiella-dronare/paket/${rel.slug}`}>
                    <div className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-orange-500/30 transition-colors group h-full">
                      <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">
                        {PACKAGE_LEVELS[rel.level].label}
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">{rel.name}</h3>
                      <p className="text-sm text-white/50 line-clamp-2">{rel.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Vill du ha {pkg.name} offererat?</h2>
            <p className="text-white/50 mb-8">
              Vi justerar innehållet efter er verksamhet — ni betalar inte för utrustning ni redan har.
            </p>
            <Link to="/kommersiella-dronare/kontakt">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
                Begär offert <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            {industry && (
              <p className="mt-6 text-sm text-white/40">
                Osäker på nivån?{" "}
                <Link to={`/kommersiella-dronare/${industry.slug}`} className="text-orange-400 hover:underline">
                  Läs om drönarlösningar för {industry.title.toLowerCase()}
                </Link>
              </p>
            )}
            <div className="mt-6">
              <Link
                to="/kommersiella-dronare/paket"
                className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Alla paket
              </Link>
            </div>
          </div>
        </section>

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
