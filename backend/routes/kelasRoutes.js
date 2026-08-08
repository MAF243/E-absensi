const express = require('express');
const router = express.Router();
const kelasController = require('../controllers/kelasController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.use(verifyToken, verifyRole('admin'));

router.get('/', kelasController.getAll);
router.post('/', kelasController.create);
router.put('/:id', kelasController.update);
router.delete('/:id', kelasController.delete);

module.exports = router;
