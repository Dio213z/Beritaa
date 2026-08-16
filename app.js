/* =====================================================
   DREXION NEWS - FRONTEND APP
===================================================== */

/* =====================================================
   STATE
===================================================== */

let currentCategory = "general";
let currentQuery = "";
let isSearching = false;

/* =====================================================
   ELEMENTS
===================================================== */

const heroLoading = document.getElementById("heroLoading");
const heroGrid = document.getElementById("heroGrid");
const heroCard = document.getElementById("heroCard");
const heroImage = document.getElementById("heroImage");
const heroTitle = document.getElementById("heroTitle");
const heroDescription = document.getElementById("heroDescription");
const heroSource = document.getElementById("heroSource");
const heroTime = document.getElementById("heroTime");
const sideNews = document.getElementById("sideNews");
const newsGrid = document.getElementById("newsGrid");
const breakingText = document.getElementById("breakingText");
const errorState = document.getElementById("errorState");
const emptyState = document.getElementById("emptyState");
const errorMessage = document.getElementById("errorMessage");
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchSubmit = document.getElementById("searchSubmit");
const refreshBtn = document.getElementById("refreshBtn");
const retryBtn = document.getElementById("retryBtn");
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

/* =====================================================
   HELPERS & ESCAPING
===================================================== */

function escapeHTML(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(date) {
  if (!date) return "Waktu tidak tersedia";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Waktu tidak tersedia";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function fallbackImage(sourceName) {
  const sourceText = escapeHTML(sourceName || "DREXION NEWS");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <rect width="1200" height="675" fill="#0c0d12"/>
    <circle cx="600" cy="280" r="180" fill="#e5092f" opacity=".12"/>
    <text x="600" y="315" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="54" font-weight="900">DREXION NEWS</text>
    <text x="600" y="375" text-anchor="middle" fill="#ff3657" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="2">${sourceText}</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function setupImage(imgElement, sourceName, rawImageUrl) {
  const fallback = fallbackImage(sourceName);
  imgElement.onerror = function () {
    if (this.src !== fallback) {
      this.src = fallback;
    }
  };
  if (rawImageUrl && rawImageUrl.trim() !== "") {
    imgElement.src = rawImageUrl;
  } else {
    imgElement.src = fallback;
  }
}

/* =====================================================
   FETCH API
===================================================== */

async function fetchNews(paramsStr = "") {
  const response = await fetch(`/api/news${paramsStr}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Respon server bukan format JSON yang valid.");
  }

  if (!response.ok || data.success === false) {
    throw new Error(data?.error || `Gagal mengambil data (HTTP ${response.status})`);
  }

  return Array.isArray(data.articles) ? data.articles : [];
}

/* =====================================================
   LOADING & UI STATES
===================================================== */

function showLoading() {
  errorState.classList.remove("show");
  emptyState.classList.remove("show");
  heroLoading.style.display = "block";
  heroGrid.style.display = "none";

  newsGrid.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    newsGrid.innerHTML += `
      <div class="loading-card">
        <div class="skeleton loading-image"></div>
        <div class="loading-body">
          <div class="skeleton loading-line small"></div>
          <div class="skeleton loading-line large"></div>
          <div class="skeleton loading-line medium"></div>
        </div>
      </div>
    `;
  }
}

/* =====================================================
   ARTICLE LINK NAVIGATION
===================================================== */

function openArticle(url) {
  if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

/* =====================================================
   RENDER FUNCTIONS
===================================================== */

function renderHero(articles) {
  if (!articles || !articles.length) return;

  const main = articles[0];
  const sourceName = main.source?.name || "DREXION NEWS";

  setupImage(heroImage, sourceName, main.image);

  heroTitle.textContent = main.title || "Berita Utama";
  heroDescription.textContent = main.description || "Baca berita selengkapnya dari sumber berita.";
  heroSource.textContent = sourceName;
  heroTime.textContent = formatTime(main.publishedAt);

  heroCard.onclick = () => openArticle(main.url);

  sideNews.innerHTML = "";
  articles.slice(1, 4).forEach(article => {
    const card = document.createElement("article");
    card.className = "side-card";

    const sideSourceName = article.source?.name || "NEWS";

    card.innerHTML = `
      <div class="side-image">
        <img alt="${escapeHTML(article.title || "Berita")}">
      </div>
      <div class="side-content">
        <div class="side-source">${escapeHTML(sideSourceName)}</div>
        <div class="side-title">${escapeHTML(article.title || "Berita")}</div>
        <div class="side-time">${escapeHTML(formatTime(article.publishedAt))}</div>
      </div>
    `;

    const img = card.querySelector("img");
    setupImage(img, sideSourceName, article.image);

    card.onclick = () => openArticle(article.url);
    sideNews.appendChild(card);
  });
}

function renderGrid(articles) {
  newsGrid.innerHTML = "";

  if (!articles || !articles.length) {
    emptyState.classList.add("show");
    return;
  }

  emptyState.classList.remove("show");

  articles.forEach(article => {
    const card = document.createElement("article");
    card.className = "news-card";

    const sourceName = article.source?.name || "NEWS";

    card.innerHTML = `
      <div class="news-image">
        <img alt="${escapeHTML(article.title || "Berita")}">
      </div>
      <div class="news-body">
        <div class="news-meta">
          <span class="news-source">${escapeHTML(sourceName)}</span>
          <span class="news-time">${escapeHTML(formatTime(article.publishedAt))}</span>
        </div>
        <h3 class="news-title">${escapeHTML(article.title || "Berita Terbaru")}</h3>
        <p class="news-description">${escapeHTML(article.description || "Baca berita selengkapnya dari sumber berita.")}</p>
        <span class="read-more">BACA SELENGKAPNYA →</span>
      </div>
    `;

    const img = card.querySelector("img");
    setupImage(img, sourceName, article.image);

    card.onclick = () => openArticle(article.url);
    newsGrid.appendChild(card);
  });
}

/* =====================================================
   MAIN LOAD NEWS CONTROLLER
===================================================== */

async function loadNews() {
  showLoading();

  try {
    let queryParams = new URLSearchParams();

    if (isSearching && currentQuery) {
      queryParams.set("q", currentQuery);
    } else {
      queryParams.set("category", currentCategory);
    }

    const articles = await fetchNews(`?${queryParams.toString()}`);

    heroLoading.style.display = "none";
    heroGrid.style.display = "grid";

    renderHero(articles);
    renderGrid(articles);

    if (articles.length) {
      breakingText.textContent = articles[0].title || "Berita terbaru telah diperbarui.";
    } else {
      breakingText.textContent = "Belum ada berita terbaru.";
    }
  } catch (error) {
    console.error("Error loading news:", error);

    heroLoading.style.display = "none";
    heroGrid.style.display = "none";
    newsGrid.innerHTML = "";

    errorState.classList.add("show");
    errorMessage.textContent = error.message || "Server berita sedang mengalami gangguan. Silakan coba lagi.";
    breakingText.textContent = "Gagal mengambil berita terbaru.";
  }
}

/* =====================================================
   EVENT LISTENERS
===================================================== */

// Category Navigation Buttons
document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", async () => {
    const category = button.dataset.category;

    isSearching = false;
    currentQuery = "";
    if (searchInput) searchInput.value = "";

    document.querySelectorAll("[data-category]").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(`.filter[data-category="${category}"]`).forEach(btn => btn.classList.add("active"));
    document.querySelectorAll(`.nav button[data-category="${category}"]`).forEach(btn => btn.classList.add("active"));

    currentCategory = category;
    if (mobileMenu) mobileMenu.classList.remove("show");

    window.scrollTo({ top: 0, behavior: "smooth" });
    await loadNews();
  });
});

// Search Toggle & Submit
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    searchPanel.classList.toggle("show");
    if (searchPanel.classList.contains("show")) {
      searchInput.focus();
    }
  });
}

async function handleSearch() {
  const query = searchInput.value.trim();
  if (query) {
    isSearching = true;
    currentQuery = query;
  } else {
    isSearching = false;
    currentQuery = "";
  }
  await loadNews();
}

if (searchSubmit) {
  searchSubmit.addEventListener("click", handleSearch);
}

if (searchInput) {
  searchInput.addEventListener("keydown", async event => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSearch();
    }
  });
}

// Refresh & Retry
if (refreshBtn) refreshBtn.addEventListener("click", loadNews);
if (retryBtn) retryBtn.addEventListener("click", loadNews);

// Mobile Menu Toggle
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });
}

/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  loadNews();
});
