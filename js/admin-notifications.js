(function () {
  requireAuth();
  let tbody;
  let allNotifications = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listNotifications({ limit: 100 });
      allNotifications = data.notifications || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load notifications', 'error'); }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allNotifications.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allNotifications.length / PAGE_SIZE));
    if (allNotifications.length === 0) { tbody.innerHTML = `<tr><td colspan="5"><div class="admin-empty-state"><h3>No notifications</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(n => `
      <tr>
        <td style="font-weight:600">${esc(n.title)}</td>
        <td><span class="badge badge-info">${esc(n.type || '—')}</span></td>
        <td>${n.is_sent ? '<span class="badge badge-success">Sent</span>' : '<span class="badge badge-gray">Draft</span>'}</td>
        <td>${formatDate(n.sent_at || n.created_at)}</td>
        <td>${n.recipient_count ?? 0}</td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
  }

  async function init() {
    tbody = document.getElementById('admin-notif-list-tbody');
    const contentHtml = `
      <div class="admin-tabs">
        <button class="admin-tab active" data-tab="all">All</button>
        <button class="admin-tab" data-tab="email">Email</button>
        <button class="admin-tab" data-tab="sms">SMS</button>
        <button class="admin-tab" data-tab="push">Push</button>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">Notifications</span><button class="btn btn-primary" id="admin-send-notif-btn">${Icons.plus} New Notification</button></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Sent At</th><th>Recipients</th></tr></thead><tbody id="admin-notif-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Notifications', 'Manage email, SMS and push notifications', contentHtml, { actions: '', page: 'notifications' });
    tbody = document.getElementById('admin-notif-list-tbody');
    await load();
  }

  init();
})();
