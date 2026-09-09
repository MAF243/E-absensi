# E-Absensi STIKOM Elrahma

E-Absensi adalah sistem administrasi dan presensi perkuliahan berbasis web yang dikembangkan untuk STIKOM Elrahma Bogor. Sistem ini memfasilitasi tiga peran utama: Admin Akademik, Dosen, dan Mahasiswa, dengan fitur utama berupa presensi luring melalui pemindaian kode QR yang tervalidasi menggunakan koordinat GPS (radius kampus).

Untuk dokumentasi lengkap mengenai spesifikasi, sasaran metrik, ruang lingkup fungsional, dan rencana pengembangan *(backlog)*, silakan merujuk pada file [PRD.MD](./PRD.MD).

## Fitur Utama

- **Multi-Role Access**: Portal khusus untuk Admin, Dosen, dan Mahasiswa.
- **Manajemen Data Akademik**: Pengelolaan data mahasiswa, dosen, mata kuliah, angkatan/kelompok, dan jadwal kuliah.
- **Presensi Validasi Lokasi**: Mahasiswa memindai QR code di kelas menggunakan perangkat mobile, divalidasi dengan radius 10 meter dari koordinat kampus.
- **Sistem Sesi Perkuliahan**: Dosen dapat membuka dan menutup sesi (luring maupun daring) secara interaktif.
- **Rekapitulasi & Ekspor**: Laporan rekap kehadiran H/I/S/A yang dapat difilter dan diekspor ke dalam format Excel (`.xlsx`).

## Teknologi yang Digunakan

### Frontend
- React 19
- Vite
- Tailwind CSS (v4)
- React Router DOM
- `@yudiel/react-qr-scanner` & `react-qr-code` (Untuk fungsionalitas presensi)
- `exceljs` & `file-saver` (Untuk ekspor rekapitulasi)

### Backend
- Node.js
- Express 5
- MySQL2 (Penghubung basis data)
- Bcrypt (Hashing kata sandi)
- Node-cron (Penjadwalan tugas latar belakang)

### Basis Data
- MySQL (v8.x disarankan)

## Struktur Direktori

```text
E-absensi/
├── backend/                  # Kode sumber server API (Node.js/Express)
│   ├── config/               # Konfigurasi aplikasi
│   ├── controllers/          # Logika bisnis dan handler API
│   ├── routes/               # Definisi endpoint API
│   ├── scripts/              # Skrip utilitas/database
│   ├── server.js             # Entry point backend
│   └── package.json
├── frontend/                 # Kode sumber antarmuka klien (React/Vite)
│   ├── public/               # Aset statis publik
│   ├── src/                  # Komponen, Halaman, Utilitas React
│   ├── index.html            # Entry point HTML frontend
│   └── package.json
├── PRD.MD                    # Product Requirements Document
└── e_absensi_stikom (6).sql  # File dump awal basis data
```

## Prasyarat Instalasi

Pastikan sistem Anda telah memasang perangkat lunak berikut:
- **Node.js** (Disarankan versi LTS, v18 atau v20+)
- **MySQL Server** (XAMPP / Laragon / Standalone)
- **Git** (Opsional)

## Panduan Instalasi dan Menjalankan Aplikasi

### 1. Persiapan Basis Data
1. Buat database baru di MySQL, misalnya `e_absensi_stikom`.
2. Impor file dump SQL yang disertakan: `e_absensi_stikom (6).sql` ke dalam database yang baru dibuat.
3. *Catatan*: Perhatikan [PRD.MD](./PRD.MD) (Bagian 6.2) untuk beberapa modifikasi/migrasi skema tambahan yang mungkin diperlukan (seperti tabel `grup_mahasiswa` atau foreign key).

### 2. Konfigurasi dan Menjalankan Backend
1. Buka terminal dan arahkan ke direktori backend:
   ```bash
   cd backend
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `backend` dan sesuaikan konfigurasinya (misalnya):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=e_absensi_stikom
   DB_PORT=3306
   PORT=5000
   ```
4. Jalankan migrasi agar skema database sesuai dengan aplikasi:
   ```bash
   npm run migrate
   ```
5. Jalankan server backend (mode pengembangan):
   ```bash
   npm run dev
   ```
   Server backend akan berjalan di `http://localhost:5000`.

### 3. Konfigurasi dan Menjalankan Frontend
1. Buka terminal baru dan arahkan ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server frontend:
   ```bash
   npm run dev
   ```
4. Akses aplikasi melalui URL yang diberikan oleh Vite (biasanya `http://localhost:5173`).

---
**Catatan Penting**: Aplikasi ini mengharuskan fitur lokasi dan kamera (di sisi mahasiswa) diakses melalui protokol HTTPS yang aman, atau melalui `localhost` saat tahap pengembangan. Saat *deploy* ke produksi, pastikan frontend diakses menggunakan HTTPS agar sensor perangkat bisa diizinkan oleh peramban (browser).
