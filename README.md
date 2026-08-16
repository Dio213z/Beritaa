# DREXION NEWS

DREXION NEWS adalah portal berita modern yang cepat, responsif, dan siap di-deploy ke Vercel. Dibuat dengan tema **Dark Red Neon & Black**, DREXION NEWS menyajikan berita terkini dari berbagai kategori menggunakan **GNews API** melalui Vercel Serverless Functions.

---

## 🌟 Fitur Utama

- **Keamanan Serverless Proxy (`/api/news`)**: Request berita dilakukan dari serverless function Vercel, sehingga `GNEWS_API_KEY` tidak terekspos di browser / source frontend.
- **Image Fallback System**: Menangani gambar artikel yang kosong/rusak secara otomatis dengan SVG fallback bermerek DREXION NEWS.
- **Filter Kategori Berita**: Beranda (General), Nasional, Teknologi, Bisnis, Olahraga, Hiburan, Sains, dan Kesehatan.
- **Pencarian Berita (Search)**: Cari berita berdasarkan kata kunci secara instan.
- **Responsive Modern UI**: Desain Dark Red Neon / Black yang adaptif di layar desktop maupun mobile.
- **Cache CDN Vercel**: Respon API di-cache secara efisien untuk mempercepat response time dan menghemat kuota GNews.

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Buat file `.env`**:
   Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Isi API key GNews kamu:
   ```env
   GNEWS_API_KEY=your_gnews_api_key_here
   ```

3. **Jalankan local dev server**:
   ```bash
   npm start
   ```
   Buka browser dan akses [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deploy ke Vercel

Project ini sudah dikonfigurasi agar dapat langsung di-deploy ke Vercel tanpa build step tambahan.

### Langkah Deploy:

1. Push repository ke GitHub.
2. Buka dashboard **[Vercel](https://vercel.com/)** dan pilih **Add New Project**.
3. Import repository GitHub **DREXION NEWS**.
4. Masuk ke bagian **Environment Variables**:
   - **Name**: `GNEWS_API_KEY`
   - **Value**: `your_gnews_api_key_here` (API Key GNews kamu)
5. Klik **Deploy**.

---

## 📁 Struktur Repository

```
.
├── api/
│   └── news.js       # Vercel Serverless Function (proxy GNews API)
├── index.html        # HTML Utama DREXION NEWS
├── style.css         # CSS Styling (Dark Red Neon / Black)
├── app.js            # Frontend JavaScript Logic
├── dev-server.js     # Dev server lokal untuk pengujian
├── .env.example      # Example environment variables
├── .gitignore        # Disimpan agar .env & node_modules tidak ter-commit
├── package.json      # Konfigurasi project & npm start
└── README.md         # Dokumentasi project
```

---

## 🔒 Keamanan & Praktik Terbaik

- `GNEWS_API_KEY` disimpan secara aman di Server-Side Environment Variable.
- Frontend hanya memanggil endpoint relatif `/api/news?...`.
- Tidak ada panggilan API langsung dari browser ke `gnews.io`.
