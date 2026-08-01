const db = require('../config/db');
const bcrypt = require('bcrypt');

const getAllMahasiswa = async (req, res) => {
  try {
    // FUNGSI BARU: Mengambil Angkatan Utama + Semua ID Kelompok Tambahan
    const query = `
      SELECT u.id, u.nomor_induk, u.nama_lengkap, u.status_akademik, u.jenis_kelamin, u.jurusan, u.angkatan_id, a.nama_angkatan,
             (SELECT GROUP_CONCAT(angkatan_id) FROM grup_mahasiswa WHERE mahasiswa_id = u.id) as list_kelompok_id
      FROM users u LEFT JOIN angkatan a ON u.angkatan_id = a.id
      WHERE u.role = 'mahasiswa' ORDER BY u.created_at DESC
    `;
    const [results] = await db.query(query);
    res.json({ success: true, data: results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getMahasiswaById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT u.id, u.nomor_induk, u.nama_lengkap, u.status_akademik, u.jenis_kelamin, u.jurusan, u.angkatan_id, u.last_login, a.nama_angkatan FROM users u LEFT JOIN angkatan a ON u.angkatan_id = a.id WHERE u.id = ? AND u.role = 'mahasiswa'`;
    const [results] = await db.query(query, [id]);
    if (results.length === 0) return res.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan." });
    res.json({ success: true, data: results[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createMahasiswa = async (req, res) => {
  const { nomor_induk, nama_lengkap, password, status_akademik, jenis_kelamin, jurusan, angkatan_id } = req.body;
  if (!nomor_induk || !nama_lengkap || !password) return res.status(400).json({ success: false, message: "NIM, Nama, dan Password wajib diisi!" });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (nomor_induk, nama_lengkap, password, role, status_akademik, jenis_kelamin, jurusan, angkatan_id) VALUES (?, ?, ?, 'mahasiswa', ?, ?, ?, ?)", [nomor_induk, nama_lengkap, hashedPassword, status_akademik || 'aktif', jenis_kelamin, jurusan, angkatan_id || null]);
    res.json({ success: true, message: "Data mahasiswa berhasil ditambahkan!" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: "Gagal! NIM tersebut sudah terdaftar." });
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateMahasiswa = async (req, res) => {
  const { id } = req.params;
  const { nomor_induk, nama_lengkap, password, status_akademik, jenis_kelamin, jurusan, angkatan_id } = req.body;
  if (!nomor_induk || !nama_lengkap) return res.status(400).json({ success: false, message: "NIM dan Nama tidak boleh kosong!" });
  try {
    let query, params;
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users SET nomor_induk=?, nama_lengkap=?, password=?, status_akademik=?, jenis_kelamin=?, jurusan=?, angkatan_id=? WHERE id=? AND role='mahasiswa'`;
      params = [nomor_induk, nama_lengkap, hashedPassword, status_akademik, jenis_kelamin, jurusan, angkatan_id || null, id];
    } else {
      query = `UPDATE users SET nomor_induk=?, nama_lengkap=?, status_akademik=?, jenis_kelamin=?, jurusan=?, angkatan_id=? WHERE id=? AND role='mahasiswa'`;
      params = [nomor_induk, nama_lengkap, status_akademik, jenis_kelamin, jurusan, angkatan_id || null, id];
    }
    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan atau tidak ada perubahan." });
    res.json({ success: true, message: "Data mahasiswa berhasil diperbarui!" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: "Gagal! NIM sudah dipakai mahasiswa lain." });
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMahasiswa = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id = ? AND role = 'mahasiswa'", [id]);
    res.json({ success: true, message: "Data mahasiswa berhasil dihapus!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const bulkCreateMahasiswa = async (req, res) => {
  const { data } = req.body; 
  if (!data || !Array.isArray(data) || data.length === 0) return res.status(400).json({ success: false, message: "Data CSV kosong atau tidak valid." });
  try {
    const values = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const plainPassword = row.password || row.nomor_induk; 
      const hashedPassword = await bcrypt.hash(plainPassword.toString(), 10);
      values.push([row.nomor_induk, row.nama_lengkap, hashedPassword, 'mahasiswa', row.status_akademik || 'aktif', row.jenis_kelamin || null, row.jurusan || null, row.angkatan_id || null]);
    }
    await db.query("INSERT INTO users (nomor_induk, nama_lengkap, password, role, status_akademik, jenis_kelamin, jurusan, angkatan_id) VALUES ?", [values]);
    res.json({ success: true, message: `${values.length} mahasiswa berhasil diimpor!` });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: "Gagal impor! Terdapat NIM ganda." });
    res.status(500).json({ success: false, message: err.message });
  }
};

// LOGIKA CERDAS ASSIGN MULTI-GRUP
const bulkAssignAngkatan = async (req, res) => {
  const { studentIds, angkatan_id } = req.body;
  if (!studentIds || !studentIds.length) return res.status(400).json({ success: false, message: "Tidak ada mahasiswa yang dipilih." });
  
  try {
    const [angkatan] = await db.query("SELECT nama_angkatan FROM angkatan WHERE id = ?", [angkatan_id]);
    const nama = angkatan[0].nama_angkatan.toUpperCase();
    const isKelompok = !(nama.includes('INFORMATIKA') || nama.includes('INROMATIKA'));

    if (isKelompok) {
      // Masukkan ke Kelompok Tambahan (Tabel grup_mahasiswa)
      const values = studentIds.map(id => [id, angkatan_id]);
      await db.query("INSERT IGNORE INTO grup_mahasiswa (mahasiswa_id, angkatan_id) VALUES ?", [values]);
      res.json({ success: true, message: `${studentIds.length} mahasiswa ditambahkan ke Kelompok!` });
    } else {
      // Masukkan ke Angkatan Utama (Tabel users)
      await db.query("UPDATE users SET angkatan_id = ? WHERE id IN (?) AND role='mahasiswa'", [angkatan_id, studentIds]);
      res.json({ success: true, message: `${studentIds.length} mahasiswa dipindahkan ke Angkatan!` });
    }
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// FUNGSI BARU: HAPUS GRUP SPESIFIK MAHASISWA
const removeGroup = async (req, res) => {
  const { mahasiswa_id, angkatan_id } = req.body;
  try {
    const [angkatan] = await db.query("SELECT nama_angkatan FROM angkatan WHERE id = ?", [angkatan_id]);
    const nama = angkatan[0].nama_angkatan.toUpperCase();
    const isKelompok = !(nama.includes('INFORMATIKA') || nama.includes('INROMATIKA'));

    if (isKelompok) {
      await db.query("DELETE FROM grup_mahasiswa WHERE mahasiswa_id = ? AND angkatan_id = ?", [mahasiswa_id, angkatan_id]);
    } else {
      await db.query("UPDATE users SET angkatan_id = NULL WHERE id = ?", [mahasiswa_id]);
    }
    res.json({ success: true, message: "Mahasiswa berhasil dikeluarkan dari daftar." });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

const bulkDeleteMahasiswa = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: "Pilih data yang ingin dihapus." });
  try {
    await db.query("DELETE FROM users WHERE id IN (?) AND role = 'mahasiswa'", [ids]);
    res.json({ success: true, message: `${ids.length} data mahasiswa berhasil dihapus permanen!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const bulkEditJurusan = async (req, res) => {
  const { ids, jurusan_baru } = req.body;
  if (!ids || !ids.length || !jurusan_baru) return res.status(400).json({ success: false, message: "Pilih mahasiswa dan ketik jurusan baru." });
  try {
    await db.query("UPDATE users SET jurusan = ? WHERE id IN (?) AND role='mahasiswa'", [jurusan_baru.toUpperCase(), ids]);
    res.json({ success: true, message: `Jurusan ${ids.length} mahasiswa berhasil diubah menjadi ${jurusan_baru.toUpperCase()}!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = {
  getAllMahasiswa, getMahasiswaById, createMahasiswa, updateMahasiswa, deleteMahasiswa,
  bulkCreateMahasiswa, bulkAssignAngkatan, bulkDeleteMahasiswa, bulkEditJurusan, removeGroup
};