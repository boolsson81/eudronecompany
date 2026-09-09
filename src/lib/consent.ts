/**
 * Cookie-samtycke för GA4.
 *
 * Valet lagras i localStorage och styr både gtag.js i webbläsaren och den
 * serverside-relä som `analytics.ts` faller tillbaka på. Ingenting mäts innan
 * besökaren har valt — taggen laddas först vid samtycke.
 *
 * Nyckeln läses också av det inlinade skriptet i `index.html`, så att ett
 * tidigare ja kan återställas innan taggen hinner köra. Ändras den här måste
 * den ändras där också; `scripts/__tests__/analytics-consent.test.ts` vaktar det.
 */

export const CONSENT_STORAGE_KEY = "edc:cookie-consent";

export type ConsentChoice = "granted" | "denied";
export type ConsentState = ConsentChoice | "unknown";

type Listener = (state: ConsentChoice) => void;

const listeners = new Set<Listener>();

/** Besökarens sparade val, eller "unknown" om rutan inte besvarats än. */
export function readConsent(): ConsentState {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : "unknown";
  } catch {
    // Privat läge eller blockerad lagring — behandla som obesvarat.
    return "unknown";
  }
}

/** Sparar valet, uppdaterar Consent Mode och väcker lyssnarna. */
export function setConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Går valet inte att spara får besökaren frågan igen nästa gång.
  }

  window.gtag?.("consent", "update", { analytics_storage: choice });
  if (choice === "denied") clearAnalyticsCookies();

  for (const listener of listeners) listener(choice);
}

/** Nollställer valet så att rutan visas igen (används av "Cookies" i sidfoten). */
export function reopenConsent(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // Ingen lagring att rensa.
  }
  for (const listener of consentResetListeners) listener();
}

const consentResetListeners = new Set<() => void>();

export function onConsentReset(listener: () => void): () => void {
  consentResetListeners.add(listener);
  return () => {
    consentResetListeners.delete(listener);
  };
}

export function onConsentChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Tar bort GA-kakorna när besökaren tackar nej efter att ha sagt ja. */
function clearAnalyticsCookies(): void {
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name) && (name.startsWith("_ga") || name === "_edc_cid"));

  for (const name of names) {
    document.cookie = `${name}=; path=/; max-age=0`;
    document.cookie = `${name}=; path=/; domain=.${window.location.hostname}; max-age=0`;
  }
}
