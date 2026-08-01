(function () {
  requireAuth();
  let tbody;
  let allDiscounts = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listDiscounts();
      allDiscounts = data.discounts || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load discounts', 'error'); }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allDiscounts.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allDiscounts.length / PAGE_SIZE));
    if (allDiscounts.length === 0) { tbody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state"><h3>No discounts</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(d => `
      <tr>
        <td style="font-weight:600">${esc(d.name)}</td>
        <td><span class="badge ${d.type === 'percentage' ? 'badge-blue' : 'badge-brand'}">${d.type === 'percentage' ? d.value + '%' : formatCurrency(d.value)}</span></td>
        <td>${esc(d.code || '—')}</td>
        <td>${statusBadge(d.is_active !== false ? 'ACTIVE' : 'INACTIVE')}</td>
        <td>${d.usage_count ?? 0} / ${d.usage_limit || '∞'}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-secondary admin-edit-disc-btn" data-id="${esc(d._id || d.id)}">${Icons.edit}</button>
            <button class="btn btn-sm btn-danger admin-delete-disc-btn" data-id="${esc(d._id || d.id)}">${Icons.trash}</button>
          </div>
        </td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
    tbody.querySelectorAll('.admin-edit-disc-btn').forEach(btn => btn.addEventListener('click', () => openEdit(btn.dataset.id)));
    tbody.querySelectorAll('.admin-delete-disc-btn').forEach(btn => btn.addEventListener('click', () => deleteDiscount(btn.dataset.id)));
  }

  function openOverlay() { const el = document.getElementById('admin-discount-overlay'); if (el) el.hidden = false; }
  function closeOverlay() {
    const el = document.getElementById('admin-discount-overlay'); if (el) el.hidden = true;
    const f = document.getElementById('admin-disc-form'); if (f) f.reset();
    const idEl = document.getElementById('admin-disc-id'); if (idEl) idEl.value = '';
    const titleEl = document.getElementById('admin-discount-form-title'); if (titleEl) titleEl.textContent = 'Edit Discount';
  }
  function openEdit(id) {
    const d = allDiscounts.find(x => (x._id || x.id) === id); if (!d) return;
    const titleEl = document.getElementById('admin-discount-form-title'); if (titleEl) titleEl.textContent = 'Edit Discount';
    const idEl = document.getElementById('admin-disc-id'); if (idEl) idEl.value = d._id || d.id;
    document.getElementById('admin-disc-name').value = d.name || '';
    document.getElementById('admin-disc-type').value = d.type || 'percentage';
    document.getElementById('admin-disc-value').value = d.value || '';
    document.getElementById('admin-disc-code').value = d.code || '';
    document.getElementById('admin-disc-min').value = d.minimum_purchase || 0;
    document.getElementById('admin-disc-max').value = d.max_discount || 0;
    openOverlay();
  }

  async function init() {
    tbody = document.getElementById('admin-disc-list-tbody');
    const actions = `<button class="btn btn-primary" id="admin-create-disc-btn">${Icons.plus} Add Discount</button>`;
    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">Discounts & Coupons</span><div style="display:flex;gap:8px">${actions}</div></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Name</th><th>Value</th><th>Code</th><th>Status</th><th>Usage</th><th>Actions</th></tr></thead><tbody id="admin-disc-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Discounts', 'Manage discounts, coupons and promotions', contentHtml, { actions: '', page: 'discounts' });
    tbody = document.getElementById('admin-disc-list-tbody');

    document.getElementById('admin-create-disc-btn')?.addEventListener('click', () => { closeOverlay(); openOverlay(); });
    document.getElementById('admin-discount-cancel')?.addEventListener('click', closeOverlay);
    document.getElementById('admin-discount-modal-close')?.addEventListener('click', closeOverlay);
    document.getElementById('admin-discount-overlay')?.addEventListener('click', (e) => { if (e.target.id === 'admin-discount-overlay') closeOverlay(); });

    document.getElementById('admin-disc-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const discId = document.getElementById('admin-disc-id').value;
      const payload = {
        name: document.getElementById('admin-disc-name').value.trim(),
        type: document.getElementById('admin-disc-type').value,
        value: Number(document.getElementById('admin-disc-value').value) || 0,
        code: document.getElementById('admin-disc-code').value.trim() || undefined,
        minimum_purchase: Number(document.getElementById('admin-disc-min').value) || 0,
        max_discount: Number(document.getElementById('admin-disc-max').value) || 0,
      };
      if (!payload.name) { showToast('Name is required', 'error'); return; }
      try {
        if (discId) { await AdminAPI.updateDiscount(discId, payload); showToast('Discount updated', 'success'); }
        else { await AdminAPI.createDiscount(payload); showToast('Discount created', 'success'); }
        closeOverlay(); load();
      } catch (err) { showToast(err.message || 'Operation failed', 'error'); }
    });

    await load();
  }

  async function deleteDiscount(id) { if (!confirmDelete('Delete this discount?')) return; try { await AdminAPI.deleteDiscount(id); showToast('Deleted', 'success'); load(); } catch (err) { showToast(err.message || 'Failed', 'error'); } }

  init();
})();
