const db = require('./config/db');

async function fix() {
  const queries = [
    'ALTER TABLE mata_kuliah DROP FOREIGN KEY mata_kuliah_kelas_id_foreign',
    'ALTER TABLE mata_kuliah DROP COLUMN kelas_id',
    'ALTER TABLE users DROP FOREIGN KEY users_kelas_id_foreign',
    'ALTER TABLE users DROP COLUMN kelas_id',
    'DROP TABLE IF EXISTS kelas'
  ];

  for (const q of queries) {
    try {
      await db.query(q);
      console.log('Success:', q);
    } catch (err) {
      console.log('Ignored:', q, err.message);
    }
  }

  // Also remove the migration from knex_migrations table so it can be re-run
  try {
    await db.query("DELETE FROM knex_migrations WHERE name LIKE '%create_kelas_table.js'");
  } catch (err) {
    console.log(err.message);
  }

  process.exit();
}

fix();
