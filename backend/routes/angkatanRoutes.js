const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { 
  getAllAngkatan, 
  createAngkatan, 
  updateAngkatan, 
  deleteAngkatan 
} = require('../controllers/angkatanController');

// Mendaftarkan rute API untuk Angkatan
router.use(verifyToken, verifyRole('admin'));

router.get('/', getAllAngkatan);            
router.post('/', createAngkatan);           
router.put('/:id', updateAngkatan);         
router.delete('/:id', deleteAngkatan);      

module.exports = router;