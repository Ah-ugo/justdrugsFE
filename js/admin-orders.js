/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Orders module
   Shopify-style order table with filter chips, search, and a
   detail drawer containing timeline, items, payment, delivery.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtMoney, fmtDate, fmtRelative, showToast, openDrawer, closeDrawer } = JD;

  let orders = [];
  const state = { query: '', status: '', payment: '', date: '', page: 1, perPage: 10 };

  window.__pageContentRendered = function () { initOrders(); };

  async function initOrders() {
    try {
      const res = await AdminAPI.listOrders({ limit: 200 });
      const data = res.data || res;
      orders = Array.isArray(data) ? data : DemoData.orders;
    } catch (e) {
      console.warn('[Orders] Demo mode:', e.message);
      orders = DemoData.orders;
    }
    document.getElementById('orders-total-line').textContent = `${orders.length} orders total.`;
    renderTable();
    bindEvents();
  }

  function applied() {
    const q = state.query.toLowerCase();
    const now = Date.now();
    return orders.filter(o => {
      const cust = o.customer?.name || o.user_email || '';
      const orderNo = o.order_number || '';
      if (q && !(orderNo + ' ' + cust + ' ' + o.payment_method).toLowerCase().includes(q)) return false;
      if (state.status && (o.status || '').toLowerCase() !== state.status.toLowerCase()) return false;
      if (state.payment && (o.payment_status || '').toLowerCase() !== state.payment.toLowerCase()) return false;
      if (state.date === 'today') {
        const d = new Date(o.created_at).getTime();
        if (now - d > 86400000) return false;
      } else if (state.date === '7d') {
        if (now - new Date(o.created_at).getTime() > 7 * 86400000) return false;
      } else if (state.date === '30d') {
        if (now - new Date(o.created_at).getTime() > 30 * 86400000) return false;
      }
      return true;
    });
  }

  function deliveryStatus(o) {
    const s = o.status || '';
    if (s === 'delivered') return { label: 'Delivered', cls: 'badge-success' };
    if (s === 'out_for_delivery') return { label: 'Out for Delivery', cls: 'badge-info' };
    if (s === 'cancelled') return { label: 'No Delivery', cls: 'badge-gray' };
    if (s === 'pending_payment') return { label: 'Awaiting Payment', cls: 'badge-warning' };
    if (s === 'prescription_review') return { label: 'Rx Review', cls: 'badge-purple' };
    return { label: s.replace(/_/g, ' ') || '—', cls: 'badge-blue' };
  }

  function renderTable() {
    const tbody = document.getElementById('orders-tbody');
    const rows = applied();
    const start = (state.page - 1) * state.perPage;
    const slice = rows.slice(start, start + state.perPage);

    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">${icon('shoppingCart', 32)}</div><div class="empty-title">No orders found</div><div class="empty-desc">Try adjusting your search or filters.</div></div></td></tr>`;
    } else {
      tbody.innerHTML = slice.map(o => {
        const del = deliveryStatus(o);
        return `
        <tr style="cursor:pointer" data-order-row="${esc(o.order_number || o._id)}">
          <td><code class="mono font-bold" style="color:var(--brand-600)">${esc(o.order_number || o._id)}</code></td>
          <td>
            <div class="cell-stack">
              <span class="table-cell-primary">${esc(o.customer?.name || o.user?.email || o.guest_info?.name || 'Guest')}</span>
              <span class="table-cell-secondary">${esc(o.customer?.email || o.user_email || o.guest_info?.email || '')}</span>
            </div>
          </td>
          <td><span class="badge badge-gray">${o.items_count ?? (o.items || []).reduce((s, i) => s + i.quantity, 0)} items</span></td>
          <td class="num text-right font-bold">${fmtMoney(o.total_amount ?? o.total ?? 0)}</td>
          <td>${JD.paymentStatusBadge(o.payment_status)}</td>
          <td>${JD.orderStatusBadge(o.status)}</td>
          <td><span class="badge ${del.cls}">${del.label}</span></td>
          <td class="muted no-wrap">${fmtDate(o.created_at, { short: true })}</td>
          <td>
            <div class="row-actions">
              <button class="row-action-btn act-view" data-id="${esc(o.order_number || o._id)}" title="View order">${icon('eye', 15)}</button>
            </div>
          </td>
        </tr>`;
      }).join('');
    }

    document.getElementById('orders-page-info').textContent = rows.length ? `Showing ${start + 1}–${Math.min(start + state.perPage, rows.length)} of ${rows.length}` : 'No orders';
    renderPagination(rows.length);

    tbody.querySelectorAll('tr[data-order-row]').forEach(tr => tr.addEventListener('click', (e) => {
      if (e.target.closest('.act-view')) openOrderDetail(tr.dataset.orderRow);
      else openOrderDetail(tr.dataset.orderRow);
    }));
    tbody.querySelectorAll('.act-view').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      openOrderDetail(b.dataset.id);
    }));
  }

  function renderPagination(total) {
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    const wrap = document.getElementById('orders-pagination');
    let html = `<button class="page-btn" data-p="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>${icon('chevronLeft', 14)}</button>`;
    for (let i = 1; i <= pages; i++) {
      if (pages > 7 && i !== 1 && i !== pages && Math.abs(i - state.page) > 2) {
        if (Math.abs(i - state.page) === 3) html += '<span class="muted" style="padding:0 4px">…</span>';
        continue;
      }
      html += `<button class="page-btn ${i === state.page ? 'active' : ''}" data-p="${i}">${i}</button>`;
    }
    html += `<button class="page-btn" data-p="${state.page + 1}" ${state.page >= pages ? 'disabled' : ''}>${icon('chevronRight', 14)}</button>`;
    wrap.innerHTML = html;
    wrap.querySelectorAll('.page-btn').forEach(b => b.addEventListener('click', () => { if (b.disabled) return; state.page = Number(b.dataset.p); renderTable(); }));
  }

  /* ─── Order detail drawer ────────────────────────────── */
  function buildTimeline(o) {
    const steps = [
      { s: 'Placed', time: o.created_at, done: true },
      { s: 'Payment', time: o.payment_status === 'paid' ? o.created_at : null, done: o.payment_status === 'paid' },
      { s: 'Prescription review', done: ['prescription_review', 'preparing', 'packed', 'out_for_delivery', 'delivered'].includes(o.status), time: o.updated_at },
      { s: 'Preparing', done: ['preparing', 'packed', 'out_for_delivery', 'delivered'].includes(o.status), time: o.updated_at },
      { s: 'Packed', done: ['packed', 'out_for_delivery', 'delivered'].includes(o.status), time: o.updated_at },
      { s: 'Out for delivery', done: ['out_for_delivery', 'delivered'].includes(o.status), time: o.updated_at },
      { s: 'Delivered', done: o.status === 'delivered', time: o.delivered_at },
    ];
    return `<div class="timeline">${steps.map((st, i) => `
      <div class="tl-item ${st.done ? 'done' : i === 0 ? 'current' : ''}">
        <div class="tl-dot"></div>
        <div class="tl-title">${st.s}</div>
        <div class="tl-sub">${st.time ? fmtRelative(st.time) : st.done ? 'Completed' : 'Pending'}</div>
        <div class="tl-time"></div>
      </div>`).join('')}</div>`;
  }

  function openOrderDetail(id) {
    const o = orders.find(x => (x.order_number || x._id) === id) || orders[0];
    if (!o) return;
    const items = o.items || [];
    const { drawer } = openDrawer(`
      <div class="drawer-head">
        <div><div class="drawer-title">${esc(o.order_number || o._id)}</div>
        <div style="font-size:12.5px;color:var(--text-3);margin-top:2px;">${fmtDate(o.created_at, { time: true })}</div></div>
        <button class="modal-close drawer-close">${icon('x', 16)}</button>
      </div>
      <div class="drawer-body">
        <div class="flex items-center justify-between mb-16 wrap gap-12">
          <div class="flex items-center gap-8">${JD.orderStatusBadge(o.status)} ${JD.paymentStatusBadge(o.payment_status)}</div>
          <div class="row-actions">
            <button class="btn btn-xs btn-secondary" id="od-invoice-btn">${icon('printer', 13)} Invoice</button>
            <button class="btn btn-xs btn-secondary" id="od-download-btn">${icon('download', 13)}</button>
          </div>
        </div>

        <div class="alert alert-info mb-16" style="align-items:center">${icon('truck', 18)} <span>Delivery: <b>${esc(o.delivery_zone || 'Default Zone')}</b>${o.rider ? ` · Rider: <b>${esc(o.rider)}</b>` : ''}</span>
          <button class="btn btn-xs btn-primary" id="od-assign-rider">${o.rider ? 'Change Rider' : 'Assign Rider'}</button>
        </div>

        <h4 style="font-size:13px;font-weight:800;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)">Order Timeline</h4>
        ${buildTimeline(o)}

        <hr class="divider">
        <h4 style="font-size:13px;font-weight:800;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)">Customer</h4>
        <div class="flex items-center gap-12">
          <div class="avatar">${esc((o.customer?.name || o.guest_info?.name || 'G')[0])}</div>
          <div>
            <div class="font-bold">${esc(o.customer?.name || o.guest_info?.name || 'Guest Customer')}</div>
            <div class="text-sm text-2">${esc(o.customer?.email || o.guest_info?.email || '—')}</div>
            <div class="text-sm text-2">${esc(o.customer?.phone || o.guest_info?.phone || '—')}</div>
          </div>
        </div>

        <hr class="divider">
        <h4 style="font-size:13px;font-weight:800;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)">Items (${items.length})</h4>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${items.map(it => `
            <div class="flex items-center justify-between" style="padding:10px 12px;background:var(--surface-2);border-radius:12px;">
              <div class="flex items-center gap-10">
                <div class="avatar sm amber">${esc((it.name || 'P')[0])}</div>
                <div>
                  <div class="font-semibold text-sm">${esc(it.name)}</div>
                  <div class="text-xs text-3">Qty ${it.quantity} × ${fmtMoney(it.price || it.unit_price)}</div>
                </div>
              </div>
              <div class="font-bold num text-sm">${fmtMoney((it.price || it.unit_price || 0) * (it.quantity || 1))}</div>
            </div>`).join('')}
        </div>

        <hr class="divider">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="flex justify-between text-sm"><span class="text-2">Subtotal</span><span class="num">${fmtMoney(o.subtotal || 0)}</span></div>
          <div class="flex justify-between text-sm"><span class="text-2">Discount</span><span class="num text-success">-${fmtMoney(o.discount_amount || 0)}</span></div>
          <div class="flex justify-between text-sm"><span class="text-2">Tax (7.5%)</span><span class="num">${fmtMoney(o.tax_amount || 0)}</span></div>
          <div class="flex justify-between text-sm"><span class="text-2">Delivery</span><span class="num">${fmtMoney(o.delivery_fee || 0)}</span></div>
          <div class="flex justify-between" style="padding-top:10px;border-top:1px solid var(--border-soft)"><span class="font-bold">Total</span><span class="font-bold text-lg num">${fmtMoney(o.total_amount || 0)}</span></div>
        </div>

        <h4 style="font-size:13px;font-weight:800;margin:18px 0 10px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)">Delivery Address</h4>
        <div class="text-sm text-2" style="line-height:1.7">${o.delivery_address?.street || ''}<br>${o.delivery_address?.city || o.delivery_zone || ''}${o.delivery_address?.state ? ', ' + o.delivery_address.state : ''}<br>${esc(o.customer?.phone || '')}</div>

        <h4 style="font-size:13px;font-weight:800;margin:18px 0 10px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)">Notes</h4>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-sm btn-secondary" id="od-note-cb">${icon('phone', 14)} Call customer</button>
          <button class="btn btn-sm btn-secondary" id="od-note-msg">${icon('mail', 14)} Email customer</button>
        </div>
      </div>
      <div class="drawer-foot">
        <button class="btn btn-outline-danger" id="od-cancel-btn">${icon('x', 15)} Cancel Order</button>
        <button class="btn btn-primary" id="od-status-btn">${icon('chevronRight', 15)} Next Status</button>
      </div>`, { size: 'lg' });

    drawer.querySelector('#od-invoice-btn').addEventListener('click', () => showToast('Invoice PDF downloaded', 'success'));
    drawer.querySelector('#od-download-btn').addEventListener('click', () => showToast('Order details downloaded', 'success'));
    drawer.querySelector('#od-assign-rider').addEventListener('click', () => showToast('Rider assignment coming next', 'info'));
    drawer.querySelector('#od-cancel-btn').addEventListener('click', async () => {
      const ok = await JD.confirmDialog(`Cancel order <b>${esc(o.order_number)}</b>?`, { variant: 'danger', confirmText: 'Cancel Order' });
      if (ok) { o.status = 'cancelled'; renderTable(); showToast('Order cancelled', 'success'); closeDrawer(drawer); }
    });
    drawer.querySelector('#od-status-btn').addEventListener('click', () => {
      const next = { pending_payment: 'prescription_review', prescription_review: 'preparing', preparing: 'packed', packed: 'out_for_delivery', out_for_delivery: 'delivered' }[o.status];
      if (next) { o.status = next; renderTable(); showToast(`Order status → ${next.replace(/_/g, ' ')}`, 'success'); }
      else showToast('Order is already completed', 'info');
    });
  }

  function bindEvents() {
    document.getElementById('order-search').addEventListener('input', JD.debounce((e) => { state.query = e.target.value; state.page = 1; renderTable(); }, 300));
    document.getElementById('order-payment-filter').addEventListener('change', (e) => { state.payment = e.target.value; state.page = 1; renderTable(); });
    document.getElementById('order-date-filter').addEventListener('change', (e) => { state.date = e.target.value; state.page = 1; renderTable(); });

    document.querySelectorAll('#orders-status-chips .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#orders-status-chips .filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.status = chip.dataset.status;
        state.page = 1;
        renderTable();
      });
    });

    document.getElementById('orders-export-btn').addEventListener('click', () => {
      const csv = [['Order#', 'Customer', 'Amount', 'Status', 'Payment', 'Date']]
        .concat(applied().map(o => [o.order_number, o.customer?.name || '', o.total_amount, o.status, o.payment_status, fmtDate(o.created_at)]))
        .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'just-drugs-orders.csv';
      a.click();
      showToast('Orders exported as CSV', 'success');
    });
    document.getElementById('orders-refresh-btn').addEventListener('click', () => { renderTable(); showToast('Orders refreshed', 'success'); });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__ordersBooted) { window.__ordersBooted = true; initOrders(); } }, 300);
  }
})();

