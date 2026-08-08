const periodeRepository = require('../repositories/periodeRepository');

class PeriodeService {
  async getAll() {
    return await periodeRepository.findAll();
  }
  async getActive() {
    return await periodeRepository.getActive();
  }
  async create(data) {
    if (data.status === 'aktif') {
      await periodeRepository.setSemuaTidakAktif();
    }
    return await periodeRepository.create(data);
  }
  async update(id, data) {
    if (data.status === 'aktif') {
      await periodeRepository.setSemuaTidakAktif();
    }
    const updated = await periodeRepository.update(id, data);
    if (!updated) {
      const err = new Error("Data tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }
  }
  async delete(id) {
    try {
      await periodeRepository.delete(id);
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        const error = new Error("Gagal! Periode ini sedang digunakan oleh Mata Kuliah.");
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }
}

module.exports = new PeriodeService();
