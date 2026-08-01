(function () {
  requireAuth();

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  const contentHtml = `
    <div class="admin-tabs" id="admin-settings-tabs">
      <button class="admin-tab active" data-tab="general">General</button>
      <button class="admin-tab" data-tab="branding">Branding</button>
      <button class="admin-tab" data-tab="smtp">SMTP</button>
      <button class="admin-tab" data-tab="payments">Payments</button>
      <button class="admin-tab" data-tab="delivery">Delivery</button>
      <button class="admin-tab" data-tab="security">Security</button>
      <button class="admin-tab" data-tab="seo">SEO</button>
    </div>
    <div id="admin-tab-general" class="admin-tab-content active">
      <div class="admin-form-panel">
        <h2>Store Information</h2>
        <div class="form-row">
          <div class="form-group"><label>Store Name</label><input type="text" id="setting-store-name" value="Just Drugs"></div>
          <div class="form-group"><label>Store Email</label><input type="email" id="setting-store-email" value="support@justdrugs.com"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Phone</label><input type="text" id="setting-store-phone" value="+234 800 000 0000"></div>
          <div class="form-group"><label>Currency</label><input type="text" id="setting-store-currency" value="₦"></div>
        </div>
        <div class="form-group"><label>Address</label><textarea id="setting-store-address" rows="2">Lagos, Nigeria</textarea></div>
        <div class="form-actions"><button class="btn btn-secondary">Cancel</button><button class="btn btn-primary" id="admin-save-general-btn">Save Changes</button></div>
      </div>
    </div>
    <div id="admin-tab-branding" class="admin-tab-content">
      <div class="admin-form-panel">
        <h2>Branding</h2>
        <div class="form-group"><label>Logo URL</label><input type="text" id="setting-logo" value="" placeholder="https://..."></div>
        <div class="form-group"><label>Favicon URL</label><input type="text" id="setting-favicon" value="" placeholder="https://..."></div>
        <div class="form-actions"><button class="btn btn-secondary">Cancel</button><button class="btn btn-primary" id="admin-save-branding-btn">Save Changes</button></div>
      </div>
    </div>
    <div id="admin-tab-smtp" class="admin-tab-content">
      <div class="admin-form-panel">
        <h2>SMTP Configuration</h2>
        <div class="form-row">
          <div class="form-group"><label>SMTP Host</label><input type="text" id="setting-smtp-host" placeholder="smtp.example.com"></div>
          <div class="form-group"><label>SMTP Port</label><input type="number" id="setting-smtp-port" value="587"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Username</label><input type="text" id="setting-smtp-user"></div>
          <div class="form-group"><label>Password</label><input type="password" id="setting-smtp-pass"></div>
        </div>
        <div class="form-actions"><button class="btn btn-secondary">Cancel</button><button class="btn btn-primary" id="admin-save-smtp-btn">Save Changes</button></div>
      </div>
    </div>
    <div id="admin-tab-payments" class="admin-tab-content">
      <div class="admin-form-panel">
        <h2>Payment Gateway (Paystack)</h2>
        <div class="form-group"><label>Public Key</label><input type="text" id="setting-paystack-key" placeholder="pk_test_..."></div>
        <div class="form-group"><label>Secret Key</label><input type="password" id="setting-paystack-secret" placeholder="sk_test_..."></div>
        <div class="form-actions"><button class="btn btn-secondary">Cancel</button><button class="btn btn-primary" id="admin-save-payments-btn">Save Changes</button></div>
      </div>
    </div>
    <div id="admin-tab-delivery" class="admin-tab-content">
      <div class="admin-form-panel">
        <h2>Delivery Settings</h2>
        <div class="form-group"><label>Default Delivery Fee (₦)</label><input type="number" id="setting-delivery-fee" value="1500"></div>
        <div class="form-group"><label>Free Delivery Threshold (₦)</label><input type="number" id="setting-free-delivery" value="20000"></div>
        <div class="form-actions"><button class="btn btn-secondary">Cancel</button><button class="btn btn-primary" id="admin-save-delivery-btn">Save Changes</button></div>
      </div>
    </div>
    <div id="admin-tab-security" class="admin-tab-content">
      <div class="admin-form-panel">
        <h2>Security</h2>
        <div class="form-group"><label>Two-Factor Authentication</label><label class="admin-switch"><input type="checkbox"><span class="admin-switch-slider"></span></label></div>
        <div class="form-group"><label>Maintenance Mode</label><label class="admin-switch"><input type="checkbox"><span class="admin-switch-slider"></span></label></div>
        <div class="form-actions"><button class="btn btn-secondary">Cancel</button><button class="btn btn-primary" id="admin-save-security-btn">Save Changes</button></div>
      </div>
    </div>
    <div id="admin-tab-seo" class="admin-tab-content">
      <div class="admin-form-panel">
        <h2>SEO Settings</h2>
        <div class="form-group"><label>Meta Title</label><input type="text" id="setting-seo-title" value="Just Drugs - Online Pharmacy"></div>
        <div class="form-group"><label>Meta Description</label><textarea id="setting-seo-desc" rows="2">Your trusted online pharmacy for quality medicines and healthcare products.</textarea></div>
        <div class="form-actions"><button class="btn btn-secondary">Cancel</button><button class="btn btn-primary" id="admin-save-seo-btn">Save Changes</button></div>
      </div>
    </div>
  `;

  initAppShell('Settings', 'Configure your store', contentHtml, { actions: '', page: 'settings' });

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`admin-tab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });

  document.getElementById('admin-save-general-btn')?.addEventListener('click', () => showToast('Settings saved', 'success'));
  document.getElementById('admin-save-branding-btn')?.addEventListener('click', () => showToast('Branding saved', 'success'));
  document.getElementById('admin-save-smtp-btn')?.addEventListener('click', () => showToast('SMTP settings saved', 'success'));
  document.getElementById('admin-save-payments-btn')?.addEventListener('click', () => showToast('Payment settings saved', 'success'));
  document.getElementById('admin-save-delivery-btn')?.addEventListener('click', () => showToast('Delivery settings saved', 'success'));
  document.getElementById('admin-save-security-btn')?.addEventListener('click', () => showToast('Security settings saved', 'success'));
  document.getElementById('admin-save-seo-btn')?.addEventListener('click', () => showToast('SEO settings saved', 'success'));
})();
