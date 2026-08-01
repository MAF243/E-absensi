const db = require('../config/db');
const bcrypt = require('bcrypt'); // Pastikan bcrypt sudah di-import

const login = async (req, res) => {
  const { identitas, password } = req.body;

  if (!identitas || !password) {
    return res.status(400).json({ success: false, message: "Identitas dan Password wajib diisi!" });
  }

  try {
    // 1. Cari user berdasarkan NIM/NIDN, Nama, atau Inisial
    const query = `
      SELECT * FROM users 
      WHERE (
        LOWER(TRIM(nomor_induk)) = LOWER(TRIM(?)) 
        OR LOWER(TRIM(nama_lengkap)) = LOWER(TRIM(?))
        OR LOWER(TRIM(inisial)) = LOWER(TRIM(?))
      )
    `;
    
    const [results] = await db.query(query, [identitas, identitas, identitas]);

    if (results.length > 0) {
      const user = results[0];
      const statusAkademik = user.status_akademik || ''; 
      
      // ==========================================
      // 2. PROTEKSI AKUN TIDAK AKTIF / CUTI
      // (Diperbarui untuk mencakup Dosen & Mahasiswa)
      // ==========================================
      const status = String(statusAkademik).toLowerCase();
      if (status === 'cuti' || status === 'tidak aktif') {
        const roleDisplay = user.role === 'dosen' ? 'Dosen' : 'Mahasiswa';
        return res.status(403).json({ 
          success: false, 
          message: `🚫 Akses Ditolak: Akun ${roleDisplay} Anda berstatus ${status.toUpperCase()}. Silakan hubungi Administrator.` 
        });
      }

      // 3. VERIFIKASI HASHED PASSWORD
      // Membandingkan password dari form dengan hash di database
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        // Update waktu login
        await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);
          
        res.json({
          success: true,
          message: "Login Berhasil!",
          data: {
            id: user.id,
            nomor_induk: user.nomor_induk,
            nama: user.nama_lengkap, 
            role: user.role,
            inisial: user.inisial || '-'
          }
        });
      } else {
        // Password tidak cocok
        res.status(401).json({ success: false, message: "Identitas atau Password salah!" });
      }

    } else {
      res.status(401).json({ success: false, message: "Identitas tidak ditemukan!" });
    }

  } catch (err) {
    console.error("❌ DATABASE ERROR SAAT LOGIN:", err.message);
    res.status(500).json({ success: false, message: "Error sistem database saat login." });
  }
};

module.exports = { login };