const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'e_absensi_stikom';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_HOST = process.env.DB_HOST || '127.0.0.1';

const BACKUP_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `${DB_NAME}_${timestamp}.sql`);

// Construct command
// Using Laragon's mysqldump or standard mysqldump if available in path
const mysqldumpCmd = `C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysqldump.exe`;

let cmd = `"${mysqldumpCmd}" -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER}`;
if (DB_PASSWORD) {
  cmd += ` -p${DB_PASSWORD}`;
}
cmd += ` ${DB_NAME} > "${backupFile}"`;

console.log(`Starting backup for database: ${DB_NAME}`);

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log(`✅ Backup successfully created at: ${backupFile}`);
  
  // Verify backup file size
  const stats = fs.statSync(backupFile);
  console.log(`Backup size: ${(stats.size / 1024).toFixed(2)} KB`);
  
} catch (error) {
  console.error(`❌ Backup failed: ${error.message}`);
  process.exit(1);
}
