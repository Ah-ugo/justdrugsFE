(function () {
  const session = requireAuth();
  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    clearSession();
    location.href = 'admin-login.html';
  });
})();
