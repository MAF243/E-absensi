const db = require('../config/db');

async function columnExists(tableName, columnName) {
  const [rows] = await db.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function tableExists(tableName) {
  const [rows] = await db.query(
    `SELECT 1 FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );
  return rows.length > 0;
}

async function syncSchema() {
  await db.query("ALTER TABLE users MODIFY COLUMN status_akademik VARCHAR(16) NOT NULL DEFAULT 'AKTIF'");
  await db.query(
    'UPDATE users SET status_akademik = ? WHERE role = ? AND status_akademik <> ?',
    ['KELUAR', 'dosen', 'AKTIF']
  );
  await db.query("ALTER TABLE users MODIFY COLUMN status_akademik ENUM('AKTIF', 'CUTI', 'LULUS', 'KELUAR', 'RESIGN') NOT NULL DEFAULT 'AKTIF'");

  if (!(await tableExists('periode_akademik'))) {
    await db.query(`
      CREATE TABLE periode_akademik (
        id INT NOT NULL AUTO_INCREMENT,
        nama_periode VARCHAR(255) NOT NULL,
        status ENUM('aktif', 'tidak aktif') NOT NULL DEFAULT 'tidak aktif',
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('Tabel periode_akademik dibuat.');
  }

  if (!(await tableExists('kelas'))) {
    await db.query(`
      CREATE TABLE kelas (
        id INT NOT NULL AUTO_INCREMENT,
        nama_kelas VARCHAR(100) NOT NULL,
        angkatan_id INT NOT NULL,
        PRIMARY KEY (id),
        KEY idx_kelas_angkatan (angkatan_id),
        CONSTRAINT fk_kelas_angkatan FOREIGN KEY (angkatan_id)
          REFERENCES angkatan(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('Tabel kelas dibuat.');
  }

  if (!(await columnExists('users', 'kelas_id'))) {
    await db.query(`ALTER TABLE users ADD COLUMN kelas_id INT NULL`);
    await db.query(`ALTER TABLE users ADD CONSTRAINT fk_users_kelas FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE SET NULL`);
    console.log('Kolom users.kelas_id dibuat.');
  }

  if (!(await columnExists('mata_kuliah', 'kelas_id'))) {
    await db.query(`ALTER TABLE mata_kuliah ADD COLUMN kelas_id INT NULL`);
    await db.query(`ALTER TABLE mata_kuliah ADD CONSTRAINT fk_matkul_kelas FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE SET NULL`);
    console.log('Kolom mata_kuliah.kelas_id dibuat.');
  }

  if (!(await columnExists('mata_kuliah', 'periode_id'))) {
    await db.query(`ALTER TABLE mata_kuliah ADD COLUMN periode_id INT NULL`);
    await db.query(`ALTER TABLE mata_kuliah ADD CONSTRAINT fk_matkul_periode FOREIGN KEY (periode_id) REFERENCES periode_akademik(id) ON DELETE SET NULL`);
    console.log('Kolom mata_kuliah.periode_id dibuat.');
  }

  console.log('Sinkronisasi schema selesai.');
}

syncSchema()
  .catch((error) => {
    console.error('Sinkronisasi schema gagal:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
