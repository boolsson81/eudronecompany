/**
 * Meta Pixel med serverside-reserv.
 *
 * Speglar analytics.ts: pixeln mäts primärt med fbevents.js. Blockerare
 * stoppar det för en stor del av besökarna, så när skriptet inte går att
 * ladda skickas samma händelse i stället till `/api/collect-meta`, som
 * reläar den vidare till Metas Conversions API. En händelse går alltid
 * exakt en väg — aldrig båda — så trafiken kan inte dubbelräknas.
 *
 * Ingenting skickas innan besökaren har samtyckt; se `consent.ts`. Utan
 * `VITE_META_PIXEL_ID` gör modulen ingenting alls.
 */

import { onConsentChange, readConsent } from "@/lib/consent";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean };
  }
}

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const TAG_URL = "https://connect.facebook.net/en_US/fbevents.js";
const RELAY_ENDPOINT = "/api/collect-meta";

/** Vissa blockerare svarar med tom 200 i stället för fel — då kommer aldrig
 *  någon load-händelse att avslöja något. Efter den här tiden ger vi upp. */
const TAG_TIMEOUT_MS = 2500;

const FBP_COOKIE = "_fbp";
const FBP_MAX_AGE = 60 * 60 * 24 * 90;

type TagState = "idle" | "loading" | "ready" | "blocked";
type QueuedEvent = { name: string; params: Record<string, unknown>; eventId: string };

let tagState: TagState = "idle";
const queue: QueuedEvent[] = [];

/** Startar mätningen. Anropas en gång när appen monteras. */
export function initMetaPixel(): void {
  if (!PIXEL_ID) return;
  if (readConsent() === "granted") loadTag();

  onConsentChange((choice) => {
    if (choice === "granted") loadTag();
    else queue.length = 0;
  });
}

/** Skickar en sidvisning för aktuell rutt. */
export function trackMetaPageView(): void {
  send("PageView", {});
}

/** Skickar ViewContent för en produkt-, kamera- eller paketsida. */
export function trackMetaViewContent(params: {
  contentId: string;
  contentName: string;
  contentCategory?: string;
}): void {
  send("ViewContent", {
    content_ids: [params.contentId],
    content_name: params.contentName,
    content_category: params.contentCategory,
    content_type: "product",
  });
}

function send(name: string, params: Record<string, unknown>): void {
  if (!PIXEL_ID) return;
  if (readConsent() !== "granted") return;

  const eventId = generateEventId();
  if (tagState === "idle") loadTag();

  if (tagState === "loading") {
    queue.push({ name, params, eventId });
    return;
  }
  dispatch({ name, params, eventId });
}

function dispatch(event: QueuedEvent): void {
  if (tagState === "ready") {
    window.fbq?.("track", event.name, event.params, { eventID: event.eventId });
  } else {
    relay(event);
  }
}

function loadTag(): void {
  if (tagState !== "idle" || !PIXEL_ID) return;
  tagState = "loading";

  if (!window.fbq) {
    const stub = ((...args: unknown[]) => {
      (stub.queue = stub.queue || []).push(args);
    }) as Window["fbq"];
    stub!.queue = [];
    window.fbq = stub;
  }
  window.fbq("init", PIXEL_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = TAG_URL;

  const settle = () => {
    if (tagState !== "loading") return;
    tagState = window.fbq?.loaded ? "ready" : "blocked";
    const pending = queue.splice(0, queue.length);
    for (const event of pending) dispatch(event);
  };

  script.addEventListener("load", settle);
  script.addEventListener("error", settle);
  window.setTimeout(settle, TAG_TIMEOUT_MS);

  document.head.appendChild(script);
}

/** Skickar händelsen till vår egen domän, som reläar den till Meta CAPI. */
function relay(event: QueuedEvent): void {
  const fbc = fbcFromUrl() ?? readCookie("_fbc") ?? undefined;
  const body = JSON.stringify({
    event_name: event.name,
    event_id: event.eventId,
    event_source_url: window.location.href,
    fbp: fbp(),
    fbc,
    custom_data: event.params,
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
 * Samma besökar-id som fbevents.js skulle ha satt i `_fbp`. Finns inte kakan
 * (pixeln har aldrig fått köra) sätter vi en egen med samma form, så att
 * besökaren hänger ihop mellan blockerade och oblockerade besök.
 */
function fbp(): string {
  const existing = readCookie(FBP_COOKIE);
  if (existing) return existing;

  const generated = `fb.1.${Date.now()}.${Math.floor(Math.random() * 1_000_000_000_000)}`;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${FBP_COOKIE}=${generated}; path=/; max-age=${FBP_MAX_AGE}; SameSite=Lax${secure}`;
  return generated;
}

/** `fbc` byggs bara från en färsk annonsklick-id — hittas ingen, hittar vi ingen. */
function fbcFromUrl(): string | null {
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (!fbclid) return null;
  return `fb.1.${Date.now()}.${fbclid}`;
}

function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}.${Math.random().toString(36).slice(2)}`;
}
