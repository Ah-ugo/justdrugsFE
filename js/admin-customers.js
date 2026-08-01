(function () {
  requireAuth();
  let tbody;
  let allCustomers = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listCustomers({ limit: 100 });
      allCustomers = data.customers || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load customers', 'error'); }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allCustomers.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allCustomers.length / PAGE_SIZE));
    if (allCustomers.length === 0) { tbody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state"><h3>No customers yet</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(c => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="admin-user-avatar" style="width:32px;height:32px;font-size:0.75rem">${(c.full_name || c.email || 'U')[0].toUpperCase()}</div>
            <div><div style="font-weight:600">${esc(c.full_name || c.name || '—')}</div><div class="text-xs text-muted">${esc(c.email)}</div></div>
          </div>
        </td>
        <td>${esc(c.phone || '—')}</td>
        <td>${c.order_count ?? c.total_orders ?? 0}</td>
        <td style="font-weight:600">${formatCurrency(c.total_spend || c.spent || 0)}</td>
        <td>${statusBadge(c.status === 'active' || c.is_active !== false ? 'ACTIVE' : 'INACTIVE')}</td>
        <td>${formatDate(c.created_at || c.registered_at)}</td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
  }

  async function init() {
    tbody = document.getElementById('admin-cust-list-tbody');
    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">Customers</span></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Total Spend</th><th>Status</th><th>Joined</th></tr></thead><tbody id="admin-cust-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Customers', 'View and manage customer accounts', contentHtml, { actions: '', page: 'customers' });
    tbody = document.getElementById('admin-cust-list-tbody');
    await load();
  }

  init();
})();
