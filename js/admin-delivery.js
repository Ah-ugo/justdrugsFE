/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Delivery module
   Dispatch board with rider assignment drawer, tracking
   timeline, riders grid, and delivery zones.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtMoney, fmtDate, fmtRelative, showToast, openDrawer, closeDrawer, openModal, closeModal, confirmDialog } = JD;

  let deliveries = [];
  let orders = [];
  const state = { query: '', zone: '', status: '' };

  window.__pageContentRendered = function () { initDelivery(); };

  async function initDelivery() {
    deliveries = DemoData.delivery.map((d, i) => ({ ...d, status: d.status || 'assigned' }));
    try {
      const res = await AdminAPI.listOrders({ limit: 200 });
      const data = res.data || res;
      orders = Array.isArray(data) ? data : DemoData.orders;
    } catch (e) {
      orders = DemoData.orders;
    }
    renderTable();
    renderRiders();
    renderZones();
    bindTabs();
    document.getElementById('dl-search').addEventListener('input', JD.debounce((e) => { state.query = e.target.value; renderTable(); }, 300));
    document.getElementById('dl-zone-filter').addEventListener('change', (e) => { state.zone = e.target.value; renderTable(); });
    document.getElementById('dl-status-filter').addEventListener('change', (e) => { state.status = e.target.value; renderTable(); });
    document.getElementById('dl-zones-btn').addEventListener('click', () => { activateTab(2); });
    document.getElementById('dl-team-btn').addEventListener('click', () => { activateTab(1); });
  }

  function bindTabs() {
    document.querySelectorAll('#delivery-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => activateTab(Array.prototype.indexOf.call(tab.parentElement.children, tab)));
    });
  }
  function activateTab(idx) {
    const tabs = document.querySelectorAll('#delivery-tabs .tab');
    tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
    const panels = document.querySelectorAll('#delivery-tabs + .tab-panels .tab-panel');
    panels.forEach((p, i) => p.classList.toggle('active', i === idx));
  }

  function deliveryStatusBadge(s) {
    return JD.deliveryStatusBadge(s);
  }

  function applied() {
    const q = state.query.toLowerCase();
    return deliveries.filter(d => {
      if (q && !((d.order_number || '') + ' ' + (d.rider_name || '') + ' ' + (d.customer || '') + ' ' + (d.zone || '')).toLowerCase().includes(q)) return false;
      if (state.zone && d.zone !== state.zone) return false;
      if (state.status && d.status !== state.status) return false;
      return true;
    });
  }

  function renderTable() {
    const tbody = document.getElementById('delivery-tbody');
    const rows = applied();
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">${icon('truck', 32)}</div><div class="empty-title">No deliveries</div><div class="empty-desc">All orders assigned or none match the filters.</div></div></td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(d => `
      <tr>
        <td><code class="mono font-bold" style="color:var(--brand-600)">${esc(d.order_number)}</code></td>
        <td>
          <div class="cell-stack">
            <span class="table-cell-primary">${esc(d.customer || '—')}</span>
            <span class="table-cell-secondary">${esc(d.phone || '')}</span>
          </div>
        </td>
        <td><span class="badge badge-gray">${esc(d.zone || '—')}</span></td>
        <td>
          ${d.rider_name
            ? `<div class="product-cell"><div class="avatar sm amber">${esc(d.rider_name[0])}</div><div class="cell-stack"><span class="table-cell-primary">${esc(d.rider_name)}</span><span class="table-cell-secondary">${esc(d.rider_phone || '')}</span></div></div>`
            : '<span class="badge badge-danger">Unassigned</span>'}
        </td>
        <td>${deliveryStatusBadge(d.status)}</td>
        <td class="no-wrap text-sm text-2">${esc(d.eta || 'Within 24h')}</td>
        <td><code class="mono text-xs text-2">${esc(d.tracking_code || '—')}</code></td>
        <td>
          <div class="row-actions">
            <button class="row-action-btn act-manage" data-id="${esc(d.order_number)}" title="Manage">${icon('sliders', 14)}</button>
          </div>
        </td>
      </tr>`).join('');
    tbody.querySelectorAll('.act-manage').forEach(b => b.addEventListener('click', () => openManage(b.dataset.id)));
  }

  const riders = [
    { name: 'Emeka Okafor', phone: '0803 123 4567', zone: 'Lagos Mainland', active_jobs: 3, completed: 214, rating: 4.9, online: true },
    { name: 'Aisha Bello', phone: '0812 987 6543', zone: 'Lekki', active_jobs: 2, completed: 187, rating: 4.8, online: true },
    { name: 'Segun Adeyemi', phone: '0905 223 3344', zone: 'Ikeja', active_jobs: 1, completed: 156, rating: 4.7, online: true },
    { name: 'Fatima Yusuf', phone: '0706 556 7788', zone: 'Victoria Island', active_jobs: 0, completed: 203, rating: 4.9, online: false },
  ];

  function renderRiders() {
    const grid = document.getElementById('riders-grid');
    grid.innerHTML = riders.map(r => `
      <div class="card card-hover" style="padding:18px">
        <div class="flex items-center justify-between mb-12">
          <div class="avatar amber">${esc(r.name[0])}</div>
          <span class="badge ${r.online ? 'badge-success' : 'badge-gray'}">${r.online ? 'Online' : 'Offline'}</span>
        </div>
        <div class="font-bold">${esc(r.name)}</div>
        <div class="text-sm text-2">${esc(r.phone)}</div>
        <div class="text-xs text-3 mt-2">Zone: ${esc(r.zone)}</div>
        <div class="grid grid-3 mt-14" style="text-align:center;gap:8px">
          <div class="card" style="padding:10px"><div class="font-bold">${r.active_jobs}</div><div class="text-xs text-3">Active</div></div>
          <div class="card" style="padding:10px"><div class="font-bold">${r.completed}</div><div class="text-xs text-3">Done</div></div>
          <div class="card" style="padding:10px"><div class="font-bold" style="color:var(--warning-600)">${r.rating}★</div><div class="text-xs text-3">Rating</div></div>
        </div>
      </div>`).join('');
  }

  const zones = [
    { name: 'Lagos Mainland', fee: 1200, eta: '1–2 hrs', orders: 5, active: true },
    { name: 'Lagos Island', fee: 1500, eta: '1–3 hrs', orders: 3, active: true },
    { name: 'Lekki', fee: 2000, eta: '2–4 hrs', orders: 6, active: true },
    { name: 'Ikeja', fee: 1500, eta: '1–2 hrs', orders: 2, active: true },
    { name: 'Victoria Island', fee: 1800, eta: '1–3 hrs', orders: 4, active: true },
    { name: 'Out-of-state', fee: 4500, eta: '24–48 hrs', orders: 0, active: false },
  ];

  function renderZones() {
    const grid = document.getElementById('zones-grid');
    grid.innerHTML = zones.map(z => `
      <div class="card" style="padding:18px">
        <div class="flex items-center justify-between mb-12">
          <div style="width:38px;height:38px;border-radius:12px;background:var(--brand-50);display:flex;align-items:center;justify-content:center;color:var(--brand-600)">${icon('mapPin', 18)}</div>
          <span class="badge ${z.active ? 'badge-success' : 'badge-gray'}">${z.active ? 'Active' : 'Paused'}</span>
        </div>
        <div class="font-bold">${esc(z.name)}</div>
        <div class="text-sm text-2 mt-2">Delivery fee: <b>${fmtMoney(z.fee)}</b></div>
        <div class="text-sm text-2">ETA: <b>${esc(z.eta)}</b></div>
        <div class="text-xs text-3 mt-2">${z.orders} active deliveries</div>
      </div>`).join('');
  }

  function openManage(orderNumber) {
    const d = deliveries.find(x => x.order_number === orderNumber);
    if (!d) return;
    const matchedOrder = orders.find(o => o.order_number === orderNumber);
    const trackTimeline = [
      { s: 'Preparing', name: 'Pharmacy', time: '2 hrs ago', done: true },
      { s: 'Packed', name: 'Pharmacy', time: '1 hr ago', done: true },
      { s: 'Assigned', name: d.rider_name || '—', time: d.assigned_at || '45 min ago', done: d.status === 'assigned' || d.status === 'out_for_delivery' || d.status === 'delivered' },
      { s: 'Out for delivery', name: d.rider_name || '—', time: d.status === 'out_for_delivery' || d.status === 'delivered' ? '30 min ago' : null, done: d.status === 'out_for_delivery' || d.status === 'delivered' },
      { s: 'Delivered', name: 'Customer', time: d.status === 'delivered' ? 'Completed' : null, done: d.status === 'delivered' },
    ];
    const { drawer } = openDrawer(`
      <div class="drawer-head">
        <div><div class="drawer-title">${esc(d.order_number)}</div>
        <div style="font-size:12.5px;color:var(--text-3);margin-top:2px;">Delivery Management</div></div>
        <button class="modal-close drawer-close">${icon('x', 16)}</button>
      </div>
      <div class="drawer-body">
        <div class="alert alert-info mb-16" style="align-items:center">${icon('truck', 18)} <span>Tracking: <code class="mono">${esc(d.tracking_code)}</code></span></div>

        <h4 style="font-size:13px;font-weight:800;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)">Tracking Timeline</h4>
        <div class="timeline">
          ${trackTimeline.map((s, i) => `
            <div class="tl-item ${s.done ? 'done' : i === 0 ? 'current' : ''}">
              <div class="tl-dot"></div>
              <div class="tl-title">${s.s}</div>
              <div class="tl-sub">${s.name}${s.time ? ` · ${s.time}` : ''}</div>
              <div class="tl-time"></div>
            </div>`).join('')}
        </div>

        <hr class="divider">
        <h4 style="font-size:13px;font-weight:800;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)">Order Summary</h4>
        <div class="list-row"><div><div class="list-row-label">Customer</div><div class="list-row-desc">${esc(d.customer || d.phone || '—')}</div></div></div>
        <div class="list-row"><div><div class="list-row-label">Delivery zone</div><div class="list-row-desc">${esc(d.zone || '—')}</div></div></div>
        <div class="list-row"><div><div class="list-row-label">Amount</div><div class="list-row-desc">${fmtMoney(matchedOrder?.total_amount || 0)}</div></div></div>
        <div class="list-row"><div><div class="list-row-label">Payment</div><div class="list-row-desc">${matchedOrder ? JD.paymentStatusBadge(matchedOrder.payment_status) : '—'}</div></div></div>

        <hr class="divider">
        <h4 style="font-size:13px;font-weight:800;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)">Assign / Change Rider</h4>
        <div class="grid grid-2">
          <div class="field" style="grid-column:1/-1"><label>Rider</label>
            <select class="select" id="dl-rider-select">
              ${riders.map(r => `<option ${d.rider_name === r.name ? 'selected' : ''}>${r.name} — ${r.zone}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Estimated delivery</label><input class="input" id="dl-eta" value="${esc(d.eta || '')}"></div>
          <div class="field"><label>Status</label>
            <select class="select" id="dl-status-select">
              <option value="assigned" ${d.status === 'assigned' ? 'selected' : ''}>Assigned</option>
              <option value="out_for_delivery" ${d.status === 'out_for_delivery' ? 'selected' : ''}>Out for delivery</option>
              <option value="delivered" ${d.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="returned" ${d.status === 'returned' ? 'selected' : ''}>Returned</option>
            </select>
          </div>
        </div>
      </div>
      <div class="drawer-foot">
        <button class="btn btn-outline-danger" id="dl-cancel-btn">${icon('x', 15)} Cancel Delivery</button>
        <button class="btn btn-primary" id="dl-save-btn">${icon('check', 15)} Save Changes</button>
      </div>`, { size: 'lg' });

    drawer.querySelector('.drawer-close').addEventListener('click', () => closeDrawer(drawer));
    drawer.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeDrawer(drawer)));
    drawer.querySelector('#dl-save-btn').addEventListener('click', () => {
      d.rider_name = drawer.querySelector('#dl-rider-select').value.split(' — ')[0];
      d.status = drawer.querySelector('#dl-status-select').value;
      d.eta = drawer.querySelector('#dl-eta').value || d.eta;
      closeDrawer(drawer);
      renderTable();
      renderRiders();
      showToast('Delivery updated — rider assigned', 'success');
    });
    drawer.querySelector('#dl-cancel-btn').addEventListener('click', async () => {
      const ok = await confirmDialog(`Cancel delivery for <b>${esc(d.order_number)}</b>?`, { variant: 'danger', confirmText: 'Cancel Delivery' });
      if (!ok) return;
      d.status = 'returned';
      closeDrawer(drawer);
      renderTable();
      showToast('Delivery cancelled', 'danger');
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__deliveryBooted) { window.__deliveryBooted = true; initDelivery(); } }, 300);
  }
})();

