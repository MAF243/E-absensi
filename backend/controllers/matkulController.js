const AppError = require('../utils/AppError');
const matkulService = require('../services/matkulService');

const getAllMatkul = async (req, res, next) => {
  const data = await matkulService.getAll();
    res.json({ success: true, data });
  
};

const createMatkul = async (req, res, next) => {
  await matkulService.create(req.body);
    res.json({ success: true, message: "Mata kuliah ditambahkan!" });
  
};

const updateMatkul = async (req, res, next) => {
  await matkulService.update(req.params.id, req.body);
    res.json({ success: true, message: "Mata kuliah diperbarui!" });
  
};

const deleteMatkul = async (req, res, next) => {
  await matkulService.delete(req.params.id);
    res.json({ success: true, message: "Mata kuliah dihapus!" });
  
};

const bulkDeleteMatkul = async (req, res, next) => {
  await matkulService.bulkDelete(req.body.ids);
    res.json({ success: true, message: "Mata kuliah dihapus massal!" });
  
};

const resetPenugasan = async (req, res, next) => {
  await matkulService.resetPenugasan(req.body.ids);
    res.json({ success: true, message: "Penugasan direset!" });
  
};

const assignMatkul = async (req, res, next) => {
  await matkulService.assignMatkul(req.params.id, req.body);
    res.json({ success: true, message: "Penugasan berhasil disimpan!" });
  
};

const getPesertaDetail = async (req, res, next) => {
  const detail = await matkulService.getPesertaDetail(req.params.id);
    res.json({ success: true, data: detail.data, isPaket: detail.isPaket });
  
};

const getPesertaIds = async (req, res, next) => {
  const data = await matkulService.getPesertaIds(req.params.id);
    res.json({ success: true, data });
  
};

const deletePeserta = async (req, res, next) => {
  await matkulService.deletePeserta(req.params.id, req.params.mhs_id);
    res.json({ success: true, message: "Peserta dihapus dari kelas ini." });
  
};

const bulkCreateMatkul = async (req, res, next) => {
  if (!req.body.data || !req.body.data.length) throw new AppError("Data kosong", 400);
    await matkulService.bulkCreate(req.body.data);
    res.json({ success: true, message: "Data CSV berhasil diimpor!" });
  
};

module.exports = { 
  getAllMatkul, createMatkul, updateMatkul, deleteMatkul, bulkDeleteMatkul, 
  resetPenugasan, assignMatkul, getPesertaDetail, getPesertaIds, deletePeserta, bulkCreateMatkul 
};