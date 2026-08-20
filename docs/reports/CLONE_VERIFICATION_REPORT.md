# Clone Verification Report — Ecommerce Data Fidelity

**Date:** 2026-06-07  
**Scope:** Shopify store clone (`shopify-cloner-*`, `shopify-drone-clone`)  
**Assumption:** Clone pipeline executes without errors (scan → publish completes)  
**Question answered:** Is **all** ecommerce data copied correctly to the target store?

**Short answer: No.** Core product catalog data copies well for a typical ActionKing → EuroDroneParts migration, but **collection membership, cost prices, per-location inventory, product taxonomy category, Search & Discovery settings, and several metafield/reference types are incomplete or missing.** Two clone paths behave differently.

---

## Clone Pipelines Compared

| Aspect | **Full Cloner** (`shopify-cloner-*`) | **Drone Clone** (`shopify-drone-clone`) |
|--------|--------------------------------------|----------------------------------------|
| UI | `src/pages/ShopifyCloner.tsx` | `src/pages/admin/ShopifyDroneClone.tsx` |
| Scan | `shopify-cloner-scan` — 17+ resource types | Keyword-filtered products + collections only |
| Transform | Optional AI rebrand (`shopify-cloner-transform`) | None |
| Publish | `shopify-cloner-publish` — REST product/collection API | Inline REST publish |
| Collection membership | **Not linked** on publish | **Linked** via `collects.json` for custom collections |
| Product status on target | **Always `draft`** | Preserves source status |
| Inventory qty on target | **Copied** (`inventory_quantity`) | **Not copied** |
| Media per product | Up to 100+ (paginated) | Max **25** images |
| Collections on product scan | **Not scanned** | Scanned (`collections(first: 25)`) |
| Metafield GID remap | Optional UI step (`remap_metafields: true`) | Not implemented |

**For ActionKing → EuroDroneParts:** Use **full cloner** for breadth (themes, redirects, metafield defs, translations). Use **drone clone** only for a filtered subset where collection linking matters more than inventory quantities.

---

## Pipeline Stages & Fidelity Impact

```
Source Shopify
     │
     ▼
┌─────────────┐   GraphQL/REST queries define MAX captured data
│    SCAN     │   Limits: variants≤100, metafields≤50, collections not on products (full cloner)
└─────────────┘
     │
     ▼
┌─────────────┐   OPTIONAL — rewrites title/body/SEO/tags (NOT a faithful copy)
│  TRANSFORM  │   AI may invent FAQ/related-product suggestions
└─────────────┘
     │
     ▼
┌─────────────┐   REST Admin API creates draft products/collections
│   PUBLISH   │   Image proxy may convert to WebP; collections not membership-linked (full)
└─────────────┘
     │
     ▼
┌─────────────┐   OPTIONAL — only reference-type metafields with mapped GIDs
│REMAP METAFIELDS│
└─────────────┘
```

**Faithful copy requires:** Transform step **disabled** (or passthrough), image optimization **disabled**, and manual verification of items below marked ❌ or ⚠️.

---

## Field-by-Field Verification

Legend: **✅ Copied** · **⚠️ Partial** · **❌ Not copied** · **N/A** Not applicable / not in Shopify API surface used

### Products & Variants

