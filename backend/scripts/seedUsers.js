const bcrypt = require('bcrypt');
const db = require('../config/db'); // Memanggil koneksi database kita

async function runSeeder() {
  console.log('⏳ Memulai proses seeding data pengguna...');
  const saltRounds = 10;

  // Daftar akun yang ingin kita masukkan sekaligus (Admin, Dosen, Mahasiswa)
  const users = [
    {
      nomor_induk: 'admin',
      nama_lengkap: 'Administrator Akademik',
      role: 'admin',
      password_asli: 'admin123',
    },
    {
      nomor_induk: '1234567',
      nama_lengkap: 'Bapak Dosen',
      role: 'dosen',
      password_asli: 'dosen123',
    },
    {
      nomor_induk: '221102022',
      nama_lengkap: 'Mahasiswa Rajin',
      role: 'mahasiswa',
      password_asli: 'mhs123',
    }
  ];

  try {
    for (const user of users) {
      // 1. Proses Hashing Password
      const hashedPassword = await bcrypt.hash(user.password_asli, saltRounds);

      // 2. Cek apakah user sudah ada di database agar tidak duplikat
      const [existingUser] = await db.query('SELECT * FROM users WHERE nomor_induk = ?', [user.nomor_induk]);

      if (existingUser.length > 0) {
        // Jika sudah ada, update password-nya dengan yang sudah di-hash
        await db.query('UPDATE users SET password = ?, nama_lengkap = ?, role = ? WHERE nomor_induk = ?', 
          [hashedPassword, user.nama_lengkap, user.role, user.nomor_induk]);
        console.log(`🔄 Diperbarui: ${user.nama_lengkap} (${user.role})`);
      } else {
        // Jika belum ada, masukkan sebagai data baru
        await db.query('INSERT INTO users (nomor_induk, nama_lengkap, password, role) VALUES (?, ?, ?, ?)', 
          [user.nomor_induk, user.nama_lengkap, hashedPassword, user.role]);
        console.log(`✅ Ditambahkan: ${user.nama_lengkap} (${user.role})`);
      }
    }

    console.log('🎉 Seeding selesai! Semua password sudah di-hash dengan aman.');
    process.exit(); // Mematikan script setelah selesai

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat seeding:', error);
    process.exit(1);
  }
}

// Menjalankan fungsi
runSeeder();