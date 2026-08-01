/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Admins module
   Manage admin accounts: create, edit, disable, delete.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtDate, fmtRelative, showToast, confirmDialog, openModal, closeModal, roleLabel, initials } = JD;

  let admins = [];
  let editingId = null;

  window.__pageContentRendered = function () { initAdmins(); };

  async function initAdmins() {
    try {
      const res = await AdminAPI.listAdmins();
      const data = res.data || res;
      admins = Array.isArray(data) ? data : DemoData.admins;
    } catch (e) {
      console.warn('[Admins] Demo mode:', e.message);
      admins = DemoData.admins;
    }
    renderTable();
    document.getElementById('admin-create-admin-btn').addEventListener('click', openCreateEditor);
  }

  function renderTable() {
    const tbody = document.getElementById('admins-tbody');
    if (!admins.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">${icon('users', 32)}</div><div class="empty-title">No admins found</div><div class="empty-desc">Create your first admin account.</div></div></td></tr>`;
      return;
    }
    tbody.innerHTML = admins.map(a => {
      const id = a._id || a.id;
      return `
        <tr>
          <td>
            <div class="product-cell">
              <div class="avatar ${a.role === 'super_admin' ? 'brand' : 'emerald'}">${initials(a.full_name || a.name)}</div>
              <div class="cell-stack">
                <span class="table-cell-primary">${esc(a.full_name || a.name)}</span>
              </div>
            </div>
          </td>
          <td><span class="text-sm">${esc(a.email)}</span></td>
          <td><span class="role-badge role-${esc(a.role || 'admin')}">${roleLabel(a.role)}</span></td>
          <td>${a.is_active !== false
            ? '<span class="badge badge-success"><span class="badge-dot"></span>Active</span>'
            : '<span class="badge badge-gray"><span class="badge-dot"></span>Inactive</span>'}</td>
          <td class="muted no-wrap">${a.last_login ? fmtRelative(a.last_login) : '—'}</td>
          <td>
            <div class="row-actions">
              <button class="row-action-btn act-edit" data-id="${esc(id)}" title="Edit">${icon('edit', 15)}</button>
              <button class="row-action-btn ${a.is_active === false ? 'act-enable' : ''} danger" data-id="${esc(id)}" data-action="${a.is_active === false ? 'enable' : 'disable'}" title="${a.is_active === false ? 'Enable' : 'Disable'}">${icon(a.is_active === false ? 'check' : 'x', 15)}</button>
              <button class="row-action-btn danger act-delete" data-id="${esc(id)}" title="Delete">${icon('trash', 15)}</button>
            </div>
          </td>
        </tr>`;
    }).join('');
    tbody.querySelectorAll('.act-edit').forEach(b => b.addEventListener('click', () => openEditAdmin(b.dataset.id)));
    tbody.querySelectorAll('.act-delete').forEach(b => b.addEventListener('click', () => deleteAdmin(b.dataset.id)));
    tbody.querySelectorAll('[data-action="disable"]').forEach(b => b.addEventListener('click', () => toggleAdmin(b.dataset.id, false)));
    tbody.querySelectorAll('[data-action="enable"]').forEach(b => b.addEventListener('click', () => toggleAdmin(b.dataset.id, true)));
  }

  function openCreateEditor() {
    editingId = null;
    openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">Create Admin</h3><p class="modal-subtitle">Add a new administrator to the platform.</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <form id="admin-editor-form" style="padding:0">
        <div class="modal-body">
          <div class="field"><label>Full name *</label><input class="input" id="adm-name" required></div>
          <div class="field"><label>Email *</label><input class="input" type="email" id="adm-email" required></div>
          <div class="field"><label>Role *</label>
            <select class="select" id="adm-role">
              <option value="super_admin">Super Admin</option>
              <option value="admin" selected>Admin</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="inventory_manager">Inventory Manager</option>
              <option value="customer_support">Customer Support</option>
              <option value="delivery_manager">Delivery Manager</option>
            </select>
          </div>
          <div class="list-row" style="padding:12px 0;border:0"><div><div class="list-row-label">Active</div><div class="list-row-desc">Account can log in immediately</div></div><button class="switch on" id="adm-active"></button></div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">${icon('plus', 14)} Create Admin</button>
        </div>
      </form>`);
    document.getElementById('adm-active').addEventListener('click', function () { this.classList.toggle('on'); });
    document.getElementById('admin-editor-form').addEventListener('submit', saveAdmin);
  }

  function openEditAdmin(id) {
    const a = admins.find(x => (x._id || x.id) === id);
    if (!a) return;
    editingId = id;
    openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">Edit Admin</h3><p class="modal-subtitle">Update administrator details and permissions.</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <form id="admin-editor-form" style="padding:0">
        <div class="modal-body">
          <div class="field"><label>Full name *</label><input class="input" id="adm-name" value="${esc(a.full_name || a.name)}" required></div>
          <div class="field"><label>Email *</label><input class="input" type="email" id="adm-email" value="${esc(a.email)}" required></div>
          <div class="field"><label>Role *</label>
            <select class="select" id="adm-role">
              <option value="super_admin" ${a.role === 'super_admin' ? 'selected' : ''}>Super Admin</option>
              <option value="admin" ${a.role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="pharmacist" ${a.role === 'pharmacist' ? 'selected' : ''}>Pharmacist</option>
              <option value="inventory_manager" ${a.role === 'inventory_manager' ? 'selected' : ''}>Inventory Manager</option>
              <option value="customer_support" ${a.role === 'customer_support' ? 'selected' : ''}>Customer Support</option>
              <option value="delivery_manager" ${a.role === 'delivery_manager' ? 'selected' : ''}>Delivery Manager</option>
            </select>
          </div>
          <div class="list-row" style="padding:12px 0;border:0"><div><div class="list-row-label">Active</div><div class="list-row-desc">Account can log in</div></div><button class="switch ${a.is_active !== false ? 'on' : ''}" id="adm-active"></button></div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">${icon('check', 14)} Save Changes</button>
        </div>
      </form>`);
    document.getElementById('adm-active').addEventListener('click', function () { this.classList.toggle('on'); });
    document.getElementById('admin-editor-form').addEventListener('submit', saveAdmin);
  }

  async function saveAdmin(e) {
    e.preventDefault();
    const payload = {
      full_name: document.getElementById('adm-name').value.trim(),
      email: document.getElementById('adm-email').value.trim(),
      role: document.getElementById('adm-role').value,
      is_active: document.getElementById('adm-active').classList.contains('on'),
    };
    if (!payload.email) { showToast('Email is required', 'error'); return; }
    try {
      if (editingId) {
        await AdminAPI.updateAdmin(editingId, payload);
        const a = admins.find(x => (x._id || x.id) === editingId);
        if (a) { a.full_name = payload.full_name; a.email = payload.email; a.role = payload.role; a.is_active = payload.is_active; }
        showToast('Admin updated', 'success');
      } else {
        await AdminAPI.createAdmin(payload);
        payload.id = 'new-' + Date.now();
        payload.last_login = null;
        admins.push(payload);
        showToast('Admin created', 'success');
      }
      renderTable();
      closeModal(document.querySelector('.modal-backdrop.open'));
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  }

  async function toggleAdmin(id, active) {
    const a = admins.find(x => (x._id || x.id) === id);
    if (!a) return;
    const label = active ? 'enable' : 'disable';
    const ok = await confirmDialog(`<b>${label}</b> admin account for <b>${esc(a.full_name || a.name)}</b>?`, { variant: active ? 'info' : 'warning', confirmText: label === 'enable' ? 'Enable' : 'Disable' });
    if (!ok) return;
    try {
      await AdminAPI.updateAdmin(id, { is_active: active });
      a.is_active = active;
      renderTable();
      showToast(`Admin ${active ? 'enabled' : 'disabled'}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    }
  }

  async function deleteAdmin(id) {
    const a = admins.find(x => (x._id || x.id) === id);
    const ok = await confirmDialog(`Delete admin account for <b>${esc(a?.full_name || a?.name)}</b>? This action cannot be undone.`, { variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    try {
      await AdminAPI.deleteAdmin(id);
      admins = admins.filter(x => (x._id || x.id) !== id);
      renderTable();
      showToast('Admin deleted', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__adminsBooted) { window.__adminsBooted = true; initAdmins(); } }, 300);
  }
})();
