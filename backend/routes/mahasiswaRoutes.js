const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { 
  getAllMahasiswa, getMahasiswaById, createMahasiswa, updateMahasiswa, deleteMahasiswa, 
  bulkCreateMahasiswa, bulkAssignAngkatan, bulkAssignKelas, bulkUpdateStatusAngkatan, bulkDeleteMahasiswa, bulkEditJurusan, removeAngkatan, removeKelas
} = require('../controllers/mahasiswaController');

router.use(verifyToken, verifyRole('admin'));

router.get('/', getAllMahasiswa);               
router.post('/', createMahasiswa);              
router.post('/bulk', bulkCreateMahasiswa);      
router.put('/bulk-assign-angkatan', bulkAssignAngkatan); 
router.put('/bulk-assign-kelas', bulkAssignKelas);
router.put('/bulk-update-status-angkatan', bulkUpdateStatusAngkatan);

router.post('/remove-angkatan', removeAngkatan);
router.post('/remove-kelas', removeKelas);

router.delete('/bulk-delete', bulkDeleteMahasiswa); 
router.put('/bulk-edit-jurusan', bulkEditJurusan);  

router.get('/:id', getMahasiswaById);           
router.put('/:id', updateMahasiswa);            
router.delete('/:id', deleteMahasiswa);         

module.exports = router;