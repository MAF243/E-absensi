/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create kelas table
  await knex.schema.createTable('kelas', (table) => {
    table.increments('id').primary();
    table.string('nama_kelas', 100).notNullable();
    table.integer('angkatan_id').notNullable();
    table.foreign('angkatan_id').references('id').inTable('angkatan').onDelete('CASCADE');
  });

  // Add kelas_id to users
  await knex.schema.alterTable('users', (table) => {
    table.integer('kelas_id').unsigned().nullable();
    table.foreign('kelas_id').references('id').inTable('kelas').onDelete('SET NULL');
  });

  // Add kelas_id to mata_kuliah
  await knex.schema.alterTable('mata_kuliah', (table) => {
    table.integer('kelas_id').unsigned().nullable();
    table.foreign('kelas_id').references('id').inTable('kelas').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('mata_kuliah', (table) => {
    table.dropForeign(['kelas_id']);
    table.dropColumn('kelas_id');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropForeign(['kelas_id']);
    table.dropColumn('kelas_id');
  });

  await knex.schema.dropTableIfExists('kelas');
};
