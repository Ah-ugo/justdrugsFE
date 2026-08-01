/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Reports module
   Report library cards with PDF / Excel / CSV export.
   CSV generates a real client-side download; PDF & Excel
   produce a premium preview and simulated export.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, esc, fmtDate, showToast, openModal, closeModal } = JD;

  const reportTypes = [
    { id: 'sales', label: 'Sales Report', desc: 'Daily, weekly and monthly sales breakdown', icon: 'dollar', tone: 'brand', rows: 48 },
    { id: 'inventory', label: 'Inventory Report', desc: 'Stock levels, movements and valuation', icon: 'database', tone: 'teal', rows: 335 },
    { id: 'orders', label: 'Orders Report', desc: 'Order volume, status and fulfilment metrics', icon: 'shoppingCart', tone: 'blue', rows: 186 },
    { id: 'customers', label: 'Customer Report', desc: 'Customer growth, retention and LTV', icon: 'users', tone: 'purple', rows: 1480 },
    { id: 'payments', label: 'Payments Report', desc: 'Payment methods, success rate and refunds', icon: 'creditCard', tone: 'success', rows: 210 },
    { id: 'prescriptions', label: 'Prescriptions Report', desc: 'Submission, approval and processing times', icon: 'fileText', tone: 'purple', rows: 42 },
    { id: 'delivery', label: 'Delivery Report', desc: 'Delivery performance, ETA accuracy and rider stats', icon: 'truck', tone: 'amber', rows: 58 },
    { id: 'discounts', label: 'Discounts Report', desc: 'Discount usage, ROI and redemption rates', icon: 'percent', tone: 'warning', rows: 12 },
  ];

  const recentExports = [
    { name: 'Sales Report', format: 'CSV', time: '2h ago', size: '18 KB', by: 'Adebayo O.' },
    { name: 'Inventory Report', format: 'Excel', time: 'Yesterday', size: '64 KB', by: 'John A.' },
    { name: 'Orders Report', format: 'PDF', time: '2 days ago', size: '1.2 MB', by: 'Sarah O.' },
    { name: 'Customers Report', format: 'CSV', time: '3 days ago', size: '42 KB', by: 'Adebayo O.' },
  ];

  window.__pageContentRendered = function () { initReports(); };

  function initReports() {
    renderReportGrid();
    renderRecentExports();

    document.querySelectorAll('#report-period button').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#report-period button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
    });

    document.getElementById('rep-schedule-btn').addEventListener('click', () => {
      openModal(`
        <div class="modal-head"><div><h3 class="modal-title">Scheduled Reports</h3><p class="modal-subtitle">Automated email deliveries</p></div><button class="modal-close">${icon('x', 16)}</button></div>
        <div class="modal-body">
          <div class="list-row"><div><div class="list-row-label">Weekly Sales Digest</div><div class="list-row-desc">Every Monday · 8:00 AM · CSV</div></div><button class="switch on"></button></div>
          <div class="list-row"><div><div class="list-row-label">Monthly Inventory Snapshot</div><div class="list-row-desc">1st of month · Excel</div></div><button class="switch on"></button></div>
          <div class="list-row"><div><div class="list-row-label">Quarterly Prescription Audit</div><div class="list-row-desc">PDF to pharmacists</div></div><button class="switch"></button></div>
        </div>
        <div class="modal-foot"><button class="btn btn-secondary" data-close>Close</button><button class="btn btn-primary" data-close>Save Schedule</button></div>
      `);
    });
  }

  function renderReportGrid() {
    const grid = document.getElementById('reports-grid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="grid grid-2" style="gap:12px">
        ${reportTypes.map(r => `
          <div class="card card-hover" style="padding:16px;margin:0">
            <div class="flex items-center justify-between mb-12 wrap gap-8">
              <div class="flex items-center gap-12">
                <div style="width:42px;height:42px;border-radius:12px;background:var(--brand-50);display:flex;align-items:center;justify-content:center;color:var(--brand-600)">${icon(r.icon, 20)}</div>
                <div>
                  <div class="font-bold" style="font-size:14px">${esc(r.label)}</div>
                  <div class="text-sm text-3" style="font-size:12px">${esc(r.desc)}</div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-8 mt-12">
              <button class="btn btn-sm btn-primary rep-export" data-report="${r.id}" data-format="pdf">${icon('fileText', 13)} PDF</button>
              <button class="btn btn-sm btn-secondary rep-export" data-report="${r.id}" data-format="excel">${icon('grid', 13)} Excel</button>
              <button class="btn btn-sm btn-secondary rep-export" data-report="${r.id}" data-format="csv">${icon('download', 13)} CSV</button>
            </div>
          </div>`).join('')}
      </div>`;

    grid.querySelectorAll('.rep-export').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        generateReport(btn.dataset.report, btn.dataset.format);
      });
    });
  }

  function renderRecentExports() {
    const list = document.getElementById('recent-exports-list');
    if (!list) return;
    list.innerHTML = recentExports.map(ex => `
      <div class="stat-row">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
          <div class="avatar ${ex.format === 'PDF' ? 'danger' : ex.format === 'Excel' ? 'teal' : 'emerald'}">${esc(ex.format[0])}</div>
          <div style="min-width:0;">
            <div class="stat-label" style="font-weight:650;font-size:13px">${esc(ex.name)}</div>
            <div style="font-size:11.5px;color:var(--text-3)">${esc(ex.by)} · ${ex.time} · ${ex.size}</div>
          </div>
        </div>
        <span class="badge badge-gray">${esc(ex.format)}</span>
      </div>`).join('');
  }

  function generateReport(type, format) {
    const report = reportTypes.find(r => r.id === type);
    const label = report?.label || type;

    if (format === 'csv') {
      // Real client-side CSV export
      const headers = ['ID', 'Date', 'Metric', 'Value', 'Change'];
      const rows = Array.from({ length: Math.min(report?.rows || 10, 25) }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i);
        return [i + 1, d.toISOString().slice(0, 10), `${label} row`, (Math.random() * 100000).toFixed(2), (Math.random() * 20 - 10).toFixed(1) + '%'];
      });
      const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = `just-drugs-${type}-report.csv`;
      a.click();
      showToast(`${label} exported as CSV`, 'success');
      return;
    }

    // PDF / Excel: premium preview + simulated download
    showToast(`Preparing ${label} (${format.toUpperCase()})…`, 'info');
    setTimeout(() => {
      openModal(`
        <div class="modal-head"><div><h3 class="modal-title">${esc(label)} — ${format.toUpperCase()}</h3>
        <p class="modal-subtitle">Report ready · ${fmtDate(new Date(), { time: true })}</p></div>
        <button class="modal-close">${icon('x', 16)}</button></div>
        <div class="modal-body">
          <div class="alert alert-success mb-16">${icon('checkCircle', 18)} Your ${format.toUpperCase()} report is ready to download.</div>
          <div style="background:var(--surface-2);border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:8px;">
            <div class="flex justify-between text-sm"><span class="text-2">File name</span><span class="font-semibold mono">just-drugs-${type}-report.${format === 'excel' ? 'xlsx' : 'pdf'}</span></div>
            <div class="flex justify-between text-sm"><span class="text-2">Rows</span><span class="font-semibold">${report?.rows || 100}</span></div>
            <div class="flex justify-between text-sm"><span class="text-2">Size</span><span class="font-semibold">${format === 'pdf' ? '1.2 MB' : '86 KB'}</span></div>
            <div class="flex justify-between text-sm"><span class="text-2">Generated by</span><span class="font-semibold">${esc(JD.getSession()?.admin?.full_name || 'You')}</span></div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" data-close>Cancel</button>
          <button class="btn btn-primary" id="rep-download-btn">${icon('download', 15)} Download</button>
        </div>`);
      document.getElementById('rep-download-btn').addEventListener('click', () => {
        showToast(`${label} downloaded (${format.toUpperCase()})`, 'success');
        closeModal(document.querySelector('.modal-backdrop.open'));
      });
    }, 900);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__reportsBooted) { window.__reportsBooted = true; initReports(); } }, 300);
  }
})();

