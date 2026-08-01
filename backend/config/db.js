const mysql = require('mysql2');
require('dotenv').config(); // Membaca variabel dari file .env

// Membuat Connection Pool untuk efisiensi server
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Mengubah pool menjadi format Promise agar bisa menggunakan async/await nantinya
const db = pool.promise();

// Test koneksi saat server pertama kali menyala
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Gagal terhubung ke Database MySQL:', err.message);
  } else {
    console.log('✅ Berhasil terhubung ke Database MySQL (e_absensi_stikom)');
    connection.release();
  }
});

module.exports = db;