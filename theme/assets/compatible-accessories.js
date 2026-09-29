/**
 * STEG 16 — "Passande tillbehör".
 *
 * Fetches the Drone Accessories collection page filtered to this
 * product's own compatible drone model(s) and reuses its rendered
 * product grid, so accessory suggestions always come from live
 * compatibility data (custom.passsar_till) instead of a hardcoded
 * product-to-product relation.
 *
 * Fails silently at every step: if Search & Discovery filtering for
 * "Passar till" isn't enabled yet, or the fetch fails, the section
 * simply stays hidden (see [data-empty] in the section's <style>).
 */
(function () {
  if (customElements.get('compatible-accessories')) return;

  class CompatibleAccessories extends HTMLElement {
    connectedCallback() {
      this.init().catch(function () {
        // Swallow errors on purpose: an unavailable filter or a failed
        // fetch should never surface a JS error to the shopper.
      });
    }

    async init() {
      var collectionUrl = this.dataset.collectionUrl;
      var models = (this.dataset.models || '').split('||').filter(Boolean);
      var limit = parseInt(this.dataset.limit, 10) || 8;
      var currentProductUrl = this.dataset.currentProductUrl;

      if (!collectionUrl || models.length === 0) {
        this.setAttribute('data-empty', '');
        return;
      }

      var baseHtml = await this.fetchText(collectionUrl);
      var paramName = this.extractFilterParamName(baseHtml);
      if (!paramName) {
        this.setAttribute('data-empty', '');
        return;
      }

      var params = models
        .map(function (model) {
          return encodeURIComponent(paramName) + '=' + encodeURIComponent(model);
        })
        .join('&');
      var filteredUrl = collectionUrl + '?' + params;

      var filteredHtml = await this.fetchText(filteredUrl);
      var items = this.extractGridItems(filteredHtml, currentProductUrl, limit);

      var grid = this.querySelector('.compatible-accessories__grid');
      if (!items.length || !grid) {
        this.setAttribute('data-empty', '');
        return;
      }

      grid.innerHTML = items.join('');
      this.setAttribute('data-loaded', '');
    }

    async fetchText(url) {
      var response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) throw new Error('compatible-accessories: fetch failed');
      return response.text();
    }

    extractFilterParamName(html) {
      var match = html.match(/name="(filter[^"]*passsar_till[^"]*)"/);
      return match ? match[1] : null;
    }

    extractGridItems(html, currentProductUrl, limit) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var grid = doc.getElementById('product-grid');
      if (!grid) return [];

      var items = Array.prototype.slice.call(grid.querySelectorAll(':scope > li'));

      if (currentProductUrl) {
        items = items.filter(function (item) {
          return item.innerHTML.indexOf(currentProductUrl) === -1;
        });
      }

      return items.slice(0, limit).map(function (item) {
        return item.outerHTML;
      });
    }
  }

  customElements.define('compatible-accessories', CompatibleAccessories);
})();
