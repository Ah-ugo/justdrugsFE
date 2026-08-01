/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Chart.js helper layer
   Premium chart configurations with theme-aware colors.
═══════════════════════════════════════════════════════════ */

(function () {
  let Chart = null;
  const queue = [];

  window.JDChart = {
    load(cb) {
      if (Chart) { cb(Chart); return; }
      queue.push(cb);
      if (document.getElementById('jd-chart-script')) return;
      const script = document.createElement('script');
      script.id = 'jd-chart-script';
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
      script.onload = () => {
        Chart = window.Chart;
        window.ChartJS = Chart;
        queue.forEach(cb => { try { cb(Chart); } catch (e) { console.warn(e); } });
        queue.length = 0;
      };
      document.head.appendChild(script);
    },
  };

  // Resolve CSS var colors at render time
  function cssVar(name, fallback = '#10b981') {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function baseOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 7,
            boxHeight: 7,
            padding: 18,
            color: cssVar('--text-2', '#64748b'),
            font: { family: 'Inter, sans-serif', size: 11.5, weight: 600 },
          },
        },
        tooltip: {
          backgroundColor: cssVar('--gray-900', '#0f172a'),
          padding: 12,
          cornerRadius: 12,
          titleFont: { family: 'Inter', size: 12.5, weight: 700 },
          bodyFont: { family: 'Inter', size: 12 },
          boxPadding: 4,
          displayColors: true,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: cssVar('--text-3', '#94a3b8'), font: { family: 'Inter', size: 11 }, maxTicksLimit: 8 },
          border: { display: false },
        },
        y: {
          grid: { color: cssVar('--border-soft', '#eef2f6'), drawBorder: false },
          ticks: { color: cssVar('--text-3', '#94a3b8'), font: { family: 'Inter', size: 11 }, maxTicksLimit: 5 },
          border: { display: false },
        },
      },
    };
  }

  const helpers = {
    gradient(ctx, area, color) {
      if (!ctx || !area) return color;
      const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
      g.addColorStop(0, color + '55');
      g.addColorStop(1, color + '00');
      return g;
    },
  };

  window.JDChartHelpers = helpers;
})();

