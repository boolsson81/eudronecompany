/**
 * Payload comparison — shared logic for:
 *  1) the "Lägg till i jämförelse" tray embedded on payload product pages
 *     (edp-payload-details.liquid), which persists selected product handles
 *     to localStorage (per-viewer only, never sent to Shopify or Claude);
 *  2) the comparison table page (edp-payload-comparison.liquid), which reads
 *     that list and fetches each product's real data via Shopify's Section
 *     Rendering API (GET /products/<handle>?section_id=edp-comparison-row) —
 *     no Storefront API token needed, and every value is genuine product/
 *     metafield data rendered server-side, never guessed client-side.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "edp_compare_handles";
  var MAX_COMPARE = 4;

  function readHandles() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function writeHandles(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      /* private browsing / storage disabled — comparison just won't persist */
    }
  }

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

  // ---- Part 1: "add to compare" tray, embedded on the product page ----
  function initTray(button) {
    var handle = button.getAttribute("data-edp-compare-add");
    var tray = document.createElement("div");
    tray.className = "edp-compare-tray";
    document.body.appendChild(tray);

    function render() {
      var handles = readHandles();
      var isSelected = handles.indexOf(handle) !== -1;
      button.textContent = isSelected ? "I jämförelsen ✓" : "Lägg till i jämförelse";
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");

      tray.innerHTML = "";
      if (!handles.length) {
        tray.style.display = "none";
        return;
      }
      tray.style.display = "flex";
      tray.appendChild(el("span", { class: "edp-compare-tray__count" }, [handles.length + " i jämförelsen"]));
      var link = el("a", { href: "/pages/jamfor-payloads", class: "button" }, ["Jämför"]);
      tray.appendChild(link);
      var clear = el("button", { type: "button", class: "button button--secondary" }, ["Rensa"]);
      clear.addEventListener("click", function () {
        writeHandles([]);
        render();
      });
      tray.appendChild(clear);
    }

    button.addEventListener("click", function () {
      var handles = readHandles();
      var idx = handles.indexOf(handle);
      if (idx !== -1) {
        handles.splice(idx, 1);
      } else {
        if (handles.length >= MAX_COMPARE) handles.shift();
        handles.push(handle);
        emitAnalytics("product_added_to_comparison", { handle: handle });
      }
      writeHandles(handles);
      render();
    });

    render();
  }

  // ---- Part 2: the comparison page ----
  var FIELDS = [
    { key: "sensor_type", label: "Sensortyp" },
    { key: "sensor_resolution", label: "Sensorupplösning" },
    { key: "thermal_resolution", label: "Termisk upplösning" },
    { key: "optical_zoom", label: "Optisk zoom", suffix: "×" },
    { key: "weight", label: "Vikt" },
    { key: "ip_rating", label: "IP-klass" },
    { key: "operating_temperature", label: "Drifttemperatur" },
    { key: "sdk_available", label: "SDK tillgängligt", boolean: true },
    { key: "compatibility_summary", label: "Kompatibilitet" },
    { key: "lead_time", label: "Leveranstid" },
  ];
  var NOT_SPECIFIED = "Ej specificerat";

  function fetchRow(handle) {
    return fetch("/products/" + encodeURIComponent(handle) + "?section_id=edp-comparison-row")
      .then(function (res) { return res.ok ? res.text() : Promise.reject(new Error("not found")); })
      .then(function (html) {
        var match = html.match(/<script[^>]*data-edp-comparison-row[^>]*>([\s\S]*?)<\/script>/);
        if (!match) throw new Error("no data");
        return JSON.parse(match[1]);
      });
  }

  function formatValue(field, value) {
    if (field.boolean) return value ? "Ja" : NOT_SPECIFIED;
    if (value === null || value === undefined || value === "") return NOT_SPECIFIED;
    return field.suffix ? value + field.suffix : value;
  }

  function initComparisonPage(root) {
    var quoteLink = root.getAttribute("data-quote-link") || "/pages/contact-quote";
    var handles = readHandles();
    if (!handles.length) {
      root.innerHTML = "";
      root.appendChild(
        el("p", { class: "edp-payload__prose" }, [
          "Du har inte lagt till några produkter i jämförelsen ännu. Gå till en payload-produktsida och klicka på \"Lägg till i jämförelse\".",
        ])
      );
      return;
    }

    root.innerHTML = "";
    root.appendChild(el("p", { class: "edp-payload__prose" }, ["Hämtar produktdata …"]));

    Promise.all(
      handles.map(function (handle) {
        return fetchRow(handle).catch(function () { return null; });
      })
    ).then(function (rows) {
      var products = rows.filter(Boolean);
      root.innerHTML = "";
      if (!products.length) {
        root.appendChild(el("p", { class: "edp-payload__prose" }, ["Kunde inte hämta de valda produkterna. De kan ha tagits bort."]));
        return;
      }

      var table = el("table", { class: "edp-payload__spec-table edp-compare-table" });
      var headRow = el("tr", {}, [el("th", {}, [""])]);
      products.forEach(function (p) {
        headRow.appendChild(
          el("th", {}, [
            el("a", { href: p.url }, [p.title]),
          ])
        );
      });
      table.appendChild(el("thead", {}, [headRow]));

      var priceRow = el("tr", {}, [el("th", {}, ["Pris"])]);
      products.forEach(function (p) {
        priceRow.appendChild(el("td", {}, [p.requires_quote ? "Kräver offert" : p.price || NOT_SPECIFIED]));
      });
      var tbody = el("tbody", {}, [priceRow]);

      FIELDS.forEach(function (field) {
        var row = el("tr", {}, [el("th", {}, [field.label])]);
        products.forEach(function (p) {
          row.appendChild(el("td", {}, [formatValue(field, p[field.key])]));
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      root.appendChild(table);

      var cta = el("div", { class: "edp-cta-row" }, [
        el("a", { href: quoteLink, class: "button" }, ["Begär Enterprise-offert"]),
      ]);
      root.appendChild(cta);
      emitAnalytics("payload_comparison_viewed", { handles: handles });
    });
  }

  function boot() {
    document.querySelectorAll("[data-edp-compare-add]").forEach(initTray);
    var comparisonRoot = document.getElementById("edp-comparison-root");
    if (comparisonRoot) initComparisonPage(comparisonRoot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
