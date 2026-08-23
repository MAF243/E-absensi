const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
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
router.use(verifyToken); // Semua harus login

router.get('/', verifyRole('admin'), getAllDosen);            
router.get('/:id/detail', verifyRole('admin'), getDosenDetail);      
router.post('/', verifyRole('admin'), createDosen);           
router.post('/bulk', verifyRole('admin'), bulkCreateDosen);          
router.delete('/bulk-delete', verifyRole('admin'), bulkDeleteDosen); 
router.put('/:id', verifyRole('admin', 'dosen'), updateDosen);         
router.delete('/:id', verifyRole('admin'), deleteDosen);      
router.delete('/:id/reset-sesi', verifyRole('admin'), resetRiwayatSesi); 

module.exports = router;