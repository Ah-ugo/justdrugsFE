/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Analytics module
   Interactive dashboards: revenue, orders, customers,
   top products/categories, payments, prescriptions, delivery.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtMoney, fmtCompact, showToast } = JD;

  window.__pageContentRendered = function () { initAnalytics(); };

  const demo = {
    revenue: [120000, 180000, 150000, 220000, 190000, 280000, 310000, 260000, 340000, 300000, 380000, 420000],
    orders: [45, 62, 55, 78, 68, 92, 105, 88, 112, 98, 124, 135],
    visitors: [1200, 1500, 1300, 1800, 1600, 2200, 2500, 2100, 2600, 2400, 2900, 3200],
    conversion: [2.4, 3.1, 2.8, 3.5, 3.2, 4.1, 4.5, 3.9, 4.3, 4.0, 4.6, 5.0],
    customers: [320, 380, 410, 455, 520, 610, 680, 760, 890, 1040, 1250, 1480],
    payments: [48, 32, 14, 6],
    categories: { labels: ['Antibiotics', 'Pain Relief', 'Vitamins', 'Diabetes', 'First Aid'], data: [35, 25, 18, 12, 10] },
    inventory: { labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Expiring'], data: [312, 8, 3, 12] },
    products: { labels: ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Vitamin C 1000mg', 'Cough Syrup 200ml', 'Insulin Glargine'], data: [1240, 980, 856, 720, 640] },
    prescriptions: { labels: ['Pending', 'Approved', 'Rejected', 'Need Better Image', 'Expired'], data: [2, 2, 1, 1, 1] },
    delivery: { labels: ['Lekki', 'Ikeja', 'VI', 'Yaba', 'Abuja'], data: [96, 98, 97, 94, 91] },
  };

  function initAnalytics() {
    renderRangeSelector();
    document.getElementById('analytics-export-btn').addEventListener('click', () => {
      showToast('Analytics snapshot exported', 'success');
    });
    initCharts();
  }

  function renderRangeSelector() {
    const segmented = document.getElementById('analytics-range');
    segmented.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        segmented.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        showToast(`Analytics range: ${b.dataset.range.toUpperCase()}`, 'info');
      });
    });
  }

  function initCharts() {
    window.JDChart.load((Chart) => {
      const cssVar = (n, f) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
      const text3 = cssVar('--text-3', '#94a3b8');
      const text2 = cssVar('--text-2', '#64748b');
      const borderSoft = cssVar('--border-soft', '#eef2f6');
      const brand = '#10b981';
      const blue = '#3b82f6';
      const purple = '#8b5cf6';
      const amber = '#f59e0b';
      const rose = '#e11d48';

      const tooltipStyle = {
        backgroundColor: '#0f172a', padding: 12, cornerRadius: 12,
        titleFont: { family: 'Inter', size: 12.5, weight: 700 },
        bodyFont: { family: 'Inter', size: 12 },
        displayColors: true,
      };

      const makeLine = (ctx, labels, data, color, extra) => {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: extra?.label || '',
              data,
              borderColor: color,
              backgroundColor: (c) => {
                const { ctx: c2, chartArea } = c.chart;
                if (!chartArea) return color + '22';
                const g = c2.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                g.addColorStop(0, color + '66');
                g.addColorStop(1, color + '00');
                return g;
              },
              fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 4,
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
      };

      const makeDoughnut = (ctx, labels, data, colors) => {
        new Chart(ctx, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: '68%',
            plugins: {
              legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 7, padding: 12, color: text2, font: { family: 'Inter', size: 11, weight: 600 } } },
              tooltip: tooltipStyle,
            },
          },
        });
      };

      const makeBar = (ctx, labels, data, color) => {
        new Chart(ctx, {
          type: 'bar',
          data: { labels, datasets: [{ data, backgroundColor: color, borderRadius: 7, borderSkipped: false, maxBarThickness: 26 }] },
          options: {
            responsive: true, maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false }, tooltip: tooltipStyle },
            scales: {
              x: { grid: { color: borderSoft }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 } }, border: { display: false } },
              y: { grid: { display: false }, ticks: { color: text2, font: { family: 'Inter', size: 11 } }, border: { display: false } },
            },
          },
        });
      };

      const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
      const days = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (11 - i));
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      });

      // Revenue & orders (dual axis)
      const revEl = document.getElementById('chart-analytics-revenue');
      if (revEl) {
        new Chart(revEl, {
          type: 'line',
          data: {
            labels: days,
            datasets: [
              { label: 'Revenue (₦)', data: demo.revenue, borderColor: brand, backgroundColor: (c) => { const { ctx, chartArea } = c.chart; if (!chartArea) return brand + '22'; const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom); g.addColorStop(0, brand + '66'); g.addColorStop(1, brand + '00'); return g; }, fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 4, yAxisID: 'y' },
              { label: 'Orders', data: demo.orders, borderColor: blue, borderDash: [5, 4], tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, yAxisID: 'y1', backgroundColor: 'transparent' },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: true, labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 7, boxHeight: 7, padding: 18, color: text2, font: { family: 'Inter', size: 11.5, weight: 600 } } }, tooltip: tooltipStyle },
            scales: {
              x: { grid: { display: false }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 }, maxTicksLimit: 8 }, border: { display: false } },
              y: { position: 'left', grid: { color: borderSoft }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 }, maxTicksLimit: 5, callback: (v) => '₦' + fmtCompact(v) }, border: { display: false } },
              y1: { position: 'right', grid: { display: false }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 }, maxTicksLimit: 5 }, border: { display: false } },
            },
          },
        });
      }

      // Traffic & conversion
      const trafficEl = document.getElementById('chart-analytics-traffic');
      if (trafficEl) {
        new Chart(trafficEl, {
          type: 'line',
          data: {
            labels: days,
            datasets: [
              { label: 'Visitors', data: demo.visitors, borderColor: blue, backgroundColor: (c) => { const { ctx, chartArea } = c.chart; if (!chartArea) return blue + '22'; const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom); g.addColorStop(0, blue + '55'); g.addColorStop(1, blue + '00'); return g; }, fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 4, yAxisID: 'y' },
              { label: 'Conversion %', data: demo.conversion, borderColor: purple, tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, yAxisID: 'y1' },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: true, labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 7, boxHeight: 7, padding: 18, color: text2, font: { family: 'Inter', size: 11.5, weight: 600 } } }, tooltip: tooltipStyle },
            scales: {
              x: { grid: { display: false }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 }, maxTicksLimit: 8 }, border: { display: false } },
              y: { position: 'left', grid: { color: borderSoft }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 }, maxTicksLimit: 5 }, border: { display: false } },
              y1: { position: 'right', grid: { display: false }, ticks: { color: text3, font: { family: 'Inter', size: 10.5 }, maxTicksLimit: 5, callback: (v) => v + '%' }, border: { display: false } },
            },
          },
        });
      }

      // Payment methods
      const payEl = document.getElementById('chart-analytics-payments');
      if (payEl) makeDoughnut(payEl, ['Card', 'Bank Transfer', 'Paystack', 'Cash on Delivery'], demo.payments, [brand, blue, purple, amber]);

      // Top categories
      const catEl = document.getElementById('chart-analytics-categories');
      if (catEl) makeDoughnut(catEl, demo.categories.labels, demo.categories.data, [brand, blue, amber, purple, rose]);

      // Inventory health
      const invEl = document.getElementById('chart-analytics-inventory');
      if (invEl) makeDoughnut(invEl, demo.inventory.labels, demo.inventory.data, [brand, amber, rose, purple]);

      // Top products
      const prodEl = document.getElementById('chart-analytics-products');
      if (prodEl) makeBar(prodEl, demo.products.labels, demo.products.data, brand);

      // Customer growth
      const custEl = document.getElementById('chart-analytics-customers');
      if (custEl) makeLine(custEl, months, demo.customers, blue, { label: 'Customers' });

      // Prescription statistics
      const rxEl = document.getElementById('chart-analytics-prescriptions');
      if (rxEl) makeDoughnut(rxEl, demo.prescriptions.labels, demo.prescriptions.data, [amber, brand, rose, purple, '#94a3b8']);

      // Delivery performance
      const delEl = document.getElementById('chart-analytics-delivery');
      if (delEl) makeBar(delEl, demo.delivery.labels, demo.delivery.data, blue);
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__analyticsBooted) { window.__analyticsBooted = true; initAnalytics(); } }, 300);
  }
})();

