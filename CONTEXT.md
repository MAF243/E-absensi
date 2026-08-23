# E-Absensi Domain Glossary

## Terminologi Utama

- **Status Akademik (`status_akademik`)**
  Konsep domain untuk merepresentasikan keanggotaan seorang pengguna (Mahasiswa/Dosen) di institusi, menggantikan konsep teknis *soft-delete*. 
  Nilai yang diizinkan: `AKTIF`, `CUTI`, `LULUS`, `KELUAR`, `RESIGN`.
  **Aturan Sistem:** Pengguna dengan status selain `AKTIF` tidak dapat melakukan proses login ke dalam sistem, dan datanya disembunyikan dari daftar pilihan saat pembuatan kelas baru. Namun, riwayat data transaksional mereka di masa lalu (contoh: presensi kehadiran) akan terus dipertahankan utuh untuk keperluan pelaporan dan audit.

- **Penghapusan Bersyarat (*Safe Delete*) & Koreksi Data**
  Sistem melarang penghapusan data secara paksa (*hard delete*) untuk menjaga integritas riwayat akademik.
  **Aturan Sistem:** 
  1. Penghapusan fisik pada *database* hanya diizinkan JIKA entitas tersebut (Mahasiswa/Dosen) belum memiliki riwayat presensi/transaksi sama sekali (kesalahan input baru).
  2. JIKA sudah ada riwayat presensi, tombol hapus akan ditolak oleh *backend* dan Admin diarahkan untuk mengubah `status_akademik`.
  3. Admin memiliki kewenangan penuh untuk melakukan "Edit Profil" untuk memperbaiki kesalahan ketik (*human error*) kapan saja tanpa harus menghapus data.

- **Status Sesi Kuliah (`status_sesi`)**
  Sesi kelas tidak boleh dihapus jika sudah memiliki presensi masuk.
  **Aturan Sistem:** Sesi yang tidak valid (misal salah jadwal) dapat diubah menjadi status `CANCELLED` (Dibatalkan). 
  Sesi berstatus `CANCELLED` **tidak akan dihitung** sebagai pembagi (denominator) dalam kalkulasi persentase kehadiran 75%. Namun data sesi dan presensinya tetap disimpan sebagai jejak audit. (Penyimpanan database sangat efisien; jutaan presensi salah hanya akan memakan ruang beberapa Megabytes, sehingga tidak menyebabkan database penuh).

- **Tahun Ajaran & Semester (`periode_akademik`)**
  Konsep waktu historis untuk mengikat entitas `Mata Kuliah`. 
  **Aturan Sistem:** Sebuah Mata Kuliah tidak berdiri sendiri melainkan menempel pada sebuah Periode Akademik (contoh: "Ganjil 2026/2027"). Saat semester berganti, Mata Kuliah di semester lama tidak dihapus, melainkan tetap terkunci di periode tersebut. Ini menjamin laporan rekapitulasi presensi akhir semester bersifat abadi (*immutable*) dan tidak akan rusak jika kurikulum berubah di tahun berikutnya.
