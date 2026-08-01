/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Products module
   Data table, filters, bulk actions, multi-step editor.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { AdminAPI, DemoData, icon, esc, fmtMoney, fmtDate, fmtCompact, showToast, confirmDialog, openModal, closeModal, debounce, stockBadge } = JD;

  let allProducts = [];
  let filtered = [];
  let page = 1;
  const PER_PAGE = 10;
  let selected = new Set();
  let view = 'table';

  window.__pageContentRendered = function () {
    initProducts();
  };

  async function initProducts() {
    bindEvents();
    await loadProducts();
    populateCategoryFilter();
    // Support ?new=1 deep-link to open editor
    if (new URLSearchParams(location.search).get('new') === '1') {
      openProductEditor();
    }
  }

  async function loadProducts() {
    const data = await JD.loadData(
      () => AdminAPI.listProducts({ limit: 100 }),
      DemoData.products
    );
    allProducts = data;
    applyFilters();
  }

  function populateCategoryFilter() {
    const cats = [...new Set(allProducts.map(p => p.category_name).filter(Boolean))];
    const sel = document.getElementById('product-category-filter');
    sel.innerHTML = '<option value="">All categories</option>' +
      cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  }

  function applyFilters() {
    const q = (document.getElementById('product-search')?.value || '').toLowerCase();
    const cat = document.getElementById('product-category-filter')?.value || '';
    const status = document.getElementById('product-status-filter')?.value || '';
    const rx = document.getElementById('product-rx-filter')?.value || '';

    filtered = allProducts.filter(p => {
      if (q && !(`${p.name} ${p.sku || ''} ${p.generic_name || ''} ${p.brand_name || ''}`).toLowerCase().includes(q)) return false;
      if (cat && p.category_name !== cat) return false;
      if (status && (p.stock_status || p.status) !== status) return false;
      if (rx === 'rx' && !p.requires_prescription) return false;
      if (rx === 'otc' && p.requires_prescription) return false;
      return true;
    });
    page = 1;
    renderTable();
    renderGrid();
    document.getElementById('products-total-line').textContent = `${filtered.length} products · ${allProducts.length} in catalogue`;
  }

  function renderTable() {
    const tbody = document.getElementById('products-tbody');
    const start = (page - 1) * PER_PAGE;
    const items = filtered.slice(start, start + PER_PAGE);

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="13">
        <div class="empty-state">
          <div class="empty-icon">${icon('box', 32)}</div>
          <div class="empty-title">No products found</div>
          <div class="empty-desc">Try adjusting your filters, or add a new product to the catalogue.</div>
          <div class="empty-action"><button class="btn btn-primary" id="empty-add-product">${icon('plus', 15)} Add Product</button></div>
        </div>
      </td></tr>`;
      document.getElementById('empty-add-product')?.addEventListener('click', () => openProductEditor());
    } else {
      tbody.innerHTML = items.map(p => {
        const id = p._id || p.id;
        const price = p.discount_price || p.price;
        const discountPct = p.price && p.discount_price ? Math.round(((p.price - p.discount_price) / p.price) * 100) : 0;
        const img = p.image || (p.images && p.images[0]?.url);
        const stars = renderStars(p.rating);
        return `
        <tr data-id="${esc(id)}">
          <td><input type="checkbox" class="checkbox row-checkbox" data-id="${esc(id)}" ${selected.has(id) ? 'checked' : ''}></td>
          <td>
            <div class="product-cell">
              ${img ? `<img class="product-thumb" src="${esc(img)}" alt="${esc(p.name)}" loading="lazy">`
                     : `<div class="product-thumb fallback">${esc((p.name || '?')[0].toUpperCase())}</div>`}
              <div class="cell-stack">
                <span class="table-cell-primary">${esc(p.name)}</span>
                <span class="table-cell-secondary">${esc(p.generic_name || p.brand_name || '—')} · ${esc(p.slug || '')}</span>
              </div>
            </div>
          </td>
          <td><code class="mono">${esc(p.sku || '—')}</code></td>
          <td><span class="badge badge-gray">${esc(p.category_name || '—')}</span></td>
          <td class="table-cell-secondary">${esc(p.brand_name || '—')}</td>
          <td class="num text-right">${fmtMoney(price)}${discountPct ? `<div class="table-cell-secondary">was ${fmtMoney(p.price)}</div>` : ''}</td>
          <td class="text-right">${discountPct ? `<span class="badge badge-danger">-${discountPct}%</span>` : '<span class="text-3">—</span>'}</td>
          <td class="num text-right"><b>${p.available_stock ?? p.current_stock ?? 0}</b><div class="table-cell-secondary">${(p.reserved_stock ?? 0) ? `${p.reserved_stock} reserved` : ''}</div></td>
          <td>${stockBadge(p.stock_status || p.status)}</td>
          <td>${p.requires_prescription ? '<span class="badge badge-purple">Rx</span>' : '<span class="badge badge-gray">OTC</span>'}</td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;">
              <div class="progress brand" style="width:50px;"><div style="width:${Math.min(100, (p.rating || 0) * 18)}%"></div></div>
              <span class="text-2" style="font-size:11.5px;font-weight:650;">${(p.rating || 0).toFixed(1)}</span>
            </div>
          </td>
          <td class="table-cell-secondary no-wrap">${fmtDate(p.created_at, { short: true })}</td>
          <td>
            <div class="row-actions">
              <button class="row-action-btn" data-act="view" data-id="${esc(id)}" title="View">${icon('eye', 15)}</button>
              <button class="row-action-btn" data-act="edit" data-id="${esc(id)}" title="Edit">${icon('edit', 15)}</button>
              <button class="row-action-btn" data-act="duplicate" data-id="${esc(id)}" title="Duplicate">${icon('copy', 15)}</button>
              <button class="row-action-btn" data-act="archive" data-id="${esc(id)}" title="Archive">${icon('archive', 15)}</button>
    document.getElementById('admin-prod-min-stock').value = product.minimum_stock || 10;
    document.getElementById('admin-prod-desc').value = product.description || product.short_description || '';
    document.getElementById('admin-prod-prescription').checked = !!product.prescription_required;
    openOverlay();
  }

  async function init() {
    tbody = document.getElementById('admin-prod-list-tbody');
    overlay = document.getElementById('admin-product-overlay');
    form = document.getElementById('admin-prod-form');
    createBtnPlaceholder = document.getElementById('admin-page-actions');
    cancelBtn = document.getElementById('admin-product-cancel');
    modalClose = document.getElementById('admin-product-modal-close');

    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <input type="search" id="admin-prod-search" placeholder="Search products..." style="width:240px">
            <select id="admin-prod-filter-category" style="width:180px"><option value="">All Categories</option></select>
            <select id="admin-prod-filter-status" style="width:140px"><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" id="admin-export-btn">${Icons.download} Export</button>
            <span class="text-sm text-muted" id="admin-selected-count"></span>
          </div>
        </div>
        <div class="admin-table-scroll">
          <table class="admin-table">
            <thead>
              <tr>
                <th class="admin-table-checkbox"><input type="checkbox" id="admin-select-all"></th>
                <th>Product</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Rx</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="admin-prod-list-tbody"></tbody>
          </table>
        </div>
        <div class="admin-table-pagination">
          <span class="text-sm text-muted" id="admin-page-info"></span>
          <div class="admin-pagination-btns" id="admin-pagination"></div>
        </div>
      </div>
    `;

    initAppShell('Products', 'Manage your product catalog', contentHtml, { actions: '', page: 'products' });

    // Re-acquire elements after shell is built
    tbody = document.getElementById('admin-prod-list-tbody');
    overlay = document.getElementById('admin-product-overlay');
    form = document.getElementById('admin-prod-form');
    createBtnPlaceholder = document.getElementById('admin-page-actions');
    cancelBtn = document.getElementById('admin-product-cancel');
    modalClose = document.getElementById('admin-product-modal-close');

    // Remove default page actions and add "Add Product" button
    if (createBtnPlaceholder) {
      createBtnPlaceholder.innerHTML = `
        <button class="btn btn-primary" id="admin-create-product-btn">${Icons.plus} Add Product</button>
        <button class="btn btn-secondary" id="admin-import-btn">${Icons.download} Import</button>
      `;
    }

    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
      clearSession();
      location.href = 'admin-login.html';
    });

    document.getElementById('admin-create-product-btn')?.addEventListener('click', () => {
      const titleEl = document.getElementById('admin-product-form-title');
      if (titleEl) titleEl.textContent = 'New Product';
      if (form) form.reset();
      const idEl = document.getElementById('admin-prod-id');
      if (idEl) idEl.value = '';
      openOverlay();
    });
    cancelBtn?.addEventListener('click', closeOverlay);
    modalClose?.addEventListener('click', closeOverlay);
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const productId = document.getElementById('admin-prod-id').value;
      const payload = {
        name: document.getElementById('admin-prod-name').value.trim(),
        sku: document.getElementById('admin-prod-sku').value.trim(),
        brand_name: document.getElementById('admin-prod-brand').value.trim(),
        selling_price: Number(document.getElementById('admin-prod-price').value) || 0,
        discount_percentage: Number(document.getElementById('admin-prod-discount').value) || 0,
        stock_quantity: Number(document.getElementById('admin-prod-stock').value) || 0,
        minimum_stock: Number(document.getElementById('admin-prod-min-stock').value) || 10,
        description: document.getElementById('admin-prod-desc').value.trim(),
        prescription_required: document.getElementById('admin-prod-prescription').checked,
      };
      if (!payload.name) { showToast('Product name is required', 'error'); return; }
      try {
        if (productId) {
          await AdminAPI.updateProduct(productId, payload);
          showToast('Product updated', 'success');
        } else {
          await AdminAPI.createProduct(payload);
          showToast('Product created', 'success');
        }
        closeOverlay();
        load();
      } catch (err) {
        showToast(err.message || 'Operation failed', 'error');
      }
    });

    await loadCategories();
    await load();

    document.getElementById('admin-prod-search')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      allProducts = allProducts.filter(p => (p.name || '').toLowerCase().includes(q) || (p.brand_name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
      currentPage = 1;
      renderTable();
    });
  }

  async function duplicateProduct(productId) {
    try {
      await AdminAPI.duplicateProduct(productId);
      showToast('Product duplicated', 'success');
      load();
    } catch (err) {
      showToast(err.message || 'Failed to duplicate', 'error');
    }
  }

  async function deleteProduct(productId) {
    if (!confirmDelete('Are you sure you want to delete this product?')) return;
    try {
      await AdminAPI.deleteProduct(productId);
      showToast('Product deleted', 'success');
      selectedProducts.delete(productId);
      load();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  }

  init();
})();
