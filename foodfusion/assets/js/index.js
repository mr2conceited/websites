
// ============================================
// DATA WITH ACCURATE FOOD IMAGES
// ============================================

// Specific accurate images for each recipe
const recipeImages = {
  'Classic Shakshuka': 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=600&h=400&fit=crop',
  'Authentic Jollof Rice': 'assets/images/successcard-jollof-4659747_1920%20(1).jpg',
  'Jollof Rice': 'assets/images/successcard-jollof-4659747_1920%20(1).jpg',
  'Miso Ramen': 'assets/images/113.jpg',
  'Paella Valenciana': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&h=400&fit=crop',
  'Butter Chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop',
  'Tiramisu': 'assets/images/land_of_aahs-matcha-marshmallow-8692659_1920.jpg',
  'Tiramitsu': 'assets/images/land_of_aahs-matcha-marshmallow-8692659_1920.jpg',
  'Matcha Tiramisu': 'assets/images/land_of_aahs-matcha-marshmallow-8692659_1920.jpg',
  'Suya Skewers': 'assets/images/sti300p-barbecue-4465142_1920.jpg',
  'Spanish Tortilla': 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg'
};

const recipeImagesByKey = Object.fromEntries(Object.entries(recipeImages).map(([k, v]) => [k.toLowerCase().trim(), v]));

const cuisineImages = {
  'Mediterranean': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
  'West African': 'assets/images/successcard-jollof-4659747_1920%20(1).jpg',
  'Japanese': 'https://images.unsplash.com/photo-1557872943-16a5ac6a8c76?w=600&h=400&fit=crop',
  'Spanish': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&h=400&fit=crop',
  'Italian': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
  'Indian': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop',
  'default': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop'
};

const eventImages = {
  'Mediterranean': 'assets/images/elegancenairobi-african-food-3957740_1920.jpg',
  'Sushi': 'assets/images/isakarakus-old-man-2879303_1920.jpg',
  'Sushi Making Class': 'assets/images/isakarakus-old-man-2879303_1920.jpg',
  'West African': 'assets/images/elegancenairobi-african-food-3957740_1920.jpg',
  'West African Street Food': 'assets/images/elegancenairobi-african-food-3957740_1920.jpg',
  'West African Street Food Masterclass': 'assets/images/elegancenairobi-african-food-3957740_1920.jpg',
  'Japanese Workshop': 'assets/images/isakarakus-old-man-2879303_1920.jpg',
  'Japanese Fermentation Workshop': 'assets/images/isakarakus-old-man-2879303_1920.jpg',
  'Japanese Fermantation Workshop': 'assets/images/isakarakus-old-man-2879303_1920.jpg',
  'Knife Workshop': 'assets/images/congerdesign-knife-block-1897410_1920.jpg',
  'Knife Skills Bootcamp': 'assets/images/congerdesign-knife-block-1897410_1920.jpg'
};

const eventImagesByKey = Object.fromEntries(Object.entries(eventImages).map(([k, v]) => [k.toLowerCase().trim(), v]));

