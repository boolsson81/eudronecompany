import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import zenmuseH30TImg from "@/assets/dji-zenmuse-h30t.png";
import zenmuseH30Img from "@/assets/dji-zenmuse-h30.png";
import {
  type DroneCamera,
  type DroneCameraCategory,
  CAMERA_CATEGORIES,
  COMPARISON_PRESETS,
  COMPARISON_SPEC_LABELS,
  DRONE_CAMERAS,
  getCamerasByIds,
  getSpecValue,
} from "@/data/droneCameras";

const MAX_SELECTED = 4;

const CAMERA_IMAGES: Record<string, string> = {
  "zenmuse-h30t": zenmuseH30TImg,
  "zenmuse-h30": zenmuseH30Img,
};

interface DroneCameraComparisonProps {
  /** Initial preset to load */
  defaultPresetId?: string;
  /** Hide preset selector (e.g. when embedded with fixed cameras) */
  showPresets?: boolean;
  /** Compact mode for embedding */
  compact?: boolean;
}

export default function DroneCameraComparison({
  defaultPresetId = "inspection",
  showPresets = true,
  compact = false,
}: DroneCameraComparisonProps) {
  const defaultPreset = COMPARISON_PRESETS.find((p) => p.id === defaultPresetId) ?? COMPARISON_PRESETS[0];
  const [activePresetId, setActivePresetId] = useState(defaultPreset.id);
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultPreset.cameraIds.slice(0, MAX_SELECTED));
  const [categoryFilter, setCategoryFilter] = useState<DroneCameraCategory | "all">("all");

  const presetCameras = useMemo(() => {
    const preset = COMPARISON_PRESETS.find((p) => p.id === activePresetId);
    return preset ? getCamerasByIds(preset.cameraIds) : DRONE_CAMERAS;
  }, [activePresetId]);

  const selectableCameras = useMemo(() => {
    if (categoryFilter === "all") return presetCameras;
    return presetCameras.filter((c) => c.category === categoryFilter);
  }, [presetCameras, categoryFilter]);

  const selectedCameras = useMemo(
    () => getCamerasByIds(selectedIds).slice(0, MAX_SELECTED),
    [selectedIds],
  );

  const handlePresetChange = (presetId: string) => {
    const preset = COMPARISON_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(presetId);
    setSelectedIds(preset.cameraIds.slice(0, MAX_SELECTED));
    setCategoryFilter("all");
  };

  const toggleCamera = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((x) => x !== id) : prev;
      }
      if (prev.length >= MAX_SELECTED) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const isDifferentRow = (label: string, cameras: DroneCamera[]): boolean => {
    const values = cameras.map((c) => getSpecValue(c, label));
    return new Set(values).size > 1;
  };

  return (
    <div className={compact ? "space-y-6" : "space-y-10"}>
      {showPresets && (
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">Välj jämförelse</h3>
          <div className="flex flex-wrap gap-2">
            {COMPARISON_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetChange(preset.id)}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors text-left ${
                  activePresetId === preset.id
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
                }`}
              >
                <span className="font-medium">{preset.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">
            {COMPARISON_PRESETS.find((p) => p.id === activePresetId)?.description}
          </p>
        </div>
      )}

      {/* Camera selector */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-medium text-white/70">
            Välj kameror att jämföra ({selectedIds.length}/{MAX_SELECTED})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                categoryFilter === "all"
                  ? "bg-white/10 border-white/20 text-white"
                  : "border-white/10 text-white/50 hover:text-white/70"
              }`}
            >
              Alla
            </button>
            {Array.from(new Set(presetCameras.map((c) => c.category))).map((cat) => {
              const info = CAMERA_CATEGORIES[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                    categoryFilter === cat
                      ? "bg-white/10 border-white/20 text-white"
                      : "border-white/10 text-white/50 hover:text-white/70"
                  }`}
                >
                  {info.emoji} {info.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {selectableCameras.map((camera) => {
            const isSelected = selectedIds.includes(camera.id);
            return (
              <button
                key={camera.id}
                type="button"
                onClick={() => toggleCamera(camera.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-orange-500/50 bg-orange-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div
                  className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-orange-500 border-orange-500" : "border-white/30"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{camera.name}</span>
                    {camera.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        {camera.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{camera.shortDesc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison table */}
      {selectedCameras.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 overflow-hidden bg-[#111]"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="p-4 text-left text-xs font-medium text-white/50 w-36 sticky left-0 bg-[#161616] z-10">
                    Specifikation
                  </th>
                  {selectedCameras.map((camera) => (
                    <th key={camera.id} className="p-4 text-left align-top min-w-[180px]">
                      <div className="space-y-2">
                        {CAMERA_IMAGES[camera.id] && (
                          <div className="h-20 rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                            <img
                              src={CAMERA_IMAGES[camera.id]}
                              alt={camera.name}
                              className="w-full h-full object-contain p-2 mix-blend-lighten"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="font-semibold text-white">{camera.name}</div>
                        {camera.shopUrl && (
                          <a
                            href={camera.shopUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Se produkt <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_SPEC_LABELS.map((label) => {
                  const highlight = isDifferentRow(label, selectedCameras);
                  return (
                    <tr
                      key={label}
                      className={`border-b border-white/5 last:border-0 ${
                        highlight ? "bg-orange-500/[0.03]" : ""
                      }`}
                    >
                      <td className="p-3 font-medium text-white/50 sticky left-0 bg-[#161616] z-10 text-xs">
                        {label}
                      </td>
                      {selectedCameras.map((camera) => {
                        const value = getSpecValue(camera, label);
                        const isDash = value === "—";
                        return (
                          <td
                            key={camera.id}
                            className={`p-3 text-white/80 align-top ${
                              highlight && !isDash ? "text-white" : ""
                            } ${isDash ? "text-white/25" : ""}`}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {selectedCameras.length < 2 && (
        <p className="text-sm text-white/40 text-center">
          Välj minst två kameror för att se jämförelsen.
        </p>
      )}

      {!compact && selectedCameras.some((c) => c.shopUrl) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {selectedCameras
            .filter((c) => c.shopUrl)
            .map((camera) => (
              <Button
                key={camera.id}
                asChild
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5"
              >
                <a href={camera.shopUrl} target="_blank" rel="noopener noreferrer">
                  {camera.name} <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </a>
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}
