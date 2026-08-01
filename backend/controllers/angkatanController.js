const db = require('../config/db');

// 1. GET ALL: Mengambil semua data angkatan
const getAllAngkatan = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM angkatan ORDER BY id DESC");
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. CREATE: Menambah angkatan baru
const createAngkatan = async (req, res) => {
  const { nama_angkatan } = req.body;
  if (!nama_angkatan) return res.status(400).json({ success: false, message: "Nama kategori wajib diisi!" });
  
  try {
    await db.query("INSERT INTO angkatan (nama_angkatan) VALUES (?)", [nama_angkatan]);
    res.json({ success: true, message: "Data berhasil ditambahkan!" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: "Nama kategori tersebut sudah ada!" });
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. UPDATE: Mengedit nama angkatan (INI YANG SEBELUMNYA BIKIN ERROR 404)
const updateAngkatan = async (req, res) => {
  const { id } = req.params;
  const { nama_angkatan } = req.body;
  
  if (!nama_angkatan) return res.status(400).json({ success: false, message: "Nama kategori wajib diisi!" });
  
  try {
    const [result] = await db.query("UPDATE angkatan SET nama_angkatan = ? WHERE id = ?", [nama_angkatan, id]);
    
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    res.json({ success: true, message: "Data berhasil diperbarui!" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: "Nama kategori tersebut sudah ada!" });
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. DELETE: Menghapus angkatan
const deleteAngkatan = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM angkatan WHERE id = ?", [id]);
    res.json({ success: true, message: "Data berhasil dihapus!" });
  } catch (err) {
    // Pencegahan error jika angkatan sedang dipakai oleh mahasiswa
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ success: false, message: "Gagal! Kategori ini sedang digunakan oleh mahasiswa." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllAngkatan,
  createAngkatan,
  updateAngkatan,
  deleteAngkatan
};