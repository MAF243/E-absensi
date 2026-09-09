const db = require('../config/db');

class RekapRepository {
  async getMahasiswaFiltered(angkatan_id, jurusan) {
    let whereUser = "u.role = 'mahasiswa'";
    let paramsUser = [];

    if (angkatan_id) {
      whereUser += " AND (u.angkatan_id = ? OR EXISTS (SELECT 1 FROM grup_mahasiswa gm WHERE gm.mahasiswa_id = u.id AND gm.angkatan_id = ?))";
      paramsUser.push(angkatan_id, angkatan_id);
    }
    if (jurusan) {
      whereUser += " AND u.jurusan = ?";
      paramsUser.push(jurusan);
    }

    const [mahasiswa] = await db.query(`
      SELECT u.id, u.nomor_induk, u.nama_lengkap, u.jenis_kelamin, u.jurusan, a.nama_angkatan
      FROM users u LEFT JOIN angkatan a ON u.angkatan_id = a.id
      WHERE ${whereUser} ORDER BY u.nama_lengkap ASC
    `, paramsUser);

    return mahasiswa;
  }

  async getMatkulByMahasiswa(mhsIds) {
    if (!mhsIds || mhsIds.length === 0) return [];
    const query = `
      SELECT u.id as user_id, mk.id as mk_id, mk.nama_mk 
      FROM users u
      JOIN mata_kuliah mk ON mk.jenis_kelas = 'paket'
        AND ((mk.kelas_id IS NOT NULL AND mk.kelas_id = u.kelas_id) OR (mk.kelas_id IS NULL AND mk.angkatan_id = u.angkatan_id) OR (mk.kelas_id IS NULL AND mk.jurusan = u.jurusan))
      WHERE u.id IN (?)
      UNION
      SELECT pk.mahasiswa_id as user_id, mk.id as mk_id, mk.nama_mk
      FROM peserta_kelas pk
      JOIN mata_kuliah mk ON pk.mk_id = mk.id
      WHERE pk.mahasiswa_id IN (?)
    `;
    const [results] = await db.query(query, [mhsIds, mhsIds]);
    return results;
  }


  async getTargetPertemuan(start_date, end_date) {
    let dateFilter = "";
    let params = [];
    if (start_date && end_date) {
        dateFilter = " AND DATE(waktu_mulai) BETWEEN ? AND ? ";
        params.push(start_date, end_date);
    }
    // Using sum of bobot for active non-cancelled sessions 
    // In getRekapMahasiswa originally: `SELECT mk_id, COUNT(id) as total_sesi_berjalan...`
    // Wait, the earlier implementation didn't use bobot. I'll stick to COUNT(id) for now unless specified.
    // Note: To be aligned with Sesi cancellation rules, CANCELLED sessions should not be counted.
    const [sesiAktif] = await db.query(`
      SELECT mk_id, COALESCE(SUM(bobot), 0) as total_sesi_berjalan
      FROM sesi_kuliah
      WHERE status = 'selesai' ${dateFilter}
      GROUP BY mk_id
    `, params);
    
    return sesiAktif;
  }

  async getAbsensiMahasiswa(mhsIds, start_date, end_date) {
    let dateFilter = "";
    let params = [];
    if (start_date && end_date) {
        dateFilter = " AND DATE(sk.waktu_mulai) BETWEEN ? AND ? ";
        params.push(start_date, end_date);
    }

    const [absensi] = await db.query(`
      SELECT ab.user_id, ab.mk_id, ab.status, mk.nama_mk
      FROM absensi ab
      JOIN sesi_kuliah sk ON ab.sesi_id = sk.id
      JOIN mata_kuliah mk ON ab.mk_id = mk.id
      WHERE ab.user_id IN (?) AND sk.status = 'selesai' ${dateFilter}
    `, [mhsIds, ...params]);

    return absensi;
  }

  async getRekapDosen(start_date, end_date) {
    let dateFilter = "";
    let params = [];
    if (start_date && end_date) {
        dateFilter = " AND DATE(sk.waktu_mulai) BETWEEN ? AND ? ";
        params.push(start_date, end_date);
    }

    const query = `
      SELECT 
        u.nama_lengkap as nama_dosen,
        mk.nama_mk, mk.kode_mk,
        sk.jenis_sesi, sk.agenda, 
        DATE_FORMAT(sk.waktu_mulai, '%d-%m-%Y') as tanggal,
        DATE_FORMAT(sk.waktu_mulai, '%H:%i') as jam_mulai,
        DATE_FORMAT(sk.waktu_selesai, '%H:%i') as jam_selesai,
        (SELECT COUNT(*) FROM absensi ab WHERE ab.sesi_id = sk.id AND ab.status = 'hadir') as total_hadir_mhs
      FROM sesi_kuliah sk
      JOIN mata_kuliah mk ON sk.mk_id = mk.id
      JOIN users u ON sk.dosen_id = u.id
      WHERE sk.status = 'selesai' ${dateFilter}
      ORDER BY sk.waktu_mulai DESC
    `;
    
    const [results] = await db.query(query, params);
    return results;
  }
}
module.exports = new RekapRepository();
