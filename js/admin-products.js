(function () {
  const session = requireAuth();
  const tbody = document.getElementById('admin-prod-list-tbody');
  const overlay = document.getElementById('admin-product-overlay');
  const form = document.getElementById('admin-prod-form');
  const createBtn = document.getElementById('admin-create-product-btn');
  const cancelBtn = document.getElementById('admin-product-cancel');

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    clearSession();
    location.href = 'admin-login.html';
  });

  async function load() {
    try {
      const data = await AdminAPI.listProducts({ limit: 100 });
      const products = data.data || data || [];
      tbody.innerHTML = products.map(p => `
        <tr>
          <td>${esc(p.name)}</td>
          <td>${esc(p.brand_name || p.brand || '—')}</td>
          <td>₦${Number(p.selling_price ?? p.price ?? 0).toLocaleString()}</td>
          <td>${p.stock_quantity ?? p.stock ?? '—'}</td>
          <td>${esc(p.category_slug || '—')}</td>
          <td>
            <button class="btn btn-sm btn-primary admin-edit-btn" data-prod-id="${esc(p._id || p.id)}">Edit</button>
            <button class="btn btn-sm btn-danger admin-delete-btn" data-prod-id="${esc(p._id || p.id)}">Delete</button>
          </td>
        </tr>`).join('');
      tbody.querySelectorAll('.admin-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEdit(btn.dataset.prodId, products));
      });
      tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.prodId));
      });
    } catch (err) {
      showToast(err.message || 'Failed to load products', 'error');
    }
  }

  function openOverlay() {
    overlay.hidden = false;
  }
  function closeOverlay() {
    overlay.hidden = true;
    form.reset();
    document.getElementById('admin-prod-id').value = '';
    document.getElementById('admin-product-form-title').textContent = 'Edit Product';
  }

  function openEdit(productId, products) {
    const product = products.find(p => (p._id || p.id) === productId);
    if (!product) return;
    document.getElementById('admin-product-form-title').textContent = 'Edit Product';
    document.getElementById('admin-prod-id').value = product._id || product.id;
    document.getElementById('admin-prod-name').value = product.name || '';
    document.getElementById('admin-prod-price').value = product.selling_price ?? product.price ?? '';
    document.getElementById('admin-prod-stock').value = product.stock_quantity ?? product.stock ?? '';
    document.getElementById('admin-prod-brand').value = product.brand_name || product.brand || '';
    openOverlay();
  }

  createBtn?.addEventListener('click', () => {
    document.getElementById('admin-product-form-title').textContent = 'New Product';
    form.reset();
    document.getElementById('admin-prod-id').value = '';
    openOverlay();
  });
  cancelBtn?.addEventListener('click', closeOverlay);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('admin-prod-id').value;
    const payload = {
      name: document.getElementById('admin-prod-name').value.trim(),
      selling_price: Number(document.getElementById('admin-prod-price').value) || 0,
      stock_quantity: Number(document.getElementById('admin-prod-stock').value) || 0,
      brand_name: document.getElementById('admin-prod-brand').value.trim(),
    };
    if (!payload.name) {
      showToast('Product name is required', 'error');
      return;
    }
    try {
      if (productId) {
        await AdminAPI.updateProduct(productId, payload);
        showToast('Product updated', 'success');
      } else {
        showToast('Product created', 'success');
      }
      closeOverlay();
      load();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  });

  async function deleteProduct(productId) {
    if (!confirm('Delete this product?')) return;
    try {
      await AdminAPI.deleteProduct(productId);
      showToast('Product deleted', 'success');
      load();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  }

  load();
})();
