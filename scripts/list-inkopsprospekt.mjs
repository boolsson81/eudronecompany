#!/usr/bin/env node
/**
 * Listar inköpsprospect ur data/inkopsprospekt.json, och kan skriva samma lista
 * som rapport under docs/reports/ så att den går att läsa i en PR.
 *
 * Usage:
 *   npm run prospekt:list
 *   npm run prospekt:list -- --status offert --kategori tvattsystem
 *   npm run prospekt:list -- --tagg tak --kalla egen
 *   npm run prospekt:list -- --rapport      # skriver docs/reports/INKOPSPROSPEKT.md
 */
import { existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { STATUSAR, lasRegister } from "./lib/inkopsprospekt.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTER = join(ROOT, "data", "inkopsprospekt.json");
const RAPPORT = join(ROOT, "docs", "reports", "INKOPSPROSPEKT.md");

function tolkaArgv(argv) {
  const filter = {};
  let rapport = false;
  for (let i = 0; i < argv.length; i += 1) {
    const flagga = argv[i];
    if (flagga === "--rapport") {
      rapport = true;
      continue;
    }
    const varde = argv[i + 1];
    if (varde === undefined || varde.startsWith("--")) throw new Error(`${flagga} saknar värde`);
    i += 1;
    if (["--status", "--kategori", "--kalla", "--leverantor", "--tagg"].includes(flagga)) {
      filter[flagga.slice(2)] = varde;
    } else {
      throw new Error(`Okänd flagga: ${flagga}`);
    }
  }
  return { filter, rapport };
}

function matchar(prospekt, filter) {
  if (filter.status && prospekt.status !== filter.status) return false;
  if (filter.kalla && prospekt.kalla !== filter.kalla) return false;
  if (filter.kategori && prospekt.kategori !== filter.kategori) return false;
  if (filter.tagg && !prospekt.taggar.includes(filter.tagg)) return false;
  if (
    filter.leverantor &&
    !prospekt.leverantor.toLowerCase().includes(filter.leverantor.toLowerCase())
  ) {
    return false;
  }
  return true;
}

function prisText(pris) {
  if (!pris) return "—";
  const moms = pris.moms === "okant" ? "moms okänd" : `moms ${pris.moms}`;
  return `${pris.belopp.toLocaleString("sv-SE")} ${pris.valuta} / ${pris.per} (${pris.basis}, ${moms})`;
}

/** Statusordningen är inköpsflödet — sorteringen ska följa den, inte alfabetet. */
function sortera(a, b) {
  const diff = STATUSAR.indexOf(a.status) - STATUSAR.indexOf(b.status);
  return diff !== 0 ? diff : a.id.localeCompare(b.id, "sv");
}

function skrivTerminal(prospekt, register) {
  if (prospekt.length === 0) {
    console.log("Inga prospekt matchar.");
    return;
  }
  for (const p of prospekt) {
    console.log(`${p.status.padEnd(11)} ${p.leverantor} — ${p.produkt}`);
    console.log(`${" ".repeat(12)}${prisText(p.pris)}`);
    const rad = [
      p.kategori && `kategori ${p.kategori}`,
      p.land && `land ${p.land}`,
      p.ledtid_dagar && `ledtid ${p.ledtid_dagar} d`,
      p.moq && `moq ${p.moq}`,
      p.taggar.length > 0 && p.taggar.join(", "),
    ].filter(Boolean);
    if (rad.length > 0) console.log(`${" ".repeat(12)}${rad.join(" · ")}`);
    console.log(`${" ".repeat(12)}${p.id}`);
    console.log();
  }
  console.log(`${prospekt.length} av ${register.prospekt.length} prospekt.`);
}

function markdownrad(p) {
  const kontakt = [p.kontakt.namn, p.kontakt.epost, p.kontakt.telefon].filter(Boolean).join(", ");
  const kalla = p.url ? `[källa](${p.url})` : "—";
  return `| ${p.status} | ${p.leverantor} | ${p.produkt} | ${p.kategori ?? "—"} | ${prisText(p.pris)} | ${kontakt || "—"} | ${kalla} |`;
}

function skrivRapport(prospekt, register) {
  const rader = [
    "# Inköpsprospect",
    "",
    `Genererad ur \`data/inkopsprospekt.json\` (uppdaterad ${register.uppdaterad}) med`,
    "`npm run prospekt:list -- --rapport`. Redigera registret, inte den här filen.",
    "",
    "Priserna är vad källan angav — se kolumnen för prisbasis. Listpris är inte vårt",
    "inköpspris, och momsstatus saknas ofta i källan.",
    "",
    "| Status | Leverantör | Produkt | Kategori | Pris | Kontakt | Länk |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...prospekt.map(markdownrad),
    "",
  ];

  const medAnteckning = prospekt.filter((p) => p.anteckning);
  if (medAnteckning.length > 0) {
    rader.push("## Anteckningar", "");
    for (const p of medAnteckning) {
      rader.push(`- **${p.leverantor} — ${p.produkt}:** ${p.anteckning}`);
    }
    rader.push("");
  }

  writeFileSync(RAPPORT, rader.join("\n"));
  console.log(`Skrev docs/reports/INKOPSPROSPEKT.md med ${prospekt.length} prospekt.`);
}

function main() {
  const { filter, rapport } = tolkaArgv(process.argv.slice(2));
  if (!existsSync(REGISTER)) {
    throw new Error("data/inkopsprospekt.json saknas. Lägg till ett prospekt med npm run prospekt:add.");
  }

  const register = lasRegister(REGISTER);
  const valda = register.prospekt.filter((p) => matchar(p, filter)).sort(sortera);

  if (rapport) skrivRapport(valda, register);
  else skrivTerminal(valda, register);
}

try {
  main();
} catch (fel) {
  console.error(fel.message);
  process.exit(1);
}
