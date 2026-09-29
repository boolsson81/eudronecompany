/**
 * Enterprise Configurator — "Bygg ditt drönarsystem": 8-step wizard that
 * assembles a plain-language configuration summary and hands it to the
 * EXISTING enterprise-quote-form (a Shopify `contact` form) via query
 * params, rather than re-implementing lead capture.
 *
 * Steps: 1 industry, 2 UAV platform, 3 primary payload category (+ optional
 * real product pick), 4 additional payload categories (+ optional real
 * product picks), 5 environments/requirements, 6 software wishlist,
 * 7 service wishlist, 8 review & send.
 *
 * Steps 2-4 render real products when the data has them (uav_platform.product,
 * payload_category.featured_products), with image, price and a compatibility
 * badge derived from the same product data edp-compatibility-status.liquid
 * uses (compatible_uav / compatibility_records) — never a guessed match, only
 * what's on the product. Categories/platforms without linked products still
 * work exactly as before (name-only selection for the enterprise team).
 */
(function () {
  "use strict";

  var COMPAT_LABELS = {
    fully_compatible: "Fullt kompatibel",
    compatible_with_adapter: "Kompatibel med adapter",
    compatible_with_integration: "Kompatibel med integration",
    not_compatible: "Ej kompatibel",
    unknown: "Kompatibilitet behöver bekräftas",
  };

  function emitAnalytics(name, detail) {
    try {
      window.dispatchEvent(new CustomEvent("edp:analytics", { detail: Object.assign({ event: name }, detail || {}) }));
    } catch (e) {}
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "class") node.className = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      if (child) node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function labelFor(list, key) {
    var match = list.filter(function (o) { return o.key === key; })[0];
    return match ? match.label : key;
  }

  function indexOfByHandle(list, handle) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].handle === handle) return i;
    }
    return -1;
  }

  // Compatibility status for a category product against a chosen platform
  // handle — mirrors edp-compatibility-status.liquid's fallback order:
  // explicit payload_compatibility record first, then a bare compatible_uav
  // listing ("behöver bekräftas"), else no data at all (null, nothing shown).
  function compatibilityStatus(product, platformHandle) {
    if (!platformHandle) return null;
    var records = product.compatibilityRecords || [];
    for (var i = 0; i < records.length; i++) {
      if (records[i].platform === platformHandle) return records[i].status || "unknown";
    }
    if ((product.compatibleUav || []).indexOf(platformHandle) !== -1) return "unknown";
    return null;
  }

  function compatBadge(product, platformHandle) {
    var status = compatibilityStatus(product, platformHandle);
    if (!status) return null;
    return el("span", { class: "edp-compat__status edp-compat__status--" + status }, [COMPAT_LABELS[status] || COMPAT_LABELS.unknown]);
  }

  function initConfigurator(root) {
    var dataEl = document.getElementById("edp-configurator-data");
    if (!dataEl) return;
    var data;
    try {
      data = JSON.parse(dataEl.textContent);
    } catch (e) {
      return;
    }

    var quotePage = root.getAttribute("data-quote-page") || "/pages/contact-quote";
    var answers = {
      industry: null,
      platform: null,
      primaryCategory: null,
      primaryProduct: null,
      additionalCategories: [],
      additionalProducts: [],
      environments: [],
      software: [],
      services: [],
    };
    var step = 0;

    var steps = [
      { title: "Vilken bransch gäller uppdraget?", render: renderIndustry, type: "single" },
      { title: "Vilken UAV-plattform planerar du att använda?", render: renderPlatform, type: "single" },
      { title: "Vilken payload-kategori är primär?", render: renderPrimaryCategory, type: "single-detail" },
      { title: "Behöver du fler payload-kategorier i samma system?", render: renderAdditionalCategories, type: "multi" },
      { title: "I vilken miljö ska systemet användas?", render: renderEnvironments, type: "multi" },
      { title: "Behöver du mjukvara kopplad till systemet?", render: renderSoftware, type: "multi" },
      { title: "Behöver du installation, utbildning eller service?", render: renderServices, type: "multi" },
      { title: "Sammanfattning", render: renderSummary, type: "summary" },
    ];

    function progress() {
      return el("div", { class: "edp-finder__progress" }, [
        el("div", { class: "edp-finder__progress-bar" }, [
          el("div", { class: "edp-finder__progress-fill", style: "width:" + Math.round(((step + 1) / steps.length) * 100) + "%" }),
        ]),
        el("p", { class: "edp-finder__progress-label" }, ["Steg " + (step + 1) + " av " + steps.length]),
      ]);
    }

    function optionButton(label, active, onClick) {
      var btn = el("button", { type: "button", class: "edp-finder__option" + (active ? " is-active" : "") }, [label]);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.addEventListener("click", onClick);
      return btn;
    }

    // Rich card option for a platform or category product: image (if any),
    // title, meta line and price. Falls back gracefully when there's no image.
    function productOptionCard(product, active, onClick, extraNode) {
      var btn = el("button", { type: "button", class: "edp-finder__option edp-finder__option--card" + (active ? " is-active" : "") });
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      if (product.image) {
        btn.appendChild(el("img", { src: product.image, alt: "", loading: "lazy" }));
      }
      btn.appendChild(el("span", { class: "edp-finder__option-title" }, [product.title]));
      if (product.price) {
        btn.appendChild(el("span", { class: "edp-finder__option-price" }, [product.price]));
      }
      if (extraNode) btn.appendChild(extraNode);
      btn.addEventListener("click", onClick);
      return btn;
    }

    function renderIndustry(container) {
      data.industries.forEach(function (opt) {
        container.appendChild(optionButton(opt.label, answers.industry === opt.key, function () {
          answers.industry = opt.key;
          goNext();
        }));
      });
    }

    function renderPlatform(container) {
      data.platforms.forEach(function (p) {
        var name = p.name + (p.manufacturer ? " (" + p.manufacturer + ")" : "");
        var active = answers.platform === p.handle;
        if (p.product) {
          var card = productOptionCard(
            { title: name, image: p.product.image, price: p.product.price },
            active,
            function () {
              answers.platform = p.handle;
              goNext();
            }
          );
          container.appendChild(card);
        } else {
          container.appendChild(optionButton(name, active, function () {
            answers.platform = p.handle;
            goNext();
          }));
        }
      });
      container.appendChild(optionButton("Osäker / annan plattform", answers.platform === "", function () {
        answers.platform = "";
        goNext();
      }));
    }

    function findCategory(handle) {
      return data.categories.filter(function (c) { return c.handle === handle; })[0] || null;
    }

    // Product grid shown under a chosen category: lets the customer pick a
    // specific real product (optional) instead of only naming the category.
    // `selected` is either a single product object/null (primary, one pick)
    // or an array of product objects (additional categories, multi-pick).
    function renderCategoryProducts(container, category, selected, onToggle) {
      if (!category.products || !category.products.length) {
        container.appendChild(el("p", { class: "edp-configurator__hint" }, [
          "Inga utvalda produkter registrerade ännu för " + category.name.toLowerCase() + " — vårt enterprise-team hjälper dig hitta rätt produkt.",
        ]));
        return;
      }
      container.appendChild(el("p", { class: "edp-configurator__subheading" }, ["Välj produkt i " + category.name + " (valfritt)"]));
      var grid = el("div", { class: "edp-configurator__products" });
      category.products.forEach(function (product) {
        var isActive = Array.isArray(selected)
          ? selected.some(function (s) { return s.handle === product.handle; })
          : !!(selected && selected.handle === product.handle);
        var badge = compatBadge(product, answers.platform);
        var card = productOptionCard(product, isActive, function () {
          onToggle(product);
          renderStep();
        }, badge);
        grid.appendChild(card);
      });
      container.appendChild(grid);
    }

    function renderPrimaryCategory(container) {
      data.categories.forEach(function (c) {
        container.appendChild(optionButton(c.name, answers.primaryCategory === c.handle, function () {
          if (answers.primaryCategory !== c.handle) {
            answers.primaryCategory = c.handle;
            answers.primaryProduct = null;
            emitAnalytics("product_added_to_configuration", { handle: c.handle, role: "primary" });
          }
          renderStep();
        }));
      });
      if (answers.primaryCategory) {
        var category = findCategory(answers.primaryCategory);
        if (category) {
          renderCategoryProducts(container, category, answers.primaryProduct, function (product) {
            var already = answers.primaryProduct && answers.primaryProduct.handle === product.handle;
            answers.primaryProduct = already ? null : product;
            if (!already) {
              emitAnalytics("product_added_to_configuration", { handle: product.handle, role: "primary-product" });
            }
          });
        }
      }
    }

    function renderAdditionalCategories(container) {
      var chosenCategories = data.categories.filter(function (c) {
        return c.handle !== answers.primaryCategory && answers.additionalCategories.indexOf(c.handle) !== -1;
      });

      data.categories
        .filter(function (c) { return c.handle !== answers.primaryCategory; })
        .forEach(function (c) {
          var active = answers.additionalCategories.indexOf(c.handle) !== -1;
          container.appendChild(optionButton(c.name, active, function () {
            var idx = answers.additionalCategories.indexOf(c.handle);
            if (idx === -1) {
              answers.additionalCategories.push(c.handle);
              emitAnalytics("product_added_to_configuration", { handle: c.handle, role: "additional" });
            } else {
              answers.additionalCategories.splice(idx, 1);
              var categoryHandles = (findCategory(c.handle) || { products: [] }).products.map(function (p) { return p.handle; });
              answers.additionalProducts = answers.additionalProducts.filter(function (p) { return categoryHandles.indexOf(p.handle) === -1; });
            }
            renderStep();
          }));
        });

      chosenCategories.forEach(function (category) {
        renderCategoryProducts(container, category, answers.additionalProducts, function (product) {
          var idx = indexOfByHandle(answers.additionalProducts, product.handle);
          if (idx === -1) {
            answers.additionalProducts.push(product);
            emitAnalytics("product_added_to_configuration", { handle: product.handle, role: "additional-product" });
          } else {
            answers.additionalProducts.splice(idx, 1);
          }
        });
      });
    }

    function renderEnvironments(container) {
      data.environments.forEach(function (opt) {
        var active = answers.environments.indexOf(opt.key) !== -1;
        container.appendChild(optionButton(opt.label, active, function () {
          var idx = answers.environments.indexOf(opt.key);
          if (idx === -1) answers.environments.push(opt.key);
          else answers.environments.splice(idx, 1);
          renderStep();
        }));
      });
    }

    function renderSoftware(container) {
      data.software.forEach(function (opt) {
        var active = answers.software.indexOf(opt.key) !== -1;
        container.appendChild(optionButton(opt.label, active, function () {
          var idx = answers.software.indexOf(opt.key);
          if (idx === -1) answers.software.push(opt.key);
          else answers.software.splice(idx, 1);
          renderStep();
        }));
      });
    }

    function renderServices(container) {
      data.services.forEach(function (opt) {
        var active = answers.services.indexOf(opt.key) !== -1;
        container.appendChild(optionButton(opt.label, active, function () {
          var idx = answers.services.indexOf(opt.key);
          if (idx === -1) answers.services.push(opt.key);
          else answers.services.splice(idx, 1);
          renderStep();
        }));
      });
    }

    function platformProductLabel() {
      var platform = data.platforms.filter(function (p) { return p.handle === answers.platform; })[0];
      if (!platform) return null;
      var name = platform.name + (platform.manufacturer ? " (" + platform.manufacturer + ")" : "");
      return platform.product ? name + " — " + platform.product.title + " (" + platform.product.price + ")" : name;
    }

    function productLine(product) {
      var status = compatibilityStatus(product, answers.platform);
      var line = product.title + " (" + (product.price || "Pris ej angivet") + ")";
      if (status) line += " — " + (COMPAT_LABELS[status] || COMPAT_LABELS.unknown);
      return line;
    }

    function buildSummary() {
      var platformLabel = answers.platform ? platformProductLabel() : "Ej valt / osäker";
      var primaryLabel = (data.categories.filter(function (c) { return c.handle === answers.primaryCategory; })[0] || {}).name || "Ej valt";
      var additionalLabels = answers.additionalCategories
        .map(function (h) { return (data.categories.filter(function (c) { return c.handle === h; })[0] || {}).name; })
        .filter(Boolean);

      var lines = [];
      lines.push("Systemkonfiguration från Enterprise Configurator:");
      lines.push("- Bransch: " + (answers.industry ? labelFor(data.industries, answers.industry) : "Ej angiven"));
      lines.push("- UAV-plattform: " + platformLabel);
      lines.push("- Primär payload-kategori: " + primaryLabel);
      if (answers.primaryProduct) lines.push("  Vald produkt: " + productLine(answers.primaryProduct));
      if (additionalLabels.length) lines.push("- Ytterligare payload-kategorier: " + additionalLabels.join(", "));
      answers.additionalProducts.forEach(function (product) {
        lines.push("  Vald produkt: " + productLine(product));
      });
      if (answers.environments.length) lines.push("- Miljö/krav: " + answers.environments.map(function (k) { return labelFor(data.environments, k); }).join(", "));
      if (answers.software.length) lines.push("- Önskad mjukvara: " + answers.software.map(function (k) { return labelFor(data.software, k); }).join(", "));
      if (answers.services.length) lines.push("- Önskade tjänster: " + answers.services.map(function (k) { return labelFor(data.services, k); }).join(", "));
      lines.push("");
      lines.push("Kompatibilitet mellan vald plattform och valda payloads bekräftas av vårt enterprise-team innan offert.");
      return lines.join("\n");
    }

    // Visual recap of the chosen real products (if any were picked) — image,
    // price and the same compatibility badge shown during selection, plus a
    // link back to the product so the customer can double-check it.
    function renderChosenProducts(container) {
      var chosen = [];
      var platform = data.platforms.filter(function (p) { return p.handle === answers.platform; })[0];
      if (platform && platform.product) chosen.push({ product: platform.product, role: "UAV-plattform" });
      if (answers.primaryProduct) chosen.push({ product: answers.primaryProduct, role: "Primär payload" });
      answers.additionalProducts.forEach(function (product) {
        chosen.push({ product: product, role: "Ytterligare payload" });
      });
      if (!chosen.length) return;

      var grid = el("div", { class: "edp-configurator__summary-products" });
      chosen.forEach(function (entry) {
        var card = el("div", { class: "edp-configurator__summary-card" });
        if (entry.product.image) card.appendChild(el("img", { src: entry.product.image, alt: "", loading: "lazy" }));
        card.appendChild(el("span", { class: "edp-payload__eyebrow" }, [entry.role]));
        card.appendChild(el("a", { href: entry.product.url, class: "edp-finder__result-title" }, [entry.product.title]));
        if (entry.product.price) card.appendChild(el("span", { class: "edp-finder__option-price" }, [entry.product.price]));
        var badge = "compatibilityRecords" in entry.product || "compatibleUav" in entry.product ? compatBadge(entry.product, answers.platform) : null;
        if (badge) card.appendChild(badge);
        grid.appendChild(card);
      });
      container.appendChild(grid);
    }

    function renderSummary(container) {
      renderChosenProducts(container);

      var summary = buildSummary();
      var pre = el("pre", { class: "edp-payload__prose edp-configurator__summary" }, [summary]);
      container.appendChild(pre);
      var note = el("p", { class: "edp-compat__unknown-note" }, [
        "Kompatibilitet, pris och leveranstid bekräftas alltid av vårt enterprise-team innan offert lämnas.",
      ]);
      container.appendChild(note);

      var sendBtn = el("a", { href: "#", class: "button" }, ["Skicka till enterprise-team"]);
      sendBtn.addEventListener("click", function (evt) {
        evt.preventDefault();
        emitAnalytics("configuration_completed", {
          industry: answers.industry,
          platform: answers.platform,
          primary_category: answers.primaryCategory,
          primary_product: answers.primaryProduct ? answers.primaryProduct.handle : null,
          additional_categories: answers.additionalCategories,
          additional_products: answers.additionalProducts.map(function (p) { return p.handle; }),
        });
        var url = quotePage + "?prefill_message=" + encodeURIComponent(summary) + "&industry=" + encodeURIComponent(answers.industry || "");
        window.location.href = url;
      });
      container.appendChild(el("div", { class: "edp-cta-row" }, [sendBtn]));
    }

    function renderStep() {
      root.innerHTML = "";
      var current = steps[step];
      var wrap = el("div", { class: "edp-finder__step" });
      wrap.appendChild(progress());
      wrap.appendChild(el("h2", { class: "edp-finder__step-title" }, [current.title]));

      var optionsContainer = el("div", { class: "edp-finder__options" });
      current.render(optionsContainer);
      wrap.appendChild(optionsContainer);

      var nav = el("div", { class: "edp-finder__nav" });
      if (step > 0) {
        var backBtn = el("button", { type: "button", class: "button button--secondary" }, ["Tillbaka"]);
        backBtn.addEventListener("click", function () {
          step -= 1;
          renderStep();
        });
        nav.appendChild(backBtn);
      }
      if (current.type === "multi") {
        var currentKey = { 3: "additionalCategories", 4: "environments", 5: "software", 6: "services" }[step];
        var label = currentKey && answers[currentKey].length ? "Fortsätt" : "Hoppa över";
        var nextBtn = el("button", { type: "button", class: "button" }, [label]);
        nextBtn.addEventListener("click", goNext);
        nav.appendChild(nextBtn);
      } else if (current.type === "single-detail" && answers.primaryCategory) {
        var continueBtn = el("button", { type: "button", class: "button" }, ["Fortsätt"]);
        continueBtn.addEventListener("click", goNext);
        nav.appendChild(continueBtn);
      }
      wrap.appendChild(nav);
      root.appendChild(wrap);
    }

    function goNext() {
      if (step < steps.length - 1) {
        step += 1;
        renderStep();
      }
    }

    renderStep();
  }

  function boot() {
    var root = document.getElementById("edp-configurator-root");
    if (root) initConfigurator(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
