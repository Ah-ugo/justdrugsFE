(function () {
  const form = document.getElementById('admin-login-form');
  const btn = document.getElementById('admin-login-btn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-login-email').value.trim();
    const password = document.getElementById('admin-login-password').value;
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Please wait…';
    try {
      const loginRes = await AdminAPI.login(email, password);
      const accessToken = loginRes.data.access_token;
      saveSession(null, accessToken);
      const profile = await AdminAPI.getProfile();
      saveSession(profile.data, accessToken);
      showToast('Welcome, ' + (profile.data.full_name || 'Admin'), 'success');
      location.href = 'admin-dashboard.html';
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
})();
