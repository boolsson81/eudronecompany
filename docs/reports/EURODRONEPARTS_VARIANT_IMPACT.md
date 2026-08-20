# EuroDroneParts — Sunsky Variant Impact Analysis

**Date:** 2026-06-08  
**Store:** EuroDroneParts (Sunsky supplier)  
**Data:** Full DJI brand catalog crawl — **376 SKUs** fetched via `brandId=DJI`, **362** assigned to merchandising categories  
**Raw output:** `scripts/eurodrone-category-output.json`  
**Re-run:** `node scripts/classify-eurodrone-categories.mjs`

---

## Executive Summary

| Metric | Result |
|--------|--------|
| **DJI catalog analyzed** | 376 products (primary EuroDrone Sunsky source) |
| **Assigned to 7 categories** | 362 (96.3%) |
| **Safe to import today** | **43 SKUs (11.9%)** |
| **Requiring Phase 1 (PR-V1)** | **2 SKUs (0.6%)** |
| **Requiring Phase 2 (PR-V2)** | **317 SKUs (87.6%)** |
| **Launch verdict** | **Conditional GO** — pilot with ~40 single-SKU products; **NO-GO** for full-category bulk launch |

DJI products on Sunsky are dominated by **`optionList` variant families** (compatible-model branches), not color `modelList` swatches. **Phase 2 multi-variant publish is the critical path** — Phase 1 family dedup alone unlocks almost nothing in this catalog.

---

## Phase Definitions

| Phase | Pipeline | What it unlocks |
|-------|----------|-----------------|
| **Today (PR1)** | Single-SKU import + `Default Title` publish | Category **A** + **A-caution** only |
| **Phase 1 (PR-V1)** | Family dedup by `groupItemNo`; anchor SKU import; sibling hydration | **B-modelList** — color/size families (rare in DJI catalog) |
| **Phase 2 (PR-V2)** | Multi-variant `productSet`; `optionList` branches; full matrices | **B-optionList** + **B-both** — the majority of DJI SKUs |

---

## Category Analysis

### Summary table

| Category | Product count | Single SKU | Variant family | Safe today | Phase 1 | Phase 2 | Risk | Import readiness |
|----------|--------------|------------|----------------|------------|---------|---------|------|------------------|
| **DJI accessories** | 246 | 32 | 214 | **13.0%** | 0.8% | 86.2% | High | Phase 2 required |
| **Drone spare parts** | 9 | 0 | 9 | **0%** | 0% | 100% | High | Phase 2 required |
| **Drone batteries** | 37 | 6 | 31 | **16.2%** | 0% | 83.8% | High | Partial — pilot only |
| **Drone propellers** | 24 | 4 | 20 | **16.7%** | 0% | 83.3% | High | Partial — pilot only |
| **Enterprise drone accessories** | 26 | 0 | 26 | **0%** | 0% | 100% | High | Phase 2 required |
| **Charging accessories** | 16 | 1 | 15 | **6.3%** | 0% | 93.8% | High | Phase 2 required |
| **Cases and bags** | 4 | 0 | 4 | **0%** | 0% | 100% | High | Phase 2 required |
| **Total** | **362** | **43** | **319** | **11.9%** | **0.6%** | **87.6%** | High | Conditional pilot |

### Variant mechanism by category

| Category | B-modelList | B-optionList | B-both | Dominant pattern |
|----------|-------------|--------------|--------|------------------|
| DJI accessories | 2 | 209 | 3 | `optionList` — cross-model compatibility (Phantom/P4 filters, RS plates, Osmo kits) |
| Drone spare parts | 0 | 9 | 0 | `optionList` — left/right, model variants |
| Drone batteries | 0 | 31 | 0 | `optionList` — capacity bundles, white/black, multi-model packs |
| Drone propellers | 0 | 20 | 0 | `optionList` — 11-way model compatibility per propeller line |
| Enterprise | 0 | 26 | 0 | `optionList` — Matrice/Zenmuse payload branches |
| Charging accessories | 0 | 15 | 0 | `optionList` — hub variants per drone series |
| Cases and bags | 0 | 4 | 0 | `optionList` — model/size branches |

---

## Per-Category Detail

### 1. DJI accessories

| Field | Value |
|-------|-------|
| **Product count** | 246 |
| **Single SKU products** | 32 (13.0%) |
| **Variant family products** | 214 (87.0%) |
| **Risk level** | **High** |
| **Import readiness** | Phase 2 required for bulk; 32 SKUs pilot-ready today |

**Safe today examples**