async function apiGet(endpoint, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/foodfusion/api/${endpoint}${qs ? `?${qs}` : ''}`);
  return res.json();
}

// Recipes data
let recipes = [
  { id: 1, title: 'Classic Shakshuka', image_path: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=600&h=400&fit=crop', cuisine_type: 'Mediterranean', difficulty_level: 'easy', description: 'Poached eggs in a rich, spiced tomato and bell pepper sauce. A North African and Mediterranean breakfast favorite.', ingredients: '6 eggs\n4 large tomatoes\n1 red bell pepper\n1 onion\n4 garlic cloves\n1 tsp cumin\n1 tsp paprika\nSalt & pepper\nOlive oil\nFresh parsley', instructions: 'SautÃ© onions and peppers\nAdd garlic and spices\nAdd tomatoes, simmer\nCreate wells, crack eggs\nCover and cook until set\nGarnish with parsley', prep_time: 10, cook_time: 25, author: 'Maria Silva', created_at: '2024-03-15' },
  { id: 2, title: 'Authentic Jollof Rice', image_path: 'assets/images/successcard-jollof-4659747_1920%20(1).jpg', cuisine_type: 'West African', difficulty_level: 'medium', description: 'The iconic West African one-pot rice dish with rich tomato flavor, served with fried plantains.', ingredients: '2 cups rice\n4 large tomatoes\n1 onion\n1 scotch bonnet pepper\n2 tbsp tomato paste\n1 tsp thyme\n1 tsp curry powder\nChicken stock\nSalt\nVegetable oil', instructions: 'Blend tomatoes, onion, pepper\nFry tomato paste and mixture\nAdd stock, spices, rice\nCover and simmer\nServe with fried plantains', prep_time: 20, cook_time: 45, author: 'Amina Diallo', created_at: '2024-03-10' },
  { id: 3, title: 'Miso Ramen', image_path: 'assets/images/113.jpg', cuisine_type: 'Japanese', difficulty_level: 'medium', description: 'A comforting bowl of Japanese ramen with rich miso broth, tender chashu pork, and soft-boiled egg.', ingredients: 'Ramen noodles\n4 cups chicken broth\n3 tbsp miso paste\n2 garlic cloves\n1 tbsp ginger\nChashu pork\nSoft-boiled eggs\nGreen onions\nCorn\nNori seaweed', instructions: 'SautÃ© garlic and ginger\nAdd broth and miso paste\nCook ramen noodles separately\nAssemble bowl with toppings\nGarnish with green onions', prep_time: 30, cook_time: 60, author: 'Kenji Tanaka', created_at: '2024-03-05' },
  { id: 4, title: 'Paella Valenciana', image_path: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&h=400&fit=crop', cuisine_type: 'Spanish', difficulty_level: 'hard', description: 'Traditional Spanish paella with saffron-infused rice, chicken, rabbit, and fresh seafood.', ingredients: '2 cups bomba rice\n4 cups chicken broth\n1 tsp saffron\nChicken pieces\nRabbit pieces\nShrimp\nMussels\nGreen beans\nTomatoes\nPaprika\nOlive oil', instructions: 'Brown meat in paella pan\nAdd vegetables and rice\nAdd broth and saffron\nCook without stirring\nAdd seafood, cook until done\nRest before serving', prep_time: 25, cook_time: 50, author: 'Carlos Mendez', created_at: '2024-03-01' },
  { id: 5, title: 'Butter Chicken', image_path: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop', cuisine_type: 'Indian', difficulty_level: 'medium', description: 'Creamy, rich tomato-based curry with tender tandoori-marinated chicken. A North Indian classic.', ingredients: '500g chicken breast\n1 cup yogurt\n2 tbsp butter\n1 cup tomato puree\n1 cup heavy cream\n1 onion\n4 garlic cloves\n1 tbsp garam masala\n1 tsp turmeric\n1 tsp cumin\nSalt\nCilantro', instructions: 'Marinate chicken in yogurt and spices\nGrill or pan-fry chicken\nSautÃ© onions and garlic\nAdd tomato puree and cream\nSimmer sauce\nAdd chicken, finish with butter\nGarnish with cilantro', prep_time: 20, cook_time: 40, author: 'Priya Sharma', created_at: '2024-02-28' }
];

let events = [
  { id: 1, title: 'Mediterranean Cooking Workshop', image_path: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop', date: 'April 15, 2024', location: 'Harare, Zimbabwe', capacity: 20, registered: 8, description: 'Learn to make authentic hummus, falafel, shakshuka, and fresh pita bread from scratch.' },
  { id: 2, title: 'Sushi Making Class', image_path: 'assets/images/isakarakus-old-man-2879303_1920.jpg', date: 'April 22, 2024', location: 'Harare, Zimbabwe', capacity: 15, registered: 12, description: 'Master the art of rolling perfect sushi, making sushi rice, and preparing fresh sashimi.' },
  { id: 3, title: 'West African Feast', image_path: 'assets/images/successcard-jollof-4659747_1920%20(1).jpg', date: 'May 5, 2024', location: 'Harare, Zimbabwe', capacity: 25, registered: 5, description: 'Cook authentic Jollof rice, fried plantains, groundnut soup, and learn West African cuisine.' }
];

let posts = [
  { id: 1, title: 'Best way to cook basmati rice', post_type: 'tip', content: 'Soak for 30 mins, use 1:1.5 rice to water ratio, let it rest covered for 10 mins after cooking for perfect fluffy rice.', cuisine_type: 'Indian', author: 'Raj Patel', created_at: 'Mar 14', author_avatar: '<i class=\"fas fa-user\"></i>' },
  { id: 2, title: 'Tried making pasta from scratch', post_type: 'experience', content: 'It was challenging but so rewarding! The texture is incomparable to store-bought. Used 00 flour and eggs - perfect results!', cuisine_type: 'Italian', author: 'Sophia Romano', created_at: 'Mar 12', author_avatar: '<i class=\"fas fa-user\"></i>' }
];

let currentUser = null;
let currentRecipeFilter = '';
let currentDifficultyFilter = '';
let currentSearchTerm = '';

// Helper Functions
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `ff-toast ${type === 'success' ? 'ok' : 'err'}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function uploadImageFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/foodfusion/api/upload.php', { method: 'POST', body: fd });
  return res.json();
}
function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

function initRecipeImageInput() {
  const zone = document.getElementById('recipe-image-dropzone');
  const input = document.getElementById('recipe-image-input');
  const preview = document.getElementById('recipe-image-preview');
  const changeBtn = document.getElementById('recipe-image-change');
  if (!zone || !input || !preview) return;

  const openPicker = () => input.click();
  zone.addEventListener('click', (e) => {
    if (e.target === input) return;
    openPicker();
  });
  changeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPicker();
  });
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    zone.classList.add('has-preview');
  });
}

function parseList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[')) {
      try { return JSON.parse(trimmed); } catch {}
    }
    return trimmed.split(/\n|\|/).filter(Boolean);
  }
  return [];
}
function getAccurateImageForRecipe(recipe) {
  if (recipe.image) return recipe.image;
  if (recipe.image_path) return recipe.image_path;
  if (recipeImages[recipe.title]) return recipeImages[recipe.title];
  const key = (recipe.title || '').toLowerCase().trim();
  if (recipeImagesByKey[key]) return recipeImagesByKey[key];
  return cuisineImages[recipe.cuisine_type] || cuisineImages['default'];
}

