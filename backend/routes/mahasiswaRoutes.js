const express = require('express');
const router = express.Router();
const { 
  getAllMahasiswa, getMahasiswaById, createMahasiswa, updateMahasiswa, deleteMahasiswa, 
  bulkCreateMahasiswa, bulkAssignAngkatan, bulkDeleteMahasiswa, bulkEditJurusan, removeGroup
} = require('../controllers/mahasiswaController');

router.get('/', getAllMahasiswa);               
router.post('/', createMahasiswa);              
router.post('/bulk', bulkCreateMahasiswa);      
router.put('/bulk-assign', bulkAssignAngkatan); 

router.post('/remove-group', removeGroup); // Rute Hapus Grup

router.delete('/bulk-delete', bulkDeleteMahasiswa); 
router.put('/bulk-edit-jurusan', bulkEditJurusan);  

router.get('/:id', getMahasiswaById);           
router.put('/:id', updateMahasiswa);            
router.delete('/:id', deleteMahasiswa);         

module.exports = router;