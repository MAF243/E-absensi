---
name: E-Absensi STIKOM Elrahma
description: Sistem administrasi dan presensi perkuliahan kampus
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  neutral-bg: "#f8fafc"
  neutral-card: "#ffffff"
  neutral-text-main: "#1e3a8a"
  neutral-text-muted: "#64748b"
  neutral-border: "#e2e8f0"
  success-bg: "#ecfdf5"
  success-text: "#059669"
  error-bg: "#fff1f2"
  error-text: "#e11d48"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 800
  body:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 400
rounded:
  xl: "12px"
  3xl: "24px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-card}"
    rounded: "{rounded.xl}"
    padding: "14px 24px"
  input-field:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-text-muted}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  card-main:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.3xl}"
    padding: "32px"
---

# Design System: E-Absensi STIKOM Elrahma

## Overview

**Creative North Star: "The Modern Academic Hub"**

Antarmuka aplikasi E-Absensi dirancang agar terlihat bersih, profesional, dan menenangkan, memberikan penekanan pada kejelasan fungsional namun tetap terasa ramah untuk digunakan (*modern yet welcoming*). Aplikasi ini menghindari kekacauan visual untuk meminimalkan beban kognitif dosen, mahasiswa, maupun admin akademik saat berinteraksi dengan tugas harian mereka.

**Key Characteristics:**
- Tipografi bulat yang modern (Poppins).
- Kedalaman ruang diciptakan melalui bayangan tegas pada elemen struktural.
- Sudut elemen yang sangat membulat (*extra-rounded*) memberikan kesan aman dan ramah sentuhan.

## Colors

Palet warna utama berfokus pada kesejukan dan kredibilitas, didukung oleh rentang warna abu-abu netral sebagai kanvas.

