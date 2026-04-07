<?php
$page_title = 'Home';
$page_desc  = 'Discover recipes, share cooking tips and join food workshops with the FoodFusion community.';
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="container">
    <div class="row align-items-center g-3 gx-lg-5 hero-row">
      <div class="col-lg-4 hero-content pe-lg-5 hero-copy-block">
        <div class="hero-tag">Welcome to FoodFusion</div>
        <h1>Where <em>food cultures</em> meet and flavours collide</h1>
        <p>Discover authentic recipes, share cooking wisdom and connect with a community that celebrates every cuisine on earth.</p>
        <div class="hero-actions">
          <a href="#popular-recipes" class="btn btn-primary btn-lg">Popular Recipes</a>
          <a href="/foodfusion/recipes.php" class="btn btn-outline btn-lg" id="hero-cta" style="border-color:rgba(255,255,255,.5);color:#fff;">Browse All Recipes</a>
        </div>
        <div class="hero-logo-spot d-flex align-items-center gap-2">
          <img src="/foodfusion/assets/images/food-svgrepo-com.svg" alt="" class="ff-logo-icon" aria-hidden="true">
          <span>Food<em>Fusion</em></span>
        </div>
      </div>
      <div class="col-lg-8 d-flex justify-content-end align-items-center pt-lg-0">
        <div class="hero-popular" id="popular-recipes">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Popular Recipes</h5>
            <a href="/foodfusion/recipes.php" class="text-decoration-none text-white-50 small">See all &rarr;</a>
          </div>
          <div class="hero-popular-list">
            <a class="hero-popular-item" href="/foodfusion/recipes.php">
              <div class="hero-popular-thumb" style="background-image:url('assets/images/successcard-jollof-4659747_1920 (1).jpg')"></div>
              <div>
                <div class="hero-popular-title">Authentic Jollof Rice</div>
                <div class="hero-popular-meta">West African &middot; 65 min</div>
              </div>
            </a>
            <a class="hero-popular-item" href="/foodfusion/recipes.php">
              <div class="hero-popular-thumb" style="background-image:url('assets/images/113.jpg')"></div>
              <div>
                <div class="hero-popular-title">Miso Ramen</div>
                <div class="hero-popular-meta">Japanese &middot; 90 min</div>
              </div>
            </a>
            <a class="hero-popular-item" href="/foodfusion/recipes.php">
              <div class="hero-popular-thumb" style="background-image:url('assets/images/sti300p-barbecue-4465142_1920.jpg')"></div>
              <div>
                <div class="hero-popular-title">Butter Chicken</div>
                <div class="hero-popular-meta">Indian &middot; 60 min</div>
              </div>
            </a>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header-row">
      <div class="section-header" style="margin-bottom:0">
        <h2>Featured Recipes</h2>
        <p>Handpicked dishes from our community chefs</p>
      </div>
      <a href="/foodfusion/recipes.php" class="btn btn-outline">View all →</a>
    </div>
    <div class="grid-3" id="featured-recipes">
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
    </div>
  </div>
</section>