| itemNo | Product |
|--------|---------|
| `TBD05822260` | Original Remote Control Joystick Speed Controller for DJI Mini 3 Pro |
| `TBD06030810` | Original Expansion Adapter For DJI Osmo Pocket 3 |
| `TBD06057502` | Original Electronic Briefcase Handle For DJI RS 5 |

**Variant family examples**

| itemNo | Product | optionList branches |
|--------|---------|---------------------|
| `S-DLP-1596` | UV Filter for DJI Phantom 3 / P4 series | 7 |
| `TBD03057326` | Adhesive Mount Kit For DJI Osmo Action 3 | 14 |
| `TBD01583808` | Quick Release Plate For DJI RS 3 Mini | 2 |

**Recommendation:** Import the **32 single-SKU OEM parts** immediately. Hold filters, mount kits, and multi-model compatibility lines until Phase 2 — publishing one branch without the picker misleads customers on compatibility.

---

### 2. Drone spare parts

| Field | Value |
|-------|-------|
| **Product count** | 9 |
| **Single SKU products** | 0 |
| **Variant family products** | 9 (100%) |
| **Risk level** | **High** |
| **Import readiness** | Phase 2 required |

**Variant family examples**

| itemNo | Product | Notes |
|--------|---------|-------|
| `TBD06063254` | External Antenna Left Spare Part For DJI Goggles 2 | 2 option branches |
| `TBD06057726` | Avata 2 Body Frame Upper Shell | Repair part with model branch |
| `TBD06063252` | USB-C Port Cover Spare Part For DJI Osmo Action 4 | 3 branches |

**Recommendation:** **Do not launch** spare-parts category until Phase 2. Wrong antenna side or shell variant creates RMA risk.

---

### 3. Drone batteries

| Field | Value |
|-------|-------|
| **Product count** | 37 |
| **Single SKU products** | 6 (16.2%) |
| **Variant family products** | 31 (83.8%) |
| **Risk level** | **High** |
| **Import readiness** | Partial — pilot 6 SKUs today |

**Safe today examples**

| itemNo | Product |
|--------|---------|
| `TBD06038789` | Original TB51 Smart Battery For DJI Inspire 3 |
| `TBD06064161` | DJI Neo 2 Intelligent Flight Battery 1606 mAh |
| `TBD06064163` | DJI Neo 2 Two-Way Charging Hub 3-Slot |

**Variant family examples**

| itemNo | Product | optionList branches |
|--------|---------|---------------------|
| `TBD0426373601A` | Mini 4 Pro / Mini 3 Pro Long Life Battery 3850 mAh (White) | 4 |
| `TBD0421393001A` | Mini 4 Pro / Mini 3 Pro Propeller (Black) — cross-listed | 11 |
| `TBD06056392` | Intelligent Flight Battery 3110 mAh For DJI Flip | 6 |

**Recommendation:** Launch **6 confirmed single-SKU batteries/hubs** for Neo 2, Inspire 3, etc. Block all `optionList` battery lines — customers must pick exact mAh + model compatibility.

---

### 4. Drone propellers

| Field | Value |
|-------|-------|
| **Product count** | 24 |
| **Single SKU products** | 4 (16.7%) |
| **Variant family products** | 20 (83.3%) |
| **Risk level** | **High** |
| **Import readiness** | Partial — pilot 4 SKUs today |

**Safe today examples**

| itemNo | Product |
|--------|---------|
| `TBD06040745` | Original Propellers For DJI Flip Drone |
| `TBD06064166` | DJI Neo 2 Original Propellers |
| `TBD06065369` | Mini 5 Pro Propeller Guard (integrated propellers) |

**Variant family examples**

| itemNo | Product | optionList branches |
|--------|---------|---------------------|
| `TBD0421393001A` | 2 Pairs Propeller For DJI Mini 4 Pro / Mini 3 Pro (Black) | 11 |
| `TBD0422753601A` | 2 pairs Propeller For DJI Mini 2 / Mini SE (Black) | 11 |
| `TBD06041602` | Propellers Blades For DJI Mini 3 (2 Pairs) | 11 |

**Recommendation:** Propeller lines with **11 compatibility branches** are the highest duplicate-risk SKUs in the catalog. Pilot only single-SKU prop sets; defer all multi-model propeller listings to Phase 2.

---

### 5. Enterprise drone accessories

| Field | Value |
|-------|-------|
| **Product count** | 26 |
| **Single SKU products** | 0 |
| **Variant family products** | 26 (100%) |
| **Risk level** | **High** |
| **Import readiness** | Phase 2 required |

**Variant family examples**

