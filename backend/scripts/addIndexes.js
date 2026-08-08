const mysql = require('mysql2/promise');

async function run() {
  console.log('--- Memulai Proses Pengindeksan Database ---');
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'e_absensi_stikom'
    });

    async function createIndexSafe(query) {
      try {
        await db.query(query);
        console.log(`Berhasil: ${query}`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`Sudah ada (Skip): ${query}`);
        } else {
          console.error(`Gagal: ${query}`, error.message);
        }
      }
    }

    await createIndexSafe('CREATE INDEX idx_absensi_user ON absensi (user_id)');
    await createIndexSafe('CREATE INDEX idx_absensi_mk ON absensi (mk_id)');
    await createIndexSafe('CREATE INDEX idx_absensi_sesi ON absensi (sesi_id)');
    
    await createIndexSafe('CREATE INDEX idx_sesi_mk ON sesi_kuliah (mk_id)');
    await createIndexSafe('CREATE INDEX idx_sesi_dosen ON sesi_kuliah (dosen_id)');
    
    await createIndexSafe('CREATE INDEX idx_users_role ON users (role)');
    await createIndexSafe('CREATE INDEX idx_users_angkatan ON users (angkatan_id)');

    await db.end();
    console.log('--- Selesai ---');
    process.exit(0);
  } catch (err) {
    console.error('Koneksi gagal:', err.message);
    process.exit(1);
  }
}

run();

run();
