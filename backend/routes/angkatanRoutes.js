const express = require('express');
const router = express.Router();
const { 
  getAllAngkatan, 
  createAngkatan, 
  updateAngkatan, 
  deleteAngkatan 
} = require('../controllers/angkatanController');

// Mendaftarkan rute API untuk Angkatan
router.get('/', getAllAngkatan);            
router.post('/', createAngkatan);           
router.put('/:id', updateAngkatan);         
router.delete('/:id', deleteAngkatan);      

module.exports = router;