| itemNo | Product | optionList branches |
|--------|---------|---------------------|
| `TBD04269047` | 2510F 2pcs Propeller for DJI Matrice 400 | 9 |
| `TBD06032724` | Follow Focus Motor For DJI Zenmuse X9 | 2 |
| `TBD06032727` | Gimbal Counterweight For DJI Zenmuse X9 | 3 |

**Recommendation:** Enterprise buyers expect spec-accurate variant pickers. **Zero SKUs** are launch-ready without Phase 2.

---

### 6. Charging accessories

| Field | Value |
|-------|-------|
| **Product count** | 16 |
| **Single SKU products** | 1 (6.3%) |
| **Variant family products** | 15 (93.8%) |
| **Risk level** | **High** |
| **Import readiness** | Phase 2 required (1 pilot SKU) |

**Safe today example**

| itemNo | Product |
|--------|---------|
| `TBD0602999801A` | Two-Way Charging Hub For DJI Mini 4 Pro/Mini 3 Series (A-caution — sibling dedup required) |

**Variant family examples**

| itemNo | Product | optionList branches |
|--------|---------|---------------------|
| `TBD06046867` | Two-Way Charging Hub For DJI Avata 2 | multi-branch |
| `TBD06055593` | Parallel Charging Hub For DJI Flip | 6 |
| `TBD06046944` | Two-Way Charging Hub For DJI Mini 4 Pro/Mini 3 Series | 5 |

**Recommendation:** Charging hubs are almost entirely `optionList` families. One pilot SKU possible with dedup guard; full charging category needs Phase 2.

---

### 7. Cases and bags

| Field | Value |
|-------|-------|
| **Product count** | 4 |
| **Single SKU products** | 0 |
| **Variant family products** | 4 (100%) |
| **Risk level** | **High** |
| **Import readiness** | Phase 2 required |

**Note:** Only 4 DJI-branded drone cases matched title filters in the Sunsky DJI catalog. Third-party FPV cases (non-DJI brand) are not captured in this crawl.

**Recommendation:** Defer cases/bags until Phase 2. Expect color/model `optionList` branches when catalog expands.

---

## Aggregate Estimates

### DJI catalog (measured — 362 products)

```
Safe today (PR1):     43 SKUs  ████░░░░░░░░░░░░░░░░  11.9%
Phase 1 (PR-V1):       2 SKUs  ░░░░░░░░░░░░░░░░░░░░   0.6%
Phase 2 (PR-V2):     317 SKUs  █████████████████░░░  87.6%
```

| Bucket | Count | % | SKU examples ready now |
|--------|-------|---|------------------------|
| **Safe today** | 43 | **11.9%** | Mini 3 Pro joystick, Osmo Pocket 3 adapter, Neo 2 battery, Flip propellers |
| **Phase 1** | 2 | **0.6%** | Color `modelList` only (2 DJI accessory lines) |
| **Phase 2** | 317 | **87.6%** | Phantom UV filter (7 branches), Mini propellers (11 branches), Matrice payloads |

### EuroDroneParts full-store projection

The DJI crawl covers the **primary branded assortment** EuroDroneParts is likely to launch first. Non-DJI FPV parts (iFlight, GEPRC, generic LiPo) require keyword search — currently **unreliable without `brandId`** ([SUNSKY_CATALOG_CLASSIFICATION.md](./SUNSKY_CATALOG_CLASSIFICATION.md)).

| Assortment scope | Safe today | Phase 1 | Phase 2 |
|------------------|------------|---------|---------|
| **DJI catalog only (measured)** | **12%** | **1%** | **88%** |
| **DJI + curated FPV SKU list (estimate)** | **10–18%** | **5–15%** | **70–85%** |
| **Full Sunsky keyword browse (estimate)** | **3–5%** | **2–5%** | **90–95%** |

Phase 1 share rises for generic FPV catalogs where color `modelList` is more common than DJI's `optionList` pattern.

---

## Risk Assessment

### Category risk matrix

| Category | Customer impact if imported wrong | Regulatory / safety | Variant complexity |
|----------|-----------------------------------|---------------------|-------------------|
| Batteries | Wrong mAh / model — fire risk, warranty void | **High** | optionList |
| Propellers | Wrong size — crash risk | **High** | optionList (11 branches) |
| Spare parts | Wrong side/model — unusable part | Medium | optionList |
| Enterprise | Wrong payload / mount — job failure | **High** | optionList |
| Charging | Wrong hub — battery damage | **High** | optionList |
| DJI accessories | Wrong compatibility — returns | Medium | optionList dominant |
| Cases/bags | Wrong fit | Low | optionList |

