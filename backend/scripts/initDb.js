const db = require('../config/db');

const migrations = [
  `CREATE TABLE IF NOT EXISTS password_reset_tokens (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, token_hash CHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL, used_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_password_reset_user (user_id), CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS activity_logs (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id INT NULL, role VARCHAR(30) NULL, action VARCHAR(100) NOT NULL, entity_type VARCHAR(100) NULL, entity_id VARCHAR(100) NULL, summary VARCHAR(500) NULL, metadata JSON NULL, ip_address VARCHAR(64) NULL, user_agent VARCHAR(500) NULL, outcome ENUM('success', 'failure') NOT NULL DEFAULT 'success', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_activity_created (created_at), INDEX idx_activity_user (user_id), CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS app_settings (setting_key VARCHAR(100) PRIMARY KEY, setting_value JSON NOT NULL, updated_by INT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT fk_settings_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS pengajuan_absensi (id INT AUTO_INCREMENT PRIMARY KEY, mahasiswa_id INT NOT NULL, sesi_id INT NULL, mk_id INT NOT NULL, jenis ENUM('izin', 'sakit') NOT NULL, alasan TEXT NOT NULL, bukti_path VARCHAR(500) NULL, status_peninjauan ENUM('baru', 'dilihat') NOT NULL DEFAULT 'baru', viewed_by INT NULL, viewed_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_pengajuan_mahasiswa (mahasiswa_id), INDEX idx_pengajuan_sesi (sesi_id), CONSTRAINT fk_pengajuan_mahasiswa FOREIGN KEY (mahasiswa_id) REFERENCES users(id) ON DELETE CASCADE, CONSTRAINT fk_pengajuan_sesi FOREIGN KEY (sesi_id) REFERENCES sesi_kuliah(id) ON DELETE SET NULL, CONSTRAINT fk_pengajuan_matkul FOREIGN KEY (mk_id) REFERENCES mata_kuliah(id) ON DELETE CASCADE, CONSTRAINT fk_pengajuan_viewer FOREIGN KEY (viewed_by) REFERENCES users(id) ON DELETE SET NULL) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS refresh_tokens (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, token_hash CHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL, last_activity_at DATETIME NOT NULL, revoked_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_refresh_user (user_id), CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS grup_mahasiswa (mahasiswa_id INT NOT NULL, angkatan_id INT NOT NULL, PRIMARY KEY (mahasiswa_id, angkatan_id), CONSTRAINT fk_grup_mahasiswa_user FOREIGN KEY (mahasiswa_id) REFERENCES users(id) ON DELETE CASCADE, CONSTRAINT fk_grup_mahasiswa_angkatan FOREIGN KEY (angkatan_id) REFERENCES angkatan(id) ON DELETE CASCADE) ENGINE=InnoDB`
];

async function run() {
  try {
    const ensureColumn = async (tableName, columnName, definition) => {
      const [columns] = await db.query(
        'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [tableName, columnName]
      );
      if (columns.length === 0) await db.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
    };

    await ensureColumn('users', 'email', 'VARCHAR(255) NULL UNIQUE');
    await ensureColumn('users', 'email_verified_at', 'DATETIME NULL');
    await ensureColumn('mata_kuliah', 'ruangan', 'VARCHAR(100) NULL');
    for (const sql of migrations) await db.query(sql);
    console.log('Migrasi database selesai.');
  } catch (error) {
    console.error('Migrasi database gagal:', error.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

run();