function buildRecipeDownloadText(recipe) {
  const ingredients = parseList(recipe.ingredients || '');
  const instructions = parseList(recipe.instructions || '');
  const prep = Number(recipe.prep_time || 0);
  const cook = Number(recipe.cook_time || 0);
  const total = prep + cook;
  const author = (recipe.author || ((recipe.first_name || '') + ' ' + (recipe.last_name || '')).trim() || 'Chef');
  return [
    `Recipe: ${recipe.title}`,
    `Cuisine: ${recipe.cuisine_type || 'N/A'}`,
    `Difficulty: ${recipe.difficulty_level || 'N/A'}`,
    `Prep Time: ${prep} min`,
    `Cook Time: ${cook} min`,
    `Total Time: ${total} min`,
    `Author: ${author}`,
    '',
    'Ingredients:',
    ...ingredients.map(i => `- ${i}`),
    '',
    'Instructions:',
    ...instructions.map((step, i) => `${i + 1}. ${step}`)
  ].join('\n');
}


function downloadRecipe(recipeId) {
  const recipe = recipes.find(r => (r.recipe_id || r.id) === recipeId);
  if (!recipe) return;
  const content = buildRecipeDownloadText(recipe);
  const safeName = (recipe.title || 'recipe').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filename = `${safeName || 'recipe'}.pdf`;

  if (window.jspdf && window.jspdf.jsPDF) {
    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(recipe.title || 'Recipe', 40, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(content, 515);
    doc.text(lines, 40, 80);
    doc.save(filename);
    return;
  }

  // Fallback to text download if PDF lib is unavailable
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName || 'recipe'}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}



function renderRecipeCard(recipe) {
  const imageUrl = getAccurateImageForRecipe(recipe);
  return `
    <div class="recipe-card" onclick="openRecipeModal(${recipe.recipe_id || recipe.id})">
      <div class="recipe-img" style="background-image: url('${imageUrl}')">
        <span class="recipe-badge">${recipe.difficulty_level}</span>
      </div>
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.title}</h3>
        <div class="recipe-meta">
          <span><i class="far fa-clock"></i> ${Number(recipe.prep_time||0)+Number(recipe.cook_time||0)} min</span>
          <span><i class="fas fa-user"></i> ${(recipe.author || ((recipe.first_name||'') + ' ' + (recipe.last_name||'')).trim() || 'Chef').split(' ')[0]}</span>
        </div>
        <p class="text-muted small mb-2">${(recipe.description || '').substring(0, 70)}${(recipe.description || '').length > 70 ? '...' : ''}</p>
        <div class="recipe-actions">
          <span class="cuisine-tag">${recipe.cuisine_type}</span>
          <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); downloadRecipe(${recipe.recipe_id || recipe.id})"><i class=\"fas fa-download\"></i> Download</button>
        </div>
      </div>
    </div>
  `;
}

