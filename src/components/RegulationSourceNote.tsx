import { Info } from "lucide-react";

/**
 * Källhänvisning för regelverkssidorna.
 *
 * Sidorna sammanfattar EU-förordning 2019/947 så som Transportstyrelsen
 * tillämpar den i Sverige. Reglerna ändras — bland annat löper
 * övergångsreglerna för omärkta drönare ut — så sidorna får inte läsas som
 * ett besked om vad som gäller i ett enskilt fall.
 */
export default function RegulationSourceNote() {
  return (
    <section className="pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex gap-3 p-5 rounded-xl bg-white/[0.03] border border-white/10">
          <Info className="h-4 w-4 text-white/40 shrink-0 mt-0.5" />
          <p className="text-xs text-white/50 leading-relaxed">
            Sammanfattning av EU-förordning 2019/947 så som den tillämpas i Sverige. Reglerna
            ändras löpande och bedömningen kan skilja sig åt i det enskilda fallet —{" "}
            <a
              href="https://www.transportstyrelsen.se/sv/luftfart/luftfartyg-och-luftvardighet/obemannade-luftfartyg-dronare/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
            >
              Transportstyrelsen
            </a>{" "}
            är den som avgör vad som gäller. Kontrollera alltid mot deras information innan du
            flyger, och hör av dig till oss om du vill ha hjälp att tolka kraven.
          </p>
        </div>
      </div>
    </section>
  );
}
