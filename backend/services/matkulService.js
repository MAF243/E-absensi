const matkulRepository = require('../repositories/matkulRepository');

class MatkulService {
  async getAll() {
    return await matkulRepository.findAll();
  }

  async create(data) {
    await matkulRepository.create(data);
  }

  async update(id, data) {
    await matkulRepository.update(id, data);
  }

  async delete(id) {
    try {
      await matkulRepository.delete(id);
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        const error = new Error("Gagal! Mata kuliah ini memiliki riwayat sesi atau absensi aktif.");
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }

  async bulkDelete(ids) {
    await matkulRepository.bulkDelete(ids);
  }

  async resetPenugasan(ids) {
    await matkulRepository.resetPenugasan(ids);
  }

  async assignMatkul(id, data) {
    await matkulRepository.assignMatkul(id, data);
  }

  async getPesertaDetail(id) {
    const mk = await matkulRepository.getMatkulDetail(id);
    if (!mk) {
      const err = new Error("Mata kuliah tidak ditemukan");
      err.statusCode = 404;
      throw err;
    }
    
    let mahasiswa = [];
    if (mk.jenis_kelas === 'paket') {
      mahasiswa = await matkulRepository.getPesertaPaket(mk.kelas_id || 0);
    } else {
      mahasiswa = await matkulRepository.getPesertaLintas(id);
    }
    
    return { data: mahasiswa, isPaket: mk.jenis_kelas === 'paket' };
  }

  async getPesertaIds(id) {
    return await matkulRepository.getPesertaIds(id);
  }

  async deletePeserta(mk_id, mhs_id) {
    await matkulRepository.deletePeserta(mk_id, mhs_id);
  }

  async bulkCreate(data) {
    await matkulRepository.bulkCreate(data);
  }
}

module.exports = new MatkulService();
