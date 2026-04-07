<?php
$page_title = 'Events';
$page_desc  = 'Join hands-on cooking workshops and events organised by FoodFusion community chefs.';
include __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div class="container">
    <h1>📅 Events &amp; Workshops</h1>
    <p>Get hands-on experience with expert community chefs</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="grid-3" id="events-grid">
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
      <div class="skeleton skel-card"></div>
    </div>
    <div id="no-events" class="empty-state hidden">
      <div class="icon">📅</div>
      <h3>No upcoming events</h3>
      <p>Check back soon — new workshops are added regularly</p>
    </div>
  </div>
</section>

<!-- Registration confirmed modal -->
<div class="modal-overlay hidden" id="reg-modal">
  <div class="modal">
    <div class="modal-header">
      <h3>Registration Confirmed 🎉</h3>
      <button class="modal-close" onclick="hideModal('reg-modal')">×</button>
    </div>
    <div class="modal-body">
      <p>You are registered for <strong id="reg-event-name"></strong>.</p>
      <p class="text-muted mt-1" style="font-size:.9rem">We will send details closer to the date. We look forward to seeing you!</p>
      <button class="btn btn-primary mt-3 w-full" onclick="hideModal('reg-modal')">Done</button>
    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
async function loadEvents() {
  const data = await API.get('events.php', { limit: 12 });
  const grid = document.getElementById('events-grid');
  const noEl = document.getElementById('no-events');
  const eventImages = {
    'Mediterranean Cooking Workshop': 'assets/images/elegancenairobi-african-food-3957740_1920.jpg',
    'Sushi Making Class': 'assets/images/isakarakus-old-man-2879303_1920.jpg',
    'West African Feast': 'assets/images/elegancenairobi-african-food-3957740_1920.jpg',
    'Knife Workshop': 'assets/images/congerdesign-knife-block-1897410_1920.jpg',
    'Japanese Fermentation Workshop': 'assets/images/isakarakus-old-man-2879303_1920.jpg',
    'Street Food Market': 'assets/images/elegancenairobi-african-food-3957740_1920.jpg',
    'default': 'assets/images/elegancenairobi-african-food-3957740_1920.jpg'
  };

  if (data.success && data.data?.length) {
    noEl.classList.add('hidden');
    window.__eventStore = data.data.slice();
    grid.innerHTML = data.data.map(ev => {
      const d = fmtEventDate(ev.event_date);
      const spotsLeft = ev.max_participants - (ev.registered_count ?? ev.current_participants ?? 0);
      const isFull = spotsLeft <= 0;
      const pct = Math.round(((ev.current_participants ?? 0) / ev.max_participants) * 100);
      const price = parseFloat(ev.price) === 0 ? 'Free' : `$${parseFloat(ev.price).toFixed(2)}`;
      const imageUrl = ev.image_path || ev.image || eventImages[ev.title] || eventImages.default;
      const eventId = ev.event_id || ev.id;
      return `<div class="card event-card" role="button" tabindex="0" onclick="openEventDetails(${eventId})" onkeydown="if(event.key==='Enter'||event.key===' ') openEventDetails(${eventId})">
        <div class="event-img" style="background-image:url('${imageUrl}')"></div>
        <div class="event-date">
          <div class="day">${d.day}</div>
          <div class="month">${d.month}</div>
        </div>
        <div class="card-body">
          <h3>${ev.title}</h3>
          <div class="event-meta-row">
            <span>📍 ${ev.location}</span>
            ${ev.event_time ? `<span>🕐 ${ev.event_time.substring(0,5)}</span>` : ''}
          </div>
          <div class="event-meta-row">
            <span>💰 ${price}</span>
            <span>👥 ${isFull ? '<span style="color:var(--clr-danger)">Full</span>' : `${spotsLeft} spot${spotsLeft!==1?'s':''} left`}</span>
          </div>
          <p class="desc">${ev.description}</p>
          <div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;font-size:.78rem;color:var(--clr-muted);margin-bottom:4px">
              <span>Capacity</span><span>${ev.registered_count ?? ev.current_participants ?? 0}/${ev.max_participants}</span>
            </div>
            <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
          </div>
          <button class="btn ${isFull ? 'btn-ghost' : 'btn-primary'} w-full register-btn"
            data-id="${ev.event_id}" data-name="${ev.title.replace(/"/g,'&quot;')}"
            ${isFull ? 'disabled' : ''}>
            ${isFull ? 'Fully Booked' : 'Register Now'}
          </button>
        </div>
      </div>`;
    }).join('');

    grid.querySelectorAll('.register-btn').forEach(btn => {
      btn.addEventListener('click', () => registerForEvent(btn));
    });
  } else {
    grid.innerHTML = '';
    noEl.classList.remove('hidden');
  }
}

async function registerForEvent(btn) {
  if (!currentUser) { window.location.href = '/foodfusion/login.php'; return; }
  btn.disabled = true;
  btn.textContent = 'Registering…';
  const data = await API.post('events.php', { event_id: btn.dataset.id });
  if (data.success) {
    document.getElementById('reg-event-name').textContent = btn.dataset.name;
    showModal('reg-modal');
    loadEvents();
  } else {
    toast(data.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Register Now';
  }
}

(async () => { await checkAuth(); loadEvents(); })();
</script>
