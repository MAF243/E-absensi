const AppError = require('../utils/AppError');
const userService = require('../services/userService');

const getAllMahasiswa = async (req, res, next) => {
  const data = await userService.getAll('mahasiswa');
    res.json({ success: true, data });
  
};

const getMahasiswaById = async (req, res, next) => {
  const data = await userService.getById(req.params.id, 'mahasiswa');
    res.json({ success: true, data });
  
};

const createMahasiswa = async (req, res, next) => {
  if (!req.body.nomor_induk || !req.body.nama_lengkap || !req.body.password) {
      throw new AppError("NIM, Nama, dan Password wajib diisi!", 400);
    }
    req.body.role = 'mahasiswa';
    await userService.create(req.body);
    res.json({ success: true, message: "Data mahasiswa berhasil ditambahkan!" });
  
};

const updateMahasiswa = async (req, res, next) => {
  if (!req.body.nomor_induk || !req.body.nama_lengkap) {
      throw new AppError("NIM dan Nama tidak boleh kosong!", 400);
    }
    req.body.role = 'mahasiswa';
    await userService.update(req.params.id, req.body);
    res.json({ success: true, message: "Data mahasiswa berhasil diperbarui!" });
  
};

const deleteMahasiswa = async (req, res, next) => {
  await userService.delete(req.params.id, 'mahasiswa');

    res.json({ success: true, message: "Data mahasiswa berhasil dihapus permanen!" });
  
};

const bulkCreateMahasiswa = async (req, res, next) => {
  if (!req.body.data || !req.body.data.length) {
      throw new AppError("Data CSV kosong.", 400);
    }
    await userService.bulkCreate(req.body.data, 'mahasiswa');
    res.json({ success: true, message: "Mahasiswa berhasil diimpor!" });
  
};

const bulkAssignAngkatan = async (req, res, next) => {
  if (!req.body.studentIds || !req.body.studentIds.length) {
      throw new AppError("Tidak ada mahasiswa yang dipilih.", 400);
    }
    const msg = await userService.assignAngkatan(req.body.studentIds, req.body.angkatan_id);
    res.json({ success: true, message: msg });
};

const bulkAssignKelas = async (req, res, next) => {
  if (!req.body.studentIds || !req.body.studentIds.length) {
      throw new AppError("Tidak ada mahasiswa yang dipilih.", 400);
    }
    const msg = await userService.assignKelas(req.body.studentIds, req.body.kelas_id);
    res.json({ success: true, message: msg });
  
};

const removeKelas = async (req, res, next) => {
  await userService.removeKelas(req.body.mahasiswa_id);
    res.json({ success: true, message: "Mahasiswa berhasil dikeluarkan dari kelas." });
  
};

const removeAngkatan = async (req, res, next) => {
  await userService.removeAngkatan(req.body.mahasiswa_id);
    res.json({ success: true, message: "Mahasiswa berhasil dikeluarkan dari angkatan." });
};

const bulkDeleteMahasiswa = async (req, res, next) => {
  if (!req.body.ids || !req.body.ids.length) throw new AppError("Pilih data yang dihapus.", 400);
    await userService.bulkDelete(req.body.ids, 'mahasiswa');
    res.json({ success: true, message: "Data mahasiswa berhasil dihapus permanen!" });
  
};

const bulkEditJurusan = async (req, res, next) => {
  if (!req.body.ids || !req.body.ids.length || !req.body.jurusan_baru) {
      throw new AppError("Pilih mahasiswa dan ketik jurusan baru.", 400);
    }
    const msg = await userService.editJurusan(req.body.ids, req.body.jurusan_baru);
    res.json({ success: true, message: msg });
  
};

module.exports = {
  getAllMahasiswa, getMahasiswaById, createMahasiswa, updateMahasiswa, deleteMahasiswa,
  bulkCreateMahasiswa, bulkAssignAngkatan, bulkAssignKelas, bulkDeleteMahasiswa, bulkEditJurusan, removeAngkatan, removeKelas
};