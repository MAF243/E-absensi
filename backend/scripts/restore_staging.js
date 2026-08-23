const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;
const STAGING_DB = 'e_absensi_stikom_staging';

const BACKUP_DIR = path.join(__dirname, 'backups');

async function restoreStaging() {
  console.log("Starting Staging Database Restore Process...");

  // 1. Find the latest backup file
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error("❌ Backup directory not found.");
    process.exit(1);
  }

  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.sql'));
  if (files.length === 0) {
    console.error("❌ No backup files found.");
    process.exit(1);
  }

  // Sort by name (which contains timestamp) descending
  files.sort((a, b) => b.localeCompare(a));
  const latestBackup = path.join(BACKUP_DIR, files[0]);
  console.log(`✅ Found backup: ${latestBackup}`);

  // 2. Create the staging database
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });
    
    console.log(`Dropping existing staging database if exists...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${STAGING_DB}\``);
    console.log(`Creating staging database: ${STAGING_DB}...`);
    await connection.query(`CREATE DATABASE \`${STAGING_DB}\``);
    console.log("✅ Staging database created.");
  } catch (err) {
    console.error("❌ Failed to create staging database:", err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }

  // 3. Execute restore using mysql command line
  // We use Laragon's mysql client
  const mysqlCmd = `C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysql.exe`;
  let cmd = `"${mysqlCmd}" -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER}`;
  if (DB_PASSWORD) {
    cmd += ` -p${DB_PASSWORD}`;
  }
  cmd += ` ${STAGING_DB} < "${latestBackup}"`;

  console.log(`Restoring backup into ${STAGING_DB}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log("✅ Database restore completed successfully!");
  } catch (error) {
    console.error("❌ Restore failed:", error.message);
    process.exit(1);
  }
}

restoreStaging();
