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
    const matkul = await matkulRepository.getMatkulDetail(id);
    if (!matkul) {
      const error = new Error('Mata kuliah tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const payload = {
      ...data,
      jenis_kelas: data.jenis_kelas === 'kelompok' ? 'kelompok' : 'paket',
      kelas_id: data.kelas_id || null,
      jurusan: data.jurusan ? String(data.jurusan).trim().toUpperCase() : null
    };

    if (payload.jenis_kelas === 'kelompok' && !payload.kelas_id) {
      const error = new Error('Kelas kelompok wajib dipilih.');
      error.statusCode = 400;
      throw error;
    }
    if (payload.jenis_kelas === 'kelompok' && !(await matkulRepository.getKelas(payload.kelas_id))) {
      const error = new Error('Kelas kelompok tidak ditemukan.');
      error.statusCode = 400;
      throw error;
    }
    if (payload.jenis_kelas === 'paket' && !payload.jurusan) {
      const error = new Error('Jurusan wajib dipilih.');
      error.statusCode = 400;
      throw error;
    }
    await matkulRepository.assignMatkul(id, payload);
  }

  async getPesertaDetail(id) {
    const mk = await matkulRepository.getMatkulDetail(id);
    if (!mk) {
      const err = new Error("Mata kuliah tidak ditemukan");
      err.statusCode = 404;
      throw err;
    }
    
    let mahasiswa = [];
    if (mk.kelas_id) {
      mahasiswa = await matkulRepository.getPesertaKelas(mk.kelas_id);
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
