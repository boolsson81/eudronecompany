import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Camera, ExternalLink, Radio } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import FaqSection, { faqJsonLd } from "@/components/FaqSection";
import EnterpriseNav from "@/components/EnterpriseNav";
import { getDroneMedia } from "@/data/commercialDroneIndustries";
import {
  getCameraBySlug,
  getRelatedCameras,
  CAMERA_CATEGORIES,
} from "@/data/enterpriseCameraProducts";
import { siteUrl } from "@/lib/site";

export default function CommercialDroneCamera() {
  const { cameraSlug } = useParams<{ cameraSlug: string }>();
  const camera = cameraSlug ? getCameraBySlug(cameraSlug) : undefined;
  const related = cameraSlug ? getRelatedCameras(cameraSlug) : [];
  const faqJsonLdData = useMemo(() => (camera ? faqJsonLd(camera.faq) : null), [camera]);

  if (!camera) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sidan hittades inte</h1>
          <Link to="/kommersiella-dronare/kameror" className="text-orange-500 hover:underline">
            ← Tillbaka till kameror
          </Link>
        </div>
      </div>
    );
  }

  const categoryLabel = CAMERA_CATEGORIES[camera.category].label;

  return (
    <>
      <SeoHead
        title={camera.seoTitle}
        description={camera.seoDesc}
        canonical={siteUrl(`/kommersiella-dronare/kameror/${camera.slug}`)}
        breadcrumbs={[
          { name: "Hem", url: siteUrl("/") },
          { name: "Kommersiella drönare", url: siteUrl("/kommersiella-dronare") },
          { name: "Kameror & sensorer", url: siteUrl("/kommersiella-dronare/kameror") },
          { name: camera.name, url: siteUrl(`/kommersiella-dronare/kameror/${camera.slug}`) },
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
              <Link to="/kommersiella-dronare/kameror" className="hover:text-white transition-colors">
                Kameror
              </Link>
              <span>/</span>
              <span className="text-white/70">{camera.name}</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                  <Camera className="h-3.5 w-3.5" />
                  {categoryLabel}
                  {camera.badge && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                      {camera.badge}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-6">
                  {camera.heroTitle}
                </h1>
                <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed mb-8">
                  {camera.heroDesc}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/kommersiella-dronare/kontakt">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                      Begär offert <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  {camera.shopUrl && (
                    <a href={camera.shopUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5">
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
                {camera.youtubeId ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${camera.youtubeId}`}
                      title={camera.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : camera.imageUrl ? (
                  <div className="aspect-video flex items-center justify-center p-8 bg-white/5">
                    <img
                      src={camera.imageUrl}
                      alt={camera.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-orange-500/10 to-transparent">
                    <Camera className="h-24 w-24 text-orange-500/30" />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Description & features */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Översikt</h2>
                <p className="text-white/60 leading-relaxed text-lg">{camera.longDesc}</p>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Nyckelfunktioner</h2>
                <ul className="space-y-3">
                  {camera.features.map((f) => (
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
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {camera.specs.map((spec, i) => (
                    <tr key={spec.label} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                      <td className="px-6 py-4 font-medium text-white/80 w-1/3">{spec.label}</td>
                      <td className="px-6 py-4 text-white/60">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="py-16 md:py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Användningsområden</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {camera.applications.map((app, i) => (
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

        {/* Compatible drones */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">Kompatibla drönare</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {camera.compatibleDrones.map((droneName, i) => {
                const media = getDroneMedia(droneName);
                return (
                  <motion.div
                    key={droneName}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden"
                  >
                    {media ? (
                      <img
                        src={media.image}
                        alt={droneName}
                        loading="lazy"
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-orange-500/10 to-transparent" />
                    )}
                    <div className="p-5">
                      <h3 className="font-semibold">{droneName}</h3>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection items={camera.faq} />

        {/* Related cameras */}
        {related.length > 0 && (
          <section className="py-16 md:py-24 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-10">Relaterade kameror</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link key={rel.slug} to={`/kommersiella-dronare/kameror/${rel.slug}`}>
                    <div className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-orange-500/30 transition-colors group h-full">
                      <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-2">
                        {rel.tag}
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">
                        {rel.name}
                      </h3>
                      <p className="text-sm text-white/50 line-clamp-2">{rel.heroDesc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section id="camera-cta" className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Intresserad av {camera.name}?</h2>
            <p className="text-white/50 mb-8">
              Vi hjälper dig med komplett konfiguration — drönare, payload, RTK, mjukvara och utbildning.
            </p>
            <Link to="/kommersiella-dronare/kontakt">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-base px-10">
                Kontakta oss <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <div className="mt-6">
              <Link
                to="/kommersiella-dronare/kameror"
                className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Alla kameror
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
