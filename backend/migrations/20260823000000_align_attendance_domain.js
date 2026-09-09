/**
 * Align legacy values with the domain glossary without removing historical
 * attendance data. `kehadiran` is retained as a legacy table; all application
 * reads and writes use `absensi`.
 */
exports.up = async function up(knex) {
  await knex.raw("ALTER TABLE users MODIFY COLUMN status_akademik VARCHAR(16) NOT NULL DEFAULT 'AKTIF'");
  await knex.raw(`
    UPDATE users
    SET status_akademik = CASE UPPER(TRIM(status_akademik))
      WHEN 'AKTIF' THEN 'AKTIF'
      WHEN 'CUTI' THEN 'CUTI'
      WHEN 'LULUS' THEN 'LULUS'
      WHEN 'RESIGN' THEN 'RESIGN'
      WHEN 'KELUAR' THEN 'KELUAR'
      WHEN 'TIDAK AKTIF' THEN 'KELUAR'
      ELSE 'KELUAR'
    END
  `);
  await knex.raw("ALTER TABLE users MODIFY COLUMN status_akademik ENUM('AKTIF', 'CUTI', 'LULUS', 'KELUAR', 'RESIGN') NOT NULL DEFAULT 'AKTIF'");

  await knex.raw("ALTER TABLE sesi_kuliah MODIFY COLUMN status VARCHAR(16) NOT NULL DEFAULT 'berlangsung'");
  await knex.raw(`
    UPDATE sesi_kuliah
    SET status = CASE UPPER(TRIM(status))
      WHEN 'BERLANGSUNG' THEN 'berlangsung'
      WHEN 'SELESAI' THEN 'selesai'
      WHEN 'CANCELLED' THEN 'CANCELLED'
      ELSE 'selesai'
    END
  `);
  await knex.raw("ALTER TABLE sesi_kuliah MODIFY COLUMN status ENUM('berlangsung', 'selesai', 'CANCELLED') NOT NULL DEFAULT 'berlangsung'");

  const hasUniqueAttendance = await knex.schema.hasColumn('absensi', 'sesi_id');
  if (hasUniqueAttendance) {
    const [indexes] = await knex.raw('SHOW INDEX FROM absensi');
    if (!indexes.some((index) => index.Key_name === 'absensi_user_sesi_unique')) {
      await knex.schema.alterTable('absensi', (table) => {
        table.unique(['user_id', 'sesi_id'], 'absensi_user_sesi_unique');
      });
    }
  }
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('absensi', (table) => {
    table.dropUnique(['user_id', 'sesi_id'], 'absensi_user_sesi_unique');
  });
  await knex.raw("ALTER TABLE sesi_kuliah MODIFY COLUMN status ENUM('berlangsung', 'selesai') NOT NULL DEFAULT 'berlangsung'");
  await knex.raw("ALTER TABLE users MODIFY COLUMN status_akademik VARCHAR(16) NOT NULL DEFAULT 'aktif'");
  await knex.raw(`
    UPDATE users
    SET status_akademik = CASE status_akademik
      WHEN 'AKTIF' THEN 'aktif'
      WHEN 'CUTI' THEN 'cuti'
      ELSE 'tidak aktif'
    END
  `);
  await knex.raw("ALTER TABLE users MODIFY COLUMN status_akademik ENUM('aktif', 'cuti', 'tidak aktif') NOT NULL DEFAULT 'aktif'");
};
