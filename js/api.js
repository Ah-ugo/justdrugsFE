/**
 * Just Drugs — API Client
 * Handles all communication with the FastAPI backend at /api/v1
 */

const API_BASE = 'https://justdrugsbe.onrender.com/api/v1';

// ─── Guest token (persisted in localStorage) ─────────────────────────────────
function getGuestToken() {
  let token = localStorage.getItem('jd_guest_token');
  if (!token) {
    token = 'guest_' + Math.random().toString(36).substring(2) + Date.now();
    localStorage.setItem('jd_guest_token', token);
  }
  return token;
}

// ─── Auth token ───────────────────────────────────────────────────────────────
function getAuthToken() {
  return localStorage.getItem('jd_auth_token') || null;
}

function setAuthToken(token) {
  if (token) localStorage.setItem('jd_auth_token', token);
  else localStorage.removeItem('jd_auth_token');
}

// ─── Base fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const authToken = getAuthToken();
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'API error');
  }
  return res.json();
}

// ─── Products / Shop ─────────────────────────────────────────────────────────
const ShopAPI = {
  /**
   * Fetch products with flexible query params.
   * Params: category_slug, featured, popular, new_arrival, best_seller,
   *         search, brand, min_price, max_price, requires_prescription,
   *         min_rating, sort, page, limit
   */
  async getProducts(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const query = qs.toString() ? `?${qs}` : '';
    return apiFetch(`/shop${query}`);
  },

  async autocomplete(q) {
    if (!q || q.length < 2) return { suggestions: [] };
    return apiFetch(`/shop/search/autocomplete?q=${encodeURIComponent(q)}&limit=8`);
  },
};

// ─── Categories ───────────────────────────────────────────────────────────────
const CategoriesAPI = {
  async list() {
    return apiFetch('/categories');
  },
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
const CartAPI = {
  _headers() {
    const headers = {};
    const authToken = getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else {
      headers['X-Guest-Token'] = getGuestToken();
    }
    return headers;
  },

  async get() {
    return apiFetch('/cart', { headers: this._headers() });
  },

  async addItem(productId, quantity = 1) {
    return apiFetch('/cart/items', {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  async updateItem(productId, quantity) {
    return apiFetch(`/cart/items/${productId}`, {
      method: 'PUT',
      headers: this._headers(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  async removeItem(productId) {
    return apiFetch(`/cart/items/${productId}`, {
      method: 'DELETE',
      headers: this._headers(),
    });
  },

  async clear() {
    return apiFetch('/cart', {
      method: 'DELETE',
      headers: this._headers(),
    });
  },
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
const AuthAPI = {
  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) setAuthToken(data.access_token);
    return data;
  },

  async register(payload) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.access_token) setAuthToken(data.access_token);
    return data;
  },

  async getProfile() {
    return apiFetch('/auth/me');
  },

  logout() {
    setAuthToken(null);
    localStorage.removeItem('jd_user');
  },

  isLoggedIn() {
    return !!getAuthToken();
  },
};

// ─── Orders ───────────────────────────────────────────────────────────────────
const OrdersAPI = {
  async track(query) {
    return apiFetch(`/orders/track?query=${encodeURIComponent(query)}`);
  },
};

// ─── Admin ──────────────────────────────────────────────────────────────
const AdminAPI = {
  async login(email, password) {
    const data = await apiFetch('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      localStorage.setItem('jd_admin_token', data.access_token);
      localStorage.setItem('jd_admin_refresh', data.refresh_token);
    }
    return data;
  },

  async refresh() {
    const refreshToken = localStorage.getItem('jd_admin_refresh');
    if (!refreshToken) return null;
    const data = await apiFetch('/admin/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (data.access_token) {
      localStorage.setItem('jd_admin_token', data.access_token);
      localStorage.setItem('jd_admin_refresh', data.refresh_token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem('jd_admin_token');
    localStorage.removeItem('jd_admin_refresh');
  },

  isLoggedIn() {
    return !!localStorage.getItem('jd_admin_token');
  },

  async getProfile() {
    return apiFetch('/admin/auth/me');
  },

  async createAdmin(payload) {
    return apiFetch('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async listAdmins(role, page, limit) {
    const qs = new URLSearchParams();
    if (role) qs.set('role', role);
    qs.set('page', String(page));
    qs.set('limit', String(limit));
    return apiFetch(`/admin/admins?${qs}`);
  },

  async updateAdmin(adminId, payload) {
    return apiFetch(`/admin/admins/${adminId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteAdmin(adminId) {
    return apiFetch(`/admin/admins/${adminId}`, {
      method: 'DELETE',
    });
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
    return apiFetch(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteProduct(productId) {
    return apiFetch(`/admin/products/${productId}`, {
      method: 'DELETE',
    });
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
    return apiFetch(`/admin/orders/${orderNumber}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async getBanners() {
    return apiFetch('/admin/banners');
  },

  async createBanner(payload) {
    return apiFetch('/admin/banners', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateBanner(bannerId, payload) {
    return apiFetch(`/admin/banners/${bannerId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteBanner(bannerId) {
    return apiFetch(`/admin/banners/${bannerId}`, {
      method: 'DELETE',
    });
  },

  async getDiscounts() {
    return apiFetch('/admin/discounts');
  },

  async createDiscount(payload) {
    return apiFetch('/admin/discounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateDiscount(discountId, payload) {
    return apiFetch(`/admin/discounts/${discountId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteDiscount(discountId) {
    return apiFetch(`/admin/discounts/${discountId}`, {
      method: 'DELETE',
    });
  },

  async getSettings() {
    return apiFetch('/admin/settings');
  },

  async updateSettings(payload) {
    return apiFetch('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
