<?php
$page_title = 'Contact';
$page_desc  = 'Get in touch with the FoodFusion team.';
include __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div class="container">
    <h1>✉️ Contact Us</h1>
    <p>Questions, feedback or collaboration ideas — we'd love to hear from you</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start">

      <!-- Contact form -->
      <div>
        <h2 style="font-size:1.3rem;margin-bottom:6px">Send a message</h2>
        <p class="text-muted mb-3" style="font-size:.9rem">We usually respond within one business day.</p>
        <div id="contact-msg"></div>
        <form id="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label>Your Name *</label>
              <input type="text" name="name" required placeholder="Jane Smith">
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" name="email" required placeholder="jane@example.com">
            </div>
          </div>
          <div class="form-group">
            <label>Subject</label>
            <select name="subject">
              <option>General Inquiry</option>
              <option>Recipe Submission</option>
              <option>Event Proposal</option>
              <option>Partnership</option>
              <option>Technical Issue</option>
            </select>
          </div>
          <div class="form-group">
            <label>Message *</label>
            <textarea name="message" rows="6" required placeholder="Tell us what's on your mind…"></textarea>
          </div>
          <button type="submit" class="btn btn-primary w-full" id="contact-submit">Send Message</button>
        </form>
      </div>

      <!-- Info column -->
      <div>
        <h2 style="font-size:1.3rem;margin-bottom:20px">Other ways to connect</h2>

        <div class="card" style="padding:24px;margin-bottom:20px">
          <h3 style="margin-bottom:14px;font-size:1rem">📍 Find us</h3>
          <p class="text-muted" style="font-size:.9rem">The Fusion Kitchen<br>12 Harare Street, Avondale<br>Harare, Zimbabwe</p>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px">
          <h3 style="margin-bottom:14px;font-size:1rem">🕐 Hours</h3>
          <p class="text-muted" style="font-size:.9rem">
            Monday – Friday: 9am – 5pm<br>
            Saturday: 10am – 2pm<br>
            Sunday: Closed
          </p>
        </div>

        <!-- Newsletter signup -->
        <div class="card" style="padding:24px;background:var(--clr-primary-lt);border-color:rgba(217,95,43,.2)">
          <h3 style="margin-bottom:8px;font-size:1rem">📬 Newsletter</h3>
          <p style="font-size:.88rem;color:var(--clr-muted);margin-bottom:14px">Get weekly recipes and event announcements.</p>
          <div id="nl-msg"></div>
          <form id="nl-form">
            <div class="form-group">
              <input type="email" name="email" required placeholder="your@email.com">
            </div>
            <button type="submit" class="btn btn-primary w-full">Subscribe</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>

<style>
@media(max-width:768px){ .contact-grid { grid-template-columns:1fr !important; } }
</style>

<script>
document.getElementById('contact-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('contact-submit');
  btn.disabled = true; btn.textContent = 'Sending…';
  const body = Object.fromEntries(new FormData(e.target));
  const data = await API.post('contact.php', body);
  const msgEl = document.getElementById('contact-msg');
  if (data.success) {
    msgEl.innerHTML = '<div class="alert alert-success">Message sent! We\'ll be in touch soon.</div>';
    e.target.reset();
  } else {
    msgEl.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
  }
  btn.disabled = false; btn.textContent = 'Send Message';
});

document.getElementById('nl-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = e.target.email.value;
  const data = await API.post('contact.php', { newsletter: true, email });
  const msgEl = document.getElementById('nl-msg');
  if (data.success) {
    msgEl.innerHTML = '<div class="alert alert-success">Subscribed!</div>';
    e.target.reset();
  } else {
    msgEl.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
  }
});
</script>
