import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type DroneAccessory,
  ACCESSORY_CATEGORIES,
  getAccessoriesForDrones,
} from "@/data/droneAccessories";
import { getCameraSlugForAccessory } from "@/data/enterpriseCameraProducts";

interface DroneAccessoriesProps {
  /** Names of drones to show accessories for (must match keys in DRONE_ACCESSORIES) */
  droneNames: string[];
  /** Section heading */
  heading?: string;
}

export default function DroneAccessories({
  droneNames,
  heading = "Tillbehör & Konfigurationer",
}: DroneAccessoriesProps) {
  const accessories = getAccessoriesForDrones(droneNames);
  const [activeCategory, setActiveCategory] = useState<DroneAccessory["category"] | "all">("all");

  if (accessories.length === 0) return null;

  // Get unique categories that actually have accessories
  const availableCategories = Array.from(
    new Set(accessories.map((a) => a.category))
  );

  const filtered =
    activeCategory === "all"
      ? accessories
      : accessories.filter((a) => a.category === activeCategory);

  return (
    <section className="py-16 md:py-24 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{heading}</h2>
        <p className="text-white/50 mb-8 max-w-2xl">
          Komplettera din drönarlösning med rätt payloads, batterier och tillbehör. Alla produkter finns att beställa via ActionKing.
        </p>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === "all"
                ? "bg-orange-500 border-orange-500 text-white"
                : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
            }`}
          >
            Alla ({accessories.length})
          </button>
          {availableCategories.map((cat) => {
            const info = ACCESSORY_CATEGORIES[cat];
            const count = accessories.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
                }`}
              >
                {info.emoji} {info.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Accessories grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((acc, i) => {
            const catInfo = ACCESSORY_CATEGORIES[acc.category];
            const cameraSlug = acc.category === "payload" ? getCameraSlugForAccessory(acc.name) : undefined;
            return (
              <motion.div
                key={acc.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 hover:border-orange-500/20 hover:bg-white/[0.04] transition-all"
              >
                {acc.imageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden bg-[#1a1a1a]">
                    <img
                      src={acc.imageUrl}
                      alt={acc.name}
                      className="w-full h-36 object-contain p-4 mix-blend-lighten brightness-90 contrast-110"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{catInfo.emoji}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
                      {catInfo.label}
                    </span>
                  </div>
                  {acc.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold shrink-0">
                      {acc.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  {cameraSlug ? (
                    <Link
                      to={`/kommersiella-dronare/kameror/${cameraSlug}`}
                      className="hover:text-orange-400 transition-colors"
                    >
                      {acc.name}
                    </Link>
                  ) : (
                    acc.name
                  )}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed mb-3">{acc.desc}</p>
                <div className="flex flex-wrap gap-3">
                  {cameraSlug && (
                    <Link
                      to={`/kommersiella-dronare/kameror/${cameraSlug}`}
                      className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Läs mer
                    </Link>
                  )}
                  {acc.shopUrl && (
                    <a
                      href={acc.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Se på ActionKing.se <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a href="https://actionking.se" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50"
            >
              Se hela sortimentet på ActionKing.se <ExternalLink className="h-4 w-4 ml-1.5" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
