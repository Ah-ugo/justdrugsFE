(function () {
  requireAuth();
  let tbody;
  let allAdmins = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listAdmins();
      allAdmins = data.admins || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load admins', 'error'); }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allAdmins.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allAdmins.length / PAGE_SIZE));
    if (allAdmins.length === 0) { tbody.innerHTML = `<tr><td colspan="5"><div class="admin-empty-state"><h3>No admins</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(a => `
      <tr>
        <td style="font-weight:600">${esc(a.full_name || a.name || '—')}</td>
        <td>${esc(a.email)}</td>
        <td><span class="badge badge-info">${esc(a.role || '—')}</span></td>
        <td>${a.is_active !== false ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-gray">Inactive</span>'}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-secondary admin-edit-admin-btn" data-id="${esc(a._id || a.id)}">${Icons.edit}</button>
            <button class="btn btn-sm btn-danger admin-delete-admin-btn" data-id="${esc(a._id || a.id)}">${Icons.trash}</button>
          </div>
        </td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
    tbody.querySelectorAll('.admin-edit-admin-btn').forEach(btn => btn.addEventListener('click', () => openEdit(btn.dataset.id)));
    tbody.querySelectorAll('.admin-delete-admin-btn').forEach(btn => btn.addEventListener('click', () => deleteAdmin(btn.dataset.id)));
  }

  function openOverlay() { const el = document.getElementById('admin-admin-overlay'); if (el) el.hidden = false; }
  function closeOverlay() {
    const el = document.getElementById('admin-admin-overlay'); if (el) el.hidden = true;
    const f = document.getElementById('admin-admin-form'); if (f) f.reset();
    const idEl = document.getElementById('admin-admin-id'); if (idEl) idEl.value = '';
    const titleEl = document.getElementById('admin-admin-form-title'); if (titleEl) titleEl.textContent = 'Create Admin';
  }
  function openEdit(id) {
    const a = allAdmins.find(x => (x._id || x.id) === id); if (!a) return;
    const titleEl = document.getElementById('admin-admin-form-title'); if (titleEl) titleEl.textContent = 'Edit Admin';
    const idEl = document.getElementById('admin-admin-id'); if (idEl) idEl.value = a._id || a.id;
    document.getElementById('admin-admin-full-name').value = a.full_name || a.name || '';
    document.getElementById('admin-admin-email').value = a.email || '';
    document.getElementById('admin-admin-role').value = a.role || 'admin';
    const activeEl = document.getElementById('admin-admin-is-active'); if (activeEl) activeEl.checked = a.is_active !== false;
    openOverlay();
  }

  async function init() {
    tbody = document.getElementById('admin-admins-tbody');
    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">Admins</span><button class="btn btn-primary" id="admin-create-admin-btn">${Icons.plus} New Admin</button></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody id="admin-admins-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Admins', 'Manage administrator accounts', contentHtml, { actions: '', page: 'admins' });
    tbody = document.getElementById('admin-admins-tbody');

    document.getElementById('admin-create-admin-btn')?.addEventListener('click', () => { closeOverlay(); openOverlay(); });
    document.getElementById('admin-admin-cancel')?.addEventListener('click', closeOverlay);
    document.getElementById('admin-admin-modal-close')?.addEventListener('click', closeOverlay);
    document.getElementById('admin-admin-overlay')?.addEventListener('click', (e) => { if (e.target.id === 'admin-admin-overlay') closeOverlay(); });

    document.getElementById('admin-admin-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const adminId = document.getElementById('admin-admin-id').value;
      const payload = {
        full_name: document.getElementById('admin-admin-full-name').value.trim(),
        email: document.getElementById('admin-admin-email').value.trim(),
        role: document.getElementById('admin-admin-role').value,
        is_active: document.getElementById('admin-admin-is-active').checked,
      };
      if (!payload.email) { showToast('Email is required', 'error'); return; }
      try {
        if (adminId) { await AdminAPI.updateAdmin(adminId, payload); showToast('Admin updated', 'success'); }
        else { await AdminAPI.createAdmin(payload); showToast('Admin created', 'success'); }
        closeOverlay(); load();
      } catch (err) { showToast(err.message || 'Operation failed', 'error'); }
    });

    await load();
  }

  async function deleteAdmin(id) { if (!confirmDelete('Delete this admin?')) return; try { await AdminAPI.deleteAdmin(id); showToast('Deleted', 'success'); load(); } catch (err) { showToast(err.message || 'Failed', 'error'); } }

  init();
})();
