(function () {
  requireAuth();
  let tbody;
  let allReviews = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listReviews({ limit: 100 });
      allReviews = data.reviews || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load reviews', 'error'); }
  }

  function renderStars(n) { let s = ''; for (let i = 0; i < 5; i++) s += i < n ? '★' : '☆'; return s; }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allReviews.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allReviews.length / PAGE_SIZE));
    if (allReviews.length === 0) { tbody.innerHTML = `<tr><td colspan="5"><div class="admin-empty-state"><h3>No reviews</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(r => `
      <tr>
        <td>${esc(r.customer_name || r.user?.full_name || '—')}</td>
        <td>${esc(r.product_name || r.product?.name || '—')}</td>
        <td style="color:#f59e0b;font-size:0.875rem">${renderStars(r.rating || 0)}</td>
        <td><span class="text-xs text-muted">${esc(r.comment?.slice(0, 60) || '')}</span></td>
        <td>${statusBadge(r.is_approved ? 'APPROVED' : 'PENDING')}</td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
  }

  async function init() {
    tbody = document.getElementById('admin-review-list-tbody');
    const contentHtml = `
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">Reviews</span></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Customer</th><th>Product</th><th>Rating</th><th>Comment</th><th>Status</th></tr></thead><tbody id="admin-review-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Reviews', 'Moderate and manage customer reviews', contentHtml, { actions: '', page: 'reviews' });
    tbody = document.getElementById('admin-review-list-tbody');
    await load();
  }

  init();
})();
