import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { faqJsonLd, type FaqItem } from "@/lib/faqJsonLd";

export type { FaqItem };
export { faqJsonLd };

interface FaqSectionProps {
  items: FaqItem[];
  /** "dark" for FeaturesOnePager/ModulePage style, "light" for normal pages */
  variant?: "dark" | "light";
  heading?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function FaqSection({ items, variant = "dark", heading = "Vanliga frågor" }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const isDark = variant === "dark";

  return (
    <section className={`py-16 md:py-24 px-4 md:px-6 ${isDark ? "" : "bg-muted/30"}`}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        className="max-w-3xl mx-auto"
      >
        <h2 className={`text-2xl md:text-3xl font-bold text-center mb-10 tracking-tight ${isDark ? "text-white" : "text-foreground"}`}>
          {heading}
        </h2>

        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                  isDark
                    ? `border-white/[0.08] ${isOpen ? "bg-white/[0.04]" : "bg-white/[0.02] hover:bg-white/[0.03]"}`
                    : `border-border ${isOpen ? "bg-background" : "bg-background hover:bg-accent/30"}`
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={`text-sm font-medium leading-relaxed ${isDark ? "text-gray-200" : "text-foreground"}`}>
                    {item.question}
                  </span>
                  <span className={`shrink-0 ${isDark ? "text-gray-500" : "text-muted-foreground"}`}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className={`px-5 pb-4 text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-muted-foreground"}`}>
                      {item.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

