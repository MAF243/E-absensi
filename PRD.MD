# Product Requirements Document — E-Absensi STIKOM Elrahma

| Atribut        | Nilai                                                              |
| -------------- | ------------------------------------------------------------------ |
| Produk         | E-Absensi STIKOM Elrahma Bogor                                     |
| Status dokumen | Baseline implementasi dan backlog terverifikasi (9 September 2026) |
| Pengguna       | Admin Akademik, Dosen, Mahasiswa                                   |
| Platform       | Web responsif (desktop dan perangkat mobile)                       |

## 1. Ringkasan produk

E-Absensi adalah sistem administrasi dan presensi perkuliahan. Admin mengelola data akademik, penugasan kelas, jadwal, sesi, dan laporan. Dosen membuka serta menutup sesi kelas dan memeriksa rekap kehadiran. Mahasiswa melihat jadwal hariannya lalu melakukan presensi kelas luring melalui pemindaian QR dengan validasi lokasi perangkat.

Produk ini dirancang untuk memastikan bahwa kehadiran tercatat terhadap sesi kuliah yang benar, mengurangi pencatatan manual, dan menyediakan laporan yang dapat diekspor.

### Status pembacaan dokumen

Dokumen ini membedakan tiga keadaan: **tersedia** berarti alurnya sudah didukung backend dan/atau frontend; **parsial** berarti sebagian alur tersedia tetapi masih ada gap yang berdampak pada penggunaan; **backlog** berarti kebutuhan belum menjadi perilaku aplikasi. Sumber kebenaran skema aktif adalah migration Knex dan skrip bootstrap database di `backend/`, bukan dump SQL historis.

## 2. Sasaran dan metrik keberhasilan

### Sasaran

- Mengelola master mahasiswa, dosen, mata kuliah, serta kategori angkatan/kelompok dari satu portal.
- Menghubungkan mata kuliah kepada dosen dan peserta kelas paket atau kelas kelompok/KRS.
- Mengendalikan presensi melalui sesi kelas berstatus berlangsung atau selesai.
- Memvalidasi presensi luring memakai QR deterministik berbasis mata kuliah dan posisi GPS dekat kampus.
- Menyediakan rekap kehadiran mahasiswa dan aktivitas mengajar dosen dalam format Excel.

### Indikator keberhasilan awal

- Admin dapat menyelesaikan pengelolaan data dan penugasan tanpa perubahan langsung di database.
- Dosen dapat membuka dan menutup sesi sesuai jadwal, lalu mengoreksi rekapnya.
- Mahasiswa yang berada dalam radius kampus dapat tercatat satu kali untuk sesi luring aktif.
- Rekap yang ditarik berdasarkan filter menghasilkan data yang dapat ditinjau dan diunduh.

## 3. Peran pengguna

| Peran          | Kebutuhan utama                              | Akses yang diimplementasikan                                                                             |
| -------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Admin Akademik | Menjaga data akademik dan memperoleh laporan | Dashboard, master data, angkatan/kelompok, penugasan kelas, jadwal/sesi, QR, rekap, aktivitas dan ekspor |
| Dosen          | Menjalankan kelas dan mencatat kehadiran     | Daftar kelas, buka/tutup sesi, pengaturan profil, riwayat sesi, serta rekap manual H/I/S/A               |
| Mahasiswa      | Mengetahui kelas hari ini dan presensi       | Jadwal harian, pemindaian QR kelas luring dengan GPS, serta akses tautan kelas daring                    |

## 4. Ruang lingkup fungsional

### 4.1 Autentikasi dan akun

