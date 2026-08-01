# Laporan Audit Keamanan (OWASP Top 10)
**Sistem**: Backend E-Absensi STIKOM Elrahma
**Tanggal Audit**: 1 Agustus 2026

Berdasarkan pemeriksaan kode sumber pada repositori `backend`, berikut adalah temuan audit keamanan yang dipetakan menggunakan kerangka standar **OWASP Top 10 (2021)**. 

---

## 1. A01:2021 - Broken Access Control
> [!CAUTION]
> **Tingkat Risiko: KRITIS**

- **Temuan:** Seluruh endpoint API (seperti `/api/mahasiswa`, `/api/dosen`, `/api/dashboard`, `/api/jadwal`, dll.) **sama sekali tidak dilindungi oleh *middleware* otorisasi**. 
- **Dampak:** Siapa saja (termasuk yang belum login atau *attacker* dari luar) dapat memanggil *endpoint* tersebut secara langsung (misal: mengirim request POST/DELETE ke `/api/mahasiswa`) untuk memanipulasi atau menghapus data sensitif di dalam *database* tanpa hambatan.
- **Rekomendasi:** Segera buat *middleware* `verifyToken` dan terapkan *Role-Based Access Control* (RBAC) pada setiap *route*.

## 2. A02:2021 - Cryptographic Failures
> [!WARNING]
> **Tingkat Risiko: SEDANG**

- **Temuan:** 
  1. *Password* sudah di-*hash* dengan baik menggunakan `bcrypt` pada `authController.js`. Ini adalah praktik yang sangat bagus.
  2. *Token* sesi (yang direncanakan berupa JWT) saat ini hanya ditangani secara semu di *frontend* (`Login.jsx`), sementara *backend* tidak benar-benar mengenerasi atau memvalidasi JWT.
- **Rekomendasi:** Pastikan pertukaran data (terutama login dan presensi) dilakukan di atas protokol HTTPS agar sandi tidak dicegat di jaringan (*Man-in-the-Middle Attack*).

## 3. A03:2021 - Injection
> [!TIP]
> **Tingkat Risiko: RENDAH (Sudah tertangani dengan baik)**

- **Temuan:** Hampir seluruh eksekusi kueri MySQL menggunakan *Parameterized Query* (contoh: `await db.query("SELECT * FROM users WHERE nomor_induk = ?", [identitas])`). 
- **Dampak:** Parameterized kueri ini secara efektif memisahkan struktur SQL dari data input pengguna, sehingga sistem E-Absensi terbebas dari ancaman SQL Injection tradisional.

## 4. A04:2021 - Insecure Design
> [!WARNING]
> **Tingkat Risiko: TINGGI**

- **Temuan:** Meskipun pustaka `express-rate-limit` sudah terdaftar di `package.json`, ia **belum diterapkan** pada `server.js` maupun rute login.
- **Dampak:** *Attacker* dapat melakukan *Brute-Force* atau *Credential Stuffing* dengan mengirim ribuan percobaan sandi per menit ke *endpoint* `/api/auth/login` tanpa diblokir oleh sistem.
- **Rekomendasi:** Terapkan `express-rate-limit` secara ketat untuk rute otentikasi (misal, maksimal 5x gagal login dalam 15 menit).

## 5. A05:2021 - Security Misconfiguration
> [!WARNING]
> **Tingkat Risiko: TINGGI**

- **Temuan:** Konfigurasi CORS pada `server.js` disetel terbuka lebar (`app.use(cors())`). Selain itu, aplikasi tidak mengirimkan *security headers* dasar.
- **Dampak:** Karena CORS terbuka, situs web jahat mana pun dapat melakukan *Cross-Origin Resource Sharing* ke *backend* Anda.
- **Rekomendasi:** 
  1. Batasi CORS hanya untuk domain *frontend* aplikasi (misal: `cors({ origin: 'http://localhost:5173' })`).
  2. Gunakan *library* `helmet` untuk menambahkan HTTP *headers* pengaman.

## 6. A06:2021 - Vulnerable and Outdated Components
> [!NOTE]
> **Tingkat Risiko: RENDAH**

- **Temuan:** Versi *dependencies* yang digunakan di `package.json` cukup modern (Express 5.2.1, bcrypt 6.0.0, mysql2 3.22.5). Tidak terlihat penggunaan *library* lawas yang berbahaya secara eksplisit.
- **Rekomendasi:** Selalu rutin jalankan `npm audit` di masa mendatang untuk memantau celah pada pustaka pihak ketiga.

## 7. A07:2021 - Identification and Authentication Failures
> [!CAUTION]
> **Tingkat Risiko: KRITIS**

- **Temuan:** Berdasarkan pemeriksaan di `authController.js`, *backend* berhasil mencocokkan *password*, tetapi ia hanya mengembalikan objek `data: { id, nama, role }` tanpa melampirkan JWT (*JSON Web Token*) atau menanam *session cookie*. 
- **Dampak:** Ketiadaan validasi *session token* di tingkat peladen (server) menyebabkan peretasan sesi dan manipulasi API menjadi sangat mudah. Frontend mungkin berasumsi ia sudah "login" (menyimpan data di `localStorage`), tapi *backend* benar-benar dalam keadaan amnesia / tidak memiliki kemampuan otentikasi.

## 8. A08:2021 - Software and Data Integrity Failures
- **Temuan (Informasi):** Aplikasi belum memilki proses *build pipeline* (CI/CD) yang menerapkan integritas (*Software Bill of Materials*), namun untuk skala aplikasi kampus tingkat menengah, hal ini bisa dikesampingkan sementara.

## 9. A09:2021 - Security Logging and Monitoring Failures
> [!IMPORTANT]
> **Tingkat Risiko: SEDANG**

- **Temuan:** Aplikasi tidak mencatat (`logging`) kegagalan otentikasi atau perubahan data krusial ke dalam file log persisten. Log hanya muncul sekilas di `console.error` atau tabel `activity_logs` yang direncanakan di PRD namun belum aktif.
- **Dampak:** Jika peretasan terjadi, admin akan kesulitan melakukan audit forensik karena jejak kejahatannya terhapus ketika server di-*restart*.

## 10. A10:2021 - Server-Side Request Forgery (SSRF)
- **Temuan:** Tidak ditemukan rute API yang meminta server untuk mengambil resource dari *URL eksternal* berdasarkan *input* pengguna. Aplikasi saat ini aman dari risiko SSRF.

---
### Kesimpulan Eksekutif
Aplikasi E-Absensi memiliki **pertahanan yang baik terhadap SQL Injection**, namun **sangat rentan dari segi kontrol akses (Access Control) dan Otentikasi (Authentication)**. Untuk menuju tahap produksi (*production-ready*), prioritas absolut harus diberikan pada penerapan:
1. Implementasi **JWT (JSON Web Token)** untuk otentikasi.
2. Penambahan **Middleware RBAC** (Role-Based Access Control) di seluruh rute.
3. Pengetatan **CORS** dan penambahan **Rate Limiter**.
