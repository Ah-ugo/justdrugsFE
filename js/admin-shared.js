const API_BASE = 'https://justdrugsbe.onrender.com/api/v1';

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const session = getSession();
  if (session?.token) headers['Authorization'] = `Bearer ${session.token}`;
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
  async listProducts(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const query = qs.toString() ? `?${qs}` : '';
    return apiFetch(`/products${query}`);
  },
  async updateProduct(productId, payload) {
    return apiFetch(`/products/${productId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  async deleteProduct(productId) {
    return apiFetch(`/products/${productId}`, { method: 'DELETE' });
  },
  async listOrders(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const query = qs.toString() ? `?${qs}` : '';
    return apiFetch(`/orders${query}`);
  },
  async updateOrderStatus(orderNumber, status) {
    return apiFetch(`/orders/${orderNumber}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  },
  async listBanners() {
    return apiFetch('/banners');
  },
  async createBanner(payload) {
    return apiFetch('/banners', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateBanner(bannerId, payload) {
    return apiFetch(`/banners/${bannerId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  async deleteBanner(bannerId) {
    return apiFetch(`/banners/${bannerId}`, { method: 'DELETE' });
  },
  async listDiscounts() {
    return apiFetch('/discounts');
  },
  async createDiscount(payload) {
    return apiFetch('/discounts', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateDiscount(discountId, payload) {
    return apiFetch(`/discounts/${discountId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  async deleteDiscount(discountId) {
    return apiFetch(`/discounts/${discountId}`, { method: 'DELETE' });
  },
  async getSettings() {
    return apiFetch('/settings');
  },
  async updateSettings(payload) {
    return apiFetch('/settings', { method: 'PUT', body: JSON.stringify(payload) });
  },
};

function getSession() {
  try {
    const token = localStorage.getItem('jd_admin_token');
    const admin = JSON.parse(localStorage.getItem('jd_admin') || 'null');
    return token ? { token, admin } : null;
  } catch {
    return null;
  }
}

function saveSession(admin, token) {
  localStorage.setItem('jd_admin_token', token);
  localStorage.setItem('jd_admin', JSON.stringify(admin));
}

function clearSession() {
  localStorage.removeItem('jd_admin_token');
  localStorage.removeItem('jd_admin');
}

function requireAuth() {
  const session = getSession();
  if (!session?.token) {
    location.href = 'admin-login.html';
    throw new Error('Not authenticated');
  }
  return session;
}

function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  const remove = () => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  };
  const timer = setTimeout(remove, duration);
  toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
