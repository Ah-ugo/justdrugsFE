(function () {
  if (localStorage.getItem('jd_admin_token')) {
    location.replace('admin.html');
  } else {
    location.replace('admin-login.html');
  }
})();
