-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 16, 2026 at 04:17 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `e_absensi_stikom`
--

-- --------------------------------------------------------

--
-- Table structure for table `absensi`
--

CREATE TABLE `absensi` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `mk_id` int NOT NULL,
  `sesi_id` int DEFAULT NULL,
  `tanggal` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('hadir','sakit','izin','alpa') DEFAULT 'hadir',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `angkatan`
--

CREATE TABLE `angkatan` (
  `id` int NOT NULL,
  `nama_angkatan` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `angkatan`
--

INSERT INTO `angkatan` (`id`, `nama_angkatan`) VALUES
(2, 'INFORMATIKA 6'),
(3, 'INFORMATIKA 7'),
(4, 'INFORMATIKA 8'),
(1, 'INROMATIKA 5');

-- --------------------------------------------------------

--
-- Table structure for table `kehadiran`
--

CREATE TABLE `kehadiran` (
  `id` int NOT NULL,
  `mahasiswa_id` int NOT NULL,
  `sesi_id` int NOT NULL,
  `waktu_scan` datetime NOT NULL,
  `status` enum('hadir','izin','sakit','alfa') DEFAULT 'hadir'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mata_kuliah`
--

CREATE TABLE `mata_kuliah` (
  `id` int NOT NULL,
  `kode_mk` varchar(50) NOT NULL,
  `nama_mk` varchar(150) NOT NULL,
  `jenis_kelas` enum('paket','kelompok') DEFAULT 'paket',
  `sks` int DEFAULT '2',
  `dosen_id` int DEFAULT NULL,
  `angkatan_id` int DEFAULT NULL,
  `jurusan` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `semester` enum('Ganjil','Genap') DEFAULT 'Ganjil',
  `hari` varchar(20) DEFAULT NULL,
  `jam_mulai` time DEFAULT NULL,
  `jam_selesai` time DEFAULT NULL,
  `target_pertemuan` int DEFAULT '16'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `mata_kuliah`
--

INSERT INTO `mata_kuliah` (`id`, `kode_mk`, `nama_mk`, `jenis_kelas`, `sks`, `dosen_id`, `angkatan_id`, `jurusan`, `created_at`, `semester`, `hari`, `jam_mulai`, `jam_selesai`, `target_pertemuan`) VALUES
(1, '-', 'Sistem Oprasi Jaringan', 'paket', 2, 2, 1, 'INFORMATIKA', '2026-07-12 07:04:01', 'Ganjil', 'Rabu', '17:18:00', '17:19:00', 16),
(2, 'TIF101', 'Algoritma Pemrograman', 'paket', 3, 60, 4, 'INFORMATIKA', '2026-07-12 07:34:16', 'Genap', 'Rabu', '18:46:00', '18:48:00', 16),
(3, 'ADM202', 'Pengantar Bisnis', 'kelompok', 2, 60, NULL, 'ITK', '2026-07-12 07:34:16', 'Genap', 'Kamis', '23:11:00', '23:12:00', 16);

-- --------------------------------------------------------

--
-- Table structure for table `peserta_kelas`
--

CREATE TABLE `peserta_kelas` (
  `id` int NOT NULL,
  `mk_id` int NOT NULL,
  `mahasiswa_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `peserta_kelas`
--

INSERT INTO `peserta_kelas` (`id`, `mk_id`, `mahasiswa_id`, `created_at`) VALUES
(157, 3, 38, '2026-07-14 23:08:24'),
(158, 3, 39, '2026-07-14 23:08:24'),
(159, 3, 40, '2026-07-14 23:08:24'),
(160, 3, 41, '2026-07-14 23:08:24'),
(161, 3, 42, '2026-07-14 23:08:24'),
(162, 3, 56, '2026-07-14 23:08:24'),
(163, 3, 57, '2026-07-14 23:08:24'),
(164, 3, 58, '2026-07-14 23:08:24'),
(165, 3, 26, '2026-07-14 23:08:24'),
(166, 3, 27, '2026-07-14 23:08:24'),
(167, 3, 28, '2026-07-14 23:08:24'),
(168, 3, 29, '2026-07-14 23:08:24'),
(169, 3, 30, '2026-07-14 23:08:24'),
(170, 3, 31, '2026-07-14 23:08:24'),
(171, 3, 32, '2026-07-14 23:08:24'),
(172, 3, 33, '2026-07-14 23:08:24'),
(173, 3, 34, '2026-07-14 23:08:24'),
(174, 3, 35, '2026-07-14 23:08:24'),
(175, 3, 36, '2026-07-14 23:08:24'),
(176, 3, 37, '2026-07-14 23:08:24'),
(177, 3, 52, '2026-07-14 23:08:24'),
(178, 3, 53, '2026-07-14 23:08:24'),
(179, 3, 54, '2026-07-14 23:08:24'),
(180, 3, 59, '2026-07-14 23:08:24'),
(181, 3, 55, '2026-07-14 23:08:24');

-- --------------------------------------------------------

--
-- Table structure for table `sesi_kuliah`
--

CREATE TABLE `sesi_kuliah` (
  `id` int NOT NULL,
  `mk_id` int NOT NULL,
  `dosen_id` int DEFAULT NULL,
  `tipe` enum('offline','online') DEFAULT 'offline',
  `link_meet` varchar(255) DEFAULT NULL,
  `status` enum('berlangsung','selesai') DEFAULT 'berlangsung',
  `waktu_mulai` datetime DEFAULT CURRENT_TIMESTAMP,
  `waktu_selesai` datetime DEFAULT NULL,
  `agenda` text,
  `jenis_sesi` varchar(50) DEFAULT 'Reguler',
  `bobot` int DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sesi_kuliah`
--

INSERT INTO `sesi_kuliah` (`id`, `mk_id`, `dosen_id`, `tipe`, `link_meet`, `status`, `waktu_mulai`, `waktu_selesai`, `agenda`, `jenis_sesi`, `bobot`) VALUES
(10, 3, 60, 'offline', NULL, 'selesai', '2026-07-16 23:11:55', '2026-07-16 23:12:09', 'Sesi dibuka darurat oleh Admin', 'Reguler', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nomor_induk` varchar(50) NOT NULL,
  `nama_lengkap` varchar(150) NOT NULL,
  `inisial` varchar(10) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','dosen','mahasiswa') NOT NULL,
  `status_akademik` enum('aktif','cuti','tidak aktif') DEFAULT 'aktif',
  `jenis_kelamin` enum('L','P') DEFAULT NULL,
  `jurusan` varchar(100) DEFAULT NULL,
  `angkatan_id` int DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nomor_induk`, `nama_lengkap`, `inisial`, `password`, `role`, `status_akademik`, `jenis_kelamin`, `jurusan`, `angkatan_id`, `last_login`, `created_at`) VALUES
(1, 'admin', 'Administrator Akademik', NULL, '$2b$10$Zm4zW8luuH7kObJjCzL1C.RhmO0HUl7AubYfX2NvEVLgtSThJ83AS', 'admin', 'aktif', NULL, NULL, NULL, '2026-07-14 23:33:33', '2026-07-05 04:17:12'),
(2, 'VIC', 'Victor Ilyas Sugara, S.Kom., M.Kom', NULL, '$2b$10$N3oww4Wa1P1mDcKMf0wtqeeByoS3aVawPb6eA9csGhVm06HRxeId6', 'dosen', 'aktif', 'L', NULL, NULL, '2026-07-13 21:38:52', '2026-07-05 04:58:27'),
(16, '2511080013', 'Fikri Nur Fauzi Al-Ghifari', NULL, '$2b$10$1FqMMqtb1jhCIOxmD5zTSuSaWiYTBFXxIFl0vF/h/VSSfwiA5k.8.', 'mahasiswa', 'aktif', 'L', 'ADM', 4, NULL, '2026-07-11 08:32:04'),
(17, '2511080028', 'Virgi Alpiansyah', NULL, '$2b$10$LCc9iEbhY53QpEwPDozEV.ABgx/0h73RdCAf5fTNQjHbP59hQKZpS', 'mahasiswa', 'aktif', 'L', 'ADM', 4, NULL, '2026-07-11 08:32:04'),
(18, '2511080062', 'Muhammad Nadhif Bustomi', NULL, '$2b$10$GsDYrr22LMD/dVhT3ytGGe4CujkCCFfvqukUHHeYlWrDsL4TcnUe6', 'mahasiswa', 'aktif', 'L', 'ADM', 4, NULL, '2026-07-11 08:32:04'),
(19, '2511080037', 'Muhamad Sulaeman Alba Bili', NULL, '$2b$10$YYiTtV4n51NtciID1tyZcO8i.4QkVT.RbRTzzSnY8cJQApMnYfXr2', 'mahasiswa', 'aktif', 'L', 'ADM', 4, NULL, '2026-07-11 08:32:04'),
(20, '2511080002', 'Abdul Muiz Al Faruq', NULL, '$2b$10$tGEQg2HVMF/didNqYuiIHuy6.k96qDhRcAWMqPgzw0SgSpBfXyFuq', 'mahasiswa', 'aktif', 'L', 'APQ', 4, NULL, '2026-07-11 08:32:04'),
(21, '2511080005', 'Haiba Zaidan Taufiqulhakim', NULL, '$2b$10$f3xx7rlmZ6Z75D8pEy8GJ.HSl.cgXVeFumNPV5Abo82.wLWfF113.', 'mahasiswa', 'aktif', 'L', 'APQ', 4, NULL, '2026-07-11 08:32:04'),
(22, '2511080006', 'Shalman Maulana Cahel', NULL, '$2b$10$IcaPbXm8BkcHlX8pQ8Bbce8IyBbPfTlDvWQ3x2yw6THmZnBSib9vC', 'mahasiswa', 'aktif', 'L', 'APQ', 4, NULL, '2026-07-11 08:32:04'),
(23, '2511080012', 'Parhan', NULL, '$2b$10$XAJJXck25ezhuSICkbQdZO3VKycsQ1YZOvA0VEc41qN0qAJ3PkWb6', 'mahasiswa', 'aktif', 'L', 'APQ', 4, NULL, '2026-07-11 08:32:04'),
(24, '2511080030', 'Tazakka Putra Nur Rosady', NULL, '$2b$10$TPlB.vRr7C9RTcrBqy.nHuV3tJ/J.hU9ZlGI6BiAEEH0jKqiTigBK', 'mahasiswa', 'aktif', 'L', 'APQ', 4, NULL, '2026-07-11 08:32:04'),
(25, '2511080033', 'Khalil Al-Khairy Abdul Hakim', NULL, '$2b$10$LSYbNVrmD5hrUc/8KGEpjun8j1Lbc1uRlIQWejtDga/WbQQet9Jau', 'mahasiswa', 'aktif', 'L', 'APQ', 4, NULL, '2026-07-11 08:32:04'),
(26, '2511080003', 'Nazhan Fathurrahman', NULL, '$2b$10$tAWxiJv1HvjlbWYdWe0NE.c/JPiCEGkVvbaweSV5TZ6fUNrp2zZyy', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(27, '2511080010', 'Muzaid Fathur Rahman', NULL, '$2b$10$AB9B3Xu/ovUcvpwv8siRL.oKerwQiD7OyC4tsKSqQCiJOggp33Fcy', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(28, '2511080014', 'M.Naufal Rabbani', NULL, '$2b$10$rVHgyqjcT1mePcFPxoUMBuUYxAEreKxJnyPGP43MLr.R.Ya5.KKDy', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(29, '2511080017', 'Rehan Pebriansah', NULL, '$2b$10$pD9.VmoVm2XrD5Ph9NmuMumKSQBkTIgEG7CMrxUukj3Lez7PytVqS', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(30, '2511080019', 'Fajri Rahmattulloh', NULL, '$2b$10$arkZfx5X8ykG4iEvvd.iRe4t4AUkScfjOYnclDZ8ojFNU1LTl9B8O', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(31, '2511080023', 'Muhamad Evryandi Irawan', NULL, '$2b$10$6DgIaDKQK1zPmBNv5nake.D/GG2MmgnsmiQa0RWkD/l7M/oe3MFeG', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(32, '2511080024', 'Muhammad Dzaki Aufa Nahyan', NULL, '$2b$10$/P419jOTumv3RNwVpLXsuOQlCkDwSh67K9A7iuZSQsqHvr.7i0Xb.', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(33, '2511080025', 'Muhammad Akmal Jamaludin', NULL, '$2b$10$2Wk4nMY/4ReUGijI5dI0R.aIDdb2hlbG9c3lPqCyumHkKoQULcR.e', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(34, '2511080029', 'Fazrul Rohman', NULL, '$2b$10$4QROmCIN6XdS6YLO2TVfheoZyWGyfVN/YX0eAnpakokNQPli90N16', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(35, '2511080031', 'M. Hafidz Abdurrahman Khalid', NULL, '$2b$10$Tq5j.7yUbi/K.audTR6yXeKGgQhHZORra6ZP9WDamLUlsyOkTEQ5O', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(36, '2511080038', 'Muhammad Rama Idznillah Firmansyah', NULL, '$2b$10$TCIRGf/U8UfqiyyoFDElVekgaolyeCMF1onmDXwT/TooCsZGOFZD.', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(37, '2511080020', 'Mohammad Haiqal Fikrullah', NULL, '$2b$10$POzpozaw1/30r6pjpuisv.FsmwsDWsBH4Jpmm0bxWwcvOh.VoUITK', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(38, '2511080008', 'Muhammad Danish Naufal As-Syauqi', NULL, '$2b$10$wc.IloaFLJcu5bBzXd8vauYnvWHPvvzgUWp/rjMr.1oUgYIIKUqoS', 'mahasiswa', 'aktif', 'L', 'KDG', 4, NULL, '2026-07-11 08:32:04'),
(39, '2511080021', 'Muhammad Naufal Sirojuddin', NULL, '$2b$10$FjBmNe3Mr7hRlKn2trsQcu3D0c8yj2WesD0vOF86QugUNlnTHdrkK', 'mahasiswa', 'aktif', 'L', 'KDG', 4, NULL, '2026-07-11 08:32:04'),
(40, '2511080022', 'Linggar Panggugah Mulyadi', NULL, '$2b$10$IMVC9BXOEShKm7kgNH4lBuFoMoArKrkzvXpRnCVtK6V8aCoNJ2bHm', 'mahasiswa', 'aktif', 'L', 'KDG', 4, NULL, '2026-07-11 08:32:04'),
(41, '2511080034', 'Iksan Hadi', NULL, '$2b$10$PZnBWbcn7N6ez.VFRJfS8.jbxz5EbubGl7EH2QJ6yKrCqgS1Crmge', 'mahasiswa', 'aktif', 'L', 'KDG', 4, NULL, '2026-07-11 08:32:04'),
(42, '2511080036', 'Yolanda Damara', NULL, '$2b$10$0do1phZdVUWfrhqgsffZaeGUO0PdnvVo7XeLNArzKV/EoLXaunCuy', 'mahasiswa', 'aktif', 'L', 'KDG', 4, NULL, '2026-07-11 08:32:04'),
(43, '2511080041', 'Mudrikah', NULL, '$2b$10$PiffTXmzgLSAGYil1Bz98.z4hOzuBg8M7Xt/RU.BRh0refZD3dkXK', 'mahasiswa', 'aktif', 'P', 'ADM', 4, NULL, '2026-07-11 08:32:04'),
(44, '2511080046', 'Haafizhotus Salsabiila', NULL, '$2b$10$an2/K0KZHtOZsnfmSQ04seab5Pt23d.xO6zDbsJkfJiQaVnLkxnD.', 'mahasiswa', 'aktif', 'P', 'ADM', 4, NULL, '2026-07-11 08:32:04'),
(45, '2511080057', 'Lathifah Dzikri Shafianti', NULL, '$2b$10$mrfqpUwjmfEO/fdIRDqUlOpCzyCFxGMY8XUsZSCt6WvHO5UB8gJ4e', 'mahasiswa', 'aktif', 'P', 'ADM', 4, NULL, '2026-07-11 08:32:04'),
(46, '2511080058', 'Linda Suhendar', NULL, '$2b$10$0ggCbKyN34gW4.ejyQ94/eH/k7CvvAApeykmXLJC/m5qdRWkgfdkC', 'mahasiswa', 'aktif', 'P', 'ADM', 4, NULL, '2026-07-11 08:32:04'),
(47, '2511080070', 'Mauldi Syah Rein', NULL, '$2b$10$opp6XUt98F3tq6ZucmCjXeM1X6mPq5LcJNcColCaIDM.chqGyvWrC', 'mahasiswa', 'aktif', 'P', 'ADM', 4, NULL, '2026-07-11 08:32:04'),
(48, '2511080050', 'Risti Anggun Pratiwi', NULL, '$2b$10$uC7VjsnpdLctgNQQX3CpD.9Bm.RhLD/Ghqjgp5I6GtheQwQEt8qr6', 'mahasiswa', 'aktif', 'P', 'ADM', 4, NULL, '2026-07-11 08:32:04'),
(49, '2511080039', 'Aufa Islamiyah', NULL, '$2b$10$hMY9qLKwah1/C9vEVP7ZEu9mpujZPwgh7ymAyx3Wb4oOe8jqlJFvK', 'mahasiswa', 'aktif', 'P', 'APQ', 4, NULL, '2026-07-11 08:32:04'),
(50, '2511080059', 'Della Eka Nuraini', NULL, '$2b$10$LntRGVVXNvPmmN7xnp42SOggmseh7P0w3UCMA3Td9RpYziN2DO52C', 'mahasiswa', 'aktif', 'P', 'APQ', 4, NULL, '2026-07-11 08:32:04'),
(51, '2511080060', 'Salma Az Zahra', NULL, '$2b$10$Fpxy4nkdl6FYWfiirr0nsuOxPq2KT2B984Ft8ZYl0IvjsQwLqXREm', 'mahasiswa', 'aktif', 'P', 'APQ', 4, NULL, '2026-07-11 08:32:04'),
(52, '2511080040', 'Putri Leota Anabel', NULL, '$2b$10$OmAo9N.c74aD1lr1CEJRtuuC5g/4NLlo6yIaxG9rioyscg8wsmhR2', 'mahasiswa', 'aktif', 'P', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(53, '2511080042', 'Inas Samia Ashalina', NULL, '$2b$10$sa4mRdfZzIobx5WKyoESTewdv.2DRNCIOH92PQP4qh9bYDtZ5bPF6', 'mahasiswa', 'aktif', 'P', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(54, '2511080047', 'Ratu Agne Panggarena', NULL, '$2b$10$Je7HbhjtxQRmnVlV8joxqOxaMkXZQN.r3tcI2ey5cmuoKFBdwvugy', 'mahasiswa', 'aktif', 'P', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(55, '2511080051', 'Hani Nurma Ayu', NULL, '$2b$10$eC/PUO1Lp9WNiAZIX4tYFOgt1Ex4uJ1fpOGjkF/FOF4oTTRb5ipv2', 'mahasiswa', 'aktif', 'P', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(56, '2511080055', 'Mutamimah', NULL, '$2b$10$rCf35NdXB2ehE6QxBwjNNuIqBGvOTrUmD0phSfuFeWkhdMOzoq1P2', 'mahasiswa', 'aktif', 'P', 'KDG', 4, NULL, '2026-07-11 08:32:04'),
(57, '2511080056', 'Nurul Syarifa', NULL, '$2b$10$qJjPQQOuYU9jofqlj.0DtOcX5TfrYRypuELXrJ25pxQMj2T4GgHS.', 'mahasiswa', 'aktif', 'P', 'KDG', 4, NULL, '2026-07-11 08:32:04'),
(58, '2511080061', 'Moza Putri Nugraha', NULL, '$2b$10$b87U2HUs2tse4Nki2NYqZezDTgJtEzXRJ1.1EvqHUWjnwTlJSjrNO', 'mahasiswa', 'aktif', 'P', 'KDG', 4, NULL, '2026-07-11 08:32:04'),
(59, '2511080026', 'Adrian Hanafi', NULL, '$2b$10$xolj6FQ/9FXZ177tCuhcDODxwzEplb/o3XlOYHn0seX74N82vt8lK', 'mahasiswa', 'aktif', 'L', 'ITK', 4, NULL, '2026-07-11 08:32:04'),
(60, 'SHD', 'Suhendra Anjar Dinata, S.Kom., M.Kom', NULL, '$2b$10$pR.fZ8w3vy.4q7WtE7g0B.GwV/2kFFDMxfHrLe/VxsjDLrYQXax0S', 'dosen', 'aktif', 'L', NULL, NULL, '2026-07-14 23:34:45', '2026-07-11 08:39:39'),
(61, 'IKRO', 'Ikro, S.Kom', NULL, '$2b$10$pe1hXSQ3rOogGCrrtNWM7O0ovITjDXFXhkAZXxPTPr300stSi8lHG', 'dosen', 'tidak aktif', 'L', NULL, NULL, '2026-07-11 17:11:14', '2026-07-11 08:39:39'),
(62, '2211010019', 'Muhammad Abdan Aliman', NULL, '$2b$10$CUyaTUGPkCAkxF1w/Uyfw.GWJLXBVdoFwIEwynVhSt6Ui7UFekccK', 'mahasiswa', 'aktif', 'L', 'Informatika', 1, '2026-07-16 23:16:08', '2026-07-14 11:58:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `absensi`
--
ALTER TABLE `absensi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `mk_id` (`mk_id`);

--
-- Indexes for table `angkatan`
--
ALTER TABLE `angkatan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama_angkatan` (`nama_angkatan`);

--
-- Indexes for table `kehadiran`
--
ALTER TABLE `kehadiran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mahasiswa_id` (`mahasiswa_id`),
  ADD KEY `sesi_id` (`sesi_id`);

--
-- Indexes for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_mk` (`kode_mk`),
  ADD KEY `dosen_id` (`dosen_id`),
  ADD KEY `angkatan_id` (`angkatan_id`);

--
-- Indexes for table `peserta_kelas`
--
ALTER TABLE `peserta_kelas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mk_id` (`mk_id`),
  ADD KEY `mahasiswa_id` (`mahasiswa_id`);

--
-- Indexes for table `sesi_kuliah`
--
ALTER TABLE `sesi_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mk_id` (`mk_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nomor_induk` (`nomor_induk`),
  ADD KEY `angkatan_id` (`angkatan_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `absensi`
--
ALTER TABLE `absensi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `angkatan`
--
ALTER TABLE `angkatan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `kehadiran`
--
ALTER TABLE `kehadiran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `peserta_kelas`
--
ALTER TABLE `peserta_kelas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=192;

--
-- AUTO_INCREMENT for table `sesi_kuliah`
--
ALTER TABLE `sesi_kuliah`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `absensi`
--
ALTER TABLE `absensi`
  ADD CONSTRAINT `absensi_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `absensi_ibfk_2` FOREIGN KEY (`mk_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kehadiran`
--
ALTER TABLE `kehadiran`
  ADD CONSTRAINT `kehadiran_ibfk_1` FOREIGN KEY (`mahasiswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kehadiran_ibfk_2` FOREIGN KEY (`sesi_id`) REFERENCES `sesi_kuliah` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD CONSTRAINT `mata_kuliah_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `mata_kuliah_ibfk_2` FOREIGN KEY (`angkatan_id`) REFERENCES `angkatan` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `peserta_kelas`
--
ALTER TABLE `peserta_kelas`
  ADD CONSTRAINT `peserta_kelas_ibfk_1` FOREIGN KEY (`mk_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `peserta_kelas_ibfk_2` FOREIGN KEY (`mahasiswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sesi_kuliah`
--
ALTER TABLE `sesi_kuliah`
  ADD CONSTRAINT `sesi_kuliah_ibfk_1` FOREIGN KEY (`mk_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`angkatan_id`) REFERENCES `angkatan` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
