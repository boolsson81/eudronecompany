import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { onConsentReset, readConsent, setConsent } from "@/lib/consent";

/**
 * Samtyckesruta för GA4.
 *
 * Visas tills besökaren valt. Inget mäts dessförinnan — varken gtag.js eller
 * serverside-relän startar före ett ja. Valet kan tas tillbaka via
 * "Cookies" i sidfoten.
 */
export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readConsent() === "unknown");
    return onConsentReset(() => setOpen(true));
  }, []);

  if (!open) return null;

  const choose = (choice: "granted" | "denied") => {
    setConsent(choice);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-neutral-950/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-white/70">
          Vi använder cookies för att mäta hur sajten används och kunna göra den bättre.
          Statistiken är anonym och delas inte vidare. Väljer du bara nödvändiga sätts
          inga mätcookies alls.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => choose("denied")}>
            Bara nödvändiga
          </Button>
          <Button size="sm" onClick={() => choose("granted")}>
            Godkänn
          </Button>
        </div>
      </div>
    </div>
  );
}
