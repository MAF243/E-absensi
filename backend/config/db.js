const mysql = require('mysql2');
require('dotenv').config({ quiet: true });

const isProduction = process.env.NODE_ENV === 'production';
const connectionConfig = {
  host: process.env.DB_HOST || '',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'e_absensi_stikom',
  port: Number(process.env.DB_PORT || 3306),
};

if (!isProduction && !process.env.DB_USER) {
  console.warn('DB_USER tidak ditemukan; memakai konfigurasi Laragon lokal (root tanpa password).');
}

const pool = mysql.createPool({
  ...connectionConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

// Repositories can be imported by unit tests without opening a connection.
// The application entry point explicitly calls this before serving requests.
db.verifyConnection = async () => {
  const connection = await db.getConnection();
  connection.release();
};

module.exports = db;
