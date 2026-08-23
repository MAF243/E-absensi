const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');

class AuthService {
  async login(identitas, password) {
    const user = await authRepository.findUserByIdentitas(identitas);
    if (!user) {
      const error = new Error("Identitas tidak ditemukan!");
      error.statusCode = 401;
      throw error;
    }

    const status = String(user.status_akademik).toLowerCase();
    if (status !== 'aktif') {
      const roleDisplay = user.role === 'dosen' ? 'Dosen' : 'Mahasiswa';
      const error = new Error(`Akses Ditolak: Akun ${roleDisplay} Anda berstatus ${status.toUpperCase()}. Silakan hubungi Administrator.`);
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Identitas atau Password salah!");
      error.statusCode = 401;
      throw error;
    }

    await authRepository.updateLastLogin(user.id);

    const payload = {
      id: user.id,
      role: user.role,
      nomor_induk: user.nomor_induk
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

    return {
      id: user.id,
      nomor_induk: user.nomor_induk,
      nama: user.nama_lengkap, 
      role: user.role,
      inisial: user.inisial || '-',
      token
    };
  }
}

module.exports = new AuthService();
