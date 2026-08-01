(function () {
  const session = requireAuth();
  const tbody = document.getElementById('admin-banner-list-tbody');
  const overlay = document.getElementById('admin-banner-overlay');
  const form = document.getElementById('admin-banner-form');
  const createBtn = document.getElementById('admin-create-banner-btn');
  const cancelBtn = document.getElementById('admin-banner-cancel');

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    clearSession();
    location.href = 'admin-login.html';
  });

  async function load() {
    try {
      const data = await AdminAPI.listBanners();
      const items = data.data || data || [];
      tbody.innerHTML = items.map(b => `
        <tr>
          <td>${esc(b.title || 'Untitled')}</td>
          <td>${esc(b.subtitle || '')}</td>
          <td>${b.active !== false ? 'Active' : 'Inactive'}</td>
          <td>
            <button class="btn btn-sm btn-primary admin-edit-btn" data-banner-id="${esc(b._id || b.id)}">Edit</button>
            <button class="btn btn-sm btn-danger admin-delete-btn" data-banner-id="${esc(b._id || b.id)}">Delete</button>
          </td>
        </tr>`).join('');
      tbody.querySelectorAll('.admin-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEdit(btn.dataset.bannerId, items));
      });
      tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteBanner(btn.dataset.bannerId));
      });
    } catch (err) {
      showToast(err.message || 'Failed to load banners', 'error');
    }
  }

  function openOverlay() {
    overlay.hidden = false;
  }
  function closeOverlay() {
    overlay.hidden = true;
    form.reset();
    document.getElementById('admin-banner-id').value = '';
    document.getElementById('admin-banner-form-title').textContent = 'Edit Banner';
  }

  function openEdit(bannerId, items) {
    const item = items.find(b => (b._id || b.id) === bannerId);
    if (!item) return;
    document.getElementById('admin-banner-form-title').textContent = 'Edit Banner';
    document.getElementById('admin-banner-id').value = item._id || item.id;
    document.getElementById('admin-banner-title').value = item.title || '';
    document.getElementById('admin-banner-subtitle').value = item.subtitle || '';
    document.getElementById('admin-banner-active').checked = item.active !== false;
    openOverlay();
  }

  createBtn?.addEventListener('click', () => {
    document.getElementById('admin-banner-form-title').textContent = 'New Banner';
    form.reset();
    document.getElementById('admin-banner-id').value = '';
    openOverlay();
  });
  cancelBtn?.addEventListener('click', closeOverlay);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bannerId = document.getElementById('admin-banner-id').value;
    const payload = {
      title: document.getElementById('admin-banner-title').value.trim(),
      subtitle: document.getElementById('admin-banner-subtitle').value.trim(),
      active: document.getElementById('admin-banner-active').checked,
    };
    if (!payload.title) {
      showToast('Title is required', 'error');
      return;
    }
    try {
      if (bannerId) {
        await AdminAPI.updateBanner(bannerId, payload);
        showToast('Banner updated', 'success');
      } else {
        await AdminAPI.createBanner(payload);
        showToast('Banner created', 'success');
      }
      closeOverlay();
      load();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  });

  async function deleteBanner(bannerId) {
    if (!confirm('Delete this banner?')) return;
    try {
      await AdminAPI.deleteBanner(bannerId);
      showToast('Banner deleted', 'success');
      load();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  }

  load();
})();
