# TEKNOVISTA.KIT — Official Order Portal Kit Penugasan AMERTA Universitas Airlangga 2026

![TEKNOVISTA.KIT AMERTA UNAIR 2026](assets/images/logo-unair-amerta.svg)

Portal resmi pemesanan atribut dan kelengkapan penugasan (**TEKNOVISTA.KIT**) bagi Mahasiswa Baru Universitas Airlangga 2026. Dibangun dengan pendekatan **Senior Frontend Architecture** yang mengedepankan modularitas (*Modular Architecture*), skalabilitas, *maintainability*, responsivitas mobile-first, serta desain elegan berstandar akademis.

---

## 📋 Deskripsi Proyek (*Project Overview*)

Aplikasi web ini berfungsi sebagai portal utama bagi seluruh Mahasiswa Baru Universitas Airlangga tahun 2026 untuk melakukan pemesanan atribut resmi (Buku Panduan, ID Card & Lanyard, Lembar Hymne, dan Janji Ksatria). 

Sistem ini dikembangkan 100% menggunakan teknologi **Vanilla Web Stack (HTML5 Semantik, CSS3, dan ES6+ Modular JavaScript)** tanpa ketergantungan pada *framework* eksternal maupun *library* pihak ketiga. Arsitektur telah di-*refactor* ke standar produksi tinggi (*Production-Ready Codebase*), di mana pemisahan lapisan layanan (*Service Layer*) dan konfigurasi sentral siap diintegrasikan langsung dengan **Google Apps Script (GAS)** dan Google Sheets pada tahap selanjutnya.

---

## 📂 Struktur Direktori Modular (*Folder Structure*)

```text
/
├── index.html                  # Halaman utama aplikasi (Landing Page & Multi-Step Wizard)
├── css/
│   └── style.css               # Sistem desain Vanilla CSS (Variabel, Responsif, UI Kit, Animasi)
├── js/
│   ├── app.js                  # Engine utama pengontrol antarmuka & alur langkah (Wizard Controller)
│   ├── config.js               # Pengaturan sentral (API endpoint GAS, deadline, kontak WhatsApp, akun bank)
│   ├── constants.js            # Konstanta global (nomor langkah, storage keys, batas ukuran file)
│   ├── products.js             # Katalog produk & paket bundle penugasan AMERTA 2026
│   ├── services/
│   │   └── api.js              # Service Layer berbasis Promise (simulasi pengiriman pesanan & upload)
│   └── utils/
│       ├── formatter.js        # Utilitas pemformatan mata uang IDR, ukuran file, & Order ID
│       ├── modal.js            # Engine modal dialog konfirmasi aksesibel (ARIA compliant)
│       ├── storage.js          # Pembungkus LocalStorage dengan validasi versi sinkronisasi
│       ├── toast.js            # Sistem notifikasi Toast ringan tanpa alert() browser
│       └── validator.js        # Mesin validasi formulir Ksatria realtime
├── assets/
│   ├── images/                 # Ilustrasi vektor SVG & placeholder QRIS
│   ├── icons/                  # Ikon vektor antarmuka
│   └── products/               # Katalog gambar ilustrasi atribut AMERTA 2026
└── README.md                   # Dokumentasi teknis & panduan eksekusi proyek
```

---

## 🏗️ Arsitektur & Konfigurasi (*Architecture & Configuration*)

Seluruh nilai yang dapat disesuaikan (*configurable values*) telah dipisahkan dari logika bisnis utama agar mudah dipelihara tanpa perlu mengubah kode inti aplikasi:

