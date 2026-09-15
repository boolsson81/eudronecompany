/*
 * EU Drone Company — paketmall (product.paket.json)
 *
 * 1. Lägger ibockade tillval i varukorgen tillsammans med paketet.
 *    Temats <product-form> skickar formuläret som FormData till /cart/add.js.
 *    Vi hakar på submit i capture-fas (körs före product-form), byter ut
 *    fälten `id`/`quantity` mot Shopifys `items[n][id]`/`items[n][quantity]`
 *    och återställer formuläret direkt efter att händelsen skickats.
 *
 * 2. Visar en summering ("2 tillval valda · +15 029 kr") under tillvalslistan.
 *
 * 3. Får cart-notification att visa paketet även när svaret från /cart/add.js
 *    är en lista med flera rader (då saknas `key` på toppnivån).
 */
(function () {
  'use strict';

  if (window.edpPackageInitialised) return;
  window.edpPackageInitialised = true;

  function formatMoney(cents, format) {
    var amount = Number(cents) || 0;
    var pattern = format || '{{amount}}';
    var match = pattern.match(/\{\{\s*(\w+)\s*\}\}/);
    var key = match ? match[1] : 'amount';
    var decimals = key.indexOf('no_decimals') === -1 ? 2 : 0;
    var thousands = ' ';
    var decimal = ',';
    if (key.indexOf('with_comma_separator') !== -1) {
      thousands = '.';
      decimal = ',';
    } else if (key.indexOf('with_space_separator') !== -1) {
      thousands = ' ';
      decimal = ',';
    } else if (key.indexOf('with_apostrophe_separator') !== -1) {
      thousands = "'";
      decimal = '.';
    } else if (key === 'amount' || key === 'amount_no_decimals') {
      thousands = ',';
      decimal = '.';
    }
    var fixed = (amount / 100).toFixed(decimals);
    var parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
    var value = decimals ? parts[0] + decimal + parts[1] : parts[0];
    return pattern.replace(/\{\{\s*\w+\s*\}\}/, value);
  }

  function selectedAddons(root) {
    return Array.prototype.slice.call(root.querySelectorAll('input[data-edp-addon]:checked:not(:disabled)'));
  }

  function findAddonRoot(form) {
    var section = form.closest('.shopify-section') || form.closest('section') || document;
    return section.querySelector('[data-edp-package-addons]');
  }

  function updateSummary(root) {
    var summary = root.querySelector('[data-edp-addon-summary]');
    if (!summary) return;
    var countEl = summary.querySelector('[data-edp-addon-summary-count]');
    var totalEl = summary.querySelector('[data-edp-addon-summary-total]');
    var addons = selectedAddons(root);
    if (!addons.length) {
      summary.hidden = true;
      return;
    }
    var addonTotal = addons.reduce(function (sum, input) {
      return sum + (Number(input.dataset.price) || 0);
    }, 0);
    var format = root.dataset.moneyFormat;
    var template = addons.length === 1 ? root.dataset.summaryOne : root.dataset.summaryOther;
    countEl.textContent = (template || '{{ count }}')
      .replace('{{ count }}', String(addons.length))
      .replace('{{ amount }}', formatMoney(addonTotal, format));

    var packagePrice = Number(root.dataset.packagePrice) || 0;
    var form = document.querySelector('form[data-type="add-to-cart-form"]');
    var qtyInput = form ? form.elements.namedItem('quantity') : null;
    var qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
    if (packagePrice > 0 && root.dataset.totalLabel) {
      totalEl.textContent = root.dataset.totalLabel.replace('__AMOUNT__', formatMoney(packagePrice * qty + addonTotal, format));
      totalEl.hidden = false;
    } else {
      totalEl.hidden = true;
    }
    summary.hidden = false;
  }

  function addHidden(form, name, value) {
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    input.setAttribute('data-edp-package-temp', '');
    form.appendChild(input);
  }

  function onSubmit(event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement) || form.dataset.type !== 'add-to-cart-form') return;
    var root = findAddonRoot(form);
    if (!root) return;
    var addons = selectedAddons(root);
    if (!addons.length) return;

    var idInput = form.elements.namedItem('id');
    var qtyInput = form.elements.namedItem('quantity');
    if (!idInput || idInput.disabled || !idInput.value) return;

    var quantity = qtyInput && qtyInput.value ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;

    addHidden(form, 'items[0][id]', idInput.value);
    addHidden(form, 'items[0][quantity]', String(quantity));
    addons.forEach(function (input, index) {
      addHidden(form, 'items[' + (index + 1) + '][id]', input.value);
      addHidden(form, 'items[' + (index + 1) + '][quantity]', '1');
    });

    var restoreQty = false;
    idInput.disabled = true;
    if (qtyInput && !qtyInput.disabled) {
      qtyInput.disabled = true;
      restoreQty = true;
    }

    setTimeout(function () {
      idInput.disabled = false;
      if (restoreQty) qtyInput.disabled = false;
      Array.prototype.forEach.call(form.querySelectorAll('[data-edp-package-temp]'), function (el) {
        el.remove();
      });
    }, 0);
  }

  function patchCartNotification() {
    var notification = document.querySelector('cart-notification');
    if (!notification || notification.edpPackagePatched || typeof notification.renderContents !== 'function') return;
    notification.edpPackagePatched = true;
    var original = notification.renderContents.bind(notification);
    notification.renderContents = function (state) {
      if (state && !state.key && Array.isArray(state.items) && state.items.length) {
        state = Object.assign({}, state, { key: state.items[0].key });
      }
      return original(state);
    };
  }

  function init() {
    var roots = document.querySelectorAll('[data-edp-package-addons]');
    Array.prototype.forEach.call(roots, function (root) {
      root.addEventListener('change', function () {
        updateSummary(root);
      });
      updateSummary(root);
    });
    document.addEventListener('change', function (event) {
      if (event.target && event.target.name === 'quantity') {
        Array.prototype.forEach.call(roots, updateSummary);
      }
    });
    // Dawn byter varianten utan att rendera om custom_liquid-blocken, så
    // paketpriset i data-package-price måste uppdateras när varianten ändras.
    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined' && PUB_SUB_EVENTS.variantChange) {
      subscribe(PUB_SUB_EVENTS.variantChange, function (event) {
        var variant = event && event.data && event.data.variant;
        if (!variant || typeof variant.price !== 'number') return;
        Array.prototype.forEach.call(roots, function (root) {
          root.dataset.packagePrice = String(variant.price);
          updateSummary(root);
        });
      });
    }
    patchCartNotification();
    if (window.customElements && customElements.whenDefined) {
      customElements.whenDefined('cart-notification').then(patchCartNotification);
    }
  }

  document.addEventListener('submit', onSubmit, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