### Primary
- **Academic Blue** (#2563eb): Warna aksi utama. Menyiratkan kredibilitas, kepercayaan, dan citra institusi pendidikan yang solid. Digunakan pada tombol aksi (*call-to-action*) dan penanda fokus.
- **Academic Blue Hover** (#1d4ed8): Versi lebih gelap dari primary untuk kondisi *hover* tombol.

### Neutral
- **Background Soft Slate** (#f8fafc): Latar belakang utama aplikasi yang sangat sejuk, mengurangi kelelahan mata dibandingkan putih bersih.
- **Card White** (#ffffff): Latar belakang modul, form, dan kartu agar terlihat menonjol dari *background* utama.
- **Deep Navy Text** (#1e3a8a): Warna teks utama untuk judul, menjaga hierarki warna pada spektrum sejuk.
- **Muted Slate** (#64748b): Warna untuk teks bantu, ikon *input*, dan label, memberikan kontras yang cukup tanpa mendominasi.
- **Border Slate** (#e2e8f0): Pembatas halus antar elemen dan input.

### Status (Semantic)
- **Success Emerald** (#059669 / bg: #ecfdf5): Digunakan untuk notifikasi berhasil dan status "Hadir".
- **Error Rose** (#e11d48 / bg: #fff1f2): Digunakan untuk notifikasi gagal, peringatan, dan status "Alpa".

### Named Rules
**The Single Accent Rule.** Academic Blue adalah satu-satunya warna yang menarik perhatian kuat. Status semantik (seperti notifikasi sukses atau error) hanya muncul sekilas sebagai balasan atas aksi sistem.

## Typography

**Display Font:** Poppins (with sans-serif fallback)
**Body Font:** Poppins (with sans-serif fallback)

**Character:** Modern, bulat, dan geometris. Penggunaan font Poppins secara global menciptakan lingkungan digital yang bersahabat namun terstruktur.

### Hierarchy
- **Display** (800 / Extrabold, text-3xl): Digunakan secara eksklusif untuk judul hero atau nama aplikasi.
- **Title** (700 / Bold, text-lg/xl): Digunakan untuk judul form atau kartu utama.
- **Label** (700 / Bold, text-xs, uppercase, tracking-wider): Penanda kolom *input* yang jelas dan sangat mudah dipindai secara vertikal.
- **Body** (400 / Normal, text-sm/base): Teks reguler untuk paragraf dan nilai *input*.

## Layout

Tata letak mengusung konsep kartu tunggal terpusat (*centered card*) untuk area autentikasi, serta tata letak responsif bersarang (*nested layout*) untuk *dashboard*. Kontainer selalu memberi ruang lapang (padding tebal) agar konten bernapas lega. 

## Elevation & Depth

**Lifted and Layered**. Sistem ini secara aktif menggunakan efek bayangan (*shadow*) yang tebal dan menyebar untuk memisahkan permukaan interaktif dari kanvas aplikasi. 

### Shadow Vocabulary
- **Card Lift** (`shadow-2xl`): Diterapkan pada kontainer utama (seperti *form* *login* atau kartu utama *dashboard*) untuk membuatnya sangat mengambang di atas latar *slate*.
- **Button Glow** (`shadow-lg shadow-blue-600/20`): Bayangan bernuansa warna *primary* yang digunakan pada tombol penting, menciptakan efek bercahaya ringan yang mengundang klik.

### Named Rules
**The Shadow Is Structural Rule.** Bayangan bukan sekadar hiasan. Ia mendefinisikan batas material dari aplikasi. Jangan gunakan garis *border* tebal secara bersamaan dengan bayangan besar.

## Shapes

Bentuk didominasi oleh kurva yang lembut dan melengkung ekstrem (hingga pill-shape atau semi-pill), yang memberikan karakter "*tactile*" (ingin disentuh).

- **Form & Input** (12px / `rounded-xl`): Radius lengkung standar untuk kolom masukan dan tombol biasa.
- **Container / Card** (24px / `rounded-3xl`): Radius lengkung ekstrem untuk kartu utama pembungkus aplikasi, mengukuhkan konsep *Modern Academic Hub*.

## Components

### Buttons
- **Shape:** Sangat membulat (12px, `rounded-xl`).
- **Primary:** Latar Academic Blue tebal, teks putih, dengan efek bayangan warna menyebar (`shadow-lg shadow-blue-600/20`). Padding vertikal lapang (`py-3.5`).
- **Hover / Focus:** Transisi halus, warna sedikit menggelap ke `blue-700`, dan menggunakan *scale-down* sesaat saat diklik (`active:scale-[0.98]`).

### Inputs / Fields
- **Style:** Latar abu-abu sangat muda (`bg-slate-50`), garis pembatas halus (`border-slate-200`), lengkung dalam (12px, `rounded-xl`). Ikon pendamping (kiri/kanan) berwarna `slate-400`.
- **Focus:** Border berubah menjadi biru, disertai cincin fokus transparan (`focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500`).

### Cards / Containers
- **Corner Style:** Ekstra lengkung (24px, `rounded-3xl`).
- **Background:** Putih bersih dengan sedikit transparansi pada pembatas (`border border-white/50`).
- **Shadow Strategy:** Bayangan jatuh sangat dalam (`shadow-2xl`).
- **Internal Padding:** Spasi lega (`p-8` atau `p-10`).

## Do's and Don'ts

### Do:
- **Do** gunakan gaya "Label" (*uppercase, text-xs, bold, tracking-wider*) untuk setiap *header* form *input* agar struktur data jelas.
- **Do** pertahankan *padding* tebal di dalam kartu maupun *input* untuk menghindari kesan sempit (contoh: padding vertikal `py-3` pada *input*).
- **Do** berikan umpan balik visual (*feedback*) pada setiap tindakan menggunakan warna *Success Emerald* atau *Error Rose*.

### Don't:
- **Don't** gunakan sudut tajam atau desain kotak (contoh: *border-radius* 0 atau 4px) pada elemen interaktif.
- **Don't** hilangkan cincin fokus (*focus ring*) saat menavigasi kolom input; aksesibilitas *keyboard* sangat penting.
