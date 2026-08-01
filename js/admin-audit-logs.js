(function () {
  requireAuth();
  let tbody;
  let allLogs = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listAuditLogs({ limit: 100 });
      allLogs = data.logs || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load audit logs', 'error'); }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allLogs.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allLogs.length / PAGE_SIZE));
    if (allLogs.length === 0) { tbody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state"><h3>No audit logs</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(log => `
      <tr>
        <td style="font-weight:600">${esc(log.user?.email || log.user_email || log.user || '—')}</td>
        <td><span class="badge badge-info">${esc(log.role || log.user_role || '—')}</span></td>
        <td>${esc(log.action)}</td>
        <td><span class="badge badge-brand">${esc(log.module || '—')}</span></td>
        <td>${formatDateTime(log.created_at || log.timestamp)}</td>
        <td>${statusBadge(log.status || 'SUCCESS')}</td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
  }

  async function init() {
    tbody = document.getElementById('admin-audit-list-tbody');
    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar">
          <span class="admin-table-title">Audit Logs</span>
          <div style="display:flex;gap:8px">
            <input type="date" id="admin-audit-from" style="width:auto">
            <input type="date" id="admin-audit-to" style="width:auto">
            <button class="btn btn-secondary btn-sm">${Icons.filter} Filter</button>
          </div>
        </div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>User</th><th>Role</th><th>Action</th><th>Module</th><th>Date</th><th>Status</th></tr></thead><tbody id="admin-audit-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Audit Logs', 'Track all administrative actions', contentHtml, { actions: '', page: 'audit' });
    tbody = document.getElementById('admin-audit-list-tbody');
    await load();
  }

  init();
})();