- Pengguna masuk dengan nomor induk, nama lengkap, atau inisial dan kata sandi.
- Sistem memverifikasi kata sandi menggunakan `bcrypt` dan menyimpan waktu login terakhir.
- Akun dosen atau mahasiswa berstatus `cuti` atau `tidak aktif` ditolak saat login.
- Backend menerbitkan JWT berdurasi 12 jam; route yang dilindungi memeriksa token dan peran pengguna.
- Setelah login, pengguna diarahkan ke dashboard berdasarkan peran.
- Antarmuka menyediakan logout dengan menghapus sesi/token di klien. Revocation server-side dan refresh token belum tersedia.
- Form “Lupa Password” saat ini hanya menampilkan notifikasi di klien; belum ada proses reset kata sandi pada backend.
- `authLimiter` sudah dikonfigurasi di server, tetapi belum diterapkan pada route login; perlindungan brute-force masih menjadi backlog.

### 4.2 Portal admin

#### Dashboard

- Menampilkan total mahasiswa (aktif dan cuti), total dosen, dan total mata kuliah.
- Menampilkan tiga mahasiswa dengan tingkat kehadiran tertinggi serta tiga dengan tingkat kehadiran di bawah 80% apabila data absensi tersedia.
- Menampilkan lima log login terbaru.
- Data dashboard diperbarui otomatis setiap lima detik saat menu dashboard aktif.
- Kartu `rata_kehadiran` belum didukung oleh nilai statistik backend dan harus dianggap sebagai gap tampilan sampai query diperbaiki.

#### Data mahasiswa dan kategori

- CRUD mahasiswa berisi NIM, nama, kata sandi, status akademik, jenis kelamin, jurusan, dan angkatan utama.
- Impor massal CSV mahasiswa; kata sandi dapat diisi atau memakai NIM sebagai nilai awal.
- Pencarian, filter, pagination, pemilihan banyak data, hapus massal, dan pengubahan jurusan massal.
- CRUD kategori angkatan/kelompok.
- Mahasiswa dapat dipindahkan ke angkatan utama atau ditambahkan ke kelompok tambahan. Kategori yang namanya tidak mengandung “INFORMATIKA” diperlakukan sebagai kelompok tambahan.

#### Data dosen

- CRUD dosen berisi NIDN/inisial, nama, jenis kelamin, status akademik, dan kata sandi.
- Impor massal CSV dan hapus massal.
- Profil dosen menunjukkan mata kuliah yang diampu serta riwayat sesi/agenda.
- Admin dapat menghapus seluruh riwayat sesi seorang dosen.
- Sistem mencatat aktivitas melalui middleware dan menyediakan endpoint serta halaman log aktivitas admin. Cakupan filter, ekspor, dan event belum lengkap.

#### Mata kuliah dan peserta

- CRUD dan impor CSV mata kuliah: kode, nama, SKS, jurusan, dan semester.
- Penugasan dosen dan dua model kelas:
  - `paket`: seluruh mahasiswa pada angkatan/kelompok yang ditugaskan menjadi peserta;
  - `kelompok`: peserta dipilih secara eksplisit sebagai kelas lintas/KRS.
- Admin dapat melihat dan menghapus peserta kelas kelompok, serta mereset penugasan mata kuliah secara massal.

#### Jadwal, sesi, dan QR

- Admin mengatur hari, waktu mulai/selesai, target pertemuan, dan ruangan tiap mata kuliah; jadwal dapat direset.
- Admin dapat membuka sesi darurat (override) atau menutup sesi yang sedang berlangsung.
- Sistem menghasilkan QR deterministik untuk tiap mata kuliah dengan format `stikomabsen://sesi/MATKUL-{id}-{kode_mk}` dan mendukung cetak QR. QR belum berupa token unik per sesi dengan masa berlaku pendek.
- Sesi berakhir otomatis setiap menit jika melewati jam akhir di hari yang sama atau berasal dari hari sebelumnya.

#### Rekap dan ekspor

