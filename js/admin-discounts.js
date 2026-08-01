/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Discounts & Coupons module
   Table with type chips, schedule display, and a rich editor modal.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtMoney, fmtDate, showToast, confirmDialog, openModal, closeModal } = JD;

  let discounts = [];
  const state = { query: '', type: '' };

  window.__pageContentRendered = function () { initDiscounts(); };

  async function initDiscounts() {
    try {
      const res = await AdminAPI.listDiscounts();
      const data = res.data || res;
      discounts = Array.isArray(data) ? data : DemoData.discounts;
    } catch (e) {
      console.warn('[Discounts] Demo mode:', e.message);
      discounts = DemoData.discounts;
    }
    renderTable();
    document.getElementById('add-discount-btn').addEventListener('click', () => openEditor());
    document.getElementById('discount-search').addEventListener('input', JD.debounce((e) => { state.query = e.target.value; renderTable(); }, 300));
    document.querySelectorAll('#discount-type-chips .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#discount-type-chips .filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.type = chip.dataset.type;
        renderTable();
      });
    });
  }

  function applied() {
    const q = state.query.toLowerCase();
    return discounts.filter(d => {
      if (state.type && (d.type || '').toLowerCase() !== state.type.toLowerCase()) return false;
      if (q && !((d.code || '') + ' ' + (d.name || '')).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function discountStatus(d) {
    const now = Date.now();
    if (d.active === false) return { label: 'Inactive', cls: 'badge-gray' };
    if (d.end_date && new Date(d.end_date).getTime() < now) return { label: 'Expired', cls: 'badge-danger' };
    if (d.start_date && new Date(d.start_date).getTime() > now) return { label: 'Scheduled', cls: 'badge-info' };
    return { label: 'Active', cls: 'badge-success' };
  }

  function typeLabel(t) {
    return { percentage: 'Percentage', fixed_amount: 'Fixed', flash_sale: 'Flash Sale', category: 'Category', product: 'Product' }[t] || t;
  }

  function renderTable() {
    const tbody = document.getElementById('discounts-tbody');
    const rows = applied();
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">${icon('tag', 32)}</div><div class="empty-title">No discounts yet</div><div class="empty-desc">Create your first promotion to grow sales.</div></div></td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(d => {
      const st = discountStatus(d);
      return `
      <tr>
        <td>
          <div class="cell-stack">
            <span class="table-cell-primary mono font-bold" style="color:var(--brand-600)">${esc(d.code || '—')}</span>
            <span class="table-cell-secondary">${esc(d.name || d.description || typeLabel(d.type))}</span>
          </div>
        </td>
        <td><span class="badge badge-blue">${typeLabel(d.type)}</span></td>
        <td class="num text-right font-bold">${d.type === 'percentage' ? d.value + '%' : fmtMoney(d.value || 0)}</td>
        <td>
          <div class="cell-stack">
            <span class="table-cell-primary num">${d.used_count || 0}</span>
            <span class="table-cell-secondary">${d.maximum_uses ? 'of ' + d.maximum_uses : 'unlimited'}</span>
          </div>
        </td>
        <td class="num text-right">${d.minimum_purchase ? fmtMoney(d.minimum_purchase) : '—'}</td>
        <td>
          <div class="cell-stack">
            <span class="table-cell-secondary">${d.start_date ? fmtDate(d.start_date, { short: true }) : '—'}</span>
            <span class="table-cell-secondary">→ ${d.end_date ? fmtDate(d.end_date, { short: true }) : '∞'}</span>
          </div>
        </td>
        <td><span class="badge ${st.cls}">${st.label}</span></td>
        <td>
          <div class="row-actions">
            <button class="row-action-btn act-edit" data-id="${esc(d._id || d.id)}" title="Edit">${icon('edit', 15)}</button>
            <button class="row-action-btn danger act-delete" data-id="${esc(d._id || d.id)}" title="Delete">${icon('trash', 15)}</button>
          </div>
        </td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('.act-edit').forEach(b => b.addEventListener('click', () => openEditor(b.dataset.id)));
    tbody.querySelectorAll('.act-delete').forEach(b => b.addEventListener('click', () => deleteDiscount(b.dataset.id)));
  }

  function openEditor(id) {
    const d = id ? discounts.find(x => (x._id || x.id) === id) : null;
    openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">${d ? 'Edit Discount' : 'New Discount'}</h3>
        <p class="modal-subtitle">${d ? `Editing ${esc(d.code || d.name)}` : 'Set up a new promotion'}</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body">
        <div class="grid grid-2">
          <div class="field"><label>Coupon code</label><input class="input" id="dc-code" value="${esc(d?.code || '')}" placeholder="e.g. WELCOME10"></div>
          <div class="field"><label>Name</label><input class="input" id="dc-name" value="${esc(d?.name || '')}" placeholder="e.g. Welcome 10% off"></div>
          <div class="field"><label>Type</label>
            <select class="select" id="dc-type">
              <option value="percentage" ${d?.type === 'percentage' ? 'selected' : ''}>Percentage</option>
              <option value="fixed_amount" ${d?.type === 'fixed_amount' ? 'selected' : ''}>Fixed amount</option>
              <option value="flash_sale" ${d?.type === 'flash_sale' ? 'selected' : ''}>Flash sale</option>
              <option value="category" ${d?.type === 'category' ? 'selected' : ''}>Category</option>
              <option value="product" ${d?.type === 'product' ? 'selected' : ''}>Product</option>
            </select>
          </div>
          <div class="field"><label class="field-required">Value</label><input class="input" type="number" step="0.01" id="dc-value" value="${d?.value ?? ''}" placeholder="% or ₦"></div>
          <div class="field"><label>Minimum purchase</label><input class="input" type="number" id="dc-min" value="${d?.minimum_purchase ?? ''}" placeholder="₦"></div>
          <div class="field"><label>Maximum discount</label><input class="input" type="number" id="dc-max" value="${d?.max_discount ?? ''}" placeholder="₦ (for % types)"></div>
          <div class="field"><label>Usage limit</label><input class="input" type="number" id="dc-uses" value="${d?.maximum_uses ?? ''}" placeholder="e.g. 100"></div>
          <div class="field"><label>Start date</label><input class="input" type="datetime-local" id="dc-start" value="${d?.start_date ? d.start_date.slice(0, 16) : ''}"></div>
          <div class="field"><label>End date</label><input class="input" type="datetime-local" id="dc-end" value="${d?.end_date ? d.end_date.slice(0, 16) : ''}"></div>
        </div>
        <div class="mt-16">
          <div class="list-row"><div><div class="list-row-label">Active</div><div class="list-row-desc">Customers can redeem this discount</div></div><button class="switch ${d?.active !== false ? 'on' : ''}" id="dc-active"></button></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-close>Cancel</button>
        <button class="btn btn-primary" id="dc-save-btn">${icon('check', 15)} ${d ? 'Save Changes' : 'Create Discount'}</button>
      </div>`);
    document.getElementById('dc-active').addEventListener('click', function () { this.classList.toggle('on'); });
    document.getElementById('dc-save-btn').addEventListener('click', () => {
      const value = Number(document.getElementById('dc-value').value);
      if (!value || value <= 0) { showToast('Enter a valid value', 'error'); return; }
      showToast(d ? 'Discount updated' : 'Discount created', 'success');
      closeModal(document.querySelector('.modal-backdrop.open'));
    });
  }

  async function deleteDiscount(id) {
    const d = discounts.find(x => (x._id || x.id) === id);
    const ok = await confirmDialog(`Delete discount <b>${esc(d?.name || d?.code || '')}</b>?`, { variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    discounts = discounts.filter(x => (x._id || x.id) !== id);
    renderTable();
    showToast('Discount deleted', 'success');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__discountsBooted) { window.__discountsBooted = true; initDiscounts(); } }, 300);
  }
})();

