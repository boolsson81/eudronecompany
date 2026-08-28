#!/usr/bin/env python3
"""Validerar shopify-theme/horizon/templates mot det publicerade Horizon-temats
inventering av sektioner och block. Inventeringen är hämtad via Admin API
(themes -> files) 2026-08-28 och listas nedan så att kontrollen kan köras utan
nätverksåtkomst. Uppdatera listorna om temat ändras."""
import json, glob, os, sys, collections

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..",
                    "shopify-theme", "horizon", "templates")

LIVE_SECTIONS = {
    "product-information", "product-recommendations", "main-collection", "related-products",
    "enterprise-quote-form", "main-product", "main-collection-product-grid",
    "main-collection-banner", "multicolumn", "collapsible-content", "featured-collection",
    "edp-drone-accessories-link", "edp-page-content", "edp-utility-bar", "rich-text",
    "product-list", "collection-links", "hero", "carousel", "media-with-content",
}
LIVE_BLOCKS = {
    "_accordion-row", "_card", "_content", "_divider", "_product-card", "_product-card-gallery",
    "_product-details", "_product-media-gallery", "accelerated-checkout", "accordion",
    "add-to-cart", "button", "buy-buttons", "collection-card", "collection-title", "custom-liquid",
    "disclosures", "email-signup", "featured-collection", "filters", "group", "icon", "image",
    "menu", "page", "price", "product-card", "product-custom-property", "product-description",
    "product-inventory", "product-recommendations", "product-title", "quantity", "review",
    "sku", "spacer", "swatches", "text", "variant-picker", "video",
}
# blocks/_product-details.liquid -> "blocks" (utöver @theme/@app)
DETAILS_CHILDREN = {
    "text", "icon", "image", "button", "video", "group", "spacer", "accordion",
    "product-recommendations", "price", "variant-picker", "buy-buttons", "product-description",
    "review", "accelerated-checkout", "_divider", "product-inventory", "product-custom-property",
    "custom-liquid",  # publikt temablock, täcks av @theme
}
ICONS = {
    "none", "apple", "arrow", "banana", "bottle", "box", "carrot", "chat_bubble", "check_box",
    "clipboard", "dairy", "dairy_free", "dryer", "eye", "fire", "gluten_free", "heart", "iron",
    "leaf", "leather", "lightning_bolt", "lipstick", "lock", "map_pin", "nut_free", "pants",
    "paw_print", "pepper", "perfume", "plane", "plant", "price_tag", "question_mark", "recycle",
    "return", "ruler", "serving_dish", "shirt", "shoe", "silhouette", "snowflake", "star",
    "stopwatch", "truck", "washing",
}
# id:n bekräftade mot respektive schema i det publicerade temat
SCHEMA_IDS = {
    "accordion": {"icon", "dividers", "divider_color", "type_preset", "background_color",
                  "text_color", "border", "border_width", "border_opacity", "border_color",
                  "border_radius", "padding-block-start", "padding-block-end",
                  "padding-inline-start", "padding-inline-end"},
    "custom-liquid": {"custom_liquid"},
    "icon": {"icon", "image_upload", "width", "link", "open_in_new_tab", "icon_color"},
    "main-collection": {"layout_type", "product_card_size", "mobile_product_card_size",
                        "enable_infinite_scroll", "products_per_page", "product_grid_width",
                        "full_width_on_mobile", "columns_gap_horizontal", "columns_gap_vertical",
                        "padding-inline-start", "padding-inline-end",
                        "background_color", "padding-block-start", "padding-block-end"},
    "product-recommendations": {"product", "recommendation_type", "layout_type",
                                "carousel_on_mobile", "max_products", "columns", "mobile_columns",
                                "columns_gap", "rows_gap", "icons_style", "icons_shape",
                                "section_width", "gap", "background_color",
                                "padding-block-start", "padding-block-end"},
}

errors = []

def ordered(blocks):
    """Statiska block renderas av sektionen själv och ingår inte i block_order."""
    return {k: v for k, v in blocks.items() if not v.get("static")}


def walk_blocks(path, container, blocks, allowed=None):
    for bid, blk in blocks.items():
        bt = blk.get("type")
        if bt not in LIVE_BLOCKS:
            errors.append(f"{path}: block '{bid}' -> typen '{bt}' finns inte i temat")
            continue
        if allowed is not None and bt not in allowed:
            errors.append(f"{path}: block '{bid}' ({bt}) är inte tillåtet i {container}")
        s = blk.get("settings", {})
        if bt in SCHEMA_IDS:
            for k in s:
                if k not in SCHEMA_IDS[bt]:
                    errors.append(f"{path}: {bt}.{bid} -> okänd inställning '{k}'")
        if "text" in s and bt in ("text", "_accordion-row"):
            t = s["text"].strip()
            # Shopifys richtext-fält: varje toppnivånod måste vara p/ul/ol/h1-h6.
            # Gäller även när värdet bara är Liquid — det måste omslutas av en tagg.
            # Tom sträng avvisas; utelämna inställningen i stället.
            if not t:
                errors.append(f"{path}: {bid} -> tom text-inställning; utelämna den i stället")
            elif not any(t.startswith(f"<{tag}") for tag in
                         ("p", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6")):
                errors.append(f"{path}: {bid} -> text måste börja med <p>/<ul>/<ol>/<h1>-<h6>")
        if bt == "icon" and s.get("icon") not in ICONS:
            errors.append(f"{path}: {bid} -> okänt ikonnamn '{s.get('icon')}'")
        child = blk.get("blocks", {})
        order = blk.get("block_order")
        if order is not None and sorted(order) != sorted(ordered(child)):
            errors.append(f"{path}: {bid} -> block_order stämmer inte med blocks")
        if child:
            walk_blocks(path, f"{bt}.{bid}",
                        child, DETAILS_CHILDREN if bt == "_product-details" else None)

for f in sorted(glob.glob(os.path.join(ROOT, "*.json"))):
    name = os.path.basename(f)
    doc = json.load(open(f, encoding="utf-8"))
    if sorted(doc.get("order", [])) != sorted(doc["sections"]):
        errors.append(f"{name}: order stämmer inte med sections")
    for sid, sec in doc["sections"].items():
        st = sec.get("type")
        if st not in LIVE_SECTIONS:
            errors.append(f"{name}: sektion '{sid}' -> typen '{st}' finns inte i temat")
        if st in SCHEMA_IDS:
            for k in sec.get("settings", {}):
                if k not in SCHEMA_IDS[st]:
                    errors.append(f"{name}: {st}.{sid} -> okänd inställning '{k}'")
        order = sec.get("block_order")
        if order is not None and sorted(order) != sorted(ordered(sec.get("blocks", {}))):
            errors.append(f"{name}: {st}.{sid} -> block_order stämmer inte med blocks")
        walk_blocks(name, st, sec.get("blocks", {}))

n = len(glob.glob(os.path.join(ROOT, "*.json")))
print(f"{n} mallar kontrollerade")
if errors:
    print(f"\n{len(errors)} FEL:")
    for e in errors: print("  -", e)
    sys.exit(1)
print("Alla sektions- och blocktyper finns i det publicerade temat, "
      "block_order stämmer, inställnings-id och ikonnamn validerar.")
