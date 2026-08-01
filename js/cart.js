/**
 * Just Drugs — Cart Manager
 * Manages the sliding cart drawer, item counts, and cart state.
 */

const Cart = (() => {
  // ─── State ──────────────────────────────────────────────────────────────────
  let _items = [];          // [{ product_id, name, price, quantity, image_emoji, requires_prescription }]
  let _subtotal = 0;
  let _open = false;

  // ─── DOM refs ───────────────────────────────────────────────────────────────
  const $overlay      = () => document.getElementById('cart-overlay');
  const $drawer       = () => document.getElementById('cart-drawer');
  const $body         = () => document.getElementById('cart-body');
  const $footer       = () => document.getElementById('cart-footer');
  const $emptyMsg     = () => document.getElementById('cart-empty');
  const $countHeader  = () => document.getElementById('cart-count');
  const $countDrawer  = () => document.getElementById('cart-drawer-count');
  const $subtotalEl   = () => document.getElementById('cart-subtotal');
  const $rxNotice     = () => document.getElementById('cart-rx-notice');

  // ─── Helpers ────────────────────────────────────────────────────────────────
  function totalQty() {
    return _items.reduce((s, i) => s + i.quantity, 0);
  }

  function hasRxItem() {
    return _items.some(i => i.requires_prescription);
  }

  function fmt(price) {
    return '₦' + price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  function render() {
    const qty = totalQty();

    // Update badges
    [$countHeader(), $countDrawer()].forEach(el => { if (el) el.textContent = qty; });
    if ($subtotalEl()) $subtotalEl().textContent = fmt(_subtotal);

    const empty = qty === 0;
    if ($emptyMsg()) $emptyMsg().style.display = empty ? 'flex' : 'none';
    if ($footer())   $footer().hidden = empty;
    if ($rxNotice()) $rxNotice().hidden = !hasRxItem();

    if (!$body()) return;

    // Remove existing item rows (keep empty message)
    $body().querySelectorAll('.cart-item').forEach(el => el.remove());

    if (!empty) {
      _items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.dataset.id = item.product_id;
        el.innerHTML = `
          <div class="cart-item-icon-box" aria-hidden="true">
            <i data-feather="package"></i>
          </div>
          <div class="cart-item-info">
            <p class="cart-item-name">${escapeHtml(item.name)}</p>
            ${item.requires_prescription ? '<span class="rx-badge-small">Rx</span>' : ''}
            <p class="cart-item-price">${fmt(item.price * item.quantity)}</p>
          </div>
          <div class="cart-item-controls">
            <button class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
            <button class="qty-btn remove-btn" data-action="remove" aria-label="Remove item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>`;
        $body().appendChild(el);
      });
    }

    feather.replace();
  }

  // ─── Event delegation for quantity buttons ──────────────────────────────────
  function _attachBodyEvents() {
    document.getElementById('cart-body').addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const row = btn.closest('.cart-item');
      if (!row) return;
      const pid = row.dataset.id;
      const action = btn.dataset.action;
      const item = _items.find(i => i.product_id === pid);
      if (!item) return;

      btn.disabled = true;
      try {
        if (action === 'inc') {
          await CartAPI.updateItem(pid, item.quantity + 1);
        } else if (action === 'dec') {
          if (item.quantity <= 1) {
            await CartAPI.removeItem(pid);
          } else {
            await CartAPI.updateItem(pid, item.quantity - 1);
          }
        } else if (action === 'remove') {
          await CartAPI.removeItem(pid);
        }
        await Cart.sync();
      } catch (err) {
        showToast(err.message || 'Cart error', 'error');
      } finally {
        btn.disabled = false;
      }
    });
  }

  // ─── Public API ─────────────────────────────────────────────────────────────
  return {
    init() {
      // Open cart
      document.getElementById('cart-header-btn')?.addEventListener('click', () => this.open());

      // Close cart
      document.getElementById('cart-close-btn')?.addEventListener('click', () => this.close());
      $overlay()?.addEventListener('click', () => this.close());

      _attachBodyEvents();
      this.sync();
    },

    open() {
      _open = true;
      $drawer()?.classList.add('open');
      $overlay()?.classList.add('visible');
      document.body.style.overflow = 'hidden';
    },

    close() {
      _open = false;
      $drawer()?.classList.remove('open');
      $overlay()?.classList.remove('visible');
      document.body.style.overflow = '';
    },

    /** Fetch fresh cart from backend and re-render */
    async sync() {
      try {
        const res = await CartAPI.get();
        // Response: { success, data: { _id, items, subtotal, item_count, ... } }
        const data = res.data || res;
        _items = (data.items || []).map(i => ({
          product_id: i.product_id,
          name: i.name || i.product_name,
          price: i.unit_price ?? i.price ?? 0,
          quantity: i.quantity,
          image_emoji: i.image_emoji || '💊',
          requires_prescription: i.requires_prescription || false,
        }));
        _subtotal = data.subtotal ?? _items.reduce((s, i) => s + i.price * i.quantity, 0);
      } catch (_) {
        // If backend is unreachable, keep local state
      }
      render();
    },

    /** Optimistically add item then sync */
    async addItem(product, quantity = 1) {
      try {
        await CartAPI.addItem(product._id || product.product_id, quantity);
        await this.sync();
        showToast(`${product.name} added to cart!`, 'success');
        this.open();
      } catch (err) {
        showToast(err.message || 'Could not add to cart', 'error');
      }
    },

    getItemCount() {
      return totalQty();
    },
  };
})();

// ─── Global helper (called by HTML onclick) ───────────────────────────────────
function closeCart() { Cart.close(); }
function proceedToCheckout() {
  showToast('Checkout coming soon! 🚀', 'info');
}
