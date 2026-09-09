const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const activityRepository = require('../repositories/activityRepository');
const validate = require('../middlewares/validateMiddleware');
const { loginSchema } = require('../validations/authValidation');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API otentikasi
 * 
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna (Mahasiswa, Dosen, Admin)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identitas
 *               - password
 *             properties:
 *               identitas:
 *                 type: string
 *                 description: Nomor Induk / NIDN
 *               password:
 *                 type: string
 *                 description: Password akun
 *     responses:
 *       200:
 *         description: Berhasil login, mengembalikan JWT token
 *       400:
 *         description: Input tidak valid
 *       401:
 *         description: Identitas atau password salah
 */
router.post('/login', validate(loginSchema), login);
router.put('/profile', verifyToken, updateProfile);
router.get('/activity', verifyToken, require('../middlewares/authMiddleware').verifyRole('admin'), async (req, res, next) => {
	try {
		const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
		const pageSize = Math.min(50, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 50));
		const result = await activityRepository.findRecent(page, pageSize);
		res.json({ success: true, data: result.rows, pagination: { page, pageSize, total: result.total, totalPages: Math.ceil(result.total / pageSize) } });
	} catch (error) {
		next(error);
	}
});

module.exports = router;