- Rekap mahasiswa dapat difilter berdasarkan angkatan/kelompok, jurusan, serta rentang tanggal.
- Rekap menghitung Hadir, Izin, Sakit, Alpa, detail persentase tiap mata kuliah, dan AKM (rata-rata persentase mata kuliah).
- Rekap dosen menampilkan mata kuliah, tanggal/jam sesi, jenis sesi, agenda, dan total mahasiswa hadir.
- Kedua rekap dapat ditinjau dengan pagination dan diekspor sebagai `.xlsx`.

### 4.3 Portal dosen

- Menampilkan kelas dosen, memprioritaskan jadwal hari ini, status sesi aktif, ruangan, peserta/angkatan, dan progres terhadap target pertemuan.
- Dosen hanya dapat memulai sesi ketika jadwal sudah diatur, hari sesuai jadwal, dan waktu berada dalam rentang jadwal; satu mata kuliah tidak dapat memiliki lebih dari satu sesi berlangsung.
- Saat membuka sesi, dosen mengisi agenda, memilih luring/daring, jenis sesi, bobot, dan (untuk daring) tautan pertemuan.
- Dosen dapat mengakhiri sesi aktif secara manual.
- Riwayat sesi selesai dapat dibuka untuk meninjau peserta dan memperbarui status manual: Hadir, Izin, Sakit, atau Alpa.
- Dosen dapat memperbarui nama, nomor induk, serta kata sandi akun.

### 4.4 Portal mahasiswa

- Menampilkan daftar kelas mahasiswa pada hari berjalan dan memperbaruinya setiap 15 detik.
- Jadwal berasal dari kelas paket angkatan mahasiswa atau kelas kelompok/KRS yang diikutinya.
- Untuk sesi luring aktif, mahasiswa mengizinkan GPS lalu memindai QR memakai kamera dalam aplikasi.
- Backend memeriksa format QR, sesi mata kuliah yang sedang berlangsung, jarak dari koordinat kampus, dan duplikasi absensi sebelum menyimpan status `hadir`.
- Radius yang diimplementasikan adalah 10 meter dari koordinat kampus `-6.5902172, 106.7854656`.
- Untuk sesi daring aktif, antarmuka membuka tautan pertemuan dan menampilkan status hadir secara lokal.
- Status presensi daring belum disimpan ke backend sehingga tidak boleh dianggap sebagai kehadiran final pada rekap.

## 5. Alur utama

### Presensi kelas luring

1. Admin menyiapkan mata kuliah, peserta, jadwal, dan QR mata kuliah.
2. Dosen membuka sesi pada jadwal yang valid.
3. Mahasiswa membuka kelas hari ini, mengaktifkan lokasi, lalu memindai QR melalui aplikasi.
4. API memastikan mahasiswa berada dalam radius 10 meter, QR berformat valid, sesi masih berlangsung, dan belum ada absensi pada sesi tersebut.
5. Sistem menyimpan absensi `hadir`; dosen dapat melengkapi atau mengoreksi rekap setelah sesi selesai.

### Pelaporan

1. Admin memilih jenis rekap dan filter.
2. Sistem menghitung data berdasarkan sesi yang sudah selesai pada rentang waktu tersebut.
3. Admin meninjau hasil lalu mengunduh berkas Excel bila diperlukan.

## 6. Model data konseptual

