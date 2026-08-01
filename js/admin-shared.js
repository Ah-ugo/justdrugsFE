/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Admin Shared Layer
   Layout renderer, API client, demo data, icons, utilities.
═══════════════════════════════════════════════════════════ */

const API_BASE = 'https://justdrugsbe.onrender.com/api/v1';

/* ─── Icons (feather-style, stroke-based) ───────────────── */
const ICONS = {
  dashboard: '<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  layers: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>',
  shoppingCart: '<circle cx="9" cy="21" r="1.5"/><circle cx="20" cy="21" r="1.5"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  truck: '<rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  percent: '<path d="M19 5L5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  barChart: '<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>',
  pieChart: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
  more: '<circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  chevronRight: '<path d="M9 18l6-6-6-6"/>',
  chevronLeft: '<path d="M15 18l-6-6 6-6"/>',
  x: '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  alertTriangle: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  sun: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M22 6l-10 7L2 6"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  package: '<path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/>',
  creditCard: '<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>',
  dollar: '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  trendingUp: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
  trendingDown: '<path d="M23 18l-9.5-9.5-5 5L1 6"/><path d="M17 18h6v-6"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  award: '<circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  refresh: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  pill: '<path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"/><path d="M9.5 14.5l5-5"/>',
  thermometer: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
  menu: '<path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
};

function icon(name, size = 20, cls = '') {
  const paths = ICONS[name] || ICONS.box;
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

/* ─── Session ──────────────────────────────────────────── */
function getSession() {
  try {
    const token = localStorage.getItem('jd_admin_token');
    const admin = JSON.parse(localStorage.getItem('jd_admin') || 'null');
    return token ? { token, admin } : null;
  } catch { return null; }
}
function saveSession(admin, token) {
  if (token) localStorage.setItem('jd_admin_token', token);
  if (admin) localStorage.setItem('jd_admin', JSON.stringify(admin));
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
function roleLabel(role) {
  const map = {
    super_admin: 'Super Admin', admin: 'Admin', pharmacist: 'Pharmacist',
    inventory_manager: 'Inventory Manager', customer_support: 'Customer Support',
    delivery_manager: 'Delivery Manager',
  };
  return map[role] || role || 'Admin';
}
function initials(name) {
  return String(name || 'A').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ─── Formatting utils ─────────────────────────────────── */
function fmtMoney(n, symbol = '₦') {
  return symbol + Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 });
}
function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-US');
}
function fmtCompact(n) {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(n || 0));
}
function fmtDate(d, opts = {}) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date)) return '—';
  if (opts.short) return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  if (opts.time) return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtRelative(d) {
  if (!d) return '—';
  const secs = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return fmtDate(d);
}
function pctChange(current, previous) {
  if (!previous) return { value: 100, dir: 'up' };
  const diff = ((current - previous) / previous) * 100;
  return { value: Math.abs(diff).toFixed(1), dir: diff >= 0 ? 'up' : 'down' };
}
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>')
    .replace(/"/g, '"').replace(/'/g, '&#39;');
}
function debounce(fn, ms = 300) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* ─── Toast ────────────────────────────────────────────── */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'checkCircle', error: 'alertCircle', warning: 'alertTriangle', info: 'bell' };
  const colors = { success: 'var(--success-600)', error: 'var(--danger-600)', warning: 'var(--warning-600)', info: 'var(--blue-500)' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span class="toast-icon" style="color:${colors[type]}">${icon(icons[type], 18)}</span>
    <span class="toast-message">${esc(message)}</span>
    <button class="toast-close" aria-label="Dismiss">${icon('x', 14)}</button>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  const remove = () => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  };
  const timer = setTimeout(remove, duration);
  toast.querySelector('.toast-close').addEventListener('click', () => { clearTimeout(timer); remove(); });
}

