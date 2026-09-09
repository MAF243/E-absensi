const bcrypt = require('bcrypt');
const db = require('../config/db');
const userRepository = require('../repositories/userRepository');

const ACADEMIC_STATUSES = new Set(['AKTIF', 'CUTI', 'LULUS', 'KELUAR', 'RESIGN']);

const normalizeAcademicStatus = (value) => {
  const normalized = String(value || 'AKTIF').trim().toUpperCase();
  // Backward compatibility for forms and records created before the domain
  // glossary replaced the technical "tidak aktif" value.
  const status = normalized === 'TIDAK AKTIF' ? 'KELUAR' : normalized;
  if (!ACADEMIC_STATUSES.has(status)) {
    const error = new Error('Status akademik tidak valid.');
    error.statusCode = 400;
    throw error;
  }
  return status;
};

const normalizeDosenStatus = (value) => {
  return String(value || 'AKTIF').trim().toUpperCase() === 'AKTIF' ? 'AKTIF' : 'KELUAR';
};

const resolveProdiId = async (value) => {
  const prodiId = Number(value);
  if (Number.isInteger(prodiId) && prodiId > 0) {
    const [rows] = await db.query('SELECT id FROM prodi WHERE id = ? AND aktif = 1', [prodiId]);
    if (rows.length) return prodiId;
  }
  const [defaults] = await db.query('SELECT id FROM prodi WHERE aktif = 1 ORDER BY id ASC LIMIT 1');
  if (!defaults.length) {
    const error = new Error('Belum ada prodi aktif yang dapat dipilih.');
    error.statusCode = 400;
    throw error;
  }
  return defaults[0].id;
};

class UserService {
  async getAll(role) {
    return await userRepository.findAllByRole(role);
  }

