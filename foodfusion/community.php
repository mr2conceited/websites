<?php
$page_title = 'Community';
$page_desc  = 'Share cooking tips, questions and experiences with the FoodFusion community.';
include __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div class="container">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px">
      <div>
        <h1>💬 Community</h1>
        <p>Tips, questions and stories from fellow food lovers</p>
      </div>
      <button class="btn btn-primary" id="new-post-btn">+ New Post</button>
    </div>
  </div>
</div>

<section class="section">
  <div class="container">

    <!-- Type filters -->
    <div class="filter-bar">
      <button class="filter-btn active" data-type="">All Posts</button>
      <button class="filter-btn" data-type="tip">Tips</button>
      <button class="filter-btn" data-type="experience">Experiences</button>
      <button class="filter-btn" data-type="question">Questions</button>
      <button class="filter-btn" data-type="review">Reviews</button>
    </div>

    <div id="posts-feed" style="display:flex;flex-direction:column;gap:20px">
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
    </div>

    <div id="no-posts" class="empty-state hidden">
      <div class="icon">💬</div>
      <h3>No posts yet</h3>
      <p>Be the first to share a tip or experience!</p>
    </div>

    <div style="text-align:center;margin-top:32px">
      <button class="btn btn-ghost" id="load-more-posts">Load more</button>
    </div>
  </div>
</section>

<!-- New Post Modal -->
<div class="modal-overlay hidden" id="post-modal">
  <div class="modal">
    <div class="modal-header">
      <h3>Share a Post</h3>
      <button class="modal-close" onclick="hideModal('post-modal')">×</button>
    </div>
    <div class="modal-body">
      <div id="post-form-msg"></div>
      <form id="post-form">
        <div class="form-group">
          <label>Title *</label>
          <input type="text" name="title" required placeholder="What's this post about?">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Type *</label>
            <select name="post_type" required>
              <option value="tip">Tip</option>
              <option value="experience">Experience</option>
              <option value="question">Question</option>
              <option value="review">Review</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cuisine (optional)</label>
            <select name="cuisine_type">
              <option value="">Any cuisine</option>
              <option>Mediterranean</option><option>West African</option>
              <option>Japanese</option><option>Spanish</option>
              <option>Italian</option><option>Indian</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Content *</label>
          <textarea name="content" rows="6" required placeholder="Share your tip, experience or question here…"></textarea>
        </div>
        <button type="submit" class="btn btn-primary w-full">Publish Post</button>
      </form>
    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
let postsOffset = 0, activeType = '';
const postsLimit = 10;

const TYPE_LABELS = { tip: '💡 Tip', experience: '✨ Experience', question: '❓ Question', review: '⭐ Review' };

async function loadPosts(reset = false) {
  if (reset) postsOffset = 0;
  const feed = document.getElementById('posts-feed');
  if (reset) feed.innerHTML = '<div class="skeleton skel-card"></div>'.repeat(3);

  const params = { limit: postsLimit, offset: postsOffset };
  if (activeType) params.type = activeType;

  const data = await API.get('posts.php', params);
  const noEl = document.getElementById('no-posts');

  if (data.success && data.data?.length) {
    noEl.classList.add('hidden');
    const html = data.data.map(p => `
      <div class="card post-card" id="post-${p.post_id}">
        <div class="post-author">
          <div class="avatar">${avatarInitials(p.first_name, p.last_name)}</div>
          <div>
            <div class="post-author-name">${p.first_name} ${p.last_name}</div>
            <div class="post-author-time">${timeAgo(p.created_at)}</div>
          </div>
          <span class="tag" style="margin-left:auto">${TYPE_LABELS[p.post_type] ?? p.post_type}</span>
          ${p.cuisine_type ? `<span class="tag tag-green">${p.cuisine_type}</span>` : ''}
        </div>
        <h3 style="font-size:1.05rem;margin-bottom:8px">${p.title}</h3>
        <p style="font-size:.9rem;color:var(--clr-muted);line-height:1.6">${p.content}</p>
        <div class="post-actions" style="margin-top:14px">
          <button class="like-btn" data-id="${p.post_id}" data-count="${p.likes_count}">
            ❤ <span class="like-count">${p.likes_count}</span>
          </button>
          <span class="text-sm text-muted">💬 ${p.comments_count} comments</span>
        </div>
      </div>`).join('');
    feed.innerHTML = reset ? html : feed.innerHTML + html;
    postsOffset += data.data.length;

    // Attach like handlers
    feed.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', () => handleLike(btn));
    });

    document.getElementById('load-more-posts').classList.toggle('hidden', data.data.length < postsLimit);
  } else {
    if (reset) { feed.innerHTML = ''; noEl.classList.remove('hidden'); }
    document.getElementById('load-more-posts').classList.add('hidden');
  }
}

async function handleLike(btn) {
  if (!currentUser) { toast('Please log in to like posts', 'error'); return; }
  const id = btn.dataset.id;
  const data = await API.post('like-post.php', { post_id: id });
  if (data.success) {
    const countEl = btn.querySelector('.like-count');
    let c = parseInt(countEl.textContent) || 0;
    countEl.textContent = data.action === 'liked' ? c + 1 : Math.max(0, c - 1);
    btn.classList.toggle('liked', data.action === 'liked');
  }
}

// Filter buttons
document.querySelectorAll('.filter-bar .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeType = btn.dataset.type;
    loadPosts(true);
  });
});

document.getElementById('load-more-posts').addEventListener('click', () => loadPosts(false));

// New post
document.getElementById('new-post-btn').addEventListener('click', () => {
  if (!currentUser) { window.location.href = '/foodfusion/login.php'; return; }
  showModal('post-modal');
});

document.getElementById('post-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  const msgEl = document.getElementById('post-form-msg');
  const data = await API.post('posts.php', body);
  if (data.success) {
    toast('Post published!', 'success');
    hideModal('post-modal');
    e.target.reset();
    loadPosts(true);
  } else {
    msgEl.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
  }
});

(async () => { await checkAuth(); loadPosts(true); })();
</script>