| Entitas                                     | Keterangan utama                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `users`                                     | Akun admin, dosen, dan mahasiswa; mencakup identitas, peran, kata sandi ter-hash, status akademik, jurusan, angkatan, dan login terakhir |
| `angkatan`                                  | Kategori angkatan atau kelompok mahasiswa                                                                                                |
| `grup_mahasiswa`                            | Keanggotaan tambahan mahasiswa pada kelompok                                                                                             |
| `mata_kuliah`                               | Master mata kuliah, dosen penanggung jawab, model kelas, angkatan, dan jadwal                                                            |
| `peserta_kelas`                             | Daftar mahasiswa eksplisit untuk kelas kelompok/KRS                                                                                      |
| `sesi_kuliah`                               | Sesi yang dibuka dosen/admin, status, waktu, tipe, agenda, bobot, dan tautan daring                                                      |
| `absensi`                                   | Kehadiran mahasiswa per sesi dan mata kuliah dengan status H/I/S/A                                                                       |
| `password_reset_tokens` _(rencana)_         | Token reset yang di-hash, kedaluwarsa, sekali pakai, dan terkait pengguna                                                                |
| `user_sessions` / refresh token _(rencana)_ | Sesi/perangkat pengguna untuk logout otomatis dan pencabutan akses                                                                       |
| `activity_logs` _(rencana)_                 | Jejak audit append-only atas tindakan penting dan perubahan data                                                                         |
| `app_settings` _(rencana)_                  | Konfigurasi global yang dikelola admin, misalnya lokasi, radius, masa sesi, dan email                                                    |
| `pengajuan_absensi` _(rencana)_             | Pengajuan izin/sakit dan proses persetujuan dosen                                                                                        |

### 6.1 Sumber skema dan status basis data

Skema aktif dibangun dari migration Knex berikut dan dapat dijalankan melalui `npm run migrate` dari folder `backend/`:

- `backend/migrations/20260805173206_initial_schema.js`
- `backend/migrations/20260807091451_create_kelas_table.js`
- `backend/migrations/20260808000000_add_missing_indexes.js`
- `backend/migrations/20260823000000_align_attendance_domain.js`

`backend/scripts/initDb.js` dan skrip sinkronisasi/seed melengkapi kebutuhan bootstrap dan data awal. Dump SQL yang pernah disertakan adalah snapshot historis untuk referensi atau pemulihan, bukan sumber skema utama aplikasi.

Entitas yang digunakan oleh implementasi aktif meliputi `users`, `angkatan`, `grup_mahasiswa`, `kelas`, `mata_kuliah`, `peserta_kelas`, `jadwal`, `sesi_kuliah`, `absensi`, `periode_akademik`, `activity_logs`, serta tabel pendukung reset password, refresh token, pengajuan absensi, dan pengaturan aplikasi sesuai migration/bootstrap yang tersedia.

### 6.2 Snapshot SQL historis

Dump [e_absensi_stikom (6).sql](<e_absensi_stikom%20(6).sql>) berasal dari MySQL 8.0.30 dan mendefinisikan delapan tabel berikut.

