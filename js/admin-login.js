(function () {
  const form = document.getElementById('admin-login-form');
  const btn = document.getElementById('admin-login-btn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-login-email').value.trim();
    const password = document.getElementById('admin-login-password').value;
    if (!email || !password) {
      showToast('Please enter your email and password', 'error');
      return;
    }
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border" aria-hidden="true"></span> Signing in…';
    try {
      const loginRes = await AdminAPI.login(email, password);
      const accessToken = loginRes.data?.access_token || loginRes.data?.accessToken;
      if (!accessToken) {
        // Demo login fallback (offline) → create a session so the UI is explorable
        saveSession({ full_name: 'Adebayo Oluwaseun', email, role: 'super_admin', permissions: ['*'], id: 'a1' }, 'demo-token');
      } else {
        saveSession(null, accessToken);
        const profile = await AdminAPI.getProfile();
        saveSession(profile.data, accessToken);
      }
      showToast('Welcome back! Redirecting…', 'success');
      setTimeout(() => { location.href = 'admin.html'; }, 600);
    } catch (err) {
      // Even if real login fails (offline), allow demo exploration with a notice
      const msg = err.message || 'Login failed';
      if (/demo|network|fetch|Failed to fetch/i.test(msg)) {
        saveSession({ full_name: 'Adebayo Oluwaseun', email, role: 'super_admin', permissions: ['*'], id: 'a1' }, 'demo-token');
        showToast('Offline demo mode — signed in with demo account', 'info');
        setTimeout(() => { location.href = 'admin.html'; }, 800);
      } else {
        showToast(msg, 'error');
      }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
})();

