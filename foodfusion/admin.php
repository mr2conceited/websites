<?php
require_once __DIR__ . '/includes/User.php';

if (!User::isLoggedIn() || (($_SESSION['user_role'] ?? '') !== 'admin')) {
  http_response_code(403);
  echo 'Access denied';
  exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard — FoodFusion</title>
  <link rel="stylesheet" href="/foodfusion/assets/css/style.css">
  <link rel="stylesheet" href="/foodfusion/assets/css/admin.css">
</head>
<body>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-brand">FoodFusion <span>Admin</span></div>
      <button class="admin-tab active" data-panel="recipes">Manage Recipes</button>
      <button class="admin-tab" data-panel="events">Manage Events</button>
      <button class="admin-tab" data-panel="resources">Manage Resources</button>
      <a class="admin-link" href="/foodfusion/">Back to site</a>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p class="text-muted">Create, edit, and manage recipes and events.</p>
        </div>
        <div class="admin-user">Signed in as Admin</div>
      </header>

      <section class="admin-panel active" id="panel-recipes">
        <div class="admin-toolbar">
          <input type="search" id="recipe-search" placeholder="Search recipes...">
          <select id="recipe-status">
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button class="btn btn-primary" id="new-recipe">New Recipe</button>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table" id="recipes-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Cuisine</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <section class="admin-panel" id="panel-events">
        <div class="admin-toolbar">
          <input type="search" id="event-search" placeholder="Search events...">
          <select id="event-status">
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button class="btn btn-primary" id="new-event">New Event</button>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table" id="events-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>
<section class="admin-panel" id="panel-resources">
  <div class="admin-toolbar">
    <input type="search" id="resource-search" placeholder="Search resources...">
    <select id="resource-category">
      <option value="">All Categories</option>
      <option value="culinary">Culinary</option>
      <option value="educational">Educational</option>
    </select>
    <select id="resource-type">
      <option value="">All Types</option>
      <option value="video">Video</option>
      <option value="download">Download</option>
    </select>
    <button class="btn btn-primary" id="new-resource">New Resource</button>
  </div>
  <div class="admin-table-wrap">
    <table class="admin-table" id="resources-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Type</th>
          <th>File</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
</section>

    </main>
  </div>

  <div class="admin-modal" id="recipe-modal">
    <div class="admin-modal-card">
      <div class="admin-modal-header">
        <h3 id="recipe-modal-title">New Recipe</h3>
        <button class="admin-close" data-close="recipe-modal">×</button>
      </div>
      <form id="recipe-form" class="admin-form">
        <input type="hidden" name="recipe_id" id="recipe-id">
        <div class="admin-grid">
          <label>Title
            <input type="text" name="title" id="recipe-title" required>
          </label>
          <label>Cuisine
            <input type="text" name="cuisine_type" id="recipe-cuisine" required>
          </label>
          <label>Difficulty
            <select name="difficulty_level" id="recipe-difficulty">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>Status
            <select name="status" id="recipe-status-field">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>Prep (min)
            <input type="number" name="prep_time" id="recipe-prep" min="0">
          </label>
          <label>Cook (min)
            <input type="number" name="cook_time" id="recipe-cook" min="0">
          </label>
          <label>Servings
            <input type="number" name="servings" id="recipe-servings" min="1">
          </label>
          <label>Image URL
            <input type="text" name="image_path" id="recipe-image">
          </label>
          <label class="admin-check">
            <input type="checkbox" id="recipe-featured"> Featured
          </label>
        </div>
        <label>Description
          <textarea name="description" id="recipe-description" rows="3" required></textarea>
        </label>
        <label>Ingredients (one per line)
          <textarea name="ingredients" id="recipe-ingredients" rows="5" required></textarea>
        </label>
        <label>Instructions (one per line)
          <textarea name="instructions" id="recipe-instructions" rows="6" required></textarea>
        </label>
        <div class="admin-actions">
          <button type="button" class="btn btn-outline-secondary" data-close="recipe-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Recipe</button>
        </div>
      </form>
    </div>
  </div>

<div class="admin-modal" id="resource-modal">
  <div class="admin-modal-card">
    <div class="admin-modal-header">
      <h3 id="resource-modal-title">New Resource</h3>
      <button class="admin-close" data-close="resource-modal">?</button>
    </div>
    <form id="resource-form" class="admin-form">
      <input type="hidden" name="resource_id" id="resource-id">
      <input type="hidden" name="file_path" id="resource-file-path">
      <div class="admin-grid">
        <label>Title
          <input type="text" name="title" id="resource-title" required>
        </label>
        <label>Category
          <select name="category" id="resource-category-field" required>
            <option value="culinary">Culinary</option>
            <option value="educational">Educational</option>
          </select>
        </label>
        <label>Type
          <select name="resource_type" id="resource-type-field" required>
            <option value="video">Video</option>
            <option value="download">Download</option>
          </select>
        </label>
        <label>File URL (optional)
          <input type="text" name="file_url" id="resource-file-url" placeholder="/foodfusion/uploads/...">
        </label>
      </div>
      <label>Upload Video/File
        <input type="file" id="resource-file" accept="video/mp4,video/webm,video/ogg">
        <small class="text-muted">Supported: MP4, WebM, OGG (max 50MB)</small>
      </label>
      <label>Description
        <textarea name="description" id="resource-description" rows="3"></textarea>
      </label>
      <div class="admin-actions">
        <button type="button" class="btn btn-outline-secondary" data-close="resource-modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Resource</button>
      </div>
    </form>
  </div>
</div>


  <div class="admin-modal" id="event-modal">
    <div class="admin-modal-card">
      <div class="admin-modal-header">
        <h3 id="event-modal-title">New Event</h3>
        <button class="admin-close" data-close="event-modal">×</button>
      </div>
      <form id="event-form" class="admin-form">
        <input type="hidden" name="event_id" id="event-id">
        <div class="admin-grid">
          <label>Title
            <input type="text" name="title" id="event-title" required>
          </label>
          <label>Date
            <input type="date" name="event_date" id="event-date" required>
          </label>
          <label>Time
            <input type="time" name="event_time" id="event-time">
          </label>
          <label>Location
            <input type="text" name="location" id="event-location" required>
          </label>
          <label>Status
            <select name="status" id="event-status-field">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label>Capacity
            <input type="number" name="max_participants" id="event-capacity" min="1">
          </label>
          <label>Price
            <input type="number" name="price" id="event-price" min="0" step="0.01">
          </label>
          <label>Image URL
            <input type="text" name="image_path" id="event-image">
          </label>
        </div>
        <label>Description
          <textarea name="description" id="event-description" rows="4" required></textarea>
        </label>
        <div class="admin-actions">
          <button type="button" class="btn btn-outline-secondary" data-close="event-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Event</button>
        </div>
      </form>
    </div>
  </div>

  <script src="/foodfusion/assets/js/admin.js"></script>
</body>
</html>