function renderEventCard(event, showRegister = true) {
  const eventId = event.event_id || event.id;
  const isRegistered = currentUser && currentUser.registeredEvents.includes(eventId);
  const eventTitleKey = (event.title || '').toLowerCase().trim();
  const imageUrl = event.image_path || event.image || eventImages[event.title] || eventImagesByKey[eventTitleKey] || eventImages['Mediterranean'];
  return `
    <div class="event-card" onclick="openEventModal(${eventId})">
      <div class="event-img" style="background-image: url('${imageUrl}')"></div>
      <div class="event-content">
        <h3 class="event-title">${event.title}</h3>
        <div class="recipe-meta">
          <span><i class="far fa-calendar-alt"></i> ${event.date || event.event_date}</span>
          <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
        </div>
        <p class="text-muted small">${event.description}</p>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <span class="text-muted small"><i class="fas fa-users"></i> ${event.registered || event.registered_count || 0}/${event.capacity || event.max_participants} spots</span>
          ${showRegister && currentUser ? (isRegistered ? '<span class="badge bg-success"><i class="fas fa-check"></i> Registered</span>' : `<button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); registerForEvent(${eventId})">Register</button>`) : ''}
        </div>
      </div>
    </div>
  `;
}

function renderPostCard(post) {
  const typeIcons = { tip: '<i class="fas fa-lightbulb"></i>', experience: '<i class="fas fa-comment-dots"></i>', question: '<i class="fas fa-question-circle"></i>', review: '<i class="fas fa-star"></i>' };
  const typeNames = { tip: 'Tip', experience: 'Experience', question: 'Question', review: 'Review' };
  return `
    <div class="post-card">
      <div class="post-header">
        <div class="post-avatar">${post.author_avatar || '<i class="fas fa-user"></i>'}</div>
        <div>
          <div class="post-author">${post.author}</div>
          <div class="post-date">${post.created_at}</div>
        </div>
        <span class="post-type ms-auto">${typeIcons[post.post_type]} ${typeNames[post.post_type]}</span>
      </div>
      <h5>${post.title}</h5>
      <p class="text-muted mb-2">${post.content}</p>
      ${post.cuisine_type ? `<span class="cuisine-tag">${post.cuisine_type}</span>` : ''}
    </div>
  `;
}

function openRecipeModal(recipeId) {
  const recipe = recipes.find(r => (r.recipe_id || r.id) === recipeId);
  if (!recipe) return;
  const imageUrl = getAccurateImageForRecipe(recipe);
  const ingredients = parseList(recipe.ingredients);
  const instructions = parseList(recipe.instructions);
  const prep = Number(recipe.prep_time || 0);
  const cook = Number(recipe.cook_time || 0);
  const total = prep + cook;
  const servings = Number(recipe.servings || 4);
  const body = document.getElementById('recipe-detail-body');
  if (!body) return;
  body.innerHTML = `
    <div class="recipe-detail-hero" style="background-image:url('${imageUrl}');height:240px;background-size:cover;background-position:center;border-radius:10px;margin-bottom:16px"></div>
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
      <div>
        <h4 class="mb-1">${recipe.title}</h4>
        <div class="text-muted small"><i class="fas fa-utensils me-1"></i>${recipe.cuisine_type}<span class="ms-2"><i class="fas fa-signal me-1"></i>${recipe.difficulty_level}</span></div>
      </div>
      <div class="recipe-actions">
          <span class="cuisine-tag">${recipe.cuisine_type}</span>
          <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); downloadRecipe(${recipe.recipe_id || recipe.id})"><i class=\"fas fa-download\"></i> Download</button>
        </div>
    </div>
    <div class="d-flex gap-2 flex-wrap mb-3">
      <span class="ff-badge ff-badge-gray">Prep ${prep} min</span>
      <span class="ff-badge ff-badge-gray">Cook ${cook} min</span>
      <span class="ff-badge ff-badge-gray">Total ${total} min</span>
      <span class="ff-badge ff-badge-gray">Servings ${servings}</span>
    </div>
    <p class="text-muted mb-4">${recipe.description}</p>
    <div class="row g-4">
      <div class="col-md-5">
        <h6 class="fw-bold mb-2">Ingredients</h6>
        <ul class="ingredient-list list-unstyled mb-0">
          ${ingredients.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
      <div class="col-md-7">
        <h6 class="fw-bold mb-2">Instructions</h6>
        ${instructions.map((step, i) => `
          <div class="instruction-step">
            <div class="step-num">${i + 1}</div>
            <div>${step}</div>
          </div>`).join('')}
      </div>
    </div>
  `;
  const modal = new bootstrap.Modal(document.getElementById('recipeDetailModal'));
  modal.show();
}

function openEventModal(eventId) {
  const event = events.find(e => (e.event_id || e.id) === eventId);
  if (!event) return;
  const body = document.getElementById('event-detail-body');
  if (!body) return;
  const eventTitleKey = (event.title || '').toLowerCase().trim();
  const imageUrl = event.image_path || event.image || eventImages[event.title] || eventImagesByKey[eventTitleKey] || eventImages['Mediterranean'];
  const capacity = event.max_participants || event.capacity || 0;
  const registered = event.registered_count ?? event.current_participants ?? event.registered ?? 0;
  const spotsLeft = capacity - registered;
  body.innerHTML = `
    <div class="recipe-detail-hero" style="background-image:url('${imageUrl}');height:240px;background-size:cover;background-position:center;border-radius:10px;margin-bottom:16px"></div>
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
      <div>
        <h4 class="mb-1">${event.title}</h4>
        <div class="text-muted small"><i class="fas fa-calendar-alt me-1"></i>${event.date || event.event_date}<span class="ms-2"><i class="fas fa-map-marker-alt me-1"></i>${event.location}</span></div>
      </div>
      <span class="cuisine-tag">${capacity} seats</span>
    </div>
    <p class="text-muted mb-3">${event.description}</p>
    <div class="d-flex justify-content-between align-items-center">
      <span class="text-muted small"><i class="fas fa-users"></i> ${registered}/${capacity} registered</span>
      <span class="text-muted small">${spotsLeft} spots left</span>
    </div>
  `;
  const modal = new bootstrap.Modal(document.getElementById('eventDetailModal'));
  modal.show();
}
function navigateToRecipe(recipeId) {
  navigate('recipes');
  setTimeout(() => {
    const recipeCards = document.querySelectorAll('#recipes-grid .recipe-card');
    recipeCards.forEach((card, index) => {
      const recipe = getFilteredRecipes()[index];
      if (recipe && recipe.id === recipeId) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transform = 'scale(1.02)';
        card.style.boxShadow = '0 12px 28px rgba(0,0,0,.2)';
        card.style.border = '2px solid var(--ff-brand)';
        setTimeout(() => {
          card.style.transform = '';
          card.style.border = '';
        }, 2000);
        showToast(`Viewing: ${recipe.title}`, 'success');
      }
    });
  }, 300);
}

function getFilteredRecipes() {
  let filtered = [...recipes];
  if (currentRecipeFilter) filtered = filtered.filter(r => r.cuisine_type === currentRecipeFilter);
  if (currentDifficultyFilter) filtered = filtered.filter(r => r.difficulty_level === currentDifficultyFilter);
  if (currentSearchTerm) {
    const term = currentSearchTerm.toLowerCase();
    filtered = filtered.filter(r => r.title.toLowerCase().includes(term) || r.cuisine_type.toLowerCase().includes(term) || r.description.toLowerCase().includes(term));
  }
  return filtered;
}

// Load Functions
async function loadHeroRecipes() {
  const container = document.getElementById('hero-recipe-list');
  if (!container) return;
  const data = await apiGet('recipes.php', { limit: 4 });
  const list = data.success ? (data.data || []) : [];
  container.innerHTML = list.map(recipe => {
    const imageUrl = getAccurateImageForRecipe(recipe);
    return `
      <div class="hero-recipe-item" onclick="openRecipeModal(${recipe.recipe_id || recipe.id})">
        <div class="hero-recipe-img" style="background-image: url('${imageUrl}')"></div>
        <div class="hero-recipe-info">
          <h4>${recipe.title}</h4>
          <p><i class="fas fa-utensils me-1"></i>${recipe.cuisine_type} <span class="ms-2"><i class="fas fa-signal me-1"></i>${recipe.difficulty_level}</span></p>
        </div>
      </div>
    `;
  }).join('');
}

async function loadHomeData() {
  const recipesData = await apiGet('recipes.php', { featured: 'true', limit: 6 });
  const eventsData = await apiGet('events.php', { limit: 3 });
  const postsData = await apiGet('posts.php', { limit: 2 });

  const recipeList = recipesData.success ? (recipesData.data || []) : recipes;
  const eventList = eventsData.success ? (eventsData.data || []) : events;
  const postList = postsData.success ? (postsData.data || []) : posts;

  recipes = recipeList;
  events = eventList;
  posts = postList;

  const statRecipes = document.getElementById('stat-recipes');
  if (statRecipes) statRecipes.innerText = recipesData.total || recipeList.length || '0';
  const statMembers = document.getElementById('stat-members');
  if (statMembers) statMembers.innerText = '120+';
  const statEvents = document.getElementById('stat-events');
  if (statEvents) statEvents.innerText = eventList.length || '0';

  const homeRecipes = document.getElementById('home-recipes');
  if (homeRecipes) homeRecipes.innerHTML = recipeList.slice(0, 3).map(r => `<div class="col">${renderRecipeCard(r)}</div>`).join('');

  const homeEvents = document.getElementById('home-events');
  if (homeEvents) homeEvents.innerHTML = eventList.slice(0, 3).map(e => `<div class="col">${renderEventCard(e, false)}</div>`).join('');

  const homePosts = document.getElementById('home-posts');
  if (homePosts) homePosts.innerHTML = postList.slice(0, 2).map(p => `<div class="col-md-6">${renderPostCard(p)}</div>`).join('');
}

async function loadRecipes() {
  const grid = document.getElementById('recipes-grid');
  const noRecipesDiv = document.getElementById('no-recipes');
  if (!grid) return;

  const params = { limit: 24, offset: 0 };
  if (currentRecipeFilter) params.cuisine = currentRecipeFilter;
  if (currentDifficultyFilter) params.difficulty = currentDifficultyFilter;
  if (currentSearchTerm) params.search = currentSearchTerm;

  const data = await apiGet('recipes.php', params);
  const list = data.success ? (data.data || []) : recipes;
  recipes = list;

  if (list.length === 0) {
    grid.innerHTML = '';
    if (noRecipesDiv) noRecipesDiv.classList.remove('d-none');
  } else {
    grid.innerHTML = list.map(r => `<div class="col">${renderRecipeCard(r)}</div>`).join('');
    if (noRecipesDiv) noRecipesDiv.classList.add('d-none');
  }

  if (document.getElementById('cuisine-filters') && document.getElementById('cuisine-filters').children.length === 0) {
    const cuisines = [...new Set(list.map(r => r.cuisine_type).filter(Boolean))];
    document.getElementById('cuisine-filters').innerHTML = `<button class="filter-btn active" data-cuisine="" onclick="filterByCuisine('')">All Cuisines</button>` +
      cuisines.map(c => `<button class="filter-btn" data-cuisine="${c}" onclick="filterByCuisine('${c}')">${c}</button>`).join('');
  }

  if (document.getElementById('diff-filters') && document.getElementById('diff-filters').children.length === 0) {
    document.getElementById('diff-filters').innerHTML = `<button class="filter-btn active" data-diff="" onclick="filterByDifficulty('')">All Levels</button>
      <button class="filter-btn" data-diff="easy" onclick="filterByDifficulty('easy')">Easy</button>
      <button class="filter-btn" data-diff="medium" onclick="filterByDifficulty('medium')">Medium</button>
      <button class="filter-btn" data-diff="hard" onclick="filterByDifficulty('hard')">Hard</button>`;
  }
}

function filterByCuisine(cuisine) {
  currentRecipeFilter = cuisine;
  document.querySelectorAll('#cuisine-filters .filter-btn').forEach(btn => {
    if (btn.getAttribute('data-cuisine') === cuisine) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  loadRecipes();
}

function filterByDifficulty(difficulty) {
  currentDifficultyFilter = difficulty;
  document.querySelectorAll('#diff-filters .filter-btn').forEach(btn => {
    if (btn.getAttribute('data-diff') === difficulty) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  loadRecipes();
}

function searchRecipes() {
  const searchInput = document.getElementById('recipe-search');
  if (searchInput) currentSearchTerm = searchInput.value;
  loadRecipes();
}

async function loadEvents() {
  const grid = document.getElementById('events-grid');
  const data = await apiGet('events.php', { limit: 12 });
  const list = data.success ? (data.data || []) : events;
  events = list;
  if (grid) grid.innerHTML = list.map(e => `<div class="col">${renderEventCard(e, true)}</div>`).join('');
}


async function loadResourceVideos(category, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const data = await apiGet('resources.php', { category });
  const list = data.success ? (data.data || []).filter(r => (r.resource_type || 'video') === 'video') : [];
  if (!list.length) {
    container.innerHTML = '<div class="col"><div class="text-muted small">No videos yet.</div></div>';
    return;
  }
  container.innerHTML = list.map(r => `
    <div class="col">
      <div class="resource-video-card">
        <video controls src="${r.file_path}"></video>
        <div class="card-body">
          <h6 class="mb-1">${r.title}</h6>
          <p class="text-muted small mb-0">${r.description || ''}</p>
          <div class="resource-actions mt-3">
            <span class="text-muted small">${r.category || category}</span>
            <a class="btn btn-outline-primary btn-sm" href="${r.file_path}" download><i class="fas fa-download"></i> Download</a>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function loadPosts() {
  const feed = document.getElementById('posts-feed');
  const data = await apiGet('posts.php', { limit: 20 });
  const list = data.success ? (data.data || []) : posts;
  posts = list;
  if (feed) feed.innerHTML = list.map(p => renderPostCard(p)).join('');

  if (document.getElementById('type-filters') && document.getElementById('type-filters').children.length === 0) {
    document.getElementById('type-filters').innerHTML = `<button class="filter-btn active" data-type="" onclick="filterPosts('')">All Posts</button>
      <button class="filter-btn" data-type="tip" onclick="filterPosts('tip')">Tips</button>
      <button class="filter-btn" data-type="experience" onclick="filterPosts('experience')">Experiences</button>
      <button class="filter-btn" data-type="question" onclick="filterPosts('question')">Questions</button>
      <button class="filter-btn" data-type="review" onclick="filterPosts('review')">Reviews</button>`;
  }
}

function filterPosts(type) {
  document.querySelectorAll('#type-filters .filter-btn').forEach(btn => {
    if (btn.getAttribute('data-type') === type) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const filtered = type ? posts.filter(p => p.post_type === type) : posts;
  const feed = document.getElementById('posts-feed');
  const noPostsDiv = document.getElementById('no-posts');

  if (feed) {
    if (filtered.length === 0) {
      feed.innerHTML = '';
      if (noPostsDiv) noPostsDiv.classList.remove('d-none');
    } else {
      feed.innerHTML = filtered.map(p => renderPostCard(p)).join('');
      if (noPostsDiv) noPostsDiv.classList.add('d-none');
    }
  }
}

function loadMyEvents() {
  const container = document.getElementById('my-events-list');
  const noEventsDiv = document.getElementById('no-my-events');
  if (!currentUser || !currentUser.registeredEvents.length) {
    if (container) container.innerHTML = '';
    if (noEventsDiv) noEventsDiv.classList.remove('d-none');
    return;
  }
  if (noEventsDiv) noEventsDiv.classList.add('d-none');
  const userEvents = events.filter(e => currentUser.registeredEvents.includes(e.event_id || e.id));
  if (container) container.innerHTML = userEvents.map(e => `<div class="col">${renderEventCard(e, false)}</div>`).join('');
}

// Navigation & Auth
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function setMobileMenu(open) {
  if (!mobileMenu || !navToggle) return;
  mobileMenu.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
  document.body.classList.toggle('menu-open', open);
}

function closeMobileMenu() { setMobileMenu(false); }

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    setMobileMenu(!isOpen);
  });
  mobileMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });
}