| Data field | Scanned | Published (full cloner) | Published (drone clone) | Notes |
|------------|---------|-------------------------|-------------------------|-------|
| **Products (title, body)** | ✅ | ✅ | ✅ | Transform step rewrites if enabled |
| **Variants (options)** | ✅ up to 100 | ✅ | ✅ | Variant 101+ **lost** |
| **SKU** | ✅ | ✅ | ✅ | Per variant |
| **Barcode / GTIN / EAN** | ✅ `barcode` | ✅ | ✅ | Only if stored in Shopify `barcode` field |
| **Vendor article numbers** | ⚠️ | ⚠️ | ⚠️ | **No native Shopify field.** Copied only if stored in SKU, barcode, or a **metafield** (max 50 metafields/product) |
| **Selling prices** | ✅ `price` | ✅ | ✅ | |
| **Compare-at prices** | ✅ `compareAtPrice` | ✅ `compare_at_price` | ✅ | |
| **Cost prices** | ❌ | ❌ | ❌ | `inventoryItem.unitCost` **not queried** in either scanner |
| **Inventory quantities** | ✅ `inventoryQuantity` (aggregate) | ✅ `inventory_quantity` | ❌ | Drone clone omits qty entirely |
| **Per-location inventory** | ❌ | ❌ | ❌ | No `inventoryLevels` query; multi-warehouse stock **not copied** |
| **Inventory policy** | ✅ | ✅ | ✅ | `deny` / `continue` |
| **Tracked vs untracked** | ✅ `inventoryItem.tracked` | ✅ `inventory_management` | ❌ | Drone clone doesn't set tracking |
| **Weight** | ✅ | ✅ | ✅ | |
| **HS code** | ✅ `harmonizedSystemCode` | ❌ | ❌ | Scanned but **not in publish payload** |
| **Country of origin** | ✅ `countryCodeOfOrigin` | ❌ | ❌ | Scanned but **not in publish payload** |
| **Variant-level metafields** | ❌ | ❌ | ❌ | Only **product-level** metafields scanned |
| **Product status (active/draft)** | ✅ | ⚠️ **forced `draft`** | ✅ preserves source | Full cloner never publishes active |
| **Template suffix** | ✅ | ✅ | ❌ | Drone clone omits |
| **Shopify Standard Product Taxonomy** | ✅ `category { id name }` | ❌ | ❌ | Scanned in full cloner; **not published** |

**Source:** Scan query `PRODUCT_QUERY` in `shopify-cloner-scan/index.ts` lines 123–148; publish `buildProductPayload()` in `shopify-cloner-publish/index.ts` lines 209–264; drone `buildProductPayload()` lines 197–223.

---

### Images & Media

| Data field | Scanned | Published | Notes |
|------------|---------|-----------|-------|
| **Product images (URLs)** | ✅ paginated to 100+ | ✅ re-hosted via URL | Shopify fetches from source CDN |
| **ALT text** | ✅ | ✅ | Missing alt → auto-generated from product title |
| **Image filenames** | N/A | ⚠️ Renamed | `cleanFilename()` slugifies to `{handle}-01.webp` |
| **Original format** | ✅ | ⚠️ | Optional weserv.nl proxy converts to **WebP/JPG** — not byte-identical |
| **Variant-specific images** | ✅ | ✅ | Linked post-create via `linkVariantImages()` (full cloner only) |
| **Non-image media (video/3D)** | ⚠️ | ❌ | Scan filters `MediaImage` only; videos/3D models **skipped** |
| **Standalone files** | ✅ `file` type | ✅ `fileCreate` | Separate scope item; not auto-attached to products |

**Drone clone limit:** Only `media(first: 25)` — products with >25 images lose extras.

---

### Collections & Categories

| Data field | Scanned | Published | Notes |
|------------|---------|-----------|-------|
| **Custom collections (metadata)** | ✅ | ✅ | Title, body, handle, image, metafields, SEO |
| **Smart collections (rules)** | ✅ `ruleSet` | ✅ | Rules + disjunctive flag copied |
| **Collection SEO** | ✅ | ✅ | Also as `global.title_tag` / `description_tag` metafields |
| **Collection sort order** | ✅ | ✅ | |
| **Product ↔ collection membership** | ❌ full / ✅ drone | ❌ full / ✅ drone | **Critical gap in full cloner:** `shopify-cloner-publish` has **no `collects.json` or `collectionAddProducts`** call. Drone clone links via `collects.json` (custom collections only; smart collections auto-populate from rules) |
| **Product categories (Shopify taxonomy)** | ✅ scanned | ❌ | `category { id name }` not in publish payload |
| **Product type** | ✅ | ✅ | Maps to Shopify `product_type` |
| **Tags** | ✅ | ✅ | Comma-separated string |
| **Vendor** | ✅ | ✅ | |

**Implication:** After a full clone, products exist but may **not appear in the correct manual collections** on the target store. Smart collections work only if their rules match target data.

---

### Metafields

