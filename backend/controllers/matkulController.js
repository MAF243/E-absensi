const db = require('../config/db');

const getAllMatkul = async (req, res) => {
  try {
    const query = `
      SELECT m.*, u.nama_lengkap as nama_dosen, a.nama_angkatan,
      (SELECT GROUP_CONCAT(DISTINCT usr.jurusan SEPARATOR ', ') FROM peserta_kelas pk JOIN users usr ON pk.mahasiswa_id = usr.id WHERE pk.mk_id = m.id) as kelompok_jurusan
      FROM mata_kuliah m
      LEFT JOIN users u ON m.dosen_id = u.id
      LEFT JOIN angkatan a ON m.angkatan_id = a.id
      ORDER BY m.created_at DESC
    `;
    const [results] = await db.query(query);
    res.json({ success: true, data: results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createMatkul = async (req, res) => {
  const { kode_mk, nama_mk, sks, jurusan, semester } = req.body;
  try {
    await db.query("INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, jurusan, semester) VALUES (?, ?, ?, ?, ?)", [kode_mk, nama_mk, sks || 2, jurusan, semester]);
    res.json({ success: true, message: "Mata kuliah ditambahkan!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateMatkul = async (req, res) => {
  const { id } = req.params;
  const { kode_mk, nama_mk, sks, jurusan, semester } = req.body;
  try {
    await db.query("UPDATE mata_kuliah SET kode_mk=?, nama_mk=?, sks=?, jurusan=?, semester=? WHERE id=?", [kode_mk, nama_mk, sks, jurusan, semester, id]);
    res.json({ success: true, message: "Mata kuliah diperbarui!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteMatkul = async (req, res) => {
  try {
    await db.query("DELETE FROM mata_kuliah WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Mata kuliah dihapus!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const bulkDeleteMatkul = async (req, res) => {
  try {
    await db.query("DELETE FROM mata_kuliah WHERE id IN (?)", [req.body.ids]);
    res.json({ success: true, message: "Mata kuliah dihapus massal!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const resetPenugasan = async (req, res) => {
  try {
    await db.query("UPDATE mata_kuliah SET dosen_id=NULL, angkatan_id=NULL WHERE id IN (?)", [req.body.ids]);
    res.json({ success: true, message: "Penugasan direset!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const assignMatkul = async (req, res) => {
  const { id } = req.params;
  const { dosen_id, angkatan_id, jenis_kelas, peserta } = req.body;
  try {
    await db.query("UPDATE mata_kuliah SET dosen_id=?, angkatan_id=?, jenis_kelas=? WHERE id=?", 
      [dosen_id || null, jenis_kelas === 'paket' ? (angkatan_id || null) : null, jenis_kelas, id]);
    
    await db.query("DELETE FROM peserta_kelas WHERE mk_id=?", [id]);
    if (jenis_kelas === 'kelompok' && peserta && peserta.length > 0) {
      const values = peserta.map(mhsId => [id, mhsId]);
      await db.query("INSERT INTO peserta_kelas (mk_id, mahasiswa_id) VALUES ?", [values]);
    }
    res.json({ success: true, message: "Penugasan berhasil disimpan!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ==========================================================
// FIX SINKRONISASI: MENAMPILKAN PESERTA (PAKET & KELOMPOK)
// ==========================================================
const getPesertaDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const [mk] = await db.query("SELECT jenis_kelas, angkatan_id FROM mata_kuliah WHERE id = ?", [id]);
    if (mk.length === 0) return res.status(404).json({ success: false, message: "Mata kuliah tidak ditemukan" });
    
    let query = ""; 
    let params = [];

    if (mk[0].jenis_kelas === 'paket') {
      const angkatanId = mk[0].angkatan_id || 0;
      // LOGIKA BARU: Ambil dari angkatan_id UTAMA atau dari grup_mahasiswa
      query = `
        SELECT id, nomor_induk, nama_lengkap, jurusan, jenis_kelamin
        FROM users 
        WHERE role = 'mahasiswa' 
        AND (angkatan_id = ? OR id IN (SELECT mahasiswa_id FROM grup_mahasiswa WHERE angkatan_id = ?))
        ORDER BY nama_lengkap ASC
      `;
      params = [angkatanId, angkatanId];
    } else {
      // Kelas Lintas Jurusan (KRS)
      query = `
        SELECT u.id, u.nomor_induk, u.nama_lengkap, u.jurusan, u.jenis_kelamin
        FROM peserta_kelas pk JOIN users u ON pk.mahasiswa_id = u.id
        WHERE pk.mk_id = ? ORDER BY u.nama_lengkap ASC
      `;
      params = [id];
    }
    
    const [mahasiswa] = await db.query(query, params);
    res.json({ success: true, data: mahasiswa, isPaket: mk[0].jenis_kelas === 'paket' });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};

const getPesertaIds = async (req, res) => {
  try {
    const [peserta] = await db.query("SELECT mahasiswa_id FROM peserta_kelas WHERE mk_id = ?", [req.params.id]);
    res.json({ success: true, data: peserta.map(p => p.mahasiswa_id) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deletePeserta = async (req, res) => {
  const { id, mhs_id } = req.params;
  try {
    // Menghapus mahasiswa secara manual dari kelas Lintas (KRS)
    await db.query("DELETE FROM peserta_kelas WHERE mk_id = ? AND mahasiswa_id = ?", [id, mhs_id]);
    res.json({ success: true, message: "Peserta dihapus dari kelas ini." });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const bulkCreateMatkul = async (req, res) => {
  const { data } = req.body;
  if (!data || !data.length) return res.status(400).json({ success: false, message: "Data kosong" });
  try {
    const values = data.map(d => [d.kode_mk, d.nama_mk, d.sks || 2, d.jurusan || '', d.semester || 'Ganjil']);
    await db.query("INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, jurusan, semester) VALUES ?", [values]);
    res.json({ success: true, message: "Data CSV berhasil diimpor!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { 
  getAllMatkul, createMatkul, updateMatkul, deleteMatkul, bulkDeleteMatkul, 
  resetPenugasan, assignMatkul, getPesertaDetail, getPesertaIds, deletePeserta, bulkCreateMatkul 
};