function navigate(page) {
  if (typeof closeMobileMenu === 'function') closeMobileMenu();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById(`page-${page}`);
  if (targetPage) targetPage.classList.add('active');
  if (page === 'home') { loadHomeData(); loadHeroRecipes(); }
  if (page === 'recipes') loadRecipes();
  if (page === 'events') loadEvents();
  if (page === 'community') loadPosts();
  if (page === 'my-events') loadMyEvents();
  if (page === 'resources') loadResourceVideos('culinary', 'culinary-video-list');
  if (page === 'education') loadResourceVideos('educational', 'education-video-list');
  updateNavButtons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavButtons() {
  const isLoggedIn = !!currentUser;
  const loginBtn = document.getElementById('nav-login');
  const signupBtn = document.getElementById('nav-signup');
  const logoutBtn = document.getElementById('nav-logout');
  const addRecipeBtn = document.getElementById('add-recipe-btn');
  const myEventsNav = document.getElementById('nav-my-events');
  const myEventsNavMobile = document.getElementById('nav-my-events-mobile');
  const adminNav = document.getElementById('nav-admin');
  const greeting = document.getElementById('nav-greeting');
  
  if (loginBtn) loginBtn.classList.toggle('d-none', isLoggedIn);
  if (signupBtn) signupBtn.classList.toggle('d-none', isLoggedIn);
  if (logoutBtn) logoutBtn.classList.toggle('d-none', !isLoggedIn);
  if (addRecipeBtn) addRecipeBtn.classList.toggle('d-none', !isLoggedIn);
  if (myEventsNav) myEventsNav.style.display = isLoggedIn ? 'block' : 'none';
  if (myEventsNavMobile) myEventsNavMobile.style.display = isLoggedIn ? 'block' : 'none';
  if (adminNav) adminNav.classList.toggle('d-none', !(isLoggedIn && currentUser.role === 'admin'));
  if (greeting) {
    if (isLoggedIn && currentUser) greeting.innerHTML = `<i class="fas fa-user-circle me-1"></i>${currentUser.first_name}`;
    else greeting.innerHTML = '';
  }
}

function registerForEvent(eventId) {
  if (!currentUser) { showToast('Please log in to register', 'error'); navigate('login'); return; }
  if (!currentUser.registeredEvents) currentUser.registeredEvents = [];
  if (currentUser.registeredEvents.includes(eventId)) { showToast('Already registered', 'error'); return; }
  const event = events.find(e => (e.event_id || e.id) === eventId);
  const capacity = event.max_participants || event.capacity || 0;
  const registered = event.registered_count ?? event.current_participants ?? event.registered ?? 0;
  if (event && registered < capacity) {
    currentUser.registeredEvents.push(eventId);
    if (typeof event.registered_count !== 'undefined') event.registered_count++;
    if (typeof event.current_participants !== 'undefined') event.current_participants++;
    if (typeof event.registered !== 'undefined') event.registered++;
    localStorage.setItem('foodfusion_user', JSON.stringify(currentUser));
    showToast(`Registered for ${event.title}!`, 'success');
    loadEvents();
    if (document.getElementById('page-my-events').classList.contains('active')) loadMyEvents();
    if (document.getElementById('page-home').classList.contains('active')) loadHomeData();
  } else showToast('Event is full', 'error');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('foodfusion_user');
  updateNavButtons();
  navigate('home');
  showToast('Logged out successfully');
}

function requireAuth(callback) {
  if (currentUser) callback();
  else { showToast('Please log in first', 'error'); navigate('login'); }
}

function bindShowPassword(toggleId, inputIds) {
  const toggle = document.getElementById(toggleId);
  if (!toggle) return;
  const ids = Array.isArray(inputIds) ? inputIds : [inputIds];
  const inputs = ids.map(id => document.getElementById(id)).filter(Boolean);
  if (!inputs.length) return;
  toggle.addEventListener('change', () => {
    inputs.forEach(inp => { inp.type = toggle.checked ? 'text' : 'password'; });
  });
}
// Form Handlers
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  const wantsAdmin = document.getElementById('admin-login').checked;

  try {
    const res = await fetch('/foodfusion/api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, admin_login: wantsAdmin ? 1 : 0 })
    });
    const data = await res.json();

    if (data.success) {
      const userName = data.user.name || '';
      const parts = userName.split(' ');
      currentUser = {
        id: data.user.id || Date.now(),
        first_name: parts[0] || userName || 'User',
        last_name: parts.slice(1).join(' '),
        email: data.user.email || email,
        role: data.user.role || 'user',
        registeredEvents: []
      };
      localStorage.setItem('foodfusion_user', JSON.stringify(currentUser));
      updateNavButtons();
      if (wantsAdmin) {
        window.location.href = '/foodfusion/admin.php';
      } else {
        navigate('home');
      }
      showToast('Welcome back!', 'success');
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch (err) {
    showToast('Login failed. Please try again.', 'error');
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = e.target.password.value;
  const confirm = document.getElementById('password-confirm').value;
  if (password !== confirm) { showToast('Passwords do not match', 'error'); return; }

  const payload = {
    first_name: e.target.first_name.value,
    last_name: e.target.last_name.value,
    email: e.target.email.value,
    password
  };

  try {
    const res = await fetch('/foodfusion/api/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Account created! Please log in.', 'success');
      navigate('login');
    } else {
      showToast(data.message || 'Registration failed', 'error');
    }
  } catch (err) {
    showToast('Registration failed. Please try again.', 'error');
  }
});