| Tabel           | Kolom/aturan penting dari dump                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`         | Identitas unik (`nomor_induk`), peran `admin`/`dosen`/`mahasiswa`, hash kata sandi, status akademik, gender, jurusan, angkatan, waktu login dan pembuatan |
| `angkatan`      | Nama angkatan unik; satu angkatan dapat memiliki banyak pengguna dan mata kuliah                                                                          |
| `mata_kuliah`   | Kode mata kuliah unik, model `paket`/`kelompok`, SKS, dosen, angkatan, semester, jadwal, serta target pertemuan                                           |
| `peserta_kelas` | Tabel penghubung mahasiswa dan mata kuliah untuk kelas kelompok/KRS                                                                                       |
| `sesi_kuliah`   | Mata kuliah, dosen, tipe `offline`/`online`, tautan, status `berlangsung`/`selesai`, waktu, agenda, jenis, dan bobot sesi                                 |
| `absensi`       | Penghubung pengguna, mata kuliah, dan (opsional) sesi; status `hadir`/`sakit`/`izin`/`alpa`                                                               |
| `kehadiran`     | Tabel presensi lama/alternatif: mahasiswa, sesi, waktu scan, status `hadir`/`izin`/`sakit`/`alfa`                                                         |

Dump menyediakan primary key untuk seluruh tabel, unique key pada `users.nomor_induk`, `angkatan.nama_angkatan`, dan `mata_kuliah.kode_mk`, serta foreign key yang menghapus data turunan saat pengguna atau mata kuliah dihapus. Penghapusan dosen atau angkatan pada mata kuliah mengosongkan referensinya (`SET NULL`).

### 6.3 Kesesuaian snapshot historis dengan aplikasi

- Dump berisi data awal dan struktur lama yang tidak selalu mencerminkan tabel tambahan pada migration aktif.
- Kode aktif memakai `absensi` dan status `alpa`; tabel atau status lama seperti `kehadiran`/`alfa` tidak boleh dijadikan kontrak baru.
- Saat melakukan pemulihan dari dump, jalankan migration setelah impor dan verifikasi indeks, foreign key, tabel kelas/periode/kelompok, serta constraint keunikan attendance sebelum aplikasi dijalankan.

## 7. Rencana pengembangan berikutnya

Seluruh kebutuhan pada bagian ini adalah target pengembangan setelah baseline saat ini. Implementasi harus memakai satu sumber data MySQL melalui API backend; antarmuka tidak boleh menganggap perubahan lokal sebagai data final sebelum backend mengonfirmasinya.

### 7.1 Reset kata sandi melalui email

- Tambahkan tautan **Lupa Password** pada halaman login dan halaman pengaturan mahasiswa, dosen, serta admin.
- Pengguna mengirim nomor induk/inisial atau email terdaftar. Sistem selalu menampilkan respons generik agar alamat email yang terdaftar tidak dapat ditebak.
- Backend membuat token acak sekali pakai, menyimpan **hash token**, ID pengguna, waktu kedaluwarsa, dan waktu penggunaan pada tabel `password_reset_tokens`.
- Sistem mengirim email berisi tautan reset melalui penyedia SMTP yang dikonfigurasi dengan environment variable; tautan berlaku maksimal 30 menit.
- Halaman reset meminta kata sandi baru dan konfirmasi. Token yang valid mengganti kata sandi dengan hash `bcrypt`, menandai token telah digunakan, dan mencabut semua sesi aktif pengguna.
- Terapkan batas pengiriman (misalnya maksimal 3 permintaan per email/IP per jam), audit log, serta pengiriman email asinkron/gagal-ulang yang aman.
- Tambahkan kolom `email` unik dan terverifikasi pada `users`; pengguna tanpa email terverifikasi diarahkan meminta bantuan admin.

### 7.2 Sesi login, keamanan, dan sinkronisasi

- Pertahankan access token JWT yang sudah digunakan saat ini, lalu tambahkan access token berdurasi pendek dan refresh token yang disimpan aman. Semua endpoint baru wajib dilindungi autentikasi dan otorisasi berbasis peran.
- Sesi berakhir otomatis setelah **12 jam tidak ada aktivitas** dan, sebagai batas mutlak, maksimum **24 jam sejak login**. Aplikasi menampilkan peringatan satu menit sebelum logout otomatis.
- Aktivitas yang memperpanjang sesi meliputi interaksi pengguna yang bermakna dan request API terautentikasi; polling otomatis halaman tidak boleh memperpanjang sesi.
- Logout, penggantian kata sandi, reset kata sandi, dan penonaktifan akun mencabut refresh token dari semua perangkat yang sesuai.
- Semua pembaruan data memakai API sebagai sumber kebenaran. Setelah operasi berhasil, klien memuat ulang data terkait atau menerima pembaruan real-time (WebSocket/Server-Sent Events) untuk dashboard, jadwal/sesi, absensi, dan log aktivitas.
- Terapkan validasi backend atas peran, kepemilikan data, peserta kelas, dan status akademik pada setiap operasi. Gunakan constraint database untuk relasi dan keunikan data kritis.

### 7.3 Log aktivitas untuk admin

- Lengkapi halaman **Log Aktivitas** yang sudah tersedia pada portal admin dengan pencarian, filter pengguna/peran/jenis aksi/rentang tanggal, pagination, dan ekspor.
- Catat aktivitas autentikasi (login, logout, login gagal, reset password), perubahan profil, CRUD master data, impor/ekspor, perubahan jadwal/penugasan, buka/tutup sesi, scan QR, pengajuan izin/sakit, serta perubahan rekap manual.
- Setiap entri menyimpan: waktu, pengguna pelaku (jika ada), peran, aksi, jenis dan ID entitas, ringkasan perubahan sebelum/sesudah yang disanitasi, alamat IP, user-agent, dan status berhasil/gagal.
- Log bersifat append-only bagi aplikasi. Hanya admin berwenang yang dapat membaca; data sensitif seperti kata sandi, token, dan isi rahasia tidak boleh dicatat.
- Dashboard admin menampilkan aktivitas terbaru secara real-time dan tautan ke detail log.

### 7.4 Pengaturan untuk setiap peran

| Peran     | Pengaturan yang diperlukan                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin     | Profil dan email, perubahan kata sandi, sesi/perangkat aktif, preferensi notifikasi, pengaturan masa sesi, konfigurasi lokasi/radius presensi, serta pengelolaan template email |
| Dosen     | Profil dan email, kata sandi, sesi/perangkat aktif, preferensi notifikasi jadwal/pengajuan izin, serta preferensi tampilan jadwal                                               |
| Mahasiswa | Profil dan email, kata sandi/reset, sesi/perangkat aktif, preferensi notifikasi, serta izin akses kamera/lokasi yang dapat diperiksa ulang                                      |

Pengaturan sensitif—email, kata sandi, lokasi/radius, dan masa sesi—memerlukan validasi backend serta dicatat pada log aktivitas. Konfigurasi global admin memakai tabel pengaturan agar tidak perlu mengubah kode sumber.

### 7.5 Dosen: riwayat mengajar dan rekap peserta

- Pertahankan riwayat mengajar per dosen, lalu lengkapi dengan filter mata kuliah, kelas, tipe sesi, jenis sesi, dan rentang tanggal.
- Detail setiap sesi menunjukkan daftar peserta yang sah, waktu presensi, status H/I/S/A, pengajuan izin/sakit, dan total/persentase kehadiran.
- Mahasiswa yang berhasil melakukan scan QR pada sesi tersebut otomatis berstatus `hadir` di absensi manual. Mahasiswa tanpa catatan awal berstatus `alpa`; dosen hanya perlu mengubah status bila ada koreksi atau bukti izin/sakit.
- Pada absensi manual, tampilkan **Total Mahasiswa Hadir Hari Ini** sebagai jumlah peserta sesi dengan status `hadir`, beserta total peserta dan ringkasan H/I/S/A. Angka diperbarui segera setelah dosen mengubah status dan setelah data tersimpan.
- Dosen dapat membuat presensi manual untuk satu sesi, termasuk membuat sesi manual bila diberi hak dan alasannya dicatat. Perubahan manual harus menyimpan pelaku, waktu, alasan, serta nilai sebelum/sesudah.
- Dosen hanya dapat mengakses mata kuliah dan peserta yang ditugaskan kepadanya. Rekap dapat diekspor ke Excel/PDF sesuai kebijakan admin.
- Rekap dan progres pertemuan menghitung bobot sesi secara konsisten, termasuk sesi pengganti dan kelas daring.

### 7.6 Mahasiswa: pengaturan, izin, dan sakit

- Tambahkan halaman pengaturan mahasiswa yang responsif untuk profil, email, keamanan akun, reset kata sandi, dan status sesi/perangkat.
- Tambahkan menu **Izin/Sakit** pada mahasiswa untuk memilih sesi atau mata kuliah, jenis pengajuan (`izin` atau `sakit`), alasan, dan lampiran opsional sesuai kebijakan kampus.
- Pengajuan hanya dapat dibuat untuk sesi yang relevan dan dalam jendela waktu yang ditentukan admin. Pengajuan tidak boleh mengganti absensi yang sudah tercatat sebagai hadir tanpa jejak audit.
- Pengajuan tidak membutuhkan persetujuan dosen. Sistem menyimpan bukti dan alasan sebagai referensi; dosen melihatnya di detail riwayat mengajar/absensi manual saat menentukan status H/I/S/A mahasiswa.
- Tambahkan entitas `pengajuan_absensi` dengan pemohon, sesi, jenis, alasan, lampiran, waktu pengajuan, dan status peninjauan (misalnya `baru` atau `dilihat`) agar bukti dapat ditelusuri tanpa menjadi mekanisme persetujuan.

### 7.7 Desain responsif dan kemudahan pakai

- Portal mahasiswa dan dosen menggunakan pendekatan mobile-first; seluruh aksi inti dapat dilakukan dengan satu tangan pada lebar layar 320 px ke atas.
- Navigasi di ponsel memakai menu ringkas/bottom navigation untuk fungsi utama; tabel panjang berubah menjadi kartu atau memiliki scroll horizontal dengan label yang tetap jelas.
- Ukuran area sentuh minimal 44×44 px, teks utama mudah dibaca, kontras memenuhi WCAG AA, fokus keyboard terlihat, dan status/loading/error dapat dipahami pembaca layar.
- Form menampilkan validasi di dekat field, menyimpan draf yang aman bila relevan, dan tidak menghapus masukan saat jaringan gagal.
- Scanner QR menampilkan alasan yang jelas untuk izin kamera/lokasi gagal, lokasi di luar radius, QR tidak valid, dan sesi belum aktif.
- Tampilan admin, dosen, dan mahasiswa memakai istilah status yang seragam: `hadir`, `izin`, `sakit`, dan `alpa`.

### 7.8 Kriteria penerimaan rencana pengembangan

- Pengguna dengan email terverifikasi dapat menyelesaikan reset kata sandi hanya melalui token sekali pakai yang belum kedaluwarsa; token tidak pernah tersimpan atau tercatat dalam teks asli.
- Pengguna logout setelah 12 jam tidak aktif atau 24 jam sejak login, lalu harus masuk kembali; polling otomatis tidak mencegah logout.
- Admin dapat menemukan aktivitas penting pengguna berdasarkan filter dan melihat data audit tanpa kata sandi atau token.
- Perubahan jadwal/sesi/absensi yang dilakukan satu peran terlihat pada peran terkait setelah backend berhasil menyimpan data.
- Dosen hanya dapat melihat dan mengubah rekap kelas yang diampunya; setiap perubahan manual dapat ditelusuri.
- Mahasiswa yang sudah scan QR muncul sebagai `hadir` pada absensi manual, dan jumlah hadir sesi sesuai dengan daftar status yang terlihat serta rekap tersimpan.
- Pengajuan izin/sakit mahasiswa tersimpan bersama bukti pada sesi yang tepat dan terlihat oleh dosen sebagai referensi saat melakukan absensi manual; status akhir absensi tercermin di rekap.
- Seluruh alur inti mahasiswa dan dosen dapat digunakan pada layar ponsel tanpa kehilangan fungsi utama.

## 8. Kebutuhan nonfungsional dan teknis

- Frontend: React 19, Vite, React Router, Tailwind CSS, Axios/fetch, `@yudiel/react-qr-scanner`, `react-qr-code`, ExcelJS, dan FileSaver.
- Backend: Node.js, Express 5, MySQL melalui `mysql2`, `bcrypt`, CORS, dotenv, dan `node-cron`.
- Database diakses melalui connection pool MySQL yang dikonfigurasi menggunakan `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, dan `DB_PORT`.
- API backend berjalan secara default di `http://localhost:5000`; klien saat ini banyak memakai URL tersebut secara langsung.
- Antarmuka harus dapat digunakan pada perangkat mobile, khususnya portal mahasiswa untuk kamera dan GPS.
- Query database menggunakan parameter untuk nilai dinamis pada endpoint yang diimplementasikan.

