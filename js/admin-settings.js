/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Settings module
   Tabbed settings: General, Branding, SEO, Delivery, Taxes,
   Payments, SMTP, Cloudinary, Security, Roles & Permissions.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, esc, showToast, confirmDialog } = JD;

  const roles = [
    { role: 'Super Admin', perms: [true, true, true, true, true] },
    { role: 'Admin', perms: [true, true, true, true, false] },
    { role: 'Pharmacist', perms: [true, true, true, false, false] },
    { role: 'Inventory Manager', perms: [true, false, false, true, false] },
    { role: 'Delivery Manager', perms: [false, true, false, false, false] },
    { role: 'Customer Support', perms: [false, true, true, false, false] },
  ];

  window.__pageContentRendered = function () { initSettings(); };

  function initSettings() {
    renderRoles();
    bindNav();
    bindSwitches();

    document.getElementById('settings-save-btn').addEventListener('click', () => {
      showToast('Settings saved successfully', 'success');
    });
    document.getElementById('settings-reset-btn').addEventListener('click', async () => {
      const ok = await confirmDialog('Reset all settings to defaults? This cannot be undone.', { variant: 'danger', confirmText: 'Reset' });
      if (ok) showToast('Settings reset to defaults', 'warning');
    });
    document.getElementById('st-test-email')?.addEventListener('click', () => {
      showToast('Test email sent to your inbox', 'success');
    });
  }

  function bindNav() {
    const items = document.querySelectorAll('.settings-nav-item');
    const panels = document.querySelectorAll('.settings-panel');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        panels.forEach(p => p.classList.remove('active'));
        const panel = document.querySelector(`.settings-panel[data-panel="${item.dataset.tab}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  }

  function bindSwitches() {
    document.querySelectorAll('.settings-panel .switch').forEach(s => {
      s.addEventListener('click', () => s.classList.toggle('on'));
    });
  }

  function renderRoles() {
    const tbody = document.getElementById('roles-tbody');
    if (!tbody) return;
    tbody.innerHTML = roles.map(r => `
      <tr>
        <td><span class="table-cell-primary">${esc(r.role)}</span></td>
        ${r.perms.map(p => `<td>${p
          ? `<span class="badge badge-success" title="Allowed"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>`
          : `<span class="badge badge-gray" title="Restricted">—</span>`}</td>`).join('')}
      </tr>`).join('');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__settingsBooted) { window.__settingsBooted = true; initSettings(); } }, 300);
  }
})();

