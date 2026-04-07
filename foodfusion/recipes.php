<?php
$page_title = 'Recipes';
$page_desc  = 'Browse and search hundreds of authentic recipes from cuisines around the world.';
include __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div class="container">
    <h1>Recipes</h1>
    <p>Explore dishes from every corner of the world</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="search-bar">
      <input type="text" id="search-input" placeholder="Search recipes, ingredients, cuisines...">
      <button class="btn btn-primary" id="search-btn">Search</button>
      <button class="btn btn-outline hidden" id="add-recipe-btn">+ Add Recipe</button>
    </div>

    <div class="filter-bar" id="cuisine-filters">
      <button class="filter-btn active" data-cuisine="">All Cuisines</button>
      <button class="filter-btn" data-cuisine="Mediterranean">Mediterranean</button>
      <button class="filter-btn" data-cuisine="West African">West African</button>
      <button class="filter-btn" data-cuisine="Japanese">Japanese</button>
      <button class="filter-btn" data-cuisine="Spanish">Spanish</button>
      <button class="filter-btn" data-cuisine="Italian">Italian</button>
      <button class="filter-btn" data-cuisine="Indian">Indian</button>
    </div>

    <div class="filter-bar" id="diff-filters">
      <button class="filter-btn active" data-diff="">All Levels</button>
      <button class="filter-btn" data-diff="easy">Easy</button>
      <button class="filter-btn" data-diff="medium">Medium</button>
      <button class="filter-btn" data-diff="hard">Hard</button>
    </div>

    <div class="grid-3" id="recipes-grid">
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
    </div>

    <div id="no-recipes" class="empty-state hidden">
      <div class="icon">🍽️</div>
      <h3>No recipes found</h3>
      <p>Try a different search or filter</p>
    </div>

    <div style="text-align:center;margin-top:32px">
      <button class="btn btn-ghost" id="load-more">Load more</button>
    </div>
  </div>
</section>

<div class="modal-overlay hidden" id="recipe-modal">
  <div class="modal">
    <div class="modal-header">
      <h3>Share a Recipe</h3>
      <button class="modal-close" onclick="hideModal('recipe-modal')">×</button>
    </div>
    <div class="modal-body">
      <div id="recipe-form-msg"></div>
      <form id="recipe-form">
        <div class="form-group">
          <label>Recipe Title *</label>
          <input type="text" name="title" required placeholder="e.g. Classic Shakshuka">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Cuisine Type *</label>
            <select name="cuisine_type" required>
              <option value="">Select cuisine</option>
              <option>Mediterranean</option><option>West African</option>
              <option>Japanese</option><option>Spanish</option>
              <option>Italian</option><option>Indian</option>
              <option>Chinese</option><option>Mexican</option>
              <option>French</option><option>Thai</option>
              <option>American</option><option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Difficulty *</label>
            <select name="difficulty_level" required>
              <option value="easy">Easy</option>
              <option value="medium" selected>Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Prep Time (mins)</label>
            <input type="number" name="prep_time" min="0" placeholder="15">
          </div>
          <div class="form-group">
            <label>Cook Time (mins)</label>
            <input type="number" name="cook_time" min="0" placeholder="30">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Servings</label>
            <input type="number" name="servings" min="1" placeholder="4">
          </div>
        </div>
        <div class="form-group">
          <label>Description *</label>
          <textarea name="description" rows="2" required placeholder="A short description of the dish..."></textarea>
        </div>
        <div class="form-group">
          <label>Recipe Image</label>
          <select id="recipe-image-select" class="form-control">
            <option value="">Auto select image</option>
            <option value="assets/images/unserekleinemaus-tapas-1164263_1920.jpg">Mediterranean / Spanish plate</option>
            <option value="assets/images/successcard-jollof-4659747_1920 (1).jpg">West African Jollof</option>
            <option value="assets/images/113.jpg">Japanese ramen</option>
            <option value="assets/images/land_of_aahs-matcha-marshmallow-8692659_1920.jpg">Italian dessert</option>
            <option value="assets/images/sti300p-barbecue-4465142_1920.jpg">Indian grill</option>
          </select>
          <div class="img-dropzone mt-3" id="recipe-dropzone">
            <div class="img-dropzone-hint">
              <span>Preview</span>
              <p>Selected card image</p>
              <small>Built-in assets</small>
            </div>
            <img id="recipe-preview-img" class="img-dropzone-preview" alt="Recipe preview">
            <input type="hidden" id="recipe-img-path" name="image_path">
          </div>
        </div>
        <div class="form-group">
          <label>Ingredients *</label>
          <textarea name="ingredients" rows="5" required placeholder="One ingredient per line, e.g.&#10;2 eggs&#10;400g canned tomatoes"></textarea>
          <span class="form-help">Enter one ingredient per line</span>
        </div>
        <div class="form-group">
          <label>Instructions *</label>
          <textarea name="instructions" rows="6" required placeholder="Step 1: ...&#10;Step 2: ..."></textarea>
          <span class="form-help">Enter one step per line</span>
        </div>
        <button type="submit" class="btn btn-primary w-full">Publish Recipe</button>
      </form>
    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
