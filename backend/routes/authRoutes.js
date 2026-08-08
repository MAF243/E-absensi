const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
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

module.exports = router;