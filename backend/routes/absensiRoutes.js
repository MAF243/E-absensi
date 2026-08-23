const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { scanQR, getRiwayatDosen, getDetailRekapSesi, simpanRekapManual } = require('../controllers/absensiController');

router.use(verifyToken);

router.post('/scan', verifyRole('mahasiswa'), scanQR);

// Route Baru untuk Riwayat & Rekap Dosen
router.get('/riwayat-dosen/:dosen_id', verifyRole('dosen', 'admin'), getRiwayatDosen);
router.get('/sesi/:sesi_id', verifyRole('dosen', 'admin'), getDetailRekapSesi);
router.post('/rekap-manual', verifyRole('dosen', 'admin'), simpanRekapManual); // perbaikan dari PUT ke POST sesuai ubahan sebelumnya

module.exports = router;