| Data field | Scanned | Published | Notes |
|------------|---------|-----------|-------|
| **Product metafields** | ✅ first **50** | ✅ on create | Metafield 51+ **lost** |
| **Collection/page metafields** | ✅ | ✅ | |
| **Metafield definitions** | ✅ separate scan | ✅ `metafieldDefinitionCreate` | Run definitions before values |
| **Metaobjects + definitions** | ✅ | ✅ | |
| **Reference metafields (GID)** | ✅ | ⚠️ | Raw source GIDs copied initially; **broken references** until `remap_metafields` pass |
| **List-type references** | ✅ | ⚠️ | Remap pass handles `list.*_reference` types |
| **Non-reference metafields with URLs** | ✅ | ⚠️ | Source domain URLs **not rewritten** automatically |
| **Variant metafields** | ❌ | ❌ | Not scanned |

**Remap scope** (`REFERENCE_TYPES` in publish): `file_reference`, `product_reference`, `variant_reference`, `collection_reference`, `page_reference`, `metaobject_reference` (+ list variants). Other types with embedded GIDs are **not remapped**.

UI triggers remap: `ShopifyCloner.tsx` line 354 — `remap_metafields: true` (must be run **after** publish).

---

### SEO Data

| Data field | Scanned | Published | Notes |
|------------|---------|-----------|-------|
| **SEO title** | ✅ `seo.title` | ✅ | As `global.title_tag` metafield + transform override |
| **SEO description** | ✅ `seo.description` | ✅ | As `global.description_tag` metafield |
| **URL handles** | ✅ | ✅ | Preserved from source (transform says "keep handles unchanged") |
| **FAQ JSON (custom)** | ❌ scan | ⚠️ publish | Only if **transform** adds `faq` → `seo.faq_json` metafield |
| **Structured data metafields** | ⚠️ | ⚠️ | Only if present in scanned metafields (≤50) |
| **Locale translations** | ✅ `translation` type | ⚠️ | Separate publish pass; requires target resource mapping + digest match; keys without digest **skipped** |

---

### Redirects

| Data field | Scanned | Published | Notes |
|------------|---------|-----------|-------|
| **URL redirects (path → target)** | ✅ | ✅ | `redirects.json` POST |
| **Target URL domain rewrite** | N/A | ❌ | `target` copied **as-is** — may still point to **source domain** or absolute source URLs |
| **Redirect chains** | ❌ | ❌ | Not normalized |

**Post-clone action required:** Audit all redirects for source-domain references.

---

### Related Products & Search & Discovery

| Data field | Scanned | Published | Notes |
|------------|---------|-----------|-------|
| **Related products (theme/metafield)** | ⚠️ | ⚠️ | Only if stored in product metafields within first 50 |
| **Complementary products** | ❌ | ❌ | **Shopify Search & Discovery app** data — not in Admin API queries used |
| **Product recommendations (Search & Discovery)** | ❌ | ❌ | App-managed; no scan/publish code |
| **Search filters / facets** | ❌ | ❌ | Not copied |
| **Boost & bury rules** | ❌ | ❌ | Not copied |
| **Search synonyms** | ❌ | ❌ | Not copied |
| **AI transform `related_product_suggestions`** | N/A | ⚠️ | **Generated suggestions**, not a copy of source relationships |

**Verdict:** Shopify Search & Discovery configuration is **entirely outside** the clone pipeline.

---

## Additional Objects (Full Cloner Scope)

| Object | Copied? | Ecommerce relevance |
|--------|---------|---------------------|
| Pages, blogs, articles | ✅ | Content store, not product catalog |
| Navigation menus | ⚠️ | Created but **menu item URLs unchanged** (may point to source) |
| Themes + assets | ⚠️ | Copied unpublished; optional `remap_theme_settings` for GIDs in JSON templates |
| Locales + translations | ⚠️ | Locales enabled; translations partial (digest-dependent) |
| Customers, segments | ✅ / ⚠️ | Not product data; GDPR consideration |
| Discount codes | ⚠️ | Basic codes only; BXGY/Free shipping types may fail |
| Shipping zones | ⚠️ | Best-effort; often **manual setup required** (logged as `shipping_zone_manual_required`) |
| Gift cards | ⚠️ | New codes generated; **balances not preserved** |
| Checkout branding | ⚠️ | Upserted to target's published profile |
| Publications / sales channels | ❌ | Products created but **not published** to Online Store / markets automatically |

---

## Limits & Truncation Risks

