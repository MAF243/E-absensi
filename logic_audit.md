# Laporan Audit Cacat Logika (Business Logic Flaws)
**Sistem**: Backend E-Absensi STIKOM Elrahma
**Area Audit**: Proses Presensi, Penjadwalan, dan Rekapitulasi

Setelah melakukan audit mendalam terhadap kode pada *controller* (`absensiController.js`, `jadwalController.js`, dan `rekapController.js`), ditemukan **4 cacat logika (flaw)** yang berpotensi merusak integritas data dan tidak sesuai dengan aturan bisnis di `PRD.MD`.

---

## 1. Validasi Kepesertaan Kelas (Titip Absen Lintas Kelas)
> [!CAUTION]
> **Lokasi**: `absensiController.js` -> `scanQR()`
> **Tingkat Keparahan: KRITIS**

**Cacat Logika**: 
Saat mahasiswa memindai QR code, sistem memeriksa kecocokan jarak GPS, format QR, dan apakah sesi sedang aktif. **Namun**, sistem *tidak pernah* mengecek apakah `mahasiswa_id` tersebut benar-benar peserta dari mata kuliah (`mk_id`) tersebut.
- **Skenario Eksploitasi**: Mahasiswa A (Jurusan IT) mendapatkan foto QR code dari temannya Mahasiswa B (Jurusan Bisnis). Mahasiswa A pergi ke kampus, memindai QR tersebut, dan sistem akan mencatat Mahasiswa A "hadir" di kelas Bisnis meskipun ia tidak terdaftar di kelas tersebut.

## 2. Validasi Waktu Buka Sesi oleh Dosen
> [!WARNING]
> **Lokasi**: `jadwalController.js` -> `bukaSesi()`
> **Tingkat Keparahan: TINGGI**

**Cacat Logika**:
PRD menyebutkan: *"Dosen hanya dapat memulai sesi ketika jadwal sudah diatur, **hari sesuai jadwal, dan waktu berada dalam rentang jadwal**."*
Namun, pada kode saat ini, sistem hanya mengecek apakah jadwal sudah "diisi/diatur" (`!mk[0].hari`). Sistem tidak membandingkan hari ini (`CURDATE()`) dan jam saat ini (`CURTIME()`) dengan hari dan jam di jadwal mata kuliah.
- **Skenario Eksploitasi**: Dosen bisa membuka sesi pada hari Minggu jam 2 pagi, meskipun jadwal sebenarnya adalah hari Rabu jam 10 pagi. Ini akan mengacaukan perhitungan pertemuan dan membuka celah manipulasi sesi.

## 3. Hilangnya Mahasiswa di Rekap Harian (Grup Tambahan)
> [!WARNING]
> **Lokasi**: `absensiController.js` -> `getDetailRekapSesi()`
> **Tingkat Keparahan: TINGGI**

**Cacat Logika**:
Saat dosen membuka riwayat/detail sesi untuk mengecek daftar hadir, sistem menarik daftar mahasiswa kelas paket dengan kueri:
`SELECT ... FROM users WHERE role='mahasiswa' AND angkatan_id=?`
Kueri ini **mengabaikan** tabel `grup_mahasiswa`.
- **Skenario Eksploitasi**: Jika Mahasiswa C dipindahkan ke kelas paket ini melalui fitur "Kelompok Tambahan" (lintas KRS), ia bisa melakukan absen QR (karena tidak ada validasi kepesertaan di poin 1), tapi namanya **tidak akan muncul** di layar dosen saat dosen ingin menyimpan rekap manual.

## 4. Perhitungan Persentase AKM (Ketidakhadiran Diabaikan)
> [!CAUTION]
> **Lokasi**: `rekapController.js` -> `getRekapMahasiswa()`
> **Tingkat Keparahan: KRITIS**

**Cacat Logika**:
Sistem menghitung persentase kehadiran per mata kuliah dan total AKM dengan melakukan perulangan (`forEach`) hanya pada data yang ada di tabel `absensi` (`recordAbsen`).
Jika seorang mahasiswa bolos total (Alpa) dan dosen tidak pernah menyimpan "Rekap Manual" yang memasukkan status `alpa` ke database, maka mahasiswa tersebut **tidak memiliki baris data** di tabel `absensi`.
- **Skenario Eksploitasi**: Mahasiswa D hadir 100% di Mata Kuliah X, tetapi bolos 100% (tidak pernah absen) di Mata Kuliah Y. Karena tidak ada data di Mata Kuliah Y, sistem hanya menghitung persentase dari Mata Kuliah X. Hasilnya, laporan rekap mahasiswa tersebut akan menunjukkan **Kehadiran Sempurna (100%)**, menutupi fakta bahwa ia selalu bolos di kelas Y.

---
### Rekomendasi Tindak Lanjut
Keempat cacat logika di atas secara fundamental merusak validitas laporan kehadiran yang dijanjikan aplikasi. Anda harus menambal hal ini dengan:
1. Menambahkan kueri pengecekan status peserta (*join* ke `angkatan`, `peserta_kelas`, dan `grup_mahasiswa`) sebelum `INSERT` absen di `scanQR`.
2. Menambahkan `if` yang memvalidasi tanggal & jam (`new Date().getDay()`) di dalam `bukaSesi`.
3. Memperbaiki *query* tarik daftar mahasiswa pada `getDetailRekapSesi` agar selalu mengikutsertakan `grup_mahasiswa`.
4. Memperbaiki logika `getRekapMahasiswa` dengan memastikan bahwa sistem me-*looping* daftar seluruh mata kuliah yang **diikuti mahasiswa**, bukan hanya me-*looping* riwayat *tap-in* (absensi) yang berhasil dilakukannya.
