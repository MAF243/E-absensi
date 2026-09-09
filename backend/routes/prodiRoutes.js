const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { getAllProdi, createProdi, updateProdi, deleteProdi } = require('../controllers/prodiController');

router.use(verifyToken, verifyRole('admin'));
router.get('/', getAllProdi);
router.post('/', createProdi);
router.put('/:id', updateProdi);
router.delete('/:id', deleteProdi);

module.exports = router;