<?php
$page_title = 'Log In';
$body_class = 'page-login';
include __DIR__ . '/includes/header.php';
?>

<section class="auth-page">
  <div class="container">
    <div class="auth-card">
      <div class="auth-header">
        <img src="/foodfusion/assets/images/food-svgrepo-com.svg" alt="" class="auth-logo" aria-hidden="true">
        <div>
          <h2>Welcome back</h2>
          <p class="subtitle">Log in to your FoodFusion account</p>
        </div>
      </div>

      <div id="login-msg"></div>
      <div id="lock-timer" class="alert alert-warning hidden"></div>

      <form id="login-form">
        <div class="form-group">
          <label for="login-email">Email address</label>
          <div class="field-shell">
            <span class="field-icon"><i class="fas fa-envelope"></i></span>
            <input id="login-email" type="email" name="email" required autocomplete="email" placeholder="you@example.com">
          </div>
        </div>

        <div class="form-group">
          <label for="login-password">Password</label>
          <div class="field-shell">
            <span class="field-icon"><i class="fas fa-lock"></i></span>
            <input id="login-password" type="password" name="password" required autocomplete="current-password" placeholder="••••••••">
          </div>
          <div class="field-toggle-row">
            <label class="field-toggle"><input type="checkbox" id="show-login-password"> Show password</label>
          </div>
        </div>

        <label class="field-check">
          <input type="checkbox" name="admin_login" id="admin-login" value="1">
          Log in as admin
        </label>

        <button type="submit" class="btn btn-primary w-full btn-auth" id="login-btn">Log in</button>
      </form>

      <hr>
      <div class="auth-footer-note">
        Don't have an account? <a href="/foodfusion/register.php">Sign up free</a>
      </div>

      <div class="auth-tips">
        Demo credentials: <strong>maria@example.com</strong> / <strong>password</strong>
      </div>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
checkAuth().then(user => {
  if (user) window.location.href = '/foodfusion/';
});

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'Logging in…';
  const msgEl = document.getElementById('login-msg');
  const body = Object.fromEntries(new FormData(e.target));
  const wantsAdmin = document.getElementById('admin-login')?.checked;

  const data = await API.post('login.php', body);

  if (data.success) {
    toast('Welcome back!', 'success');
    const target = wantsAdmin ? '/foodfusion/admin.php' : '/foodfusion/';
    setTimeout(() => { window.location.href = target; }, 600);
  } else {
    if (data.locked) {
      const lockEl = document.getElementById('lock-timer');
      lockEl.classList.remove('hidden');
      lockEl.textContent = `Account temporarily locked. Try again in ${data.remaining_minutes} minute(s).`;
    } else {
      let msg = data.message;
      if (typeof data.attempts_left !== 'undefined' && data.attempts_left > 0) {
        msg += ` (${data.attempts_left} attempt${data.attempts_left !== 1 ? 's' : ''} remaining)`;
      }
      msgEl.innerHTML = `<div class="alert alert-danger">${msg}</div>`;
    }
    btn.disabled = false;
    btn.textContent = 'Log in';
  }
});

document.getElementById('show-login-password')?.addEventListener('change', e => {
  const input = document.querySelector('input[name="password"]');
  if (input) input.type = e.target.checked ? 'text' : 'password';
});
</script>
