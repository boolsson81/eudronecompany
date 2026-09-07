import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Cpu, ExternalLink, Package, Radio, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import FaqSection, { faqJsonLd } from "@/components/FaqSection";
import EnterpriseNav from "@/components/EnterpriseNav";
import {
  DRONE_PRODUCT_CATEGORIES,
  getDroneProductBySlug,
  getRelatedDroneProducts,
} from "@/data/enterpriseDroneProducts";
import { getCameraBySlug } from "@/data/enterpriseCameraProducts";
import { getPackagesForDrone, PACKAGE_LEVELS } from "@/data/enterprisePackages";
import { getIndustryBySlug } from "@/data/commercialDroneIndustries";
import { getComparisonBySlug } from "@/data/droneComparisons";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

export default function CommercialDroneProduct() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const product = productSlug ? getDroneProductBySlug(productSlug) : undefined;
  const related = productSlug ? getRelatedDroneProducts(productSlug) : [];
  const faqJsonLdData = useMemo(() => (product ? faqJsonLd(product.faq) : null), [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sidan hittades inte</h1>
          <Link to="/kommersiella-dronare/produkter" className="text-orange-500 hover:underline">
            ← Tillbaka till produkter
          </Link>
        </div>
      </div>
    );
  }

  const category = DRONE_PRODUCT_CATEGORIES[product.category];
  const payloads = product.compatiblePayloads
    .map((slug) => getCameraBySlug(slug))
    .filter((camera): camera is NonNullable<typeof camera> => !!camera);
  const packages = getPackagesForDrone(product.slug);
  const industries = product.industries
    .map((slug) => getIndustryBySlug(slug))
    .filter((industry): industry is NonNullable<typeof industry> => !!industry);
  const comparison = product.comparisonSlug ? getComparisonBySlug(product.comparisonSlug) : undefined;

  return (
    <>
      <SeoHead
        title={product.seoTitle}
        description={product.seoDesc}
        canonical={droneUrl(`/kommersiella-dronare/produkter/${product.slug}`)}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Produkter", url: droneUrl("/kommersiella-dronare/produkter") },
          { name: product.name, url: droneUrl(`/kommersiella-dronare/produkter/${product.slug}`) },
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
              <Link to="/kommersiella-dronare/produkter" className="hover:text-white transition-colors">
                Produkter
              </Link>
              <span>/</span>
              <span className="text-white/70">{product.name}</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                  <Cpu className="h-3.5 w-3.5" />
                  {category.label}
                  {product.badge && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">{product.badge}</span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                  {product.heroTitle}
                </h1>
                <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed mb-8">{product.heroDesc}</p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/kommersiella-dronare/kontakt">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                      Begär offert <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  {product.shopUrl && (
                    <a href={product.shopUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/5">
                        Se i webbshop <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden"
              >
                {product.youtubeId ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${product.youtubeId}`}
                      title={product.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : product.imageUrl ? (
                  <div className="aspect-video">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-orange-500/10 to-transparent">
                    <Cpu className="h-24 w-24 text-orange-500/30" />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Overview & features */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Översikt</h2>
                <p className="text-white/60 leading-relaxed text-lg">{product.longDesc}</p>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Nyckelfunktioner</h2>
                <ul className="space-y-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-white/70">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Specs */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Specifikationer</h2>
            <div className="rounded-2xl border border-white/10 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr key={spec.label} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                      <td className="px-6 py-4 font-medium text-white/80 w-1/3">{spec.label}</td>
                      <td className="px-6 py-4 text-white/60">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-white/30 mt-4">
              Specifikationer enligt DJI. Kontakta oss för aktuellt datablad inför beställning.
            </p>
          </div>
        </section>

        {/* Applications */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Användningsområden</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {product.applications.map((app, i) => (
                <motion.div
                  key={app}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#111] border border-white/10"
                >
                  <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/70">{app}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages built on this drone */}
        {packages.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-orange-500" />
                <h2 className="text-2xl md:text-3xl font-bold">Paket med {product.name}</h2>
              </div>
              <p className="text-white/50 mb-10 max-w-2xl">
                Färdiga paket där drönaren ingår tillsammans med payload, ström, transport och mjukvara.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <Link key={pkg.slug} to={`/kommersiella-dronare/paket/${pkg.slug}`}>
                    <div className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-orange-500/30 transition-colors group h-full">
                      <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">
                        {PACKAGE_LEVELS[pkg.level].label}
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">{pkg.name}</h3>
                      <p className="text-sm text-white/50">{pkg.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Compatible payloads */}
        {payloads.length > 0 && (
          <section className="py-16 md:py-24 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-10">Kompatibla payloads</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {payloads.map((camera) => (
                  <Link key={camera.slug} to={`/kommersiella-dronare/kameror/${camera.slug}`}>
                    <div className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-orange-500/30 transition-colors group h-full">
                      <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">
                        {camera.tag}
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">{camera.name}</h3>
                      <p className="text-sm text-white/50 line-clamp-2">{camera.heroDesc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Industries & comparison */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Läs vidare</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {industries.map((industry) => (
                <Link key={industry.slug} to={`/kommersiella-dronare/${industry.slug}`}>
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group flex items-center gap-3">
                    <industry.icon className="h-5 w-5 text-orange-400 shrink-0" />
                    <span className="font-semibold group-hover:text-orange-400 transition-colors">
                      Lösningar för {industry.title.toLowerCase()}
                    </span>
                    <ArrowRight className="h-4 w-4 text-orange-400 ml-auto shrink-0" />
                  </div>
                </Link>
              ))}
              {comparison && (
                <Link to={`/kommersiella-dronare/jamforelser/${comparison.slug}`}>
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group flex items-center gap-3">
                    <Scale className="h-5 w-5 text-orange-400 shrink-0" />
                    <span className="font-semibold group-hover:text-orange-400 transition-colors">{comparison.title}</span>
                    <ArrowRight className="h-4 w-4 text-orange-400 ml-auto shrink-0" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>

        <FaqSection items={product.faq} />

        {/* Related drones */}
        {related.length > 0 && (
          <section className="py-16 md:py-24 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-10">Andra drönare i sortimentet</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link key={rel.slug} to={`/kommersiella-dronare/produkter/${rel.slug}`}>
                    <div className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-orange-500/30 transition-colors group h-full">
                      <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">{rel.tag}</div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">{rel.name}</h3>
                      <p className="text-sm text-white/50 line-clamp-2">{rel.heroDesc}</p>
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Intresserad av {product.name}?</h2>
            <p className="text-white/50 mb-8">
              Vi sätter ihop en komplett konfiguration — drönare, payload, batterier, mjukvara och utbildning.
            </p>
            <Link to="/kommersiella-dronare/kontakt">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
                Kontakta oss <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <div className="mt-6">
              <Link
                to="/kommersiella-dronare/produkter"
                className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Alla produkter
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
