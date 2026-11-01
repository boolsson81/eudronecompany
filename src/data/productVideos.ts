import registry from "./product-videos.json";

/**
 * Verifierade produktfilmer från DJI och Wisson.
 *
 * Källan är `product-videos.json`, som även Wisson-skripten läser. Alla
 * `youtubeId` i produkt-, kamera- och branschdata ska hämtas härifrån via
 * `videoId()` så att ett dött eller felaktigt ID bara behöver rättas på ett
 * ställe. Testerna i `scripts/__tests__/product-videos.test.ts` kontrollerar
 * att registret bara innehåller tillverkarnas egna kanaler.
 */

export type ProductVideoKey = keyof typeof registry.videos;

export interface ProductVideo {
  youtubeId: string;
  title: string;
  channel: string;
  verified: string;
}

export const PRODUCT_VIDEOS: Record<ProductVideoKey, ProductVideo> = registry.videos;

export function getProductVideo(key: ProductVideoKey): ProductVideo {
  return PRODUCT_VIDEOS[key];
}

export function videoId(key: ProductVideoKey): string {
  return PRODUCT_VIDEOS[key].youtubeId;
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
