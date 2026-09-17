const Cart = {
  STORAGE_KEY: 'codealpha_ecommerce_cart',

  getItems() {
    try {
      const items = localStorage.getItem(this.STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.updateCartBadge();
    this.renderCartDrawer();
  },

  addItem(product, quantity = 1) {
    const items = this.getItems();
    const existingIndex = items.findIndex(i => i.id === product.id);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: quantity
      });
    }

    this.saveItems(items);
    showToast(`Added "${product.name}" to cart!`, 'success');
  },

  updateQuantity(productId, delta) {
    let items = this.getItems();
    const item = items.find(i => i.id === productId);

    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        items = items.filter(i => i.id !== productId);
      }
      this.saveItems(items);
    }
  },

  removeItem(productId) {
    let items = this.getItems();
    items = items.filter(i => i.id !== productId);
    this.saveItems(items);
    showToast('Item removed from cart', 'info');
  },

  clearCart() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateCartBadge();
    this.renderCartDrawer();
  },

  getTotals() {
    const items = this.getItems();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% estimated sales tax
    const total = subtotal + tax;

    return {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  },

  updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
      const { itemCount } = this.getTotals();
      badge.textContent = itemCount;
      badge.style.display = itemCount > 0 ? 'block' : 'none';
    }
  },

  renderCartDrawer() {
    const container = document.getElementById('cartItemsList');
    const emptyState = document.getElementById('cartEmptyState');
    const footer = document.getElementById('cartFooter');
    const subtotalEl = document.getElementById('cartSubtotal');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');

    if (!container) return;

    const items = this.getItems();
    const totals = this.getTotals();

    if (items.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      if (footer) footer.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';
    if (footer) footer.style.display = 'block';

    container.innerHTML = items.map(item => `
      <div class="cart-item">
        <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="Cart.updateQuantity(${item.id}, -1)">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="Cart.updateQuantity(${item.id}, 1)">+</button>
            <button class="btn-remove-item" onclick="Cart.removeItem(${item.id})">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${totals.tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${totals.total.toFixed(2)}`;
  }
};
