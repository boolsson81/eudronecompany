(function () {
  var STORAGE_KEY = '_ds_b2b_pending';
  var TYPE_B2C = 'b2c';
  var TYPE_B2B = 'b2b';
  var TYPE_PUBLIC = 'public_sector';

  function getConfig() { return window.B2BConfig || {}; }

  function normalizeOrg(v) { return String(v || '').replace(/\D/g, ''); }
  function autoVat(org) { var d = normalizeOrg(org); return d.length === 10 ? 'SE' + d + '01' : ''; }
  function autoPeppol(org) { var d = normalizeOrg(org); return d.length === 10 ? '0007:' + d : ''; }

  function activeFieldGroup(type) {
    if (type === TYPE_PUBLIC) return 'public_sector';
    if (type === TYPE_B2B || type === 'business') return 'b2b';
    return null;
  }

  function toggleFieldGroups(type, root) {
    var scope = root || document;
    var group = activeFieldGroup(type);
    scope.querySelectorAll('[data-b2b-field-group]').forEach(function (el) {
      var show = el.dataset.b2bFieldGroup === group;
      el.classList.toggle('is-visible', show);
      el.querySelectorAll('input, select, textarea').forEach(function (input) {
        if (input.dataset.b2bRequiredB2b === 'true') input.required = show && group === 'b2b';
        if (input.dataset.b2bRequiredPublic === 'true') input.required = show && group === 'public_sector';
      });
    });
  }

  function readFieldsFromGroup(groupEl) {
    if (!groupEl) return {};
    var get = function (key) {
      var el = groupEl.querySelector('[data-b2b-field="' + key + '"]');
      return el ? String(el.value || '').trim() : '';
    };
    return {
      company_name: get('company_name'),
      organization_number: get('organization_number'),
      vat_number: get('vat_number'),
      gln: get('gln'),
      peppol_id: get('peppol_id'),
      invoice_reference: get('invoice_reference'),
      cost_center: get('cost_center'),
      po_number: get('po_number'),
      payment_terms: get('payment_terms'),
      procurement_system: get('procurement_system'),
    };
  }

  function readCompanyFields(root) {
    var container = root || document;
    var type = container.querySelector('[name="b2b_customer_type"]:checked')?.value || TYPE_B2C;
    var groupName = activeFieldGroup(type);
    var groupEl = groupName
      ? container.querySelector('[data-b2b-field-group="' + groupName + '"]')
      : null;
    var fields = readFieldsFromGroup(groupEl);
    return Object.assign({ customer_type: type }, fields);
  }

  function savePending(data) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {} }
  function loadPending() { try { var r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function clearPending() { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} }

  function syncToBackend(data, customer) {
    var cfg = getConfig();
    if (!cfg.apiUrl || !customer?.id || !customer?.email) return Promise.resolve();
    var payload = Object.assign({
      shop_domain: cfg.shopDomain || window.location.hostname,
      shopify_customer_id: String(customer.id),
      email: customer.email,
      first_name: customer.firstName,
      last_name: customer.lastName,
    }, data);
    if (!payload.vat_number && payload.organization_number) payload.vat_number = autoVat(payload.organization_number);
    if (!payload.peppol_id && payload.customer_type === TYPE_PUBLIC && payload.organization_number) {
      payload.peppol_id = autoPeppol(payload.organization_number);
    }
    return fetch(cfg.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res.success) clearPending();
      return res;
    }).catch(function () {});
  }

  function initTypeToggle() {
    document.querySelectorAll('[name="b2b_customer_type"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        var form = radio.closest('form') || document;
        toggleFieldGroups(radio.value, form);
      });
    });
    document.querySelectorAll('[name="b2b_customer_type"]:checked').forEach(function (radio) {
      toggleFieldGroups(radio.value, radio.closest('form') || document);
    });
  }

  function initOrgAutoVat() {
    document.querySelectorAll('[data-b2b-field="organization_number"]').forEach(function (orgInput) {
      orgInput.addEventListener('input', function () {
        var group = orgInput.closest('[data-b2b-field-group]');
        var vatInput = group?.querySelector('[data-b2b-field="vat_number"]');
        if (vatInput && !vatInput.dataset.userEdited) vatInput.value = autoVat(orgInput.value);
        var peppolInput = group?.querySelector('[data-b2b-field="peppol_id"]');
        if (peppolInput && !peppolInput.dataset.userEdited) peppolInput.value = autoPeppol(orgInput.value);
      });
    });
    document.querySelectorAll('[data-b2b-field="vat_number"], [data-b2b-field="peppol_id"]').forEach(function (input) {
      input.addEventListener('input', function () { input.dataset.userEdited = 'true'; });
    });
  }

  function initRegisterForm() {
    var form = document.querySelector('form[action*="account"]');
    if (!form || !form.querySelector('[name="b2b_customer_type"]')) return;
    form.addEventListener('submit', function () {
      var data = readCompanyFields(form);
      if (data.customer_type === TYPE_B2B || data.customer_type === TYPE_PUBLIC) savePending(data);
      else clearPending();
    });
  }

  function initAccountSync() {
    var cfg = getConfig();
    if (!cfg.customerId || !cfg.customerEmail) return;
    var pending = loadPending();
    if (pending) {
      syncToBackend(pending, {
        id: cfg.customerId,
        email: cfg.customerEmail,
        firstName: cfg.customerFirstName,
        lastName: cfg.customerLastName,
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTypeToggle();
    initOrgAutoVat();
    initRegisterForm();
    initAccountSync();
  });

  window.B2BCustomer = {
    readCompanyFields: readCompanyFields,
    loadPending: loadPending,
    savePending: savePending,
    autoVat: autoVat,
    autoPeppol: autoPeppol,
    TYPE_B2B: TYPE_B2B,
    TYPE_B2C: TYPE_B2C,
    TYPE_PUBLIC: TYPE_PUBLIC,
    toggleFieldGroups: toggleFieldGroups,
  };
})();