| Limit | Value | Impact |
|-------|-------|--------|
| Variants per product (scan) | 100 | Additional variants silently dropped |
| Metafields per product (scan) | 50 | Additional metafields silently dropped |
| Collections per product (drone scan) | 25 | Membership detection incomplete for 26+ collections |
| Drone media per product | 25 | Image loss |
| Publish batch size | 25 items/call (default) | Large catalogs need many worker iterations |
| REST vs GraphQL | Publish uses REST `products.json` | Some newer GraphQL-only fields unavailable |

---

## Transform Step — Fidelity Warning

If `shopify-cloner-transform` runs (AI rebrand enabled in migration `transformation` config):

| Field | Behavior |
|-------|----------|
| Title, body, SEO title/description | **Rewritten** — not identical to source |
| Tags, vendor, product_type | May change per AI output |
| Handles | Prompt says unchanged; not guaranteed |
| FAQ, AI Q&A blocks | **New content** added to metafields |
| Related product suggestions | **AI-generated**, not copied |

**For verification testing:** Disable transform or use `mode: create_only` with empty `transformation` to achieve closest 1:1 copy.

---

## Verification Matrix Summary

| # | Check item | Full cloner | Drone clone |
|---|------------|-------------|-------------|
| 1 | Products | ✅ | ✅ (filtered) |
| 2 | Variants | ⚠️ ≤100 | ⚠️ ≤100 |
| 3 | SKU | ✅ | ✅ |
| 4 | Barcode / GTIN / EAN | ✅ | ✅ |
| 5 | Vendor article numbers | ⚠️ metafield only | ⚠️ metafield only |
| 6 | Inventory quantities | ✅ aggregate | ❌ |
| 7 | Cost prices | ❌ | ❌ |
| 8 | Selling prices | ✅ | ✅ |
| 9 | Compare-at prices | ✅ | ✅ |
| 10 | Images | ⚠️ format may change | ⚠️ ≤25 images |
| 11 | ALT text | ✅ | ✅ |
| 12 | Collections (metadata) | ✅ | ✅ |
| 13 | Collection membership | ❌ | ⚠️ custom only |
| 14 | Product categories (taxonomy) | ❌ | ❌ |
| 15 | Tags | ✅ | ✅ |
| 16 | Product type | ✅ | ✅ |
| 17 | Vendor | ✅ | ✅ |
| 18 | Metafields | ⚠️ ≤50; remap needed | ⚠️ ≤50 |
| 19 | SEO title / description | ✅ | ✅ |
| 20 | URL handles | ✅ | ✅ |
| 21 | Redirects | ⚠️ targets not rewritten | N/A |
| 22 | Related products | ❌ | ❌ |
| 23 | Search & Discovery | ❌ | ❌ |

**Score: 14/23 fully copied in full cloner** (assuming transform disabled, remap run, and no edge-case truncation).

---

## What Is NOT Copied (Complete List)

### Definitively absent from scan + publish code

1. **Cost / unit cost** (`inventoryItem.unitCost`)
2. **Per-location inventory levels** (`inventoryLevels` per variant per location)
3. **Shopify Standard Product Taxonomy category** (published)
4. **Shopify Search & Discovery** — complementary products, recommendations, filters, boost rules, synonyms
5. **Sales channel / publication assignments** (Online Store, POS, markets)
6. **Variant-level metafields**
7. **Product video / 3D model media**
8. **HS code and country of origin** (scanned but dropped at publish)
9. **Custom collection product membership** (full cloner only)
10. **Order history, customers' order associations** (customers optional but separate)
11. **Gift card remaining balances** (only initial value on new cards)
12. **App-specific data** (reviews apps, subscription apps, etc.)
13. **Inventory item ID / variant ID mapping** (new IDs on target — expected, but breaks external integrations referencing old IDs)

### Present but degraded

14. Metafields beyond 50 per product  
15. Variants beyond 100 per product  
16. Images beyond 25 (drone clone)  
17. Redirect targets pointing to source domain  
18. Menu links pointing to source domain  
19. Reference metafields with stale GIDs (until remap pass)  
20. Image byte-identical fidelity (WebP conversion optional)  
21. Product status always draft (full cloner)  
22. Smart collection membership (depends on rules matching on target)  
23. Translations missing digest matches  
24. Shipping zones (manual fallback common)  

---

## Post-Clone Verification Checklist

Run on target store after clone completes:

