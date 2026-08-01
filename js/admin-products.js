/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Products module
   Data table, search, filters, bulk actions, pagination,
   grid view, and multi-step product editor.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, fmtMoney, fmtDate, esc, showToast, confirmDialog, openModal, closeModal } = JD;

  const state = {
    products: [],
    filtered: [],
    page: 1,
    perPage: 10,
    selected: new Set(),
    view: 'table',
    query: '',
    category: '',
    status: '',
    rx: '',
  };

  window.__pageContentRendered = function () {
    initProducts();
  };

  async function initProducts() {
    populateCategoryFilter();
    const data = await loadProducts();
    state.products = data;
    applyFilters();
    bindEvents();
    if (new URLSearchParams(location.search).get('new') === '1') {
      openEditor();
      history.replaceState(null, '', location.pathname);
    }
  }

  async function loadProducts() {
    try {
      const res = await AdminAPI.listProducts({ limit: 100, sort_by: 'newest' });
      const data = res.data || res;
      const items = Array.isArray(data) ? data : (data.items || []);
      document.getElementById('products-total-line').textContent = `${items.length} products in your catalogue.`;
      return items;
    } catch (e) {
      console.warn('[Products] Demo mode:', e.message);
      document.getElementById('products-total-line').textContent = `${DemoData.products.length} products (demo data).`;
      return DemoData.products;
    }
  }

  function populateCategoryFilter() {
    const cats = [...new Set(DemoData.products.map(p => p.category_name).filter(Boolean))];
    const sel = document.getElementById('product-category-filter');
    sel.innerHTML = '<option value="">All categories</option>' + cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  }

  function applyFilters() {
    const q = state.query.toLowerCase();
    state.filtered = state.products.filter(p => {
      if (q && !(p.name || '').toLowerCase().includes(q) && !(p.sku || '').toLowerCase().includes(q) && !(p.generic_name || '').toLowerCase().includes(q)) return false;
      if (state.category && p.category_name !== state.category) return false;
      if (state.status && p.stock_status !== state.status) return false;
      if (state.rx === 'rx' && !p.requires_prescription) return false;
      if (state.rx === 'otc' && p.requires_prescription) return false;
      return true;
    });
    state.page = 1;
    renderTable();
  }

  function renderTable() {
    const tbody = document.getElementById('products-tbody');
    const { filtered, page, perPage } = state;
    const start = (page - 1) * perPage;
    const slice = filtered.slice(start, start + perPage);
    const total = filtered.length;

    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="13">
        <div class="empty-state">
          <div class="empty-icon">${icon('box', 32)}</div>
          <div class="empty-title">No products found</div>
          <div class="empty-desc">Try adjusting your search or filters, or add a new product.</div>
          <div class="empty-action"><button class="btn btn-primary btn-sm" onclick="window.__jdAddProduct && window.__jdAddProduct()">${icon('plus', 14)} Add Product</button></div></td></tr>`;
    } else {
      tbody.innerHTML = slice.map(p => {
        const price = p.discount_price || p.price;
        const discountPct = p.discount_price ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
        const selected = state.selected.has(p._id);
        return `
        <tr data-id="${esc(p._id)}" style="${selected ? 'background:var(--brand-50)' : ''}">
          <td><input type="checkbox" class="checkbox row-check" data-id="${esc(p._id)}" ${selected ? 'checked' : ''}></td>
          <td>
            <div class="product-cell">
              ${p.image ? `<img class="product-thumb" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : `<div class="product-thumb fallback">${icon('box', 18)}</div>`}
              <div class="cell-stack">
                <span class="table-cell-primary">${esc(p.name)}</span>
                <span class="table-cell-secondary">${esc(p.generic_name || '')}</span>
              </div>
          </td>
          <td><code class="mono">${esc(p.sku)}</code></td>
          <td><span class="badge badge-gray">${esc(p.category_name || '—')}</span></td>
          <td class="muted">${esc(p.brand_name || '—')}</td>
          <td class="num text-right font-bold">${fmtMoney(price)}</td>
          <td class="num text-right">${discountPct ? `<span class="badge badge-success">-${discountPct}%</span>` : '<span class="muted">—</span>'}</td>
          <td class="num text-right">
            <div class="cell-stack" style="align-items:flex-end">
              <span class="font-bold">${p.available_stock ?? p.current_stock ?? 0}</span>
              <span class="table-cell-secondary">${p.reserved_stock ? `(${p.reserved_stock} reserved)` : ''}</span>
            </div>
          </td>
          <td>${JD.stockBadge(p.stock_status)}</td>
          <td>${p.requires_prescription ? '<span class="badge badge-purple">Rx</span>' : '<span class="badge badge-gray">OTC</span>'}</td>
          <td>
            <div class="flex items-center gap-8">
              <span class="text-2 font-bold num">${p.rating || '—'}</span>
              <div class="progress brand" style="width:54px"><div style="width:${(p.rating || 0) / 5 * 100}%"></div>
            </div>
          </td>
          <td class="muted no-wrap">${fmtDate(p.created_at, { short: true })}</td>
          <td>
            <div class="row-actions">
              <button class="row-action-btn act-view" data-id="${esc(p._id)}" title="View">${icon('eye', 15)}</button>
              <button class="row-action-btn act-edit" data-id="${esc(p._id)}" title="Edit">${icon('edit', 15)}</button>
              <button class="row-action-btn act-duplicate" data-id="${esc(p._id)}" title="Duplicate">${icon('copy', 15)}</button>
              <button class="row-action-btn act-archive" data-id="${esc(p._id)}" title="Archive">${icon('archive', 15)}</button>
              <button class="row-action-btn danger act-delete" data-id="${esc(p._id)}" title="Delete">${icon('trash', 15)}</button>
            </div>
          </td>
        </tr>`;
      }).join('');
    }

    document.getElementById('products-page-info').textContent = total ? `Showing ${start + 1}–${Math.min(start + perPage, total)} of ${total}` : 'Showing 0–0 of 0';
    renderPagination(total);

    // Bind row actions
    tbody.querySelectorAll('.act-view').forEach(b => b.addEventListener('click', () => viewProduct(b.dataset.id)));
    tbody.querySelectorAll('.act-edit').forEach(b => b.addEventListener('click', () => openEditor(b.dataset.id)));
    tbody.querySelectorAll('.act-duplicate').forEach(b => b.addEventListener('click', () => duplicateProduct(b.dataset.id)));
    tbody.querySelectorAll('.act-archive').forEach(b => b.addEventListener('click', () => archiveProduct(b.dataset.id)));
    tbody.querySelectorAll('.act-delete').forEach(b => b.addEventListener('click', () => deleteProduct(b.dataset.id)));
    tbody.querySelectorAll('.row-check').forEach(cb => cb.addEventListener('change', () => toggleSelect(cb.dataset.id, cb.checked)));
  }

  function renderPagination(total) {
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    const wrap = document.getElementById('products-pagination');
    let html = `<button class="page-btn" data-p="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>${icon('chevronLeft', 14)}</button>`;
    for (let i = 1; i <= pages; i++) {
      if (pages > 7 && i !== 1 && i !== pages && Math.abs(i - state.page) > 2) {
        if (Math.abs(i - state.page) === 3) html += `<span class="muted" style="padding:0 4px">…</span>`;
        continue;
      }
      html += `<button class="page-btn ${i === state.page ? 'active' : ''}" data-p="${i}">${i}</button>`;
    }
    html += `<button class="page-btn" data-p="${state.page + 1}" ${state.page >= pages ? 'disabled' : ''}>${icon('chevronRight', 14)}</button>`;
    wrap.innerHTML = html;
    wrap.querySelectorAll('.page-btn').forEach(b => b.addEventListener('click', () => {
      if (b.disabled) return;
      state.page = Number(b.dataset.p);
      renderTable();
    }));
  }

  function toggleSelect(id, checked) {
    if (checked) state.selected.add(id); else state.selected.delete(id);
    document.getElementById('bulk-bar').style.display = state.selected.size ? 'flex' : 'none';
    document.getElementById('bulk-count').textContent = state.selected.size;
    renderTable();
  }

  function viewProduct(id) {
    const p = state.products.find(x => x._id === id);
    if (!p) return;
    openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">${esc(p.name)}</h3><p class="modal-subtitle">${esc(p.sku)}</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body">
        <div class="flex gap-16 mb-20">
          ${p.image ? `<img src="${esc(p.image)}" style="width:110px;height:110px;border-radius:16px;object-fit:cover;border:1px solid var(--border-soft)" alt="">` : ''}
          <div class="flex-1">
            <div class="grid grid-2">
              <div class="field"><label>Price</label><div class="font-bold text-lg">${fmtMoney(p.price)}</div>
              <div class="field"><label>Discounted</label><div class="font-bold text-lg text-success">${p.discount_price ? fmtMoney(p.discount_price) : '—'}</div>
              <div class="field"><label>Stock</label><div class="font-bold">${p.available_stock ?? p.current_stock} available</div>
              <div class="field"><label>Status</label><div>${JD.stockBadge(p.stock_status)}</div>
              <div class="field"><label>Brand</label><div class="muted">${esc(p.brand_name || '—')}</div>
              <div class="field"><label>Category</label><div class="muted">${esc(p.category_name || '—')}</div>
            </div>
        </div>
        <div class="alert alert-info mb-16">${icon('alertCircle', 18)} This product ${p.requires_prescription ? '<b>requires an approved prescription</b> before checkout.' : 'is available without a prescription.'}</div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-close>Close</button>
        <button class="btn btn-primary" data-edit>Edit Product</button>
      </div>`, { size: 'lg' })
      .querySelector('[data-edit]').addEventListener('click', (e) => {
        const backdrop = e.target.closest('.modal-backdrop');
        closeModal(backdrop);
        openEditor(id);
      });
  }

  async function duplicateProduct(id) {
    const p = state.products.find(x => x._id === id);
    if (!p) return;
    const ok = await confirmDialog(`Duplicate <b>${esc(p.name)}</b>? A copy with a new SKU will be created.`, { confirmText: 'Duplicate' });
    if (!ok) return;
    showToast(`Product "${p.name}" duplicated`, 'success');
  }

  async function archiveProduct(id) {
    const p = state.products.find(x => x._id === id);
    const ok = await confirmDialog(`Archive <b>${esc(p?.name)}</b>? It will be hidden from the storefront.`, { variant: 'danger', confirmText: 'Archive' });
    if (!ok) return;
    showToast('Product archived', 'success');
  }

  async function deleteProduct(id) {
    const p = state.products.find(x => x._id === id);
    const ok = await confirmDialog(`Permanently delete <b>${esc(p?.name)}</b>? This cannot be undone.`, { variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    try {
      await AdminAPI.deleteProduct(id);
      state.products = state.products.filter(x => x._id !== id);
      state.selected.delete(id);
      applyFilters();
      showToast('Product deleted', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to delete', 'error');
    }
  }

  /* ─── Multi-step product editor ──────────────────────── */
  const EDITOR_STEPS = ['Basic Information', 'Pricing', 'Inventory', 'Images', 'Category & Brand', 'Medical Info', 'SEO & Visibility'];
  const EDITOR_ICONS = ['box', 'dollar', 'database', 'image', 'layers', 'pill', 'globe'];
  let editorCurrentStep = 0;
  let editorProduct = null;

  function openEditor(id) {
    editorProduct = id ? state.products.find(x => x._id === id) || null : null;
    editorCurrentStep = 0;
    const modal = openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">${editorProduct ? 'Edit Product' : 'Add Product'}</h3>
        <p class="modal-subtitle">${editorProduct ? `Editing ${esc(editorProduct.name)}` : 'Create a new catalogue item'}</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body" style="padding-top:20px;">
        <div class="stepper">${EDITOR_STEPS.map((s, i) => `
          <button class="stepper-step ${i === 0 ? 'active' : ''}" data-step="${i}">
            <span class="stepper-num">${i < editorCurrentStep ? icon('check', 12) : i + 1}</span>${s}
          </button>`).join('')}</div>
        <div id="editor-body"></div>
      <div class="modal-foot">
        <button class="btn btn-secondary" id="editor-prev-btn" style="display:none;">${icon('chevronLeft', 15)} Back</button>
        <button class="btn btn-primary" id="editor-next-btn">Continue ${icon('chevronRight', 15)}</button>
        <button class="btn btn-success" id="editor-save-btn" style="display:none;">${icon('check', 15)} Save Product</button>
      </div>`, { size: 'lg' });
    renderEditorStep();
    modal.querySelector('#editor-next-btn').addEventListener('click', () => {
      if (editorCurrentStep < EDITOR_STEPS.length - 1) {
        editorCurrentStep++;
        renderEditorStep();
      }
    });
    modal.querySelector('#editor-prev-btn').addEventListener('click', () => {
      if (editorCurrentStep > 0) {
        editorCurrentStep--;
        renderEditorStep();
      }
    });
    modal.querySelector('#editor-save-btn').addEventListener('click', async () => {
      const name = document.getElementById('ed-name')?.value;
      if (!name) { showToast('Product name is required', 'error'); return; }
      showToast(editorProduct ? 'Product updated successfully' : 'Product created successfully', 'success');
      closeModal(modal);
    });
    modal.querySelectorAll('.stepper-step').forEach(btn => btn.addEventListener('click', () => {
      editorCurrentStep = Number(btn.dataset.step);
      renderEditorStep();
    }));
  }

  function renderEditorStep() {
    const body = document.getElementById('editor-body');
    const prevBtn = document.getElementById('editor-prev-btn');
    const nextBtn = document.getElementById('editor-next-btn');
    const saveBtn = document.getElementById('editor-save-btn');
    prevBtn.style.display = editorCurrentStep === 0 ? 'none' : 'inline-flex';
    nextBtn.style.display = editorCurrentStep === EDITOR_STEPS.length - 1 ? 'none' : 'inline-flex';
    saveBtn.style.display = editorCurrentStep === EDITOR_STEPS.length - 1 ? 'inline-flex' : 'none';
    document.querySelectorAll('.stepper-step').forEach((s, i) => {
      s.classList.toggle('active', i === editorCurrentStep);
      s.classList.toggle('done', i < editorCurrentStep);
      s.querySelector('.stepper-num').innerHTML = i < editorCurrentStep ? icon('check', 12) : i + 1;
    });
    const p = editorProduct || {};
    const steps = [
      /* Basic Information */
      `<div class="grid grid-2">
        <div class="field"><label class="field-required">Product name</label><input class="input" id="ed-name" value="${esc(p.name || '')}" placeholder="e.g. Paracetamol 500mg"></div>
        <div class="field"><label>Generic name</label><input class="input" id="ed-generic" value="${esc(p.generic_name || '')}" placeholder="e.g. Paracetamol"></div>
        <div class="field"><label>Description</label><textarea class="textarea" id="ed-desc" rows="3" placeholder="Short product description…">${esc(p.description || '')}</textarea></div>
        <div class="field"><label>Manufacturer</label><input class="input" id="ed-manufacturer" value="${esc(p.manufacturer || '')}" placeholder="Manufacturer name"></div>
        <div class="field"><label>Strength</label><input class="input" id="ed-strength" value="${esc(p.strength || '')}" placeholder="e.g. 500mg"></div>
        <div class="field"><label>Dosage form</label>
          <select class="select" id="ed-form"><option value="">Select form</option>${['Tablet','Capsule','Syrup','Injection','Cream','Inhaler','Drops','Sachet'].map(f => `<option ${p.dosage_form === f ? 'selected' : ''}>${f}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Uses</label><input class="input" id="ed-uses" value="${esc((p.uses || []).join(', '))}" placeholder="Comma-separated uses"></div>
        <div class="field"><label>Side effects</label><input class="input" id="ed-effects" value="${esc((p.side_effects || []).join(', '))}" placeholder="Comma-separated side effects"></div>`,
      /* Pricing */
      `<div class="grid grid-2">
        <div class="field"><label class="field-required">Selling price (₦)</label><input class="input" type="number" id="ed-price" value="${p.price || ''}" placeholder="0.00"></div>
        <div class="field"><label>Discount price (₦)</label><input class="input" type="number" id="ed-discount" value="${p.discount_price || ''}" placeholder="Optional"></div>
        <div class="field"><label>Cost price (₦)</label><input class="input" type="number" id="ed-cost" value="${p.cost_price || ''}" placeholder="For margins"></div>
        <div class="field"><label>SKU</label><input class="input" id="ed-sku" value="${esc(p.sku || '')}" placeholder="e.g. RX-PAR-500"></div>
        <div class="field"><label>Barcode</label><input class="input" id="ed-barcode" value="${esc(p.barcode || '')}" placeholder="Optional"></div>
      <div class="alert alert-info mt-16">${icon('trendingUp', 18)} Margin preview: <b>${fmtMoney((p.price || 0) - (p.cost_price || 0))}</b> (${p.price ? Math.round(((p.price - (p.cost_price || 0)) / p.price) * 100) : 0}%)</div>`,
      /* Inventory */
      `<div class="grid grid-2">
        <div class="field"><label>Initial stock</label><input class="input" type="number" id="ed-stock" value="${p.current_stock ?? ''}"></div>
        <div class="field"><label>Reorder level</label><input class="input" type="number" id="ed-reorder" value="10"></div>
        <div class="field"><label>Supplier</label><input class="input" id="ed-supplier" value="${esc(p.supplier || '')}" placeholder="Supplier name"></div>
        <div class="field"><label>Batch number</label><input class="input" id="ed-batch" placeholder="Optional"></div>
        <div class="field"><label>Expiry date</label><input class="input" type="date" id="ed-expiry"></div>
        <div class="field"><label>Warehouse</label><select class="select" id="ed-warehouse"><option>Main Warehouse</option><option>Lekki Hub</option><option>Ikeja Depot</option></select></div>`,
      /* Images */
      `<div class="upload-zone" id="ed-upload-zone">
        <div class="upload-zone-icon">🖼️</div>
        <div class="upload-zone-text">Drag & drop images here, or click to browse</div>
        <div class="upload-zone-sub">Uploads go directly to Cloudinary · Supports drag-and-drop ordering</div>
      <div class="image-grid" id="ed-image-grid">
        ${(p.image ? [{ url: p.image }] : []).map(img => `
          <div class="image-item primary">
            <img src="${esc(img.url)}" alt="">
            <span class="image-item-badge">Primary</span>
            <button class="image-item-remove">${icon('x', 12)}</button>
          </div>`).join('')}
      </div>`,
      /* Category & Brand */
      `<div class="grid grid-2">
        <div class="field"><label>Category</label><select class="select" id="ed-category"><option value="">Select category</option>${DemoData.categories.map(c => `<option value="${esc(c._id)}" ${p.category_id === c._id ? 'selected' : ''}>${c.emoji} ${esc(c.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Brand</label><select class="select" id="ed-brand"><option value="">Select brand</option>${DemoData.brands.map(b => `<option value="${esc(b._id)}" ${p.brand_name === b.name ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Tags</label><input class="input" id="ed-tags" placeholder="e.g. pain-relief, otc"></div>`,
      /* Medical Info */
      `<div class="grid grid-2">
        <div class="field"><label>Ingredients</label><textarea class="textarea" id="ed-ingredients" rows="3" placeholder="Comma-separated active ingredients"></textarea></div>
        <div class="field"><label>Warnings</label><textarea class="textarea" id="ed-warnings" rows="3" placeholder="Comma-separated warnings"></textarea></div>
        <div class="field"><label>Medical classification</label><select class="select" id="ed-classification"><option>Prescription Only</option><option>OTC</option><option>Controlled</option></select></div>
      <div class="list-row mt-16"><div><div class="list-row-label">Requires prescription</div><div class="list-row-desc">Customer must upload an approved prescription at checkout</div><button class="switch ${p.requires_prescription ? 'on' : ''}" id="ed-rx-switch" role="switch" aria-checked="${p.requires_prescription}"></button></div>`,
      /* SEO & Visibility */
      `<div class="grid grid-2">
        <div class="field"><label>SEO title</label><input class="input" id="ed-seo-title" value="${esc(p.name || '')}"></div>
        <div class="field"><label>Slug</label><input class="input" id="ed-slug" value="${esc(p.slug || '')}"></div>
        <div class="field" style="grid-column:1/-1"><label>SEO description</label><textarea class="textarea" id="ed-seo-desc" rows="2"></textarea></div>
      <div class="mt-16">
        <div class="list-row"><div><div class="list-row-label">Published</div><div class="list-row-desc">Visible on the storefront</div><button class="switch on" id="ed-published"></button></div>
        <div class="list-row"><div><div class="list-row-label">Featured</div><div class="list-row-desc">Shown in featured products carousel</div><button class="switch ${p.featured ? 'on' : ''}" id="ed-featured"></button></div>
        <div class="list-row"><div><div class="list-row-label">Popular</div><div class="list-row-desc">Badge & boosted in popular section</div><button class="switch ${p.popular ? 'on' : ''}" id="ed-popular"></button></div>`,
    ];
    body.innerHTML = steps[editorCurrentStep];
    document.getElementById('ed-rx-switch')?.addEventListener('click', function () { this.classList.toggle('on'); });
    document.querySelectorAll('#editor-body .switch').forEach(s => s.addEventListener('click', function () { this.classList.toggle('on'); }));
  }

  /* ─── Events ─────────────────────────────────────────── */
  function bindEvents() {
    const search = document.getElementById('product-search');
    search.addEventListener('input', JD.debounce((e) => { state.query = e.target.value; applyFilters(); }, 300));

    document.getElementById('product-category-filter').addEventListener('change', (e) => { state.category = e.target.value; applyFilters(); });
    document.getElementById('product-status-filter').addEventListener('change', (e) => { state.status = e.target.value; applyFilters(); });
    document.getElementById('product-rx-filter').addEventListener('change', (e) => { state.rx = e.target.value; applyFilters(); });

    document.getElementById('select-all').addEventListener('change', (e) => {
      const { filtered, page, perPage } = state;
      const slice = filtered.slice((page - 1) * perPage, (page - 1) * perPage + perPage);
      slice.forEach(p => e.target.checked ? state.selected.add(p._id) : state.selected.delete(p._id));
      document.getElementById('bulk-bar').style.display = state.selected.size ? 'flex' : 'none';
      document.getElementById('bulk-count').textContent = state.selected.size;
      renderTable();
    });

    document.getElementById('bulk-clear-btn').addEventListener('click', () => { state.selected.clear(); document.getElementById('bulk-bar').style.display = 'none'; renderTable(); });
    document.getElementById('bulk-delete-btn').addEventListener('click', async () => {
      const ok = await confirmDialog(`Delete <b>${state.selected.size}</b> selected products?`, { variant: 'danger', confirmText: 'Delete All' });
      if (!ok) return;
      state.products = state.products.filter(p => !state.selected.has(p._id));
      state.selected.clear();
      document.getElementById('bulk-bar').style.display = 'none';
      applyFilters();
      showToast('Selected products deleted', 'success');
    });
    document.getElementById('bulk-archive-btn').addEventListener('click', () => {
      showToast(`${state.selected.size} products archived`, 'success');
      state.selected.clear(); document.getElementById('bulk-bar').style.display = 'none'; applyFilters();
    });
    document.getElementById('bulk-duplicate-btn').addEventListener('click', () => {
      showToast(`${state.selected.size} products duplicated`, 'success');
      state.selected.clear(); document.getElementById('bulk-bar').style.display = 'none';
    });
    document.getElementById('bulk-export-btn').addEventListener('click', exportCSV);

    document.getElementById('export-products-btn').addEventListener('click', exportCSV);
    document.getElementById('import-products-btn').addEventListener('click', () => {
      showToast('Import started — CSV template downloaded', 'info');
    });

    // View toggle
    document.querySelectorAll('#product-view-toggle button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#product-view-toggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.view = btn.dataset.view;
        document.getElementById('products-table-card').style.display = state.view === 'table' ? '' : 'none';
        document.getElementById('products-grid-view').style.display = state.view === 'grid' ? '' : 'none';
        if (state.view === 'grid') renderGrid();
      });
    });

    // Add product
    window.__jdAddProduct = () => openEditor();
    document.getElementById('add-product-btn').addEventListener('click', (e) => {
      e.preventDefault();
      openEditor();
    });
  }

  function renderGrid() {
    const wrap = document.getElementById('products-grid-view');
    wrap.innerHTML = state.filtered.slice(0, 24).map(p => `
      <div class="card card-hover" style="overflow:hidden">
        ${p.image ? `<img src="${esc(p.image)}" alt="" style="width:100%;height:120px;object-fit:cover;">` : `<div style="height:120px;display:grid;place-items:center;background:var(--gray-100);color:var(--text-3)">${icon('box', 30)}</div>`}
        <div style="padding:14px">
          <div class="flex items-center justify-between mb-8">
            ${JD.stockBadge(p.stock_status)}
            ${p.requires_prescription ? '<span class="badge badge-purple">Rx</span>' : ''}
          </div>
          <div class="font-bold" style="font-size:13px;line-height:1.35;">${esc(p.name)}</div>
          <div class="muted text-sm mt-4">${esc(p.category_name || '')} · ${esc(p.brand_name || '')}</div>
          <div class="flex items-center justify-between mt-12">
            <div><span class="font-bold">${fmtMoney(p.discount_price || p.price)}</span>${p.discount_price ? `<span class="muted text-sm" style="text-decoration:line-through;margin-left:6px">${fmtMoney(p.price)}</span>` : ''}</div>
            <button class="btn btn-sm btn-secondary act-edit" data-id="${esc(p._id)}">${icon('edit', 13)} Edit</button>
          </div>
      </div>`).join('');
    wrap.querySelectorAll('.act-edit').forEach(b => b.addEventListener('click', () => openEditor(b.dataset.id)));
  }

  function exportCSV() {
    const rows = [['Name', 'SKU', 'Category', 'Brand', 'Price', 'Stock', 'Status']];
    state.filtered.forEach(p => rows.push([p.name, p.sku, p.category_name, p.brand_name, p.price, p.available_stock, p.stock_status]));
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'just-drugs-products.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Products exported as CSV', 'success');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Shared layout will call __pageContentRendered; ensure a fallback
    setTimeout(() => { if (!window.__productsBooted) { window.__productsBooted = true; initProducts(); } }, 300);
  }
})();
