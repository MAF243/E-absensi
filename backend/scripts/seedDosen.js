const db = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('Menyiapkan data 30 Dosen dummy...');
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const values = [];
    const jk = ['L', 'P'];
    const jurusanList = ['TI', 'SI', 'DKV'];

    for (let i = 1; i <= 30; i++) {
      const paddedIndex = String(i).padStart(3, '0');
      // Membuat format NIDN atau NIK dosen yang unik
      const nomor_induk = `0011${paddedIndex}01`; 
      const nama_lengkap = `Dr. Dosen Dummy ${i}, S.Kom., M.Kom.`;
      const inisial = `DD${i}`;
      const role = 'dosen';
      const status_akademik = 'aktif';
      const jenis_kelamin = jk[i % 2];
      const jurusan = jurusanList[i % 3];

      values.push([
        nomor_induk,
        nama_lengkap,
        inisial,
        hashedPassword,
        role,
        status_akademik,
        jenis_kelamin,
        jurusan
      ]);
    }

    const query = `
      INSERT INTO users (nomor_induk, nama_lengkap, inisial, password, role, status_akademik, jenis_kelamin, jurusan)
      VALUES ?
    `;

    await db.query(query, [values]);
    console.log('✅ 30 Data Dosen dummy berhasil ditambahkan ke database!');
    console.log('Password default untuk semua dosen adalah: password123');
  } catch (err) {
    // Abaikan error duplicate entry (1062) agar bisa dirun berulang kali tanpa merusak app
    if(err.code === 'ER_DUP_ENTRY') {
       console.log('⚠️ Data Dosen dummy sepertinya sudah pernah ditambahkan sebelumnya (terdeteksi duplikat).');
    } else {
       console.error('❌ Gagal menambahkan data:', err);
    }
  } finally {
    process.exit(0);
  }
}

seed();
