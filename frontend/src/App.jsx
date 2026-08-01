import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ==========================================
// IMPORT HALAMAN SESUAI STRUKTUR FOLDER ASLI
// ==========================================

// 1. Modul Auth
import Login from './pages/auth/Login';

// 2. Modul Dasbor Admin Utama
import AdminDashboard from './pages/admin/AdminDashboard';

// 3. Sub-Modul Admin (Data Master)
import DataMahasiswa from './pages/admin/DataMahasiswa';
import DataDosen from './pages/admin/DataDosen';
import DataMatkul from './pages/admin/DataMatkul';

// 4. Modul Dasbor Dosen
import DosenDashboard from './pages/dosen/DosenDashboard';

// 5. Modul Dasbor Mahasiswa
import MahasiswaDashboard from './pages/mahasiswa/MahasiswaDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Halaman Login */}
        <Route path="/" element={<Login />} />
        
        {/* Rute Halaman Admin */}
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
        <Route path="/admin/data-mahasiswa" element={<DataMahasiswa />} />
        <Route path="/admin/data-dosen" element={<DataDosen />} />
        <Route path="/admin/data-matkul" element={<DataMatkul />} /> {/* Rute baru untuk mata kuliah */}
        
        {/* Rute Halaman Dosen */}
        <Route path="/dashboard-dosen" element={<DosenDashboard />} />
        
        {/* Rute Halaman Mahasiswa */}
        <Route path="/dashboard-mahasiswa" element={<MahasiswaDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;