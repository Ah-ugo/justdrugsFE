(function () {
  requireAuth();
  const session = getSession();
  const admin = session?.admin || {};

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => { clearSession(); location.href = 'admin-login.html'; });

  const contentHtml = `
    <div class="admin-grid-2">
      <div class="admin-panel">
        <div class="admin-panel-header"><div><div class="admin-panel-title">Profile Information</div></div></div>
        <div class="admin-form-panel" style="border:none;padding:0;margin:0;max-width:none">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
            <div class="admin-user-avatar" style="width:64px;height:64px;font-size:1.5rem;border-radius:var(--radius-lg)">${(admin.full_name || admin.email || 'U')[0].toUpperCase()}</div>
            <div>
              <div style="font-size:1.125rem;font-weight:700">${esc(admin.full_name || 'Admin User')}</div>
              <div class="text-sm text-muted">${esc(admin.role || 'Administrator')}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Full Name</label><input type="text" id="profile-name" value="${esc(admin.full_name || '')}"></div>
            <div class="form-group"><label>Email</label><input type="email" id="profile-email" value="${esc(admin.email || '')}" disabled></div>
          </div>
          <div class="form-group"><label>Phone</label><input type="text" id="profile-phone" value="${esc(admin.phone || '')}"></div>
          <div class="form-actions"><button class="btn btn-primary" id="admin-save-profile-btn">Save Changes</button></div>
        </div>
      </div>
      <div class="admin-panel">
        <div class="admin-panel-header"><div><div class="admin-panel-title">Change Password</div></div></div>
        <div class="admin-form-panel" style="border:none;padding:0;margin:0;max-width:none">
          <div class="form-group"><label>Current Password</label><input type="password" id="profile-current-pass" placeholder="Enter current password"></div>
          <div class="form-group"><label>New Password</label><input type="password" id="profile-new-pass" placeholder="Enter new password"></div>
          <div class="form-group"><label>Confirm New Password</label><input type="password" id="profile-confirm-pass" placeholder="Confirm new password"></div>
          <div class="form-actions"><button class="btn btn-primary" id="admin-change-pass-btn">Update Password</button></div>
        </div>
      </div>
    </div>
  `;

  initAppShell('Profile', 'Manage your account settings', contentHtml, { actions: '', page: 'profile' });

  document.getElementById('admin-save-profile-btn')?.addEventListener('click', () => showToast('Profile updated', 'success'));
  document.getElementById('admin-change-pass-btn')?.addEventListener('click', () => {
    const newPass = document.getElementById('profile-new-pass').value;
    const confirmPass = document.getElementById('profile-confirm-pass').value;
    if (!newPass) { showToast('Enter a new password', 'warning'); return; }
    if (newPass !== confirmPass) { showToast('Passwords do not match', 'error'); return; }
    showToast('Password updated successfully', 'success');
    document.getElementById('profile-current-pass').value = '';
    document.getElementById('profile-new-pass').value = '';
    document.getElementById('profile-confirm-pass').value = '';
  });
})();