  async getById(id, role) {
    const user = await userRepository.findByIdAndRole(id, role);
    if (!user) {
      const err = new Error(`${role} tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  async create(data) {
    try {
      if (data.role === 'dosen') data.status_akademik = normalizeDosenStatus(data.status_akademik);
      data.status_akademik = normalizeAcademicStatus(data.status_akademik);
      if (data.role === 'mahasiswa') data.prodi_id = await resolveProdiId(data.prodi_id);
      if (data.role === 'mahasiswa' && data.nomor_induk && data.nomor_induk.length >= 8) {
         const kodeProdi = data.nomor_induk.substring(2, 4);
         const kodeAngkatan = data.nomor_induk.substring(4, 6);
         
         if (!data.jurusan || data.jurusan.trim() === '') {
           if (kodeProdi === '11') data.jurusan = 'TEKNIK INFORMATIKA';
           else if (kodeProdi === '21') data.jurusan = 'SISTEM INFORMASI';
           else if (kodeProdi === '31') data.jurusan = 'MANAJEMEN INFORMATIKA';
           else if (kodeProdi === '41') data.jurusan = 'KOMPUTERISASI AKUNTANSI';
         }

         let prodiShort = 'ANGKATAN';
         if (kodeProdi === '11') prodiShort = 'TI';
         else if (kodeProdi === '21') prodiShort = 'SI';
         else if (kodeProdi === '31') prodiShort = 'MI';
         else if (kodeProdi === '41') prodiShort = 'KA';

         const expectedAngkatanName = `${prodiShort} ${parseInt(kodeAngkatan, 10)}`.toUpperCase();
         
         const [angkatanRows] = await db.query('SELECT id FROM angkatan WHERE UPPER(nama_angkatan) = ?', [expectedAngkatanName]);
         let angkatanId = null;
         if (angkatanRows.length > 0) {
            angkatanId = angkatanRows[0].id;
         } else {
            const [insertRes] = await db.query('INSERT INTO angkatan (nama_angkatan) VALUES (?)', [expectedAngkatanName]);
            angkatanId = insertRes.insertId;
         }
         // Jika sebelumnya tidak ada, timpa saja atau biarkan user yg memilih. Di sini kita selalu sinkronisasi
         data.angkatan_id = angkatanId;
      }

      const hashedPassword = await bcrypt.hash(data.password || data.nomor_induk, 10);
      data.password = hashedPassword;
      return await userRepository.create(data);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const error = new Error(`Gagal! Nomor Induk/NIM/NIDN sudah terdaftar.`);
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }

  async update(id, data) {
    try {
      if (data.role === 'dosen') data.status_akademik = normalizeDosenStatus(data.status_akademik);
      data.status_akademik = normalizeAcademicStatus(data.status_akademik);
      if (data.role === 'mahasiswa') data.prodi_id = await resolveProdiId(data.prodi_id);
      if (data.password && data.password.trim() !== "") {
        data.password = await bcrypt.hash(data.password, 10);
      } else {
        delete data.password;
      }
      const updated = await userRepository.update(id, data);
      if (!updated) {
        const err = new Error("Data tidak ditemukan atau tidak ada perubahan.");
        err.statusCode = 404;
        throw err;
      }
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const error = new Error("Gagal! Nomor Induk sudah dipakai orang lain.");
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }

  async updateOwnDosenProfile(id, data) {
    const payload = {
      nomor_induk: data.nomor_induk,
      nama_lengkap: data.nama_lengkap,
    };
    if (data.password && data.password.trim() !== '') {
      payload.password = await bcrypt.hash(data.password, 10);
    }
    const updated = await userRepository.updateOwnDosenProfile(id, payload);
    if (!updated) {
      const err = new Error('Data dosen tidak ditemukan atau tidak ada perubahan.');
      err.statusCode = 404;
      throw err;
    }
  }

  async delete(id, role) {
    // SAFE DELETE IMPLEMENTATION
    const hasActivity = await userRepository.checkActivity(id, role);
    if (hasActivity) {
      const err = new Error(`Penghapusan ditolak! ${role} ini sudah memiliki riwayat presensi/sesi. Harap gunakan fitur 'Edit Profil' untuk mengubah Status Akademiknya menjadi 'KELUAR' atau 'LULUS'.`);
      err.statusCode = 403;
      throw err;
    }
    await userRepository.deleteByIdAndRole(id, role);
  }

  async bulkDelete(ids, role) {
    for (let id of ids) {
       await this.delete(id, role); // Enforce safe delete for bulk too
    }
  }

  async bulkCreate(data, role) {
    try {
      const values = [];
      for (let row of data) {
        if (role === 'dosen') row.status_akademik = normalizeDosenStatus(row.status_akademik);
        row.status_akademik = normalizeAcademicStatus(row.status_akademik);
        if (role === 'mahasiswa' && row.nomor_induk && row.nomor_induk.length >= 8) {
           const kodeProdi = row.nomor_induk.substring(2, 4);
           const kodeAngkatan = row.nomor_induk.substring(4, 6);
           
           if (!row.jurusan || row.jurusan.trim() === '') {
             if (kodeProdi === '11') row.jurusan = 'TEKNIK INFORMATIKA';
             else if (kodeProdi === '21') row.jurusan = 'SISTEM INFORMASI';
             else if (kodeProdi === '31') row.jurusan = 'MANAJEMEN INFORMATIKA';
             else if (kodeProdi === '41') row.jurusan = 'KOMPUTERISASI AKUNTANSI';
           }

           let prodiShort = 'ANGKATAN';
           if (kodeProdi === '11') prodiShort = 'TI'; // Atau INFORMATIKA
           else if (kodeProdi === '21') prodiShort = 'SI';
           else if (kodeProdi === '31') prodiShort = 'MI';
           else if (kodeProdi === '41') prodiShort = 'KA';

           const expectedAngkatanName = `${prodiShort} ${parseInt(kodeAngkatan, 10)}`.toUpperCase();
           
           const [angkatanRows] = await db.query('SELECT id FROM angkatan WHERE UPPER(nama_angkatan) = ?', [expectedAngkatanName]);
           let angkatanId = null;
           if (angkatanRows.length > 0) {
              angkatanId = angkatanRows[0].id;
           } else {
              const [insertRes] = await db.query('INSERT INTO angkatan (nama_angkatan) VALUES (?)', [expectedAngkatanName]);
              angkatanId = insertRes.insertId;
           }
           row.angkatan_id = angkatanId;
        }

        const plainPassword = row.password || row.nomor_induk;
        const hashedPassword = await bcrypt.hash(plainPassword.toString(), 10);
        if (role === 'mahasiswa') row.prodi_id = await resolveProdiId(row.prodi_id);
        values.push([row.nomor_induk, row.nama_lengkap, hashedPassword, role, row.status_akademik, row.jenis_kelamin || null, row.jurusan || null, row.prodi_id || null, row.angkatan_id || null, row.kelas_id || null]);
      }
      await userRepository.bulkCreate(values);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const error = new Error("Gagal impor! Terdapat data ganda/duplikat.");
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }

  async assignKelas(studentIds, kelas_id) {
    await userRepository.bulkAssignKelas(studentIds, kelas_id);
    return `${studentIds.length} mahasiswa berhasil dipindahkan ke kelas ini!`;
  }

  async assignAngkatan(studentIds, angkatan_id) {
    await userRepository.bulkAssignAngkatan(studentIds, angkatan_id);
    return `${studentIds.length} mahasiswa berhasil dipindahkan ke angkatan ini!`;
  }

  async updateStatusAngkatan(studentIds, status_akademik, angkatan_id) {
    const status = status_akademik ? normalizeAcademicStatus(status_akademik) : null;
    await userRepository.bulkUpdateStatusAngkatan(studentIds, status, angkatan_id);
    return `${studentIds.length} mahasiswa berhasil diperbarui.`;
  }
  async removeKelas(mahasiswa_id) {
    await userRepository.removeKelas(mahasiswa_id);
  }

  async removeAngkatan(mahasiswa_id) {
    await userRepository.removeAngkatan(mahasiswa_id);
  }

  async editJurusan(ids, jurusan_baru) {
    await userRepository.bulkEditJurusan(ids, jurusan_baru.toUpperCase());
    return `Jurusan ${ids.length} mahasiswa berhasil diubah menjadi ${jurusan_baru.toUpperCase()}!`;
  }
  
  async getDosenDetail(dosen_id) {
    const mata_kuliah = await userRepository.getDosenMatkul(dosen_id);
    const riwayat_mengajar = await userRepository.getDosenRiwayat(dosen_id);
    return { mata_kuliah, riwayat_mengajar };
  }
  
  async resetDosenRiwayatSesi(dosen_id) {
    await userRepository.deleteDosenSesi(dosen_id);
  }
}

module.exports = new UserService();
