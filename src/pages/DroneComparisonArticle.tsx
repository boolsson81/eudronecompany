import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import FaqSection, { faqJsonLd } from "@/components/FaqSection";
import EnterpriseNav from "@/components/EnterpriseNav";
import { getComparisonBySlug, DRONE_COMPARISONS } from "@/data/droneComparisons";
import { getDroneMedia } from "@/data/commercialDroneIndustries";

export default function DroneComparisonArticle() {
  const { comparisonSlug } = useParams<{ comparisonSlug: string }>();
  const article = comparisonSlug ? getComparisonBySlug(comparisonSlug) : undefined;

  const faqJsonLdData = useMemo(() => (article ? faqJsonLd(article.faq) : null), [article]);

  const relatedComparisons = useMemo(
    () => DRONE_COMPARISONS.filter((c) => c.slug !== comparisonSlug).slice(0, 2),
    [comparisonSlug],
  );

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Jämförelsen hittades inte</h1>
          <Link to="/kommersiella-dronare/jamforelser" className="text-orange-500 hover:underline">
            ← Tillbaka till jämförelser
          </Link>
        </div>
      </div>
    );
  }

  const mediaA = getDroneMedia(article.droneA.name);
  const mediaB = getDroneMedia(article.droneB.name);

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    url: `https://actionking.se/kommersiella-dronare/jamforelser/${article.slug}`,
    author: { "@type": "Organization", name: "ActionKing Enterprise" },
    publisher: {
      "@type": "Organization",
      name: "ActionKing Enterprise",
      url: "https://actionking.se",
    },
  };

  return (
    <>
      <SeoHead
        title={`${article.title} | ActionKing`}
        description={article.excerpt}
        canonical={`https://actionking.se/kommersiella-dronare/jamforelser/${article.slug}`}
        breadcrumbs={[
          { name: "Hem", url: "https://actionking.se/" },
          { name: "Kommersiella drönare", url: "https://actionking.se/kommersiella-dronare" },
          { name: "Jämförelser", url: "https://actionking.se/kommersiella-dronare/jamforelser" },
          {
            name: article.title,
            url: `https://actionking.se/kommersiella-dronare/jamforelser/${article.slug}`,
          },
        ]}
        jsonLd={[blogJsonLd, ...(faqJsonLdData ? [faqJsonLdData] : [])]}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav />

        <article className="pt-32 pb-16 md:pt-44 md:pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Link
              to="/kommersiella-dronare/jamforelser"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Alla jämförelser
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-xs font-medium text-orange-400">{article.category}</span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-2 mb-6 leading-tight">
                {article.title}
              </h1>
              <p className="text-lg text-white/60 leading-relaxed mb-10">{article.intro}</p>
            </motion.div>

            {/* Drone headers */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[article.droneA, article.droneB].map((drone, idx) => {
                const media = idx === 0 ? mediaA : mediaB;
                return (
                  <div
                    key={drone.name}
                    className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden"
                  >
                    {media && (
                      <img
                        src={media.image}
                        alt={drone.name}
                        className="w-full h-36 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h2 className="font-semibold text-sm md:text-base">{drone.name}</h2>
                      <p className="text-xs text-white/50 mt-1">{drone.tagline}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spec comparison table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/10">
                      <th className="text-left p-4 font-medium text-white/70 w-1/3">Specifikation</th>
                      <th className="text-left p-4 font-medium text-orange-400/90 w-1/3">
                        {article.droneA.name.replace("DJI ", "")}
                      </th>
                      <th className="text-left p-4 font-medium text-orange-400/90 w-1/3">
                        {article.droneB.name.replace("DJI ", "")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {article.specs.map((spec, i) => (
                      <tr
                        key={spec.label}
                        className={i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"}
                      >
                        <td className="p-4 text-white/60 font-medium">{spec.label}</td>
                        <td className="p-4 text-white/80">{spec.droneA}</td>
                        <td className="p-4 text-white/80">{spec.droneB}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Use case winners */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Vinnare per användningsområde</h2>
              <div className="space-y-4">
                {article.useCaseWinners.map((item) => (
                  <div
                    key={item.useCase}
                    className="p-5 rounded-xl bg-white/[0.03] border border-white/10"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold">{item.useCase}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {item.winner === "tie"
                          ? "Oavgjort"
                          : item.winner === "a"
                            ? article.droneA.name.replace("DJI ", "")
                            : article.droneB.name.replace("DJI ", "")}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Prose sections */}
            {article.sections.map((section) => (
              <section key={section.heading} className="mb-10">
                <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-white/60 leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
              </section>
            ))}

            {/* Verdict */}
            <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20 mb-12">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold mb-2">Vår rekommendation</h2>
                  <p className="text-white/70 leading-relaxed">{article.verdict}</p>
                </div>
              </div>
            </div>

            <FaqSection items={article.faq} />

            {/* CTA */}
            <div className="mt-16 p-8 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <h3 className="text-xl font-semibold mb-3">Behöver du hjälp att välja?</h3>
              <p className="text-white/50 mb-6 max-w-lg mx-auto">
                Våra drönarexperter hjälper dig hitta rätt modell baserat på dina uppdrag och budget.
              </p>
              <Link to="/kommersiella-dronare/kontakt">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                  Begär offert
                </Button>
              </Link>
            </div>
          </div>
        </article>

        {/* Related comparisons */}
        {relatedComparisons.length > 0 && (
          <section className="pb-20 border-t border-white/10 pt-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <h2 className="text-xl font-bold mb-6">Fler jämförelser</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedComparisons.map((related) => (
                  <Link
                    key={related.slug}
                    to={`/kommersiella-dronare/jamforelser/${related.slug}`}
                    className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors group"
                  >
                    <span className="text-xs text-orange-400">{related.category}</span>
                    <h3 className="font-semibold mt-1 group-hover:text-orange-400 transition-colors">
                      {related.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-sm text-orange-400 mt-3">
                      Läs mer <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
