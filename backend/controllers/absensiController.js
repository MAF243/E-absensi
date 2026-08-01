const db = require('../config/db');

const hitungJarakMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// 1. FUNGSI SCAN QR MAHASISWA
const scanQR = async (req, res) => {
  const { qr_code, latitude, longitude, mahasiswa_id } = req.body;
  if (!qr_code || !latitude || !longitude || !mahasiswa_id) return res.status(400).json({ success: false, message: "Data scan tidak lengkap! Pastikan GPS aktif." });

  const KAMPUS_LAT = -6.5902172; 
  const KAMPUS_LON = 106.7854656; 
  const RADIUS_MAKSIMAL = 10;
  const jarak = hitungJarakMeters(KAMPUS_LAT, KAMPUS_LON, latitude, longitude);
  
  if (jarak > RADIUS_MAKSIMAL) return res.status(403).json({ success: false, message: `Gagal: Anda di luar jangkauan kampus. (Jarak: ${Math.round(jarak)}m)` });
  if (!qr_code.startsWith('stikomabsen://sesi/MATKUL-')) return res.status(400).json({ success: false, message: "QR Code ini tidak valid!" });

  const cleanStr = qr_code.replace('stikomabsen://sesi/', ''); 
  const qrParts = cleanStr.split('-');
  const mk_id = qrParts[1];

  try {
    // Cari Sesi yang Sedang Aktif
    const [aktif] = await db.query("SELECT id FROM sesi_kuliah WHERE mk_id = ? AND status = 'berlangsung'", [mk_id]);
    if(aktif.length === 0) return res.status(400).json({ success: false, message: "Sesi kelas belum dibuka oleh Dosen." });
    const sesi_id = aktif[0].id;

    // Cek Absen Ganda
    const [cekAbsen] = await db.query(`SELECT id FROM absensi WHERE user_id = ? AND sesi_id = ?`, [mahasiswa_id, sesi_id]);
    if (cekAbsen.length > 0) return res.status(400).json({ success: false, message: "Anda sudah tercatat HADIR pada sesi ini." });

    // Simpan Kehadiran
    await db.query(`INSERT INTO absensi (user_id, mk_id, sesi_id, tanggal, status) VALUES (?, ?, ?, NOW(), 'hadir')`, [mahasiswa_id, mk_id, sesi_id]);
    res.json({ success: true, message: "Berhasil Absen! Kehadiran Anda dicatat." });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 2. FUNGSI AMBIL RIWAYAT MENGAJAR DOSEN
const getRiwayatDosen = async (req, res) => {
  const { dosen_id } = req.params;
  try {
    const query = `
      SELECT s.id as sesi_id, s.waktu_mulai, s.waktu_selesai, s.agenda, s.jenis_sesi, s.tipe,
             m.kode_mk, m.nama_mk, m.jenis_kelas, m.angkatan_id, m.jurusan, a.nama_angkatan,
             (SELECT COUNT(*) FROM absensi ab WHERE ab.sesi_id = s.id AND ab.status = 'hadir') as total_hadir,
             CASE
               WHEN m.jenis_kelas = 'paket' THEN (SELECT COUNT(*) FROM users u2 WHERE u2.role = 'mahasiswa' AND u2.angkatan_id = m.angkatan_id)
               ELSE (SELECT COUNT(*) FROM peserta_kelas pk WHERE pk.mk_id = m.id)
             END as total_peserta
      FROM sesi_kuliah s
      JOIN mata_kuliah m ON s.mk_id = m.id
      LEFT JOIN angkatan a ON m.angkatan_id = a.id
      WHERE s.dosen_id = ? AND s.status = 'selesai'
      ORDER BY s.waktu_mulai DESC
    `;
    const [results] = await db.query(query, [dosen_id]);
    res.json({ success: true, data: results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 3. FUNGSI AMBIL DETAIL ABSENSI 1 SESI
const getDetailRekapSesi = async (req, res) => {
  const { sesi_id } = req.params;
  try {
    const [sesi] = await db.query("SELECT mk_id FROM sesi_kuliah WHERE id = ?", [sesi_id]);
    if (sesi.length === 0) return res.status(404).json({ success: false, message: "Sesi tidak ditemukan" });
    const mk_id = sesi[0].mk_id;

    const [mk] = await db.query("SELECT jenis_kelas, angkatan_id FROM mata_kuliah WHERE id = ?", [mk_id]);
    const isPaket = mk[0].jenis_kelas === 'paket';

    let queryMhs = ""; let paramsMhs = [];
    if (isPaket) {
      queryMhs = `SELECT id, nomor_induk, nama_lengkap, jurusan FROM users WHERE role='mahasiswa' AND angkatan_id=? ORDER BY nama_lengkap ASC`;
      paramsMhs = [mk[0].angkatan_id];
    } else {
      queryMhs = `SELECT u.id, u.nomor_induk, u.nama_lengkap, u.jurusan FROM peserta_kelas pk JOIN users u ON pk.mahasiswa_id = u.id WHERE pk.mk_id = ? ORDER BY u.nama_lengkap ASC`;
      paramsMhs = [mk_id];
    }

    const [mahasiswa] = await db.query(queryMhs, paramsMhs);
    const [absensi] = await db.query("SELECT user_id, status FROM absensi WHERE sesi_id = ?", [sesi_id]);
    
    const absenMap = {};
    absensi.forEach(a => absenMap[a.user_id] = a.status);

    const result = mahasiswa.map(m => ({
      ...m,
      status_absen: absenMap[m.id] || 'alpa' 
    }));

    const ringkasan = result.reduce((summary, mahasiswa) => {
      summary.total_peserta += 1;
      summary[mahasiswa.status_absen] += 1;
      return summary;
    }, { total_peserta: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0 });

    res.json({ success: true, data: result, mk_id, ringkasan });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 4. FUNGSI SIMPAN REKAP MANUAL OLEH DOSEN
const simpanRekapManual = async (req, res) => {
  const { sesi_id, mk_id, rekap_data } = req.body;
  try {
    await db.query("DELETE FROM absensi WHERE sesi_id = ?", [sesi_id]);
    if (rekap_data && rekap_data.length > 0) {
      const values = rekap_data.map(d => [d.user_id, mk_id, sesi_id, d.status]);
      await db.query("INSERT INTO absensi (user_id, mk_id, sesi_id, status) VALUES ?", [values]);
    }
    res.json({ success: true, message: "Rekap absensi berhasil disimpan secara permanen!" });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { scanQR, getRiwayatDosen, getDetailRekapSesi, simpanRekapManual };
