<?php
$page_title = 'Culinary Resources';
$page_desc  = 'Downloadable culinary guides, recipe cards, and dashboard uploaded videos.';
include __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div class="container">
    <h1>Culinary Resources</h1>
    <p>Download guides and watch culinary videos uploaded by the community</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="grid-3">
      <div class="card resource-card h-100">
        <div class="card-body">
          <h5>Recipe Card PDF</h5>
          <p class="desc">A clean printable recipe template with ingredients and steps.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="downloadResource('/foodfusion/assets/resources/recipe-card-classic.txt', 'recipe-card-classic.pdf')">Download PDF</button>
        </div>
      </div>
      <div class="card resource-card h-100">
        <div class="card-body">
          <h5>Knife Skills Guide</h5>
          <p class="desc">Technique tips for safer, faster prep work in the kitchen.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="downloadResource('/foodfusion/assets/resources/knife-skills-guide.txt', 'knife-skills-guide.pdf')">Download PDF</button>
        </div>
      </div>
      <div class="card resource-card h-100">
        <div class="card-body">
          <h5>Kitchen Hacks</h5>
          <p class="desc">Quick references and practical kitchen efficiency notes.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="downloadResource('/foodfusion/assets/resources/kitchen-hacks-video-list.txt', 'kitchen-hacks-guide.pdf')">Download PDF</button>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <div class="section-header mb-3">
        <h2>Dashboard Videos</h2>
        <p>Culinary video uploads from the admin dashboard</p>
      </div>
      <div class="row row-cols-1 row-cols-md-2 g-4" id="culinary-video-list">
        <div class="col"><div class="text-muted">Loading videos...</div></div>
      </div>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
async function loadResourceVideos(category, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const data = await API.get('resources.php', { category });
  const list = data.success ? (data.data || []).filter(item => (item.resource_type || 'video') === 'video') : [];
  if (!list.length) {
    container.innerHTML = '<div class="col"><div class="text-muted small">No videos yet.</div></div>';
    return;
  }
  container.innerHTML = list.map(item => `
    <div class="col">
      <div class="resource-video-card">
        <video controls src="${item.file_path}"></video>
        <div class="card-body">
          <h6 class="mb-1">${item.title}</h6>
          <p class="text-muted small mb-0">${item.description || ''}</p>
          <div class="resource-actions mt-3">
            <span class="text-muted small">${item.category || 'culinary'}</span>
            <a class="btn btn-outline-primary btn-sm" href="${item.file_path}" download><i class="fas fa-download"></i> Download</a>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

loadResourceVideos('culinary', 'culinary-video-list');
</script>
