(function () {
  requireAuth();
  let tbody;
  let allDeliveries = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listDelivery({ limit: 100 });
      allDeliveries = data.deliveries || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load deliveries', 'error'); }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allDeliveries.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allDeliveries.length / PAGE_SIZE));
    if (allDeliveries.length === 0) { tbody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state"><h3>No deliveries</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(d => `
      <tr>
        <td><code>${esc(d.order_number || d.order_id || '—')}</code></td>
        <td>${esc(d.rider_name || d.rider?.name || 'Unassigned')}</td>
        <td>${esc(d.zone || d.address || '—')}</td>
        <td>${statusBadge(d.status || 'PENDING')}</td>
        <td>${d.estimated_delivery ? formatDate(d.estimated_delivery) : '—'}</td>
        <td>
          <select class="admin-del-status-select" data-id="${esc(d._id || d.id)}" style="width:auto">
            <option value="PENDING" ${d.status === 'PENDING' ? 'selected' : ''}>Pending</option>
            <option value="ASSIGNED" ${d.status === 'ASSIGNED' ? 'selected' : ''}>Assigned</option>
            <option value="OUT_FOR_DELIVERY" ${d.status === 'OUT_FOR_DELIVERY' ? 'selected' : ''}>Out for Delivery</option>
            <option value="DELIVERED" ${d.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
            <option value="FAILED" ${d.status === 'FAILED' ? 'selected' : ''}>Failed</option>
          </select>
        </td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
    tbody.querySelectorAll('.admin-del-status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        try { await AdminAPI.updateDeliveryStatus(sel.dataset.id, sel.value); showToast('Delivery updated', 'success'); load(); }
        catch (err) { showToast(err.message || 'Failed', 'error'); sel.value = sel.dataset.prev || sel.value; }
      });
      sel.dataset.prev = sel.value;
    });
  }

  async function init() {
    tbody = document.getElementById('admin-del-list-tbody');
    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">Deliveries</span></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Order</th><th>Rider</th><th>Zone</th><th>Status</th><th>ETA</th><th>Update</th></tr></thead><tbody id="admin-del-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Delivery', 'Track and manage delivery operations', contentHtml, { actions: '', page: 'delivery' });
    tbody = document.getElementById('admin-del-list-tbody');
    await load();
  }

  init();
})();
