/**
 * Enterprise Configurator — "Bygg ditt drönarsystem": 8-step wizard that
 * assembles a plain-language configuration summary and hands it to the
 * EXISTING enterprise-quote-form (a Shopify `contact` form) via query
 * params, rather than re-implementing lead capture.
 *
 * Steps: 1 industry, 2 UAV platform, 3 primary payload category,
 * 4 additional payload categories, 5 environments/requirements,
 * 6 software wishlist, 7 service wishlist, 8 review & send.
 */
(function () {
  "use strict";

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
    var answers = { industry: null, platform: null, primaryCategory: null, additionalCategories: [], environments: [], software: [], services: [] };
    var step = 0;

    var steps = [
      { title: "Vilken bransch gäller uppdraget?", render: renderIndustry, type: "single" },
      { title: "Vilken UAV-plattform planerar du att använda?", render: renderPlatform, type: "single" },
      { title: "Vilken payload-kategori är primär?", render: renderPrimaryCategory, type: "single" },
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
        container.appendChild(optionButton(p.name + (p.manufacturer ? " (" + p.manufacturer + ")" : ""), answers.platform === p.handle, function () {
          answers.platform = p.handle;
          goNext();
        }));
      });
      container.appendChild(optionButton("Osäker / annan plattform", answers.platform === "", function () {
        answers.platform = "";
        goNext();
      }));
    }

    function renderPrimaryCategory(container) {
      data.categories.forEach(function (c) {
        container.appendChild(optionButton(c.name, answers.primaryCategory === c.handle, function () {
          answers.primaryCategory = c.handle;
          emitAnalytics("product_added_to_configuration", { handle: c.handle, role: "primary" });
          goNext();
        }));
      });
    }

    function renderAdditionalCategories(container) {
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
            }
            renderStep();
          }));
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

    function buildSummary() {
      var platformLabel = answers.platform
        ? (data.platforms.filter(function (p) { return p.handle === answers.platform; })[0] || {}).name
        : "Ej valt / osäker";
      var primaryLabel = (data.categories.filter(function (c) { return c.handle === answers.primaryCategory; })[0] || {}).name || "Ej valt";
      var additionalLabels = answers.additionalCategories
        .map(function (h) { return (data.categories.filter(function (c) { return c.handle === h; })[0] || {}).name; })
        .filter(Boolean);

      var lines = [];
      lines.push("Systemkonfiguration från Enterprise Configurator:");
      lines.push("- Bransch: " + (answers.industry ? labelFor(data.industries, answers.industry) : "Ej angiven"));
      lines.push("- UAV-plattform: " + platformLabel);
      lines.push("- Primär payload-kategori: " + primaryLabel);
      if (additionalLabels.length) lines.push("- Ytterligare payload-kategorier: " + additionalLabels.join(", "));
      if (answers.environments.length) lines.push("- Miljö/krav: " + answers.environments.map(function (k) { return labelFor(data.environments, k); }).join(", "));
      if (answers.software.length) lines.push("- Önskad mjukvara: " + answers.software.map(function (k) { return labelFor(data.software, k); }).join(", "));
      if (answers.services.length) lines.push("- Önskade tjänster: " + answers.services.map(function (k) { return labelFor(data.services, k); }).join(", "));
      lines.push("");
      lines.push("Kompatibilitet mellan vald plattform och valda payloads bekräftas av vårt enterprise-team innan offert.");
      return lines.join("\n");
    }

    function renderSummary(container) {
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
          additional_categories: answers.additionalCategories,
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
