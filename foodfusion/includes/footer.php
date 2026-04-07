<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="nav-logo">
          <img src="/foodfusion/assets/images/food-svgrepo-com.svg" alt="" class="nav-logo-mark" aria-hidden="true">
          <span>Food</span><span style="color:#6EE7B7">Fusion</span>
        </div>
        <p>A community of food lovers celebrating diverse cuisines, sharing recipes and learning together.</p>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <ul>
          <li><a href="/foodfusion/recipes.php">All Recipes</a></li>
          <li><a href="/foodfusion/culinary-resources.php">Culinary Resources</a></li>
          <li><a href="/foodfusion/renewable-energy.php">Renewable Energy</a></li>
          <li><a href="/foodfusion/community.php">Community</a></li>
          <li><a href="/foodfusion/events.php">Events &amp; Workshops</a></li>
          <li><a href="/foodfusion/contact.php">Contact Us</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Account</h4>
        <ul>
          <li><a href="/foodfusion/login.php">Log in</a></li>
          <li><a href="/foodfusion/register.php">Sign up</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Newsletter</h4>
        <p style="font-size:.85rem;opacity:.7">Get weekly recipes and event updates.</p>
        <form class="newsletter-form" id="footer-newsletter">
          <input type="email" placeholder="your@email.com" id="nl-email" required>
          <button type="submit" class="btn btn-primary btn-sm">Go</button>
        </form>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; <?= date('Y') ?> FoodFusion. All rights reserved.</span>
      <span>Built with ❤️ for food lovers everywhere</span>
    </div>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
<script src="/foodfusion/assets/js/main.js"></script>
<script src="/foodfusion/assets/js/detail-overrides.js"></script>
<script>
document.getElementById('footer-newsletter')?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('nl-email').value;
  const data = await API.post('contact.php', { newsletter: true, email });
  toast(data.message, data.success ? 'success' : 'error');
  if (data.success) e.target.reset();
});
</script>

<div class="modal-overlay hidden" id="recipe-detail-modal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3>Recipe Details</h3>
      <button class="modal-close" onclick="hideModal('recipe-detail-modal')">×</button>
    </div>
    <div class="modal-body" id="recipe-detail-body"></div>
  </div>
</div>

<div class="modal-overlay hidden" id="event-detail-modal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3>Event Details</h3>
      <button class="modal-close" onclick="hideModal('event-detail-modal')">×</button>
    </div>
    <div class="modal-body" id="event-detail-body"></div>
  </div>
</div>
</body>
</html>
