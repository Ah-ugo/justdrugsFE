(function () {
  requireAuth();
  let tbody;
  let allInventory = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listInventory();
      allInventory = data.inventory || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load inventory', 'error'); }
  }

  function stockClass(stock) {
    if (stock === 0) return 'badge-danger';
    if (stock < 10) return 'badge-warning';
    return 'badge-success';
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allInventory.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allInventory.length / PAGE_SIZE));
    if (allInventory.length === 0) { tbody.innerHTML = `<tr><td colspan="7"><div class="admin-empty-state"><h3>No inventory data</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(inv => `
      <tr>
        <td style="font-weight:600">${esc(inv.product_name || inv.name || '—')}</td>
        <td><code>${esc(inv.sku || '—')}</code></td>
        <td><span class="badge ${stockClass(inv.current_stock ?? inv.stock ?? 0)}">${inv.current_stock ?? inv.stock ?? 0}</span></td>
        <td>${inv.reserved_stock ?? 0}</td>
        <td>${inv.available_stock ?? inv.current_stock ?? inv.stock ?? 0}</td>
        <td>${inv.reorder_level ?? 10}</td>
        <td><button class="btn btn-sm btn-primary admin-adjust-stock-btn" data-id="${esc(inv._id || inv.product_id || inv.id)}">Adjust</button></td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
    tbody.querySelectorAll('.admin-adjust-stock-btn').forEach(btn => btn.addEventListener('click', () => openAdjust(btn.dataset.id)));
  }

  function openAdjust(id) {
    const idEl = document.getElementById('admin-inv-adj-id'); if (idEl) idEl.value = id;
    const overlayEl = document.getElementById('admin-inventory-adjust-overlay'); if (overlayEl) overlayEl.hidden = false;
  }
  function closeAdjust() {
    const overlayEl = document.getElementById('admin-inventory-adjust-overlay'); if (overlayEl) overlayEl.hidden = true;
    const f = document.getElementById('admin-inv-adj-form'); if (f) f.reset();
    const idEl = document.getElementById('admin-inv-adj-id'); if (idEl) idEl.value = '';
  }
  document.getElementById('admin-inv-adj-cancel')?.addEventListener('click', closeAdjust);
  document.getElementById('admin-inventory-adjust-overlay')?.addEventListener('click', (e) => { if (e.target.id === 'admin-inventory-adjust-overlay') closeAdjust(); });
  document.getElementById('admin-inv-adj-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('admin-inv-adj-id').value;
    const qty = Number(document.getElementById('admin-inv-adj-qty').value);
    const reason = document.getElementById('admin-inv-adj-reason').value;
    if (!qty || !productId) return;
    try {
      await AdminAPI.adjustStock(productId, { quantity: qty, reason });
      showToast('Stock adjusted', 'success'); closeAdjust(); load();
    } catch (err) { showToast(err.message || 'Failed to adjust stock', 'error'); }
  });

  async function init() {
    tbody = document.getElementById('admin-inv-list-tbody');
    const contentHtml = `
      <div class="admin-kpi-grid">
        <div class="admin-kpi-card"><div class="admin-kpi-icon brand">${Icons.inventory}</div><div class="admin-kpi-body"><div class="admin-kpi-label">Total Products</div><div class="admin-kpi-value" id="inv-total-products">—</div></div></div>
        <div class="admin-kpi-card"><div class="admin-kpi-icon amber">${Icons.warning}</div><div class="admin-kpi-body"><div class="admin-kpi-label">Low Stock</div><div class="admin-kpi-value" id="inv-low-stock">—</div></div></div>
        <div class="admin-kpi-card"><div class="admin-kpi-icon red">${Icons.error}</div><div class="admin-kpi-body"><div class="admin-kpi-label">Out of Stock</div><div class="admin-kpi-value" id="inv-out-stock">—</div></div></div>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">Inventory</span><button class="btn btn-secondary btn-sm">${Icons.download} Export</button></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Product</th><th>SKU</th><th>Current Stock</th><th>Reserved</th><th>Available</th><th>Reorder Level</th><th>Actions</th></tr></thead><tbody id="admin-inv-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Inventory', 'Monitor stock levels and manage restocks', contentHtml, { actions: '', page: 'inventory' });
    tbody = document.getElementById('admin-inv-list-tbody');
    await load();
  }

  init();
})();