1. **`js/config.js` (`APP_CONFIG`)**: Menyimpan nama aplikasi, tenggat waktu pemesanan (*deadline timestamp*), nomor WhatsApp admin, daftar rekening bank resmi, hingga *placeholder* URL Web App Google Apps Script dan Google Drive ID.
2. **`js/products.js` (`productsList`, `bundlePackage`)**: Menyimpan katalog lengkap atribut. Jika di masa depan terjadi perubahan harga atau penambahan atribut, cukup memperbarui berkas ini saja.
3. **`js/constants.js`**: Menghilangkan *magic numbers* dan string literatur di dalam aplikasi, seperti batas maksimal ukuran file (`5 MB`), tipe file yang didukung (`JPG/PNG/WEBP/PDF`), dan kunci `localStorage`.
4. **`js/services/api.js` (`ApiService`)**: Memisahkan logika antarmuka dari konektivitas jaringan. Saat ini mengembalikan *Promise* simulasi yang siap diganti dengan panggilan `fetch()` ke server Google Apps Script.

---

## 🚀 Cara Menjalankan Aplikasi (*How to Run*)

Karena aplikasi ini dibangun dengan arsitektur standar tanpa *bundler* atau dependensi Node.js, aplikasi dapat dijalankan di lingkungan apa pun dengan sangat mudah:

1. **Secara Langsung (File Protocol):**
   - Buka folder proyek di komputer Anda.
   - Klik ganda (*Double-Click*) pada berkas `index.html`. Seluruh modul JavaScript dimuat secara berurutan sehingga dapat langsung berjalan di browser tanpa kendala CORS.

2. **Menggunakan Local Web Server (Direkomendasikan):**
   - Jika menggunakan Visual Studio Code, instal ekstensi **Live Server**, lalu klik kanan pada `index.html` dan pilih *"Open with Live Server"*.
   - Atau menggunakan Python built-in HTTP server melalui terminal:
     ```bash
     python -m http.server 8000
     ```
     Akses melalui browser di alamat `http://localhost:8000`.

---

## 🔧 Integrasi Backend Google Apps Script (*Future GAS Integration*)

Aplikasi ini telah dirancang khusus agar integrasi dengan *backend* **Google Apps Script (GAS)** dan **Google Sheets** (Stage 3) dapat dilakukan hanya dengan mengubah **1 berkas saja (`js/services/api.js`)**:

1. **Siapkan Google Apps Script Web App:**
   - Buat spreadsheet Google Sheets baru dan pasangkan Google Apps Script (`doPost`).
   - Publish script sebagai Web App dengan izin akses *"Anyone"*.
2. **Perbarui Konfigurasi di `js/config.js`:**
   Masukan URL Web App ke dalam properti `gasApiUrl`:
   ```javascript
   const APP_CONFIG = {
     // ...
     gasApiUrl: 'https://script.google.com/macros/s/AKfycbx.../exec'
   };
   ```
3. **Aktifkan Fetch Call di `js/services/api.js`:**
   Ganti simulasi `setTimeout` di dalam fungsi `ApiService.submitOrder` dengan panggilan `fetch` aktual:
   ```javascript
   submitOrder: async (orderPayload) => {
     const response = await fetch(APP_CONFIG.gasApiUrl, {
       method: 'POST',
       headers: { 'Content-Type': 'text/plain;charset=utf-8' },
       body: JSON.stringify(orderPayload)
     });
     return await response.json();
   }
   ```

---

## 🗺️ Roadmap Pengembangan Masa Depan

- [ ] **Stage 3 — Google Apps Script Integration:** Menghubungkan *frontend* dengan Web App GAS untuk menyimpan data pemesanan secara permanen ke Google Sheets.
- [ ] **Stage 4 — Google Drive Direct Upload:** Mengirimkan *encoded Base64 string* dari berkas bukti pembayaran langsung ke folder Google Drive panitia AMERTA.
- [ ] **Stage 5 — E-Ticket & QR Code Verifier:** Membuat portal publik pengecekan status pesanan dan penerbitan tiket digital berkode QR untuk proses registrasi ulang fisik di Airlangga Convention Center.

---

*Bakti Ksatria Airlangga untuk Negeri! Universitas Airlangga — Excellence with Morality.*