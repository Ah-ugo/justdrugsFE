(function () {
  requireAuth();
  let tbody;
  let allOrders = [];
  let selectedOrders = new Set();
  let currentPage = 1;
  const PAGE_SIZE = 20;

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'AWAITING_PAYMENT', label: 'Awaiting Payment' },
    { value: 'PAID', label: 'Paid' },
    { value: 'PRESCRIPTION_REVIEW', label: 'Prescription Review' },
    { value: 'PREPARING', label: 'Preparing' },
    { value: 'PACKED', label: 'Packed' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'REFUNDED', label: 'Refunded' },
  ];

  const drawerBackdrop = document.getElementById('admin-order-drawer-backdrop');
  const drawer = document.getElementById('admin-order-drawer');
  const drawerBody = document.getElementById('admin-order-drawer-body');

  function openDrawer() {
    if (drawer) { drawer.hidden = false; }
    if (drawerBackdrop) { drawerBackdrop.hidden = false; }
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
  }
  function closeDrawer() {
    if (drawer) drawer.hidden = true;
    if (drawerBackdrop) { drawerBackdrop.hidden = true; drawerBackdrop.removeEventListener('click', closeDrawer); }
  }
  document.getElementById('admin-order-drawer-close')?.addEventListener('click', closeDrawer);

  async function load() {
    try {
      const data = await AdminAPI.listOrders({ limit: 100 });
      allOrders = data.data || data.orders || data || [];
      renderTable();
    } catch (err) {
      showToast(err.message || 'Failed to load orders', 'error');
    }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allOrders.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allOrders.length / PAGE_SIZE));

    if (allOrders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="admin-empty-state"><h3>No orders yet</h3><p>Orders will appear here once customers place them</p></div></td></tr>';
      return;
    }

    tbody.innerHTML = pageItems.map(o => {
      const num = o.order_number || o._id;
      const selected = selectedOrders.has(num);
      return `
        <tr class="${selected ? 'selected' : ''}" data-num="${esc(num)}">
          <td class="admin-table-checkbox"><input type="checkbox" class="admin-order-check" data-num="${esc(num)}" ${selected ? 'checked' : ''}></td>
          <td><code style="font-size:0.8125rem;font-weight:600;color:var(--gray-800)">${esc(num)}</code></td>
          <td>${esc(o.user_email || o.user?.email || '—')}</td>
          <td>${(o.items || []).length} item${(o.items || []).length !== 1 ? 's' : ''}</td>
          <td style="font-weight:600">${formatCurrency(o.total)}</td>
          <td>${statusBadge(o.payment_status || o.payment?.status || 'PENDING')}</td>
          <td>
            <select class="admin-order-status-select" data-num="${esc(num)}" style="width:auto">
              ${statusOptions.map(s => `<option value="${s.value}" ${(o.status || '') === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select>
          </td>
          <td>${formatDate(o.created_at)}</td>
        </tr>`;
    }).join('');

    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });

    tbody.querySelectorAll('.admin-order-check').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) selectedOrders.add(cb.dataset.num);
        else selectedOrders.delete(cb.dataset.num);
        cb.closest('tr')?.classList.toggle('selected', cb.checked);
      });
    });

    tbody.querySelectorAll('.admin-order-status-select').forEach(sel => {
      const update = async () => {
        try {
          await AdminAPI.updateOrderStatus(sel.dataset.num, sel.value);
          showToast('Order status updated', 'success');
        } catch (err) {
          showToast(err.message || 'Failed to update', 'error');
          sel.value = sel.dataset.prev || sel.value;
        }
      };
      sel.addEventListener('change', () => { sel.dataset.prev = sel.value; update(); });
      sel.dataset.prev = sel.value;
    });

    tbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('select') || e.target.closest('input')) return;
        const num = tr.dataset.num;
        const order = allOrders.find(o => (o.order_number || o._id) === num);
        if (order) openOrderDrawer(order);
      });
      tr.style.cursor = 'pointer';
    });
  }

  async function openOrderDrawer(order) {
    const num = order.order_number || order._id;
    let detail = order;
    try {
      detail = await AdminAPI.getOrderDetails(num);
    } catch { /* use list data */ }

    const statusSteps = ['PENDING','AWAITING_PAYMENT','PAID','PRESCRIPTION_REVIEW','PREPARING','PACKED','ASSIGNED','OUT_FOR_DELIVERY','DELIVERED'];
    const currentIdx = statusSteps.indexOf(detail.status || 'PENDING');

    const itemsHtml = (detail.items || []).map(item => `
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--gray-100)">
        <div>
          <div style="font-weight:600;font-size:0.8125rem">${esc(item.name || item.product_name || 'Product')}</div>
          <div class="text-xs text-muted">Qty: ${item.quantity || 1} × ${formatCurrency(item.unit_price || item.price || 0)}</div>
        </div>
        <div style="font-weight:600">${formatCurrency((item.unit_price || item.price || 0) * (item.quantity || 1))}</div>
      </div>
    `).join('');

    if (drawerBody) {
      drawerBody.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <div>
            <div style="font-size:1.125rem;font-weight:700">${esc(num)}</div>
            <div class="text-sm text-muted">${formatDateTime(detail.created_at)}</div>
          </div>
          ${statusBadge(detail.status || 'PENDING')}
        </div>

        <div class="admin-panel" style="padding:16px;margin-bottom:16px">
          <div class="admin-panel-title" style="margin-bottom:12px">Order Timeline</div>
          <div style="display:flex;align-items:center;gap:0;overflow-x:auto;padding:4px 0">
            ${statusSteps.map((s, i) => `
              <div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:60px">
                <div style="width:20px;height:20px;border-radius:50%;background:${i <= currentIdx ? 'var(--brand-500)' : 'var(--gray-200)'};color:${i <= currentIdx ? '#fff' : 'var(--gray-500)'};display:flex;align-items:center;justify-content:center;font-size:0.625rem;font-weight:700">${i <= currentIdx ? '✓' : ''}</div>
                <div class="text-xs text-muted" style="margin-top:4px;white-space:nowrap">${s.replace(/_/g,' ')}</div>
              </div>
              ${i < statusSteps.length - 1 ? `<div style="flex:1;height:2px;background:${i < currentIdx ? 'var(--brand-500)' : 'var(--gray-200)'};margin-bottom:20px;min-width:20px"></div>` : ''}
            `).join('')}
          </div>
        </div>

        <div class="admin-panel" style="padding:16px;margin-bottom:16px">
          <div class="admin-panel-title" style="margin-bottom:12px">Customer</div>
          <div class="text-sm"><strong>Email:</strong> ${esc(detail.user_email || detail.user?.email || '—')}</div>
          <div class="text-sm text-muted"><strong>Phone:</strong> ${esc(detail.user_phone || detail.user?.phone || '—')}</div>
        </div>

        <div class="admin-panel" style="padding:16px;margin-bottom:16px">
          <div class="admin-panel-title" style="margin-bottom:12px">Items</div>
          ${itemsHtml || '<div class="text-sm text-muted">No items</div>'}
          <div style="display:flex;justify-content:space-between;padding-top:12px;font-weight:700">
            <span>Total</span><span>${formatCurrency(detail.total)}</span>
          </div>
        </div>

        ${detail.prescription_url ? `
        <div class="admin-panel" style="padding:16px;margin-bottom:16px">
          <div class="admin-panel-title" style="margin-bottom:12px">Prescription</div>
          <a href="${esc(detail.prescription_url)}" target="_blank" class="btn btn-secondary btn-sm">${Icons.eye} View Prescription</a>
        </div>` : ''}

        ${detail.notes ? `
        <div class="admin-panel" style="padding:16px;margin-bottom:16px">
          <div class="admin-panel-title" style="margin-bottom:12px">Notes</div>
          <div class="text-sm">${esc(detail.notes)}</div>
        </div>` : ''}

        <div style="margin-top:16px">
          <label class="form-group"><strong>Update Status</strong></label>
          <select id="admin-order-detail-status-select" style="width:100%;margin-top:6px">
            ${statusOptions.map(s => `<option value="${s.value}" ${(detail.status || '') === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
          <button class="btn btn-primary" style="width:100%;margin-top:8px" id="admin-update-order-status-btn">Update Status</button>
        </div>
      `;
    }

    openDrawer();

    const updateBtn = document.getElementById('admin-update-order-status-btn');
    updateBtn?.addEventListener('click', async () => {
      const newStatus = document.getElementById('admin-order-detail-status-select').value;
      try {
        await AdminAPI.updateOrderStatus(num, newStatus);
        showToast('Order updated', 'success');
        load();
        closeDrawer();
      } catch (err) {
        showToast(err.message || 'Failed to update', 'error');
      }
    });
  }

  async function init() {
    tbody = document.getElementById('admin-orders-list-tbody');

    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <input type="search" id="admin-order-search" placeholder="Search orders..." style="width:240px">
            <select id="admin-order-filter-status" style="width:180px">
              <option value="">All Status</option>
              ${statusOptions.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" id="admin-export-orders-btn">${Icons.download} Export</button>
            <span class="text-sm text-muted" id="admin-selected-count"></span>
          </div>
        </div>
        <div class="admin-table-scroll">
          <table class="admin-table">
            <thead>
              <tr>
                <th class="admin-table-checkbox"><input type="checkbox" id="admin-select-all"></th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody id="admin-orders-list-tbody"></tbody>
          </table>
        </div>
        <div class="admin-table-pagination">
          <span class="text-sm text-muted" id="admin-page-info"></span>
          <div class="admin-pagination-btns" id="admin-pagination"></div>
        </div>
      </div>
    `;

    initAppShell('Orders', 'Manage and fulfill customer orders', contentHtml, { actions: '', page: 'orders' });

    // Re-acquire tbody after shell is built
    tbody = document.getElementById('admin-orders-list-tbody');

    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
      clearSession();
      location.href = 'admin-login.html';
    });

    document.getElementById('admin-order-search')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      allOrders = allOrders.filter(o => (o.order_number || '').toLowerCase().includes(q) || (o.user_email || '').toLowerCase().includes(q));
      currentPage = 1;
      renderTable();
    });
    document.getElementById('admin-order-filter-status')?.addEventListener('change', (e) => {
      currentPage = 1;
      renderTable();
    });

    await load();
  }

  init();
})();
