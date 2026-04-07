const API_BASE = '/foodfusion/api';

let currentUser = null;

const API = {
  async get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/${endpoint}${query ? `?${query}` : ''}`, {
      credentials: 'same-origin'
    });
    return response.json();
  },

  async post(endpoint, body = {}) {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body)
    });
    return response.json();
  },

  async del(endpoint, body = {}) {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body)
    });
    return response.json();
  }
};

function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function toast(message, type = 'success', timeout = 3200) {
  if (!message) return;
  const container = ensureToastContainer();
  const toastEl = document.createElement('div');
  toastEl.className = `ff-toast ${type === 'error' ? 'err' : 'ok'}`;
  toastEl.textContent = message;
  container.appendChild(toastEl);
  window.setTimeout(() => toastEl.remove(), timeout);
}

function updateNavAuth() {
  const nameEl = document.getElementById('nav-user-name');
  const loginEl = document.getElementById('nav-login');
  const registerEl = document.getElementById('nav-register');
  const adminEl = document.getElementById('nav-admin');
  const logoutEl = document.getElementById('nav-logout');

  if (currentUser) {
    if (nameEl) nameEl.textContent = currentUser.name || currentUser.email || '';
    if (loginEl) loginEl.classList.add('hidden');
    if (registerEl) registerEl.classList.add('hidden');
    if (logoutEl) logoutEl.classList.remove('hidden');
    if (adminEl) adminEl.classList.toggle('hidden', currentUser.role !== 'admin');
  } else {
    if (nameEl) nameEl.textContent = '';
    if (loginEl) loginEl.classList.remove('hidden');
    if (registerEl) registerEl.classList.remove('hidden');
    if (logoutEl) logoutEl.classList.add('hidden');
    if (adminEl) adminEl.classList.add('hidden');
  }
}

async function checkAuth() {
  try {
    const data = await API.get('check-session.php');
    currentUser = data.logged_in ? data.user : null;
  } catch {
    currentUser = null;
  }
  updateNavAuth();
  return currentUser;
}

function requireAuth(callback) {
  if (currentUser) {
    callback();
    return;
  }
  window.location.href = '/foodfusion/login.php';
}

function showModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('show');
  document.body.classList.add('menu-open');
}

function hideModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('show');
  modal.classList.add('hidden');
  document.body.classList.remove('menu-open');
}

function skeletonCards(container, count = 3) {
  if (!container) return;
  container.innerHTML = '<div class="skeleton skel-card"></div>'.repeat(count);
}

const recipeImageLibrary = {
  'Classic Shakshuka': 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg',
  'Authentic Jollof Rice': 'assets/images/successcard-jollof-4659747_1920 (1).jpg',
  'Jollof Rice': 'assets/images/successcard-jollof-4659747_1920 (1).jpg',
  'Miso Ramen': 'assets/images/113.jpg',
  'Paella Valenciana': 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg',
  'Butter Chicken': 'assets/images/sti300p-barbecue-4465142_1920.jpg',
  'Tiramisu': 'assets/images/land_of_aahs-matcha-marshmallow-8692659_1920.jpg',
  'Matcha Tiramisu': 'assets/images/land_of_aahs-matcha-marshmallow-8692659_1920.jpg',
  'Suya Skewers': 'assets/images/sti300p-barbecue-4465142_1920.jpg',
  'Spanish Tortilla': 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg',
  'Mediterranean': 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg',
  'West African': 'assets/images/successcard-jollof-4659747_1920 (1).jpg',
  'Japanese': 'assets/images/113.jpg',
  'Spanish': 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg',
  'Italian': 'assets/images/land_of_aahs-matcha-marshmallow-8692659_1920.jpg',
  'Indian': 'assets/images/sti300p-barbecue-4465142_1920.jpg',
  'default': 'assets/images/food-svgrepo-com.svg'
};

function getRecipeImage(recipe = {}) {
  if (recipe.image) return recipe.image;
  if (recipe.image_path) return recipe.image_path;
  if (recipe.title && recipeImageLibrary[recipe.title]) return recipeImageLibrary[recipe.title];
  if (recipe.cuisine_type && recipeImageLibrary[recipe.cuisine_type]) return recipeImageLibrary[recipe.cuisine_type];
  return recipeImageLibrary.default;
}

function cuisineEmoji() {
  return '<i class="fas fa-utensils"></i>';
}

function diffBadge(level) {
  const label = String(level || 'medium');
  const icon = label === 'easy' ? 'seedling' : label === 'hard' ? 'pepper-hot' : 'signal';
  return `<span class="tag"><i class="fas fa-${icon}"></i> ${label.charAt(0).toUpperCase() + label.slice(1)}</span>`;
}

function parseRecipeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try { return JSON.parse(trimmed).filter(Boolean); } catch {}
    }
    return trimmed.split(/\n|\|/).map(item => item.trim()).filter(Boolean);
  }
  return [];
}

function buildRecipeDownloadText(recipe) {
  const ingredients = parseRecipeList(recipe.ingredients);
  const instructions = parseRecipeList(recipe.instructions);
  const prep = Number(recipe.prep_time || 0);
  const cook = Number(recipe.cook_time || 0);
  const total = prep + cook;
  const author = (recipe.author || `${recipe.first_name || ''} ${recipe.last_name || ''}`.trim() || 'Chef');

  return [
    `Recipe: ${recipe.title || 'Recipe'}`,
    `Cuisine: ${recipe.cuisine_type || 'N/A'}`,
    `Difficulty: ${recipe.difficulty_level || 'N/A'}`,
    `Prep Time: ${prep} min`,
    `Cook Time: ${cook} min`,
    `Total Time: ${total} min`,
    `Servings: ${recipe.servings || 'N/A'}`,
    `Author: ${author}`,
    '',
    'Ingredients:',
    ...ingredients.map(item => `- ${item}`),
    '',
    'Instructions:',
    ...instructions.map((step, index) => `${index + 1}. ${step}`)
  ].join('\n');
}

function downloadRecipe(recipeId) {
  const recipeStore = window.__recipeStore || window.recipes || [];
  const recipe = recipeStore.find(item => (item.recipe_id || item.id) === recipeId);
  if (!recipe) {
    toast('Recipe not found.', 'error');
    return;
  }

  const safeName = String(recipe.title || 'recipe').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filename = `${safeName || 'recipe'}.pdf`;
  const content = buildRecipeDownloadText(recipe);

  if (window.jspdf?.jsPDF) {
    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(recipe.title || 'Recipe', 40, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(content, 515), 40, 80);
    doc.save(filename);
    return;
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName || 'recipe'}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadResource(url, filename) {
  if (!url) return;
  const targetName = filename || url.split('/').pop() || 'download';
  const pdfName = targetName.replace(/\.[^.]+$/, '') + '.pdf';

  const makePdf = (content) => {
    if (window.jspdf?.jsPDF) {
      const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(targetName.replace(/\.[^.]+$/, ''), 40, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(doc.splitTextToSize(content, 515), 40, 80);
      doc.save(pdfName);
      return;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = targetName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  };

  fetch(url, { credentials: 'same-origin' })
    .then(response => response.text())
    .then(makePdf)
    .catch(() => {
      const link = document.createElement('a');
      link.href = url;
      link.download = targetName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
}

function openRecipeDetails(recipeId) {
  const recipeStore = window.__recipeStore || window.recipes || [];
  const recipe = recipeStore.find(item => (item.recipe_id || item.id) === recipeId);
  const modal = document.getElementById('recipe-detail-modal');
  const body = document.getElementById('recipe-detail-body');
  if (!recipe || !modal || !body) return;

  const imageUrl = getRecipeImage(recipe);
  const ingredients = parseRecipeList(recipe.ingredients);
  const instructions = parseRecipeList(recipe.instructions);

  body.innerHTML = `
    <div class="recipe-detail-hero" style="background-image:url('${imageUrl}');height:240px;border-radius:18px;background-size:cover;background-position:center;margin-bottom:18px"></div>
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
      <div>
        <h3 class="mb-1">${recipe.title || 'Recipe'}</h3>
        <div class="text-muted small">${recipe.cuisine_type || ''} · ${recipe.difficulty_level || ''}</div>
      </div>
      <button type="button" class="btn btn-outline-primary btn-sm" onclick="downloadRecipe(${recipe.recipe_id || recipe.id})"><i class="fas fa-download"></i> Download</button>
    </div>
    <p class="text-muted mb-4">${recipe.description || ''}</p>
    <div class="row g-3 mb-4">
      <div class="col-sm-4"><div class="card h-100"><div class="card-body"><strong>${Number(recipe.prep_time || 0)}</strong><div class="small text-muted">Prep min</div></div></div></div>
      <div class="col-sm-4"><div class="card h-100"><div class="card-body"><strong>${Number(recipe.cook_time || 0)}</strong><div class="small text-muted">Cook min</div></div></div></div>
      <div class="col-sm-4"><div class="card h-100"><div class="card-body"><strong>${recipe.servings || 'N/A'}</strong><div class="small text-muted">Servings</div></div></div></div>
    </div>
    <div class="row g-4">
      <div class="col-md-5">
        <h5>Ingredients</h5>
        <ul class="text-muted small ps-3 mb-0">${ingredients.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
      <div class="col-md-7">
        <h5>Instructions</h5>
        <ol class="text-muted small ps-3 mb-0">${instructions.map(step => `<li>${step}</li>`).join('')}</ol>
      </div>
    </div>
  `;

  showModal('recipe-detail-modal');
}

function openEventDetails(eventId) {
  const eventStore = window.__eventStore || window.events || [];
  const event = eventStore.find(item => (item.event_id || item.id) === eventId);
  const modal = document.getElementById('event-detail-modal');
  const body = document.getElementById('event-detail-body');
  if (!event || !modal || !body) return;

  const eventTitleKey = (event.title || '').toLowerCase().trim();
  const imageMap = {
    'Mediterranean Cooking Workshop': 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg',
    'Sushi Making Class': 'assets/images/isakarakus-old-man-2879303_1920.jpg',
    'West African Feast': 'assets/images/successcard-jollof-4659747_1920 (1).jpg',
    'Knife Workshop': 'assets/images/congerdesign-knife-block-1897410_1920.jpg',
    'default': 'assets/images/elegancenairobi-african-food-3957740_1920.jpg'
  };
  const imageUrl = event.image_path || event.image || imageMap[event.title] || imageMap[eventTitleKey] || imageMap.default;
  const capacity = Number(event.max_participants || event.capacity || 0);
  const registered = Number(event.registered_count ?? event.current_participants ?? event.registered ?? 0);
  const spotsLeft = Math.max(0, capacity - registered);

  body.innerHTML = `
    <div class="recipe-detail-hero" style="background-image:url('${imageUrl}');height:240px;border-radius:18px;background-size:cover;background-position:center;margin-bottom:18px"></div>
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
      <div>
        <h3 class="mb-1">${event.title || 'Event'}</h3>
        <div class="text-muted small">${event.date || event.event_date || ''} · ${event.location || ''}</div>
      </div>
      <span class="cuisine-tag">${capacity} seats</span>
    </div>
    <p class="text-muted mb-4">${event.description || ''}</p>
    <div class="row g-3">
      <div class="col-sm-4"><div class="card h-100"><div class="card-body"><strong>${capacity}</strong><div class="small text-muted">Capacity</div></div></div></div>
      <div class="col-sm-4"><div class="card h-100"><div class="card-body"><strong>${registered}</strong><div class="small text-muted">Registered</div></div></div></div>
      <div class="col-sm-4"><div class="card h-100"><div class="card-body"><strong>${spotsLeft}</strong><div class="small text-muted">Spots left</div></div></div></div>
    </div>
  `;

  showModal('event-detail-modal');
}

function fmtEventDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { day: '--', month: '---' };
  }
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  };
}

function avatarInitials(firstName = '', lastName = '') {
  return `${String(firstName).charAt(0)}${String(lastName).charAt(0)}`.trim().toUpperCase() || 'U';
}

function timeAgo(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '';
  const diffSeconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hr ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} day${Math.floor(diffSeconds / 86400) === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('nav-logout')?.addEventListener('click', async () => {
    await API.post('logout.php');
    currentUser = null;
    updateNavAuth();
    toast('Logged out successfully', 'success');
    window.location.href = '/foodfusion/';
  });

  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        hideModal(overlay.id);
      }
    });
  });

  checkAuth();
});
