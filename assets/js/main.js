// ============================================================
// KN WORKS — MAIN JS
// ============================================================

// ---- Base path (works at root or in /works/ subfolder) ----------
const KN_BASE = document.querySelector('script[src*="main.js"]').src.replace(/assets\/js\/main\.js.*$/, '');

// ---- Accent color: slow hue cycle tied to clock ----------------
(function () {
  const CYCLE_MS = 600000; // 10 minutes for full 360°
  const root = document.documentElement;
  let last = -1;

  function tick() {
    const hue = Math.round((Date.now() % CYCLE_MS) / CYCLE_MS * 360);
    if (hue !== last) {
      root.style.setProperty('--accent-h', hue);
      last = hue;
    }
  }
  tick();
  setInterval(tick, 1600); // ~1° every 1.67s, check just under that
})();

// ---- Logo typewriter cycle -------------------------------------
(function () {
  const el = document.querySelector('.site-logo');
  if (!el) return;

  const NAME = 'Kyle Numann';
  const words = [NAME, 'Human', 'Musician', 'Artist'];
  const TYPE_MS = 80;
  const DELETE_MS = 50;
  const FAST_MS = 25;
  const PAUSE_NAME = 5000;
  const PAUSE_WORD = 1500;
  const MAX_ITERATIONS = 3;

  let idx = 0;
  let iterations = 0;
  let cycling = true;
  let timer = null;

  function clearTimers() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function deleteText(speed, cb) {
    const text = el.textContent;
    if (text.length === 0) return cb();
    el.textContent = text.slice(0, -1);
    timer = setTimeout(() => deleteText(speed, cb), speed);
  }

  function typeText(word, i, speed, cb) {
    if (i > word.length) return cb();
    el.textContent = word.slice(0, i);
    timer = setTimeout(() => typeText(word, i + 1, speed, cb), speed);
  }

  function cycle() {
    if (!cycling) return;
    idx = (idx + 1) % words.length;
    if (idx === 0) iterations++;
    if (iterations >= MAX_ITERATIONS) {
      el.textContent = NAME;
      return;
    }
    const pause = (idx === 0) ? PAUSE_NAME : PAUSE_WORD;
    deleteText(DELETE_MS, () => {
      timer = setTimeout(() => {
        if (!cycling) return;
        typeText(words[idx], 1, TYPE_MS, () => {
          timer = setTimeout(cycle, pause);
        });
      }, 300);
    });
  }

  function snapToName() {
    cycling = false;
    clearTimers();
    deleteText(FAST_MS, () => {
      typeText(NAME, 1, FAST_MS, () => {
        idx = 0;
      });
    });
  }

  function resumeCycle() {
    if (iterations >= MAX_ITERATIONS) return;
    cycling = true;
    const pause = (idx === 0) ? PAUSE_NAME : PAUSE_WORD;
    timer = setTimeout(cycle, pause);
  }

  el.addEventListener('mouseenter', snapToName);
  el.addEventListener('mouseleave', resumeCycle);

  timer = setTimeout(cycle, PAUSE_NAME);
})();

// ---- Nav: active state + scroll --------------------------------
(function () {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.site-nav a');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  // Mark active nav link
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  navLinks.forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path || (href !== '' && path.startsWith(href))) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // Sticky header style on scroll
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile nav toggle
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close on link click
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
})();

