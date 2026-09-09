exports.up = async function up(knex) {
  await knex.schema.createTable('prodi', (table) => {
    table.increments('id').primary();
    table.string('nama_prodi', 150).notNullable().unique();
    table.string('kode_prodi', 30).nullable().unique();
    table.boolean('aktif').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex('prodi').insert({ nama_prodi: 'Informatika', kode_prodi: 'IF' });

  await knex.schema.alterTable('users', (table) => {
    table.integer('prodi_id').unsigned().nullable();
    table.foreign('prodi_id').references('id').inTable('prodi').onDelete('SET NULL');
    table.index('prodi_id');
  });

  await knex.schema.alterTable('mata_kuliah', (table) => {
    table.integer('prodi_id').unsigned().nullable();
    table.foreign('prodi_id').references('id').inTable('prodi').onDelete('SET NULL');
    table.index('prodi_id');
  });

  await knex('users').where('role', 'mahasiswa').update({ prodi_id: 1 });
  await knex('mata_kuliah').update({ prodi_id: 1 });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('mata_kuliah', (table) => {
    table.dropForeign(['prodi_id']);
    table.dropIndex(['prodi_id']);
    table.dropColumn('prodi_id');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropForeign(['prodi_id']);
    table.dropIndex(['prodi_id']);
    table.dropColumn('prodi_id');
  });

  await knex.schema.dropTableIfExists('prodi');
};