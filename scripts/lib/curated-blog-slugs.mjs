/**
 * Curated full-English blog article slugs (replaces auto-translated hybrids).
 * Key: article handle under nyheter (without blog prefix).
 */
export const CURATED_ARTICLE_SLUGS = {
  "kop-dronare-med-kamera": "buy-drones-with-camera",
  "dji-flip-lilla-dronaren": "dji-flip-compact-drone",
  "kamera-for-youtube": "cameras-for-youtube",
  "mikrofon-mygga-tradlos": "wireless-lavalier-microphone",
  "mikrofon-till-mobil": "microphones-for-mobile",
  "spela-in-ljud": "record-audio-with-action-camera",
  "sd-kort-till-kamera": "sd-cards-for-cameras",
  "upptack-dji-osmo-action-6-actionkamerans-nya-masterverk": "dji-osmo-action-6-review",
  "nitecore-emr25-myggavskrackaren": "nitecore-emr25-mosquito-repellent",
  "dronare-bast-i-test-budget": "best-budget-drones",
  "actionkamera-bast-i-test": "best-action-cameras",
  "bast-i-test-actionkamera": "best-action-camera-tests",
  "far-man-flyga-dronare-over-annans-tomt": "can-you-fly-drones-over-private-property",
  "dronare-for-nyborjare": "drones-for-beginners",
  "kopa-dronare-med-kamera": "buying-drones-with-camera",
  actionkamera: "action-cameras",
  "stativ-till-mobil-for-att-filma": "phone-tripods-for-filming",
  "tradlos-mygga-mikrofon": "wireless-lapel-microphone",
};

/** Fix auto-translated slugs from BLOG_HANDLE_MAPPING that are not hybrid but still poor English */
export const ARTICLE_SLUG_OVERRIDES = {
  "laddningsbara-batterier-aaa": "rechargeable-aaa-batteries",
  "uppladdningsbara-batterier-laddare": "rechargeable-batteries-and-chargers",
  "micro-usb-laddare": "micro-usb-charger",
  "basta-powerbanken": "best-powerbanks",
  "gopro-tillbehor-batterier-filter": "gopro-accessories-batteries-filters",
  "led-lampa-pa-batteri": "battery-powered-led-lamps",
  "dji-mini-4pro-fragor-svar": "dji-mini-4-pro-faq",
  "far-man-flyga-drones-over-annans-tomt": "can-you-fly-drones-over-private-property",
  "drones-for-nyborjare": "drones-for-beginners",
  "drones-bast-i-test-budget": "best-budget-drones",
  "kop-drones-med-kamera": "buy-drones-with-camera",
  "kopa-drones-med-kamera": "buying-drones-with-camera",
  "dji-flip-lilla-dronesn": "dji-flip-compact-drone",
  "rechargeable-batteryer-aaa": "rechargeable-aaa-batteries",
  "upprechargeable-batteryer-charger": "rechargeable-batteries-and-chargers",
  "spela-in-audio": "record-audio-with-action-camera",
  "microphone-mygga-wireless": "wireless-lavalier-microphone",
  "microphone-till-mobil": "microphones-for-mobile",
  "wireless-mygga-microphone": "wireless-lapel-microphone",
  "gopro-accessories-batteryer-filter": "gopro-accessories-batteries-filters",
  stormkok: "camping-stove",
  kamerastativ: "camera-tripod",
  campingkok: "camping-stove",
  vevradio: "crank-radio",
  nodfilt: "emergency-blanket",
  "portabla-solceller": "portable-solar-panels",
  "time-lapse-kamera": "time-lapse-camera",
  krislada: "emergency-kit",
  "krisberedskap-hemma": "home-emergency-preparedness",
  karbinhake: "carabiner",
};

export function resolveArticleSlug(currentHandle, proposedArticleHandle) {
  if (CURATED_ARTICLE_SLUGS[currentHandle]) return CURATED_ARTICLE_SLUGS[currentHandle];
  if (ARTICLE_SLUG_OVERRIDES[currentHandle]) return ARTICLE_SLUG_OVERRIDES[currentHandle];
  if (ARTICLE_SLUG_OVERRIDES[proposedArticleHandle]) return ARTICLE_SLUG_OVERRIDES[proposedArticleHandle];
  return proposedArticleHandle;
}

export const BLOG_HANDLE_MAP = { nyheter: "news" };
