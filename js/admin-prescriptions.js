(function () {
  requireAuth();
  let tbody;
  let allPrescriptions = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  async function load() {
    try {
      const data = await AdminAPI.listPrescriptions({ limit: 100 });
      allPrescriptions = data.prescriptions || data.data || data || [];
      renderTable();
    } catch (err) { showToast(err.message || 'Failed to load prescriptions', 'error'); }
  }

  function renderTable() {
    if (!tbody) return;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allPrescriptions.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(allPrescriptions.length / PAGE_SIZE));
    if (allPrescriptions.length === 0) { tbody.innerHTML = `<tr><td colspan="7"><div class="admin-empty-state"><h3>No prescriptions</h3></div></td></tr>`; return; }
    tbody.innerHTML = pageItems.map(rx => `
      <tr>
        <td style="font-weight:600">${esc(rx.patient_name || rx.customer_name || '—')}</td>
        <td>${esc(rx.doctor_name || rx.doctor || '—')}</td>
        <td>${esc(rx.medicine_name || rx.product_name || '—')}</td>
        <td><code>${esc(rx.order_number || rx.order_id || '—')}</code></td>
        <td>${statusBadge(rx.status || 'PENDING')}</td>
        <td>${formatDate(rx.created_at || rx.submitted_at)}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-secondary admin-view-rx-btn" data-id="${esc(rx._id || rx.id)}">${Icons.eye}</button>
            ${rx.status === 'PENDING' ? `
              <button class="btn btn-sm btn-primary admin-approve-rx-btn" data-id="${esc(rx._id || rx.id)}">${Icons.check}</button>
              <button class="btn btn-sm btn-danger admin-reject-rx-btn" data-id="${esc(rx._id || rx.id)}">${Icons.error}</button>
            ` : ''}
          </div>
        </td>
      </tr>`).join('');
    const pagEl = document.getElementById('admin-pagination');
    if (pagEl) buildPagination(currentPage, totalPages, 'admin-pagination', (p) => { currentPage = p; renderTable(); });
    tbody.querySelectorAll('.admin-view-rx-btn').forEach(btn => btn.addEventListener('click', () => openView(btn.dataset.id)));
    tbody.querySelectorAll('.admin-approve-rx-btn').forEach(btn => btn.addEventListener('click', () => approveRx(btn.dataset.id)));
    tbody.querySelectorAll('.admin-reject-rx-btn').forEach(btn => btn.addEventListener('click', () => rejectRx(btn.dataset.id)));
  }

  function openOverlay() { const el = document.getElementById('admin-prescription-view-overlay'); if (el) el.hidden = false; }
  function closeOverlay() { const el = document.getElementById('admin-prescription-view-overlay'); if (el) el.hidden = true; }
  function openView(id) {
    const rx = allPrescriptions.find(r => (r._id || r.id) === id); if (!rx) return;
    const modalBody = document.getElementById('admin-rx-modal-body');
    const modalFooter = document.getElementById('admin-rx-modal-footer');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px">
          <div><strong>Patient:</strong> ${esc(rx.patient_name || rx.customer_name || '—')}</div>
          <div><strong>Doctor:</strong> ${esc(rx.doctor_name || rx.doctor || '—')}</div>
          <div><strong>Medicine:</strong> ${esc(rx.medicine_name || rx.product_name || '—')}</div>
          <div><strong>Order:</strong> <code>${esc(rx.order_number || rx.order_id || '—')}</code></div>
          <div><strong>Status:</strong> ${statusBadge(rx.status || 'PENDING')}</div>
          ${rx.image_url ? `<div style="margin-top:8px"><img src="${esc(rx.image_url)}" style="max-width:100%;border-radius:var(--radius-md);border:1px solid var(--gray-200)" alt="Prescription"></div>` : ''}
        </div>
      `;
    }
    if (modalFooter) {
      modalFooter.innerHTML = `<button class="btn btn-secondary" id="admin-rx-modal-close-btn">Close</button>`;
    }
    openOverlay();
    document.getElementById('admin-rx-modal-close-btn')?.addEventListener('click', closeOverlay);
  }
  document.getElementById('admin-prescription-view-overlay')?.addEventListener('click', (e) => { if (e.target.id === 'admin-prescription-view-overlay') closeOverlay(); });

  async function approveRx(id) {
    try { await AdminAPI.approvePrescription(id); showToast('Prescription approved', 'success'); load(); }
    catch (err) { showToast(err.message || 'Failed', 'error'); }
  }
  async function rejectRx(id) {
    const reason = prompt('Rejection reason:');
    if (reason === null) return;
    try { await AdminAPI.rejectPrescription(id, reason); showToast('Prescription rejected', 'success'); load(); }
    catch (err) { showToast(err.message || 'Failed', 'error'); }
  }

  async function init() {
    tbody = document.getElementById('admin-rx-list-tbody');
    const contentHtml = `
      <div class="admin-kpi-grid">
        <div class="admin-kpi-card"><div class="admin-kpi-icon amber">${Icons.warning}</div><div class="admin-kpi-body"><div class="admin-kpi-label">Pending</div><div class="admin-kpi-value" id="rx-pending">—</div></div></div>
        <div class="admin-kpi-card"><div class="admin-kpi-icon brand">${Icons.check}</div><div class="admin-kpi-body"><div class="admin-kpi-label">Approved</div><div class="admin-kpi-value" id="rx-approved">—</div></div></div>
        <div class="admin-kpi-card"><div class="admin-kpi-icon red">${Icons.error}</div><div class="admin-kpi-body"><div class="admin-kpi-label">Rejected</div><div class="admin-kpi-value" id="rx-rejected">—</div></div></div>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-toolbar"><span class="admin-table-title">Prescriptions</span></div>
        <div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Patient</th><th>Doctor</th><th>Medicine</th><th>Order</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead><tbody id="admin-rx-list-tbody"></tbody></table></div>
        <div class="admin-table-pagination"><span class="text-sm text-muted" id="admin-page-info"></span><div class="admin-pagination-btns" id="admin-pagination"></div></div>
      </div>
    `;
    initAppShell('Prescriptions', 'Review and approve patient prescriptions', contentHtml, { actions: '', page: 'prescriptions' });
    tbody = document.getElementById('admin-rx-list-tbody');
    await load();
  }

  init();
})();
