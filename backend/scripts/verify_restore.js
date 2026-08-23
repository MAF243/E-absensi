const knex = require('knex');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// We connect specifically to the STAGING database we just restored
const stagingConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'e_absensi_stikom_staging'
  }
};

const db = knex(stagingConfig);

async function verifyRestore() {
  console.log("Starting Staging Database Integrity Verification...");

  try {
    // 1. Verify connection
    await db.raw('SELECT 1 as result');
    console.log("✅ Connected to staging database successfully.");

    // 2. Verify schema/tables exist
    const tables = await db.raw("SHOW TABLES");
    const tableNames = tables[0].map(t => Object.values(t)[0]);
    console.log(`Found tables: ${tableNames.join(', ')}`);
    
    // Adjusted based on actual schema: no dosen or mahasiswa or jadwal_kelas tables (they are combined in users or renamed)
    const requiredTables = ['absensi', 'kehadiran', 'mata_kuliah', 'peserta_kelas', 'sesi_kuliah', 'users'];
    const missingTables = requiredTables.filter(rt => !tableNames.includes(rt));

    if (missingTables.length > 0) {
      throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
    }
    console.log("✅ All required tables are present.");

    // 3. Verify data/row counts
    const usersCount = (await db('users').count('* as count'))[0].count;
    if (usersCount === 0) {
      throw new Error("Users table is empty.");
    }
    console.log(`✅ Users table verified (Count: ${usersCount}).`);

    // 4. Verify indexes from migration are still intact in the backup
    console.log("Verifying migration indexes in staging...");
    const absensiIndexes = await db.raw("SHOW INDEX FROM absensi");
    const hasMkIdIndex = absensiIndexes[0].some(idx => idx.Key_name === 'absensi_mk_id_index');
    
    if (!hasMkIdIndex) {
      throw new Error("Missing 'absensi_mk_id_index' from absensi table. Migration data was lost!");
    }
    console.log("✅ Migration indexes are intact in the restored database.");

    console.log("🎉 All validation checks passed. Restore is confirmed safe and structurally sound.");

  } catch (error) {
    console.error("❌ Verification Failed:", error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

verifyRestore();
