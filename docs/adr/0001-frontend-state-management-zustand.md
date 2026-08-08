# 0001. Penggunaan Zustand untuk Manajemen State Frontend

**Status:** Diterima
**Konteks:**
Aplikasi React E-Absensi sebelumnya mengandalkan pembacaan paksa dari `localStorage` pada blok `useEffect` di setiap komponen. Pendekatan ini tidak reaktif; perubahan pada satu bagian aplikasi (seperti pembaruan profil pengguna) tidak langsung merender ulang komponen lain yang bergantung pada data tersebut tanpa me-*reload* halaman. Kita membutuhkan solusi manajemen *state* global.

Pilihannya adalah antara **React Context API** bawaan dan **Zustand**. React Context API menimbulkan banyak *boilerplate* (membutuhkan Provider) dan bisa memicu *re-render* yang tidak perlu pada hierarki komponen di bawahnya. 

**Keputusan:**
Kita akan menggunakan **Zustand** sebagai standar manajemen *state* global di aplikasi Frontend. Zustand dipilih karena kurva belajarnya yang nyaris nol, ukurannya yang sangat ringan, kemampuannya menekan *re-render* secara spesifik (hanya merender ulang saat variabel yang ditarik berubah), serta dukungan bawaannya untuk *middleware persist* yang menyinkronkan *state* ke `localStorage` secara transparan.

**Konsekuensi:**
- Tim pengembang perlu menginstal dan memahami pola penulisan *store* di Zustand.
- Kode manual pembacaan `localStorage.getItem()` di dalam komponen React secara perlahan akan dieliminasi dan digantikan dengan pemanggilan *hook* Zustand (contoh: `const user = useAuthStore(state => state.user)`).