## 9. API yang tersedia

| Area        | Endpoint utama                                                                               |
| ----------- | -------------------------------------------------------------------------------------------- |
| Autentikasi | `POST /api/auth/login`, `GET /api/auth/profile`, `GET /api/auth/activity`                    |
| Dashboard   | `GET /api/dashboard/stats`, `/ranking`, `/logs`                                              |
| Mahasiswa   | CRUD `/api/mahasiswa`, impor `/bulk`, penugasan/operasi massal                               |
| Dosen       | CRUD `/api/dosen`, impor `/bulk`, detail dan reset riwayat                                   |
| Angkatan    | CRUD `/api/angkatan`                                                                         |
| Kelas       | CRUD dan pengelolaan peserta melalui `/api/kelas`                                            |
| Mata kuliah | CRUD `/api/matkul`, penugasan dan peserta kelas                                              |
| Periode     | CRUD `/api/periode`                                                                          |
| Jadwal/sesi | `GET /api/jadwal`, buka/tutup sesi, jadwal mahasiswa, dan `DELETE /api/jadwal/sesi/:sesi_id` |
| Absensi     | `POST /api/absensi/scan`, riwayat dosen, detail sesi, rekap manual                           |
| Rekap       | `GET /api/rekap/mahasiswa`, `GET /api/rekap/dosen`                                           |

