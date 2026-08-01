(function () {
  const session = requireAuth();
  const tbody = document.getElementById('admin-discount-list-tbody');
  const overlay = document.getElementById('admin-discount-overlay');
  const form = document.getElementById('admin-discount-form');
  const createBtn = document.getElementById('admin-create-discount-btn');
  const cancelBtn = document.getElementById('admin-discount-cancel');

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    clearSession();
    location.href = 'admin-login.html';
  });

  async function load() {
    try {
      const data = await AdminAPI.listDiscounts();
      const items = data.data || data || [];
      tbody.innerHTML = items.map(d => `
        <tr>
          <td><code>${esc(d.code || d.name || '—')}</code></td>
          <td>${esc(d.discount_type || d.type || '—')}</td>
          <td>${d.discount_value ?? d.value ?? '—'}</td>
          <td>${d.is_active !== false ? 'Active' : 'Inactive'}</td>
          <td>
            <button class="btn btn-sm btn-primary admin-edit-btn" data-disc-id="${esc(d._id || d.id)}">Edit</button>
            <button class="btn btn-sm btn-danger admin-delete-btn" data-disc-id="${esc(d._id || d.id)}">Delete</button>
          </td>
        </tr>`).join('');
      tbody.querySelectorAll('.admin-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEdit(btn.dataset.discId, items));
      });
      tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteDiscount(btn.dataset.discId));
      });
    } catch (err) {
      showToast(err.message || 'Failed to load discounts', 'error');
    }
  }

  function openOverlay() {
    overlay.hidden = false;
  }
  function closeOverlay() {
    overlay.hidden = true;
    form.reset();
    document.getElementById('admin-discount-id').value = '';
    document.getElementById('admin-discount-form-title').textContent = 'Edit Discount';
  }

  function openEdit(discountId, items) {
    const item = items.find(d => (d._id || d.id) === discountId);
    if (!item) return;
    document.getElementById('admin-discount-form-title').textContent = 'Edit Discount';
    document.getElementById('admin-discount-id').value = item._id || item.id;
    document.getElementById('admin-discount-code').value = item.code || item.name || '';
    document.getElementById('admin-discount-type').value = item.discount_type || item.type || 'percentage';
    document.getElementById('admin-discount-value').value = item.discount_value ?? item.value ?? '';
    document.getElementById('admin-discount-active').checked = item.is_active !== false;
    openOverlay();
  }

  createBtn?.addEventListener('click', () => {
    document.getElementById('admin-discount-form-title').textContent = 'New Discount';
    form.reset();
    document.getElementById('admin-discount-id').value = '';
    openOverlay();
  });
  cancelBtn?.addEventListener('click', closeOverlay);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const discountId = document.getElementById('admin-discount-id').value;
    const payload = {
      code: document.getElementById('admin-discount-code').value.trim().toUpperCase(),
      discount_type: document.getElementById('admin-discount-type').value,
      discount_value: Number(document.getElementById('admin-discount-value').value) || 0,
      is_active: document.getElementById('admin-discount-active').checked,
    };
    if (!payload.code) {
      showToast('Code is required', 'error');
      return;
    }
    try {
      if (discountId) {
        await AdminAPI.updateDiscount(discountId, payload);
        showToast('Discount updated', 'success');
      } else {
        await AdminAPI.createDiscount(payload);
        showToast('Discount created', 'success');
      }
      closeOverlay();
      load();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  });

  async function deleteDiscount(discountId) {
    if (!confirm('Delete this discount?')) return;
    try {
      await AdminAPI.deleteDiscount(discountId);
      showToast('Discount deleted', 'success');
      load();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  }

  load();
})();