/* ─── Modal & Drawer helpers ───────────────────────────── */
function openModal(html, opts = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `<div class="modal ${opts.size ? 'modal-' + opts.size : ''}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('open'));
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop && opts.dismissible !== false) closeModal(backdrop);
  });
  const closeBtn = backdrop.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', () => closeModal(backdrop));
  document.addEventListener('keydown', function escKey(e) {
    if (e.key === 'Escape') { closeModal(backdrop); document.removeEventListener('keydown', escKey); }
  });
  return backdrop;
}
function closeModal(backdrop) {
  if (!backdrop) return;
  backdrop.classList.remove('open');
  setTimeout(() => backdrop.remove(), 240);
}
function openDrawer(html, opts = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';
  const drawer = document.createElement('aside');
  drawer.className = `drawer ${opts.size ? 'drawer-' + opts.size : ''}`;
  drawer.innerHTML = html;
  document.body.appendChild(backdrop);
  document.body.appendChild(drawer);
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
    drawer.classList.add('open');
  });
  backdrop.addEventListener('click', () => closeDrawer(drawer));
  const closeBtn = drawer.querySelector('.drawer-close');
  if (closeBtn) closeBtn.addEventListener('click', () => closeDrawer(drawer));
  document.addEventListener('keydown', function escKey(e) {
    if (e.key === 'Escape') { closeDrawer(drawer); document.removeEventListener('keydown', escKey); }
  });
  return { backdrop, drawer };
}
function closeDrawer(drawer) {
  if (!drawer) return;
  const backdrop = document.querySelector('.drawer-backdrop.open');
  drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  setTimeout(() => {
    drawer.remove();
    backdrop?.remove();
  }, 300);
}
function confirmDialog(message, opts = {}) {
  return new Promise((resolve) => {
    const modal = openModal(`
      <div class="modal-head">
        <h3 class="modal-title">${esc(opts.title || 'Please confirm')}</h3>
        <button class="modal-close" aria-label="Close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body">
        <div class="alert ${opts.variant ? 'alert-' + opts.variant : 'alert-warning'}" style="margin:0">
          <span class="alert-icon">${icon(opts.variant === 'danger' ? 'alertTriangle' : 'alertCircle', 20)}</span>
          <div>${message}</div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-act="cancel">Cancel</button>
        <button class="btn ${opts.variant === 'danger' ? 'btn-danger' : 'btn-primary'}" data-act="ok">${esc(opts.confirmText || 'Confirm')}</button>
      </div>`, { size: 'sm' });
    modal.querySelector('[data-act="cancel"]').addEventListener('click', () => { closeModal(modal); resolve(false); });
    modal.querySelector('[data-act="ok"]').addEventListener('click', () => { closeModal(modal); resolve(true); });
  });
}

/* ─── Skeleton loader ──────────────────────────────────── */
function skeletonRows(count = 5, cols = 6) {
  let rows = '';
  for (let i = 0; i < count; i++) {
    let cells = '';
    for (let j = 0; j < cols; j++) cells += `<td><div class="skeleton skeleton-line" style="width:${60 + ((j * 13) % 35)}%"></div></td>`;
    rows += `<tr>${cells}</tr>`;
  }
  return rows;
}

/* ─── Status badge helpers ─────────────────────────────── */
const ORDER_STATUS_META = {
  pending: { label: 'Pending', cls: 'badge-warning' },
  pending_payment: { label: 'Awaiting Payment', cls: 'badge-warning' },
  paid: { label: 'Paid', cls: 'badge-info' },
  prescription_review: { label: 'Rx Review', cls: 'badge-purple' },
  preparing: { label: 'Preparing', cls: 'badge-blue' },
  packed: { label: 'Packed', cls: 'badge-teal' },
  assigned: { label: 'Assigned', cls: 'badge-info' },
  out_for_delivery: { label: 'Out for Delivery', cls: 'badge-blue' },
  delivered: { label: 'Delivered', cls: 'badge-success' },
  cancelled: { label: 'Cancelled', cls: 'badge-danger' },
  refunded: { label: 'Refunded', cls: 'badge-gray' },
};
function orderStatusBadge(status) {
  const m = ORDER_STATUS_META[status] || { label: status || '—', cls: 'badge-gray' };
  return `<span class="badge ${m.cls}"><span class="badge-dot"></span>${esc(m.label)}</span>`;
}
const PAYMENT_STATUS_META = {
  pending: { label: 'Pending', cls: 'badge-warning' },
  paid: { label: 'Paid', cls: 'badge-success' },
  failed: { label: 'Failed', cls: 'badge-danger' },
  refunded: { label: 'Refunded', cls: 'badge-gray' },
};
function paymentStatusBadge(status) {
  const m = PAYMENT_STATUS_META[status] || { label: status || '—', cls: 'badge-gray' };
  return `<span class="badge ${m.cls}"><span class="badge-dot"></span>${esc(m.label)}</span>`;
}
function stockBadge(status) {
  const map = {
    IN_STOCK: { label: 'In Stock', cls: 'badge-success' },
    LOW_STOCK: { label: 'Low Stock', cls: 'badge-warning' },
    OUT_OF_STOCK: { label: 'Out of Stock', cls: 'badge-danger' },
    LOW_STOCK_EXPIRING: { label: 'Low + Expiring', cls: 'badge-rose' },
    EXPIRING: { label: 'Expiring', cls: 'badge-rose' },
    EXPIRED: { label: 'Expired', cls: 'badge-danger' },
  };
  const m = map[status] || { label: status || '—', cls: 'badge-gray' };
  return `<span class="badge ${m.cls}"><span class="badge-dot"></span>${esc(m.label)}</span>`;
}

/* ─── Demo data layer ──────────────────────────────────── */
const DemoData = (() => {
  const daysAgo = (n, h = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    if (h) d.setHours(d.getHours() - h);
    return d.toISOString();
  };
  const nd = (days) => {
    const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString();
  };

  const products = [
    { _id: 'p1001', name: 'Paracetamol 500mg Tablets', slug: 'paracetamol-500mg', sku: 'RX-PAR-500', brand_name: 'Emzor', generic_name: 'Paracetamol', category_name: 'Pain Relief', category_id: 'c1', price: 850, discount_price: 750, cost_price: 520, current_stock: 340, available_stock: 320, reserved_stock: 20, stock_status: 'IN_STOCK', requires_prescription: false, popular: true, featured: true, rating: 4.8, created_at: daysAgo(120), image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&h=120&fit=crop' },
    { _id: 'p1002', name: 'Amoxicillin 250mg Capsules', slug: 'amoxicillin-250mg', sku: 'RX-AMX-250', brand_name: 'Emzor', generic_name: 'Amoxicillin', category_name: 'Antibiotics', category_id: 'c2', price: 2400, discount_price: 2150, cost_price: 1500, current_stock: 85, available_stock: 72, reserved_stock: 13, stock_status: 'LOW_STOCK', requires_prescription: true, popular: true, rating: 4.6, created_at: daysAgo(95), image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=120&h=120&fit=crop' },
    { _id: 'p1003', name: 'Vitamin C 1000mg Effervescent', slug: 'vitamin-c-1000mg', sku: 'SUP-VITC-1000', brand_name: '7UP Health', generic_name: 'Ascorbic Acid', category_name: 'Vitamins', category_id: 'c3', price: 3200, discount_price: null, cost_price: 2100, current_stock: 520, available_stock: 510, reserved_stock: 10, stock_status: 'IN_STOCK', requires_prescription: false, popular: true, rating: 4.9, created_at: daysAgo(80), image: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=120&h=120&fit=crop' },
    { _id: 'p1004', name: 'Artemether-Lumefantrine 80/480mg', slug: 'artemether-lumefantrine', sku: 'RX-ART-80', brand_name: 'Coartem', generic_name: 'Artemether', category_name: 'Antimalarials', category_id: 'c4', price: 4200, discount_price: 3800, cost_price: 2900, current_stock: 45, available_stock: 30, reserved_stock: 15, stock_status: 'LOW_STOCK', requires_prescription: true, popular: true, rating: 4.7, created_at: daysAgo(70), image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=120&h=120&fit=crop' },
    { _id: 'p1005', name: 'Ibuprofen 400mg Tablets', slug: 'ibuprofen-400mg', sku: 'RX-IBU-400', brand_name: 'Fidson', generic_name: 'Ibuprofen', category_name: 'Pain Relief', category_id: 'c1', price: 950, discount_price: 850, cost_price: 560, current_stock: 0, available_stock: 0, reserved_stock: 0, stock_status: 'OUT_OF_STOCK', requires_prescription: false, rating: 4.5, created_at: daysAgo(60), image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=120&h=120&fit=crop' },
    { _id: 'p1006', name: 'Metformin 500mg Tablets', slug: 'metformin-500mg', sku: 'RX-MET-500', brand_name: 'Juhel', generic_name: 'Metformin', category_name: 'Diabetes', category_id: 'c5', price: 1800, discount_price: null, cost_price: 1100, current_stock: 220, available_stock: 215, reserved_stock: 5, stock_status: 'IN_STOCK', requires_prescription: true, rating: 4.4, created_at: daysAgo(55), image: 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=120&h=120&fit=crop' },
    { _id: 'p1007', name: 'Lisinopril 10mg Tablets', slug: 'lisinopril-10mg', sku: 'RX-LIS-10', brand_name: 'M&B', generic_name: 'Lisinopril', category_name: 'Blood Pressure', category_id: 'c6', price: 2600, discount_price: 2400, cost_price: 1700, current_stock: 130, available_stock: 125, reserved_stock: 5, stock_status: 'IN_STOCK', requires_prescription: true, rating: 4.3, created_at: daysAgo(48), image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=120&h=120&fit=crop' },
    { _id: 'p1008', name: 'ORS Sachets (20s)', slug: 'ors-sachets', sku: 'OTC-ORS-20', brand_name: 'Dextrolyte', generic_name: 'Oral Rehydration Salts', category_name: 'Digestive Health', category_id: 'c7', price: 1200, discount_price: 990, cost_price: 600, current_stock: 460, available_stock: 455, reserved_stock: 5, stock_status: 'IN_STOCK', requires_prescription: false, popular: true, rating: 4.7, created_at: daysAgo(40), image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=120&h=120&fit=crop' },
    { _id: 'p1009', name: 'Cetirizine 10mg Tablets', slug: 'cetirizine-10mg', sku: 'RX-CET-10', brand_name: 'Emzor', generic_name: 'Cetirizine', category_name: 'Allergy', category_id: 'c8', price: 750, discount_price: null, cost_price: 420, current_stock: 18, available_stock: 14, reserved_stock: 4, stock_status: 'LOW_STOCK', requires_prescription: false, rating: 4.6, created_at: daysAgo(33), image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&h=120&fit=crop' },
    { _id: 'p1010', name: 'Insulin Glargine 100IU/ml', slug: 'insulin-glargine', sku: 'RX-INS-100', brand_name: 'Sanofi', generic_name: 'Insulin Glargine', category_name: 'Diabetes', category_id: 'c5', price: 14500, discount_price: 13800, cost_price: 11000, current_stock: 24, available_stock: 21, reserved_stock: 3, stock_status: 'IN_STOCK', requires_prescription: true, rating: 4.9, created_at: daysAgo(28), image: 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=120&h=120&fit=crop' },
    { _id: 'p1011', name: 'Multivitamin Gummies (60s)', slug: 'multivitamin-gummies', sku: 'SUP-MVG-60', brand_name: 'Nature Made', generic_name: 'Multivitamin', category_name: 'Vitamins', category_id: 'c3', price: 5800, discount_price: 5200, cost_price: 3900, current_stock: 310, available_stock: 300, reserved_stock: 10, stock_status: 'IN_STOCK', requires_prescription: false, popular: true, featured: true, rating: 4.8, created_at: daysAgo(22), image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=120&h=120&fit=crop' },
    { _id: 'p1012', name: 'Azithromycin 500mg Tablets', slug: 'azithromycin-500mg', sku: 'RX-AZI-500', brand_name: 'Pfizer', generic_name: 'Azithromycin', category_name: 'Antibiotics', category_id: 'c2', price: 3200, discount_price: null, cost_price: 2100, current_stock: 6, available_stock: 4, reserved_stock: 2, stock_status: 'LOW_STOCK', requires_prescription: true, rating: 4.5, created_at: daysAgo(18), image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=120&h=120&fit=crop' },
    { _id: 'p1013', name: 'Hydrocortisone Cream 1%', slug: 'hydrocortisone-cream', sku: 'OTC-HYD-1', brand_name: 'Dermal', generic_name: 'Hydrocortisone', category_name: 'Skincare', category_id: 'c9', price: 2900, discount_price: 2600, cost_price: 1800, current_stock: 95, available_stock: 92, reserved_stock: 3, stock_status: 'IN_STOCK', requires_prescription: false, rating: 4.2, created_at: daysAgo(14), image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=120&h=120&fit=crop' },
    { _id: 'p1014', name: 'Salbutamol Inhaler 100mcg', slug: 'salbutamol-inhaler', sku: 'RX-SAL-100', brand_name: 'GSK', generic_name: 'Salbutamol', category_name: 'Asthma', category_id: 'c10', price: 6800, discount_price: 6400, cost_price: 4800, current_stock: 0, available_stock: 0, reserved_stock: 0, stock_status: 'OUT_OF_STOCK', requires_prescription: true, rating: 4.7, created_at: daysAgo(10), image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&h=120&fit=crop' },
    { _id: 'p1015', name: 'Folic Acid 5mg Tablets', slug: 'folic-acid-5mg', sku: 'RX-FOL-5', brand_name: 'Fidson', generic_name: 'Folic Acid', category_name: 'Pregnancy Care', category_id: 'c11', price: 650, discount_price: 550, cost_price: 300, current_stock: 640, available_stock: 635, reserved_stock: 5, stock_status: 'IN_STOCK', requires_prescription: false, rating: 4.6, created_at: daysAgo(6), image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=120&h=120&fit=crop' },
  ];

  const customers = [
    { id: 'u1', first_name: 'Adaeze', last_name: 'Okafor', email: 'adaeze.okafor@gmail.com', phone: '+234 803 555 0101', total_orders: 14, total_spend: 248500, loyalty_points: 1240, status: 'active', created_at: daysAgo(180), city: 'Lekki, Lagos' },
    { id: 'u2', first_name: 'Tunde', last_name: 'Bakare', email: 'tunde.bakare@yahoo.com', phone: '+234 805 555 0102', total_orders: 9, total_spend: 132400, loyalty_points: 640, status: 'active', created_at: daysAgo(150), city: 'Ikeja, Lagos' },
    { id: 'u3', first_name: 'Chiamaka', last_name: 'Eze', email: 'chiamaka.eze@gmail.com', phone: '+234 807 555 0103', total_orders: 3, total_spend: 28500, loyalty_points: 120, status: 'active', created_at: daysAgo(90), city: 'Abuja' },
    { id: 'u4', first_name: 'Ibrahim', last_name: 'Suleiman', email: 'ibrahim.suleiman@outlook.com', phone: '+234 809 555 0104', total_orders: 1, total_spend: 5400, loyalty_points: 20, status: 'inactive', created_at: daysAgo(60), city: 'Kano' },
    { id: 'u5', first_name: 'Ngozi', last_name: 'Adeyemi', email: 'ngozi.adeyemi@gmail.com', phone: '+234 802 555 0105', total_orders: 22, total_spend: 410000, loyalty_points: 2100, status: 'active', created_at: daysAgo(240), city: 'Victoria Island, Lagos' },
    { id: 'u6', first_name: 'Femi', last_name: 'Ogunlana', email: 'femi.ogunlana@gmail.com', phone: '+234 810 555 0106', total_orders: 6, total_spend: 74200, loyalty_points: 300, status: 'active', created_at: daysAgo(120), city: 'Yaba, Lagos' },
    { id: 'u7', first_name: 'Aisha', last_name: 'Mohammed', email: 'aisha.mohammed@gmail.com', phone: '+234 808 555 0107', total_orders: 11, total_spend: 156800, loyalty_points: 780, status: 'active', created_at: daysAgo(200), city: 'Ilorin' },
    { id: 'u8', first_name: 'Kelechi', last_name: 'Nwosu', email: 'kelechi.nwosu@gmail.com', phone: '+234 812 555 0108', total_orders: 2, total_spend: 12600, loyalty_points: 50, status: 'inactive', created_at: daysAgo(45), city: 'Port Harcourt' },
    { id: 'u9', first_name: 'Blessing', last_name: 'Uche', email: 'blessing.uche@gmail.com', phone: '+234 806 555 0109', total_orders: 5, total_spend: 63800, loyalty_points: 260, status: 'active', created_at: daysAgo(75), city: 'Enugu' },
    { id: 'u10', first_name: 'David', last_name: 'Okon', email: 'david.okon@gmail.com', phone: '+234 809 555 0110', total_orders: 8, total_spend: 97000, loyalty_points: 410, status: 'active', created_at: daysAgo(110), city: 'Calabar' },
  ];

  const orders = [
    { _id: 'o1001', order_number: 'JD-20250115-A1B2C3', customer: { name: 'Adaeze Okafor', email: 'adaeze.okafor@gmail.com', phone: '+234 803 555 0101' }, items: [{ name: 'Paracetamol 500mg', qty: 2, price: 750 }, { name: 'Vitamin C 1000mg', qty: 1, price: 3200 }], items_count: 3, subtotal: 4700, discount_amount: 0, tax_amount: 352.5, delivery_fee: 1500, total_amount: 6552.5, status: 'delivered', payment_status: 'paid', payment_method: 'card', created_at: daysAgo(1, 3), delivery_zone: 'Lekki', rider: 'Musa K.', tracking: 'TRK-JD-8821' },
    { _id: 'o1002', order_number: 'JD-20250115-C4D5E6', customer: { name: 'Tunde Bakare', email: 'tunde.bakare@yahoo.com', phone: '+234 805 555 0102' }, items: [{ name: 'Amoxicillin 250mg', qty: 1, price: 2150 }, { name: 'Cetirizine 10mg', qty: 2, price: 750 }], items_count: 3, subtotal: 3650, discount_amount: 0, tax_amount: 273.75, delivery_fee: 1500, total_amount: 5423.75, status: 'out_for_delivery', payment_status: 'paid', payment_method: 'transfer', created_at: daysAgo(1, 6), delivery_zone: 'Ikeja', rider: 'Chinedu O.', tracking: 'TRK-JD-8822' },
    { _id: 'o1003', order_number: 'JD-20250115-F7G8H9', customer: { name: 'Ngozi Adeyemi', email: 'ngozi.adeyemi@gmail.com', phone: '+234 802 555 0105' }, items: [{ name: 'Insulin Glargine 100IU', qty: 2, price: 13800 }, { name: 'Metformin 500mg', qty: 3, price: 1800 }], items_count: 5, subtotal: 33000, discount_amount: 1500, tax_amount: 2362.5, delivery_fee: 0, total_amount: 33862.5, status: 'preparing', payment_status: 'paid', payment_method: 'card', created_at: daysAgo(0, 8), delivery_zone: 'VI', rider: null, tracking: 'TRK-JD-8823' },
    { _id: 'o1004', order_number: 'JD-20250114-K1L2M3', customer: { name: 'Chiamaka Eze', email: 'chiamaka.eze@gmail.com', phone: '+234 807 555 0103' }, items: [{ name: 'ORS Sachets (20s)', qty: 2, price: 990 }, { name: 'Cetirizine 10mg', qty: 1, price: 750 }], items_count: 3, subtotal: 2730, discount_amount: 0, tax_amount: 204.75, delivery_fee: 1500, total_amount: 4434.75, status: 'prescription_review', payment_status: 'pending', payment_method: 'card', created_at: daysAgo(1, 12), delivery_zone: 'Abuja', rider: null, tracking: 'TRK-JD-8824' },
    { _id: 'o1005', order_number: 'JD-20250114-N4O5P6', customer: { name: 'Femi Ogunlana', email: 'femi.ogunlana@gmail.com', phone: '+234 810 555 0106' }, items: [{ name: 'Lisinopril 10mg', qty: 1, price: 2400 }, { name: 'Ibuprofen 400mg', qty: 1, price: 850 }], items_count: 2, subtotal: 3250, discount_amount: 0, tax_amount: 243.75, delivery_fee: 1500, total_amount: 4993.75, status: 'paid', payment_status: 'paid', payment_method: 'transfer', created_at: daysAgo(2, 4), delivery_zone: 'Yaba', rider: null, tracking: 'TRK-JD-8825' },
    { _id: 'o1006', order_number: 'JD-20250114-Q7R8S9', customer: { name: 'Aisha Mohammed', email: 'aisha.mohammed@gmail.com', phone: '+234 808 555 0107' }, items: [{ name: 'Multivitamin Gummies', qty: 1, price: 5200 }, { name: 'Folic Acid 5mg', qty: 2, price: 550 }], items_count: 3, subtotal: 6300, discount_amount: 0, tax_amount: 472.5, delivery_fee: 1500, total_amount: 8272.5, status: 'assigned', payment_status: 'paid', payment_method: 'card', created_at: daysAgo(2, 9), delivery_zone: 'Ilorin', rider: 'Blessing A.', tracking: 'TRK-JD-8826' },
    { _id: 'o1007', order_number: 'JD-20250113-T1U2V3', customer: { name: 'Ibrahim Suleiman', email: 'ibrahim.suleiman@outlook.com', phone: '+234 809 555 0104' }, items: [{ name: 'Artemether-Lumefantrine', qty: 1, price: 3800 }], items_count: 1, subtotal: 3800, discount_amount: 0, tax_amount: 285, delivery_fee: 1500, total_amount: 5585, status: 'cancelled', payment_status: 'refunded', payment_method: 'card', created_at: daysAgo(3, 2), delivery_zone: 'Kano', rider: null, tracking: 'TRK-JD-8827' },
    { _id: 'o1008', order_number: 'JD-20250113-W4X5Y6', customer: { name: 'Kelechi Nwosu', email: 'kelechi.nwosu@gmail.com', phone: '+234 812 555 0108' }, items: [{ name: 'Hydrocortisone Cream 1%', qty: 1, price: 2600 }, { name: 'Vitamin C 1000mg', qty: 1, price: 3200 }], items_count: 2, subtotal: 5800, discount_amount: 500, tax_amount: 397.5, delivery_fee: 1500, total_amount: 7197.5, status: 'pending_payment', payment_status: 'pending', payment_method: 'card', created_at: daysAgo(3, 7), delivery_zone: 'Port Harcourt', rider: null, tracking: 'TRK-JD-8828' },
    { _id: 'o1009', order_number: 'JD-20250112-Z7A8B9', customer: { name: 'Blessing Uche', email: 'blessing.uche@gmail.com', phone: '+234 806 555 0109' }, items: [{ name: 'Azithromycin 500mg', qty: 2, price: 3200 }, { name: 'ORS Sachets (20s)', qty: 1, price: 990 }], items_count: 3, subtotal: 7390, discount_amount: 0, tax_amount: 554.25, delivery_fee: 1500, total_amount: 9444.25, status: 'delivered', payment_status: 'paid', payment_method: 'transfer', created_at: daysAgo(4, 5), delivery_zone: 'Enugu', rider: 'Musa K.', tracking: 'TRK-JD-8829' },
    { _id: 'o1010', order_number: 'JD-20250112-C1D2E3', customer: { name: 'David Okon', email: 'david.okon@gmail.com', phone: '+234 809 555 0110' }, items: [{ name: 'Salbutamol Inhaler', qty: 1, price: 6400 }, { name: 'Paracetamol 500mg', qty: 3, price: 750 }], items_count: 4, subtotal: 8650, discount_amount: 0, tax_amount: 648.75, delivery_fee: 0, total_amount: 9298.75, status: 'packed', payment_status: 'paid', payment_method: 'card', created_at: daysAgo(4, 10), delivery_zone: 'Calabar', rider: null, tracking: 'TRK-JD-8830' },
  ];

  const prescriptions = [
    { _id: 'rx1', prescription_number: 'RX-4F2A9C1B', patient: 'Tunde Bakare', doctor: 'Dr. A. Bello', phone: '+234 805 555 0102', order_number: 'JD-20250115-C4D5E6', medicine: 'Amoxicillin 250mg', status: 'pending', submitted_at: daysAgo(0, 5), files: [{ url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600', type: 'image' }], notes: 'Rx for ear infection. 5 days course.' },
    { _id: 'rx2', prescription_number: 'RX-7B3E5D8A', patient: 'Chiamaka Eze', doctor: 'Dr. N. Adebayo', phone: '+234 807 555 0103', order_number: 'JD-20250114-K1L2M3', medicine: 'Loratadine 10mg', status: 'pending', submitted_at: daysAgo(1, 4), files: [{ url: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600', type: 'image' }], notes: '' },
    { _id: 'rx3', prescription_number: 'RX-9C1D7F2E', patient: 'Ngozi Adeyemi', doctor: 'Dr. K. Osei', phone: '+234 802 555 0105', order_number: 'JD-20250115-F7G8H9', medicine: 'Insulin Glargine', status: 'approved', submitted_at: daysAgo(1, 20), reviewed_at: daysAgo(1, 15), files: [{ url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', type: 'image' }], pharmacist_notes: 'Valid Rx confirmed. 2 vials dispensed.', notes: 'Monthly refill' },
    { _id: 'rx4', prescription_number: 'RX-2E4G6H8I', patient: 'Femi Ogunlana', doctor: null, phone: '+234 810 555 0106', order_number: 'JD-20250114-N4O5P6', medicine: 'Lisinopril 10mg', status: 'need_better_image', submitted_at: daysAgo(2, 8), files: [{ url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600', type: 'image' }], rejection_reason: 'Image blurry. Please retake.' },
    { _id: 'rx5', prescription_number: 'RX-5H7J9K1L', patient: 'Aisha Mohammed', doctor: 'Dr. F. Yusuf', phone: '+234 808 555 0107', order_number: 'JD-20250114-Q7R8S9', medicine: 'Metformin 500mg', status: 'approved', submitted_at: daysAgo(2, 22), reviewed_at: daysAgo(2, 18), files: [{ url: 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=600', type: 'image' }], pharmacist_notes: 'Verified, 3 months supply.', notes: 'Type 2 diabetes' },
    { _id: 'rx6', prescription_number: 'RX-3M5N7P9Q', patient: 'Blessing Uche', doctor: null, phone: '+234 806 555 0109', order_number: 'JD-20250112-Z7A8B9', medicine: 'Azithromycin 500mg', status: 'rejected', submitted_at: daysAgo(3, 6), files: [{ url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600', type: 'image' }], rejection_reason: 'Prescription expired. Request a new one from your doctor.' },
    { _id: 'rx7', prescription_number: 'RX-8R1S3T5U', patient: 'David Okon', doctor: 'Dr. P. Eze', phone: '+234 809 555 0110', order_number: 'JD-20250112-C1D2E3', medicine: 'Salbutamol Inhaler', status: 'expired', submitted_at: daysAgo(9, 3), files: [{ url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', type: 'image' }], rejection_reason: 'No response within 7 days.' },
  ];

  const inventory = products.map(p => ({
    product_id: p._id, product_name: p.name, sku: p.sku, brand: p.brand_name,
    current_stock: p.current_stock, reserved_stock: p.reserved_stock,
    available_stock: p.available_stock, minimum_stock: 10, maximum_stock: 500,
    reorder_level: 20, batch_number: 'B-' + (Math.floor(Math.random() * 90000) + 10000),
    supplier: ['Emzor Pharma', 'Fidson Healthcare', 'Juhel Nigeria', 'Bayer AG'][Math.floor(Math.random() * 4)],
    expiry_date: nd(Math.floor(Math.random() * 200) - 10),
    warehouse: ['Main Warehouse', 'Lekki Hub', 'Ikeja Depot'][Math.floor(Math.random() * 3)],
    status: p.stock_status,
  }));

  const banners = [
    { _id: 'b1', name: 'Homepage Hero', placement: 'hero', type: 'hero', status: 'active', active: true, start_date: daysAgo(10), end_date: nd(20), ads: [{ title: 'Free Delivery on Orders Above ₦25,000', subtitle: 'Shop vitamins & wellness today', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800', cta: { label: 'Shop Now', link: '/shop' }, active: true }] },
    { _id: 'b2', name: 'Seasonal Sale', placement: 'shop', type: 'shop', status: 'scheduled', active: true, start_date: nd(2), end_date: nd(12), ads: [{ title: 'Up to 40% Off Pain Relief', subtitle: 'Limited time offer', image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800', cta: { label: 'Explore Deals', link: '/shop/pain-relief' }, active: true }] },
    { _id: 'b3', name: 'Sidebar Promo', placement: 'sidebar', type: 'sidebar', status: 'active', active: true, start_date: daysAgo(5), end_date: nd(30), ads: [{ title: 'Get 10% Off Your First Order', subtitle: 'Use code WELCOME10', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400', cta: { label: 'Claim Offer', link: '/signup' }, active: true }] },
    { _id: 'b4', name: 'Category Popup — Vitamins', placement: 'category_popup', type: 'category_popup', status: 'draft', active: false, ads: [{ title: 'Boost Your Immunity', subtitle: 'Vitamin C & Zinc bundles', image: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=600', cta: { label: 'Shop Vitamins', link: '/shop/vitamins' }, active: false }] },
    { _id: 'b5', name: 'App Launch Announcement', placement: 'announcement', type: 'announcement', status: 'active', active: true, start_date: daysAgo(1), end_date: nd(7), ads: [{ title: '📱 Just Drugs App is Live', subtitle: 'Download on iOS & Android', image: null, cta: { label: 'Get the App', link: '/app' }, active: true }] },
  ];

  const discounts = [
    { _id: 'd1', code: 'WELCOME10', type: 'percentage', value: 10, kind: 'coupon', status: 'active', active: true, usage_count: 142, maximum_uses: 1000, minimum_purchase: 5000, maximum_discount: 5000, start_date: daysAgo(20), end_date: nd(40) },
    { _id: 'd2', code: 'PAIN40', type: 'percentage', value: 40, kind: 'product_discount', status: 'active', active: true, usage_count: 87, maximum_uses: 500, minimum_purchase: 0, maximum_discount: 15000, start_date: daysAgo(3), end_date: nd(9), applies_to: 'Pain Relief Category' },
    { _id: 'd3', code: 'FLAT1500', type: 'fixed_amount', value: 1500, kind: 'fixed', status: 'active', active: true, usage_count: 64, maximum_uses: 300, minimum_purchase: 10000, start_date: daysAgo(8), end_date: nd(5) },
    { _id: 'd4', code: 'FLASH-SAT', type: 'percentage', value: 25, kind: 'flash_sale', status: 'scheduled', active: true, usage_count: 0, maximum_uses: 200, minimum_purchase: 0, maximum_discount: 10000, start_date: nd(1), end_date: nd(3) },
    { _id: 'd5', code: 'VITC20', type: 'percentage', value: 20, kind: 'category_discount', status: 'expired', active: false, usage_count: 210, maximum_uses: 500, minimum_purchase: 3000, maximum_discount: 8000, start_date: daysAgo(45), end_date: daysAgo(5), applies_to: 'Vitamins Category' },
  ];

  const reviews = [
    { _id: 'r1', product_name: 'Paracetamol 500mg', customer: 'Adaeze Okafor', rating: 5, comment: 'Fast relief from headaches. Great value.', status: 'approved', verified: true, created_at: daysAgo(2, 4) },
    { _id: 'r2', product_name: 'Vitamin C 1000mg', customer: 'Tunde Bakare', rating: 4, comment: 'Good quality, arrived well packaged.', status: 'approved', verified: true, created_at: daysAgo(3, 6) },
    { _id: 'r3', product_name: 'Amoxicillin 250mg', customer: 'Ibrahim Suleiman', rating: 5, comment: 'Authentic product, worked as expected.', status: 'pending', verified: true, created_at: daysAgo(0, 3) },
    { _id: 'r4', product_name: 'ORS Sachets (20s)', customer: 'Chiamaka Eze', rating: 4, comment: 'Helpful for my son\'s dehydration.', status: 'pending', verified: true, created_at: daysAgo(1, 2) },
    { _id: 'r5', product_name: 'Multivitamin Gummies', customer: 'Ngozi Adeyemi', rating: 5, comment: 'Kids love them! Great taste.', status: 'approved', verified: true, created_at: daysAgo(4, 8) },
    { _id: 'r6', product_name: 'Insulin Glargine', customer: 'Femi Ogunlana', rating: 2, comment: 'Packaging was slightly damaged.', status: 'pending', verified: false, created_at: daysAgo(0, 9) },
  ];

  const delivery = [
    { _id: 'dv1', order_number: 'JD-20250115-C4D5E6', rider: 'Chinedu O.', rider_phone: '+234 803 111 2222', zone: 'Ikeja', status: 'out_for_delivery', eta: 'Today, 4:30 PM', customer: 'Tunde Bakare', address: '12 Awolowo Way, Ikeja', created_at: daysAgo(1, 6) },
    { _id: 'dv2', order_number: 'JD-20250115-F7G8H9', rider: '—', rider_phone: '—', zone: 'Victoria Island', status: 'preparing', eta: 'Today, 6:00 PM', customer: 'Ngozi Adeyemi', address: '5 Akin Adesola St, VI', created_at: daysAgo(0, 8) },
    { _id: 'dv3', order_number: 'JD-20250114-Q7R8S9', rider: 'Blessing A.', rider_phone: '+234 806 333 4444', zone: 'Ilorin', status: 'assigned', eta: 'Tomorrow, 10 AM', customer: 'Aisha Mohammed', address: '7 Tanke Road, Ilorin', created_at: daysAgo(2, 9) },
    { _id: 'dv4', order_number: 'JD-20250115-A1B2C3', rider: 'Musa K.', rider_phone: '+234 807 555 6666', zone: 'Lekki', status: 'delivered', eta: 'Delivered', customer: 'Adaeze Okafor', address: '3 Admiralty Way, Lekki', created_at: daysAgo(1, 3) },
    { _id: 'dv5', order_number: 'JD-20250112-C1D2E3', rider: '—', rider_phone: '—', zone: 'Calabar', status: 'packed', eta: 'Tomorrow, 12 PM', customer: 'David Okon', address: '19 Marian Road, Calabar', created_at: daysAgo(4, 10) },
    { _id: 'dv6', order_number: 'JD-20250113-T1U2V3', rider: '—', rider_phone: '—', zone: 'Kano', status: 'cancelled', eta: '—', customer: 'Ibrahim Suleiman', address: '4 Zoo Road, Kano', created_at: daysAgo(3, 2) },
  ];

  const admins = [
    { id: 'a1', full_name: 'Adebayo Oluwaseun', email: 'adebayo@justdrugs.com', role: 'super_admin', is_active: true, last_login: daysAgo(0, 1) },
    { id: 'a2', full_name: 'Maryam Abdullahi', email: 'maryam@justdrugs.com', role: 'pharmacist', is_active: true, last_login: daysAgo(0, 2) },
    { id: 'a3', full_name: 'John Akpan', email: 'john@justdrugs.com', role: 'inventory_manager', is_active: true, last_login: daysAgo(1, 5) },
    { id: 'a4', full_name: 'Sarah Oyelaran', email: 'sarah@justdrugs.com', role: 'customer_support', is_active: true, last_login: daysAgo(0, 6) },
    { id: 'a5', full_name: 'Emeka Obi', email: 'emeka@justdrugs.com', role: 'delivery_manager', is_active: true, last_login: daysAgo(2, 3) },
    { id: 'a6', full_name: 'Funke Adeleke', email: 'funke@justdrugs.com', role: 'admin', is_active: false, last_login: daysAgo(20, 0) },
  ];

  const notifications = [
    { _id: 'n1', title: 'New order received', body: 'Order JD-20250115-C4D5E6 from Tunde Bakare', time: daysAgo(0, 6), type: 'order', read: false },
    { _id: 'n2', title: 'Prescription pending review', body: 'RX-4F2A9C1B uploaded by Tunde Bakare', time: daysAgo(0, 5), type: 'prescription', read: false },
    { _id: 'n3', title: 'Low stock alert', body: 'Amoxicillin 250mg is below reorder level', time: daysAgo(0, 9), type: 'inventory', read: false },
    { _id: 'n4', title: 'Payment received', body: '₦33,862.50 for JD-20250115-F7G8H9', time: daysAgo(0, 8), type: 'payment', read: false },
    { _id: 'n5', title: 'New customer registered', body: 'Chiamaka Eze created an account', time: daysAgo(1, 2), type: 'customer', read: true },
    { _id: 'n6', title: 'Banner published', body: 'Seasonal Sale is now live', time: daysAgo(2, 4), type: 'banner', read: true },
    { _id: 'n7', title: 'Coupon redeemed', body: 'WELCOME10 used by Ngozi Adeyemi', time: daysAgo(2, 7), type: 'discount', read: true },
    { _id: 'n8', title: 'Product created', body: 'Folic Acid 5mg was added to catalog', time: daysAgo(6, 1), type: 'product', read: true },
  ];

  const auditLogs = [
    { id: 'lg1', user: 'Adebayo Oluwaseun', role: 'super_admin', action: 'Updated product', module: 'Products', date: daysAgo(0, 1), ip: '197.210.52.14', status: 'success' },
    { id: 'lg2', user: 'Maryam Abdullahi', role: 'pharmacist', action: 'Approved prescription RX-9C1D7F2E', module: 'Prescriptions', date: daysAgo(1, 15), ip: '197.210.52.18', status: 'success' },
    { id: 'lg3', user: 'John Akpan', role: 'inventory_manager', action: 'Restocked Paracetamol 500mg (+200)', module: 'Inventory', date: daysAgo(1, 8), ip: '197.210.52.22', status: 'success' },
    { id: 'lg4', user: 'Sarah Oyelaran', role: 'customer_support', action: 'Updated order status to refunded', module: 'Orders', date: daysAgo(2, 2), ip: '197.210.52.31', status: 'success' },
    { id: 'lg5', user: 'Emeka Obi', role: 'delivery_manager', action: 'Assigned rider to JD-20250114-Q7R8S9', module: 'Delivery', date: daysAgo(2, 9), ip: '197.210.52.27', status: 'success' },
    { id: 'lg6', user: 'Adebayo Oluwaseun', role: 'super_admin', action: 'Attempted to delete category', module: 'Categories', date: daysAgo(3, 4), ip: '197.210.52.14', status: 'failed' },
    { id: 'lg7', user: 'Funke Adeleke', role: 'admin', action: 'Published banner: Homepage Hero', module: 'Banners', date: daysAgo(4, 1), ip: '197.210.52.40', status: 'success' },
    { id: 'lg8', user: 'Adebayo Oluwaseun', role: 'super_admin', action: 'Updated SMTP settings', module: 'Settings', date: daysAgo(5, 3), ip: '197.210.52.14', status: 'success' },
  ];

  const categories = [
    { _id: 'c1', name: 'Pain Relief', slug: 'pain-relief', emoji: '💊', description: 'Analgesics and pain management', featured: true, active: true, sort_order: 1, product_count: 42 },
    { _id: 'c2', name: 'Antibiotics', slug: 'antibiotics', emoji: '🦠', description: 'Antibacterial medications', featured: true, active: true, sort_order: 2, product_count: 28 },
    { _id: 'c3', name: 'Vitamins', slug: 'vitamins', emoji: '🍊', description: 'Vitamins, minerals & supplements', featured: true, active: true, sort_order: 3, product_count: 65 },
    { _id: 'c4', name: 'Antimalarials', slug: 'antimalarials', emoji: '🦟', description: 'Malaria treatment & prevention', featured: false, active: true, sort_order: 4, product_count: 19 },
    { _id: 'c5', name: 'Diabetes Care', slug: 'diabetes', emoji: '🩸', description: 'Diabetes management products', featured: true, active: true, sort_order: 5, product_count: 24 },
    { _id: 'c6', name: 'Blood Pressure', slug: 'blood-pressure', emoji: '🫀', description: 'Hypertension medication', featured: false, active: true, sort_order: 6, product_count: 17 },
    { _id: 'c7', name: 'Digestive Health', slug: 'digestive-health', emoji: '🫁', description: 'GI health & ORS', featured: false, active: true, sort_order: 7, product_count: 23 },
    { _id: 'c8', name: 'Allergy', slug: 'allergy', emoji: '🤧', description: 'Antihistamines & allergy relief', featured: false, active: true, sort_order: 8, product_count: 12 },
    { _id: 'c9', name: 'Skincare', slug: 'skincare', emoji: '🧴', description: 'Dermatological care', featured: false, active: true, sort_order: 9, product_count: 31 },
    { _id: 'c10', name: 'Asthma & Respiratory', slug: 'asthma', emoji: '🫁', description: 'Inhalers & respiratory care', featured: false, active: true, sort_order: 10, product_count: 15 },
    { _id: 'c11', name: 'Pregnancy Care', slug: 'pregnancy', emoji: '🤰', description: 'Prenatal & maternal health', featured: false, active: true, sort_order: 11, product_count: 20 },
  ];

  const brands = [
    { _id: 'b1', name: 'Emzor', slug: 'emzor', description: 'Nigerian pharmaceutical brand', featured: true, active: true, product_count: 38 },
    { _id: 'b2', name: 'Fidson', slug: 'fidson', description: 'Healthcare manufacturer', featured: true, active: true, product_count: 22 },
    { _id: 'b3', name: 'Juhel', slug: 'juhel', description: 'Nigerian drug manufacturer', featured: false, active: true, product_count: 17 },
    { _id: 'b4', name: 'Pfizer', slug: 'pfizer', description: 'Global biopharmaceutical company', featured: true, active: true, product_count: 14 },
    { _id: 'b5', name: 'GSK', slug: 'gsk', description: 'GlaxoSmithKline', featured: false, active: true, product_count: 11 },
    { _id: 'b6', name: 'Sanofi', slug: 'sanofi', description: 'Global healthcare leader', featured: false, active: true, product_count: 9 },
  ];

  const topProducts = [
    { _id: 'p1001', name: 'Paracetamol 500mg', sales: 1240, revenue: 930000 },
    { _id: 'p1003', name: 'Vitamin C 1000mg', sales: 986, revenue: 3155200 },
    { _id: 'p1008', name: 'ORS Sachets (20s)', sales: 720, revenue: 712800 },
    { _id: 'p1002', name: 'Amoxicillin 250mg', sales: 540, revenue: 1161000 },
    { _id: 'p1011', name: 'Multivitamin Gummies', sales: 480, revenue: 2496000 },
  ];

  const series = {
    sales30: [42, 55, 48, 62, 58, 70, 66, 78, 72, 85, 80, 92, 88, 95, 102, 96, 110, 118, 112, 124, 130, 126, 138, 145, 140, 152, 160, 155, 168, 175],
    revenue12: [2.4, 3.1, 2.8, 3.6, 4.2, 3.9, 4.8, 5.4, 5.1, 6.2, 7.1, 7.8],
    customers12: [320, 380, 410, 455, 520, 610, 680, 760, 890, 1040, 1250, 1480],
    orders7: [38, 42, 35, 51, 47, 62, 58],
    inventoryTrend: [520, 510, 495, 480, 470, 452, 440, 428, 415, 405, 398, 390],
  };

  const revenue = orders.reduce((s, o) => s + (o.payment_status === 'paid' ? o.total_amount : 0), 0);

  return {
    products, customers, orders, prescriptions, inventory, banners, discounts,
    reviews, delivery, admins, notifications, auditLogs, categories, brands,
    topProducts, series, revenue,
    daysAgo, nd,
  };
})();

/* ─── API client with demo fallback ────────────────────── */
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const session = getSession();
  if (session?.token) headers['Authorization'] = `Bearer ${session.token}`;
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'API error');
    }
    return res.json();
  } catch (err) {
    const demo = handleDemoRequest(path, options);
    if (demo) return demo;
    throw err;
  }
}

function handleDemoRequest(path, options) {
  const method = (options.method || 'GET').toUpperCase();
  const data = DemoData;

  const map = [
    { re: /^\/admin\/auth\/me$/, fn: () => ({ data: getSession()?.admin || { id: 'a1', email: 'adebayo@justdrugs.com', role: 'super_admin', full_name: 'Adebayo Oluwaseun', permissions: ['*'] } }) },
    { re: /^\/admin\/admins/, fn: () => ({ data: data.admins, meta: { page: 1, limit: 20, total: data.admins.length, pages: 1 } }) },
    { re: /^\/products$/, fn: () => ({ data: data.products, meta: { page: 1, limit: 20, total: data.products.length, pages: 1 } }) },
    { re: /^\/products\/[^/]+$/, fn: () => ({ data: data.products[0] }) },
    { re: /^\/categories$/, fn: () => ({ data: data.categories }) },
    { re: /^\/brands$/, fn: () => ({ data: data.brands }) },
    { re: /^\/inventory\/alerts\/low-stock$/, fn: () => ({ data: data.inventory.filter(i => ['LOW_STOCK', 'OUT_OF_STOCK'].includes(i.status)) }) },
    { re: /^\/inventory\/[^/]+$/, fn: () => ({ data: data.inventory[0] }) },
    { re: /^\/orders$/, fn: () => ({ data: data.orders }) },
    { re: /^\/orders\/[^/]+$/, fn: () => ({ data: data.orders[0] }) },
    { re: /^\/prescriptions\/pharmacist\/queue/, fn: () => ({ data: data.prescriptions }) },
    { re: /^\/banners$/, fn: () => ({ data: data.banners }) },
    { re: /^\/discounts$/, fn: () => ({ data: data.discounts }) },
    { re: /^\/reviews$/, fn: () => ({ data: data.reviews }) },
    { re: /^\/delivery\/zones$/, fn: () => ({ data: [{ _id: 'z1', name: 'Lekki', fee: 1500, active: true }, { _id: 'z2', name: 'Ikeja', fee: 1500, active: true }, { _id: 'z3', name: 'Victoria Island', fee: 1200, active: true }, { _id: 'z4', name: 'Yaba', fee: 1400, active: true }, { _id: 'z5', name: 'Abuja', fee: 2500, active: true }] }) },
    { re: /^\/delivery\/track\//, fn: () => ({ data: data.delivery[0] }) },
    { re: /^\/settings$/, fn: () => ({ data: { currency_symbol: '₦', currency_code: 'NGN', tax_rate_percent: 7.5, default_delivery_fee: 1500, free_delivery_threshold: 25000, maintenance_mode: false, enable_prescriptions: true, company_name: 'Just Drugs', company_email: 'hello@justdrugs.com', company_phone: '+234 800 123 4567', company_address: '12 Admiralty Way, Lekki, Lagos' } }) },
    { re: /^\/analytics\/dashboard$/, fn: () => ({ data: { metrics: { total_revenue: data.revenue, total_paid_orders: 186, total_customers: 1480, low_stock_items_count: 4, pending_prescriptions_count: 2 }, top_selling_products: data.topProducts } }) },
    { re: /^\/notifications/, fn: () => ({ data: data.notifications }) },
    { re: /^\/users/, fn: () => ({ data: data.customers }) },
  ];

  const hit = map.find(m => m.re.test(path));
  if (hit && method === 'GET') return hit.fn();

  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    return { data: {}, message: 'Demo: operation simulated successfully' };
  }
  return null;
}

const AdminAPI = {
  async login(email, password) {
    const data = await apiFetch('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    return data;
  },
  async getProfile() { return apiFetch('/admin/auth/me'); },
  async createAdmin(payload) { return apiFetch('/admin/admins', { method: 'POST', body: JSON.stringify(payload) }); },
  async listAdmins(role, page, limit) {
    const qs = new URLSearchParams();
    if (role) qs.set('role', role);
    qs.set('page', String(page)); qs.set('limit', String(limit));
    return apiFetch(`/admin/admins?${qs}`);
  },
  async updateAdmin(adminId, payload) { return apiFetch(`/admin/admins/${adminId}`, { method: 'PATCH', body: JSON.stringify(payload) }); },
  async deleteAdmin(adminId) { return apiFetch(`/admin/admins/${adminId}`, { method: 'DELETE' }); },

  async listProducts(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v); });
    const query = qs.toString() ? `?${qs}` : '';
    return apiFetch(`/products${query}`);
  },
  async getProduct(id) { return apiFetch(`/products/${id}`); },
  async createProduct(payload) { return apiFetch('/products', { method: 'POST', body: JSON.stringify(payload) }); },
  async updateProduct(productId, payload) { return apiFetch(`/products/${productId}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  async deleteProduct(productId) { return apiFetch(`/products/${productId}`, { method: 'DELETE' }); },

  async listCategories() { return apiFetch('/categories?active_only=false'); },
  async createCategory(payload) { return apiFetch('/categories', { method: 'POST', body: JSON.stringify(payload) }); },
  async updateCategory(id, payload) { return apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  async deleteCategory(id) { return apiFetch(`/categories/${id}`, { method: 'DELETE' }); },

  async listBrands() { return apiFetch('/brands?active_only=false'); },
  async createBrand(payload) { return apiFetch('/brands', { method: 'POST', body: JSON.stringify(payload) }); },
  async updateBrand(id, payload) { return apiFetch(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  async deleteBrand(id) { return apiFetch(`/brands/${id}`, { method: 'DELETE' }); },

  async getInventory(productId) { return apiFetch(`/inventory/${productId}`); },
  async restock(payload) { return apiFetch('/inventory/restock', { method: 'POST', body: JSON.stringify(payload) }); },
  async adjustStock(payload) { return apiFetch('/inventory/adjust', { method: 'POST', body: JSON.stringify(payload) }); },
  async lowStockAlerts() { return apiFetch('/inventory/alerts/low-stock'); },

  async listOrders(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v); });
    const query = qs.toString() ? `?${qs}` : '';
    return apiFetch(`/orders${query}`);
  },
  async getOrder(orderNumber) { return apiFetch(`/orders/${orderNumber}`); },
  async updateOrderStatus(orderNumber, status) { return apiFetch(`/orders/${orderNumber}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); },
  async getOrderInvoice(orderNumber) { return apiFetch(`/orders/${orderNumber}/invoice`); },

  async listPrescriptions(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch(`/prescriptions/pharmacist/queue${qs}`);
  },
  async reviewPrescription(id, payload) { return apiFetch(`/prescriptions/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }); },

  async listBanners() { return apiFetch('/banners'); },
  async createBanner(payload) { return apiFetch('/banners', { method: 'POST', body: JSON.stringify(payload) }); },
  async updateBanner(bannerId, payload) { return apiFetch(`/banners/${bannerId}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  async deleteBanner(bannerId) { return apiFetch(`/banners/${bannerId}`, { method: 'DELETE' }); },

  async listDiscounts() { return apiFetch('/discounts'); },
  async createDiscount(payload) { return apiFetch('/discounts', { method: 'POST', body: JSON.stringify(payload) }); },
  async updateDiscount(discountId, payload) { return apiFetch(`/discounts/${discountId}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  async deleteDiscount(discountId) { return apiFetch(`/discounts/${discountId}`, { method: 'DELETE' }); },

  async listDelivery() { return apiFetch('/delivery/orders'); },
  async listZones() { return apiFetch('/delivery/zones'); },
  async createZone(payload) { return apiFetch('/delivery/zones', { method: 'POST', body: JSON.stringify(payload) }); },
  async assignRider(orderId, payload) { return apiFetch(`/delivery/orders/${orderId}/assign`, { method: 'PATCH', body: JSON.stringify(payload) }); },
  async updateDeliveryStatus(orderId, payload) { return apiFetch(`/delivery/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify(payload) }); },

  async listCustomers() { return apiFetch('/users'); },
  async listReviews() { return apiFetch('/reviews'); },
  async getSettings() { return apiFetch('/settings'); },
  async updateSettings(payload) { return apiFetch('/settings', { method: 'PUT', body: JSON.stringify(payload) }); },
  async getDashboard() { return apiFetch('/analytics/dashboard'); },
  async listNotifications() { return apiFetch('/notifications'); },
};

/* ─── Theme ────────────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('jd_theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', current);
  localStorage.setItem('jd_theme', current);
}

/* ─── Layout renderer ──────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: 'admin.html', icon: 'dashboard' },
      { key: 'analytics', label: 'Analytics', href: 'admin-analytics.html', icon: 'barChart' },
      { key: 'reports', label: 'Reports', href: 'admin-reports.html', icon: 'pieChart' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { key: 'products', label: 'Products', href: 'admin-products.html', icon: 'box', badge: 15 },
      { key: 'categories', label: 'Categories', href: 'admin-categories.html', icon: 'layers' },
      { key: 'brands', label: 'Brands', href: 'admin-brands.html', icon: 'tag' },
      { key: 'inventory', label: 'Inventory', href: 'admin-inventory.html', icon: 'database', badge: 4, badgeCls: 'danger' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      {
        key: 'sales', label: 'Sales', icon: 'shoppingCart', children: [
          { key: 'orders', label: 'Orders', href: 'admin-orders.html' },
          { key: 'prescriptions', label: 'Prescriptions', href: 'admin-prescriptions.html', badge: 2, badgeCls: 'blue' },
          { key: 'discounts', label: 'Discounts & Coupons', href: 'admin-discounts.html' },
        ],
      },
      { key: 'customers', label: 'Customers', href: 'admin-customers.html', icon: 'users' },
      { key: 'delivery', label: 'Delivery', href: 'admin-delivery.html', icon: 'truck' },
      { key: 'reviews', label: 'Reviews', href: 'admin-reviews.html', icon: 'star', badge: 3, badgeCls: 'blue' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { key: 'banners', label: 'Banners & Ads', href: 'admin-banners.html', icon: 'image' },
      { key: 'notifications', label: 'Notifications', href: 'admin-notifications.html', icon: 'bell' },
    ],
  },
  {
    label: 'System',
    items: [
      {
        key: 'system', label: 'System', icon: 'settings', children: [
          { key: 'settings', label: 'Settings', href: 'admin-settings.html' },
          { key: 'audit', label: 'Audit Logs', href: 'admin-audit-logs.html' },
          { key: 'profile', label: 'Profile', href: 'admin-profile.html' },
        ],
      },
    ],
  },
];

function buildSidebar(activeKey) {
  const groups = NAV_GROUPS.map(g => `
    <div class="nav-group">
      <div class="nav-group-label">${g.label}</div>
      ${g.items.map(item => buildNavItem(item, activeKey)).join('')}
    </div>`).join('');
  return `
    <aside class="sidebar" id="app-sidebar">
      <div class="sidebar-header">
        <div class="brand-logo">JD</div>
        <div class="brand-name">Just <span>Drugs</span></div>
      </div>
      <nav class="sidebar-nav" aria-label="Main navigation">
        ${groups}
      </nav>
      <div class="sidebar-footer">
        <button class="sidebar-collapse-btn" id="sidebar-collapse-btn" aria-label="Toggle sidebar">
          ${icon('chevronLeft', 18)}<span class="nav-label">Collapse</span>
        </button>
      </div>
    </aside>`;
}

function buildNavItem(item, activeKey) {
  if (item.children) {
    const childActive = item.children.some(c => c.key === activeKey);
    const childrenHtml = item.children.map(c => `
      <a class="nav-link ${c.key === activeKey ? 'active' : ''}" href="${c.href}">
        <span class="nav-label">${c.label}</span>
        ${c.badge ? `<span class="nav-badge ${c.badgeCls || ''}">${c.badge}</span>` : ''}
      </a>`).join('');
    return `
      <div class="nav-item ${childActive ? 'open' : ''}">
        <button class="nav-link ${childActive ? 'active' : ''}">
          <span class="nav-icon">${icon(item.icon, 19)}</span>
          <span class="nav-label">${item.label}</span>
          <span class="nav-chevron" style="display:inline-flex">${icon('chevronRight', 14)}</span>
        </button>
        <div class="nav-submenu">${childrenHtml}</div>
      </div>`;
  }
  return `
    <a class="nav-link ${item.key === activeKey ? 'active' : ''}" href="${item.href}">
      <span class="nav-icon">${icon(item.icon, 19)}</span>
      <span class="nav-label">${item.label}</span>
      ${item.badge ? `<span class="nav-badge ${item.badgeCls || ''}">${item.badge}</span>` : ''}
    </a>`;
}

function buildTopbar() {
  const session = getSession();
  const admin = session?.admin || { full_name: 'Adebayo Oluwaseun', role: 'super_admin' };
  const unread = DemoData.notifications.filter(n => !n.read).length;
  const notifItems = DemoData.notifications.slice(0, 5).map(n => `
    <div class="dropdown-item" data-id="${esc(n._id)}">
      <span class="dropdown-item-icon ${n.type === 'inventory' ? 'warning' : n.type === 'prescription' ? 'purple' : n.type === 'payment' ? 'success' : 'blue'}">${icon(n.type === 'inventory' ? 'database' : n.type === 'prescription' ? 'fileText' : n.type === 'payment' ? 'creditCard' : n.type === 'banner' ? 'image' : n.type === 'customer' ? 'users' : 'bell', 16)}</span>
      <div class="dropdown-item-text">
        <div class="dropdown-item-title">${esc(n.title)}</div>
        <div class="dropdown-item-sub">${esc(n.body)}</div>
        <div class="dropdown-item-time">${fmtRelative(n.time)}</div>
      </div>
    </div>`).join('');

  return `
    <header class="topbar">
      <div class="topbar-left">
        <button class="icon-btn topbar-mobile-toggle" id="mobile-sidebar-toggle" aria-label="Toggle menu">${icon('menu', 20)}</button>
        <div class="global-search">
          ${icon('search', 16, 'search-icon')}
          <input type="text" id="global-search-input" placeholder="Search products, orders, customers…" aria-label="Global search">
          <kbd>⌘K</kbd>
        </div>
      </div>
      <div class="topbar-actions">
        <select class="branch-select" id="branch-selector" aria-label="Select branch">
          <option value="headquarters">🏢 HQ — Lagos</option>
          <option value="lekki">📍 Lekki Branch</option>
          <option value="ikeja">📍 Ikeja Branch</option>
          <option value="abuja">📍 Abuja Branch</option>
        </select>
        <div class="dropdown-wrap">
          <button class="icon-btn" id="notif-btn" aria-label="Notifications">${icon('bell', 19)}${unread ? '<span class="dot"></span>' : ''}</button>
          <div class="dropdown" id="notif-dropdown">
            <div class="dropdown-header">
              <span class="dropdown-title">Notifications</span>
              <a class="btn btn-xs btn-ghost" href="admin-notifications.html">View all</a>
            </div>
            <div class="dropdown-items">${notifItems}</div>
            <div class="dropdown-footer"><button class="btn btn-sm btn-secondary" style="width:100%" id="mark-notif-read">Mark all as read</button></div>
          </div>
        </div>
        <div class="dropdown-wrap">
          <button class="icon-btn" id="quick-actions-btn" aria-label="Quick actions">${icon('plus', 20)}</button>
          <div class="dropdown" id="quick-actions-dropdown" style="min-width:220px">
            <div class="dropdown-header"><span class="dropdown-title">Quick Actions</span></div>
            <div class="dropdown-items" style="padding:6px">
              ${quickAction('admin-products.html?new=1', 'box', 'Add Product', 'Create a new catalogue item')}
              ${quickAction('admin-orders.html', 'shoppingCart', 'New Order', 'Create a manual order')}
              ${quickAction('admin-prescriptions.html', 'fileText', 'Review Rx', 'Process pending prescriptions', 'blue')}
              ${quickAction('admin-inventory.html', 'database', 'Restock', 'Manage inventory levels', 'warning')}
              ${quickAction('admin-banners.html', 'image', 'Publish Banner', 'Launch a campaign', 'purple')}
            </div>
          </div>
        </div>
        <button class="icon-btn theme-toggle" id="theme-toggle-btn" aria-label="Toggle dark mode">${icon('sun', 19)}</button>
        <a class="icon-btn" href="admin-settings.html" aria-label="Settings">${icon('settings', 19)}</a>
        <div class="dropdown-wrap">
          <button class="user-chip" id="user-menu-btn">
            <span class="user-avatar">${initials(admin.full_name)}</span>
            <span class="user-chip-info">
              <span class="user-chip-name">${esc(admin.full_name || 'Admin')}</span>
              <span class="user-chip-role">${roleLabel(admin.role)}</span>
            </span>
            ${icon('chevronDown', 14)}
          </button>
          <div class="dropdown" id="user-dropdown" style="min-width:230px">
            <div class="dropdown-header">
              <div>
                <div class="dropdown-title">${esc(admin.full_name || 'Admin')}</div>
                <div style="font-size:12px;color:var(--text-3)">${esc(admin.email || '')}</div>
              </div>
              <span class="role-badge role-${esc(admin.role || 'admin')}">${roleLabel(admin.role)}</span>
            </div>
            <div class="dropdown-items" style="padding:6px">
              <a class="dropdown-menu-item" href="admin-profile.html">${icon('user', 16)} Profile</a>
              <a class="dropdown-menu-item" href="admin-settings.html">${icon('settings', 16)} Settings</a>
              <a class="dropdown-menu-item" href="admin-audit-logs.html">${icon('activity', 16)} Audit Logs</a>
              <button class="dropdown-menu-item danger" id="logout-btn">${icon('logOut', 16)} Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </header>`;
}

function quickAction(href, ic, label, sub, tone = '') {
  return `<a class="dropdown-item" href="${href}">
    <span class="dropdown-item-icon ${tone}">${icon(ic, 16)}</span>
    <div class="dropdown-item-text">
      <div class="dropdown-item-title">${label}</div>
      <div class="dropdown-item-sub">${sub}</div>
    </div>
  </a>`;
}

function renderLayout(activeKey) {
  const shell = document.getElementById('app-shell');
  if (!shell) return;
  const pageContent = document.getElementById('page-content');
  let contentHtml = '';
  if (pageContent) {
    const clone = pageContent.cloneNode(true);
    clone.removeAttribute('hidden');
    clone.removeAttribute('id');
    contentHtml = clone.outerHTML;
  }
  shell.innerHTML = buildSidebar(activeKey) + `<div class="app-main">${buildTopbar()}<main class="app-content">${contentHtml}</main></div>`;
  const toast = document.getElementById('toast-container');
  if (toast && toast.parentElement !== document.body) {
    document.body.appendChild(toast);
  }
}

function bindLayoutEvents() {
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  collapseBtn?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('jd_sidebar_collapsed', document.body.classList.contains('sidebar-collapsed') ? '1' : '0');
  });
  if (localStorage.getItem('jd_sidebar_collapsed') === '1') document.body.classList.add('sidebar-collapsed');

  document.getElementById('mobile-sidebar-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });

  const sidebar = document.getElementById('app-sidebar');
  sidebar?.addEventListener('click', (e) => {
    if (window.innerWidth <= 992 && e.target.closest('.nav-link[href]')) {
      document.body.classList.remove('sidebar-open');
    }
  });

  document.querySelectorAll('.nav-item > .nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth > 992) btn.parentElement.classList.toggle('open');
    });
  });

  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

  const toggleWrap = (triggerId, dropdownId) => {
    const trigger = document.getElementById(triggerId);
    const dd = document.getElementById(dropdownId);
    if (!trigger || !dd) return;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown.open').forEach(d => { if (d !== dd) d.classList.remove('open'); });
      dd.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!dd.contains(e.target) && !trigger.contains(e.target)) dd.classList.remove('open');
    });
  };
  toggleWrap('notif-btn', 'notif-dropdown');
  toggleWrap('quick-actions-btn', 'quick-actions-dropdown');
  toggleWrap('user-menu-btn', 'user-dropdown');

  document.getElementById('mark-notif-read')?.addEventListener('click', () => {
    document.querySelectorAll('#notif-dropdown .dropdown-item').forEach(el => el.style.opacity = '0.5');
    showToast('All notifications marked as read', 'success');
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearSession();
    location.href = 'admin-login.html';
  });

  const searchInput = document.getElementById('global-search-input');
  searchInput?.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  const pageKey = document.body.dataset.page || '';
  renderLayout(pageKey);
  bindLayoutEvents();
  if (typeof window.__pageContentRendered === 'function') window.__pageContentRendered();
});

/* ─── Page helper: load data with demo fallback ────────── */
async function loadData(fetcher, demoData, fallback = []) {
  try {
    const res = await fetcher();
    const data = res.data ?? res;
    return Array.isArray(data) ? data : (data?.items ?? data ?? fallback);
  } catch (err) {
    console.warn('[JustDrugs] Falling back to demo data:', err.message);
    return demoData;
  }
}

/* Expose globals for page scripts */
window.JustDrugs = {
  API_BASE, AdminAPI, DemoData, icon, showToast, esc, fmtMoney, fmtNum, fmtCompact,
  fmtDate, fmtRelative, pctChange, debounce, confirmDialog, openModal, closeModal,
  openDrawer, closeDrawer, skeletonRows, orderStatusBadge, paymentStatusBadge, stockBadge,
  roleLabel, initials, loadData, getSession, saveSession, clearSession, requireAuth,
  initTheme, toggleTheme,
};

