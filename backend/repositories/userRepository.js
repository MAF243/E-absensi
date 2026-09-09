const db = require('../config/db');

class UserRepository {
  async findAllByRole(role) {
    if (role === 'mahasiswa') {
      const query = `
        SELECT u.id, u.nomor_induk, u.nama_lengkap, u.status_akademik, u.jenis_kelamin, u.jurusan, u.prodi_id, p.nama_prodi, u.angkatan_id, u.kelas_id, a.nama_angkatan, k.nama_kelas
        FROM users u 
        LEFT JOIN angkatan a ON u.angkatan_id = a.id
        LEFT JOIN kelas k ON u.kelas_id = k.id
        LEFT JOIN prodi p ON u.prodi_id = p.id
        WHERE u.role = 'mahasiswa' ORDER BY u.created_at DESC
      `;
      const [results] = await db.query(query);
      return results;
    } else if (role === 'dosen') {
      const query = `SELECT id, nomor_induk, nama_lengkap, jenis_kelamin, status_akademik FROM users WHERE role = 'dosen' ORDER BY id DESC`;
      const [results] = await db.query(query);
      return results;
    }
  }

  async findByIdAndRole(id, role) {
    const query = `SELECT u.id, u.nomor_induk, u.nama_lengkap, u.status_akademik, u.jenis_kelamin, u.jurusan, u.prodi_id, p.nama_prodi, u.angkatan_id, u.kelas_id, u.last_login, a.nama_angkatan, k.nama_kelas FROM users u LEFT JOIN angkatan a ON u.angkatan_id = a.id LEFT JOIN kelas k ON u.kelas_id = k.id LEFT JOIN prodi p ON u.prodi_id = p.id WHERE u.id = ? AND u.role = ?`;
    const [results] = await db.query(query, [id, role]);
    return results[0];
  }

