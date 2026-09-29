if (!customElements.get('collection-finder')) {
  customElements.define(
    'collection-finder',
    class CollectionFinder extends HTMLElement {
      constructor() {
        super();
        this.dataScript = this.querySelector('script[type="application/json"]');
        this.config = this.dataScript ? JSON.parse(this.dataScript.textContent) : null;
        this.root = this.querySelector('[data-finder-root]');
        this.stepIndex = 0;
        this.selections = {};
      }

      connectedCallback() {
        if (!this.config || !Array.isArray(this.config.steps) || this.config.steps.length === 0) return;
        this.render();
      }

      // Reads the target collection's own filter counts for the given
      // param_name, given the selections already made, so a step never
      // offers an option that would return zero products. Best-effort:
      // any failure (network, markup shape) just leaves options enabled,
      // so the finder always keeps working even if this enhancement can't.
      async fetchAvailableCounts(paramName) {
        const counts = {};
        try {
          const params = new URLSearchParams();
          Object.entries(this.selections).forEach(([key, value]) => params.append(key, value));
          const url = `${this.config.targetUrl}?${params.toString()}`;
          const response = await fetch(url);
          if (!response.ok) return counts;
          const html = await response.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const inputs = doc.querySelectorAll(`input[name="${CSS.escape(paramName)}"]`);
          inputs.forEach((input) => {
            const label = input.closest('label');
            const textLabel = label ? label.querySelector('.facet-checkbox__text-label') : null;
            const countText = textLabel && textLabel.nextSibling ? textLabel.nextSibling.textContent : '';
            const match = countText && countText.match(/\((\d+)\)/);
            const count = match ? parseInt(match[1], 10) : input.checked ? 1 : 0;
            counts[input.value] = count;
          });
        } catch (error) {
          // Network or markup mismatch: fail open, no narrowing this step.
        }
        return counts;
      }

      async render() {
        const step = this.config.steps[this.stepIndex];
        if (!step) {
          this.showSummary();
          return;
        }

        this.root.setAttribute('aria-busy', 'true');
        let counts = null;
        if (this.stepIndex > 0) {
          counts = await this.fetchAvailableCounts(step.paramName);
        }

        const optionsHtml = step.options
          .map((option) => {
            const count = counts ? counts[option.value] : null;
            const disabled = counts !== null && (count === undefined || count === 0);
            return `
              <button
                type="button"
                class="button button--secondary collection-finder__option"
                data-value="${this.escapeAttr(option.value)}"
                ${disabled ? 'disabled aria-disabled="true"' : ''}
              >
                ${this.escapeHtml(option.label)}
              </button>
            `;
          })
          .join('');

        this.root.innerHTML = `
          <div class="collection-finder__progress">${this.stepIndex + 1} / ${this.config.steps.length}</div>
          <h3 class="collection-finder__question">${this.escapeHtml(step.question)}</h3>
          <div class="collection-finder__options">${optionsHtml}</div>
          ${this.stepIndex > 0 ? '<button type="button" class="link underlined-link collection-finder__back">Tillbaka</button>' : ''}
        `;
        this.root.removeAttribute('aria-busy');

        this.root.querySelectorAll('.collection-finder__option').forEach((button) => {
          button.addEventListener('click', () => {
            this.selections[step.paramName] = button.dataset.value;
            this.stepIndex += 1;
            this.render();
          });
        });

        const backButton = this.root.querySelector('.collection-finder__back');
        if (backButton) {
          backButton.addEventListener('click', () => {
            const previousStep = this.config.steps[this.stepIndex - 1];
            delete this.selections[previousStep.paramName];
            this.stepIndex -= 1;
            this.render();
          });
        }
      }

      showSummary() {
        const params = new URLSearchParams();
        Object.entries(this.selections).forEach(([key, value]) => params.append(key, value));
        const url = `${this.config.targetUrl}?${params.toString()}`;
        window.location.assign(url);
      }

      escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
      }

      escapeAttr(value) {
        return this.escapeHtml(value).replace(/"/g, '&quot;');
      }
    }
  );
}