### Systemic risks (current PR1 pipeline)

1. **Duplicate listings** — importing multiple `optionList` siblings creates near-identical Shopify products.
2. **No compatibility picker** — customer cannot select Mini 3 vs Mini 4 vs Mini 2 on propeller lines.
3. **Order fulfillment errors** — single `Default Title` variant hides the real Sunsky `itemNo` branch.
4. **SEO cannibalization** — 11 sibling propeller SKUs → 11 competing product pages.

---

## GO / NO-GO Recommendation

### NO-GO — Full EuroDroneParts Sunsky launch

**Do not** bulk-import and publish the DJI catalog (or any category at full depth) today.

| Blocker | Scale |
|---------|-------|
| 87.6% of DJI SKUs need Phase 2 | 317 / 362 products |
| Enterprise, spare parts, cases | 0% safe today |
| `optionList` dominates | 95%+ of variant families |

### Conditional GO — Pilot launch (recommended)

**Proceed** with a **curated pilot** of **40–50 single-SKU products** (~12% of DJI catalog):

| Pilot category | SKUs available today | Priority |
|----------------|---------------------|----------|
| DJI accessories (OEM singles) | ~32 | High |
| Drone batteries | 6 | High (verify UN38.3 / DG labels manually) |
| Drone propellers | 4 | Medium |
| Charging accessories | 1 | Low |

**Pilot rules**

1. Classify every SKU via `get-product-detail` before import — block **B** at publish gate.
2. Enforce **one SKU per `groupItemNo`** for A-caution lines.
3. Publish as **draft** first; manual QA on title, HS code, barcode.
4. Cap pilot at **50 live products** until Phase 2 ships.

### Path to full GO

| Milestone | Effort | Unblocks |
|-----------|--------|----------|
| **PR-V0** mapper fix | ✅ Done | Correct variant metadata |
| **Publish gate** — block B families | 0.5 day | Safe pilot enforcement |
| **PR-V2** — `optionList` multi-variant publish | ~3.5 days | **88% of DJI catalog** |
| **PR-V1** — family dedup | ~2 days | Color `modelList` lines (minor for DJI) |

**Full GO target:** Phase 2 complete → re-classify catalog → expect **>85%** import-ready.

---

## Launch Decision Matrix

| Launch type | Verdict | Products | Timeline |
|-------------|---------|----------|----------|
| Full DJI catalog (362 SKUs) | **NO-GO** | 317 blocked | After PR-V2 |
| Category launch (batteries, props, enterprise) | **NO-GO** | 83–100% blocked per category | After PR-V2 |
| Pilot (40–50 single-SKU) | **GO** | 43 confirmed safe | **Now** |
| Enterprise / Matrice line | **NO-GO** | 0 safe | After PR-V2 |

---

## Immediate Actions

1. **Export pilot SKU list** — filter `scripts/eurodrone-category-output.json` where `import_readiness === "safe_today"` (43 items).
2. **Add publish gate** — reject `variant_class === "B"` in `publish-sunsky-to-shopify`.
3. **Prioritize PR-V2** over PR-V1 for EuroDroneParts — DJI catalog is `optionList`-heavy.
4. **Expand crawl** — add iFlight, GEPRC, T-Motor brand filters when available on Sunsky account.
5. **Fix keyword search** — investigate Sunsky `search.do` ignoring `keywords` for non-brand queries.

---

## Related Documents

- [SUNSKY_CATALOG_CLASSIFICATION.md](./SUNSKY_CATALOG_CLASSIFICATION.md) — A vs B catalog-wide analysis
- [SUNSKY_VARIANT_STATUS.md](./SUNSKY_VARIANT_STATUS.md) — PR-V0/V1/V2 status
- [SUNSKY_VARIANT_ARCHITECTURE.md](./SUNSKY_VARIANT_ARCHITECTURE.md) — `optionList` vs `modelList` mapping
- [VARIANT_VALIDATION_REPORT.md](./VARIANT_VALIDATION_REPORT.md) — Mapper validation

---

## Appendix: Re-run

```bash
node scripts/classify-eurodrone-categories.mjs
# Output: scripts/eurodrone-category-output.json

# Extract pilot-ready SKUs
node -e "
const r=require('./scripts/eurodrone-category-output.json');
const safe=r.products.filter(p=>p.import_readiness==='safe_today');
console.log('Pilot SKUs:', safe.length);
safe.forEach(p=>console.log(p.item_no, p.title.slice(0,70)));
"
```
