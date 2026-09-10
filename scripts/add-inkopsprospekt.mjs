#!/usr/bin/env node
/**
 * Lägger till ett inköpsprospect i data/inkopsprospekt.json.
 *
 * Prospektet valideras innan det skrivs, så en post som saknar leverantör eller
 * har en prisuppgift utan valuta stoppas här i stället för att upptäckas när
 * någon räknar på marginalen. Schemat ligger i lib/inkopsprospekt.mjs och
 * beskrivs i docs/INKOPSPROSPEKT.md.
 *
 * Usage:
 *   npm run prospekt:add -- --leverantor "Drone Volt" --produkt "Hercules 20"
 *   npm run prospekt:add -- --leverantor X --produkt Y --pris 46850 --valuta EUR \
 *     --basis listpris --moms exkl --kategori tvattsystem --land FR \
 *     --url https://... --epost sales@... --tagg tak --tagg fasad
 *   npm run prospekt:add -- --json '{"leverantor":"X","produkt":"Y"}'
 *   npm run prospekt:add -- --fil prospekt.json      # en post eller en lista
 *   npm run prospekt:add -- --leverantor X --produkt Y --torrkorning
 */
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  KALLOR,
  MOMSSTATUS,
  PRISBASER,
  STATUSAR,
  lasRegister,
  laggTill,
  skrivRegister,
  tomtRegister,
} from "./lib/inkopsprospekt.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTER = join(ROOT, "data", "inkopsprospekt.json");

/** Flaggor som tar ett värde, och var värdet hamnar i prospektet. */
const FALT = {
  "--id": "id",
  "--status": "status",
  "--kalla": "kalla",
  "--tillagd": "tillagd",
  "--av": "tillagd_av",
  "--leverantor": "leverantor",
  "--produkt": "produkt",
  "--kategori": "kategori",
  "--land": "land",
  "--url": "url",
  "--kontakt": "kontakt.namn",
  "--epost": "kontakt.epost",
  "--telefon": "kontakt.telefon",
  "--webb": "kontakt.webb",
  "--pris": "pris.belopp",
  "--valuta": "pris.valuta",
  "--basis": "pris.basis",
  "--moms": "pris.moms",
  "--per": "pris.per",
  "--moq": "moq",
  "--ledtid": "ledtid_dagar",
  "--anteckning": "anteckning",
};

const TAL = new Set(["pris.belopp", "moq", "ledtid_dagar"]);

function satt(mal, sokvag, varde) {
  const delar = sokvag.split(".");
  let nod = mal;
  while (delar.length > 1) {
    const nyckel = delar.shift();
    nod[nyckel] ??= {};
    nod = nod[nyckel];
  }
  nod[delar[0]] = TAL.has(sokvag) ? Number(varde) : varde;
}

function hjalp() {
  console.log(`Lägger till ett inköpsprospect i data/inkopsprospekt.json.

Obligatoriskt:
  --leverantor <namn>     Leverantör eller tillverkare
  --produkt <namn>        Modell eller sortiment

Valfritt:
  --id <slug>             Sätts annars från leverantör och produkt
  --status <status>       ${STATUSAR.join(" | ")} (standard: ny)
  --kalla <kalla>         ${KALLOR.join(" | ")} (standard: egen)
  --kategori <text>       Till exempel tvattsystem, batterier
  --land <XX>             Landskod, till exempel FR
  --url <adress>          Produkt- eller källsida
  --kontakt <namn>        Kontaktperson
  --epost / --telefon / --webb
  --pris <tal> --valuta <XXX>
  --basis <basis>         ${PRISBASER.join(" | ")} (standard: okant)
  --moms <status>         ${MOMSSTATUS.join(" | ")} (standard: okant)
  --per <enhet>           Standard: styck
  --moq <antal>           Minsta orderkvantitet
  --ledtid <dagar>        Ledtid i dagar
  --tagg <tagg>           Kan upprepas
  --anteckning <text>
  --av <namn>             Vem som lade till prospektet
  --tillagd <ÅÅÅÅ-MM-DD>  Standard: idag

Andra former:
  --json '<objekt>'       Ett helt prospekt som JSON
  --fil <sökväg>          JSON-fil med ett prospekt eller en lista
  --torrkorning           Visa vad som skulle skrivas, skriv inget`);
}

function tolkaArgv(argv) {
  const input = { taggar: [] };
  let torrkorning = false;
  let json = null;
  let fil = null;

  for (let i = 0; i < argv.length; i += 1) {
    const flagga = argv[i];
    if (flagga === "--hjalp" || flagga === "--help" || flagga === "-h") return { hjalp: true };
    if (flagga === "--torrkorning" || flagga === "--dry-run") {
      torrkorning = true;
      continue;
    }
    const varde = argv[i + 1];
    if (varde === undefined || varde.startsWith("--")) {
      throw new Error(`${flagga} saknar värde`);
    }
    i += 1;
    if (flagga === "--tagg") input.taggar.push(varde);
    else if (flagga === "--json") json = varde;
    else if (flagga === "--fil") fil = varde;
    else if (FALT[flagga]) satt(input, FALT[flagga], varde);
    else throw new Error(`Okänd flagga: ${flagga}`);
  }

  return { input, torrkorning, json, fil };
}

function poster({ input, json, fil }) {
  if (json && fil) throw new Error("Ange antingen --json eller --fil, inte båda");
  if (json) return [JSON.parse(json)];
  if (fil) {
    const innehall = JSON.parse(readFileSync(fil, "utf8"));
    const lista = Array.isArray(innehall) ? innehall : (innehall.prospekt ?? [innehall]);
    if (lista.length === 0) throw new Error(`${fil} innehåller inga prospekt`);
    return lista;
  }
  if (!input.leverantor || !input.produkt) {
    throw new Error("--leverantor och --produkt krävs. Kör med --hjalp för alla flaggor.");
  }
  return [input];
}

function sammanfatta(prospekt) {
  const pris = prospekt.pris
    ? `${prospekt.pris.belopp} ${prospekt.pris.valuta} (${prospekt.pris.basis}, moms ${prospekt.pris.moms})`
    : "pris saknas";
  return `${prospekt.id}\n  ${prospekt.leverantor} — ${prospekt.produkt}\n  ${pris}\n  status ${prospekt.status}, källa ${prospekt.kalla}`;
}

function main() {
  const tolkat = tolkaArgv(process.argv.slice(2));
  if (tolkat.hjalp) {
    hjalp();
    return;
  }

  const register = existsSync(REGISTER) ? lasRegister(REGISTER) : tomtRegister();
  const tillagda = poster(tolkat).map((post) => laggTill(register, post));

  if (tolkat.torrkorning) {
    console.log("Torrkörning — inget skrevs.\n");
    for (const prospekt of tillagda) console.log(sammanfatta(prospekt));
    return;
  }

  skrivRegister(REGISTER, register);
  for (const prospekt of tillagda) console.log(sammanfatta(prospekt));
  console.log(
    `\nSkrev ${tillagda.length} prospekt till data/inkopsprospekt.json (${register.prospekt.length} totalt).`,
  );
}

try {
  main();
} catch (fel) {
  console.error(fel.message);
  process.exit(1);
}
