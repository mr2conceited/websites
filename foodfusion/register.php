<?php
$page_title = 'Sign Up';
$body_class = 'page-sign-up';
include __DIR__ . '/includes/header.php';
?>

<section class="auth-page">
  <div class="container">
    <div class="auth-card" style="max-width:560px">
      <div class="auth-header">
        <img src="/foodfusion/assets/images/food-svgrepo-com.svg" alt="" class="auth-logo" aria-hidden="true">
        <div>
          <h2>Join FoodFusion</h2>
          <p class="subtitle">Create a free account and start sharing</p>
        </div>
      </div>

      <div id="reg-msg"></div>

      <form id="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="first-name">First Name *</label>
            <div class="field-shell">
              <span class="field-icon"><i class="fas fa-user"></i></span>
              <input id="first-name" type="text" name="first_name" required placeholder="Jane">
            </div>
          </div>
          <div class="form-group">
            <label for="last-name">Last Name *</label>
            <div class="field-shell">
              <span class="field-icon"><i class="fas fa-user"></i></span>
              <input id="last-name" type="text" name="last_name" required placeholder="Smith">
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="reg-email">Email address *</label>
          <div class="field-shell">
            <span class="field-icon"><i class="fas fa-envelope"></i></span>
            <input id="reg-email" type="email" name="email" required placeholder="jane@example.com">
          </div>
        </div>

        <div class="form-group">
          <label for="reg-password">Password *</label>
          <div class="field-shell">
            <span class="field-icon"><i class="fas fa-lock"></i></span>
            <input type="password" name="password" id="reg-password" required placeholder="••••••••">
          </div>
          <div class="field-toggle-row">
            <label class="field-toggle"><input type="checkbox" id="show-register-passwords"> Show password</label>
          </div>
          <span class="form-help">Min 8 chars, one uppercase, one lowercase, one number</span>
        </div>

        <div class="form-group">
          <label for="reg-confirm">Confirm Password *</label>
          <div class="field-shell">
            <span class="field-icon"><i class="fas fa-lock"></i></span>
            <input type="password" id="reg-confirm" required placeholder="••••••••">
          </div>
        </div>

        <div class="form-group">
          <label for="reg-bio">Bio <span class="text-muted" style="font-weight:400">(optional)</span></label>
          <div class="field-shell" style="align-items:flex-start; padding-top:12px; padding-bottom:12px;">
            <span class="field-icon"><i class="fas fa-pen"></i></span>
            <textarea id="reg-bio" name="bio" rows="3" placeholder="Tell the community a bit about yourself and your cooking style…"></textarea>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-full btn-auth" id="reg-btn">Create Account</button>
      </form>

      <hr>
      <div class="auth-footer-note">
        Already have an account? <a href="/foodfusion/login.php">Log in</a>
      </div>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
checkAuth().then(user => { if (user) window.location.href = '/foodfusion/'; });

document.getElementById('register-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('reg-btn');
  const msgEl = document.getElementById('reg-msg');
  const pw = document.getElementById('reg-password').value;
  const conf = document.getElementById('reg-confirm').value;

  if (pw !== conf) {
    msgEl.innerHTML = '<div class="alert alert-danger">Passwords do not match.</div>';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating account…';
  const body = Object.fromEntries(new FormData(e.target));

  const data = await API.post('register.php', body);

  if (data.success) {
    msgEl.innerHTML = '<div class="alert alert-success">Account created! Redirecting to login…</div>';
    setTimeout(() => { window.location.href = '/foodfusion/login.php'; }, 1200);
  } else {
    msgEl.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
});

document.getElementById('show-register-passwords')?.addEventListener('change', e => {
  const pw = document.getElementById('reg-password');
  const conf = document.getElementById('reg-confirm');
  const type = e.target.checked ? 'text' : 'password';
  if (pw) pw.type = type;
  if (conf) conf.type = type;
});
</script>
