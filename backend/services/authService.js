const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');
const activityRepository = require('../repositories/activityRepository');

class AuthService {
  async updateProfile(userId, data) {
    if (!data.nama_lengkap || !data.nomor_induk) {
      const error = new Error('Nama dan identitas wajib diisi.');
      error.statusCode = 400;
      throw error;
    }
    const payload = { nama_lengkap: data.nama_lengkap.trim(), nomor_induk: data.nomor_induk.trim() };
    if (data.password && data.password.trim()) payload.password = await bcrypt.hash(data.password.trim(), 10);
    try {
      return await authRepository.updateProfile(userId, payload);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const duplicate = new Error('Identitas login sudah digunakan.');
        duplicate.statusCode = 400;
        throw duplicate;
      }
      throw error;
    }
  }

  async login(identitas, password, req) {
    const user = await authRepository.findUserByIdentitas(identitas);
    if (!user) {
      const error = new Error("Identitas tidak ditemukan!");
      error.statusCode = 401;
      throw error;
    }

    const status = String(user.status_akademik).toLowerCase();
    if (status !== 'aktif') {
      const roleDisplay = user.role === 'dosen' ? 'Dosen' : 'Mahasiswa';
      const statusDisplay = user.role === 'dosen' ? 'Tidak Aktif Mengajar' : status.toUpperCase();
      const error = new Error(`Akses Ditolak: Akun ${roleDisplay} Anda berstatus ${statusDisplay}. Silakan hubungi Administrator.`);
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

    await activityRepository.create({
      userId: user.id,
      role: user.role,
      action: 'POST /api/auth/login',
      summary: 'Login berhasil',
      req
    });

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
