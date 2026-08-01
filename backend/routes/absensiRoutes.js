const express = require('express');
const router = express.Router();
const { scanQR, getRiwayatDosen, getDetailRekapSesi, simpanRekapManual } = require('../controllers/absensiController');

router.post('/scan', scanQR);

// Route Baru untuk Riwayat & Rekap Dosen
router.get('/riwayat-dosen/:dosen_id', getRiwayatDosen);
router.get('/sesi/:sesi_id', getDetailRekapSesi);
router.put('/rekap-manual', simpanRekapManual);

module.exports = router;