const AppError = require('../utils/AppError');
const periodeService = require('../services/periodeService');

const getAllPeriode = async (req, res, next) => {
  const data = await periodeService.getAll();
    res.json({ success: true, data });
  
};

const createPeriode = async (req, res, next) => {
  if (!req.body.nama_periode) throw new AppError("Nama periode wajib diisi!", 400);
    await periodeService.create(req.body);
    res.json({ success: true, message: "Periode berhasil ditambahkan!" });
  
};

const updatePeriode = async (req, res, next) => {
  if (!req.body.nama_periode) throw new AppError("Nama periode wajib diisi!", 400);
    await periodeService.update(req.params.id, req.body);
    res.json({ success: true, message: "Periode berhasil diperbarui!" });
  
};

const deletePeriode = async (req, res, next) => {
  await periodeService.delete(req.params.id);
    res.json({ success: true, message: "Periode berhasil dihapus!" });
  
};

module.exports = { getAllPeriode, createPeriode, updatePeriode, deletePeriode };
