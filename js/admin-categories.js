/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Categories module
   Card grid with emoji, featured flag, product count, ordering.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, showToast, confirmDialog, openModal, closeModal } = JD;

  let categories = [];

  window.__pageContentRendered = function () { initCategories(); };

  async function initCategories() {
    try {
      const res = await AdminAPI.listCategories();
      const data = res.data || res;
      categories = Array.isArray(data) ? data : DemoData.categories;
    } catch (e) {
      console.warn('[Categories] Demo mode:', e.message);
      categories = DemoData.categories;
    }
    renderCategories();
    document.getElementById('add-category-btn')?.addEventListener('click', () => openEditor());
    document.getElementById('cat-reorder-toggle')?.addEventListener('click', () => {
      showToast('Drag cards to reorder (demo)', 'info');
    });
  }

  function renderCategories() {
    const grid = document.getElementById('categories-grid');
    grid.innerHTML = categories.map((c, i) => `
      <div class="card card-hover" style="display:flex;flex-direction:column;overflow:hidden" data-id="${esc(c._id || c.id)}">
        <div style="padding:18px;flex:1;">
          <div class="flex items-center justify-between mb-12">
            <div style="font-size:34px;line-height:1;">${c.emoji || '🗂️'}</div>
            <div class="row-actions">
              <button class="row-action-btn act-edit" data-id="${esc(c._id || c.id)}" title="Edit">${icon('edit', 15)}</button>
              <button class="row-action-btn danger act-delete" data-id="${esc(c._id || c.id)}" title="Delete">${icon('trash', 15)}</button>
            </div>
          </div>
          <div class="font-bold" style="font-size:14px;">${esc(c.name)}</div>
          <div class="muted text-sm mt-4" style="min-height:34px;">${esc(c.description || 'No description')}</div>
          <div class="flex items-center gap-8 mt-12 wrap">
            ${c.featured ? '<span class="badge badge-success">★ Featured</span>' : ''}
            ${c.active !== false ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-gray">Inactive</span>'}
          </div>
        </div>
        <div style="padding:12px 18px;border-top:1px solid var(--border-soft);display:flex;align-items:center;justify-content:space-between;background:var(--surface-2);">
          <span class="text-sm text-2 font-semibold">${c.product_count || 0} products</span>
          <span class="badge badge-gray">Order ${c.sort_order || i + 1}</span>
        </div>
      </div>`).join('');

    grid.querySelectorAll('.act-edit').forEach(b => b.addEventListener('click', () => openEditor(b.dataset.id)));
    grid.querySelectorAll('.act-delete').forEach(b => b.addEventListener('click', () => deleteCategory(b.dataset.id)));
  }

  function openEditor(id) {
    const c = id ? categories.find(x => (x._id || x.id) === id) : null;
    openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">${c ? 'Edit Category' : 'Add Category'}</h3>
        <p class="modal-subtitle">${c ? `Editing ${esc(c.name)}` : 'Create a new product department'}</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body">
        <div class="grid grid-2">
          <div class="field"><label class="field-required">Name</label><input class="input" id="cat-name" value="${esc(c?.name || '')}" placeholder="e.g. Pain Relief"></div>
          <div class="field"><label>Emoji</label><input class="input" id="cat-emoji" value="${esc(c?.emoji || '')}" placeholder="💊"></div>
          <div class="field" style="grid-column:1/-1"><label>Description</label><textarea class="textarea" id="cat-desc" rows="2" placeholder="Short description…">${esc(c?.description || '')}</textarea></div>
          <div class="field"><label>Slug</label><input class="input" id="cat-slug" value="${esc(c?.slug || '')}" placeholder="auto-generated"></div>
          <div class="field"><label>Sort order</label><input class="input" type="number" id="cat-sort" value="${c?.sort_order || categories.length + 1}"></div>
        </div>
        <div class="mt-16">
          <div class="list-row"><div><div class="list-row-label">Featured</div><div class="list-row-desc">Highlighted on the homepage</div></div><button class="switch ${c?.featured ? 'on' : ''}" id="cat-featured"></button></div>
          <div class="list-row"><div><div class="list-row-label">Active</div><div class="list-row-desc">Visible to customers</div></div><button class="switch ${c?.active !== false ? 'on' : ''}" id="cat-active"></button></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-close>Cancel</button>
        <button class="btn btn-primary" id="cat-save-btn">${icon('check', 15)} Save Category</button>
      </div>`);
    document.querySelectorAll('#cat-featured, #cat-active').forEach(s => s.addEventListener('click', function () { this.classList.toggle('on'); }));
    document.getElementById('cat-save-btn').addEventListener('click', () => {
      const name = document.getElementById('cat-name').value.trim();
      if (!name) { showToast('Category name is required', 'error'); return; }
      showToast(c ? 'Category updated' : 'Category created', 'success');
      const backdrop = document.querySelector('.modal-backdrop.open');
      if (backdrop) closeModal(backdrop);
    });
  }

  async function deleteCategory(id) {
    const c = categories.find(x => (x._id || x.id) === id);
    const ok = await confirmDialog(`Delete category <b>${esc(c?.name)}</b>? Products will not be deleted but will become uncategorised.`, { variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    categories = categories.filter(x => (x._id || x.id) !== id);
    renderCategories();
    showToast('Category deleted', 'success');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__catsBooted) { window.__catsBooted = true; initCategories(); } }, 300);
  }
})();

