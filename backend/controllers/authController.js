const AppError = require('../utils/AppError');
const authService = require('../services/authService');

const updateProfile = async (req, res, next) => {
  const data = await authService.updateProfile(req.user.id, req.body);
  res.json({ success: true, message: 'Profil berhasil diperbarui.', data });
};

const login = async (req, res, next) => {
  const { identitas, password } = req.body;

  if (!identitas || !password) {
    throw new AppError("Identitas dan Password wajib diisi!", 400);
  }

  const { token, ...userData } = await authService.login(identitas, password, req);
    res.json({
      success: true,
      message: "Login Berhasil!",
      data: userData,
      token: token
    });
  
};

module.exports = { login, updateProfile };