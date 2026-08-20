import { HANDLE_OVERRIDES, SLUG_TOKEN_MAP } from "./config.ts";

/**
 * Convert a Swedish Shopify handle to its English equivalent.
 * 1. Explicit override (full handle)
 * 2. Token-by-token translation
 * 3. Unchanged if already English / no tokens match
 */
export function toEnglishHandle(swedishHandle: string): string {
  const raw = String(swedishHandle || "").trim().toLowerCase();
  if (!raw) return raw;

  if (HANDLE_OVERRIDES[raw]) return HANDLE_OVERRIDES[raw];

  const segments = raw.split("-");
  const translated = segments.map((seg) => SLUG_TOKEN_MAP[seg] ?? seg);
  const joined = translated.join("-");

  // Collapse duplicate segments (e.g. drone-accessories-accessories → drone-accessories)
  const deduped = joined.replace(/-+/g, "-").replace(/(-\w+)(-\1)+/g, "$1");

  return deduped;
}

/** Returns mapping only when handle actually changes */
export function buildHandleMapping(handles: string[]): Array<{ from: string; to: string }> {
  const seen = new Set<string>();
  const out: Array<{ from: string; to: string }> = [];

  for (const h of handles) {
    const from = h.trim().toLowerCase();
    if (!from) continue;
    const to = toEnglishHandle(from);
    if (from === to) continue;
    if (seen.has(from)) continue;
    // Detect collisions: two source handles mapping to same target
    seen.add(from);
    out.push({ from, to });
  }

  return out;
}

/** Detect target handle collisions before applying renames */
export function detectHandleCollisions(
  mappings: Array<{ from: string; to: string }>,
  existingHandles: Set<string>,
): Array<{ from: string; to: string; reason: string }> {
  const sourcesBeingRenamed = new Set(mappings.map((m) => m.from));
  const targetCounts = new Map<string, string[]>();
  for (const m of mappings) {
    const list = targetCounts.get(m.to) || [];
    list.push(m.from);
    targetCounts.set(m.to, list);
  }

  const collisions: Array<{ from: string; to: string; reason: string }> = [];
  for (const [to, sources] of targetCounts) {
    if (sources.length > 1) {
      for (const from of sources) {
        collisions.push({ from, to, reason: `multiple sources map to "${to}": ${sources.join(", ")}` });
      }
      continue;
    }
    const from = sources[0];
    // Target is free if it equals the source, or the occupying handle is also being renamed away
    const occupiedByOther = existingHandles.has(to) && from !== to && !sourcesBeingRenamed.has(to);
    if (occupiedByOther) {
      collisions.push({ from, to, reason: `target "${to}" already exists as a different resource` });
    }
  }
  return collisions;
}
