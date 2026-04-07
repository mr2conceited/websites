const API_URL = '/foodfusion/api/admin.php';

const state = {
  recipes: [],
  events: [],
  resources: []
};

function qs(id) { return document.getElementById(id); }

function showModal(id) { qs(id).classList.add('show'); }
function hideModal(id) { qs(id).classList.remove('show'); }

function apiFetch(method, body = {}, params = {}) {
  const url = new URL(API_URL, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) url.searchParams.set(k, v);
  });
  return fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(body)
  }).then(r => r.json());
}

async function uploadResourceFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/foodfusion/api/upload.php?kind=video', { method: 'POST', body: fd });
  return res.json();
}

function pipeFromTextarea(text) {
  return (text || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .join('|');
}

function textareaFromPipe(text) {
  return (text || '').replace(/\|/g, '\n');
}

function setActivePanel(panel) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  qs('panel-' + panel).classList.add('active');
  document.querySelector(`.admin-tab[data-panel="${panel}"]`).classList.add('active');
}

async function loadRecipes() {
  const search = qs('recipe-search').value.trim();
  const status = qs('recipe-status').value;
  const data = await apiFetch('GET', {}, { resource: 'recipes', search, status });
  if (!data.success) return;
  state.recipes = data.data || [];
  const tbody = qs('recipes-table').querySelector('tbody');
  tbody.innerHTML = state.recipes.map(r => `
    <tr>
      <td>${r.title}</td>
      <td>${r.cuisine_type}</td>
      <td>${r.difficulty_level}</td>
      <td>${r.status}</td>
      <td>${r.featured ? 'Yes' : 'No'}</td>
      <td>${(r.updated_at || '').slice(0, 10)}</td>
      <td>
        <div class="admin-actions-inline">
          <button class="btn btn-outline-secondary btn-sm" data-edit-recipe="${r.recipe_id}">Edit</button>
          <button class="btn btn-outline-secondary btn-sm" data-del-recipe="${r.recipe_id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function loadEvents() {
  const search = qs('event-search').value.trim();
  const status = qs('event-status').value;
  const data = await apiFetch('GET', {}, { resource: 'events', search, status });
  if (!data.success) return;
  state.events = data.data || [];
  const tbody = qs('events-table').querySelector('tbody');
  tbody.innerHTML = state.events.map(e => `
    <tr>
      <td>${e.title}</td>
      <td>${e.event_date}</td>
      <td>${e.location}</td>
      <td>${e.status}</td>
      <td>${e.current_participants || 0}/${e.max_participants}</td>
      <td>${(e.updated_at || e.created_at || '').slice(0, 10)}</td>
      <td>
        <div class="admin-actions-inline">
          <button class="btn btn-outline-secondary btn-sm" data-edit-event="${e.event_id}">Edit</button>
          <button class="btn btn-outline-secondary btn-sm" data-del-event="${e.event_id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openRecipeEditor(recipe) {
  qs('recipe-modal-title').textContent = recipe ? 'Edit Recipe' : 'New Recipe';
  qs('recipe-id').value = recipe?.recipe_id || '';
  qs('recipe-title').value = recipe?.title || '';
  qs('recipe-cuisine').value = recipe?.cuisine_type || '';
  qs('recipe-difficulty').value = recipe?.difficulty_level || 'medium';
  qs('recipe-status-field').value = recipe?.status || 'published';
  qs('recipe-prep').value = recipe?.prep_time || '';
  qs('recipe-cook').value = recipe?.cook_time || '';
  qs('recipe-servings').value = recipe?.servings || '';
  qs('recipe-image').value = recipe?.image_path || '';
  qs('recipe-description').value = recipe?.description || '';
  qs('recipe-ingredients').value = textareaFromPipe(recipe?.ingredients || '');
  qs('recipe-instructions').value = textareaFromPipe(recipe?.instructions || '');
  qs('recipe-featured').checked = !!recipe?.featured;
  showModal('recipe-modal');
}

async function loadResources() {
  const search = qs('resource-search').value.trim();
  const category = qs('resource-category').value;
  const type = qs('resource-type').value;
  const data = await apiFetch('GET', {}, { resource: 'resources', search, category, type });
  if (!data.success) return;
  state.resources = data.data || [];
  const tbody = qs('resources-table').querySelector('tbody');
  tbody.innerHTML = state.resources.map(r => `
    <tr>
      <td>${r.title}</td>
      <td>${r.category}</td>
      <td>${r.resource_type}</td>
      <td>${(r.file_path || '').split('/').slice(-1)[0]}</td>
      <td>${(r.updated_at || r.created_at || '').slice(0, 10)}</td>
      <td>
        <div class="admin-actions-inline">
          <button class="btn btn-outline-secondary btn-sm" data-edit-resource="${r.resource_id}">Edit</button>
          <button class="btn btn-outline-secondary btn-sm" data-del-resource="${r.resource_id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openEventEditor(event) {
  qs('event-modal-title').textContent = event ? 'Edit Event' : 'New Event';
  qs('event-id').value = event?.event_id || '';
  qs('event-title').value = event?.title || '';
  qs('event-date').value = event?.event_date || '';
  qs('event-time').value = event?.event_time || '';
  qs('event-location').value = event?.location || '';
  qs('event-status-field').value = event?.status || 'upcoming';
  qs('event-capacity').value = event?.max_participants || '';
  qs('event-price').value = event?.price || '';
  qs('event-image').value = event?.image_path || '';
  qs('event-description').value = event?.description || '';
  showModal('event-modal');
}

function openResourceEditor(resource) {
  qs('resource-modal-title').textContent = resource ? 'Edit Resource' : 'New Resource';
  qs('resource-id').value = resource?.resource_id || '';
  qs('resource-title').value = resource?.title || '';
  qs('resource-category-field').value = resource?.category || 'culinary';
  qs('resource-type-field').value = resource?.resource_type || 'video';
  qs('resource-description').value = resource?.description || '';
  qs('resource-file-path').value = resource?.file_path || '';
  qs('resource-file-url').value = resource?.file_path || '';
  qs('resource-file').value = '';
  showModal('resource-modal');
}

document.querySelectorAll('.admin-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    setActivePanel(btn.dataset.panel);
  });
});

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => hideModal(btn.dataset.close));
});

qs('new-recipe').addEventListener('click', () => openRecipeEditor(null));
qs('new-event').addEventListener('click', () => openEventEditor(null));
qs('new-resource').addEventListener('click', () => openResourceEditor(null));

qs('recipe-search').addEventListener('input', () => loadRecipes());
qs('recipe-status').addEventListener('change', () => loadRecipes());
qs('event-search').addEventListener('input', () => loadEvents());
qs('event-status').addEventListener('change', () => loadEvents());
qs('resource-search').addEventListener('input', () => loadResources());
qs('resource-category').addEventListener('change', () => loadResources());
qs('resource-type').addEventListener('change', () => loadResources());

qs('recipes-table').addEventListener('click', (e) => {
  const editId = e.target.getAttribute('data-edit-recipe');
  const delId = e.target.getAttribute('data-del-recipe');
  if (editId) {
    const recipe = state.recipes.find(r => String(r.recipe_id) === String(editId));
    openRecipeEditor(recipe);
  }

  if (delId) {
    if (!confirm('Delete this recipe?')) return;
    apiFetch('DELETE', { resource: 'recipe', recipe_id: delId }).then(loadRecipes);
  }
});

qs('events-table').addEventListener('click', (e) => {
  const editId = e.target.getAttribute('data-edit-event');
  const delId = e.target.getAttribute('data-del-event');
  if (editId) {
    const event = state.events.find(ev => String(ev.event_id) === String(editId));
    openEventEditor(event);
  }
  if (delId) {
    if (!confirm('Delete this event?')) return;
    apiFetch('DELETE', { resource: 'event', event_id: delId }).then(loadEvents);
  }
});

qs('recipe-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    resource: 'recipe',
    recipe_id: qs('recipe-id').value || null,
    title: qs('recipe-title').value.trim(),
    cuisine_type: qs('recipe-cuisine').value.trim(),
    difficulty_level: qs('recipe-difficulty').value,
    status: qs('recipe-status-field').value,
    prep_time: qs('recipe-prep').value,
    cook_time: qs('recipe-cook').value,
    servings: qs('recipe-servings').value,
    image_path: qs('recipe-image').value.trim(),
    description: qs('recipe-description').value.trim(),
    ingredients: pipeFromTextarea(qs('recipe-ingredients').value),
    instructions: pipeFromTextarea(qs('recipe-instructions').value),
    featured: qs('recipe-featured').checked ? 1 : 0
  };
  const method = body.recipe_id ? 'PUT' : 'POST';
  const res = await apiFetch(method, body);
  if (res.success) {
    hideModal('recipe-modal');
    loadRecipes();
  } else {
    alert(res.message || 'Save failed');
  }
});

qs('event-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    resource: 'event',
    event_id: qs('event-id').value || null,
    title: qs('event-title').value.trim(),
    description: qs('event-description').value.trim(),
    event_date: qs('event-date').value,
    event_time: qs('event-time').value,
    location: qs('event-location').value.trim(),
    max_participants: qs('event-capacity').value,
    price: qs('event-price').value,
    status: qs('event-status-field').value,
    image_path: qs('event-image').value.trim()
  };
  const method = body.event_id ? 'PUT' : 'POST';
  const res = await apiFetch(method, body);
  if (res.success) {
    hideModal('event-modal');
    loadEvents();
  } else {
    alert(res.message || 'Save failed');
  }
});

loadRecipes();
loadEvents();
loadResources();

qs('resource-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const filePath = qs('resource-file-path').value.trim() || qs('resource-file-url').value.trim();
  if (!filePath) { alert('Please upload a video or provide a file URL.'); return; }
  const body = {
    resource: 'resource',
    resource_id: qs('resource-id').value || null,
    title: qs('resource-title').value.trim(),
    category: qs('resource-category-field').value,
    resource_type: qs('resource-type-field').value,
    description: qs('resource-description').value.trim(),
    file_path: filePath
  };
  const method = body.resource_id ? 'PUT' : 'POST';
  const res = await apiFetch(method, body);
  if (res.success) {
    hideModal('resource-modal');
    loadResources();
  } else {
    alert(res.message || 'Save failed');
  }
});

qs('resource-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const up = await uploadResourceFile(file);
  if (up.success) {
    qs('resource-file-path').value = up.file_path;
    qs('resource-file-url').value = up.file_path;
  } else {
    alert(up.message || 'Upload failed');
  }
});

qs('resources-table').addEventListener('click', (e) => {
  const editId = e.target.getAttribute('data-edit-resource');
  const delId = e.target.getAttribute('data-del-resource');
  if (editId) {
    const res = state.resources.find(r => String(r.resource_id) === String(editId));
    openResourceEditor(res);
  }
  if (delId) {
    if (!confirm('Delete this resource?')) return;
    apiFetch('DELETE', { resource: 'resource', resource_id: delId }).then(loadResources);
  }
});