document.getElementById('recipe-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const imageInput = document.getElementById('recipe-image-input');
  let imageData = '';
  let imagePath = '';
  if (imageInput.files.length) {
    try {
      const up = await uploadImageFile(imageInput.files[0]);
      if (up.success) imagePath = up.file_path;
      else { imageData = await readImageFile(imageInput.files[0]); }
    } catch {
      try { imageData = await readImageFile(imageInput.files[0]); } catch { imageData = ''; }
    }
  }
  const prep = parseInt(e.target.prep_time.value || '0', 10);
  const cook = parseInt(e.target.cook_time.value || '0', 10);
  const servings = parseInt(e.target.servings.value || '4', 10);
  const ingredientsArr = e.target.ingredients.value.split('\n').map(s => s.trim()).filter(Boolean);
  const instructionsArr = e.target.instructions.value.split('\n').map(s => s.trim()).filter(Boolean);

  const payload = {
    title: e.target.title.value,
    cuisine_type: e.target.cuisine_type.value,
    difficulty_level: e.target.difficulty_level.value,
    description: e.target.description.value,
    ingredients: ingredientsArr,
    instructions: instructionsArr,
    prep_time: Number.isNaN(prep) ? 0 : prep,
    cook_time: Number.isNaN(cook) ? 0 : cook,
    servings: Number.isNaN(servings) ? 4 : servings,
    image_path: imagePath || null
  };

  try {
    const res = await fetch('/foodfusion/api/recipes.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) {
      showToast(data.message || 'Failed to save recipe', 'error');
      return;
    }
    const newRecipe = {
      id: data.recipe_id || recipes.length + 1,
      title: payload.title,
      cuisine_type: payload.cuisine_type,
      difficulty_level: payload.difficulty_level,
      description: payload.description,
      ingredients: ingredientsArr,
      instructions: instructionsArr,
      prep_time: payload.prep_time,
      cook_time: payload.cook_time,
      servings: payload.servings,
      image: imageData,
      image_path: imagePath,
      author: currentUser.first_name || 'Anonymous',
      created_at: new Date().toISOString().split('T')[0]
    };
    recipes.unshift(newRecipe);
    bootstrap.Modal.getInstance(document.getElementById('recipeModal')).hide();
    if (document.getElementById('page-recipes').classList.contains('active')) loadRecipes();
    if (document.getElementById('page-home').classList.contains('active')) { loadHomeData(); loadHeroRecipes(); }
    showToast('Recipe published!');
    e.target.reset();
  } catch {
    showToast('Failed to save recipe', 'error');
  }
  const zone = document.getElementById('recipe-image-dropzone');
  const preview = document.getElementById('recipe-image-preview');
  if (zone) zone.classList.remove('has-preview');
  if (preview) preview.src = '';
  if (imageInput) imageInput.value = '';
});