let offset = 0, activeCuisine = '', activeDiff = '', activeSearch = '';
const limit = 12;
const fallbackRecipes = [
  { id: 1, title: 'Classic Shakshuka', cuisine_type: 'Mediterranean', difficulty_level: 'easy', description: 'Poached eggs in a rich tomato and pepper sauce.', prep_time: 10, cook_time: 25, servings: 2, image_path: 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg' },
  { id: 2, title: 'Authentic Jollof Rice', cuisine_type: 'West African', difficulty_level: 'medium', description: 'West African rice with bold tomato flavor.', prep_time: 20, cook_time: 45, servings: 4, image_path: 'assets/images/successcard-jollof-4659747_1920 (1).jpg' },
  { id: 3, title: 'Miso Ramen', cuisine_type: 'Japanese', difficulty_level: 'medium', description: 'Comforting ramen with miso broth and soft egg.', prep_time: 30, cook_time: 60, servings: 2, image_path: 'assets/images/113.jpg' }
];

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function matchesRecipeFilters(recipe) {
  const cuisine = normalizeText(recipe.cuisine_type);
  const difficulty = normalizeText(recipe.difficulty_level);
  const search = normalizeText(activeSearch);
  const title = normalizeText(recipe.title);
  const description = normalizeText(recipe.description);
  const cuisineMatch = !activeCuisine || cuisine === normalizeText(activeCuisine);
  const diffMatch = !activeDiff || difficulty === normalizeText(activeDiff);
  const searchMatch = !search || title.includes(search) || cuisine.includes(search) || description.includes(search);
  return cuisineMatch && diffMatch && searchMatch;
}

function getFallbackRecipes() {
  return fallbackRecipes.filter(matchesRecipeFilters);
}

async function loadRecipes(reset = false) {
  if (reset) offset = 0;

  const grid = document.getElementById('recipes-grid');
  const noMsg = document.getElementById('no-recipes');
  const loadMoreBtn = document.getElementById('load-more');
  if (!grid || !noMsg || !loadMoreBtn) return;

  if (reset) skeletonCards(grid, 6);

  const filteredMode = Boolean(activeCuisine || activeDiff || activeSearch);
  const params = filteredMode ? { limit: 100, offset: 0 } : { limit, offset };
  if (activeCuisine) params.cuisine = activeCuisine;
  if (activeDiff) params.difficulty = activeDiff;
  if (activeSearch) params.search = activeSearch;

  const data = await API.get('recipes.php', params);
  const apiList = data.success && Array.isArray(data.data) ? data.data : [];
  const filteredApiList = apiList.filter(matchesRecipeFilters);
  const list = filteredApiList.length ? filteredApiList : (reset ? getFallbackRecipes() : []);
  if (list.length) {
    noMsg.classList.add('hidden');
    window.__recipeStore = reset ? list.slice() : [...(window.__recipeStore || []), ...list];

    const html = list.map(r => {
      const imageUrl = getRecipeImage(r);
      const totalMinutes = (+r.prep_time || 0) + (+r.cook_time || 0);
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
              <span class="text-muted small">⏱ ${totalMinutes} min · 🍽 ${r.servings} srv</span>
              <button type="button" class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); downloadRecipe(${r.recipe_id || r.id})"><i class="fas fa-download"></i> Download</button>
            </div>
          </div>
          <div class="card-footer">
            <span>❤ ${r.likes_count ?? 0} · 💬 ${r.comments_count ?? 0}</span>
          </div>
        </div>`;
    }).join('');

    grid.innerHTML = reset ? html : grid.innerHTML + html;
    offset += list.length;
    loadMoreBtn.classList.toggle('hidden', filteredMode || list.length < limit || (!apiList.length && reset));
  } else {
    if (reset) {
      grid.innerHTML = '';
      noMsg.classList.remove('hidden');
    }
    loadMoreBtn.classList.add('hidden');
  }
}

document.querySelectorAll('#cuisine-filters .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#cuisine-filters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCuisine = btn.dataset.cuisine;
    loadRecipes(true);
  });
});

document.querySelectorAll('#diff-filters .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#diff-filters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeDiff = btn.dataset.diff;
    loadRecipes(true);
  });
});

document.getElementById('search-btn')?.addEventListener('click', () => {
  activeSearch = document.getElementById('search-input').value.trim();
  loadRecipes(true);
});

document.getElementById('search-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    activeSearch = e.target.value.trim();
    loadRecipes(true);
  }
});

document.getElementById('load-more')?.addEventListener('click', () => loadRecipes(false));

const recipeImageSelect = document.getElementById('recipe-image-select');
const recipePreviewImg = document.getElementById('recipe-preview-img');
const recipeImagePath = document.getElementById('recipe-img-path');

function updateRecipePreview(path) {
  const value = path || '';
  if (recipeImagePath) recipeImagePath.value = value;
  if (recipePreviewImg) {
    recipePreviewImg.src = value || getRecipeImage({ cuisine_type: recipeImageSelect?.value || '' });
  }
}

recipeImageSelect?.addEventListener('change', () => updateRecipePreview(recipeImageSelect.value));
updateRecipePreview(recipeImageSelect?.value || '');

document.getElementById('add-recipe-btn')?.addEventListener('click', () => {
  if (!currentUser) {
    window.location.href = '/foodfusion/login.php';
    return;
  }
  showModal('recipe-modal');
});

document.getElementById('recipe-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  const msgEl = document.getElementById('recipe-form-msg');
  msgEl.innerHTML = '';
  if (!body.image_path) {
    body.image_path = getRecipeImage({ title: body.title, cuisine_type: body.cuisine_type });
  }

  const data = await API.post('recipes.php', body);
  if (data.success) {
    toast('Recipe published!', 'success');
    hideModal('recipe-modal');
    e.target.reset();
    updateRecipePreview('');
    loadRecipes(true);
  } else {
    msgEl.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
  }
});

(async () => {
  await checkAuth();
  if (currentUser) document.getElementById('add-recipe-btn')?.classList.remove('hidden');
  loadRecipes(true);
})();
</script>
