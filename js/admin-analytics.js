(function () {
  requireAuth();

  const demoData = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    revenue: [120000, 180000, 150000, 220000, 190000, 280000, 310000],
    orders: [45, 62, 55, 78, 68, 92, 105],
    visitors: [1200, 1500, 1300, 1800, 1600, 2200, 2500],
    conversion: [2.4, 3.1, 2.8, 3.5, 3.2, 4.1, 4.5],
    topProducts: [
      { name: 'Paracetamol 500mg', sold: 1240 },
      { name: 'Amoxicillin 250mg', sold: 980 },
      { name: 'Vitamin C 1000mg', sold: 856 },
      { name: 'Cough Syrup 200ml', sold: 720 },
      { name: 'Insulin Glargine', sold: 640 },
      { name: 'Metformin 500mg', sold: 590 },
    ],
    topCategories: [
      { name: 'Antibiotics', pct: 35 },
      { name: 'Pain Relief', pct: 25 },
      { name: 'Vitamins', pct: 18 },
      { name: 'Diabetes', pct: 12 },
      { name: 'First Aid', pct: 10 },
    ],
  };

  const contentHtml = `
    <div class="admin-kpi-grid">
      <div class="admin-kpi-card"><div class="admin-kpi-icon brand">${Icons.reports}</div><div class="admin-kpi-body"><div class="admin-kpi-label">Revenue (7d)</div><div class="admin-kpi-value">${formatCurrency(1450000)}</div><div class="admin-kpi-trend up">${Icons.arrowUp} 12.4%</div></div></div>
      <div class="admin-kpi-card"><div class="admin-kpi-icon blue">${Icons.orders}</div><div class="admin-kpi-body"><div class="admin-kpi-label">Orders (7d)</div><div class="admin-kpi-value">500</div><div class="admin-kpi-trend up">${Icons.arrowUp} 8.2%</div></div></div>
      <div class="admin-kpi-card"><div class="admin-kpi-icon amber">${Icons.customers}</div><div class="admin-kpi-body"><div class="admin-kpi-label">Visitors (7d)</div><div class="admin-kpi-value">12,100</div><div class="admin-kpi-trend up">${Icons.arrowUp} 5.7%</div></div></div>
      <div class="admin-kpi-card"><div class="admin-kpi-icon brand">${Icons.analytics}</div><div class="admin-kpi-body"><div class="admin-kpi-label">Conversion</div><div class="admin-kpi-value">3.4%</div><div class="admin-kpi-trend up">${Icons.arrowUp} 0.3%</div></div></div>
    </div>
    <div class="admin-grid-2" style="margin-bottom:20px">
      <div class="admin-panel">
        <div class="admin-panel-header"><div><div class="admin-panel-title">Revenue & Orders</div><div class="admin-panel-subtitle">Last 7 days</div></div></div>
        <div style="height:280px"><canvas id="chart-analytics-revenue"></canvas></div>
      </div>
      <div class="admin-panel">
        <div class="admin-panel-header"><div><div class="admin-panel-title">Traffic & Conversion</div><div class="admin-panel-subtitle">Visitors vs conversion rate</div></div></div>
        <div style="height:280px"><canvas id="chart-analytics-traffic"></canvas></div>
      </div>
    </div>
    <div class="admin-grid-2" style="margin-bottom:20px">
      <div class="admin-panel">
        <div class="admin-panel-header"><div><div class="admin-panel-title">Top Products</div><div class="admin-panel-subtitle">By units sold</div></div></div>
        <div style="height:280px"><canvas id="chart-analytics-products"></canvas></div>
      </div>
      <div class="admin-panel">
        <div class="admin-panel-header"><div><div class="admin-panel-title">Category Distribution</div><div class="admin-panel-subtitle">By sales share</div></div></div>
        <div style="height:280px"><canvas id="chart-analytics-categories"></canvas></div>
      </div>
    </div>
  `;

  initAppShell('Analytics', 'Interactive dashboards for revenue, orders, customers and more', contentHtml, { actions: '', page: 'analytics' });

  ensureChartJs().then(() => {
    const revCanvas = document.getElementById('chart-analytics-revenue');
    if (revCanvas) createSalesLineChart(revCanvas, demoData.labels, demoData.revenue, { secondSeries: demoData.orders, primaryLabel: 'Revenue (₦)', secondLabel: 'Orders' });
    const trafficCanvas = document.getElementById('chart-analytics-traffic');
    if (trafficCanvas) createAreaChart(trafficCanvas, demoData.labels, demoData.visitors, { label: 'Visitors', color: '#3b82f6' });
    const prodCanvas = document.getElementById('chart-analytics-products');
    if (prodCanvas) createHorizontalBar(prodCanvas, demoData.topProducts.map(p => p.name), demoData.topProducts.map(p => p.sold));
    const catCanvas = document.getElementById('chart-analytics-categories');
    if (catCanvas) createDoughnutChart(catCanvas, demoData.topCategories.map(c => c.name), demoData.topCategories.map(c => c.pct));
  });
})();
