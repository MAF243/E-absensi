const db = require('../config/db');

// ==========================================
// 1. MESIN KALKULATOR REKAP MAHASISWA
// ==========================================
const getRekapMahasiswa = async (req, res) => {
  const { angkatan_id, jurusan, start_date, end_date } = req.query;

  try {
    // A. Filter Mahasiswa
    let whereUser = "u.role = 'mahasiswa'";
    let paramsUser = [];

    if (angkatan_id) {
      whereUser += " AND (u.angkatan_id = ? OR EXISTS (SELECT 1 FROM grup_mahasiswa gm WHERE gm.mahasiswa_id = u.id AND gm.angkatan_id = ?))";
      paramsUser.push(angkatan_id, angkatan_id);
    }
    if (jurusan) {
      whereUser += " AND u.jurusan = ?";
      paramsUser.push(jurusan);
    }

    const [mahasiswa] = await db.query(`
      SELECT u.id, u.nomor_induk, u.nama_lengkap, u.jenis_kelamin, u.jurusan, a.nama_angkatan
      FROM users u LEFT JOIN angkatan a ON u.angkatan_id = a.id
      WHERE ${whereUser} ORDER BY u.nama_lengkap ASC
    `, paramsUser);

    if (mahasiswa.length === 0) return res.json({ success: true, data: [] });

    const mhsIds = mahasiswa.map(m => m.id);

    // B. Filter Rentang Waktu
    let dateFilterSesi = "";
    let dateParams = [];
    if (start_date && end_date) {
        dateFilterSesi = " AND DATE(sk.waktu_mulai) BETWEEN ? AND ? ";
        dateParams.push(start_date, end_date);
    }

    // C. Cari Target Pertemuan Dinamis (Sesi yang benar-benar pernah dibuka dosen)
    const [sesiAktif] = await db.query(`
      SELECT mk_id, COUNT(id) as total_sesi_berjalan
      FROM sesi_kuliah sk
      WHERE status = 'selesai' ${dateFilterSesi}
      GROUP BY mk_id
    `, dateParams);

    const targetPerMk = {};
    sesiAktif.forEach(s => targetPerMk[s.mk_id] = s.total_sesi_berjalan);

    // D. Tarik Data Absen Mahasiswa yang bersangkutan
    const [absensi] = await db.query(`
      SELECT ab.user_id, ab.mk_id, ab.status, mk.nama_mk
      FROM absensi ab
      JOIN sesi_kuliah sk ON ab.sesi_id = sk.id
      JOIN mata_kuliah mk ON ab.mk_id = mk.id
      WHERE ab.user_id IN (?) AND sk.status = 'selesai' ${dateFilterSesi}
    `, [mhsIds, ...dateParams]);

    // E. Mapping dan Kalkulasi
    const result = mahasiswa.map(mhs => {
       let recordAbsen = absensi.filter(a => a.user_id === mhs.id);
       let total_h = 0, total_i = 0, total_s = 0, total_a = 0;
       let matkulData = {};
       
       recordAbsen.forEach(ab => {
          if(!matkulData[ab.mk_id]) matkulData[ab.mk_id] = { nama_mk: ab.nama_mk, hadir: 0, target: targetPerMk[ab.mk_id] || 0 };
          
          if (ab.status === 'hadir') { matkulData[ab.mk_id].hadir += 1; total_h++; }
          else if (ab.status === 'izin') { total_i++; }
          else if (ab.status === 'sakit') { total_s++; }
          else if (ab.status === 'alpa') { total_a++; }
       });

       let total_persen = 0;
       let count_mk = 0;
       let detail_matkul = Object.values(matkulData).map(mk => {
          let persen = mk.target > 0 ? Math.round((mk.hadir / mk.target) * 100) : 0;
          total_persen += persen;
          count_mk++;
          return { nama_mk: mk.nama_mk, hadir: mk.hadir, target: mk.target, persen };
       });

       let akm = count_mk > 0 ? Math.round(total_persen / count_mk) : 0;

       return { ...mhs, total_h, total_i, total_s, total_a, detail_matkul, akm };
    });

    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ==========================================
// 2. MESIN PENARIK DATA REKAP DOSEN
// ==========================================
const getRekapDosen = async (req, res) => {
  const { start_date, end_date } = req.query;
  try {
    let dateFilter = "";
    let params = [];
    if (start_date && end_date) {
        dateFilter = " AND DATE(sk.waktu_mulai) BETWEEN ? AND ? ";
        params.push(start_date, end_date);
    }

    const query = `
      SELECT 
        u.nama_lengkap as nama_dosen,
        mk.nama_mk, mk.kode_mk,
        sk.jenis_sesi, sk.agenda, 
        DATE_FORMAT(sk.waktu_mulai, '%d-%m-%Y') as tanggal,
        DATE_FORMAT(sk.waktu_mulai, '%H:%i') as jam_mulai,
        DATE_FORMAT(sk.waktu_selesai, '%H:%i') as jam_selesai,
        (SELECT COUNT(*) FROM absensi ab WHERE ab.sesi_id = sk.id AND ab.status = 'hadir') as total_hadir_mhs
      FROM sesi_kuliah sk
      JOIN mata_kuliah mk ON sk.mk_id = mk.id
      JOIN users u ON sk.dosen_id = u.id
      WHERE sk.status = 'selesai' ${dateFilter}
      ORDER BY sk.waktu_mulai DESC
    `;
    
    const [results] = await db.query(query, params);
    res.json({ success: true, data: results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getRekapMahasiswa, getRekapDosen };