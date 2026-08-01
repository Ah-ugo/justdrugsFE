(function () {
  requireAuth();
  let tbody;
  let allBanners = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listBanners();
      allBanners = data.banners || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load banners', 'error'); }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allBanners.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allBanners.length / PAGE_SIZE));
    if (allBanners.length === 0) { tbody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state"><h3>No banners</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(b => `
      <tr>
        <td style="font-weight:600">${esc(b.name)}</td>
        <td><span class="badge badge-brand">${esc(b.type || '—')}</span></td>
        <td>${formatDate(b.start_date)} — ${formatDate(b.end_date)}</td>
        <td>${statusBadge(b.is_active !== false ? 'ACTIVE' : 'INACTIVE')}</td>
        <td>${(b.ads || []).length} ad${(b.ads || []).length !== 1 ? 's' : ''}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-secondary admin-edit-banner-btn" data-id="${esc(b._id || b.id)}">${Icons.edit}</button>
            <button class="btn btn-sm btn-danger admin-delete-banner-btn" data-id="${esc(b._id || b.id)}">${Icons.trash}</button>
          </div>
        </td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
    tbody.querySelectorAll('.admin-edit-banner-btn').forEach(btn => btn.addEventListener('click', () => openEdit(btn.dataset.id)));
    tbody.querySelectorAll('.admin-delete-banner-btn').forEach(btn => btn.addEventListener('click', () => deleteBanner(btn.dataset.id)));
  }

  function openOverlay() { const el = document.getElementById('admin-banner-overlay'); if (el) el.hidden = false; }
  function closeOverlay() {
    const el = document.getElementById('admin-banner-overlay'); if (el) el.hidden = true;
    const f = document.getElementById('admin-banner-form'); if (f) f.reset();
    const idEl = document.getElementById('admin-banner-id'); if (idEl) idEl.value = '';
    const titleEl = document.getElementById('admin-banner-form-title'); if (titleEl) titleEl.textContent = 'Edit Banner';
  }
  function openEdit(id) {
    const b = allBanners.find(x => (x._id || x.id) === id); if (!b) return;
    const titleEl = document.getElementById('admin-banner-form-title'); if (titleEl) titleEl.textContent = 'Edit Banner';
    const idEl = document.getElementById('admin-banner-id'); if (idEl) idEl.value = b._id || b.id;
    document.getElementById('admin-banner-name').value = b.name || '';
    document.getElementById('admin-banner-type').value = b.type || 'hero';
    document.getElementById('admin-banner-start').value = b.start_date || '';
    document.getElementById('admin-banner-end').value = b.end_date || '';
    const activeEl = document.getElementById('admin-banner-active'); if (activeEl) activeEl.checked = b.is_active !== false;
    openOverlay();
  }

  async function init() {
    tbody = document.getElementById('admin-banner-list-tbody');
    const actions = `<button class="btn btn-primary" id="admin-create-banner-btn">${Icons.plus} New Banner</button>`;
    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">Banners & Advertisements</span><div style="display:flex;gap:8px">${actions}</div></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Name</th><th>Type</th><th>Schedule</th><th>Status</th><th>Ads</th><th>Actions</th></tr></thead><tbody id="admin-banner-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Banners', 'Manage banners and promotional ads', contentHtml, { actions: '', page: 'banners' });
    tbody = document.getElementById('admin-banner-list-tbody');

    document.getElementById('admin-create-banner-btn')?.addEventListener('click', () => { closeOverlay(); openOverlay(); });
    document.getElementById('admin-banner-cancel')?.addEventListener('click', closeOverlay);
    document.getElementById('admin-banner-modal-close')?.addEventListener('click', closeOverlay);
    document.getElementById('admin-banner-overlay')?.addEventListener('click', (e) => { if (e.target.id === 'admin-banner-overlay') closeOverlay(); });

    document.getElementById('admin-banner-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bannerId = document.getElementById('admin-banner-id').value;
      const payload = {
        name: document.getElementById('admin-banner-name').value.trim(),
        type: document.getElementById('admin-banner-type').value,
        start_date: document.getElementById('admin-banner-start').value || undefined,
        end_date: document.getElementById('admin-banner-end').value || undefined,
        is_active: document.getElementById('admin-banner-active').checked,
      };
      if (!payload.name) { showToast('Name is required', 'error'); return; }
      try {
        if (bannerId) { await AdminAPI.updateBanner(bannerId, payload); showToast('Banner updated', 'success'); }
        else { await AdminAPI.createBanner(payload); showToast('Banner created', 'success'); }
        closeOverlay(); load();
      } catch (err) { showToast(err.message || 'Operation failed', 'error'); }
    });

    await load();
  }

  async function deleteBanner(id) { if (!confirmDelete('Delete this banner?')) return; try { await AdminAPI.deleteBanner(id); showToast('Deleted', 'success'); load(); } catch (err) { showToast(err.message || 'Failed', 'error'); } }

  init();
})();
