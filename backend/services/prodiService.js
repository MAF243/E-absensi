const prodiRepository = require('../repositories/prodiRepository');

class ProdiService {
  async getAll(includeInactive = false) {
    return prodiRepository.findAll(includeInactive);
  }

  async create(data) {
    const namaProdi = String(data.nama_prodi || '').trim();
    if (!namaProdi) {
      const error = new Error('Nama prodi wajib diisi.');
      error.statusCode = 400;
      throw error;
    }
    try {
      return await prodiRepository.create({ nama_prodi: namaProdi, kode_prodi: data.kode_prodi });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        error.statusCode = 400;
        error.message = 'Nama atau kode prodi sudah digunakan.';
      }
      throw error;
    }
  }

  async update(id, data) {
    const namaProdi = String(data.nama_prodi || '').trim();
    if (!namaProdi) {
      const error = new Error('Nama prodi wajib diisi.');
      error.statusCode = 400;
      throw error;
    }
    try {
      const updated = await prodiRepository.update(id, { nama_prodi: namaProdi, kode_prodi: data.kode_prodi, aktif: data.aktif });
      if (!updated) {
        const error = new Error('Prodi tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        error.statusCode = 400;
        error.message = 'Nama atau kode prodi sudah digunakan.';
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const deleted = await prodiRepository.delete(id);
      if (!deleted) {
        const error = new Error('Prodi tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        error.statusCode = 400;
        error.message = 'Prodi masih digunakan oleh mahasiswa atau mata kuliah.';
      }
      throw error;
    }
  }
}

module.exports = new ProdiService();