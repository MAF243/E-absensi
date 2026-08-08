const AppError = require('../utils/AppError');
const authService = require('../services/authService');

const login = async (req, res, next) => {
  const { identitas, password } = req.body;

  if (!identitas || !password) {
    throw new AppError("Identitas dan Password wajib diisi!", 400);
  }

  const { token, ...userData } = await authService.login(identitas, password);
    res.json({
      success: true,
      message: "Login Berhasil!",
      data: userData,
      token: token
    });
  
};

module.exports = { login };