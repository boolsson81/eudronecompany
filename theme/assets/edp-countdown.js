class EdpCountdown extends HTMLElement {
  connectedCallback() {
    this.targetDate = new Date(this.dataset.target);
    this.daysEl = this.querySelector('[data-days]');
    this.hoursEl = this.querySelector('[data-hours]');
    this.minutesEl = this.querySelector('[data-minutes]');
    this.secondsEl = this.querySelector('[data-seconds]');

    if (isNaN(this.targetDate.getTime())) {
      this.hidden = true;
      return;
    }

    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);
  }

  disconnectedCallback() {
    if (this.interval) clearInterval(this.interval);
  }

  tick() {
    const diff = this.targetDate.getTime() - Date.now();

    if (diff <= 0) {
      this.render(0, 0, 0, 0);
      clearInterval(this.interval);
      this.dispatchEvent(new CustomEvent('edp:countdown-ended', { bubbles: true }));
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    this.render(days, hours, minutes, seconds);
  }

  render(days, hours, minutes, seconds) {
    const pad = (value) => String(value).padStart(2, '0');
    if (this.daysEl) this.daysEl.textContent = pad(days);
    if (this.hoursEl) this.hoursEl.textContent = pad(hours);
    if (this.minutesEl) this.minutesEl.textContent = pad(minutes);
    if (this.secondsEl) this.secondsEl.textContent = pad(seconds);
  }
}

customElements.define('edp-countdown', EdpCountdown);
