// --- Global State ---
let allProducts = [];
let currentCategory = 'All';
let searchQuery = '';

// --- Toast Notification Helper ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'circle-check' : (type === 'error' ? 'circle-exclamation' : 'circle-info');
  toast.innerHTML = `<i class="fa-solid fa-${icon}"></i><span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Load Products & Categories ---
async function loadCategories() {
  try {
    const res = await apiRequest('/products/categories');
    const container = document.getElementById('categoryPills');
    if (!container) return;

    container.innerHTML = `
      <button class="pill-btn active" data-category="All" onclick="filterByCategory('All')">All Categories</button>
      ${res.categories.map(cat => `
        <button class="pill-btn" data-category="${cat}" onclick="filterByCategory('${cat}')">${cat}</button>
      `).join('')}
    `;
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

async function loadProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><h3>Loading Catalog...</h3></div>';

  try {
    let url = '/products';
    const params = new URLSearchParams();
    if (currentCategory && currentCategory !== 'All') params.append('category', currentCategory);
    if (searchQuery) params.append('search', searchQuery);
    if ([...params].length > 0) url += `?${params.toString()}`;

    const res = await apiRequest(url);
    allProducts = res.products;
    renderProducts(allProducts);
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation" style="color: var(--danger);"></i>
        <h3>Error Loading Products</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  const countEl = document.getElementById('resultsCount');

  if (countEl) countEl.textContent = `Showing ${products.length} products`;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <h3>No Products Found</h3>
        <p>Try clearing your search or switching to another category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(prod => `
    <div class="product-card" data-id="${prod.id}">
      <div class="product-image-wrap" onclick="openProductModal(${prod.id})">
        <img src="${prod.image_url}" alt="${prod.name}" loading="lazy">
        <span class="product-category-tag">${prod.category}</span>
      </div>
      <div class="product-body">
        <h3 class="product-title" onclick="openProductModal(${prod.id})">${prod.name}</h3>
        <div class="product-rating">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star-half-stroke"></i>
          <span>(${prod.rating})</span>
        </div>
        <p class="product-desc-snippet">${prod.description}</p>
        <div class="product-footer">
          <span class="product-price">$${prod.price.toFixed(2)}</span>
          <button class="btn-add-cart" onclick="handleAddToCart(${prod.id})">
            <i class="fa-solid fa-plus"></i> Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterByCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === cat);
  });
  loadProducts();
}

function handleSearch(e) {
  searchQuery = e.target.value;
  loadProducts();
}

function handleAddToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (product) {
    Cart.addItem(product, 1);
  }
}

