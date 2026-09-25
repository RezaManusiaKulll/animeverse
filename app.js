const API = 'https://api.jikan.moe/v4';
const grid = document.getElementById('animeGrid');
const sectionTitle = document.getElementById('sectionTitle');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const hero = document.getElementById('hero');

/* ============ RENDER ============ */
function renderAnime(list) {
  if (!list || list.length === 0) {
    grid.innerHTML = '<div class="loader">Tidak ada anime ditemukan 😢</div>';
    return;
  }

  grid.innerHTML = list.map(a => `
    <div class="anime-card" onclick="showDetail(${a.mal_id})">
      <img src="${a.images?.jpg?.image_url || ''}" alt="${a.title}" loading="lazy"
           onerror="this.src='https://via.placeholder.com/200x280/6a11cb/ffffff?text=Anime'">
      <div class="anime-info">
        <h3>${a.title}</h3>
        <p>${a.type || '-'} • ${a.episodes ? a.episodes + ' eps' : '?'}</p>
        <div class="rating">⭐ ${a.score || 'N/A'}</div>
      </div>
    </div>
  `).join('');
}

function showLoader(text = 'Memuat anime...') {
  grid.innerHTML = `<div class="loader">${text}</div>`;
}

/* ============ FETCH ============ */
async function loadTopAnime() {
  hero.style.display = 'none';
  sectionTitle.textContent = '🔥 Top Anime';
  showLoader();
  try {
    const res = await fetch(`${API}/top/anime?limit=24`);
    const data = await res.json();
    renderAnime(data.data);
  } catch (e) {
    grid.innerHTML = '<div class="loader">Gagal memuat data. Coba lagi.</div>';
  }
}

async function loadSeasonNow() {
  hero.style.display = 'none';
  sectionTitle.textContent = '🌸 Anime Season Ini';
  showLoader();
  try {
    const res = await fetch(`${API}/seasons/now?limit=24`);
    const data = await res.json();
    renderAnime(data.data);
  } catch (e) {
    grid.innerHTML = '<div class="loader">Gagal memuat data.</div>';
  }
}

async function searchAnime() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  hero.style.display = 'none';
  sectionTitle.textContent = `🔍 Hasil: "${q}"`;
  showLoader('Mencari...');
  try {
    const res = await fetch(`${API}/anime?q=${encodeURIComponent(q)}&limit=24&sfw`);
    const data = await res.json();
    renderAnime(data.data);
  } catch (e) {
    grid.innerHTML = '<div class="loader">Gagal mencari.</div>';
  }
}

/* ============ DETAIL ============ */
async function showDetail(id) {
  modal.classList.add('active');
  modalBody.innerHTML = '<div class="loader">Memuat detail...</div>';

  try {
    const res = await fetch(`${API}/anime/${id}/full`);
    const { data } = await res.json();

    const trailerId = data.trailer?.youtube_id;
    const museSearch = `https://www.youtube.com/@MuseIndonesia/search?query=${encodeURIComponent(data.title)}`;

    modalBody.innerHTML = `
      <div class="modal-header">
        <img src="${data.images?.jpg?.large_image_url || ''}" alt="${data.title}">
        <div class="info">
          <h2>${data.title}</h2>
          <p><strong>Judul Jepang:</strong> ${data.title_japanese || '-'}</p>
          <p><strong>Tipe:</strong> ${data.type || '-'} | <strong>Episode:</strong> ${data.episodes || '?'}</p>
          <p><strong>Status:</strong> ${data.status || '-'}</p>
          <p><strong>Rating:</strong> ⭐ ${data.score || 'N/A'} (${data.scored_by || 0} voters)</p>
          <p><strong>Genre:</strong> ${data.genres?.map(g => g.name).join(', ') || '-'}</p>
          <p><strong>Studio:</strong> ${data.studios?.map(s => s.name).join(', ') || '-'}</p>
          <p style="margin-top:10px;">${data.synopsis || 'Tidak ada sinopsis.'}</p>
        </div>
      </div>
      ${trailerId ? `
        <h3 style="margin-top:15px;">🎬 Trailer</h3>
        <div class="trailer">
          <iframe src="https://www.youtube.com/embed/${trailerId}"
                  allowfullscreen allow="autoplay; encrypted-media"></iframe>
        </div>
      ` : ''}
      <a href="${museSearch}" target="_blank" class="btn-muse">
        🎬 Cari di Muse Indonesia
      </a>
    `;
  } catch (e) {
    modalBody.innerHTML = '<div class="loader">Gagal memuat detail.</div>';
  }
}

function closeModal() {
  modal.classList.remove('active');
  modalBody.innerHTML = '';
}

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

/* ============ HOME ============ */
function showHome() {
  hero.style.display = 'flex';
  sectionTitle.textContent = '🔥 Anime Populer';
  loadDefault();
}

async function loadDefault() {
  showLoader();
  try {
    const res = await fetch(`${API}/top/anime?limit=8`);
    const data = await res.json();
    renderAnime(data.data);
  } catch (e) {
    grid.innerHTML = '<div class="loader">Gagal memuat.</div>';
  }
}

/* ============ SEARCH ENTER ============ */
document.getElementById('searchInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') searchAnime();
});

/* ============ THEME ============ */
function toggleTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light');
    document.getElementById('themeToggle').textContent = '☀️';
  }
})();

/* ============ INIT ============ */
loadDefault();

/* ============ PWA ============ */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
