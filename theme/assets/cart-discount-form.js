class CartDiscountForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.input = this.querySelector('input[name="discount-code"]');
    this.form?.addEventListener('submit', this.onSubmit.bind(this));
  }

  onSubmit(event) {
    event.preventDefault();
    const code = this.input?.value.trim();
    if (!code) return;

    const redirectTo = (window.routes && window.routes.cart_url) || '/cart';
    const base = window.shopUrl || '';
    window.location.href = `${base}/discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent(redirectTo)}`;
  }
}

customElements.define('cart-discount-form', CartDiscountForm);
