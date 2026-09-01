import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar, Scale } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import { DRONE_COMPARISONS } from "@/data/droneComparisons";
import { getDroneMedia } from "@/data/commercialDroneIndustries";
import { BRAND_ORIGIN, siteUrl } from "@/lib/site";

export default function DroneComparisons() {
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Drönarjämförelser — EU Drone Company Enterprise",
      url: siteUrl("/kommersiella-dronare/jamforelser"),
      description:
        "Jämförelser mellan professionella DJI-drönare — specifikationer, användningsområden och köpråd för företag.",
      publisher: {
        "@type": "Organization",
        name: "EU Drone Company Enterprise",
        url: BRAND_ORIGIN,
      },
      blogPost: DRONE_COMPARISONS.map((article) => ({
        "@type": "BlogPosting",
        headline: article.title,
        description: article.excerpt,
        datePublished: article.date,
        url: siteUrl(`/kommersiella-dronare/jamforelser/${article.slug}`),
      })),
    }),
    [],
  );

  return (
    <>
      <SeoHead
        title="Drönarjämförelser — Vilken DJI passar dig? | EU Drone Company"
        description="Jämför professionella DJI-drönare sida vid sida. Specifikationer, användningsområden och köpråd för inspektion, lantbruk och filmproduktion."
        canonical={siteUrl("/kommersiella-dronare/jamforelser")}
        breadcrumbs={[
          { name: "Hem", url: siteUrl("/") },
          { name: "Kommersiella drönare", url: siteUrl("/kommersiella-dronare") },
          { name: "Jämförelser", url: siteUrl("/kommersiella-dronare/jamforelser") },
        ]}
        jsonLd={jsonLd}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav />

        <section className="pt-32 pb-16 md:pt-44 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-6">
                <Scale className="h-3.5 w-3.5" />
                Jämförelser
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                Jämför professionella drönare
              </h1>
              <p className="text-lg text-white/60 leading-relaxed">
                Osäker på vilken DJI-modell som passar ditt företag? Våra jämförelseguider går igenom
                specifikationer, användningsområden och totalkostnad — så att du kan fatta rätt beslut.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DRONE_COMPARISONS.map((article, i) => {
                const mediaA = getDroneMedia(article.droneA.name);
                const mediaB = getDroneMedia(article.droneB.name);
                return (
                  <motion.article
                    key={article.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      to={`/kommersiella-dronare/jamforelser/${article.slug}`}
                      className="block h-full rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group overflow-hidden"
                    >
                      <div className="grid grid-cols-2 h-36">
                        {mediaA ? (
                          <img
                            src={mediaA.image}
                            alt={article.droneA.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="bg-white/5" />
                        )}
                        {mediaB ? (
                          <img
                            src={mediaB.image}
                            alt={article.droneB.name}
                            loading="lazy"
                            className="w-full h-full object-cover border-l border-white/10"
                          />
                        ) : (
                          <div className="bg-white/5 border-l border-white/10" />
                        )}
                      </div>

                      <div className="p-6">
                        <span className="text-xs font-medium text-orange-400">{article.category}</span>
                        <h2 className="text-lg font-semibold mt-2 mb-2 group-hover:text-orange-400 transition-colors leading-snug">
                          {article.title}
                        </h2>
                        <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {article.readTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.date).toLocaleDateString("sv-SE", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm text-orange-400 mt-4 group-hover:gap-2 transition-all">
                          Läs jämförelsen <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
