const express = require('express');
const router = express.Router();
const { getJadwal, updateJadwal, resetJadwal, bukaSesi, tutupSesi, getJadwalByMahasiswa } = require('../controllers/jadwalController');

router.get('/', getJadwal);
// RUTE BARU UNTUK MAHASISWA
router.get('/mahasiswa/:mahasiswa_id', getJadwalByMahasiswa);

router.put('/:id', updateJadwal);
router.put('/reset/:id', resetJadwal);
router.post('/buka-sesi', bukaSesi);
router.put('/tutup-sesi/:sesi_id', tutupSesi);

module.exports = router;