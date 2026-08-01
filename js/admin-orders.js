(function () {
  const session = requireAuth();
  const tbody = document.getElementById('admin-orders-list-tbody');

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    clearSession();
    location.href = 'admin-login.html';
  });

  async function load() {
    try {
      const data = await AdminAPI.listOrders({ limit: 100 });
      const orders = data.data || data || [];
      tbody.innerHTML = orders.map(o => `
        <tr>
          <td><code>${esc(o.order_number || o._id)}</code></td>
          <td>${esc(o.user_email || o.user?.email || '—')}</td>
          <td>₦${Number(o.total || 0).toLocaleString()}</td>
          <td>
            <select class="admin-order-status-select" data-order-num="${esc(o.order_number || o._id)}">
              <option value="PENDING" ${o.status === 'PENDING' ? 'selected' : ''}>Pending</option>
              <option value="PROCESSING" ${o.status === 'PROCESSING' ? 'selected' : ''}>Processing</option>
              <option value="SHIPPED" ${o.status === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
              <option value="DELIVERED" ${o.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
              <option value="CANCELLED" ${o.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>${esc(o.created_at ? new Date(o.created_at).toLocaleDateString() : '—')}</td>
        </tr>`).join('');
      tbody.querySelectorAll('.admin-order-status-select').forEach(sel => {
        const update = async () => {
          try {
            await AdminAPI.updateOrderStatus(sel.dataset.orderNum, sel.value);
            showToast('Order updated', 'success');
          } catch (err) {
            showToast(err.message || 'Failed to update order', 'error');
            sel.value = sel.dataset.prev || sel.value;
          }
        };
        sel.addEventListener('change', () => {
          sel.dataset.prev = sel.value;
          update();
        });
        sel.dataset.prev = sel.value;
      });
    } catch (err) {
      showToast(err.message || 'Failed to load orders', 'error');
    }
  }

  load();
})();
