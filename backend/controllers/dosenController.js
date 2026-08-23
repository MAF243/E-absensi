const AppError = require('../utils/AppError');
const userService = require('../services/userService');

const getAllDosen = async (req, res, next) => {
  const data = await userService.getAll('dosen');
    res.json({ success: true, data });
  
};

const createDosen = async (req, res, next) => {
  if (!req.body.nomor_induk || !req.body.nama_lengkap) {
      throw new AppError("NIDN/Inisial dan Nama wajib diisi!", 400);
    }
    req.body.role = 'dosen';
    await userService.create(req.body);
    res.json({ success: true, message: "Data dosen berhasil ditambahkan!" });
  
};

const updateDosen = async (req, res, next) => {
  if (!req.body.nomor_induk || !req.body.nama_lengkap) {
      throw new AppError("NIDN/Inisial dan Nama wajib diisi!", 400);
    }
    req.body.role = 'dosen';
    await userService.update(req.params.id, req.body);
    res.json({ success: true, message: "Data dosen berhasil diperbarui!" });
  
};

const deleteDosen = async (req, res, next) => {
  await userService.delete(req.params.id, 'dosen');
    res.json({ success: true, message: "Data dosen berhasil dihapus!" });
  
};

const bulkDeleteDosen = async (req, res, next) => {
  if (!req.body.ids || !req.body.ids.length) throw new AppError("Tidak ada data yang dipilih.", 400);
    await userService.bulkDelete(req.body.ids, 'dosen');
    res.json({ success: true, message: "Data dosen berhasil dihapus!" });
  
};

const bulkCreateDosen = async (req, res, next) => {
  if (!req.body.data || !req.body.data.length) throw new AppError("Data kosong.", 400);
    await userService.bulkCreate(req.body.data, 'dosen');
    res.json({ success: true, message: "Import CSV berhasil!" });
  
};

const getDosenDetail = async (req, res, next) => {
  const data = await userService.getDosenDetail(req.params.id);
    res.json({ success: true, data });
  
};

const resetRiwayatSesi = async (req, res, next) => {
  await userService.resetDosenRiwayatSesi(req.params.id);
    res.json({ success: true, message: "Seluruh riwayat sesi dan agenda dosen ini berhasil dibersihkan!" });
  
};

module.exports = { getAllDosen, createDosen, updateDosen, deleteDosen, bulkDeleteDosen, bulkCreateDosen, getDosenDetail, resetRiwayatSesi };