const db = require('../config/db');
const cron = require('node-cron');

// 1. Ambil Semua Data Jadwal (Untuk Admin/Dosen)
const getJadwal = async (req, res) => {
  try {
    await db.query(`UPDATE sesi_kuliah sk JOIN mata_kuliah mk ON sk.mk_id = mk.id SET sk.status = 'selesai', sk.waktu_selesai = NOW() WHERE sk.status = 'berlangsung' AND DATE(sk.waktu_mulai) = CURDATE() AND CURTIME() > mk.jam_selesai`);
    await db.query(`UPDATE sesi_kuliah SET status = 'selesai', waktu_selesai = NOW() WHERE status = 'berlangsung' AND DATE(waktu_mulai) < CURDATE()`);

    const query = `
      SELECT m.id, m.kode_mk, m.nama_mk, m.semester, m.hari, m.dosen_id, m.jurusan, m.jenis_kelas, m.target_pertemuan, m.ruangan,
             DATE_FORMAT(m.jam_mulai, '%H:%i') as jam_mulai, 
             DATE_FORMAT(m.jam_selesai, '%H:%i') as jam_selesai,
             u.nama_lengkap AS dosen_nama,
             a.nama_angkatan,
             (
                SELECT GROUP_CONCAT(DISTINCT usr.jurusan SEPARATOR ', ')
                FROM peserta_kelas pk
                JOIN users usr ON pk.mahasiswa_id = usr.id
                WHERE pk.mk_id = m.id
             ) AS kelompok_jurusan,
             (
                SELECT SUM(sk2.bobot) FROM sesi_kuliah sk2 WHERE sk2.mk_id = m.id
             ) AS total_pertemuan,
             s.id AS sesi_aktif_id, s.tipe AS sesi_tipe, s.status AS sesi_status, s.link_meet
      FROM mata_kuliah m
      LEFT JOIN users u ON m.dosen_id = u.id
      LEFT JOIN angkatan a ON m.angkatan_id = a.id
      LEFT JOIN sesi_kuliah s ON s.mk_id = m.id AND s.status = 'berlangsung'
      ORDER BY m.semester ASC, m.nama_mk ASC
    `;
    const [results] = await db.query(query);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Update/Atur Jadwal Kuliah (Tambahan Ruangan)
const updateJadwal = async (req, res) => {
  const { id } = req.params;
  const { hari, jam_mulai, jam_selesai, target_pertemuan, ruangan } = req.body;
  if (!hari || !jam_mulai || !jam_selesai) return res.status(400).json({ success: false, message: "Data waktu tidak lengkap!" });
  try {
    await db.query("UPDATE mata_kuliah SET hari=?, jam_mulai=?, jam_selesai=?, target_pertemuan=?, ruangan=? WHERE id=?", 
      [hari, jam_mulai, jam_selesai, target_pertemuan || 16, ruangan || null, id]);
    res.json({ success: true, message: "Jadwal, Target, dan Ruangan berhasil disimpan!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 3. Reset/Kosongkan Jadwal
const resetJadwal = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE mata_kuliah SET hari=NULL, jam_mulai=NULL, jam_selesai=NULL, ruangan=NULL WHERE id=?", [id]);
    res.json({ success: true, message: "Jadwal berhasil direset!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 4. BUKA SESI
const bukaSesi = async (req, res) => {
  const { mk_id, dosen_id, tipe, link_meet, agenda, jenis_sesi, bobot } = req.body;
  try {
    const [mk] = await db.query("SELECT hari, jam_mulai, jam_selesai FROM mata_kuliah WHERE id = ?", [mk_id]);
    if (mk.length === 0) return res.status(404).json({ success: false, message: "Mata kuliah tidak ditemukan." });
    if (!mk[0].hari || !mk[0].jam_mulai || !mk[0].jam_selesai) return res.status(400).json({ success: false, message: "Akses Ditolak! Admin belum mengatur jadwal." });
    
    const [cek] = await db.query("SELECT id FROM sesi_kuliah WHERE mk_id = ? AND status = 'berlangsung'", [mk_id]);
    if (cek.length > 0) return res.status(400).json({ success: false, message: "Sesi sudah berjalan." });

    const finalLink = (tipe === 'online') ? link_meet : null;
    await db.query("INSERT INTO sesi_kuliah (mk_id, dosen_id, tipe, link_meet, status, agenda, jenis_sesi, bobot) VALUES (?, ?, ?, ?, 'berlangsung', ?, ?, ?)", [mk_id, dosen_id, tipe, finalLink, agenda, jenis_sesi || 'Reguler', bobot || 1]);
    res.json({ success: true, message: "Sesi kelas berhasil DIBUKA!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 5. TUTUP SESI
const tutupSesi = async (req, res) => {
  const { sesi_id } = req.params;
  try {
    await db.query("UPDATE sesi_kuliah SET status = 'selesai', waktu_selesai = NOW() WHERE id = ?", [sesi_id]);
    res.json({ success: true, message: "Sesi kelas berhasil DITUTUP!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 6. AMBIL JADWAL SPESIFIK MAHASISWA
const getJadwalByMahasiswa = async (req, res) => {
  const { mahasiswa_id } = req.params;
  try {
    const [mhs] = await db.query("SELECT angkatan_id FROM users WHERE id = ?", [mahasiswa_id]);
    if (mhs.length === 0) return res.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
    const angkatan_id = mhs[0].angkatan_id || 0; 

    const query = `
      SELECT m.id, m.kode_mk, m.nama_mk, m.semester, m.hari, m.dosen_id, m.jurusan, m.jenis_kelas, m.ruangan,
             DATE_FORMAT(m.jam_mulai, '%H:%i') as jam_mulai, 
             DATE_FORMAT(m.jam_selesai, '%H:%i') as jam_selesai,
             u.nama_lengkap AS dosen_nama,
             a.nama_angkatan,
             s.id AS sesi_aktif_id, s.tipe AS sesi_tipe, s.status AS sesi_status, s.link_meet
      FROM mata_kuliah m
      LEFT JOIN users u ON m.dosen_id = u.id
      LEFT JOIN angkatan a ON m.angkatan_id = a.id
      LEFT JOIN sesi_kuliah s ON s.mk_id = m.id AND s.status = 'berlangsung'
      WHERE (m.jenis_kelas = 'paket' AND m.angkatan_id = ?)
         OR (m.jenis_kelas = 'kelompok' AND EXISTS (
             SELECT 1 FROM peserta_kelas pk WHERE pk.mk_id = m.id AND pk.mahasiswa_id = ?
         ))
      ORDER BY m.jam_mulai ASC
    `;
    const [results] = await db.query(query, [angkatan_id, mahasiswa_id]);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 7. ROBOT CRON JOB
cron.schedule('* * * * *', async () => {
  try {
    await db.query(`UPDATE sesi_kuliah sk JOIN mata_kuliah mk ON sk.mk_id = mk.id SET sk.status = 'selesai', sk.waktu_selesai = NOW() WHERE sk.status = 'berlangsung' AND DATE(sk.waktu_mulai) = CURDATE() AND CURTIME() > mk.jam_selesai`);
    await db.query(`UPDATE sesi_kuliah SET status = 'selesai', waktu_selesai = NOW() WHERE status = 'berlangsung' AND DATE(waktu_mulai) < CURDATE()`);
  } catch (error) {}
});

module.exports = { getJadwal, updateJadwal, resetJadwal, bukaSesi, tutupSesi, getJadwalByMahasiswa };