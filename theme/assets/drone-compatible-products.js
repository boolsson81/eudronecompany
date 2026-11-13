/**
 * Automatiska tillbehör/reservdelar på drönarsidor.
 *
 * Hämtar en kollektionssida (t.ex. Drone Accessories), läser vilka värden filtret
 * "Passar till" (custom.passsar_till) har och väljer de som matchar drönarens
 * modellnamn (titel, custom.modell, seo.drone_tillbehor_modell). Därefter hämtas
 * den filtrerade kollektionssidan och dess produktrutnät återanvänds.
 *
 * Sektionen döljs tyst om filtret saknas, inget matchar eller något går fel.
 */
(function () {
  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\bdji\b/g, ' ')
      .replace(/[^a-z0-9åäö+]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Väljer de filtervärden som förekommer som hela ord i någon kandidatsträng.
  // Bara de längsta träffarna behålls ("Mini 3 Pro" slår "Mini 3", "Neo 2" slår "Neo").
  function matchModels(values, candidates) {
    var hay = candidates.map(function (c) {
      return ' ' + normalize(c) + ' ';
    });
    var hits = [];
    values.forEach(function (value) {
      var norm = normalize(value);
      if (!norm) return;
      var needle = ' ' + norm + ' ';
      var found = hay.some(function (h) {
        return h.indexOf(needle) !== -1;
      });
      if (found) hits.push({ value: value, norm: norm });
    });
    return hits
      .filter(function (a) {
        return !hits.some(function (b) {
          return b !== a && b.norm.length > a.norm.length && (' ' + b.norm + ' ').indexOf(' ' + a.norm + ' ') !== -1;
        });
      })
      .map(function (h) {
        return h.value;
      });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalize: normalize, matchModels: matchModels };
  }
  if (typeof customElements === 'undefined' || customElements.get('drone-compatible-products')) return;

  class DroneCompatibleProducts extends HTMLElement {
    connectedCallback() {
      this.init().catch(function () {
        // Tyst på avsikt: ett saknat filter eller ett misslyckat anrop ska inte synas för kunden.
      });
    }

    async init() {
      var collectionUrl = this.dataset.collectionUrl;
      var candidates = (this.dataset.candidates || '').split('||').filter(Boolean);
      var limit = parseInt(this.dataset.limit, 10) || 8;
      var currentUrl = this.dataset.currentProductUrl;

      if (!collectionUrl || candidates.length === 0) return this.hide();

      var baseDoc = await this.fetchDoc(collectionUrl);
      var param = this.findFilterParam(baseDoc);
      if (!param) return this.hide();

      var values = Array.prototype.slice
        .call(baseDoc.querySelectorAll('input[name="' + param + '"]'))
        .map(function (input) {
          return input.value;
        });
      var models = matchModels(values, candidates);
      if (models.length === 0) return this.hide();

      var query = models
        .map(function (m) {
          return encodeURIComponent(param) + '=' + encodeURIComponent(m);
        })
        .join('&');
      var doc = await this.fetchDoc(collectionUrl + '?' + query);
      var grid = doc.getElementById('product-grid');
      var target = this.querySelector('.drone-compatible-products__grid');
      if (!grid || !target) return this.hide();

      var items = Array.prototype.slice.call(grid.querySelectorAll(':scope > li'));
      if (currentUrl) {
        items = items.filter(function (item) {
          return item.innerHTML.indexOf(currentUrl) === -1;
        });
      }
      items = items.slice(0, limit);
      if (!items.length) return this.hide();

      target.innerHTML = items
        .map(function (item) {
          return item.outerHTML;
        })
        .join('');
      this.setAttribute('data-loaded', '');
    }

    hide() {
      this.setAttribute('data-empty', '');
    }

    async fetchDoc(url) {
      var response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) throw new Error('drone-compatible-products: fetch failed');
      return new DOMParser().parseFromString(await response.text(), 'text/html');
    }

    findFilterParam(doc) {
      var input = doc.querySelector('input[name*="passsar_till"]');
      return input ? input.getAttribute('name') : null;
    }
  }

  customElements.define('drone-compatible-products', DroneCompatibleProducts);
})();
