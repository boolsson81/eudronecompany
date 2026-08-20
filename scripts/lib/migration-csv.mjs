/**
 * CSV helpers for migration executors.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";

export function loadCsv(path) {
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, "utf8").trim().split("\n");
  if (!lines.length) return [];
  const cols = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseCsvLine(line);
    return Object.fromEntries(cols.map((c, i) => [c, vals[i] ?? ""]));
  });
}

function parseCsvLine(line) {
  const vals = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') {
      q = !q;
      continue;
    }
    if (ch === "," && !q) {
      vals.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  vals.push(cur);
  return vals;
}

export function writeCsvSync(path, cols, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.map(esc).join(",");
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(","));
  writeFileSync(path, [header, ...body].join("\n") + "\n", "utf8");
}
