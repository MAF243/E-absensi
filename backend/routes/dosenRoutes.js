const express = require('express');
const router = express.Router();
const { 
  getAllDosen, 
  createDosen, 
  updateDosen, 
  deleteDosen,
  bulkDeleteDosen,
  bulkCreateDosen,
  getDosenDetail,
  resetRiwayatSesi // <-- Import fungsi baru
} = require('../controllers/dosenController');

// Mendaftarkan rute API untuk Dosen
router.get('/', getAllDosen);            
router.get('/:id/detail', getDosenDetail);      
router.post('/', createDosen);           
router.post('/bulk', bulkCreateDosen);          
router.delete('/bulk-delete', bulkDeleteDosen); 
router.put('/:id', updateDosen);         
router.delete('/:id', deleteDosen);      
router.delete('/:id/reset-sesi', resetRiwayatSesi); // <-- Rute eksekusi tombol reset

module.exports = router;