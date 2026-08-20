(function () {
  function cfg() { return window.B2BConfig || {}; }

  function qs(sel, root) { return (root || document).querySelector(sel); }

  function openModal() {
    var modal = qs('#b2b-public-sector-modal');
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    loadCartSummary();
  }

  function closeModal() {
    var modal = qs('#b2b-public-sector-modal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function loadCartSummary() {
    var el = qs('[data-b2b-ps-cart-summary]');
    if (!el) return;
    fetch('/cart.js', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var lines = (cart.items || []).map(function (i) {
          return '<li>' + i.quantity + ' × ' + i.title + '</li>';
        }).join('');
        el.innerHTML = '<strong>Varukorg (' + cart.item_count + ' artiklar)</strong><ul>' + lines + '</ul>' +
          '<p>Totalt: ' + Shopify.formatMoney(cart.total_price) + '</p>';
      })
      .catch(function () { el.textContent = 'Kunde inte ladda varukorg.'; });
  }

  function showError(msg) {
    var el = qs('[data-b2b-ps-error]');
    var ok = qs('[data-b2b-ps-success]');
    if (ok) ok.hidden = true;
    if (el) { el.textContent = msg; el.hidden = !msg; }
  }

  function showSuccess(msg) {
    var el = qs('[data-b2b-ps-success]');
    var err = qs('[data-b2b-ps-error]');
    if (err) err.hidden = true;
    if (el) { el.textContent = msg; el.hidden = !msg; }
  }

  function submitForm(e) {
    e.preventDefault();
    var form = qs('#b2b-public-sector-form');
    if (!form || !window.B2BCustomer) return;

    var data = window.B2BCustomer.readCompanyFields(form);
    var contactName = qs('#ps-contact-name', form)?.value?.trim();
    var contactEmail = qs('#ps-contact-email', form)?.value?.trim();
    var contactPhone = qs('#ps-contact-phone', form)?.value?.trim();
    var notes = qs('#ps-notes', form)?.value?.trim();

    if (!contactName || !contactEmail) {
      showError('Kontaktperson och e-post krävs.');
      return;
    }

    showError('');
    var btn = qs('.b2b-ps-submit', form);
    if (btn) btn.disabled = true;

    fetch('/cart.js', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var c = cfg();
        var url = c.publicSectorApiUrl;
        if (!url) throw new Error('Public sector API saknas i temakonfiguration.');
        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shop_domain: c.shopDomain || window.location.hostname,
            shopify_customer_id: c.customerId || null,
            organization_number: data.organization_number,
            company_name: data.company_name,
            gln: data.gln,
            peppol_id: data.peppol_id || window.B2BCustomer.autoPeppol(data.organization_number),
            invoice_reference: data.invoice_reference,
            cost_center: data.cost_center,
            po_number: data.po_number,
            payment_terms: data.payment_terms || '30',
            procurement_system: data.procurement_system,
            contact_name: contactName,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            notes: notes,
            cart_items: (cart.items || []).map(function (i) {
              return {
                variant_id: i.variant_id,
                title: i.title,
                quantity: i.quantity,
                price: i.price,
                sku: i.sku,
              };
            }),
          }),
        });
      })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.error) throw new Error(res.error);
        showSuccess(res.message || 'Beställning mottagen!');
        if (res.invoice_url) {
          showSuccess((res.message || 'Beställning mottagen!') + ' Fakturalänk: ' + res.invoice_url);
        }
        setTimeout(closeModal, 4000);
      })
      .catch(function (err) {
        showError(err.message || 'Något gick fel. Försök igen.');
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-b2b-ps-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.querySelectorAll('[data-b2b-public-sector-open]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });
    var form = qs('#b2b-public-sector-form');
    if (form) form.addEventListener('submit', submitForm);
  });

  window.B2BPublicSector = { openModal: openModal, closeModal: closeModal };
})();
