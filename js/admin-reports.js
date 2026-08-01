(function () {
  requireAuth();

  const reportTypes = [
    { id: 'sales', label: 'Sales Report', desc: 'Daily, weekly and monthly sales breakdown' },
    { id: 'inventory', label: 'Inventory Report', desc: 'Stock levels, movements and valuation' },
    { id: 'orders', label: 'Orders Report', desc: 'Order volume, status and fulfillment metrics' },
    { id: 'customers', label: 'Customer Report', desc: 'Customer growth, retention and LTV' },
    { id: 'payments', label: 'Payments Report', desc: 'Payment methods, success rate and refunds' },
    { id: 'prescriptions', label: 'Prescriptions Report', desc: 'Submission, approval and processing times' },
    { id: 'delivery', label: 'Delivery Report', desc: 'Delivery performance, ETA accuracy and rider stats' },
    { id: 'discounts', label: 'Discounts Report', desc: 'Discount usage, ROI and redemption rates' },
  ];

  const contentHtml = `
    <div class="admin-panel">
      <div class="admin-panel-header"><div><div class="admin-panel-title">Generate Reports</div><div class="admin-panel-subtitle">Export data for analysis</div></div></div>
      <div class="admin-grid-2">
        ${reportTypes.map(r => `
          <div class="admin-panel card-hover" style="margin-bottom:0;cursor:pointer" data-report="${r.id}">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-weight:700;color:var(--gray-900);margin-bottom:4px">${esc(r.label)}</div>
                <div class="text-sm text-muted">${esc(r.desc)}</div>
              </div>
              <div style="display:flex;gap:4px">
                <button class="btn btn-sm btn-primary admin-report-pdf" data-report="${r.id}">PDF</button>
                <button class="btn btn-sm btn-secondary admin-report-excel" data-report="${r.id}">Excel</button>
                <button class="btn btn-sm btn-secondary admin-report-csv" data-report="${r.id}">CSV</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  initAppShell('Reports', 'Generate and export detailed reports', contentHtml, { actions: '', page: 'reports' });

  document.querySelectorAll('.admin-report-pdf').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); generateReport(btn.dataset.report, 'pdf'); }));
  document.querySelectorAll('.admin-report-excel').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); generateReport(btn.dataset.report, 'excel'); }));
  document.querySelectorAll('.admin-report-csv').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); generateReport(btn.dataset.report, 'csv'); }));

  async function generateReport(type, format) {
    showToast(`Generating ${type} report as ${format.toUpperCase()}...`, 'info');
    try {
      await AdminAPI.generateReport(type, { format });
      showToast(`${type} report ready for download (${format.toUpperCase()})`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to generate report', 'error');
    }
  }
})();
