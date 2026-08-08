const AppError = require('../utils/AppError');
const cron = require('node-cron');
const jadwalService = require('../services/jadwalService');
const db = require('../config/db');

const getJadwal = async (req, res, next) => {
  const data = await jadwalService.getJadwal();
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
  await jadwalService.bukaSesi(req.body);
  res.json({ success: true, message: "Sesi kelas berhasil DIBUKA!" });
};

const tutupSesi = async (req, res, next) => {
  await jadwalService.tutupSesi(req.params.sesi_id);
  res.json({ success: true, message: "Sesi kelas berhasil DITUTUP!" });
};

const batalkanSesi = async (req, res, next) => {
  const message = await jadwalService.batalkanSesiAtauHapus(req.params.sesi_id);
  res.json({ success: true, message });
};

const getJadwalByMahasiswa = async (req, res, next) => {
  const data = await jadwalService.getJadwalByMahasiswa(req.params.mahasiswa_id);
  res.json({ success: true, data });
};

// 7. ROBOT CRON JOB
cron.schedule('* * * * *', async () => {
  try {
    await db.query(`UPDATE sesi_kuliah sk JOIN mata_kuliah mk ON sk.mk_id = mk.id SET sk.status = 'selesai', sk.waktu_selesai = NOW() WHERE sk.status = 'berlangsung' AND DATE(sk.waktu_mulai) = CURDATE() AND CURTIME() > mk.jam_selesai`);
    await db.query(`UPDATE sesi_kuliah SET status = 'selesai', waktu_selesai = NOW() WHERE status = 'berlangsung' AND DATE(waktu_mulai) < CURDATE()`);
  } catch (error) {}
});

module.exports = { getJadwal, updateJadwal, resetJadwal, bukaSesi, tutupSesi, batalkanSesi, getJadwalByMahasiswa };