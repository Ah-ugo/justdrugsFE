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
