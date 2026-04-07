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
    <div class="detail-split">
      <div class="detail-media" style="background-image:url('${imageUrl}')"></div>
      <div class="detail-content">
        <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
          <div>
            <h3 class="mb-1">${recipe.title || 'Recipe'}</h3>
            <div class="text-muted small">${recipe.cuisine_type || ''} · ${recipe.difficulty_level || ''}</div>
          </div>
          <button type="button" class="btn btn-outline-primary btn-sm" onclick="downloadRecipe(${recipe.recipe_id || recipe.id})"><i class="fas fa-download"></i> Download</button>
        </div>
        <p class="text-muted small mb-3">${recipe.description || ''}</p>
        <div class="detail-meta-grid mb-3">
          <div class="detail-mini"><strong>${Number(recipe.prep_time || 0)}</strong><span>Prep min</span></div>
          <div class="detail-mini"><strong>${Number(recipe.cook_time || 0)}</strong><span>Cook min</span></div>
          <div class="detail-mini"><strong>${recipe.servings || 'N/A'}</strong><span>Servings</span></div>
        </div>
        <div class="detail-stack">
          <div>
            <h5>Ingredients</h5>
            <ul class="detail-list">${ingredients.map(item => `<li>${item}</li>`).join('')}</ul>
          </div>
          <div>
            <h5>Instructions</h5>
            <ol class="detail-list ordered">${instructions.map(step => `<li>${step}</li>`).join('')}</ol>
          </div>
        </div>
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
    <div class="detail-split">
      <div class="detail-media" style="background-image:url('${imageUrl}')"></div>
      <div class="detail-content">
        <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
          <div>
            <h3 class="mb-1">${event.title || 'Event'}</h3>
            <div class="text-muted small">${event.date || event.event_date || ''} · ${event.location || ''}</div>
          </div>
          <span class="cuisine-tag">${capacity} seats</span>
        </div>
        <p class="text-muted small mb-3">${event.description || ''}</p>
        <div class="detail-meta-grid">
          <div class="detail-mini"><strong>${capacity}</strong><span>Capacity</span></div>
          <div class="detail-mini"><strong>${registered}</strong><span>Registered</span></div>
          <div class="detail-mini"><strong>${spotsLeft}</strong><span>Spots left</span></div>
        </div>
      </div>
    </div>
  `;

  showModal('event-detail-modal');
}
