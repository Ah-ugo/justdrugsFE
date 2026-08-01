(function () {
  const session = requireAuth();
  const form = document.getElementById('admin-settings-form');

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    clearSession();
    location.href = 'admin-login.html';
  });

  async function load() {
    try {
      const data = await AdminAPI.getSettings();
      const s = data.data || data || {};
      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
      const setChecked = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
      setVal('setting-currency-symbol', s.currency_symbol);
      setVal('setting-currency-code', s.currency_code);
      setVal('setting-tax-rate', s.tax_rate_percent);
      setVal('setting-delivery-fee', s.default_delivery_fee);
      setVal('setting-free-delivery-threshold', s.free_delivery_threshold);
      setChecked('setting-maintenance-mode', s.maintenance_mode);
      setChecked('setting-enable-prescriptions', s.enable_prescriptions);
    } catch (err) {
      showToast(err.message || 'Failed to load settings', 'error');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      currency_symbol: document.getElementById('setting-currency-symbol').value.trim(),
      currency_code: document.getElementById('setting-currency-code').value.trim(),
      tax_rate_percent: Number(document.getElementById('setting-tax-rate').value) || 0,
      default_delivery_fee: Number(document.getElementById('setting-delivery-fee').value) || 0,
      free_delivery_threshold: Number(document.getElementById('setting-free-delivery-threshold').value) || 0,
      maintenance_mode: document.getElementById('setting-maintenance-mode').checked,
      enable_prescriptions: document.getElementById('setting-enable-prescriptions').checked,
    };
    try {
      await AdminAPI.updateSettings(payload);
      showToast('Settings saved', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    }
  });

  load();
})();
