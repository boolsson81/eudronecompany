/**
 * GA4 med serverside-reserv.
 *
 * Primärt mäts sidvisningarna med gtag.js. Blockerare stoppar det för en stor
 * del av besökarna, så när taggen inte går att ladda skickas samma händelse i
 * stället till `/api/collect` på egen domän, som relärar den vidare till GA4:s
 * Measurement Protocol. En händelse går alltid exakt en väg — aldrig båda — så
 * trafiken kan inte dubbelräknas.
 *
 * Ingenting skickas innan besökaren har samtyckt; se `consent.ts`.
 */

import { onConsentChange, readConsent } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** Sätts av riktiga gtag.js. Saknas den har skriptet inte kört. */
    google_tag_manager?: Record<string, unknown>;
  }
}

const MEASUREMENT_ID = "G-G5KGZ4RKSD";
const TAG_URL = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
const RELAY_ENDPOINT = "/api/collect";

/** Vissa blockerare svarar med tom 200 i stället för fel — då kommer aldrig
 *  någon load-händelse att avslöja något. Efter den här tiden ger vi upp. */
const TAG_TIMEOUT_MS = 2500;

const CLIENT_ID_COOKIE = "_edc_cid";
const CLIENT_ID_MAX_AGE = 60 * 60 * 24 * 365 * 2;
const SESSION_STORAGE_KEY = "edc:ga-session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

type TagState = "idle" | "loading" | "ready" | "blocked";
type QueuedEvent = { name: string; params: Record<string, unknown> };

let tagState: TagState = "idle";
const queue: QueuedEvent[] = [];

/** Startar mätningen. Anropas en gång när appen monteras. */
export function initAnalytics(): void {
  if (readConsent() === "granted") loadTag();

  onConsentChange((choice) => {
    if (choice === "granted") loadTag();
    else queue.length = 0;
  });
}

/** Skickar en sidvisning för aktuell rutt. */
export function trackPageView(path: string): void {
  send("page_view", {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
    page_referrer: document.referrer || undefined,
  });
}

/** Skickar en valfri GA4-händelse. */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  send(name, params);
}

function send(name: string, params: Record<string, unknown>): void {
  if (readConsent() !== "granted") return;

  if (tagState === "idle") loadTag();

  if (tagState === "loading") {
    queue.push({ name, params });
    return;
  }
  dispatch({ name, params });
}

function dispatch(event: QueuedEvent): void {
  if (tagState === "ready") window.gtag?.("event", event.name, event.params);
  else relay(event);
}

function loadTag(): void {
  if (tagState !== "idle") return;
  tagState = "loading";

  const script = document.createElement("script");
  script.async = true;
  script.src = TAG_URL;

  const settle = () => {
    if (tagState !== "loading") return;
    tagState = window.google_tag_manager ? "ready" : "blocked";
    const pending = queue.splice(0, queue.length);
    for (const event of pending) dispatch(event);
  };

  script.addEventListener("load", settle);
  script.addEventListener("error", settle);
  window.setTimeout(settle, TAG_TIMEOUT_MS);

  document.head.appendChild(script);
}

/** Skickar händelsen till vår egen domän, som relärar den till GA4. */
function relay(event: QueuedEvent): void {
  const body = JSON.stringify({
    client_id: clientId(),
    session_id: sessionId(),
    events: [{ name: event.name, params: event.params }],
  });

  void fetch(RELAY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Mätning får aldrig störa sidan.
  });
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Samma besökar-id som gtag.js skulle ha använt. `_ga` har formen
 * `GA1.1.<slump>.<tidsstämpel>`, och de två sista delarna är client_id. Finns
 * inte kakan (taggen har aldrig fått köra) sätter vi en egen med samma form,
 * så att besökaren hänger ihop mellan blockerade och oblockerade besök.
 */
function clientId(): string {
  const fromGa = readCookie("_ga")?.split(".").slice(-2).join(".");
  if (fromGa && /^\d+\.\d+$/.test(fromGa)) return fromGa;

  const existing = readCookie(CLIENT_ID_COOKIE);
  if (existing && /^\d+\.\d+$/.test(existing)) return existing;

  const generated = `${Math.floor(Math.random() * 1_000_000_000)}.${Math.floor(Date.now() / 1000)}`;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CLIENT_ID_COOKIE}=${generated}; path=/; max-age=${CLIENT_ID_MAX_AGE}; SameSite=Lax${secure}`;
  return generated;
}

/**
 * GA4 räknar sessioner på `session_id`. Taggens egen `_ga_<id>`-kaka har den i
 * tredje fältet (`GS1.1.<session_id>.…`); saknas den håller vi en egen session
 * som rullar vidare 30 minuter efter senaste sidvisningen.
 */
function sessionId(): string {
  const parts = readCookie(`_ga_${MEASUREMENT_ID.replace("G-", "")}`)?.split(".");
  const fromGa = parts?.[2];
  if (fromGa && /^\d+$/.test(fromGa)) return fromGa;

  const now = Date.now();
  const fresh = String(Math.floor(now / 1000));
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as { id?: string; touched?: number }) : null;
    const stillActive = saved?.id && typeof saved.touched === "number" && now - saved.touched < SESSION_TIMEOUT_MS;
    const id = stillActive ? saved!.id! : fresh;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id, touched: now }));
    return id;
  } catch {
    return fresh;
  }
}
