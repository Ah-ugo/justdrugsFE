(function () {
  requireAuth();
  let tbody;
  let allBrands = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listBrands();
      allBrands = data.brands || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load brands', 'error'); }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allBrands.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allBrands.length / PAGE_SIZE));
    if (allBrands.length === 0) { tbody.innerHTML = `<tr><td colspan="4"><div class="admin-empty-state"><h3>No brands yet</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(b => `
      <tr>
        <td style="font-weight:600">${esc(b.name)}</td>
        <td><span class="text-xs text-muted">${esc(b.description || '—')}</span></td>
        <td>${b.product_count ?? 0}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-secondary admin-edit-brand-btn" data-id="${esc(b._id || b.id)}">${Icons.edit}</button>
            <button class="btn btn-sm btn-danger admin-delete-brand-btn" data-id="${esc(b._id || b.id)}">${Icons.trash}</button>
          </div>
        </td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
    tbody.querySelectorAll('.admin-edit-brand-btn').forEach(btn => btn.addEventListener('click', () => openEdit(btn.dataset.id)));
    tbody.querySelectorAll('.admin-delete-brand-btn').forEach(btn => btn.addEventListener('click', () => deleteBrand(btn.dataset.id)));
  }

  function openOverlay() { const el = document.getElementById('admin-brand-overlay'); if (el) el.hidden = false; }
  function closeOverlay() {
    const el = document.getElementById('admin-brand-overlay'); if (el) el.hidden = true;
    const f = document.getElementById('admin-brand-form'); if (f) f.reset();
    const idEl = document.getElementById('admin-brand-id'); if (idEl) idEl.value = '';
    const titleEl = document.getElementById('admin-brand-form-title'); if (titleEl) titleEl.textContent = 'Edit Brand';
  }
  function openEdit(brandId) {
    const b = allBrands.find(x => (x._id || x.id) === brandId); if (!b) return;
    const titleEl = document.getElementById('admin-brand-form-title'); if (titleEl) titleEl.textContent = 'Edit Brand';
    const idEl = document.getElementById('admin-brand-id'); if (idEl) idEl.value = b._id || b.id;
    document.getElementById('admin-brand-name').value = b.name || '';
    document.getElementById('admin-brand-desc').value = b.description || '';
    openOverlay();
  }

  async function init() {
    tbody = document.getElementById('admin-brand-list-tbody');
    const actions = `<button class="btn btn-primary" id="admin-create-brand-btn">${Icons.plus} Add Brand</button>`;
    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">Brands</span><div style="display:flex;gap:8px">${actions}</div></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Name</th><th>Description</th><th>Products</th><th>Actions</th></tr></thead><tbody id="admin-brand-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Brands', 'Manage product brands', contentHtml, { actions: '', page: 'brands' });
    tbody = document.getElementById('admin-brand-list-tbody');

    document.getElementById('admin-create-brand-btn')?.addEventListener('click', () => { closeOverlay(); openOverlay(); });
    document.getElementById('admin-brand-cancel')?.addEventListener('click', closeOverlay);
    document.getElementById('admin-brand-modal-close')?.addEventListener('click', closeOverlay);
    document.getElementById('admin-brand-overlay')?.addEventListener('click', (e) => { if (e.target.id === 'admin-brand-overlay') closeOverlay(); });

    document.getElementById('admin-brand-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const brandId = document.getElementById('admin-brand-id').value;
      const payload = { name: document.getElementById('admin-brand-name').value.trim(), description: document.getElementById('admin-brand-desc').value.trim() };
      if (!payload.name) { showToast('Brand name is required', 'error'); return; }
      try {
        if (brandId) { await AdminAPI.updateBrand(brandId, payload); showToast('Brand updated', 'success'); }
        else { await AdminAPI.createBrand(payload); showToast('Brand created', 'success'); }
        closeOverlay(); load();
      } catch (err) { showToast(err.message || 'Operation failed', 'error'); }
    });

    await load();
  }

  async function deleteBrand(id) { if (!confirmDelete('Delete this brand?')) return; try { await AdminAPI.deleteBrand(id); showToast('Deleted', 'success'); load(); } catch (err) { showToast(err.message || 'Failed', 'error'); } }

  init();
})();
