/**
 * Just Drugs — Admin Manager
 * Self-contained admin UI module with its own API client.
 */

const Admin = (() => {
  const API_BASE = 'https://justdrugsbe.onrender.com/api/v1';

  let _admin = null;
  let _adminToken = null;

  const $ = id => document.getElementById(id);

  // ─── State ──────────────────────────────────────────────────────────
  let _currentScreen = null;
  let _adminProducts = [];
  let _adminOrders = [];
  let _adminAdmins = [];
  let _adminBanners = [];
  let _adminDiscounts = [];
  let _adminSettings = {};

  // ─── API client ────────────────────────────────────────────────────
  async function apiFetch(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (_adminToken) headers['Authorization'] = `Bearer ${_adminToken}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'API error');
    }
    return res.json();
  }

  const AdminAPI = {
    async login(email, password) {
      const data = await apiFetch('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return data;
    },
    async getProfile() {
      return apiFetch('/admin/auth/me');
    },
    async createAdmin(payload) {
      return apiFetch('/admin/admins', { method: 'POST', body: JSON.stringify(payload) });
    },
    async listAdmins(role, page, limit) {
      const qs = new URLSearchParams();
      if (role) qs.set('role', role);
      qs.set('page', String(page));
      qs.set('limit', String(limit));
      return apiFetch(`/admin/admins?${qs}`);
    },
    async updateAdmin(adminId, payload) {
      return apiFetch(`/admin/admins/${adminId}`, { method: 'PATCH', body: JSON.stringify(payload) });
    },
    async deleteAdmin(adminId) {
      return apiFetch(`/admin/admins/${adminId}`, { method: 'DELETE' });
    },
    async getProducts(params = {}) {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      });
      const query = qs.toString() ? `?${qs}` : '';
      return apiFetch(`/admin/products${query}`);
    },
    async updateProduct(productId, payload) {
      return apiFetch(`/admin/products/${productId}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    async deleteProduct(productId) {
      return apiFetch(`/admin/products/${productId}`, { method: 'DELETE' });
    },
    async getOrders(params = {}) {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      });
      const query = qs.toString() ? `?${qs}` : '';
      return apiFetch(`/admin/orders${query}`);
    },
    async updateOrderStatus(orderNumber, status) {
      return apiFetch(`/admin/orders/${orderNumber}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    },
    async getBanners() {
      return apiFetch('/admin/banners');
    },
    async createBanner(payload) {
      return apiFetch('/admin/banners', { method: 'POST', body: JSON.stringify(payload) });
    },
    async updateBanner(bannerId, payload) {
      return apiFetch(`/admin/banners/${bannerId}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    async deleteBanner(bannerId) {
      return apiFetch(`/admin/banners/${bannerId}`, { method: 'DELETE' });
    },
    async getDiscounts() {
      return apiFetch('/admin/discounts');
    },
    async createDiscount(payload) {
      return apiFetch('/admin/discounts', { method: 'POST', body: JSON.stringify(payload) });
    },
    async updateDiscount(discountId, payload) {
      return apiFetch(`/admin/discounts/${discountId}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    async deleteDiscount(discountId) {
      return apiFetch(`/admin/discounts/${discountId}`, { method: 'DELETE' });
    },
    async getSettings() {
      return apiFetch('/admin/settings');
    },
    async updateSettings(payload) {
      return apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(payload) });
    },
  };

  // ─── Session ────────────────────────────────────────────────────────
  function loadAdminSession() {
    _adminToken = localStorage.getItem('jd_admin_token');
    if (_adminToken) {
      _admin = JSON.parse(localStorage.getItem('jd_admin') || 'null');
    }
  }

  function saveAdminSession(admin, token) {
    _admin = admin;
    _adminToken = token;
    localStorage.setItem('jd_admin_token', token);
    localStorage.setItem('jd_admin', JSON.stringify(admin));
  }

  function clearAdminSession() {
    _admin = null;
    _adminToken = null;
    localStorage.removeItem('jd_admin_token');
    localStorage.removeItem('jd_admin');
  }

  // ─── UI helpers ──────────────────────────────────────────────────────
  function showScreen(screenId) {
    document.querySelectorAll('.admin-screen').forEach(s => s.classList.remove('active'));
    const screen = $(screenId);
    if (screen) {
      screen.classList.add('active');
      _currentScreen = screenId;
    }
    const adminNav = $('admin-nav');
    if (adminNav) adminNav.classList.toggle('open', !!screenId);
  }

  function hideAllScreens() {
    document.querySelectorAll('.admin-screen').forEach(s => s.classList.remove('active'));
    _currentScreen = null;
  }

  function setLoading(btnId, loading) {
    const btn = $(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait…' : (btn.dataset.origText || btn.textContent);
    if (!loading) btn.dataset.origText = btn.textContent;
  }

  function fmtN(num) {
    return '₦' + Number(num).toLocaleString('en-NG');
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─── Toast ──────────────────────────────────────────────────────────
  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const iconName = type === 'success' ? 'check-circle'
      : type === 'error' ? 'alert-circle'
      : type === 'warning' ? 'alert-triangle' : 'info';
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast-icon"><i data-feather="${iconName}"></i></span>
      <span class="toast-msg">${esc(message)}</span>`;
    container.appendChild(toast);
    if (window.feather) feather.replace();
    requestAnimationFrame(() => toast.classList.add('visible'));
    const remove = () => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    };
    const timer = setTimeout(remove, duration);
    toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
  }

  // ─── Admin Login Screen ─────────────────────────────────────────────
  function openLogin() {
    hideAllScreens();
    const screen = $('admin-login-screen');
    if (screen) screen.classList.add('active');
    $('admin-login-email') && ($('admin-login-email').value = '');
    $('admin-login-password') && ($('admin-login-password').value = '');
  }

  function closeLogin() {
    hideAllScreens();
  }

  async function handleLogin(e) {
    if (e) e.preventDefault();
    const email = $('admin-login-email')?.value.trim() || '';
    const password = $('admin-login-password')?.value || '';
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }
    setLoading('admin-login-btn', true);
    try {
      const data = await AdminAPI.login(email, password);
      const profile = await AdminAPI.getProfile();
      saveAdminSession(profile.data, data.access_token);
      showToast('Welcome, ' + (profile.data.full_name || 'Admin'), 'success');
      showScreen('admin-dashboard-screen');
      loadDashboard();
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading('admin-login-btn', false);
    }
  }

  function handleLogout() {
    clearAdminSession();
    hideAllScreens();
    showToast('You have been signed out', 'info');
  }

  // ─── Dashboard ──────────────────────────────────────────────────────
  async function loadDashboard() {
    const screen = $('admin-dashboard-screen');
    if (!screen) return;

    try {
      const [ordersRes, productsRes] = await Promise.allSettled([
        AdminAPI.getOrders({ limit: 100 }),
        AdminAPI.getProducts({ limit: 100 }),
      ]);

      const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data || ordersRes.value || []) : [];
      const products = productsRes.status === 'fulfilled' ? (productsRes.value.data || productsRes.value || []) : [];

      const totalOrders = orders.length;
      const totalProducts = products.length;
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

      $('admin-stat-orders') && ($('admin-stat-orders').textContent = totalOrders);
      $('admin-stat-products') && ($('admin-stat-products').textContent = totalProducts);
      $('admin-stat-revenue') && ($('admin-stat-revenue').textContent = fmtN(totalRevenue));
      $('admin-stat-pending') && ($('admin-stat-pending').textContent = pendingOrders);

      renderAdminOrders(orders.slice(0, 10));
      renderAdminProducts(products.slice(0, 10));
    } catch (err) {
      console.error('Dashboard load error', err);
    }
  }

  function renderAdminOrders(orders) {
    const tbody = $('admin-orders-tbody');
    if (!tbody) return;
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No orders found</td></tr>';
      return;
    }
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><code>${esc(o.order_number || o._id)}</code></td>
        <td>${esc(o.user_email || o.user?.email || '—')}</td>
        <td>${fmtN(o.total || 0)}</td>
        <td><span class="admin-badge admin-badge-${(o.status || 'unknown').toLowerCase()}">${esc(o.status || 'Unknown')}</span></td>
        <td>${esc(o.created_at ? new Date(o.created_at).toLocaleDateString() : '—')}</td>
      </tr>`).join('');
  }

  function renderAdminProducts(products) {
    const tbody = $('admin-products-tbody');
    if (!tbody) return;
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No products found</td></tr>';
      return;
    }
    tbody.innerHTML = products.map(p => `
      <tr>
        <td>${esc(p.name)}</td>
        <td>${esc(p.brand_name || p.brand || '—')}</td>
        <td>${fmtN(p.selling_price ?? p.price ?? 0)}</td>
        <td>${p.stock_quantity ?? p.stock ?? '—'}</td>
        <td><span class="admin-badge ${(p.stock_quantity ?? p.stock) <= 0 ? 'admin-badge-danger' : 'admin-badge-success'}">${(p.stock_quantity ?? p.stock) <= 0 ? 'Out' : 'In'}</span></td>
      </tr>`).join('');
  }

  // ─── Admin Management ───────────────────────────────────────────────
  async function loadAdmins() {
    try {
      const data = await AdminAPI.listAdmins(null, 1, 100);
      _adminAdmins = data.data || data || [];
      renderAdminList();
    } catch (err) {
      showToast('Failed to load admins', 'error');
    }
  }

  function renderAdminList() {
    const tbody = $('admin-admins-tbody');
    if (!tbody) return;
    if (!_adminAdmins.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No admins found</td></tr>';
      return;
    }
    tbody.innerHTML = _adminAdmins.map(a => `
      <tr>
        <td>${esc(a.full_name)}</td>
        <td>${esc(a.email)}</td>
        <td><span class="admin-badge">${esc(a.role)}</span></td>
        <td>${a.is_active !== false ? '<span class="admin-badge admin-badge-success">Active</span>' : '<span class="admin-badge admin-badge-danger">Inactive</span>'}</td>
        <td>
          <button class="btn btn-sm btn-primary admin-edit-btn" data-admin-id="${esc(a.id)}">Edit</button>
          ${a.role !== 'super_admin' ? `<button class="btn btn-sm btn-danger admin-delete-btn" data-admin-id="${esc(a.id)}">Delete</button>` : ''}
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('.admin-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openAdminEdit(btn.dataset.adminId));
    });
    tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteAdmin(btn.dataset.adminId));
    });
  }

  function openAdminCreate() {
    $('admin-admin-form-title') && ($('admin-admin-form-title').textContent = 'Create Admin');
    $('admin-admin-form') && ($('admin-admin-form').reset());
    $('admin-admin-id') && ($('admin-admin-id').value = '');
    showScreen('admin-admin-form-screen');
  }

  function openAdminEdit(adminId) {
    const admin = _adminAdmins.find(a => a.id === adminId);
    if (!admin) return;
    $('admin-admin-form-title') && ($('admin-admin-form-title').textContent = 'Edit Admin');
    $('admin-admin-id') && ($('admin-admin-id').value = admin.id);
    $('admin-admin-full-name') && ($('admin-admin-full-name').value = admin.full_name || '');
    $('admin-admin-email') && ($('admin-admin-email').value = admin.email || '');
    $('admin-admin-role') && ($('admin-admin-role').value = admin.role || '');
    $('admin-admin-is-active') && ($('admin-admin-is-active').checked = admin.is_active !== false);
    showScreen('admin-admin-form-screen');
  }

  async function handleAdminForm(e) {
    if (e) e.preventDefault();
    const adminId = $('admin-admin-id')?.value;
    const payload = {
      full_name: $('admin-admin-full-name')?.value.trim(),
      email: $('admin-admin-email')?.value.trim(),
      role: $('admin-admin-role')?.value,
      is_active: $('admin-admin-is-active')?.checked,
    };
    if (!payload.full_name || !payload.email || !payload.role) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setLoading('admin-admin-form-btn', true);
    try {
      if (adminId) {
        await AdminAPI.updateAdmin(adminId, payload);
        showToast('Admin updated successfully', 'success');
      } else {
        payload.password = 'changeme123';
        await AdminAPI.createAdmin(payload);
        showToast('Admin created successfully', 'success');
      }
      hideAllScreens();
      showScreen('admin-admins-screen');
      loadAdmins();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading('admin-admin-form-btn', false);
    }
  }

  async function deleteAdmin(adminId) {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      await AdminAPI.deleteAdmin(adminId);
      showToast('Admin deleted', 'success');
      loadAdmins();
    } catch (err) {
      showToast('Failed to delete admin', 'error');
    }
  }

  // ─── Product Management ─────────────────────────────────────────────
  async function loadAdminProducts() {
    try {
      const data = await AdminAPI.getProducts({ limit: 100 });
      _adminProducts = data.data || data || [];
      renderAdminProductList();
    } catch (err) {
      showToast('Failed to load products', 'error');
    }
  }

  function renderAdminProductList() {
    const tbody = $('admin-prod-list-tbody');
    if (!tbody) return;
    if (!_adminProducts.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">No products found</td></tr>';
      return;
    }
    tbody.innerHTML = _adminProducts.map(p => `
      <tr>
        <td>${esc(p.name)}</td>
        <td>${esc(p.brand_name || p.brand || '—')}</td>
        <td>${fmtN(p.selling_price ?? p.price ?? 0)}</td>
        <td>${p.stock_quantity ?? p.stock ?? '—'}</td>
        <td>${esc(p.category_slug || '—')}</td>
        <td>
          <button class="btn btn-sm btn-primary admin-prod-edit-btn" data-prod-id="${esc(p._id || p.id)}">Edit</button>
          <button class="btn btn-sm btn-danger admin-prod-delete-btn" data-prod-id="${esc(p._id || p.id)}">Delete</button>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('.admin-prod-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openProductEdit(btn.dataset.prodId));
    });
    tbody.querySelectorAll('.admin-prod-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.prodId));
    });
  }

  function openProductEdit(productId) {
    const product = _adminProducts.find(p => (p._id || p.id) === productId);
    if (!product) return;
    $('admin-prod-id') && ($('admin-prod-id').value = product._id || product.id);
    $('admin-prod-name') && ($('admin-prod-name').value = product.name || '');
    $('admin-prod-price') && ($('admin-prod-price').value = product.selling_price ?? product.price ?? '');
    $('admin-prod-stock') && ($('admin-prod-stock').value = product.stock_quantity ?? product.stock ?? '');
    $('admin-prod-brand') && ($('admin-prod-brand').value = product.brand_name || product.brand || '');
    showScreen('admin-product-form-screen');
  }

  async function handleProductForm(e) {
    if (e) e.preventDefault();
    const productId = $('admin-prod-id')?.value;
    const payload = {
      name: $('admin-prod-name')?.value.trim(),
      selling_price: Number($('admin-prod-price')?.value) || 0,
      stock_quantity: Number($('admin-prod-stock')?.value) || 0,
      brand_name: $('admin-prod-brand')?.value.trim(),
    };
    if (!payload.name) {
      showToast('Product name is required', 'error');
      return;
    }
    setLoading('admin-prod-form-btn', true);
    try {
      if (productId) {
        await AdminAPI.updateProduct(productId, payload);
        showToast('Product updated', 'success');
      } else {
        showToast('Product created (ID assigned by server)', 'success');
      }
      hideAllScreens();
      showScreen('admin-products-screen');
      loadAdminProducts();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading('admin-prod-form-btn', false);
    }
  }

  async function deleteProduct(productId) {
    if (!confirm('Delete this product?')) return;
    try {
      await AdminAPI.deleteProduct(productId);
      showToast('Product deleted', 'success');
      loadAdminProducts();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  }

  // ─── Order Management ───────────────────────────────────────────────
  async function loadAdminOrders() {
    try {
      const data = await AdminAPI.getOrders({ limit: 100 });
      _adminOrders = data.data || data || [];
      renderAdminOrderList();
    } catch (err) {
      showToast('Failed to load orders', 'error');
    }
  }

  function renderAdminOrderList() {
    const tbody = $('admin-orders-list-tbody');
    if (!tbody) return;
    if (!_adminOrders.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">No orders found</td></tr>';
      return;
    }
    tbody.innerHTML = _adminOrders.map(o => `
      <tr>
        <td><code>${esc(o.order_number || o._id)}</code></td>
        <td>${esc(o.user_email || o.user?.email || '—')}</td>
        <td>${fmtN(o.total || 0)}</td>
        <td>
          <select class="admin-order-status-select" data-order-num="${esc(o.order_number || o._id)}">
            <option value="PENDING" ${o.status === 'PENDING' ? 'selected' : ''}>Pending</option>
            <option value="PROCESSING" ${o.status === 'PROCESSING' ? 'selected' : ''}>Processing</option>
            <option value="SHIPPED" ${o.status === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
            <option value="DELIVERED" ${o.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
            <option value="CANCELLED" ${o.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>${esc(o.created_at ? new Date(o.created_at).toLocaleDateString() : '—')}</td>
      </tr>`).join('');

    tbody.querySelectorAll('.admin-order-status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const orderNum = sel.dataset.orderNum;
        const status = sel.value;
        try {
          await AdminAPI.updateOrderStatus(orderNum, status);
          showToast(`Order ${orderNum} → ${status}`, 'success');
        } catch (err) {
          showToast('Failed to update order', 'error');
          sel.value = sel.dataset.prevValue || sel.value;
        }
      });
      sel.dataset.prevValue = sel.value;
    });
  }

  // ─── Banner Management ──────────────────────────────────────────────
  async function loadBanners() {
    try {
      const data = await AdminAPI.getBanners();
      _adminBanners = data.data || data || [];
      renderBannerList();
    } catch (err) {
      console.error('Failed to load banners', err);
    }
  }

  function renderBannerList() {
    const tbody = $('admin-banner-list-tbody');
    if (!tbody) return;
    if (!_adminBanners.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="admin-empty">No banners found</td></tr>';
      return;
    }
    tbody.innerHTML = _adminBanners.map(b => `
      <tr>
        <td>${esc(b.title || 'Untitled')}</td>
        <td>${esc(b.subtitle || '')}</td>
        <td>${b.is_active !== false ? 'Active' : 'Inactive'}</td>
        <td>
          <button class="btn btn-sm btn-primary admin-banner-edit-btn" data-banner-id="${esc(b._id || b.id)}">Edit</button>
          <button class="btn btn-sm btn-danger admin-banner-delete-btn" data-banner-id="${esc(b._id || b.id)}">Delete</button>
        </td>
      </tr>`).join('');
  }

  // ─── Discount Management ────────────────────────────────────────────
  async function loadDiscounts() {
    try {
      const data = await AdminAPI.getDiscounts();
      _adminDiscounts = data.data || data || [];
      renderDiscountList();
    } catch (err) {
      console.error('Failed to load discounts', err);
    }
  }

  function renderDiscountList() {
    const tbody = $('admin-discount-list-tbody');
    if (!tbody) return;
    if (!_adminDiscounts.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No discounts found</td></tr>';
      return;
    }
    tbody.innerHTML = _adminDiscounts.map(d => `
      <tr>
        <td>${esc(d.code || d.name || '—')}</td>
        <td>${d.discount_type || d.type || '—'}</td>
        <td>${d.discount_value ?? d.value ?? '—'}</td>
        <td>${d.is_active !== false ? 'Active' : 'Inactive'}</td>
        <td>
          <button class="btn btn-sm btn-primary admin-disc-edit-btn" data-disc-id="${esc(d._id || d.id)}">Edit</button>
          <button class="btn btn-sm btn-danger admin-disc-delete-btn" data-disc-id="${esc(d._id || d.id)}">Delete</button>
        </td>
      </tr>`).join('');
  }

  // ─── Settings ───────────────────────────────────────────────────────
  async function loadSettings() {
    try {
      const data = await AdminAPI.getSettings();
      _adminSettings = data.data || data || {};
      renderSettings();
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  }

  function renderSettings() {
    const form = $('admin-settings-form');
    if (!form) return;
    Object.entries(_adminSettings).forEach(([key, val]) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = val;
        } else {
          input.value = val;
        }
      }
    });
  }

  // ─── Navigation ─────────────────────────────────────────────────────
  function initNav() {
    $('admin-nav-dashboard')?.addEventListener('click', () => {
      showScreen('admin-dashboard-screen');
      loadDashboard();
    });
    $('admin-nav-admins')?.addEventListener('click', () => {
      showScreen('admin-admins-screen');
      loadAdmins();
    });
    $('admin-nav-products')?.addEventListener('click', () => {
      showScreen('admin-products-screen');
      loadAdminProducts();
    });
    $('admin-nav-orders')?.addEventListener('click', () => {
      showScreen('admin-orders-screen');
      loadAdminOrders();
    });
    $('admin-nav-banners')?.addEventListener('click', () => {
      showScreen('admin-banners-screen');
      loadBanners();
    });
    $('admin-nav-discounts')?.addEventListener('click', () => {
      showScreen('admin-discounts-screen');
      loadDiscounts();
    });
    $('admin-nav-settings')?.addEventListener('click', () => {
      showScreen('admin-settings-screen');
      loadSettings();
    });
    $('admin-nav-logout')?.addEventListener('click', handleLogout);

    $('admin-login-btn')?.addEventListener('click', handleLogin);
    $('admin-login-form')?.addEventListener('submit', handleLogin);

    $('admin-admin-form')?.addEventListener('submit', handleAdminForm);
    $('admin-prod-form')?.addEventListener('submit', handleProductForm);

    $('admin-create-admin-btn')?.addEventListener('click', openAdminCreate);
    $('admin-create-product-btn')?.addEventListener('click', () => {
      $('admin-prod-id') && ($('admin-prod-id').value = '');
      $('admin-prod-form')?.reset();
      showScreen('admin-product-form-screen');
    });

    $('admin-login-cancel')?.addEventListener('click', closeLogin);
    $('admin-dashboard-back')?.addEventListener('click', () => hideAllScreens());
    $('admin-admins-back')?.addEventListener('click', () => hideAllScreens());
    $('admin-products-back')?.addEventListener('click', () => hideAllScreens());
    $('admin-orders-back')?.addEventListener('click', () => hideAllScreens());
    $('admin-banners-back')?.addEventListener('click', () => hideAllScreens());
    $('admin-discounts-back')?.addEventListener('click', () => hideAllScreens());
    $('admin-settings-back')?.addEventListener('click', () => hideAllScreens());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _currentScreen) {
        hideAllScreens();
      }
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────
  function init() {
    loadAdminSession();
    initNav();

    if (_adminToken && _admin) {
      showScreen('admin-dashboard-screen');
      loadDashboard();
    }
  }

  return {
    init,
    openLogin,
    closeLogin,
    handleLogout,
    showScreen,
    hideAllScreens,
  };
})();