/**
 * Just Drugs — Auth Manager
 * Handles sign-in / register modal, session state, and header user area.
 */

const Auth = (() => {
  let _user = null;

  // ─── DOM refs ────────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // ─── Persist / restore user ──────────────────────────────────────────────────
  function loadUser() {
    try {
      const raw = localStorage.getItem('jd_user');
      _user = raw ? JSON.parse(raw) : null;
    } catch (_) { _user = null; }
  }

  function saveUser(user) {
    _user = user;
    if (user) localStorage.setItem('jd_user', JSON.stringify(user));
    else       localStorage.removeItem('jd_user');
  }

  // ─── UI updaters ─────────────────────────────────────────────────────────────
  function renderAuthArea() {
    const area = $('auth-area');
    if (!area) return;
    if (_user) {
      const name = _user.first_name || _user.email?.split('@')[0] || 'You';
      area.innerHTML = `
        <div class="user-menu" id="user-menu">
          <button class="nav-btn nav-btn-auth" id="user-menu-btn" aria-haspopup="true" aria-expanded="false">
            <span class="user-avatar">${name[0].toUpperCase()}</span>
            <span>${name}</span>
          </button>
          <div class="user-dropdown" id="user-dropdown" hidden role="menu">
            <a href="#" class="dropdown-item" role="menuitem"><i data-feather="user"></i> My Account</a>
            <a href="#" class="dropdown-item" role="menuitem"><i data-feather="shopping-bag"></i> My Orders</a>
            <a href="#" class="dropdown-item" role="menuitem"><i data-feather="heart"></i> Wishlist</a>
            <hr>
            <button class="dropdown-item text-danger" id="logout-btn" role="menuitem"><i data-feather="log-out"></i> Sign Out</button>
          </div>
        </div>`;
      feather.replace();

      $('user-menu-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const dd = $('user-dropdown');
        const expanded = dd.hidden === false;
        dd.hidden = expanded;
        $('user-menu-btn').setAttribute('aria-expanded', !expanded);
      });
      $('logout-btn')?.addEventListener('click', () => {
        Auth.logout();
      });
    } else {
      area.innerHTML = `
        <button class="nav-btn nav-btn-auth" id="login-btn">
          <i data-feather="user"></i><span>Sign In</span>
        </button>`;
      feather.replace();
      $('login-btn')?.addEventListener('click', () => Auth.openModal());
    }
  }

  // ─── Modal helpers ────────────────────────────────────────────────────────────
  function setLoading(btnId, loading) {
    const btn = $(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait…' : btn.dataset.origText;
  }

  function showPanel(panel) {
    $('login-panel').hidden  = panel !== 'login';
    $('register-panel').hidden = panel !== 'register';
    $('login-tab').classList.toggle('active', panel === 'login');
    $('register-tab').classList.toggle('active', panel === 'register');
    $('login-tab').setAttribute('aria-selected', panel === 'login');
    $('register-tab').setAttribute('aria-selected', panel === 'register');
  }

  // ─── Public ───────────────────────────────────────────────────────────────────
  return {
    init() {
      loadUser();
      renderAuthArea();
      this._bindModal();
      this._bindPasswordToggles();
    },

    _bindModal() {
      // Tabs
      $('login-tab')?.addEventListener('click', () => showPanel('login'));
      $('register-tab')?.addEventListener('click', () => showPanel('register'));
      $('switch-to-register')?.addEventListener('click', (e) => { e.preventDefault(); showPanel('register'); });
      $('switch-to-login')?.addEventListener('click', (e) => { e.preventDefault(); showPanel('login'); });

      // Close
      $('auth-modal-close')?.addEventListener('click', () => this.closeModal());
      $('auth-overlay')?.addEventListener('click', () => this.closeModal());

      // Mobile login btn
      $('mobile-login-btn')?.addEventListener('click', () => this.openModal());

      // Login form
      const loginForm = $('login-form');
      if (loginForm) {
        const btn = $('login-submit-btn');
        if (btn) btn.dataset.origText = btn.textContent;
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = $('login-email').value.trim();
          const password = $('login-password').value;
          setLoading('login-submit-btn', true);
          try {
            const data = await AuthAPI.login(email, password);
            saveUser(data.user || { email });
            renderAuthArea();
            this.closeModal();
            showToast(`Welcome back! 👋`, 'success');
            Cart.sync();
          } catch (err) {
            showToast(err.message || 'Login failed', 'error');
          } finally {
            setLoading('login-submit-btn', false);
          }
        });
      }

      // Register form
      const regForm = $('register-form');
      if (regForm) {
        const btn = $('register-submit-btn');
        if (btn) btn.dataset.origText = btn.textContent;
        regForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const payload = {
            first_name: $('reg-first-name').value.trim(),
            last_name:  $('reg-last-name').value.trim(),
            email:      $('reg-email').value.trim(),
            phone:      $('reg-phone').value.trim(),
            password:   $('reg-password').value,
          };
          setLoading('register-submit-btn', true);
          try {
            const data = await AuthAPI.register(payload);
            saveUser(data.user || { email: payload.email, first_name: payload.first_name });
            renderAuthArea();
            this.closeModal();
            showToast(`Account created! Welcome to Just Drugs 🎉`, 'success');
          } catch (err) {
            showToast(err.message || 'Registration failed', 'error');
          } finally {
            setLoading('register-submit-btn', false);
          }
        });
      }

      // Close dropdown on outside click
      document.addEventListener('click', () => {
        const dd = $('user-dropdown');
        if (dd) {
          dd.hidden = true;
          $('user-menu-btn')?.setAttribute('aria-expanded', 'false');
        }
      });
    },

    _bindPasswordToggles() {
      document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const wrapper = btn.closest('.password-wrapper');
          const input = wrapper?.querySelector('input');
          if (!input) return;
          const isHidden = input.type === 'password';
          input.type = isHidden ? 'text' : 'password';
          btn.innerHTML = isHidden
            ? '<i data-feather="eye-off"></i>'
            : '<i data-feather="eye"></i>';
          feather.replace();
        });
      });
    },

    openModal(panel = 'login') {
      showPanel(panel);
      $('auth-modal')?.classList.add('open');
      $('auth-overlay')?.classList.add('visible');
      document.body.style.overflow = 'hidden';
      setTimeout(() => $('login-email')?.focus(), 100);
    },

    closeModal() {
      $('auth-modal')?.classList.remove('open');
      $('auth-overlay')?.classList.remove('visible');
      document.body.style.overflow = '';
    },

    logout() {
      AuthAPI.logout();
      saveUser(null);
      renderAuthArea();
      showToast('You have been signed out', 'info');
      Cart.sync();
    },

    getUser() { return _user; },
    isLoggedIn() { return !!_user; },
  };
})();
