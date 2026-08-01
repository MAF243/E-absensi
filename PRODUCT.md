# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Admin Akademik**: Menjaga data akademik (mahasiswa, dosen, kelas, jadwal) dan mengunduh laporan rekapitulasi.
- **Dosen**: Menjalankan kelas (membuka/menutup sesi, memilih daring/luring) dan mencatat/mengoreksi kehadiran mahasiswa.
- **Mahasiswa**: Mengetahui jadwal kelas, melakukan presensi dengan memindai QR code (untuk kelas luring) yang divalidasi dengan GPS, serta mengakses tautan untuk kelas daring.

## Product Purpose
Sistem informasi administrasi dan presensi perkuliahan untuk memastikan kehadiran tercatat pada sesi yang benar, mengurangi pencatatan manual, dan menyediakan laporan kehadiran.

## Positioning
Presensi luring tervalidasi menggunakan radius lokasi GPS yang sangat ketat (10 meter dari titik kampus) dan pemindaian QR code spesifik per sesi, meminimalkan potensi kecurangan seperti "titip absen".

## Operating Context
- Digunakan di lingkungan kampus STIKOM Elrahma Bogor.
- Mahasiswa dan dosen berinteraksi menggunakan perangkat *mobile* (ponsel) secara *on-the-go* di ruang kelas.
- Admin menggunakan desktop/laptop di ruang administrasi akademik.

## Capabilities and Constraints
- **Platform**: Web (React 19 + Vite, Tailwind CSS).
- **Backend**: Node.js + Express 5, MySQL.
- **Kendala**: Aplikasi mahasiswa harus meminta izin akses Kamera dan Lokasi GPS. Radius divalidasi di backend pada koordinat kampus `-6.5902172, 106.7854656`. Sesi berakhir otomatis setelah jadwal usai.
- **Akses**: Berbasis peran, dan sesi login otomatis kedaluwarsa dalam 12 jam (tanpa aktivitas) atau batas absolut 24 jam.

## Brand Commitments
- Nama Produk: E-Absensi STIKOM Elrahma Bogor.
- Terminologi Kehadiran: Menggunakan singkatan H/I/S/A (Hadir, Izin, Sakit, Alpa).

## Evidence on Hand
- Dokumentasi persyaratan lengkap (`PRD.MD`) yang mendefinisikan *backlog*, *use case*, serta kriteria penerimaan.
- Implementasi awal aplikasi di sisi klien (React) dan server (Express).

## Product Principles
1. **Ketepatan dan Bukti Fisik**: Presensi luring mewajibkan kehadiran fisik (lewat verifikasi titik pusat kampus & QR code yang valid).
2. **Mobile-first untuk Mahasiswa & Dosen**: Desain harus nyaman diakses dengan satu tangan pada layar sekecil 320px. 
3. **Kebenaran Data API**: UI tidak boleh menganggap perubahan lokal sebagai final sebelum server mengonfirmasi perubahan datanya.

## Accessibility & Inclusion
- Kontras harus memenuhi standar WCAG AA.
- Elemen interaktif harus berukuran minimal 44x44 px (ramah sentuhan).
- Indikator status (berhasil, memuat, *error*) dapat diakses dan dipahami secara eksplisit (termasuk untuk pembaca layar). 
- Penanganan error akses sensor yang ramah bagi pengguna awam (pesan informatif saat akses GPS/Kamera ditolak).
