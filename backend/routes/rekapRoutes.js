const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { getRekapMahasiswa, getRekapDosen } = require('../controllers/rekapController');

router.use(verifyToken);

router.get('/mahasiswa', verifyRole('admin', 'dosen'), getRekapMahasiswa);
router.get('/dosen', verifyRole('admin'), getRekapDosen);

module.exports = router;