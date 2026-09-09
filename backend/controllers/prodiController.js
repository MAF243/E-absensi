const AppError = require('../utils/AppError');
const prodiService = require('../services/prodiService');

const getAllProdi = async (req, res) => {
  const data = await prodiService.getAll(req.query.include_inactive === 'true');
  res.json({ success: true, data });
};

const createProdi = async (req, res) => {
  if (!req.body.nama_prodi) throw new AppError('Nama prodi wajib diisi.', 400);
  await prodiService.create(req.body);
  res.json({ success: true, message: 'Prodi berhasil ditambahkan.' });
};

const updateProdi = async (req, res) => {
  await prodiService.update(req.params.id, req.body);
  res.json({ success: true, message: 'Prodi berhasil diperbarui.' });
};

const deleteProdi = async (req, res) => {
  await prodiService.delete(req.params.id);
  res.json({ success: true, message: 'Prodi berhasil dihapus.' });
};

module.exports = { getAllProdi, createProdi, updateProdi, deleteProdi };