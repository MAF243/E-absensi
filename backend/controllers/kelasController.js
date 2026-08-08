const db = require('../config/db');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { angkatan_id } = req.query;
    let query = 'SELECT * FROM kelas';
    const params = [];
    
    if (angkatan_id) {
      query += ' WHERE angkatan_id = ?';
      params.push(angkatan_id);
    }
    
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { nama_kelas, angkatan_id } = req.body;
    if (!nama_kelas || !angkatan_id) throw new AppError("Nama kelas dan Angkatan ID wajib diisi!", 400);

    const [result] = await db.query(
      'INSERT INTO kelas (nama_kelas, angkatan_id) VALUES (?, ?)',
      [nama_kelas, angkatan_id]
    );

    res.status(201).json({ success: true, message: "Kelas berhasil ditambahkan", data: { id: result.insertId, nama_kelas, angkatan_id } });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_kelas } = req.body;
    if (!nama_kelas) throw new AppError("Nama kelas wajib diisi!", 400);

    const [result] = await db.query(
      'UPDATE kelas SET nama_kelas = ? WHERE id = ?',
      [nama_kelas, id]
    );
    
    if (result.affectedRows === 0) throw new AppError("Kelas tidak ditemukan!", 404);

    res.json({ success: true, message: "Kelas berhasil diupdate" });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM kelas WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) throw new AppError("Kelas tidak ditemukan!", 404);

    res.json({ success: true, message: "Kelas berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};
