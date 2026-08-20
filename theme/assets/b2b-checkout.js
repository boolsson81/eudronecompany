(function () {
  var ATTR = {
    customer_type: '_customer_type',
    company_name: '_company_name',
    organization_number: '_organization_number',
    vat_number: '_vat_number',
    gln: '_gln',
    peppol_id: '_peppol_id',
    invoice_reference: '_invoice_reference',
    cost_center: '_cost_center',
    po_number: '_po_number',
    payment_terms: '_payment_terms',
    procurement_system: '_procurement_system',
  };

  function getStored() {
    if (window.B2BCustomer?.loadPending) {
      var p = window.B2BCustomer.loadPending();
      if (p) return p;
    }
    return window.B2BConfig?.customerMetafields || null;
  }

  function readCartFormFields() {
    var root = document.querySelector('[data-b2b-cart-fields]');
    if (!root || !window.B2BCustomer) return null;
    return window.B2BCustomer.readCompanyFields(root);
  }

  function buildAttributes(data) {
    var attrs = {};
    if (!data) return attrs;
    Object.keys(ATTR).forEach(function (k) {
      if (data[k]) attrs[ATTR[k]] = data[k];
    });
    return attrs;
  }

  function pushCartAttributes(attrs) {
    return fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ attributes: attrs }),
    }).catch(function () {});
  }

  function syncCartAttributes() {
    var data = readCartFormFields() || getStored();
    if (!data || data.customer_type === 'b2c') return Promise.resolve();
    if (data.organization_number && !data.vat_number && window.B2BCustomer) {
      data.vat_number = window.B2BCustomer.autoVat(data.organization_number);
    }
    if (data.customer_type === 'public_sector' && data.organization_number && !data.peppol_id && window.B2BCustomer) {
      data.peppol_id = window.B2BCustomer.autoPeppol(data.organization_number);
    }
    return pushCartAttributes(buildAttributes(data));
  }

  function initCheckoutButtons() {
    document.querySelectorAll('[name="checkout"], .cart__checkout-button').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var data = readCartFormFields();
        if (data && data.customer_type === 'public_sector') {
          e.preventDefault();
          if (window.B2BPublicSector?.openModal) window.B2BPublicSector.openModal();
          return;
        }
        e.preventDefault();
        syncCartAttributes().finally(function () {
          var form = btn.closest('form');
          if (form) form.submit();
          else window.location.href = '/checkout';
        });
      });
    });
  }

  function initCartTypeToggle() {
    document.querySelectorAll('[data-b2b-cart-fields] [name="b2b_customer_type"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (window.B2BCustomer) window.B2BCustomer.toggleFieldGroups(radio.value, radio.closest('[data-b2b-cart-fields]'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCartTypeToggle();
    initCheckoutButtons();
    syncCartAttributes();
  });
})();
