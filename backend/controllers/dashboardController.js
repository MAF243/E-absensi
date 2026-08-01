const db = require('../config/db');

// A. Mengambil Angka Statistik
const getStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'mahasiswa') AS total_mahasiswa,
        (SELECT COUNT(*) FROM users WHERE role = 'mahasiswa' AND status_akademik = 'aktif') AS mhs_aktif,
        (SELECT COUNT(*) FROM users WHERE role = 'mahasiswa' AND status_akademik = 'cuti') AS mhs_cuti,
        (SELECT COUNT(*) FROM users WHERE role = 'mahasiswa' AND status_akademik = 'tidak aktif') AS mhs_tidak_aktif,
        (SELECT COUNT(*) FROM users WHERE role = 'dosen') AS total_dosen,
        (SELECT COUNT(*) FROM mata_kuliah) AS total_matkul
    `;
    
    const [results] = await db.query(query);
    res.json({ success: true, data: results[0] });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// B. Mengambil Ranking Rajin & Kurang Rajin (< 80%)
const getRanking = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.nama_lengkap, u.angkatan_id as angkatan, u.jurusan,
      (SELECT COUNT(*) FROM absensi a WHERE a.user_id = u.id AND LOWER(a.status) = 'hadir') as total_hadir,
      (SELECT COUNT(DISTINCT tanggal) FROM absensi) as total_pertemuan_global
      FROM users u
      WHERE u.role = 'mahasiswa'
    `;
    
    const [results] = await db.query(query);
    
    let rajin = [];
    let kurangRajin = [];

    const processed = results.map(mhs => {
       const max = mhs.total_pertemuan_global || 1; 
       const persen = Math.round((mhs.total_hadir / max) * 100);
       return { ...mhs, persentase: persen > 100 ? 100 : persen }; 
    });

    const hasAttendance = processed.filter(r => r.total_pertemuan_global > 0);

    if (hasAttendance.length > 0) {
      rajin = hasAttendance
        .filter(m => m.persentase >= 80)
        .sort((a,b) => b.persentase - a.persentase)
        .slice(0, 3);
        
      kurangRajin = hasAttendance
        .filter(m => m.persentase < 80)
        .sort((a,b) => a.persentase - b.persentase)
        .slice(0, 3); 
    }

    res.json({ success: true, data: { rajin, kurangRajin } });

  } catch (err) {
    // GRACEFUL FALLBACK: Mengembalikan array kosong jika tabel absensi belum ada
    console.log("Info: Gagal load ranking (Tabel absensi mungkin belum ada) -", err.message);
    res.json({ success: true, data: { rajin: [], kurangRajin: [] } });
  }
};

// C. Mengambil Live Logs Login
const getLogs = async (req, res) => {
  try {
    const query = `
      SELECT id, nama_lengkap, role, DATE_FORMAT(last_login, '%H:%i') AS waktu_login
      FROM users 
      WHERE last_login IS NOT NULL
      ORDER BY last_login DESC 
      LIMIT 5
    `;
    
    const [results] = await db.query(query);
    
    const logs = results.map(user => ({
      id: user.id,
      jenis: user.role,
      pesan: `${user.nama_lengkap}`,
      waktu: user.waktu_login || 'Baru saja'
    }));
    
    res.json({ success: true, data: logs });

  } catch (err) {
    // GRACEFUL FALLBACK
    console.log("Info: Gagal load logs -", err.message);
    res.json({ success: true, data: [] });
  }
};

module.exports = { getStats, getRanking, getLogs };