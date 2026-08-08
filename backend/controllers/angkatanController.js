const AppError = require('../utils/AppError');
const angkatanService = require('../services/angkatanService');

const getAllAngkatan = async (req, res, next) => {
  const data = await angkatanService.getAll();
    res.json({ success: true, data });
  
};

const createAngkatan = async (req, res, next) => {
  if (!req.body.nama_angkatan) throw new AppError("Nama kategori wajib diisi!", 400);
    await angkatanService.create(req.body.nama_angkatan);
    res.json({ success: true, message: "Data berhasil ditambahkan!" });
  
};

const updateAngkatan = async (req, res, next) => {
  if (!req.body.nama_angkatan) throw new AppError("Nama kategori wajib diisi!", 400);
    await angkatanService.update(req.params.id, req.body.nama_angkatan);
    res.json({ success: true, message: "Data berhasil diperbarui!" });
  
};

const deleteAngkatan = async (req, res, next) => {
  await angkatanService.delete(req.params.id);
    res.json({ success: true, message: "Data berhasil dihapus!" });
  
};

module.exports = { getAllAngkatan, createAngkatan, updateAngkatan, deleteAngkatan };