## 10. Batasan dan backlog prioritas

Bagian ini memisahkan kebutuhan/rancangan dari perilaku yang benar-benar tersedia saat ini.

- JWT dan middleware autentikasi/otorisasi peran sudah tersedia pada route utama; refresh token, revocation server-side, dan timeout berbasis aktivitas masih backlog.
- `authLimiter` sudah terkonfigurasi tetapi belum dipasang pada route login; perlindungan brute-force belum efektif.
- Presensi sesi daring saat ini hanya mengubah status di antarmuka dan membuka tautan; tidak ada panggilan API untuk menyimpan kehadiran.
- Dashboard menampilkan kartu “Kehadiran Harian”, tetapi backend statistik belum menghitung `rata_kehadiran`.
- Router frontend menyediakan halaman login, dashboard admin, mahasiswa, dosen, serta halaman admin mahasiswa/dosen/mata kuliah; menu lain seperti periode dan kelas belum memiliki halaman UI mandiri.
- Validasi kepesertaan kelas pada alur scan harus dipertahankan sebagai acceptance check dan diverifikasi terhadap implementasi backend saat perubahan attendance berikutnya.
- QR bersifat deterministik berdasarkan ID mata kuliah, bukan token sesi yang berubah-ubah. Untuk mitigasi titip absen yang lebih kuat, gunakan token QR per sesi dengan masa berlaku pendek.
- Radius implementasi 10 meter, bukan 50 meter seperti rancangan awal.
- Migration Knex dan bootstrap database sudah tersedia serta menjadi sumber skema aktif; dump SQL tetap merupakan snapshot historis.
- Fitur pengaturan akun admin dan reset kata sandi belum terhubung ke backend.

## 11. Kriteria penerimaan inti

- Login yang valid mengarahkan pengguna ke portal sesuai peran dan menolak akun cuti/tidak aktif.
- Data master dan penugasan mata kuliah yang disimpan admin terlihat kembali saat halaman dimuat ulang.
- Sesi tidak dapat dibuka jika jadwal belum ditetapkan atau sudah ada sesi berlangsung untuk mata kuliah yang sama.
- Scan QR luring ditolak bila lokasi di luar radius, QR tidak valid, sesi tidak aktif, atau mahasiswa telah absen pada sesi itu; scan valid tersimpan sebagai `hadir`.
- Dosen dapat menyimpan perubahan H/I/S/A bagi peserta suatu sesi selesai.
- Filter rekap menghasilkan data sesuai rentang tanggal dan berkas Excel dapat diunduh ketika data tersedia.
