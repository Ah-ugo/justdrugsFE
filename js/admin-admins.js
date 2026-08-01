(function () {
  const session = requireAuth();
  const tbody = document.getElementById('admin-admins-tbody');
  const overlay = document.getElementById('admin-admin-overlay');
  const form = document.getElementById('admin-admin-form');
  const createBtn = document.getElementById('admin-create-admin-btn');
  const cancelBtn = document.getElementById('admin-admin-cancel');

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    clearSession();
    location.href = 'admin-login.html';
  });

  async function load() {
    try {
      const data = await AdminAPI.listAdmins(null, 1, 100);
      const admins = data.data || data || [];
      tbody.innerHTML = admins.map(a => `
        <tr>
          <td>${esc(a.full_name)}</td>
          <td>${esc(a.email)}</td>
          <td><span class="badge">${esc(a.role)}</span></td>
          <td>${a.is_active !== false ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'}</td>
          <td>
            <button class="btn btn-sm btn-primary admin-edit-btn" data-admin-id="${esc(a.id)}">Edit</button>
            ${a.role !== 'super_admin' ? `<button class="btn btn-sm btn-danger admin-delete-btn" data-admin-id="${esc(a.id)}">Delete</button>` : ''}
          </td>
        </tr>`).join('');
      tbody.querySelectorAll('.admin-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEdit(btn.dataset.adminId, admins));
      });
      tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteAdmin(btn.dataset.adminId));
      });
    } catch (err) {
      showToast(err.message || 'Failed to load admins', 'error');
    }
  }

  function openOverlay() {
    overlay.hidden = false;
  }
  function closeOverlay() {
    overlay.hidden = true;
    form.reset();
    document.getElementById('admin-admin-id').value = '';
    document.getElementById('admin-admin-form-title').textContent = 'Create Admin';
  }

  function openEdit(adminId, admins) {
    const admin = admins.find(a => a.id === adminId);
    if (!admin) return;
    document.getElementById('admin-admin-form-title').textContent = 'Edit Admin';
    document.getElementById('admin-admin-id').value = admin.id;
    document.getElementById('admin-admin-full-name').value = admin.full_name || '';
    document.getElementById('admin-admin-email').value = admin.email || '';
    document.getElementById('admin-admin-role').value = admin.role || '';
    document.getElementById('admin-admin-is-active').checked = admin.is_active !== false;
    openOverlay();
  }

  createBtn?.addEventListener('click', () => {
    document.getElementById('admin-admin-form-title').textContent = 'Create Admin';
    form.reset();
    document.getElementById('admin-admin-id').value = '';
    openOverlay();
  });
  cancelBtn?.addEventListener('click', closeOverlay);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const adminId = document.getElementById('admin-admin-id').value;
    const payload = {
      full_name: document.getElementById('admin-admin-full-name').value.trim(),
      email: document.getElementById('admin-admin-email').value.trim(),
      role: document.getElementById('admin-admin-role').value,
      is_active: document.getElementById('admin-admin-is-active').checked,
    };
    if (!payload.full_name || !payload.email || !payload.role) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    try {
      if (adminId) {
        await AdminAPI.updateAdmin(adminId, payload);
        showToast('Admin updated', 'success');
      } else {
        payload.password = 'changeme123';
        await AdminAPI.createAdmin(payload);
        showToast('Admin created', 'success');
      }
      closeOverlay();
      load();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  });

  async function deleteAdmin(adminId) {
    if (!confirm('Delete this admin?')) return;
    try {
      await AdminAPI.deleteAdmin(adminId);
      showToast('Admin deleted', 'success');
      load();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  }

  load();
})();
