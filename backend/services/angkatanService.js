const angkatanRepository = require('../repositories/angkatanRepository');

class AngkatanService {
  async getAll() {
    return await angkatanRepository.findAll();
  }
  async create(nama_angkatan) {
    try {
      await angkatanRepository.create(nama_angkatan);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const error = new Error("Nama kategori tersebut sudah ada!");
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }
  async update(id, nama_angkatan) {
    try {
      const updated = await angkatanRepository.update(id, nama_angkatan);
      if (!updated) {
        const err = new Error("Data tidak ditemukan.");
        err.statusCode = 404;
        throw err;
      }
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const error = new Error("Nama kategori tersebut sudah ada!");
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }
  async delete(id) {
    try {
      await angkatanRepository.delete(id);
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        const error = new Error("Gagal! Kategori ini sedang digunakan oleh mahasiswa atau mata kuliah.");
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }
}
module.exports = new AngkatanService();
