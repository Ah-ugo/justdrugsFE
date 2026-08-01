(function () {
  requireAuth();
  let tbody;
  let allCategories = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listCategories();
      allCategories = data.categories || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load categories', 'error'); }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allCategories.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allCategories.length / PAGE_SIZE));
    if (allCategories.length === 0) { tbody.innerHTML = `<tr><td colspan="7"><div class="admin-empty-state"><h3>No categories yet</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(c => `
      <tr>
        <td style="font-size:1.25rem">${esc(c.icon || c.emoji || '📁')}</td>
        <td><div style="font-weight:600">${esc(c.name)}</div><div class="text-xs text-muted">${esc(c.slug || '')}</div></td>
        <td><span class="text-xs text-muted">${esc(c.description || '—')}</span></td>
        <td>${c.featured ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-gray">No</span>'}</td>
        <td>${c.product_count ?? c.count ?? 0}</td>
        <td>${c.sort_order ?? 0}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-secondary admin-edit-cat-btn" data-id="${esc(c._id || c.id)}">${Icons.edit}</button>
            <button class="btn btn-sm btn-danger admin-delete-cat-btn" data-id="${esc(c._id || c.id)}">${Icons.trash}</button>
          </div>
        </td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
    tbody.querySelectorAll('.admin-edit-cat-btn').forEach(btn => btn.addEventListener('click', () => openEdit(btn.dataset.id)));
    tbody.querySelectorAll('.admin-delete-cat-btn').forEach(btn => btn.addEventListener('click', () => deleteCategory(btn.dataset.id)));
  }

  function openOverlay() { const el = document.getElementById('admin-category-overlay'); if (el) el.hidden = false; }
  function closeOverlay() {
    const el = document.getElementById('admin-category-overlay'); if (el) el.hidden = true;
    const f = document.getElementById('admin-cat-form'); if (f) f.reset();
    const idEl = document.getElementById('admin-cat-id'); if (idEl) idEl.value = '';
    const titleEl = document.getElementById('admin-category-form-title'); if (titleEl) titleEl.textContent = 'Edit Category';
  }
  function openEdit(catId) {
    const cat = allCategories.find(c => (c._id || c.id) === catId); if (!cat) return;
    const titleEl = document.getElementById('admin-category-form-title'); if (titleEl) titleEl.textContent = 'Edit Category';
    const idEl = document.getElementById('admin-cat-id'); if (idEl) idEl.value = cat._id || cat.id;
    document.getElementById('admin-cat-name').value = cat.name || '';
    document.getElementById('admin-cat-slug').value = cat.slug || '';
    document.getElementById('admin-cat-icon').value = cat.icon || cat.emoji || '';
    document.getElementById('admin-cat-desc').value = cat.description || '';
    const featEl = document.getElementById('admin-cat-featured'); if (featEl) featEl.checked = !!cat.featured;
    const sortEl = document.getElementById('admin-cat-sort'); if (sortEl) sortEl.value = cat.sort_order ?? 0;
    openOverlay();
  }

  async function init() {
    tbody = document.getElementById('admin-cat-list-tbody');
    const actions = `<button class="btn btn-primary" id="admin-create-cat-btn">${Icons.plus} Add Category</button>`;
    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">${allCategories.length || 0} Categories</span><div style="display:flex;gap:8px">${actions}</div></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Icon</th><th>Name</th><th>Description</th><th>Featured</th><th>Products</th><th>Sort</th><th>Actions</th></tr></thead><tbody id="admin-cat-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Categories', 'Organize your product catalog', contentHtml, { actions: '', page: 'categories' });
    tbody = document.getElementById('admin-cat-list-tbody');

    document.getElementById('admin-create-cat-btn')?.addEventListener('click', () => { closeOverlay(); openOverlay(); });
    document.getElementById('admin-category-cancel')?.addEventListener('click', closeOverlay);
    document.getElementById('admin-category-modal-close')?.addEventListener('click', closeOverlay);
    document.getElementById('admin-category-overlay')?.addEventListener('click', (e) => { if (e.target.id === 'admin-category-overlay') closeOverlay(); });

    document.getElementById('admin-cat-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const catId = document.getElementById('admin-cat-id').value;
      const payload = {
        name: document.getElementById('admin-cat-name').value.trim(),
        slug: document.getElementById('admin-cat-slug').value.trim(),
        icon: document.getElementById('admin-cat-icon').value.trim(),
        description: document.getElementById('admin-cat-desc').value.trim(),
        featured: document.getElementById('admin-cat-featured').checked,
        sort_order: Number(document.getElementById('admin-cat-sort').value) || 0,
      };
      if (!payload.name) { showToast('Category name is required', 'error'); return; }
      try {
        if (catId) { await AdminAPI.updateCategory(catId, payload); showToast('Category updated', 'success'); }
        else { await AdminAPI.createCategory(payload); showToast('Category created', 'success'); }
        closeOverlay(); load();
      } catch (err) { showToast(err.message || 'Operation failed', 'error'); }
    });

    await load();
  }

  async function deleteCategory(id) { if (!confirmDelete('Delete this category?')) return; try { await AdminAPI.deleteCategory(id); showToast('Deleted', 'success'); load(); } catch (err) { showToast(err.message || 'Failed', 'error'); } }

  init();
})();
