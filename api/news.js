const GNEWS_BASE = "https://gnews.io/api/v4";

const VALID_CATEGORIES = new Set([
  "general",
  "nation",
  "technology",
  "business",
  "sports",
  "entertainment",
  "science",
  "health"
]);

export default async function handler(req, res) {
  // Set CORS headers if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Metode HTTP tidak diizinkan. Gunakan GET."
    });
  }

  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    console.error("GNEWS_API_KEY environment variable is missing.");
    return res.status(500).json({
      success: false,
      error: "Konfigurasi server belum lengkap (API key tidak ditemukan)."
    });
  }

  try {
    const { category, q } = req.query || {};

    const urlParams = new URLSearchParams();
    urlParams.set("lang", "id");
    urlParams.set("country", "id");
    urlParams.set("max", "10");
    urlParams.set("apikey", apiKey);

    let endpoint = "top-headlines";

    if (q && typeof q === "string" && q.trim() !== "") {
      endpoint = "search";
      urlParams.set("q", q.trim());
      urlParams.set("sortby", "publishedAt");
    } else {
      let selectedCategory = (typeof category === "string" ? category.toLowerCase().trim() : "general");
      if (!VALID_CATEGORIES.has(selectedCategory)) {
        selectedCategory = "general";
      }
      urlParams.set("category", selectedCategory);
    }

    const apiUrl = `${GNEWS_BASE}/${endpoint}?${urlParams.toString()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const apiResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    let responseData;
    try {
      responseData = await apiResponse.json();
    } catch {
      return res.status(502).json({
        success: false,
        error: "Menerima respon yang tidak valid dari penyedia berita."
      });
    }

    if (!apiResponse.ok) {
      console.error(`GNews API Error (Status ${apiResponse.status}):`, responseData);

      let userErrorMessage = "Gagal mengambil data berita.";
      if (apiResponse.status === 400) userErrorMessage = "Permintaan berita tidak valid.";
      else if (apiResponse.status === 401 || apiResponse.status === 403) userErrorMessage = "Akses API berita tidak diizinkan.";
      else if (apiResponse.status === 429) userErrorMessage = "Batas kuota pencarian berita tercapai. Silakan coba lagi nanti.";
      else if (apiResponse.status >= 500) userErrorMessage = "Layanan berita sedang dalam pemeliharaan.";

      return res.status(apiResponse.status).json({
        success: false,
        error: userErrorMessage
      });
    }

    const articles = Array.isArray(responseData.articles) ? responseData.articles : [];

    // Cache successful responses on Vercel CDN for 10 minutes, stale while revalidate 30 minutes
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");

    return res.status(200).json({
      success: true,
      articles: articles
    });

  } catch (error) {
    console.error("Serverless Function Internal Error:", error);

    let errorMessage = "Terjadi kesalahan internal pada server.";
    if (error.name === "AbortError") {
      errorMessage = "Koneksi ke penyedia berita mengalami batas waktu (timeout).";
    }

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}
