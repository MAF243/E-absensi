/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  return knex.raw(`
CREATE TABLE IF NOT EXISTS \`absensi\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`user_id\` int NOT NULL,
  \`mk_id\` int NOT NULL,
  \`sesi_id\` int DEFAULT NULL,
  \`tanggal\` datetime DEFAULT CURRENT_TIMESTAMP,
  \`status\` enum('hadir','sakit','izin','alpa') DEFAULT 'hadir',
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`user_id\` (\`user_id\`),
  KEY \`mk_id\` (\`mk_id\`),
  CONSTRAINT \`absensi_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`absensi_ibfk_2\` FOREIGN KEY (\`mk_id\`) REFERENCES \`mata_kuliah\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\nCREATE TABLE IF NOT EXISTS \`angkatan\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`nama_angkatan\` varchar(50) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`nama_angkatan\` (\`nama_angkatan\`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\nCREATE TABLE IF NOT EXISTS \`grup_mahasiswa\` (
  \`mahasiswa_id\` int NOT NULL,
  \`angkatan_id\` int NOT NULL,
  PRIMARY KEY (\`mahasiswa_id\`,\`angkatan_id\`),
  KEY \`fk_grup_mahasiswa_angkatan\` (\`angkatan_id\`),
  CONSTRAINT \`fk_grup_mahasiswa_angkatan\` FOREIGN KEY (\`angkatan_id\`) REFERENCES \`angkatan\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_grup_mahasiswa_user\` FOREIGN KEY (\`mahasiswa_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\nCREATE TABLE IF NOT EXISTS \`kehadiran\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`mahasiswa_id\` int NOT NULL,
  \`sesi_id\` int NOT NULL,
  \`waktu_scan\` datetime NOT NULL,
  \`status\` enum('hadir','izin','sakit','alfa') DEFAULT 'hadir',
  PRIMARY KEY (\`id\`),
  KEY \`mahasiswa_id\` (\`mahasiswa_id\`),
  KEY \`sesi_id\` (\`sesi_id\`),
  CONSTRAINT \`kehadiran_ibfk_1\` FOREIGN KEY (\`mahasiswa_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`kehadiran_ibfk_2\` FOREIGN KEY (\`sesi_id\`) REFERENCES \`sesi_kuliah\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\nCREATE TABLE IF NOT EXISTS \`mata_kuliah\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`kode_mk\` varchar(50) NOT NULL,
  \`nama_mk\` varchar(150) NOT NULL,
  \`jenis_kelas\` enum('paket','kelompok') DEFAULT 'paket',
  \`sks\` int DEFAULT '2',
  \`dosen_id\` int DEFAULT NULL,
  \`angkatan_id\` int DEFAULT NULL,
  \`jurusan\` varchar(100) DEFAULT NULL,
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`semester\` enum('Ganjil','Genap') DEFAULT 'Ganjil',
  \`hari\` varchar(20) DEFAULT NULL,
  \`jam_mulai\` time DEFAULT NULL,
  \`jam_selesai\` time DEFAULT NULL,
  \`target_pertemuan\` int DEFAULT '16',
  \`ruangan\` varchar(255) DEFAULT NULL,
  \`periode_id\` int DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`kode_mk\` (\`kode_mk\`),
  KEY \`dosen_id\` (\`dosen_id\`),
  KEY \`angkatan_id\` (\`angkatan_id\`),
  CONSTRAINT \`mata_kuliah_ibfk_1\` FOREIGN KEY (\`dosen_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`mata_kuliah_ibfk_2\` FOREIGN KEY (\`angkatan_id\`) REFERENCES \`angkatan\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\nCREATE TABLE IF NOT EXISTS \`periode_akademik\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`nama_periode\` varchar(255) NOT NULL,
  \`status\` enum('aktif','tidak aktif') DEFAULT 'tidak aktif',
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\nCREATE TABLE IF NOT EXISTS \`peserta_kelas\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`mk_id\` int NOT NULL,
  \`mahasiswa_id\` int NOT NULL,
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`mk_id\` (\`mk_id\`),
  KEY \`mahasiswa_id\` (\`mahasiswa_id\`),
  CONSTRAINT \`peserta_kelas_ibfk_1\` FOREIGN KEY (\`mk_id\`) REFERENCES \`mata_kuliah\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`peserta_kelas_ibfk_2\` FOREIGN KEY (\`mahasiswa_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=192 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\nCREATE TABLE IF NOT EXISTS \`sesi_kuliah\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`mk_id\` int NOT NULL,
  \`dosen_id\` int DEFAULT NULL,
  \`tipe\` enum('offline','online') DEFAULT 'offline',
  \`link_meet\` varchar(255) DEFAULT NULL,
  \`status\` enum('berlangsung','selesai') DEFAULT 'berlangsung',
  \`waktu_mulai\` datetime DEFAULT CURRENT_TIMESTAMP,
  \`waktu_selesai\` datetime DEFAULT NULL,
  \`agenda\` text,
  \`jenis_sesi\` varchar(50) DEFAULT 'Reguler',
  \`bobot\` int DEFAULT '1',
  PRIMARY KEY (\`id\`),
  KEY \`mk_id\` (\`mk_id\`),
  CONSTRAINT \`sesi_kuliah_ibfk_1\` FOREIGN KEY (\`mk_id\`) REFERENCES \`mata_kuliah\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\nCREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`nomor_induk\` varchar(50) NOT NULL,
  \`nama_lengkap\` varchar(150) NOT NULL,
  \`inisial\` varchar(10) DEFAULT NULL,
  \`password\` varchar(255) NOT NULL,
  \`role\` enum('admin','dosen','mahasiswa') NOT NULL,
  \`status_akademik\` enum('aktif','cuti','tidak aktif') DEFAULT 'aktif',
  \`jenis_kelamin\` enum('L','P') DEFAULT NULL,
  \`jurusan\` varchar(100) DEFAULT NULL,
  \`angkatan_id\` int DEFAULT NULL,
  \`last_login\` datetime DEFAULT NULL,
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`nomor_induk\` (\`nomor_induk\`),
  KEY \`angkatan_id\` (\`angkatan_id\`),
  CONSTRAINT \`users_ibfk_1\` FOREIGN KEY (\`angkatan_id\`) REFERENCES \`angkatan\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  return knex.raw(`
DROP TABLE IF EXISTS \`absensi\`;\nDROP TABLE IF EXISTS \`angkatan\`;\nDROP TABLE IF EXISTS \`grup_mahasiswa\`;\nDROP TABLE IF EXISTS \`kehadiran\`;\nDROP TABLE IF EXISTS \`mata_kuliah\`;\nDROP TABLE IF EXISTS \`periode_akademik\`;\nDROP TABLE IF EXISTS \`peserta_kelas\`;\nDROP TABLE IF EXISTS \`sesi_kuliah\`;\nDROP TABLE IF EXISTS \`users\`;\n
  `);
};
