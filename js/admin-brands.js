/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Brands module
   Table of pharmaceutical brands with edit/create/delete.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, showToast, confirmDialog, openModal, closeModal } = JD;

  let brands = [];

  window.__pageContentRendered = function () { initBrands(); };

  async function initBrands() {
    try {
      const res = await AdminAPI.listBrands();
      const data = res.data || res;
      brands = Array.isArray(data) ? data : DemoData.brands;
    } catch (e) {
      console.warn('[Brands] Demo mode:', e.message);
      brands = DemoData.brands;
    }
    renderBrands();
    document.getElementById('add-brand-btn')?.addEventListener('click', () => openEditor());
  }

  function renderBrands() {
    const tbody = document.getElementById('brands-tbody');
    if (!brands.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">${icon('tag', 32)}</div><div class="empty-title">No brands yet</div><div class="empty-desc">Add your first pharmaceutical brand.</div></div></td></tr>`;
      return;
    }
    tbody.innerHTML = brands.map(b => `
      <tr>
        <td>
          <div class="product-cell">
            <div class="avatar amber">${esc(b.name[0])}</div>
            <div class="cell-stack">
              <span class="table-cell-primary">${esc(b.name)}</span>
              <span class="table-cell-secondary">${esc(b.slug)}</span>
            </div>
          </div>
        </td>
        <td class="muted">${esc(b.description || '—')}</td>
        <td><span class="badge badge-info">${b.product_count || 0} products</span></td>
        <td>${b.featured ? '<span class="badge badge-success">★ Featured</span>' : '<span class="text-3">—</span>'}</td>
        <td>${b.active !== false ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-gray">Inactive</span>'}</td>
        <td>
          <div class="row-actions">
            <button class="row-action-btn act-edit" data-id="${esc(b._id || b.id)}" title="Edit">${icon('edit', 15)}</button>
            <button class="row-action-btn danger act-delete" data-id="${esc(b._id || b.id)}" title="Delete">${icon('trash', 15)}</button>
          </div>
        </td>
      </tr>`).join('');
    tbody.querySelectorAll('.act-edit').forEach(btn => btn.addEventListener('click', () => openEditor(btn.dataset.id)));
    tbody.querySelectorAll('.act-delete').forEach(btn => btn.addEventListener('click', () => deleteBrand(btn.dataset.id)));
  }

  function openEditor(id) {
    const b = id ? brands.find(x => (x._id || x.id) === id) : null;
    openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">${b ? 'Edit Brand' : 'Add Brand'}</h3>
        <p class="modal-subtitle">${b ? `Editing ${esc(b.name)}` : 'Create a new brand'}</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body">
        <div class="grid grid-2">
          <div class="field"><label class="field-required">Name</label><input class="input" id="br-name" value="${esc(b?.name || '')}" placeholder="e.g. Emzor"></div>
          <div class="field"><label>Slug</label><input class="input" id="br-slug" value="${esc(b?.slug || '')}" placeholder="auto-generated"></div>
          <div class="field" style="grid-column:1/-1"><label>Description</label><textarea class="textarea" id="br-desc" rows="2" placeholder="About this brand…">${esc(b?.description || '')}</textarea></div>
          <div class="field"><label>Logo URL</label><input class="input" id="br-logo" value="${esc(b?.logo || '')}" placeholder="https://…"></div>
        </div>
        <div class="mt-16">
          <div class="list-row"><div><div class="list-row-label">Featured</div><div class="list-row-desc">Highlighted brand on the storefront</div></div><button class="switch ${b?.featured ? 'on' : ''}" id="br-featured"></button></div>
          <div class="list-row"><div><div class="list-row-label">Active</div><div class="list-row-desc">Brand is visible</div></div><button class="switch ${b?.active !== false ? 'on' : ''}" id="br-active"></button></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-close>Cancel</button>
        <button class="btn btn-primary" id="br-save-btn">${icon('check', 15)} Save Brand</button>
      </div>`);
    document.querySelectorAll('#br-featured, #br-active').forEach(s => s.addEventListener('click', function () { this.classList.toggle('on'); }));
    document.getElementById('br-save-btn').addEventListener('click', () => {
      const name = document.getElementById('br-name').value.trim();
      if (!name) { showToast('Brand name is required', 'error'); return; }
      showToast(b ? 'Brand updated' : 'Brand created', 'success');
      const backdrop = document.querySelector('.modal-backdrop.open');
      if (backdrop) closeModal(backdrop);
    });
  }

  async function deleteBrand(id) {
    const b = brands.find(x => (x._id || x.id) === id);
    const ok = await confirmDialog(`Delete brand <b>${esc(b?.name)}</b>?`, { variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    brands = brands.filter(x => (x._id || x.id) !== id);
    renderBrands();
    showToast('Brand deleted', 'success');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__brandsBooted) { window.__brandsBooted = true; initBrands(); } }, 300);
  }
})();

