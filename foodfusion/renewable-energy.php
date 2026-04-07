<?php
$page_title = 'Renewable Energy';
$page_desc  = 'Downloadable renewable energy guides and educational dashboard uploaded videos.';
include __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div class="container">
    <h1>Renewable Energy</h1>
    <p>Download easy-to-read learning materials and watch the latest educational videos</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="grid-3">
      <div class="card resource-card h-100">
        <div class="card-body">
          <h5>Solar Basics</h5>
          <p class="desc">An overview of how solar energy works and why it matters.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="downloadResource('/foodfusion/assets/resources/renewable-solar-basics.txt', 'renewable-solar-basics.pdf')">Download PDF</button>
        </div>
      </div>
      <div class="card resource-card h-100">
        <div class="card-body">
          <h5>Wind Power 101</h5>
          <p class="desc">Clear guidance on wind power, benefits, and real-world use.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="downloadResource('/foodfusion/assets/resources/renewable-wind-power.txt', 'renewable-wind-power.pdf')">Download PDF</button>
        </div>
      </div>
      <div class="card resource-card h-100">
        <div class="card-body">
          <h5>Efficiency Infographic</h5>
          <p class="desc">Simple actions to reduce energy use and waste.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="downloadResource('/foodfusion/assets/resources/renewable-efficiency-infographic.txt', 'renewable-efficiency-infographic.pdf')">Download PDF</button>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <div class="section-header mb-3">
        <h2>Educational Videos</h2>
        <p>Renewable energy videos uploaded from the dashboard</p>
      </div>
      <div class="row row-cols-1 row-cols-md-2 g-4" id="renewable-video-list">
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
            <span class="text-muted small">${item.category || 'educational'}</span>
            <a class="btn btn-outline-primary btn-sm" href="${item.file_path}" download><i class="fas fa-download"></i> Download</a>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

loadResourceVideos('educational', 'renewable-video-list');
</script>
