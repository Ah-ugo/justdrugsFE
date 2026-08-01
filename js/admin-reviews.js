/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Reviews module
   Moderate reviews: approve, flag, delete. Star rating render.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtDate, fmtRelative, showToast, confirmDialog } = JD;

  let reviews = [];
  const state = { query: '', status: '', rating: '' };

  window.__pageContentRendered = function () { initReviews(); };

  async function initReviews() {
    try {
      const res = await AdminAPI.listReviews();
      const data = res.data || res;
      reviews = Array.isArray(data) ? data : DemoData.reviews;
    } catch (e) {
      console.warn('[Reviews] Demo mode:', e.message);
      reviews = DemoData.reviews;
    }
    renderTable();
    document.getElementById('rev-search').addEventListener('input', JD.debounce((e) => { state.query = e.target.value; renderTable(); }, 300));
    document.getElementById('rev-rating-filter').addEventListener('change', (e) => { state.rating = e.target.value; renderTable(); });
    document.querySelectorAll('#rev-status-chips .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#rev-status-chips .filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.status = chip.dataset.status;
        renderTable();
      });
    });
    document.getElementById('rev-export-btn').addEventListener('click', () => {
      const csv = [['Product', 'Customer', 'Rating', 'Review', 'Verified', 'Status', 'Date']]
        .concat(applied().map(r => [r.product_name, r.customer, r.rating, r.comment, r.verified ? 'Yes' : 'No', r.status, fmtDate(r.created_at)]))
        .map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'just-drugs-reviews.csv';
      a.click();
      showToast('Reviews exported', 'success');
    });
  }

  function applied() {
    const q = state.query.toLowerCase();
    return reviews.filter(r => {
      if (state.status && (r.status || '').toLowerCase() !== state.status.toLowerCase()) return false;
      if (state.rating && Number(r.rating) !== Number(state.rating)) return false;
      if (q && !((r.product_name || '') + ' ' + (r.customer || '') + ' ' + (r.comment || '')).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function stars(rating) {
    const full = '★'.repeat(rating || 0);
    const empty = '☆'.repeat(Math.max(0, 5 - (rating || 0)));
    return `<span style="color:var(--warning-500);letter-spacing:1px">${full}</span><span style="color:var(--border-strong)">${empty}</span>`;
  }

  function statusBadge(s) {
    const m = { approved: ['badge-success', 'Approved'], pending: ['badge-warning', 'Pending'], flagged: ['badge-danger', 'Flagged'], rejected: ['badge-gray', 'Rejected'] }[s] || ['badge-gray', s];
    return `<span class="badge ${m[0]}"><span class="badge-dot"></span>${esc(m[1])}</span>`;
  }

  function renderTable() {
    const tbody = document.getElementById('reviews-tbody');
    const rows = applied();
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">${icon('star', 32)}</div><div class="empty-title">No reviews found</div><div class="empty-desc">Try adjusting filters.</div></div></td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td><span class="table-cell-primary">${esc(r.product_name)}</span></td>
        <td><div class="cell-stack"><span class="table-cell-primary">${esc(r.customer)}</span><span class="table-cell-secondary">${esc(r.customer_email || '')}</span></div></td>
        <td><span class="num font-bold text-md">${stars(r.rating)}</span></td>
        <td style="max-width:320px"><span class="text-sm text-2" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(r.comment)}</span></td>
        <td>${r.verified ? `<span class="badge badge-success">${icon('check', 11)} Verified Purchase</span>` : '<span class="badge badge-gray">Not Verified</span>'}</td>
        <td>${statusBadge(r.status)}</td>
        <td class="muted no-wrap">${fmtDate(r.created_at, { short: true })}</td>
        <td>
          <div class="row-actions">
            ${r.status === 'pending' || r.status === 'flagged' ? `<button class="row-action-btn act-approve" data-id="${esc(r._id || r.id)}" title="Approve">${icon('check', 15)}</button>` : ''}
            <button class="row-action-btn danger act-delete" data-id="${esc(r._id || r.id)}" title="Delete">${icon('trash', 15)}</button>
          </div>
        </td>
      </tr>`).join('');
    tbody.querySelectorAll('.act-approve').forEach(b => b.addEventListener('click', () => {
      const r = reviews.find(x => (x._id || x.id) === b.dataset.id);
      if (r) { r.status = 'approved'; renderTable(); showToast('Review approved and published', 'success'); }
    }));
    tbody.querySelectorAll('.act-delete').forEach(b => b.addEventListener('click', async () => {
      const r = reviews.find(x => (x._id || x.id) === b.dataset.id);
      const ok = await confirmDialog(`Delete this review by <b>${esc(r?.customer)}</b>?`, { variant: 'danger', confirmText: 'Delete' });
      if (!ok) return;
      reviews = reviews.filter(x => (x._id || x.id) !== b.dataset.id);
      renderTable();
      showToast('Review deleted', 'success');
    }));
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__reviewsBooted) { window.__reviewsBooted = true; initReviews(); } }, 300);
  }
})();

