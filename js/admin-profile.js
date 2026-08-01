/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Profile module
   Personal account settings, notification preferences and
   recent activity for the signed-in administrator.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { showToast } = JD;

  window.__pageContentRendered = function () { initProfile(); };

  function initProfile() {
    // Hydrate from session if available
    const session = getSession();
    const admin = session?.admin;
    if (admin) {
      const nameEl = document.getElementById('prof-name');
      const full = document.getElementById('prof-full-name');
      const email = document.getElementById('prof-email');
      if (admin.full_name) { if (nameEl) nameEl.textContent = admin.full_name; if (full) full.value = admin.full_name; }
      if (admin.email && email) email.value = admin.email;
      const outer = document.querySelector('.avatar.xl.emerald');
      if (outer && admin.full_name) outer.textContent = JD.initials(admin.full_name);
    }

    // Switch toggles
    document.querySelectorAll('.switch').forEach(s => {
      s.addEventListener('click', () => s.classList.toggle('on'));
    });

    document.getElementById('profile-save-btn').addEventListener('click', () => {
      showToast('Profile updated successfully', 'success');
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__profileBooted) { window.__profileBooted = true; initProfile(); } }, 300);
  }
})();

