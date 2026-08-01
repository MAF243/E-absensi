const express = require('express');
const router = express.Router();
const { 
  getAllMatkul, createMatkul, updateMatkul, deleteMatkul, bulkDeleteMatkul, 
  resetPenugasan, assignMatkul, getPesertaDetail, getPesertaIds, deletePeserta, bulkCreateMatkul 
} = require('../controllers/matkulController');

router.get('/', getAllMatkul);
router.post('/', createMatkul);
router.post('/bulk', bulkCreateMatkul);
router.delete('/bulk-delete', bulkDeleteMatkul);
router.put('/reset-penugasan', resetPenugasan);

// Rute untuk mengelola Peserta / Mahasiswa dalam Kelas
router.get('/:id/peserta-detail', getPesertaDetail);
router.get('/:id/peserta', getPesertaIds);
router.put('/:id/assign', assignMatkul);
router.delete('/:id/peserta/:mhs_id', deletePeserta);

router.put('/:id', updateMatkul);
router.delete('/:id', deleteMatkul);

module.exports = router;