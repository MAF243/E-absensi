const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { getAllPeriode, createPeriode, updatePeriode, deletePeriode } = require('../controllers/periodeController');

router.use(verifyToken, verifyRole('admin'));

router.get('/', getAllPeriode);
router.post('/', createPeriode);
router.put('/:id', updatePeriode);
router.delete('/:id', deletePeriode);

module.exports = router;