  async create(data) {
    const query = `INSERT INTO users (nomor_induk, nama_lengkap, password, role, status_akademik, jenis_kelamin, jurusan, prodi_id, angkatan_id, kelas_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(query, [data.nomor_induk, data.nama_lengkap, data.password, data.role, data.status_akademik || 'AKTIF', data.jenis_kelamin || null, data.jurusan || null, data.prodi_id || null, data.angkatan_id || null, data.kelas_id || null]);
    return result.insertId;
  }

  async update(id, data) {
    let query, params;
    if (data.password) {
      query = `UPDATE users SET nomor_induk=?, nama_lengkap=?, password=?, status_akademik=?, jenis_kelamin=?, jurusan=?, prodi_id=?, angkatan_id=?, kelas_id=? WHERE id=? AND role=?`;
      params = [data.nomor_induk, data.nama_lengkap, data.password, data.status_akademik, data.jenis_kelamin || null, data.jurusan || null, data.prodi_id || null, data.angkatan_id || null, data.kelas_id || null, id, data.role];
    } else {
      query = `UPDATE users SET nomor_induk=?, nama_lengkap=?, status_akademik=?, jenis_kelamin=?, jurusan=?, prodi_id=?, angkatan_id=?, kelas_id=? WHERE id=? AND role=?`;
      params = [data.nomor_induk, data.nama_lengkap, data.status_akademik, data.jenis_kelamin || null, data.jurusan || null, data.prodi_id || null, data.angkatan_id || null, data.kelas_id || null, id, data.role];
    }
    const [result] = await db.query(query, params);
    return result.affectedRows > 0;
  }

  async updateOwnDosenProfile(id, data) {
    const hasPassword = Boolean(data.password);
    const query = hasPassword
      ? 'UPDATE users SET nomor_induk = ?, nama_lengkap = ?, password = ? WHERE id = ? AND role = \'dosen\''
      : 'UPDATE users SET nomor_induk = ?, nama_lengkap = ? WHERE id = ? AND role = \'dosen\'';
    const params = hasPassword
      ? [data.nomor_induk, data.nama_lengkap, data.password, id]
      : [data.nomor_induk, data.nama_lengkap, id];
    const [result] = await db.query(query, params);
    return result.affectedRows > 0;
  }

  async checkActivity(id, role) {
    if (role === 'mahasiswa') {
      const [results] = await db.query("SELECT COUNT(*) as count FROM absensi WHERE user_id = ?", [id]);
      return results[0].count > 0;
    } else if (role === 'dosen') {
      const [results] = await db.query("SELECT COUNT(*) as count FROM sesi_kuliah WHERE dosen_id = ?", [id]);
      return results[0].count > 0;
    }
    return false;
  }

  async deleteByIdAndRole(id, role) {
    await db.query("DELETE FROM users WHERE id = ? AND role = ?", [id, role]);
  }
  
  async bulkDelete(ids, role) {
    await db.query("DELETE FROM users WHERE id IN (?) AND role = ?", [ids, role]);
  }
  
  async bulkCreate(values) {
    await db.query("INSERT INTO users (nomor_induk, nama_lengkap, password, role, status_akademik, jenis_kelamin, jurusan, prodi_id, angkatan_id, kelas_id) VALUES ?", [values]);
  }
  
  async bulkAssignKelas(ids, kelas_id) {
    await db.query("UPDATE users SET kelas_id = ? WHERE id IN (?) AND role='mahasiswa'", [kelas_id, ids]);
  }
  
  async bulkAssignAngkatan(ids, angkatan_id) {
    await db.query("UPDATE users SET angkatan_id = ? WHERE id IN (?) AND role='mahasiswa'", [angkatan_id, ids]);
  }

  async bulkUpdateStatusAngkatan(ids, status_akademik, angkatan_id) {
    const fields = [];
    const params = [];
    if (status_akademik) {
      fields.push('status_akademik = ?');
      params.push(status_akademik);
    }
    if (angkatan_id !== undefined && angkatan_id !== '') {
      fields.push('angkatan_id = ?');
      params.push(angkatan_id);
    }
    params.push(ids);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id IN (?) AND role='mahasiswa'`, params);
  }
  
  async removeKelas(mahasiswa_id) {
    await db.query("UPDATE users SET kelas_id = NULL WHERE id = ?", [mahasiswa_id]);
  }
  
  async removeAngkatan(mahasiswa_id) {
    await db.query("UPDATE users SET angkatan_id = NULL WHERE id = ?", [mahasiswa_id]);
  }
  
  async bulkEditJurusan(ids, jurusan) {
    await db.query("UPDATE users SET jurusan = ? WHERE id IN (?) AND role='mahasiswa'", [jurusan, ids]);
  }
  
  async getAngkatanName(angkatan_id) {
    const [results] = await db.query("SELECT nama_angkatan FROM angkatan WHERE id = ?", [angkatan_id]);
    return results.length ? results[0].nama_angkatan : '';
  }
  
  async getDosenMatkul(dosen_id) {
    const [results] = await db.query("SELECT id, kode_mk, nama_mk, semester, jurusan FROM mata_kuliah WHERE dosen_id = ?", [dosen_id]);
    return results;
  }
  
  async getDosenRiwayat(dosen_id) {
    const [results] = await db.query(`
      SELECT 
          s.id, s.mk_id, s.waktu_mulai, s.status, s.agenda, m.nama_mk,
          (SELECT COUNT(*) FROM absensi a WHERE a.sesi_id = s.id AND a.status = 'hadir') AS jumlah_hadir
      FROM sesi_kuliah s 
      JOIN mata_kuliah m ON s.mk_id = m.id 
      WHERE m.dosen_id = ? 
      ORDER BY s.waktu_mulai DESC
    `, [dosen_id]);
    return results;
  }
  
  async deleteDosenSesi(dosen_id) {
    await db.query("DELETE FROM sesi_kuliah WHERE dosen_id = ?", [dosen_id]);
  }
}

module.exports = new UserRepository();
