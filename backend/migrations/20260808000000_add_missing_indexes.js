/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Add missing indexes
  await knex.schema.alterTable('absensi', (table) => {
    table.index('user_id');
    table.index('mk_id');
    table.index('sesi_id');
  });

  await knex.schema.alterTable('kehadiran', (table) => {
    table.index('mahasiswa_id');
    table.index('sesi_id');
  });

  await knex.schema.alterTable('peserta_kelas', (table) => {
    table.index('mk_id');
    table.index('mahasiswa_id');
  });

  await knex.schema.alterTable('sesi_kuliah', (table) => {
    table.index('mk_id');
    table.index('dosen_id');
  });

  await knex.schema.alterTable('mata_kuliah', (table) => {
    table.index('dosen_id');
    table.index('angkatan_id');
    table.index('periode_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('absensi', (table) => {
    table.dropIndex('user_id');
    table.dropIndex('mk_id');
    table.dropIndex('sesi_id');
  });

  await knex.schema.alterTable('kehadiran', (table) => {
    table.dropIndex('mahasiswa_id');
    table.dropIndex('sesi_id');
  });

  await knex.schema.alterTable('peserta_kelas', (table) => {
    table.dropIndex('mk_id');
    table.dropIndex('mahasiswa_id');
  });

  await knex.schema.alterTable('sesi_kuliah', (table) => {
    table.dropIndex('mk_id');
    table.dropIndex('dosen_id');
  });

  await knex.schema.alterTable('mata_kuliah', (table) => {
    table.dropIndex('dosen_id');
    table.dropIndex('angkatan_id');
    table.dropIndex('periode_id');
  });
};
