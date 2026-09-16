/**
 * Payload Finder — 5-step wizard + weighted scoring model.
 *
 * Data source: the JSON island rendered by edp-payload-finder.liquid
 * (#edp-finder-data), which mirrors data/edp-payload-taxonomy.json's
 * `finder` vocabulary plus the live payload_category / mission /
 * uav_platform metaobjects.
 *
 * Scoring model — weights match data/edp-payload-taxonomy.json:
 *   compatibility 30, mission 25, sensor 20, environment 10,
 *   performance 10, requirements 5.
 *
 * Only "sensor", "mission" and "environment" can be computed from real
 * seeded data today (category.technology + mission tasks/industry/
 * environments). "compatibility", "performance" and "requirements" have
 * no per-platform or per-product data at category level yet, so they use
 * a fixed, disclosed neutral baseline instead of a fabricated score — see
 * NEUTRAL_* constants below and the "compatibility needs confirmation"
 * note always shown in the result card. This intentionally caps every
 * result below the "Excellent Match" band until real compatibility data
 * exists (see docs/reports/ENTERPRISE_PAYLOAD_PHASE3_REPORT.md).
 */
(function () {
  "use strict";

  var NEUTRAL_COMPAT_WITH_PLATFORM = 50;
  var NEUTRAL_COMPAT_NO_PLATFORM = 70;
  var NEUTRAL_PERFORMANCE = 70;
  var NEUTRAL_REQUIREMENTS = 70;
  var RESULTS_TO_SHOW = 5;

  function emitAnalytics(name, detail) {
    try {
      window.dispatchEvent(new CustomEvent("edp:analytics", { detail: Object.assign({ event: name }, detail || {}) }));
    } catch (e) {
      /* analytics must never break the wizard */
    }
  }

  function intersects(a, b) {
    if (!a || !b || !a.length || !b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (b.indexOf(a[i]) !== -1) return true;
    }
    return false;
  }

  function scoreBand(score, bands) {
    for (var i = 0; i < bands.length; i++) {
      if (score >= bands[i].min) return bands[i].label;
    }
    return bands[bands.length - 1].label;
  }

  function computeScores(data, answers) {
    var weights = data.scoring_weights;
    var results = [];

    data.categories.forEach(function (category) {
      var relatedMissions = data.missions.filter(function (m) {
        return category.technology && m.technologies && m.technologies.indexOf(category.technology) !== -1;
      });

      // Sensor suitability: does the category's core technology match what the user picked?
      var sensorScore;
      if (!answers.technologies.length) {
        sensorScore = 70;
      } else if (category.technology && answers.technologies.indexOf(category.technology) !== -1) {
        sensorScore = 100;
      } else {
        sensorScore = 30;
      }

      // Mission suitability: among missions linked to this category's technology,
      // how well do task + industry match the user's answers?
      var missionScore;
      if (!relatedMissions.length) {
        missionScore = 20;
      } else {
        var taskHit = answers.task && relatedMissions.some(function (m) { return m.tasks && m.tasks.indexOf(answers.task) !== -1; });
        var industryHit = answers.industry && relatedMissions.some(function (m) { return m.industry === answers.industry; });
        if (taskHit && industryHit) missionScore = 100;
        else if (taskHit || industryHit) missionScore = 65;
        else missionScore = 40;
      }

      // Environmental suitability: do any related missions cover the picked environments?
      var envScore;
      if (!relatedMissions.length) {
        envScore = 60;
      } else if (!answers.environments.length) {
        envScore = 70;
      } else {
        var envHit = relatedMissions.some(function (m) { return intersects(m.environments || [], answers.environments); });
        envScore = envHit ? 100 : 40;
      }

      // Compatibility: never asserted at category level (no per-platform data
      // exists here yet) — a disclosed neutral baseline, not a claim.
      var compatScore = answers.platform ? NEUTRAL_COMPAT_WITH_PLATFORM : NEUTRAL_COMPAT_NO_PLATFORM;

      var total =
        (compatScore * weights.compatibility +
          missionScore * weights.mission +
          sensorScore * weights.sensor +
          envScore * weights.environment +
          NEUTRAL_PERFORMANCE * weights.performance +
          NEUTRAL_REQUIREMENTS * weights.requirements) /
        100;

      results.push({
        category: category,
        total: Math.round(total),
        breakdown: {
          compatibility: compatScore,
          mission: missionScore,
          sensor: sensorScore,
          environment: envScore,
          performance: NEUTRAL_PERFORMANCE,
          requirements: NEUTRAL_REQUIREMENTS,
        },
        relatedMissionCount: relatedMissions.length,
      });
    });

    results.sort(function (a, b) { return b.total - a.total; });
    return results;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "class") node.className = attrs[key];
      else if (key === "html") node.innerHTML = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      if (child) node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function initFinder(root) {
    var dataEl = document.getElementById("edp-finder-data");
    if (!dataEl) return;
    var data;
    try {
      data = JSON.parse(dataEl.textContent);
    } catch (e) {
      return;
    }
    // Liquid renders an unset list field as JSON null — normalize to [] so
    // the scoring logic below can safely call .indexOf()/.some() on them.
    data.missions.forEach(function (m) {
      m.tasks = m.tasks || [];
      m.technologies = m.technologies || [];
      m.environments = m.environments || [];
    });

    var quoteLink = root.getAttribute("data-quote-link") || "/pages/contact-quote";
    var answers = { task: null, industry: null, environments: [], technologies: [], platform: null };
    var step = 0;
    var started = false;

    var steps = [
      { key: "task", title: "Vad vill du göra?", type: "single", options: data.vocab.tasks },
      { key: "industry", title: "Vilken bransch arbetar du inom?", type: "single", options: data.vocab.industries },
      { key: "environments", title: "I vilken miljö ska payloaden användas?", type: "multi", options: data.vocab.environments },
      { key: "technologies", title: "Vilken sensorteknik är relevant?", type: "multi", options: data.vocab.technologies },
      { key: "platform", title: "Vilken UAV-plattform planerar du att använda?", type: "platform", options: data.platforms },
    ];

    function progress() {
      return el("div", { class: "edp-finder__progress" }, [
        el("div", { class: "edp-finder__progress-bar" }, [
          el("div", { class: "edp-finder__progress-fill", style: "width:" + Math.round(((step + 1) / (steps.length + 1)) * 100) + "%" }),
        ]),
        el("p", { class: "edp-finder__progress-label" }, ["Steg " + Math.min(step + 1, steps.length) + " av " + steps.length]),
      ]);
    }

    function renderStep() {
      if (!started) {
        started = true;
        emitAnalytics("payload_finder_started");
      }
      root.innerHTML = "";
      var current = steps[step];
      var wrap = el("div", { class: "edp-finder__step" });
      wrap.appendChild(progress());
      wrap.appendChild(el("h2", { class: "edp-finder__step-title" }, [current.title]));

      var list = el("div", { class: "edp-finder__options" });
      if (current.type === "platform") {
        current.options.forEach(function (platform) {
          list.appendChild(optionButton(platform.name + (platform.manufacturer ? " (" + platform.manufacturer + ")" : ""), answers.platform === platform.handle, function () {
            answers.platform = platform.handle;
            renderStep();
          }));
        });
        list.appendChild(optionButton("Osäker / annan plattform", answers.platform === "" , function () {
          answers.platform = "";
          renderStep();
        }));
      } else if (current.type === "single") {
        current.options.forEach(function (opt) {
          list.appendChild(optionButton(opt.label, answers[current.key] === opt.key, function () {
            answers[current.key] = opt.key;
            goNext();
          }));
        });
      } else {
        current.options.forEach(function (opt) {
          var active = answers[current.key].indexOf(opt.key) !== -1;
          list.appendChild(optionButton(opt.label, active, function () {
            var idx = answers[current.key].indexOf(opt.key);
            if (idx === -1) answers[current.key].push(opt.key);
            else answers[current.key].splice(idx, 1);
            renderStep();
          }));
        });
      }
      wrap.appendChild(list);

      var nav = el("div", { class: "edp-finder__nav" });
      if (step > 0) {
        var backBtn = el("button", { type: "button", class: "button button--secondary" }, ["Tillbaka"]);
        backBtn.addEventListener("click", function () {
          step -= 1;
          renderStep();
        });
        nav.appendChild(backBtn);
      }
      if (current.type !== "single") {
        // single-select advances immediately when an option is clicked
        var nextBtn = el("button", { type: "button", class: "button" }, [step === steps.length - 1 ? "Visa resultat" : "Nästa"]);
        nextBtn.addEventListener("click", goNext);
        nav.appendChild(nextBtn);
      }
      wrap.appendChild(nav);
      root.appendChild(wrap);
    }

    function optionButton(label, active, onClick) {
      var btn = el("button", { type: "button", class: "edp-finder__option" + (active ? " is-active" : "") }, [label]);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.addEventListener("click", onClick);
      return btn;
    }

    function goNext() {
      if (step < steps.length - 1) {
        step += 1;
        renderStep();
      } else {
        renderResults();
      }
    }

    function renderResults() {
      var scored = computeScores(data, answers).slice(0, RESULTS_TO_SHOW);
      emitAnalytics("payload_finder_completed", {
        task: answers.task,
        industry: answers.industry,
        platform: answers.platform,
        top_category: scored[0] ? scored[0].category.handle : null,
      });

      root.innerHTML = "";
      var wrap = el("div", { class: "edp-finder__results" });
      wrap.appendChild(el("h2", { class: "edp-finder__step-title" }, ["Rekommenderade payload-kategorier"]));
      wrap.appendChild(
        el("p", { class: "edp-payload__prose" }, [
          "Baserat på dina svar. Kompatibilitet med vald plattform, exakta prestandavärden och pris bekräftas alltid av vårt enterprise-team innan offert.",
        ])
      );

      scored.forEach(function (result) {
        var band = scoreBand(result.total, data.score_bands);
        var card = el("div", { class: "edp-finder__result" });
        card.appendChild(
          el("div", { class: "edp-finder__result-head" }, [
            el("a", { href: result.category.url, class: "edp-finder__result-title" }, [result.category.name]),
            el("span", { class: "edp-badge" }, [result.total + "% · " + band]),
          ])
        );
        if (result.category.short_description) {
          card.appendChild(el("p", { class: "edp-payload__card-text" }, [result.category.short_description]));
        }
        card.appendChild(breakdownList(result.breakdown, data.scoring_weights));
        if (answers.platform !== "") {
          card.appendChild(
            el("p", { class: "edp-compat__unknown-note" }, [
              "Kompatibilitet med vald plattform behöver bekräftas av vårt enterprise-team.",
            ])
          );
        }
        var cta = el("div", { class: "edp-cta-row" }, [
          el("a", { href: result.category.url, class: "button button--secondary" }, ["Visa kategori"]),
          el("a", { href: quoteLink, class: "button" }, ["Begär Enterprise-offert"]),
        ]);
        card.appendChild(cta);
        wrap.appendChild(card);
      });

      var restart = el("button", { type: "button", class: "button button--secondary edp-finder__restart" }, ["Börja om"]);
      restart.addEventListener("click", function () {
        answers = { task: null, industry: null, environments: [], technologies: [], platform: null };
        step = 0;
        started = false;
        renderStep();
      });
      wrap.appendChild(restart);
      root.appendChild(wrap);
    }

    function breakdownList(breakdown, weights) {
      var list = el("ul", { class: "edp-finder__breakdown" });
      var labels = {
        compatibility: "Kompatibilitet",
        mission: "Uppdragslämplighet",
        sensor: "Sensorlämplighet",
        environment: "Miljölämplighet",
        performance: "Teknisk prestanda",
        requirements: "Kundkrav",
      };
      Object.keys(labels).forEach(function (key) {
        list.appendChild(
          el("li", {}, [labels[key] + " (" + weights[key] + "%): " + breakdown[key] + "/100"])
        );
      });
      return list;
    }

    renderStep();
  }

  function boot() {
    var root = document.getElementById("edp-finder-root");
    if (root) initFinder(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
