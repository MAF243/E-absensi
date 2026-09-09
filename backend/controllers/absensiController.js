const AppError = require('../utils/AppError');
const absensiService = require('../services/absensiService');

const scanQR = async (req, res, next) => {
  // The authenticated identity is the only identity allowed to create
  // attendance.  Never trust a mahasiswa_id supplied by the client.
  await absensiService.scanQR({ ...req.body, mahasiswa_id: req.user.id });
    res.json({ success: true, message: "Berhasil Absen! Kehadiran Anda dicatat." });
  
};

const getRiwayatDosen = async (req, res, next) => {
  if (req.user.role === 'dosen' && Number(req.params.dosen_id) !== Number(req.user.id)) {
    throw new AppError('Anda hanya dapat melihat riwayat mengajar sendiri.', 403);
  }
  const data = await absensiService.getRiwayatDosen(req.params.dosen_id);
    res.json({ success: true, data });
  
};

const getDetailRekapSesi = async (req, res, next) => {
  const detail = await absensiService.getDetailRekapSesi(req.params.sesi_id, req.user);
    res.json({ success: true, data: detail.data, mk_id: detail.mk_id, ringkasan: detail.ringkasan });
  
};

const simpanRekapManual = async (req, res, next) => {
  await absensiService.simpanRekapManual(req.body.sesi_id, req.body.mk_id, req.body.rekap_data, req.user);
    res.json({ success: true, message: "Rekap absensi berhasil disimpan secara permanen!" });
  
};

module.exports = { scanQR, getRiwayatDosen, getDetailRekapSesi, simpanRekapManual };
