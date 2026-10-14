const CACHE_NAME = "hanjuang-wbp-v1";

// Daftar berkas yang disimpan ke cache agar PWA bisa di-install & digunakan offline
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./logo1.png",
  "./logo2.png"
];

// 1. Event Install: Menyimpan aset penting ke cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Memuat aset PWA ke cache...");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 2. Event Activate: Membersihkan cache versi lama jika ada pembaruan
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Menghapus cache lama:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Event Fetch: Mengambil data dari cache saat offline / koneksi lambat
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jika berkas ada di cache, tampilkan dari cache. Jika tidak, ambil via jaringan.
      return response || fetch(event.request);
    })
  );
});
