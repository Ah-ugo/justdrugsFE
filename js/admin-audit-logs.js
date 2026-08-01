/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Audit Logs module
   Filterable table of every administrative action with
   status badges, search, date range, module & status filters.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtDate, showToast } = JD;

  let logs = [];
  const state = { query: '', module: '', status: '', from: '', to: '', page: 1, perPage: 12 };

  window.__pageContentRendered = function () { initAudit(); };

  function initAudit() {
    logs = DemoData.auditLogs;
    renderTable();
    bindEvents();
  }

  function applied() {
    const q = state.query.toLowerCase();
    return logs.filter(l => {
      if (q && !(l.user + ' ' + l.action + ' ' + l.ip + ' ' + l.module).toLowerCase().includes(q)) return false;
      if (state.module && l.module !== state.module) return false;
      if (state.status && l.status !== state.status) return false;
      if (state.from && new Date(l.date) < new Date(state.from)) return false;
      if (state.to) {
        const to = new Date(state.to); to.setHours(23, 59, 59, 999);
        if (new Date(l.date) > to) return false;
      }
      return true;
    });
  }

  function statusBadge(s) {
    return s === 'success'
      ? '<span class="badge badge-success"><span class="badge-dot"></span>Success</span>'
      : '<span class="badge badge-danger"><span class="badge-dot"></span>Failed</span>';
  }

  function renderTable() {
    const tbody = document.getElementById('audit-tbody');
    const rows = applied();
    const start = (state.page - 1) * state.perPage;
    const slice = rows.slice(start, start + state.perPage);

    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">${icon('activity', 32)}</div><div class="empty-title">No audit logs found</div><div class="empty-desc">Try adjusting your filters.</div></div></td></tr>`;
    } else {
      tbody.innerHTML = slice.map(l => `
        <tr>
          <td>
            <div class="product-cell">
              <div class="avatar ${l.status === 'failed' ? 'danger' : 'emerald'}">${esc((l.user || 'A')[0])}</div>
              <div class="cell-stack">
                <span class="table-cell-primary">${esc(l.user)}</span>
              </div>
            </div>
          </td>
          <td><span class="badge badge-info">${esc(JD.roleLabel(l.role))}</span></td>
          <td><span class="text-sm" style="max-width:320px">${esc(l.action)}</span></td>
          <td><span class="badge badge-brand">${esc(l.module)}</span></td>
          <td class="muted no-wrap">${fmtDate(l.date, { time: true })}</td>
          <td><code class="mono text-xs">${esc(l.ip)}</code></td>
          <td>${statusBadge(l.status)}</td>
        </tr>`).join('');
    }

    document.getElementById('audit-page-info').textContent = rows.length ? `Showing ${start + 1}–${Math.min(start + state.perPage, rows.length)} of ${rows.length}` : 'No records';
    renderPagination(rows.length);
  }

  function renderPagination(total) {
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    const wrap = document.getElementById('audit-pagination');
    let html = `<button class="page-btn" data-p="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>${icon('chevronLeft', 14)}</button>`;
    for (let i = 1; i <= pages; i++) html += `<button class="page-btn ${i === state.page ? 'active' : ''}" data-p="${i}">${i}</button>`;
    html += `<button class="page-btn" data-p="${state.page + 1}" ${state.page >= pages ? 'disabled' : ''}>${icon('chevronRight', 14)}</button>`;
    wrap.innerHTML = html;
    wrap.querySelectorAll('.page-btn').forEach(b => b.addEventListener('click', () => { if (b.disabled) return; state.page = Number(b.dataset.p); renderTable(); }));
  }

  function bindEvents() {
    document.getElementById('audit-search').addEventListener('input', JD.debounce((e) => { state.query = e.target.value; state.page = 1; renderTable(); }, 300));
    document.getElementById('audit-module').addEventListener('change', (e) => { state.module = e.target.value; state.page = 1; renderTable(); });
    document.getElementById('audit-status').addEventListener('change', (e) => { state.status = e.target.value; state.page = 1; renderTable(); });
    document.getElementById('audit-from').addEventListener('change', (e) => { state.from = e.target.value; state.page = 1; renderTable(); });
    document.getElementById('audit-to').addEventListener('change', (e) => { state.to = e.target.value; state.page = 1; renderTable(); });
    document.getElementById('audit-refresh-btn').addEventListener('click', () => { renderTable(); showToast('Audit log refreshed', 'success'); });
    document.getElementById('audit-export-btn').addEventListener('click', () => {
      const csv = [['User', 'Role', 'Action', 'Module', 'Date', 'IP', 'Status']]
        .concat(applied().map(l => [l.user, l.role, l.action, l.module, fmtDate(l.date, { time: true }), l.ip, l.status]))
        .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'just-drugs-audit-logs.csv';
      a.click();
      showToast('Audit logs exported as CSV', 'success');
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__auditBooted) { window.__auditBooted = true; initAudit(); } }, 300);
  }
})();

