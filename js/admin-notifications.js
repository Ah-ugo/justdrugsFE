/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Notifications module
   Email templates grid, announcements table, SMTP settings,
   and a compose broadcast modal with live preview.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, esc, fmtDate, showToast, openModal } = JD;

  const templates = [
    { key: 'order_confirmation', name: 'Order Confirmation', desc: 'Sent when a customer places an order', status: 'active', color: '#10b981' },
    { key: 'prescription_approved', name: 'Prescription Approved', desc: 'Pharmacist approved a prescription', status: 'active', color: '#3b82f6' },
    { key: 'delivery_updates', name: 'Delivery Updates', desc: 'Tracking and delivery status emails', status: 'active', color: '#8b5cf6' },
    { key: 'promotional', name: 'Promotional / Marketing', desc: 'Campaigns, discounts and offers', status: 'draft', color: '#f59e0b' },
  ];
  const announcements = [
    { title: 'New: Free delivery over ₦25,000', audience: 'All customers', channel: 'Email + Push', status: 'sent', sent: '12,400', opened: '6,832' },
    { title: 'Vaccination drive in Lagos', audience: 'Lagos customers', channel: 'Email', status: 'sent', sent: '3,210', opened: '1,548' },
    { title: 'Maintenance window tonight', audience: 'Internal', channel: 'System', status: 'scheduled', sent: '—', opened: '—' },
  ];

  window.__pageContentRendered = function () { initNotifications(); };

  function initNotifications() {
    document.getElementById('ntf-compose-btn').addEventListener('click', openCompose);

    document.querySelectorAll('#ntf-tabs .tab').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('#ntf-tabs .tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`ntf-${t.dataset.tab}`).classList.add('active');
      });
    });

    renderTemplates();
    renderAnnouncements();
    document.querySelectorAll('#ntf-smtp .btn-primary, #ntf-smtp .btn-secondary').forEach(b => {
      b.addEventListener('click', () => {
        if (b.textContent.includes('Test')) { showToast('Test email sent to your inbox', 'success'); }
        else showToast('SMTP configuration saved', 'success');
      });
    });
  }

  function renderTemplates() {
    const grid = document.getElementById('ntf-templates-grid');
    grid.innerHTML = templates.map(t => `
      <div class="card card-hover">
        <div class="flex items-center justify-between mb-16">
          <div style="width:42px;height:42px;border-radius:12px;background:${t.color}14;display:flex;align-items:center;justify-content:center;color:${t.color}">${icon('mail', 20)}</div>
          <span class="badge ${t.status === 'active' ? 'badge-success' : 'badge-gray'}">${t.status === 'active' ? 'Active' : 'Draft'}</span>
        </div>
        <div class="table-cell-primary mb-6">${esc(t.name)}</div>
        <div class="text-sm text-2 mb-16">${esc(t.desc)}</div>
        <div class="flex gap-8">
          <button class="btn btn-sm btn-secondary act-edit">${icon('edit', 13)} Edit</button>
          <button class="btn btn-sm btn-secondary act-preview">${icon('eye', 13)} Preview</button>
        </div>
      </div>`).join('');

    grid.querySelectorAll('.act-edit').forEach(b => b.addEventListener('click', () => {
      const t = templates[Array.from(grid.querySelectorAll('.card')).indexOf(b.closest('.card'))];
      openModal(`
        <div class="modal-head"><div><h3 class="modal-title">Edit Template</h3><p class="modal-subtitle">${esc(t.name)}</p></div><button class="modal-close">${icon('x', 16)}</button></div>
        <div class="modal-body">
          <div class="field"><label class="field-required">Subject</label><input class="input" value="Your Just Drugs order has been confirmed"></div>
          <div class="field"><label>HTML body</label><textarea class="input" rows="8" style="font-family:ui-monospace,monospace;font-size:12.5px"><!-- {{customer_name}} {{order_number}} {{total}} --></textarea></div>
          <div class="field"><label>Placeholders</label><div class="text-xs text-3" style="line-height:1.9">Use <code>{{customer_name}}</code> <code>{{order_number}}</code> <code>{{total_amount}}</code> <code>{{link}}</code></div></div>
        </div>
        <div class="modal-foot"><button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-close>Save Template</button></div>
      `);
      document.querySelectorAll('.modal-foot .btn-primary').forEach(x => x.addEventListener('click', () => showToast('Template saved', 'success')));
    }));
    grid.querySelectorAll('.act-preview').forEach(b => b.addEventListener('click', () => {
      const t = templates[Array.from(grid.querySelectorAll('.card')).indexOf(b.closest('.card'))];
      openModal(`
        <div class="modal-head"><div><h3 class="modal-title">Email Preview</h3><p class="modal-subtitle">${esc(t.name)} — rendered template</p></div><button class="modal-close">${icon('x', 16)}</button></div>
        <div class="modal-body" style="padding:0;background:var(--surface-2)">
          <div style="max-height:420px;overflow:auto;padding:22px">
            <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:var(--shadow-sm)">
              <div style="background:#0f172a;padding:26px 30px;display:flex;align-items:center;justify-content:space-between">
                <span style="color:#fff;font-weight:800;font-size:17px">⚕ Just Drugs</span>
                <span style="color:#94a3b8;font-size:12px">no-reply@justdrugs.com</span>
              </div>
              <div style="padding:30px">
                <div style="font-weight:800;font-size:20px;margin-bottom:10px">Hello Ada,</div>
                <p style="color:#475569;font-size:14.5px;line-height:1.7">Your order <b>JD-20250421-8F3K2A</b> has been confirmed. We're preparing your items now and will notify you once dispatched.</p>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin:22px 0">
                  <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:#64748b">Subtotal</span><b>₦18,500</b></div>
                  <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:#64748b">Delivery</span><b>₦1,500</b></div>
                  <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #e2e8f0;margin-top:8px"><span style="color:#64748b">Total</span><b style="color:#10b981;font-size:17px">₦20,000</b></div>
                </div>
                <a href="#" style="display:inline-block;background:#10b981;color:#fff;border-radius:10px;padding:11px 22px;font-weight:700;font-size:14px;text-decoration:none">Track Order</a>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-foot"><button class="btn btn-primary" data-close>Close</button></div>
      `);
    }));
  }

  function renderAnnouncements() {
    const tbody = document.getElementById('ntf-announcements-tbody');
    tbody.innerHTML = announcements.map(a => `
      <tr>
        <td><span class="table-cell-primary">${esc(a.title)}</span></td>
        <td>${esc(a.audience)}</td>
        <td><span class="badge badge-info">${esc(a.channel)}</span></td>
        <td>${a.status === 'sent' ? '<span class="badge badge-success">Sent</span>' : '<span class="badge badge-warning">Scheduled</span>'}</td>
        <td class="num">${esc(a.sent)}</td>
        <td class="num">${esc(a.opened)}</td>
        <td><div class="row-actions"><button class="row-action-btn">${icon('eye', 14)}</button></div></td>
      </tr>`).join('');
  }

  function openCompose() {
    openModal(`
      <div class="modal-head"><div><h3 class="modal-title">Compose Broadcast</h3><p class="modal-subtitle">Send a promotional or transactional message</p></div><button class="modal-close">${icon('x', 16)}</button></div>
      <div class="modal-body">
        <div class="field"><label class="field-required">Audience</label>
          <select class="select">
            <option>All customers</option><option>Prescription customers</option><option>Lagos zone</option><option>VIP (spend > ₦100k)</option>
          </select>
        </div>
        <div class="field"><label class="field-required">Channel</label>
          <div class="flex gap-8 wrap">
            <button class="btn btn-sm btn-secondary active">Email</button>
            <button class="btn btn-sm btn-secondary">Push</button>
            <button class="btn btn-sm btn-secondary">In-app banner</button>
          </div>
        </div>
        <div class="field"><label class="field-required">Subject</label><input class="input" placeholder="Big savings on your pharmacy essentials"></div>
        <div class="field"><label>Message body</label><textarea class="input" rows="5" placeholder="Hello {{customer_name}}, get 15% off…"></textarea></div>
        <div class="list-row"><div><div class="list-row-label">Schedule send</div><div class="list-row-desc">Send immediately if off</div></div><button class="switch"></button></div>
      </div>
      <div class="modal-foot"><button class="btn btn-secondary" data-close>Save Draft</button><button class="btn btn-primary">Send Broadcast</button></div>
    `, { size: 'lg' });
    document.querySelectorAll('.modal-foot .btn-primary').forEach(b => b.addEventListener('click', () => {
      showToast('Broadcast queued for delivery', 'success');
      document.querySelector('.modal-backdrop.open')?.remove();
    }));
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__ntfBooted) { window.__ntfBooted = true; initNotifications(); } }, 300);
  }
})();