### Automated sampling (recommended)

- [ ] Export products CSV from source and target; diff SKU, price, compare_at_price, barcode, inventory qty
- [ ] Count products, variants, collections — compare totals (allow ± for filtered migrations)
- [ ] Spot-check 20 SKUs: images load, alt text present, handle matches
- [ ] Run `remap_metafields` and confirm no `gid://shopify/Product/` references point to source IDs in metafields
- [ ] Query target redirects API; flag any `target` containing source domain

### Manual Shopify Admin checks

- [ ] Open 10 products → verify collection membership (expect **gaps** on full cloner)
- [ ] Inventory → confirm per-location stock if multi-warehouse (expect **gaps**)
- [ ] Settings → Search & Discovery → reconfigure complementary products and filters
- [ ] Products → re-activate from draft if full cloner used
- [ ] Sales channels → publish products to Online Store / required markets
- [ ] Check metafields on 10 products with known custom namespaces (GPSR, import duty, markets)
- [ ] Verify smart collections auto-populate correctly

### ActionKing → EuroDroneParts specific

- [ ] Confirm `eudroneparts-set-token` / `shopify_app_installations` row exists for `ya1xhg-x6.myshopify.com`
- [ ] Run clone **without AI transform** for faithful copy
- [ ] After publish: bulk activate products from draft
- [ ] Manually assign products to custom collections OR run a post-migration `collects` script
- [ ] Reconfigure Search & Discovery and theme section product recommendations
- [ ] Update redirects from `actionking.se` paths to EuroDroneParts domain

---

## Recommended Improvements (Priority Order)

| Priority | Improvement | Closes gap |
|----------|-------------|------------|
| P0 | Add `collects.json` / `collectionAddProducts` to `shopify-cloner-publish` after product create | Collection membership |
| P0 | Publish `harmonizedSystemCode` + `countryCodeOfOrigin` on variants (InventoryItem API) | Trade/compliance data |
| P1 | Query + publish `inventoryItem.unitCost` | Cost prices |
| P1 | Query `inventoryLevels` per location; activate inventory at target locations | Per-location stock |
| P1 | Paginate metafields beyond 50; scan variant metafields | Metafield completeness |
| P1 | Rewrite redirect/menu targets: source domain → target domain | Navigation integrity |
| P2 | Publish `category` (Standard Product Taxonomy) via GraphQL `productSet` | Product categories |
| P2 | Optional `publish_to_online_store` step (publications API) | Sales channel visibility |
| P2 | Document/manual export for Search & Discovery (no public API in cloner) | Related products |
| P3 | Scan non-image media types | Videos / 3D |
| P3 | Preserve original image format (disable weserv by default for faithful clone) | Image fidelity |

---

## Conclusion

Assuming the clone **runs successfully**, the pipeline delivers a **solid catalog copy** for standard product fields (title, description, SKU, barcode, prices, tags, vendor, product type, handles, SEO metafields, images with alt text, and most product metafields within limits).

It does **not** deliver a complete ecommerce clone. The largest gaps for ActionKing / EuroDroneParts are:

1. **Custom collection membership** (full cloner)  
2. **Cost prices and per-location inventory**  
3. **HS code / country of origin** (scanned but not published)  
4. **Shopify Search & Discovery / related products**  
5. **Products left in draft + not assigned to sales channels**  
6. **Redirects and menus still referencing source URLs**

**Clone fidelity score: 6.5 / 10** for catalog data (transform disabled, remap run).  
**Not a 10/10** until collection linking, inventory/cost completeness, and post-clone activation steps are addressed.

---

## Source Files Referenced

| File | Role |
|------|------|
| `supabase/functions/shopify-cloner-scan/index.ts` | GraphQL scan queries, payload capture |
| `supabase/functions/shopify-cloner-publish/index.ts` | REST publish, `buildProductPayload`, remap |
| `supabase/functions/shopify-cloner-transform/index.ts` | AI content rewrite |
| `supabase/functions/shopify-drone-clone/index.ts` | Filtered clone + collection linking |
| `src/pages/ShopifyCloner.tsx` | UI workflow, `remap_metafields` trigger |

---

*Static code analysis only. Run the post-clone checklist against a real ActionKing → EuroDroneParts migration to confirm production fidelity.*