<section class="section-alt" style="padding: 32px 0;">
  <div class="container">
    <div class="stats-bar">
      <div class="stat-item"><div class="num">15+</div><div class="lbl">Cuisines</div></div>
      <div class="stat-item"><div class="num">100%</div><div class="lbl">Free</div></div>
      <div class="stat-item"><div class="num">Weekly</div><div class="lbl">New Events</div></div>
      <div class="stat-item"><div class="num">Open</div><div class="lbl">Community</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header-row">
      <div class="section-header" style="margin-bottom:0">
        <h2>Upcoming Events</h2>
        <p>Hands-on workshops with expert chefs</p>
      </div>
      <a href="/foodfusion/events.php" class="btn btn-outline">All events →</a>
    </div>
    <div class="grid-3" id="home-events">
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-header-row">
      <div class="section-header" style="margin-bottom:0">
        <h2>From the Community</h2>
        <p>Tips, questions and experiences from our members</p>
      </div>
      <a href="/foodfusion/community.php" class="btn btn-outline">Join discussion →</a>
    </div>
    <div class="grid-2" id="home-posts">
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
(async () => {
  await checkAuth();
  if (currentUser) {
    const cta = document.getElementById('hero-cta');
    if (cta) { cta.textContent = 'Share a Recipe'; cta.href = '/foodfusion/recipes.php'; }
  }

  const recipeData = await API.get('recipes.php', { featured: 'true', limit: 6 });
  const recipeEl = document.getElementById('featured-recipes');
  if (recipeData.success && recipeData.data?.length) {
    window.__recipeStore = recipeData.data.slice();
    recipeEl.innerHTML = recipeData.data.map(r => {
      const imageUrl = getRecipeImage(r);
      const totalMinutes = (r.prep_time ?? 0) + (r.cook_time ?? 0);
      return `
      <div class="recipe-card" role="button" tabindex="0" onclick="openRecipeDetails(${r.recipe_id || r.id})" onkeydown="if(event.key==='Enter'||event.key===' ') openRecipeDetails(${r.recipe_id || r.id})">
        <div class="recipe-img" style="background-image:url('${imageUrl}')">
          <span class="recipe-badge">${r.difficulty_level}</span>
        </div>
        <div class="recipe-content">
          <div class="card-meta">
            <span class="tag">${r.cuisine_type}</span>
            ${diffBadge(r.difficulty_level)}
          </div>
          <h3 class="recipe-title">${r.title}</h3>
          <p class="desc card-desc-clamp">${r.description}</p>
          <div class="recipe-actions">
            <span class="text-muted small">⏱ ${totalMinutes} min · 👤 ${r.first_name} ${r.last_name}</span>
            <button type="button" class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); downloadRecipe(${r.recipe_id || r.id})"><i class="fas fa-download"></i> Download</button>
          </div>
        </div>
      </div>`;
    }).join('');
  } else {
    recipeEl.innerHTML = '<p class="text-muted">No featured recipes yet.</p>';
  }

  const eventsData = await API.get('events.php', { limit: 3 });
  const eventsEl = document.getElementById('home-events');
  if (eventsData.success && eventsData.data?.length) {
    window.__eventStore = eventsData.data.slice();
    const eventImages = {
      'Mediterranean Cooking Workshop': 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg',
      'Sushi Making Class': 'assets/images/isakarakus-old-man-2879303_1920.jpg',
      'West African Feast': 'assets/images/successcard-jollof-4659747_1920 (1).jpg',
      'Knife Workshop': 'assets/images/congerdesign-knife-block-1897410_1920.jpg',
      'default': 'assets/images/elegancenairobi-african-food-3957740_1920.jpg'
    };
    eventsEl.innerHTML = eventsData.data.map(ev => {
      const d = fmtEventDate(ev.event_date);
      const spotsLeft = ev.max_participants - (ev.registered_count ?? 0);
      const imageUrl = ev.image_path || ev.image || eventImages[ev.title] || eventImages.default;
      const eventId = ev.event_id || ev.id;
      return `<div class="card event-card" role="button" tabindex="0" onclick="openEventDetails(${eventId})" onkeydown="if(event.key==='Enter'||event.key===' ') openEventDetails(${eventId})">
        <div class="event-img" style="background-image:url('${imageUrl}')"></div>
        <div class="event-date"><div class="day">${d.day}</div><div class="month">${d.month}</div></div>
        <div class="card-body">
          <h3>${ev.title}</h3>
          <div class="event-meta-row">
            <span>📍 ${ev.location}</span>
            <span>👥 ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left</span>
          </div>
          <p class="desc">${ev.description}</p>
          <a href="/foodfusion/events.php" class="btn btn-outline btn-sm">View Details</a>
        </div>
      </div>`;
    }).join('');
  } else {
    eventsEl.innerHTML = '<p class="text-muted">No upcoming events scheduled.</p>';
  }

  const postsData = await API.get('posts.php', { limit: 2 });
  const postsEl = document.getElementById('home-posts');
  if (postsData.success && postsData.data?.length) {
    postsEl.innerHTML = postsData.data.map(p => `
      <div class="card post-card">
        <div class="post-author">
          <div class="avatar">${avatarInitials(p.first_name, p.last_name)}</div>
          <div>
            <div class="post-author-name">${p.first_name} ${p.last_name}</div>
            <div class="post-author-time">${timeAgo(p.created_at)}</div>
          </div>
          <span class="tag" style="margin-left:auto">${p.post_type}</span>
        </div>
        <h3>${p.title}</h3>
        <p class="desc" style="-webkit-line-clamp:3">${p.content}</p>
        <div class="post-actions">
          <span class="like-btn">❤ ${p.likes_count}</span>
          <span class="text-sm text-muted">💬 ${p.comments_count} comments</span>
        </div>
      </div>`).join('');
  } else {
    postsEl.innerHTML = '<p class="text-muted">No posts yet. Be the first!</p>';
  }

  // Hero counters removed for a cleaner layout.
})();
</script>
