const db = require('../config/db');
const bcrypt = require('bcrypt'); 

// 1. GET ALL
const getAllDosen = async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT id, nomor_induk, nama_lengkap, jenis_kelamin, status_akademik FROM users WHERE role = 'dosen' ORDER BY id DESC"
    );
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. CREATE
const createDosen = async (req, res) => {
  const { nomor_induk, nama_lengkap, jenis_kelamin, status_akademik, password } = req.body;
  if (!nomor_induk || !nama_lengkap) return res.status(400).json({ success: false, message: "NIDN/Inisial dan Nama wajib diisi!" });
  
  try {
    const plainPassword = password || nomor_induk;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    await db.query(
      "INSERT INTO users (nomor_induk, nama_lengkap, jenis_kelamin, status_akademik, password, role) VALUES (?, ?, ?, ?, ?, 'dosen')", 
      [nomor_induk, nama_lengkap, jenis_kelamin, status_akademik || 'aktif', hashedPassword]
    );
    res.json({ success: true, message: "Data dosen berhasil ditambahkan!" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: "NIDN/Inisial tersebut sudah terdaftar!" });
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. UPDATE
const updateDosen = async (req, res) => {
  const { id } = req.params;
  const { nomor_induk, nama_lengkap, jenis_kelamin, status_akademik, password } = req.body;
  
  if (!nomor_induk || !nama_lengkap) return res.status(400).json({ success: false, message: "NIDN/Inisial dan Nama wajib diisi!" });
  
  try {
    let query = "UPDATE users SET nomor_induk=?, nama_lengkap=?, jenis_kelamin=?, status_akademik=? WHERE id=? AND role='dosen'";
    let params = [nomor_induk, nama_lengkap, jenis_kelamin, status_akademik, id];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query = "UPDATE users SET nomor_induk=?, nama_lengkap=?, jenis_kelamin=?, status_akademik=?, password=? WHERE id=? AND role='dosen'";
      params = [nomor_induk, nama_lengkap, jenis_kelamin, status_akademik, hashedPassword, id];
    }

    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Data dosen tidak ditemukan." });
    
    res.json({ success: true, message: "Data dosen berhasil diperbarui!" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: "NIDN/Inisial tersebut sudah terdaftar!" });
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. DELETE
const deleteDosen = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM users WHERE id=? AND role='dosen'", [id]);
    res.json({ success: true, message: "Data dosen berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. BULK DELETE
const bulkDeleteDosen = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ success: false, message: "Tidak ada data yang dipilih." });

  try {
    await db.query("DELETE FROM users WHERE id IN (?) AND role='dosen'", [ids]);
    res.json({ success: true, message: `${ids.length} data dosen berhasil dihapus!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. BULK CREATE (Untuk CSV)
const bulkCreateDosen = async (req, res) => {
  const { data } = req.body;
  if (!data || !data.length) return res.status(400).json({ success: false, message: "Data kosong." });

  try {
    const values = [];
    for (let row of data) {
      const plainPassword = row.password || row.nomor_induk;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      
      values.push([
        row.nomor_induk, 
        row.nama_lengkap, 
        row.jenis_kelamin, 
        row.status_akademik, 
        hashedPassword, 
        'dosen'
      ]);
    }

    await db.query(
      "INSERT INTO users (nomor_induk, nama_lengkap, jenis_kelamin, status_akademik, password, role) VALUES ?", 
      [values]
    );
    res.json({ success: true, message: "Import CSV berhasil!" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: "Sebagian NIDN/Inisial sudah ada di sistem." });
    res.status(500).json({ success: false, message: err.message });
  }
};

// 7. GET DETAIL PROFIL DOSEN (Mata Kuliah & Riwayat Agenda)
const getDosenDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const [matkul] = await db.query(
      "SELECT id, kode_mk, nama_mk, semester, jurusan FROM mata_kuliah WHERE dosen_id = ?", 
      [id]
    );

    const [riwayat] = await db.query(`
      SELECT 
          s.id, s.mk_id, s.waktu_mulai, s.status, s.agenda, m.nama_mk,
          (SELECT COUNT(*) FROM kehadiran k WHERE k.sesi_id = s.id AND k.status = 'hadir') AS jumlah_hadir
      FROM sesi_kuliah s 
      JOIN mata_kuliah m ON s.mk_id = m.id 
      WHERE m.dosen_id = ? 
      ORDER BY s.waktu_mulai DESC
    `, [id]);

    res.json({ success: true, data: { mata_kuliah: matkul, riwayat_mengajar: riwayat } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8. FITUR BARU: RESET RIWAYAT SESI DOSEN (Sesuai ide Anda!)
const resetRiwayatSesi = async (req, res) => {
  const { id } = req.params; // Ini adalah ID Dosen
  try {
    // Menghapus seluruh sesi kelas yang dibuat dosen ini
    // (Otomatis data absen mahasiswa di sesi tersebut ikut terhapus karena 'ON DELETE CASCADE' di database)
    await db.query("DELETE FROM sesi_kuliah WHERE dosen_id = ?", [id]);
    res.json({ success: true, message: "Seluruh riwayat sesi dan agenda dosen ini berhasil dibersihkan!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllDosen, createDosen, updateDosen, deleteDosen, bulkDeleteDosen, bulkCreateDosen, getDosenDetail, resetRiwayatSesi };