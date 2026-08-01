/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Dashboard module
   KPI cards, trend charts, top products, activity feed.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, fmtMoney, fmtCompact, fmtDate, fmtRelative, esc, showToast } = JD;

  window.__pageContentRendered = function () {
    initDashboard();
  };

  function initDashboard() {
    renderDateLine();
    renderKPIs();
    renderActivityFeed();
    renderTopProducts();
    initCharts();
    document.getElementById('dash-export-btn')?.addEventListener('click', () => {
      showToast('Preparing dashboard export…', 'info');
    });
  }

  function renderDateLine() {
    const el = document.getElementById('dash-date-line');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' — here’s what’s happening across your pharmacy.';
    }
  }

  /* ─── KPI cards ─────────────────────────────────────── */
  const KPI_DEFS = [
    { label: "Today's Sales", value: 1842500, suffix: '', trend: 12.4, icon: 'dollar', tone: 'brand', series: [8, 12, 9, 15, 13, 18, 17, 22, 20, 26, 24, 29] },
    { label: "Today's Orders", value: 58, suffix: '', trend: 8.1, icon: 'shoppingCart', tone: 'blue', series: [4, 6, 5, 8, 7, 9, 8, 10, 9, 12, 11, 13] },
    { label: 'Pending Orders', value: 12, suffix: '', trend: -4.2, icon: 'clock', tone: 'warning', series: [6, 5, 7, 5, 6, 4, 5, 4, 3, 5, 4, 3] },
    { label: 'Pending Prescriptions', value: 7, suffix: '', trend: 15.0, icon: 'fileText', tone: 'purple', series: [2, 3, 2, 4, 3, 5, 4, 5, 6, 5, 6, 7] },
    { label: 'Revenue (30d)', value: 12400000, suffix: '', trend: 32.4, icon: 'trendingUp', tone: 'brand', series: [520, 610, 580, 700, 660, 780, 750, 880, 840, 960, 1100, 1240] },
    { label: 'Customers', value: 1480, suffix: '', trend: 18.6, icon: 'users', tone: 'blue', series: [320, 380, 410, 455, 520, 610, 680, 760, 890, 1040, 1250, 1480] },
    { label: 'Products', value: 328, suffix: '', trend: 5.2, icon: 'box', tone: 'teal', series: [290, 295, 301, 305, 310, 312, 315, 318, 320, 322, 325, 328] },
    { label: 'Low Stock Items', value: 8, suffix: '', trend: 14.3, icon: 'alertTriangle', tone: 'warning', series: [3, 4, 4, 5, 4, 5, 6, 5, 6, 7, 7, 8] },
    { label: 'Out of Stock', value: 3, suffix: '', trend: -25.0, icon: 'package', tone: 'danger', series: [8, 7, 7, 6, 6, 5, 5, 4, 4, 4, 3, 3] },
    { label: 'Expired Medicines', value: 12, suffix: '', trend: -8.3, icon: 'alertCircle', tone: 'rose', series: [18, 17, 17, 16, 15, 15, 14, 14, 13, 13, 12, 12] },
    { label: 'Active Discounts', value: 5, suffix: '', trend: 25.0, icon: 'percent', tone: 'purple', series: [2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5] },
    { label: 'Deliveries in Progress', value: 24, suffix: '', trend: 9.1, icon: 'truck', tone: 'blue', series: [12, 14, 13, 16, 15, 18, 17, 19, 20, 22, 21, 24] },
  ];

  function kpiTrendHtml(trend) {
    const up = trend >= 0;
    const cls = trend === 0 ? 'flat' : up ? 'up' : 'down';
    const arrow = trend === 0 ? '—' : up ? '↑' : '↓';
    return `<span class="kpi-trend ${cls}">${arrow} ${Math.abs(trend)}%</span>`;
  }

  function sparklinePath(values, w = 90, h = 36) {
    const max = Math.max(...values), min = Math.min(...values);
    const range = (max - min) || 1;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M${pts.join(' L')}`;
  }

  function renderKPIs() {
    const grid = document.getElementById('kpi-grid');
    if (!grid) return;
    grid.innerHTML = KPI_DEFS.map((k, i) => {
      const isMoney = k.icon === 'dollar' || k.icon === 'trendingUp';
      const value = isMoney ? fmtMoney(k.value) : fmtCompact(k.value);
      return `
        <div class="card kpi-card" data-idx="${i}">
          <div class="kpi-top">
            <div class="kpi-icon ${k.tone}">${icon(k.icon, 21)}</div>
            ${kpiTrendHtml(k.trend)}
          </div>
          <div>
            <div class="kpi-value">${value}</div>
            <div class="kpi-label">${k.label}</div>
          </div>
          <div class="kpi-chart">
            <svg width="100%" height="36" viewBox="0 0 90 36" preserveAspectRatio="none" aria-hidden="true">
              <path d="${sparklinePath(k.series)}" fill="none" stroke="${k.tone === 'danger' ? '#ef4444' : k.tone === 'warning' ? '#f59e0b' : k.tone === 'purple' ? '#9333ea' : k.tone === 'blue' ? '#3b82f6' : k.tone === 'rose' ? '#e11d48' : '#10b981'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.85"/>
            </svg>
          </div>
        </div>`;
    }).join('');
  }

  /* ─── Activity feed ──────────────────────────────────── */
  const ACTIVITY_ITEMS = [
    { icon: 'shoppingCart', tone: 'blue', text: '<b>New order received</b> — JD-20250115-C4D5E6 from Tunde Bakare', time: '12 min ago' },
    { icon: 'fileText', tone: 'purple', text: '<b>Prescription pending review</b> — RX-4F2A9C1B · Amoxicillin 250mg', time: '28 min ago' },
    { icon: 'database', tone: 'warning', text: '<b>Inventory updated</b> — Paracetamol 500mg restocked +200 units', time: '1 hr ago' },
    { icon: 'creditCard', tone: 'success', text: '<b>Payment received</b> — ₦33,862.50 for order JD-20250115-F7G8H9', time: '1 hr ago' },
    { icon: 'image', tone: 'purple', text: '<b>Banner published</b> — “Seasonal Sale” is now live', time: '3 hrs ago' },
    { icon: 'box', tone: 'teal', text: '<b>Product created</b> — Folic Acid 5mg added to catalogue', time: '5 hrs ago' },
    { icon: 'users', tone: 'blue', text: '<b>Customer registered</b> — Chiamaka Eze created an account', time: '6 hrs ago' },
    { icon: 'percent', tone: 'warning', text: '<b>Coupon redeemed</b> — WELCOME10 used by Ngozi Adeyemi', time: 'Yesterday' },
  ];

  function renderActivityFeed() {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;
    const tones = { blue: 'var(--blue-50)', purple: 'var(--purple-50)', warning: 'var(--warning-50)', success: 'var(--brand-50)', teal: 'var(--teal-50)' };
    feed.innerHTML = ACTIVITY_ITEMS.map(a => `
      <div class="activity-item">
        <div class="activity-avatar" style="background:${tones[a.tone] || 'var(--gray-100)'};color:var(--text-2)">${icon(a.icon, 17)}</div>
        <div class="activity-body">
          <div class="activity-text">${a.text}</div>
          <div class="activity-time">${a.time}</div>
        </div>
      </div>`).join('');
  }

  /* ─── Top products ───────────────────────────────────── */
  function renderTopProducts() {
    const list = document.getElementById('top-products-list');
    if (!list) return;
    const max = Math.max(...DemoData.topProducts.map(p => p.sales));
    list.innerHTML = DemoData.topProducts.map(p => {
      const pct = Math.round((p.sales / max) * 100);
      return `
        <div class="stat-row">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;">
            <div class="avatar teal">${esc(p.name[0])}</div>
            <div style="min-width:0;">
              <div class="stat-label" style="font-weight:650;color:var(--text);font-size:13px;">${esc(p.name)}</div>
              <div style="font-size:11.5px;color:var(--text-3);">${fmtCompact(p.sales)} units sold</div>
            </div>
          </div>
          <div style="flex:1;max-width:160px;">
            <div class="progress brand"><div style="width:${pct}%"></div></div>
          </div>
          <div style="text-align:right;min-width:90px;">
            <div class="stat-value">${fmtMoney(p.revenue)}</div>
            <div style="font-size:11px;color:var(--text-3);">revenue</div>
          </div>
        </div>`;
    }).join('');
  }

  /* ─── Charts ─────────────────────────────────────────── */
  function initCharts() {
    window.JDChart.load((Chart) => {
      const cssVar = (n, f) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
      const text3 = cssVar('--text-3', '#94a3b8');
      const text2 = cssVar('--text-2', '#64748b');
      const borderSoft = cssVar('--border-soft', '#eef2f6');
      const brand = '#10b981';
      const blue = '#3b82f6';

      const tooltipStyle = {
        backgroundColor: '#0f172a', padding: 12, cornerRadius: 12,
        titleFont: { family: 'Inter', size: 12.5, weight: 700 },
        bodyFont: { family: 'Inter', size: 12 },
        displayColors: true,
      };

      /* Daily sales */
      const ctx1 = document.getElementById('daily-sales-chart');
      if (ctx1) {
        new Chart(ctx1, {
          type: 'line',
          data: {
            labels: Array.from({ length: 30 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (29 - i));
              return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            }),
            datasets: [{
              label: 'Sales (₦\'000)',
              data: DemoData.series.sales30,
              borderColor: brand,
              backgroundColor: (c) => {
                const { ctx, chartArea } = c.chart;
                if (!chartArea) return brand + '22';
                const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                g.addColorStop(0, brand + '66');
                g.addColorStop(1, brand + '00');
                return g;
              },
              fill: true,
              tension: 0.4,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 4,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: false }, tooltip: tooltipStyle },
            scales: {
              x: { grid: { display: false }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 }, maxTicksLimit: 8 }, border: { display: false } },
              y: { grid: { color: borderSoft }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 }, maxTicksLimit: 5 }, border: { display: false } },
            },
          },
        });
      }

      /* Monthly revenue */
      const ctx2 = document.getElementById('revenue-chart');
      if (ctx2) {
        new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
            datasets: [{
              label: 'Revenue (₦m)',
              data: DemoData.series.revenue12,
              backgroundColor: (c) => c.chart.chartArea ? '#10b981' : brand,
              hoverBackgroundColor: brand,
              borderRadius: 7,
              borderSkipped: false,
              maxBarThickness: 26,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: tooltipStyle },
            scales: {
              x: { grid: { display: false }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 } }, border: { display: false } },
              y: { grid: { color: borderSoft }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 } }, border: { display: false } },
            },
          },
        });
      }

      /* Orders doughnut */
      const ctx3 = document.getElementById('orders-chart');
      if (ctx3) {
        new Chart(ctx3, {
          type: 'doughnut',
          data: {
            labels: ['Delivered', 'In Transit', 'Processing', 'Pending', 'Cancelled'],
            datasets: [{
              data: [64, 18, 9, 6, 3],
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#94a3b8'],
              borderWidth: 0,
              hoverOffset: 6,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 7, padding: 12, color: text2, font: { family: 'Inter', size: 11, weight: 600 } } },
              tooltip: tooltipStyle,
            },
          },
        });
      }

      /* Payments doughnut */
      const ctx4 = document.getElementById('payments-chart');
      if (ctx4) {
        new Chart(ctx4, {
          type: 'doughnut',
          data: {
            labels: ['Card', 'Bank Transfer', 'Paystack', 'Cash on Delivery'],
            datasets: [{
              data: [48, 32, 14, 6],
              backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
              borderWidth: 0,
              hoverOffset: 6,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 7, padding: 12, color: text2, font: { family: 'Inter', size: 11, weight: 600 } } },
              tooltip: tooltipStyle,
            },
          },
        });
      }

      /* Customer growth */
      const ctx5 = document.getElementById('customer-growth-chart');
      if (ctx5) {
        new Chart(ctx5, {
          type: 'line',
          data: {
            labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
            datasets: [{
              label: 'Customers',
              data: DemoData.series.customers12,
              borderColor: blue,
              backgroundColor: (c) => {
                const { ctx, chartArea } = c.chart;
                if (!chartArea) return blue + '22';
                const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                g.addColorStop(0, blue + '55');
                g.addColorStop(1, blue + '00');
                return g;
              },
              fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 4,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: tooltipStyle },
            scales: {
              x: { grid: { display: false }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 } }, border: { display: false } },
              y: { grid: { color: borderSoft }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 } }, border: { display: false } },
            },
          },
        });
      }
    });
  }

  // The page scripts load after shared layout DOMContentLoaded handler registered
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initDashboard();
  }
})();

