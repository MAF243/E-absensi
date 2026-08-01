# Laporan Audit Arsitektur & Peningkatan Sistem
**Sistem**: E-Absensi STIKOM Elrahma
**Lingkup Audit**: Keseluruhan Basis Kode (*Frontend*, *Backend*, *Database*, DX)

Setelah melakukan tinjauan teknis menyeluruh pada *backend* (Node/Express), *frontend* (React/Vite), dan skema basis data, berikut adalah rekomendasi strategis untuk meningkatkan performa, kemudahan pemeliharaan (*maintainability*), dan standar profesional (*best practices*) sistem ini sebelum diluncurkan.

---

## 1. Arsitektur & Standar Kode Backend

### A. Pola *Repository* dan Lapisan Layanan (*Service Layer*)
> [!TIP]
> **Status Saat Ini:** Seluruh kueri SQL (`db.query`) ditulis langsung di dalam `controller` (contoh: `absensiController.js`).
> **Peningkatan:** Terapkan pemisahan logika bisnis. Pindahkan kueri SQL ke file khusus (Lapisan Model/Repository) dan pertahankan *controller* hanya sebagai penengah lalu lintas data (menerima *request* -> panggil *service* -> kirim *response*). Ini akan membuat kode jauh lebih mudah dites dan dibaca.

### B. Penanganan *Error* Terpusat
> [!NOTE]
> **Status Saat Ini:** Ada puluhan blok `try-catch` di seluruh *controller* yang mengulang kode `res.status(500).json({ message: err.message })`.
> **Peningkatan:** Mengingat sistem ini sudah menggunakan **Express 5.2**, server dapat menangani *async error* secara bawaan. Anda cukup membuang semua blok `try-catch` di *controller* dan membuat satu *Global Error Handling Middleware* (`errorHandler.js`) di ujung rute `server.js`.

### C. Validasi Skema *Input*
> [!WARNING]
> **Status Saat Ini:** Validasi *input* dilakukan secara manual dengan kondisi `if (!identitas || !password)`.
> **Peningkatan:** Integrasikan pustaka seperti **Zod** atau **Joi**. Dengan ini, Anda dapat memvalidasi struktur data secara deklaratif sebelum menyentuh *controller* (misal, memvalidasi format email, membatasi *string*, mencegah serangan *mass-assignment*).

---

## 2. Arsitektur Frontend & State Management

### A. Sentralisasi API (*Axios Interceptors*)
> [!CAUTION]
> **Status Saat Ini:** *Package* `axios` sudah di-instal, tetapi banyak komponen (seperti `DosenDashboard.jsx`) masih menggunakan fungsi bawaan `fetch(apiUrl(...))` dengan blok kode berulang.
> **Peningkatan:** Buat sebuah *instance* Axios terpusat (`utils/axiosClient.js`). Dengan fitur *Interceptors*, Anda dapat menyisipkan JWT ke setiap *request* secara otomatis, sekaligus mencegat (*intercept*) respons `401 Unauthorized` untuk secara otomatis mengeluarkan (*logout*) pengguna jika sesi kedaluwarsa.

### B. Manajemen *State* Global (Sesi Pengguna)
> [!WARNING]
> **Status Saat Ini:** Komponen bereaksi terhadap *state* lokal yang dibaca dari `localStorage` via fungsi pembantu (*helper*) di dalam `useEffect`.
> **Peningkatan:** Gunakan **React Context API** atau pustaka ringan seperti **Zustand** untuk menyimpan *state* profil pengguna. Ini memastikan bahwa jika profil diperbarui di halaman pengaturan, nama profil di *header/sidebar* akan langsung ter-*update* secara reaktif tanpa perlu *reload*.

---

## 3. Desain & Integritas Basis Data

### A. Penghentian Penghapusan Fisik (*Soft Deletes*)
> [!IMPORTANT]
> **Status Saat Ini:** Sistem sangat bergantung pada *Hard Deletes* lewat aksi `ON DELETE CASCADE`. Jika seorang Dosen/Mahasiswa dihapus, maka seluruh riwayat presensi dan sesinya akan ikut lenyap dari sistem.
> **Peningkatan:** Terapkan fitur *Soft Delete*. Tambahkan kolom `is_active` (BOOLEAN) atau `deleted_at` (TIMESTAMP) pada tabel `users`. Data akademik historis pantang untuk dihapus secara permanen karena berkaitan dengan rekam jejak.

### B. Pengindeksan Kueri Berat
> [!TIP]
> **Status Saat Ini:** *Controller* rekapitulasi banyak melakukan relasi (*JOIN*) tabel antara `absensi`, `users`, `mata_kuliah`, dan `sesi_kuliah`.
> **Peningkatan:** Pastikan kolom yang sering digunakan sebagai parameter pencarian dan *JOIN* (seperti `user_id`, `mk_id`, `sesi_id`, `angkatan_id`) memiliki **INDEX**. Tanpa indeks, sistem akan melambat secara eksponensial ketika baris tabel presensi mencapai ratusan ribu *record*.

---

## 4. Pengalaman Pengembang (DX) & Infrastruktur

### A. Containerization (Docker)
> [!NOTE]
> **Status Saat Ini:** Menjalankan proyek membutuhkan instalasi manual (Node, Laragon/MySQL, impor *dump* SQL).
> **Peningkatan:** Tambahkan file `docker-compose.yml`. Dengan satu perintah `docker-compose up`, seluruh tumpukan teknologi (database MySQL, server Node.js, aplikasi Vite) akan langsung menyala secara otomatis, mempermudah anggota tim lain.

### B. Pengujian Otomatis (*Unit Testing*)
> [!WARNING]
> **Status Saat Ini:** Tidak ada satupun *framework* pengujian (seperti Jest atau Vitest) di *package.json*.
> **Peningkatan:** Fitur vital seperti Algoritma Jarak Haversine (penentuan radius absen) dan Mesin Kalkulator Rekapitulasi (AKM) di `rekapController.js` **wajib** dilindungi oleh unit test agar terhindar dari regresi saat kodenya disunting di masa depan.

### C. Dokumentasi API Otomatis
> [!TIP]
> **Status Saat Ini:** Pengembang *frontend* harus membaca kode *controller backend* untuk mengetahui bentuk struktur data (JSON) yang akan diterima.
> **Peningkatan:** Pasang spesifikasi OpenAPI (seperti **Swagger UI**) di *backend* agar seluruh rute `/api/*` terdokumentasi dan dapat diuji langsung melalui browser tanpa memerlukan aplikasi *Postman*.
