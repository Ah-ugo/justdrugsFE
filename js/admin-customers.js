/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Customers module
   Customer table with profile drawer (orders, prescriptions,
   wishlist, activity, address).
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtMoney, fmtDate, fmtRelative, showToast, openDrawer, closeDrawer } = JD;

  let customers = [];
  const state = { query: '', status: '', sort: 'spend' };

  window.__pageContentRendered = function () { initCustomers(); };

  async function initCustomers() {
    try {
      const res = await AdminAPI.listCustomers();
      const data = res.data || res;
      customers = Array.isArray(data) ? data : DemoData.customers;
    } catch (e) {
      console.warn('[Customers] Demo mode:', e.message);
      customers = DemoData.customers;
    }
    renderTable();
    document.getElementById('cust-search').addEventListener('input', JD.debounce((e) => { state.query = e.target.value; renderTable(); }, 300));
    document.getElementById('cust-status-filter').addEventListener('change', (e) => { state.status = e.target.value; renderTable(); });
    document.getElementById('cust-sort').addEventListener('change', (e) => { state.sort = e.target.value; renderTable(); });
    document.getElementById('cust-export-btn').addEventListener('click', () => {
      const csv = [['Name', 'Email', 'Phone', 'Orders', 'Spend', 'Joined']]
        .concat(applied().map(c => [c.name, c.email, c.phone, c.orders_count, c.total_spent, fmtDate(c.created_at)]))
        .map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'just-drugs-customers.csv';
      a.click();
      showToast('Customers exported', 'success');
    });
  }

  function applied() {
    const q = state.query.toLowerCase();
    let rows = customers.filter(c => {
      if (q && !(c.name + ' ' + c.email + ' ' + (c.phone || '')).toLowerCase().includes(q)) return false;
      if (state.status === 'active' && c.status !== 'active') return false;
      if (state.status === 'inactive' && c.status !== 'inactive') return false;
      if (state.status === 'vip' && !c.is_vip) return false;
      return true;
    });
    if (state.sort === 'spend') rows.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
    if (state.sort === 'orders') rows.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0));
    if (state.sort === 'recent') rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return rows;
  }

  function renderTable() {
    const tbody = document.getElementById('customers-tbody');
    const rows = applied();
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">${icon('users', 32)}</div><div class="empty-title">No customers found</div><div class="empty-desc">Try adjusting your search.</div></div></td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(c => `
      <tr style="cursor:pointer" data-cust="${esc(c._id || c.id || c.email)}">
        <td>
          <div class="product-cell">
            <div class="avatar ${c.is_vip ? 'emerald' : ''}" style="${c.avatar ? `background-image:url('${esc(c.avatar)}');background-size:cover` : ''}">${esc((c.name || 'U')[0])}</div>
            <div class="cell-stack">
              <span class="table-cell-primary">${esc(c.name)}${c.is_vip ? ' <span class="badge badge-brand" style="font-size:10px">VIP</span>' : ''}</span>
              <span class="table-cell-secondary">${esc(c.address?.city || '')}</span>
            </div>
          </div>
        </td>
        <td>
          <div class="cell-stack">
            <span class="table-cell-secondary">${esc(c.email)}</span>
            <span class="table-cell-secondary">${esc(c.phone || '—')}</span>
          </div>
        </td>
        <td class="num text-right"><span class="badge badge-info">${c.orders_count || 0}</span></td>
        <td class="num text-right font-bold">${fmtMoney(c.total_spent || 0)}</td>
        <td>
          <div class="cell-stack">
            <span class="table-cell-secondary num">${c.loyalty_points || 0} pts</span>
            <div class="progress" style="width:70px;height:5px"><div class="progress-bar" style="width:${Math.min(100, (c.loyalty_points || 0))}%"></div></div>
          </div>
        </td>
        <td>${JD.customerStatusBadge(c)}</td>
        <td class="muted no-wrap">${fmtDate(c.created_at, { short: true })}</td>
        <td>
          <div class="row-actions">
            <button class="row-action-btn act-view" data-id="${esc(c._id || c.id || c.email)}" title="View">${icon('eye', 15)}</button>
          </div>
        </td>
      </tr>`).join('');
    tbody.querySelectorAll('tr[data-cust]').forEach(tr => tr.addEventListener('click', (e) => {
      if (e.target.closest('.act-view')) openProfile(tr.dataset.cust);
      else openProfile(tr.dataset.cust);
    }));
    tbody.querySelectorAll('.act-view').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); openProfile(b.dataset.id); }));
  }

  function openProfile(id) {
    const c = customers.find(x => (x._id || x.id || x.email) === id) || customers[0];
    if (!c) return;
    const recentOrders = (DemoData.orders || []).filter(o => (o.customer?.email || o.user_email) === c.email).slice(0, 3);
    const rxList = (DemoData.prescriptions || []).filter(rx => (rx.patient_phone || '') === c.phone).slice(0, 3);

    const { drawer } = openDrawer(`
      <div class="drawer-head">
        <div class="drawer-title">Customer Profile</div>
        <button class="modal-close drawer-close">${icon('x', 16)}</button>
      </div>
      <div class="drawer-body">
        <div class="flex items-center gap-14 mb-20">
          <div class="avatar xl emerald" style="${c.avatar ? `background-image:url('${esc(c.avatar)}');background-size:cover` : ''}">${esc((c.name || 'U')[0])}</div>
          <div>
            <div class="font-bold text-lg">${esc(c.name)}${c.is_vip ? ' <span class="badge badge-brand">★ VIP</span>' : ''}</div>
            <div class="text-sm text-2">${esc(c.email)}</div>
            <div class="text-sm text-2">${esc(c.phone || '—')}</div>
            <div class="text-xs text-3">Joined ${fmtDate(c.created_at)}</div>
          </div>
        </div>

        <div class="grid grid-3 mb-16">
          <div class="card" style="text-align:center;padding:14px"><div class="text-xs text-3">Orders</div><div class="font-bold text-lg">${c.orders_count || 0}</div></div>
          <div class="card" style="text-align:center;padding:14px"><div class="text-xs text-3">Spend</div><div class="font-bold text-lg">${fmtMoney(c.total_spent || 0)}</div></div>
          <div class="card" style="text-align:center;padding:14px"><div class="text-xs text-3">Points</div><div class="font-bold text-lg">${c.loyalty_points || 0}</div></div>
        </div>

        <div class="tabs mb-16">
          <button class="tab active" data-tab="ord">Orders</button>
          <button class="tab" data-tab="rx">Prescriptions</button>
          <button class="tab" data-tab="wish">Wishlist</button>
          <button class="tab" data-tab="act">Activity</button>
        </div>

        <div class="tab-panels">
          <div class="tab-panel active" data-panel="ord">
            ${recentOrders.length ? recentOrders.map(o => `
              <div class="list-row" style="border:1px solid var(--border-soft);border-radius:12px;padding:10px 12px;margin-bottom:8px">
                <div><div class="list-row-label mono">${esc(o.order_number)}</div><div class="list-row-desc">${fmtDate(o.created_at, { short: true })} · ${JD.orderStatusBadge(o.status)}</div></div>
                <div class="font-bold num">${fmtMoney(o.total_amount)}</div>
              </div>`).join('')
              : `<div class="empty-state" style="padding:20px"><div class="empty-title">No orders yet</div></div>`}
          </div>
          <div class="tab-panel" data-panel="rx">
            ${rxList.length ? rxList.map(rx => `
              <div class="list-row" style="border:1px solid var(--border-soft);border-radius:12px;padding:10px 12px;margin-bottom:8px">
                <div><div class="list-row-label mono">${esc(rx.prescription_number)}</div><div class="list-row-desc">${esc(rx.medicine || '')}</div></div>
                ${JD.rxStatusBadge(rx.status)}
              </div>`).join('')
              : `<div class="empty-state" style="padding:20px"><div class="empty-title">No prescriptions</div></div>`}
          </div>
          <div class="tab-panel" data-panel="wish">
            <div class="empty-state" style="padding:20px"><div class="empty-icon">${icon('heart', 26)}</div><div class="empty-title">Wishlist</div><div class="empty-desc">${(c.wishlist?.length || 0)} items saved</div></div>
          </div>
          <div class="tab-panel" data-panel="act">
            <div class="timeline">
              <div class="tl-item current"><div class="tl-dot"></div><div class="tl-title">Account created</div><div class="tl-sub">${fmtRelative(c.created_at)}</div><div class="tl-time"></div></div>
              <div class="tl-item done"><div class="tl-dot"></div><div class="tl-title">Placed order</div><div class="tl-sub">Most recent purchase</div><div class="tl-time">2 wks ago</div></div>
              <div class="tl-item done"><div class="tl-dot"></div><div class="tl-title">Redeemed coupon</div><div class="tl-sub">Coupon WELCOME10</div><div class="tl-time">1 mo ago</div></div>
            </div>
          </div>
        </div>

        <h4 style="font-size:13px;font-weight:800;margin:16px 0 8px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)">Default Address</h4>
        <div class="text-sm text-2" style="line-height:1.7;background:var(--surface-2);border-radius:12px;padding:12px">
          ${esc(c.address?.street || 'No address on file')}${c.address?.city ? `<br>${esc(c.address.city)}${c.address.state ? ', ' + esc(c.address.state) : ''}` : ''}
        </div>
      </div>
      <div class="drawer-foot">
        <button class="btn btn-secondary" id="cust-msg-btn">${icon('mail', 15)} Message</button>
        <button class="btn btn-primary" id="cust-order-btn">${icon('shoppingCart', 15)} Order on behalf</button>
      </div>`, {});

    drawer.querySelector('.drawer-close').addEventListener('click', () => closeDrawer(drawer));
    drawer.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeDrawer(drawer)));
    drawer.querySelector('.tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      drawer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      drawer.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      drawer.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    });
    drawer.querySelector('#cust-msg-btn').addEventListener('click', () => showToast('Message composer opened', 'info'));
    drawer.querySelector('#cust-order-btn').addEventListener('click', () => showToast('Order creation for customer', 'info'));
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__custBooted) { window.__custBooted = true; initCustomers(); } }, 300);
  }
})();

