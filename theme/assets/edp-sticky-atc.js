/**
 * Klistrig köpknapp.
 *
 * Visas när huvudköpknappen på produktsidan har scrollats förbi. Visar produktnamn, aktuellt
 * pris och en "Lägg i varukorg"-knapp som klickar på den riktiga köpknappen, så val av
 * variant, antal och korgens egen logik fungerar som vanligt.
 */
(function () {
  if (typeof customElements === 'undefined' || customElements.get('edp-sticky-atc')) return;

  class EdpStickyAtc extends HTMLElement {
    connectedCallback() {
      this.main = document.querySelector('product-info');
      this.submit = this.main && this.main.querySelector('.product-form__submit');
      if (!this.submit) return; // t.ex. produkt utan köpformulär

      this.priceTarget = this.querySelector('[data-price]');
      this.button = this.querySelector('[data-atc]');
      this.label = this.querySelector('[data-atc-label]');

      this.button.addEventListener('click', this.onClick.bind(this));
      this.syncPrice();
      this.syncButton();

      var priceSource = this.main.querySelector('[id^="price-"]');
      if (priceSource) {
        new MutationObserver(this.syncPrice.bind(this)).observe(priceSource, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
      new MutationObserver(this.syncButton.bind(this)).observe(this.submit, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      });

      this.observer = new IntersectionObserver(this.onIntersect.bind(this), { threshold: 0 });
      this.observer.observe(this.submit);
      window.addEventListener('resize', this.offsetForMobileBar.bind(this), { passive: true });
      this.offsetForMobileBar();
    }

    disconnectedCallback() {
      if (this.observer) this.observer.disconnect();
    }

    // Visa först när köpknappen har passerats uppåt, inte när den ännu ligger under skärmen.
    onIntersect(entries) {
      var entry = entries[entries.length - 1];
      this.setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    }

    setVisible(visible) {
      this.classList.toggle('is-visible', visible);
      this.setAttribute('aria-hidden', visible ? 'false' : 'true');
      if (visible) this.removeAttribute('inert');
      else this.setAttribute('inert', '');
    }

    onClick() {
      if (this.submit.disabled || this.submit.getAttribute('aria-disabled') === 'true') {
        this.submit.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      this.submit.click();
    }

    syncPrice() {
      var source = this.main && this.main.querySelector('[id^="price-"]');
      if (!source || !this.priceTarget) return;
      var clone = source.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(function (el) {
        el.removeAttribute('id');
      });
      this.priceTarget.innerHTML = '';
      this.priceTarget.appendChild(clone);
    }

    syncButton() {
      var disabled = this.submit.disabled || this.submit.getAttribute('aria-disabled') === 'true';
      var text = (this.submit.textContent || '').replace(/\s+/g, ' ').trim();
      if (text && this.label) this.label.textContent = text;
      if (disabled) this.button.setAttribute('aria-disabled', 'true');
      else this.button.removeAttribute('aria-disabled');
      this.button.classList.toggle('disabled', disabled);
    }

    // På mobil ligger en navigationsrad längst ner; lägg köpknappen ovanför den.
    offsetForMobileBar() {
      var bar = document.querySelector('.edp-sticky-bar');
      var height = 0;
      if (bar && window.getComputedStyle(bar).display !== 'none') height = bar.offsetHeight;
      this.style.setProperty('--edp-sticky-atc-bottom', height + 'px');
    }
  }

  customElements.define('edp-sticky-atc', EdpStickyAtc);
})();
