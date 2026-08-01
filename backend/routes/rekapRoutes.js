const express = require('express');
const router = express.Router();
const { getRekapMahasiswa, getRekapDosen } = require('../controllers/rekapController');

router.get('/mahasiswa', getRekapMahasiswa);
router.get('/dosen', getRekapDosen);

module.exports = router;