// ---- Art grid: render from data --------------------------------
(function () {
  const grid = document.getElementById('art-grid');
  if (!grid || typeof KN === 'undefined') return;

  const pieces = KN.art.pieces.slice().sort((a, b) => {
    // Cloudmouth album art first
    if (a.slug === 'cloudmouth-album-art') return -1;
    if (b.slug === 'cloudmouth-album-art') return 1;
    // Venue illustrations next
    const aVenue = a.collection === 'venue-illustrations' ? 0 : 1;
    const bVenue = b.collection === 'venue-illustrations' ? 0 : 1;
    if (aVenue !== bVenue) return aVenue - bVenue;
    // Then by date, newest first
    return b.year - a.year;
  });
  if (!pieces || !pieces.length) {
    grid.innerHTML = '<p class="empty">No entries.</p>';
    return;
  }

  function renderGrid(items) {
    grid.innerHTML = items.map(piece => `
      <article class="art-item" data-slug="${piece.slug}"
               role="button" tabindex="0"
               aria-label="${piece.title}">
        <img src="${KN_BASE}${piece.images[0]}"
             alt="${piece.title}"
             loading="lazy">
        <div class="art-item__overlay">
          <div class="art-item__title">${piece.title}</div>
          <div class="art-item__type">${piece.type.join(' · ')}</div>
        </div>
      </article>
    `).join('');

    // Attach lightbox listeners
    grid.querySelectorAll('.art-item').forEach(el => {
      el.addEventListener('click', () => openLightbox(el.dataset.slug));
      el.addEventListener('keydown', e => { if (e.key === 'Enter') openLightbox(el.dataset.slug); });
    });
  }

  // Collection descriptions — shown when filter is active
  const filterDescs = {
    'venue-illustrations': 'Ongoing series re-imagining Nashville\u2019s storied live music venues. Alternate locations, radical situations, stylized presentation.',
    'music-designs': 'Album art, show posters, merchandise. Design work for music projects.',
  };

  // Filter buttons
  const filtersEl = document.getElementById('art-filters');
  const descEl = document.getElementById('art-filter-desc');
  if (filtersEl) {
    let active = 'all';
    filtersEl.addEventListener('click', e => {
      const btn = e.target.closest('.art-filter');
      if (!btn) return;
      filtersEl.querySelectorAll('.art-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      active = btn.dataset.filter;
      const filtered = active === 'all'
        ? pieces
        : pieces.filter(p => p.collection === active || p.type.includes(active));
      renderGrid(filtered);
      if (descEl) descEl.textContent = filterDescs[active] || '';
    });
  }

  renderGrid(pieces);
})();

// ---- Lightbox --------------------------------------------------
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');

function openLightbox(slug) {
  if (!lightbox || typeof KN === 'undefined') return;
  const piece = KN.art.pieces.find(p => p.slug === slug);
  if (!piece) return;
  lightboxImg.src = KN_BASE + piece.images[0];
  lightboxImg.alt = piece.title;
  lightboxImg.classList.remove('zoomed');
  lightboxCaption.textContent = piece.title + (piece.year ? ` — ${piece.year}` : '');
  lightbox.classList.add('open');
  lightbox.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  lightbox.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightboxImg.classList.remove('zoomed');
  document.body.style.overflow = '';
}

if (lightbox) {
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target === lightboxCaption) closeLightbox();
  });
  lightboxImg.addEventListener('click', e => {
    e.stopPropagation();
    lightboxImg.classList.toggle('zoomed');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

// ---- Home: latest + featured releases from data -----------------
(function () {
  if (typeof KN === 'undefined') return;
  const releases = KN.music.releases;
  if (!releases || !releases.length) return;

  // Latest release (first in the list)
  const latestEl = document.getElementById('home-latest');
  if (latestEl) {
    const r = releases[0];
    latestEl.innerHTML = `
      <div class="latest-release">
        <h2 class="latest-release__title">${r.title}</h2>
        <p class="latest-release__meta">${r.artist} · ${r.year} · ${r.type}</p>
        ${r.description ? `<p class="latest-release__desc">${r.description}</p>` : ''}
        <div class="latest-release__embed">${r.embed}</div>
        <a class="latest-release__link" href="${r.bandcamp}" target="_blank" rel="noopener">Bandcamp ↗</a>
      </div>`;
  }

  // Featured discography
  const discoEl = document.getElementById('home-discography');
  if (discoEl) {
    const titles = (KN.home.featuredReleases || []);
    const featured = titles.map(t => releases.find(r => r.title === t)).filter(Boolean);
    if (!featured.length) return;
    discoEl.innerHTML = '<div class="row-list">' + featured.map(r => `
      <div class="row-item">
        <span class="row-item__date">${r.year}</span>
        <span class="row-item__main">
          <strong>${r.title}</strong>
          <span class="row-item__sub">${r.artist} · ${r.type}</span>
          ${r.description ? `<span class="row-item__desc">${r.description}</span>` : ''}
        </span>
        <span class="row-item__tag">
          <a href="${r.bandcamp}" target="_blank" rel="noopener">Bandcamp ↗</a>
        </span>
      </div>`).join('') + '</div>';
  }
})();

// ---- Music releases: render from data ---------------------------
(function () {
  const el = document.getElementById('releases-list');
  if (!el || typeof KN === 'undefined') return;

  const releases = KN.music.releases;
  if (!releases || !releases.length) {
    el.innerHTML = '<p class="empty">No entries.</p>';
    return;
  }

  el.innerHTML = '<div class="release-list">' + releases.map(r => `
    <div class="release-item">
      <div class="release-item__cover">
        ${r.cover ? `<img src="${r.cover.startsWith('http') ? r.cover : KN_BASE + r.cover}" alt="${r.title}" loading="lazy">` : ''}
      </div>
      <div>
        <span class="release-item__title">${r.title}</span>
        <span class="release-item__artist">${r.artist} · ${r.type} · ${r.year}</span>
        ${r.description ? `<span class="release-item__desc">${r.description}</span>` : ''}
      </div>
      <a class="release-item__link" href="${r.bandcamp}" target="_blank" rel="noopener">Bandcamp ↗</a>
    </div>
  `).join('') + '</div>';
})();

// ---- Video grid: render from data ------------------------------
(function () {
  const grid = document.getElementById('video-grid');
  if (!grid || typeof KN === 'undefined') return;

  const videos = KN.video.videos.filter(v => v.youtubeId);
  if (!videos.length) {
    grid.innerHTML = '<p class="empty">No entries.</p>';
    return;
  }

  grid.innerHTML = videos.map(v => `
    <article class="video-item">
      <div class="video-item__embed">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${v.youtubeId}"
          title="${v.title} — ${v.artist}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy">
        </iframe>
      </div>
      <div class="video-item__info">
        <div class="video-item__artist">${v.artist}</div>
        <h3 class="video-item__title">${v.title}</h3>
        <div class="video-item__year">${v.year}</div>
      </div>
    </article>
  `).join('');
})();

// ---- Shows: render upcoming + past ----------------------------
(function () {
  if (typeof KN === 'undefined') return;

  const today = new Date().toISOString().slice(0, 10);

  function fmtDate(d) {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderRow(s) {
    const upcoming = s.date >= today;
    return `
      <div class="row-item${upcoming ? ' row-item--upcoming' : ''}">
        <span class="row-item__date">${fmtDate(s.date)}</span>
        <span class="row-item__main">
          <strong>${s.venue}</strong>
          <span class="row-item__sub">${s.location}${s.note ? ' · ' + s.note : ''}</span>
        </span>
        <span class="row-item__tag">
          ${s.project || ''}
          ${s.note ? `<br>${s.note}` : ''}
          ${s.url ? `<br><a href="${s.url}" target="_blank" rel="noopener">↗</a>` : ''}
        </span>
      </div>`;
  }

  // Upcoming (home page + live page)
  const upcomingEl = document.getElementById('upcoming-list') || document.getElementById('shows-list');
  if (upcomingEl) {
    const upcoming = (KN.live.shows || []).filter(s => s.date >= today).sort((a,b) => a.date.localeCompare(b.date));
    upcomingEl.innerHTML = upcoming.length
      ? `<div class="row-list">${upcoming.map(renderRow).join('')}</div>`
      : '<p class="empty">See <a href="https://instagram.com/infinitelimb" target="_blank" rel="noopener" style="color:var(--fg-dim)">@infinitelimb</a>.</p>';
  }

  // Past shows (live page only)
  const pastEl = document.getElementById('past-shows-list');
  if (pastEl) {
    const past = (KN.live.pastShows || []).sort((a,b) => b.date.localeCompare(a.date));
    if (!past.length) {
      pastEl.innerHTML = '<p class="empty">No entries.</p>';
      return;
    }
    let html = '<div class="row-list">';
    let currentYear = null;
    past.forEach(s => {
      const yr = s.date.slice(0, 4);
      if (yr !== currentYear) {
        currentYear = yr;
        html += `<div class="year-divider">${yr}</div>`;
      }
      html += renderRow(s);
    });
    html += '</div>';
    pastEl.innerHTML = html;
  }
})();

// ---- Easter egg: Konami code -----------------------------------
(function () {
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[idx]) {
      idx++;
      if (idx === KONAMI.length) {
        idx = 0;
        showEgg('↑ ↑ ↓ ↓ ← → ← → B A · you found the quiet room');
      }
    } else {
      idx = 0;
    }
  });

  // Secret: click logo 5 times
  let logoClicks = 0;
  let logoTimer;
  const logo = document.querySelector('.site-logo');
  if (logo) {
    logo.addEventListener('click', e => {
      if (window.location.pathname !== '/' && !e.ctrlKey && !e.metaKey) return;
      clearTimeout(logoTimer);
      logoClicks++;
      if (logoClicks >= 5) {
        logoClicks = 0;
        showEgg('🌿 somewhere between signal and silence');
      }
      logoTimer = setTimeout(() => logoClicks = 0, 2000);
    });
  }

  function showEgg(msg) {
    let el = document.querySelector('.egg');
    if (!el) {
      el = document.createElement('div');
      el.className = 'egg';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove('visible');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 4200);
  }
})();