// --- Product Details Modal ---
function openProductModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('productDetailModal');
  const content = document.getElementById('productDetailContent');

  content.innerHTML = `
    <div class="product-detail-layout">
      <div>
        <img src="${product.image_url}" alt="${product.name}" class="detail-img">
      </div>
      <div class="detail-info">
        <span class="product-category-tag" style="position: static; display: inline-block; margin-bottom: 0.5rem;">${product.category}</span>
        <h2>${product.name}</h2>
        <div class="product-rating" style="margin: 0.5rem 0;">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star-half-stroke"></i>
          <span>${product.rating} / 5.0</span>
        </div>
        <div class="detail-price">$${product.price.toFixed(2)}</div>
        <span class="stock-badge ${product.stock > 5 ? 'stock-in' : 'stock-low'}">
          <i class="fa-solid fa-check"></i> ${product.stock} units available
        </span>
        <p class="detail-desc">${product.description}</p>
        <div style="display: flex; gap: 0.75rem; align-items: center; margin-top: auto;">
          <input type="number" id="detailQty" value="1" min="1" max="${product.stock}" class="form-control" style="width: 80px;">
          <button class="btn-primary" style="flex: 1;" onclick="addFromModal(${product.id})">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function addFromModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  const qtyInput = document.getElementById('detailQty');
  const qty = parseInt(qtyInput.value, 10) || 1;

  if (product) {
    Cart.addItem(product, qty);
    closeModal('productDetailModal');
  }
}

// --- Cart Drawer Controls ---
function openCartDrawer() {
  document.getElementById('cartDrawerOverlay').classList.add('active');
  document.getElementById('cartDrawer').classList.add('open');
}

function closeCartDrawer() {
  document.getElementById('cartDrawerOverlay').classList.remove('active');
  document.getElementById('cartDrawer').classList.remove('open');
}

// --- Checkout Modal ---
function proceedToCheckout() {
  const user = Auth.getUser();
  if (!user) {
    showToast('Please log in or create an account to checkout', 'info');
    closeCartDrawer();
    openAuthModal();
    return;
  }

  const items = Cart.getItems();
  if (items.length === 0) {
    showToast('Your shopping cart is empty!', 'error');
    return;
  }

  closeCartDrawer();
  const totals = Cart.getTotals();
  document.getElementById('checkoutItemCount').textContent = `${totals.itemCount} items`;
  document.getElementById('checkoutTotalDisplay').textContent = `$${totals.total.toFixed(2)}`;

  // Prefill name if available
  document.getElementById('shippingName').value = user.name || '';

  document.getElementById('checkoutModal').classList.add('active');
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('placeOrderBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Order...';

  try {
    const payload = {
      items: Cart.getItems(),
      shippingName: document.getElementById('shippingName').value,
      shippingAddress: document.getElementById('shippingAddress').value,
      shippingCity: document.getElementById('shippingCity').value,
      shippingPostalCode: document.getElementById('shippingPostalCode').value,
      paymentMethod: document.getElementById('paymentMethod').value
    };

    const res = await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    Cart.clearCart();
    closeModal('checkoutModal');
    showOrderSuccess(res.orderId, res.totalAmount);
    showToast('Order confirmed successfully!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Place Order Now';
  }
}

function showOrderSuccess(orderId, total) {
  const content = document.getElementById('orderSuccessContent');
  content.innerHTML = `
    <div style="text-align: center; padding: 1.5rem 0;">
      <i class="fa-solid fa-circle-check" style="font-size: 3.5rem; color: var(--success); margin-bottom: 1rem;"></i>
      <h2>Thank you for your order!</h2>
      <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">Your order <strong>#${orderId}</strong> has been received and is being processed.</p>
      <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 700;">
        Total Paid: $${total.toFixed(2)}
      </div>
      <button class="btn-primary" onclick="closeModal('orderSuccessModal'); openOrdersModal();">
        View Order History
      </button>
    </div>
  `;
  document.getElementById('orderSuccessModal').classList.add('active');
}

// --- Orders History Modal ---
async function openOrdersModal() {
  const user = Auth.getUser();
  if (!user) {
    showToast('Please log in to view your orders', 'info');
    openAuthModal();
    return;
  }

  const modal = document.getElementById('ordersModal');
  const container = document.getElementById('ordersListContainer');
  modal.classList.add('active');
  container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><h3>Loading Orders...</h3></div>';

  try {
    const res = await apiRequest('/orders/my-orders');
    if (res.orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-receipt"></i>
          <h3>No Orders Yet</h3>
          <p>When you complete a purchase, your order history will show up here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = res.orders.map(order => `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <span class="order-number">Order #${order.id}</span>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${new Date(order.created_at).toLocaleString()}</div>
          </div>
          <span class="order-status">${order.status}</span>
        </div>
        <div class="order-items-summary">
          <strong>Items:</strong>
          <ul style="margin: 0.3rem 0 0.5rem 1.2rem; font-size: 0.85rem;">
            ${order.items.map(i => `<li>${i.product_name} &times; ${i.quantity} ($${(i.unit_price * i.quantity).toFixed(2)})</li>`).join('')}
          </ul>
          <div><strong>Shipping to:</strong> ${order.shipping_name}, ${order.shipping_address}, ${order.shipping_city} (${order.shipping_postal_code})</div>
        </div>
        <div class="order-total">Total: $${order.total_amount.toFixed(2)}</div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><p style="color: var(--danger);">${error.message}</p></div>`;
  }
}

// --- Auth Modal & Form Handlers ---
function openAuthModal(initialTab = 'login') {
  switchAuthTab(initialTab);
  document.getElementById('authModal').classList.add('active');
}

function switchAuthTab(tab) {
  const loginTab = document.getElementById('loginTabBtn');
  const signupTab = document.getElementById('signupTabBtn');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (tab === 'login') {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    await Auth.login(email, password);
    closeModal('authModal');
    showToast('Welcome back!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    await Auth.register(name, email, password);
    closeModal('authModal');
    showToast('Account created successfully!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function fillDemoCredentials() {
  document.getElementById('loginEmail').value = 'demo@codealpha.com';
  document.getElementById('loginPassword').value = 'password123';
  switchAuthTab('login');
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('show');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  Auth.updateUI();
  Cart.updateCartBadge();
  Cart.renderCartDrawer();
  loadCategories();
  loadProducts();

  // Search input debounce
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => handleSearch(e), 250);
    });
  }

  // Close dropdown on outside click
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu-wrapper')) {
      const dropdown = document.getElementById('userDropdown');
      if (dropdown) dropdown.classList.remove('show');
    }
  });
});