document.getElementById('post-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const newPost = {
    id: posts.length + 1,
    title: e.target.title.value,
    post_type: e.target.post_type.value,
    content: e.target.content.value,
    cuisine_type: e.target.cuisine_type.value,
    author: currentUser.first_name || 'Anonymous',
    author_avatar: (currentUser?.first_name?.[0] || '<i class="fas fa-user"></i>'),
    created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };
  posts.unshift(newPost);
  bootstrap.Modal.getInstance(document.getElementById('postModal')).hide();
  if (document.getElementById('page-community').classList.contains('active')) loadPosts();
  if (document.getElementById('page-home').classList.contains('active')) loadHomeData();
  showToast('Post shared!');
  e.target.reset();
});

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('Message sent! We\'ll reply soon.');
  e.target.reset();
});

document.getElementById('footer-newsletter').addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('Subscribed to newsletter!');
  e.target.reset();
});

bindShowPassword('show-login-password', 'login-password');
bindShowPassword('show-register-passwords', ['password-input','password-confirm']);
const cookieBanner = document.getElementById('cookie-banner');
if (cookieBanner) {
  const shown = sessionStorage.getItem('ff_cookie_session_shown');
  if (!shown) {
    cookieBanner.classList.remove('d-none');
    sessionStorage.setItem('ff_cookie_session_shown', '1');
  }
  document.getElementById('cookie-accept').addEventListener('click', () => {
    localStorage.setItem('ff_cookie_consent', 'accepted');
    cookieBanner.classList.add('d-none');
  });
  document.getElementById('cookie-decline').addEventListener('click', () => {
    localStorage.setItem('ff_cookie_consent', 'declined');
    cookieBanner.classList.add('d-none');
  });
}
// Initialize
document.getElementById('footer-year').innerText = new Date().getFullYear();
initRecipeImageInput();
const savedUser = localStorage.getItem('foodfusion_user');
if (savedUser) { currentUser = JSON.parse(savedUser); updateNavButtons(); }
loadHomeData();
loadHeroRecipes();
updateNavButtons();



// Sign up pop-up
(function initSignupPopup(){
  const popup = document.getElementById('signup-popup');
  if (!popup) return;
  const closeBtn = document.getElementById('signup-popup-close');
  const ctaBtn = document.getElementById('signup-popup-btn');
  const loginBtn = document.getElementById('signup-popup-login');
  const backdrop = document.getElementById('signup-popup-backdrop');

  function hide() {
    popup.classList.remove('show');
    localStorage.setItem('ff_signup_popup', 'dismissed');
  }

  function show() { popup.classList.add('show'); }

  if (closeBtn) closeBtn.addEventListener('click', hide);
  if (backdrop) backdrop.addEventListener('click', hide);
  if (ctaBtn) ctaBtn.addEventListener('click', () => { hide(); navigate('register'); });
  if (loginBtn) loginBtn.addEventListener('click', () => { hide(); navigate('login'); });

  if (!currentUser) {
    setTimeout(show, 3500);
  }
})();
