const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// IMPORT ROUTES
// ==========================================
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const mahasiswaRoutes = require('./routes/mahasiswaRoutes');
const angkatanRoutes = require('./routes/angkatanRoutes'); //
const dosenRoutes = require('./routes/dosenRoutes');
const matkulRoutes = require('./routes/matkulRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const rekapRoutes = require('./routes/rekapRoutes');

// ==========================================
// GUNAKAN ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/angkatan', angkatanRoutes);
app.use('/api/dosen', dosenRoutes);
app.use('/api/matkul', matkulRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/rekap', rekapRoutes);


// ==========================================
// MENYALAKAN SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`==================================`);
  console.log(`🚀 Server Backend aktif di port ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`✅ Auth Route terpasang: /api/auth`);
  console.log(`✅ Dashboard Route terpasang: /api/dashboard`);
  console.log(`✅ Mahasiswa Route terpasang: /api/mahasiswa`);
  console.log(`✅ Angkatan Route terpasang: /api/angkatan`);
  console.log(`==================================`);
});