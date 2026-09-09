const AppError = require('../utils/AppError');
const jadwalService = require('../services/jadwalService');

const getJadwal = async (req, res, next) => {
  const data = await jadwalService.getJadwal(req.user);
  res.json({ success: true, data });
};

const updateJadwal = async (req, res, next) => {
  await jadwalService.updateJadwal(req.params.id, req.body);
  res.json({ success: true, message: "Jadwal, Target, dan Ruangan berhasil disimpan!" });
};

const resetJadwal = async (req, res, next) => {
  await jadwalService.resetJadwal(req.params.id);
  res.json({ success: true, message: "Jadwal berhasil direset!" });
};

const bukaSesi = async (req, res, next) => {
  await jadwalService.bukaSesi({ mk_id: req.params.id, ...req.body }, req.user);
  res.json({ success: true, message: "Sesi kelas berhasil DIBUKA!" });
};

const tutupSesi = async (req, res, next) => {
  await jadwalService.tutupSesi(req.params.sesi_id, req.user);
  res.json({ success: true, message: "Sesi kelas berhasil DITUTUP!" });
};

const batalkanSesi = async (req, res, next) => {
  const message = await jadwalService.batalkanSesiAtauHapus(req.params.sesi_id);
  res.json({ success: true, message });
};

const getJadwalByMahasiswa = async (req, res, next) => {
  if (Number(req.params.mahasiswa_id) !== Number(req.user.id)) {
    throw new AppError('Anda hanya dapat melihat jadwal sendiri.', 403);
  }
  const data = await jadwalService.getJadwalByMahasiswa(req.user.id);
  res.json({ success: true, data });
};

module.exports = { getJadwal, updateJadwal, resetJadwal, bukaSesi, tutupSesi, batalkanSesi, getJadwalByMahasiswa };
