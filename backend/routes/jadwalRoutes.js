const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { getJadwal, updateJadwal, resetJadwal, bukaSesi, tutupSesi, batalkanSesi, getJadwalByMahasiswa } = require('../controllers/jadwalController');

router.use(verifyToken);

router.get('/', verifyRole('admin', 'dosen'), getJadwal);
// RUTE BARU UNTUK MAHASISWA
router.get('/mahasiswa/:mahasiswa_id', verifyRole('mahasiswa'), getJadwalByMahasiswa);

router.put('/:id', verifyRole('admin'), updateJadwal);
router.put('/reset/:id', verifyRole('admin'), resetJadwal);
router.post('/:id/sesi', verifyRole('dosen', 'admin'), bukaSesi);
router.patch('/sesi/:sesi_id/status', verifyRole('dosen', 'admin'), tutupSesi);
router.delete('/sesi/:sesi_id', verifyRole('admin'), batalkanSesi);

module.exports = router;