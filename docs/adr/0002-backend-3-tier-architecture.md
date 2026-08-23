# 0002. Adopsi 3-Tier Architecture (Pola Repository) untuk Backend

**Status:** Diterima
**Konteks:**
Aplikasi E-Absensi sebelumnya dirancang dengan menempatkan kueri SQL mentah (`db.query`) dan logika bisnis secara langsung di dalam file-file *Controller*. Seiring dengan bertambah kompleksnya sistem akademik (seperti aturan *Safe Delete* dan kalkulasi persentase absensi), file *Controller* menjadi gemuk (*fat controllers*), sulit dibaca, dan sangat sulit untuk dilakukan pengujian otomatis (*unit testing*). Sistem ini ditargetkan untuk lingkungan kampus nyata sehingga membutuhkan skalabilitas, *clean code*, dan kemudahan pemeliharaan oleh *programmer* generasi berikutnya.

Pilihannya adalah antara mempertahankan *Fat Controller*, memindahkan ke *Fat Service* (menempatkan SQL di dalam Service), atau menggunakan pemisahan penuh **3-Tier Architecture (Pola Repository)**.

**Keputusan:**
Kita mengadopsi **3-Tier Architecture (Pola Repository)** secara penuh. Tanggung jawab kode akan dipisah menjadi tiga lapisan mutlak:
1. **Controller Layer**: Hanya menangani lalu lintas *request* dan *response* HTTP (`req`, `res`).
2. **Service Layer**: Mengisolasi murni Aturan dan Logika Bisnis aplikasi.
3. **Repository Layer**: Mengisolasi seluruh akses data dan kueri SQL.

**Konsekuensi:**
- Meningkatnya jumlah file dalam proyek karena setiap entitas minimal akan memiliki pasangannya sendiri (`controller.js`, `service.js`, `repository.js`).
- Membutuhkan penyesuaian awal bagi pengembang untuk tidak pernah memanggil `db.query` di luar lapisan *Repository*.
- Keuntungannya, arsitektur ini memberikan landasan yang sangat kokoh untuk pemeliharaan jangka panjang dan memungkinkan penulisan *unit test* yang sangat mudah karena lapisan *Service* dapat di-*mock* tanpa menyentuh *database*.
