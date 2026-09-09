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
import PengaturanAdmin from './pages/admin/PengaturanAdmin';

// 4. Modul Dasbor Dosen
import DosenDashboard from './pages/dosen/DosenDashboard';

// 5. Modul Dasbor Mahasiswa
import MahasiswaDashboard from './pages/mahasiswa/MahasiswaDashboard';
import GlobalToast from './components/common/GlobalToast';
import GlobalConfirm from './components/common/GlobalConfirm';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import { useNavigate } from 'react-router-dom';

const GlobalNavigate = () => {
  window.__NAVIGATE__ = useNavigate();
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <GlobalNavigate />
      <GlobalToast />
      <GlobalConfirm />
      <Routes>
        {/* Rute Halaman Login */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        
        {/* Rute Halaman Admin */}
        <Route path="/dashboard-admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/data-mahasiswa" element={<ProtectedRoute allowedRoles={['admin']}><DataMahasiswa /></ProtectedRoute>} />
        <Route path="/admin/data-dosen" element={<ProtectedRoute allowedRoles={['admin']}><DataDosen /></ProtectedRoute>} />
        <Route path="/admin/data-matkul" element={<ProtectedRoute allowedRoles={['admin']}><DataMatkul /></ProtectedRoute>} /> 
        
        {/* Rute Halaman Dosen */}
        <Route path="/dashboard-dosen" element={<ProtectedRoute allowedRoles={['dosen']}><DosenDashboard /></ProtectedRoute>} />
        
        {/* Rute Halaman Mahasiswa */}
        <Route path="/dashboard-mahasiswa" element={<ProtectedRoute allowedRoles={['mahasiswa']}><MahasiswaDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;