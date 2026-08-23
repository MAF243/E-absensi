const knex = require('knex');
const knexConfig = require('../knexfile');

// Initialize DB connection using the development configuration
const db = knex(knexConfig.development);

async function testMigration() {
  try {
    console.log("Starting Migration Test...");
    
    // Check baseline: Verify connection works
    await db.raw('SELECT 1 as result');
    console.log("✅ Database connection successful.");

    // Run the migration
    console.log("Running knex.migrate.latest()...");
    const [batchNo, log] = await db.migrate.latest();
    if (log.length === 0) {
      console.log(`ℹ️ Migrations already up to date.`);
    } else {
      console.log(`✅ Batch ${batchNo} ran successfully: ${log.length} migrations`);
      console.log(log.join('\n'));
    }

    // Verify Data Integrity / Schema
    // We verify if the specific indexes exist using RAW queries for MySQL
    console.log("Verifying indexes...");
    const absensiIndexes = await db.raw("SHOW INDEX FROM absensi");
    const sesiIndexes = await db.raw("SHOW INDEX FROM sesi_kuliah");

    const hasMkIdIndex = absensiIndexes[0].some(idx => idx.Key_name === 'absensi_mk_id_index');
    const hasSesiMkIndex = sesiIndexes[0].some(idx => idx.Key_name === 'sesi_kuliah_mk_id_index');

    if (hasMkIdIndex && hasSesiMkIndex) {
      console.log("✅ Indexes successfully verified in the schema.");
    } else {
      console.error("❌ Indexes are missing after migration!");
    }

  } catch (error) {
    console.error("❌ Migration Test Failed:", error);
  } finally {
    await db.destroy();
    console.log("Migration Test Complete.");
  }
}

testMigration();
