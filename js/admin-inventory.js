/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Inventory module
   Stock summary cards, coloured statuses, restock & adjust.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtDate, showToast, confirmDialog, openModal, closeModal } = JD;

  let inventory = [];
  const state = { query: '', status: '', warehouse: '', page: 1, perPage: 10 };

  window.__pageContentRendered = function () { initInventory(); };

  async function initInventory() {
    try {
      // Try real low-stock endpoint; fall back to full inventory via demo
      const res = await AdminAPI.lowStockAlerts();
      const data = res.data || res;
      if (Array.isArray(data) && data.length) {
        inventory = data.map((item, i) => toRow(item, i));
      } else {
        throw new Error('empty');
      }
    } catch (e) {
      console.warn('[Inventory] Demo mode:', e.message);
      inventory = DemoData.inventory;
    }
    renderTable();
    bindEvents();
  }

  function toRow(item, i) {
    return {
      product_id: item.product_id, product_name: item.product_name || DemoData.products[i % DemoData.products.length]?.name || 'Product',
      sku: item.sku || DemoData.products[i % DemoData.products.length]?.sku || '—',
      current_stock: item.current_stock || 0, reserved_stock: item.reserved_stock || 0,
      available_stock: item.available_stock ?? (item.current_stock - item.reserved_stock),
      batch_number: item.batch_number || 'B-' + (10000 + i), supplier: item.supplier || '—',
      warehouse: item.warehouse || 'Main Warehouse', expiry_date: item.expiry_date,
      status: item.status,
    };
  }

  function applied() {
    const q = state.query.toLowerCase();
    return inventory.filter(row => {
      if (q && !(row.product_name + ' ' + row.sku + ' ' + row.batch_number).toLowerCase().includes(q)) return false;
      if (state.status && row.status !== state.status) return false;
      if (state.warehouse && row.warehouse !== state.warehouse) return false;
      return true;
    });
  }

  function expiryMeta(expiry) {
    if (!expiry) return { label: '—', cls: 'badge-gray' };
    const diff = (new Date(expiry).getTime() - Date.now()) / 86400000;
    if (diff < 0) return { label: 'Expired', cls: 'badge-danger' };
    if (diff < 30) return { label: fmtDate(expiry, { short: true }) + ' ⚠', cls: 'badge-rose' };
    if (diff < 90) return { label: fmtDate(expiry, { short: true }), cls: 'badge-warning' };
    return { label: fmtDate(expiry, { short: true }), cls: 'badge-gray' };
  }

  function renderTable() {
    const tbody = document.getElementById('inventory-tbody');
    const rows = applied();
    const start = (state.page - 1) * state.perPage;
    const slice = rows.slice(start, start + state.perPage);

    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><div class="empty-icon">${icon('database', 32)}</div><div class="empty-title">No inventory records</div><div class="empty-desc">Adjust your filters to see stock items.</div></div></td></tr>`;
    } else {
      tbody.innerHTML = slice.map(r => {
        const exp = expiryMeta(r.expiry_date);
        return `
        <tr>
          <td><div class="cell-stack"><span class="table-cell-primary">${esc(r.product_name)}</span><span class="table-cell-secondary">${esc(r.supplier || '')}</span></div></td>
          <td><code class="mono">${esc(r.sku)}</code></td>
          <td><code class="mono">${esc(r.batch_number || '—')}</code></td>
          <td class="muted">${esc(r.supplier || '—')}</td>
          <td><span class="badge badge-gray">${esc(r.warehouse || '—')}</span></td>
          <td class="num text-right text-2">${r.current_stock || 0}</td>
          <td class="num text-right text-2">${r.reserved_stock || 0}</td>
          <td class="num text-right font-bold">${r.available_stock ?? 0}</td>
          <td><span class="badge ${exp.cls}">${exp.label}</span></td>
          <td>${JD.stockBadge(r.status)}</td>
          <td>
            <div class="row-actions">
              <button class="row-action-btn act-restock" data-id="${esc(r.product_id)}" title="Restock">${icon('plus', 15)}</button>
              <button class="row-action-btn act-adjust" data-id="${esc(r.product_id)}" title="Adjust">${icon('edit', 15)}</button>
            </div>
          </td>
        </tr>`;
      }).join('');
    }

    document.getElementById('inv-page-info').textContent = rows.length ? `Showing ${start + 1}–${Math.min(start + state.perPage, rows.length)} of ${rows.length}` : 'No records';
    renderPagination(rows.length);

    tbody.querySelectorAll('.act-restock').forEach(b => b.addEventListener('click', () => openRestock(b.dataset.id)));
    tbody.querySelectorAll('.act-adjust').forEach(b => b.addEventListener('click', () => openAdjust(b.dataset.id)));
  }

  function renderPagination(total) {
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    const wrap = document.getElementById('inv-pagination');
    let html = `<button class="page-btn" data-p="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>${icon('chevronLeft', 14)}</button>`;
    for (let i = 1; i <= pages; i++) html += `<button class="page-btn ${i === state.page ? 'active' : ''}" data-p="${i}">${i}</button>`;
    html += `<button class="page-btn" data-p="${state.page + 1}" ${state.page >= pages ? 'disabled' : ''}>${icon('chevronRight', 14)}</button>`;
    wrap.innerHTML = html;
    wrap.querySelectorAll('.page-btn').forEach(b => b.addEventListener('click', () => { if (b.disabled) return; state.page = Number(b.dataset.p); renderTable(); }));
  }

  function openRestock(id) {
    const row = inventory.find(r => r.product_id === id);
    if (!row) return;
    openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">Restock</h3><p class="modal-subtitle">${esc(row.product_name)}</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body">
        <div class="grid grid-2">
          <div class="field"><label class="field-required">Quantity</label><input class="input" type="number" id="rs-qty" min="1" placeholder="e.g. 100"></div>
          <div class="field"><label>Batch number</label><input class="input" id="rs-batch" value="${esc(row.batch_number || '')}"></div>
          <div class="field"><label>Supplier</label><input class="input" id="rs-supplier" value="${esc(row.supplier || '')}"></div>
          <div class="field"><label>Expiry date</label><input class="input" type="date" id="rs-expiry"></div>
          <div class="field" style="grid-column:1/-1"><label>Reason / notes</label><textarea class="textarea" id="rs-reason" rows="2" placeholder="e.g. Supplier restock"></textarea></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-close>Cancel</button>
        <button class="btn btn-success" id="rs-save-btn">${icon('check', 15)} Restock</button>
      </div>`);
    document.getElementById('rs-save-btn').addEventListener('click', () => {
      const qty = Number(document.getElementById('rs-qty').value);
      if (!qty || qty <= 0) { showToast('Enter a valid quantity', 'error'); return; }
      row.current_stock += qty;
      row.available_stock = row.current_stock - row.reserved_stock;
      if (row.current_stock > 5) row.status = 'IN_STOCK';
      renderTable();
      showToast(`Restocked +${qty} units of ${row.product_name}`, 'success');
      closeModal(document.querySelector('.modal-backdrop.open'));
    });
  }

  function openAdjust(id) {
    const row = inventory.find(r => r.product_id === id);
    if (!row) return;
    openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">Adjust Stock</h3><p class="modal-subtitle">${esc(row.product_name)}</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body">
        <div class="alert alert-info mb-16">${icon('info', 18)} Current stock: <b>${row.current_stock}</b> · Reserved: <b>${row.reserved_stock}</b> · Available: <b>${row.available_stock}</b></div>
        <div class="grid grid-2">
          <div class="field"><label class="field-required">Change (+/-)</label><input class="input" type="number" id="adj-change" placeholder="e.g. +20 or -5"></div>
          <div class="field"><label>Reason</label>
            <select class="select" id="adj-reason"><option>Damaged stock</option><option>Stock count correction</option><option>Expired removal</option><option>Return</option><option>Other</option></select>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-close>Cancel</button>
        <button class="btn btn-primary" id="adj-save-btn">${icon('check', 15)} Apply Adjustment</button>
      </div>`);
    document.getElementById('adj-save-btn').addEventListener('click', () => {
      const change = Number(document.getElementById('adj-change').value);
      if (!change) { showToast('Enter a valid adjustment', 'error'); return; }
      if (row.current_stock + change < 0) { showToast('Stock cannot go below zero', 'error'); return; }
      row.current_stock += change;
      row.available_stock = row.current_stock - row.reserved_stock;
      row.status = row.available_stock <= 0 ? 'OUT_OF_STOCK' : (row.available_stock <= 10 ? 'LOW_STOCK' : 'IN_STOCK');
      renderTable();
      showToast(`Stock adjusted by ${change > 0 ? '+' + change : change}`, 'success');
      closeModal(document.querySelector('.modal-backdrop.open'));
    });
  }

  function bindEvents() {
    document.getElementById('inv-search').addEventListener('input', JD.debounce((e) => { state.query = e.target.value; state.page = 1; renderTable(); }, 300));
    document.getElementById('inv-status-filter').addEventListener('change', (e) => { state.status = e.target.value; state.page = 1; renderTable(); });
    document.getElementById('inv-warehouse-filter').addEventListener('change', (e) => { state.warehouse = e.target.value; state.page = 1; renderTable(); });
    document.getElementById('inv-export-btn').addEventListener('click', () => {
      const csv = [['Product', 'SKU', 'Batch', 'Supplier', 'Warehouse', 'Current', 'Reserved', 'Available', 'Expiry', 'Status']]
        .concat(applied().map(r => [r.product_name, r.sku, r.batch_number, r.supplier, r.warehouse, r.current_stock, r.reserved_stock, r.available_stock, r.expiry_date, r.status]))
        .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'just-drugs-inventory.csv';
      a.click();
      showToast('Inventory exported as CSV', 'success');
    });
    document.getElementById('inv-restock-btn').addEventListener('click', () => {
      const low = applied().filter(r => r.status === 'LOW_STOCK' || r.status === 'OUT_OF_STOCK');
      showToast(`Bulk restock queued for ${low.length} low-stock items`, 'success');
    });
    document.getElementById('inv-history-btn').addEventListener('click', () => {
      openModal(`
        <div class="modal-head"><div><h3 class="modal-title">Inventory History</h3><p class="modal-subtitle">Recent stock movements</p></div><button class="modal-close">${icon('x', 16)}</button></div>
        <div class="modal-body">
          <div class="timeline">
            ${[
              { t: 'RESTOCK', s: 'Paracetamol 500mg', q: '+200', time: '2 hrs ago' },
              { t: 'ADJUST', s: 'Amoxicillin 250mg', q: '-5 (damaged)', time: '5 hrs ago' },
              { t: 'RESTOCK', s: 'Vitamin C 1000mg', q: '+150', time: 'Yesterday' },
              { t: 'ADJUST', s: 'Ibuprofen 400mg', q: '-3 (expired)', time: 'Yesterday' },
              { t: 'RESTOCK', s: 'ORS Sachets (20s)', q: '+300', time: '2 days ago' },
            ].map((h, i) => `
              <div class="tl-item ${i === 0 ? 'current' : 'done'}">
                <div class="tl-dot"></div>
                <div class="tl-title">${h.t} — ${esc(h.s)} <span style="color:${h.q.startsWith('+') ? 'var(--green, #059669)' : 'var(--danger-600)'}">${h.q}</span></div>
                <div class="tl-sub">Actor: ${i === 0 ? 'John Akpan' : 'System / API'}</div>
                <div class="tl-time">${h.time}</div>
              </div>`).join('')}
          </div>
        </div>`, {});
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__invBooted) { window.__invBooted = true; initInventory(); } }, 300);
  }
})();

