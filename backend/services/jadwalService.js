const jadwalRepository = require('../repositories/jadwalRepository');

class JadwalService {
  async getJadwal(actor) {
    await jadwalRepository.runCronJobs();
    return await jadwalRepository.getJadwal(actor?.role === 'dosen' ? actor.id : null);
  }

  async closeExpiredSessions() {
    await jadwalRepository.runCronJobs();
  }
  
  async updateJadwal(id, data) {
    if (!data.hari || !data.jam_mulai || !data.jam_selesai) {
      const err = new Error("Data waktu tidak lengkap!");
      err.statusCode = 400;
      throw err;
    }
    await jadwalRepository.updateJadwal(id, data);
  }

  async resetJadwal(id) {
    await jadwalRepository.resetJadwal(id);
  }

  async bukaSesi(data, actor) {
    const mk = await jadwalRepository.checkMk(data.mk_id);
    if (!mk) {
      const err = new Error("Mata kuliah tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }
    if (actor?.role === 'dosen' && Number(mk.dosen_id) !== Number(actor.id)) {
      const err = new Error('Anda tidak ditugaskan untuk mata kuliah ini.');
      err.statusCode = 403;
      throw err;
    }
    if (!mk.hari || !mk.jam_mulai || !mk.jam_selesai) {
      const err = new Error("Akses Ditolak! Admin belum mengatur jadwal.");
      err.statusCode = 400;
      throw err;
    }
    
    if (!mk.hari_valid) {
      const err = new Error(`Sesi gagal dibuka. Jadwal kelas adalah hari ${mk.hari}, bukan ${mk.current_hari}.`);
      err.statusCode = 400;
      throw err;
    }

    if (!mk.waktu_valid) {
      const err = new Error(`Sesi gagal dibuka. Waktu saat ini (${mk.current_time_str}) berada di luar jadwal kelas (${mk.jam_mulai_str} - ${mk.jam_selesai_str}).`);
      err.statusCode = 400;
      throw err;
    }
    
    const isSesiActive = await jadwalRepository.checkActiveSesi(data.mk_id);
    if (isSesiActive) {
      const err = new Error("Sesi sudah berjalan.");
      err.statusCode = 400;
      throw err;
    }

    await jadwalRepository.bukaSesi({ ...data, dosen_id: actor?.role === 'dosen' ? actor.id : data.dosen_id });
  }

  async tutupSesi(sesi_id, actor) {
    const sesi = await jadwalRepository.getSesiInfo(sesi_id);
    if (!sesi) {
      const err = new Error('Sesi tidak ditemukan.');
      err.statusCode = 404;
      throw err;
    }
    if (actor?.role === 'dosen' && Number(sesi.dosen_id) !== Number(actor.id)) {
      const err = new Error('Anda tidak berwenang menutup sesi ini.');
      err.statusCode = 403;
      throw err;
    }
    await jadwalRepository.tutupSesi(sesi_id);
  }

  async batalkanSesiAtauHapus(sesi_id) {
    const hasPresence = await jadwalRepository.checkSesiPresence(sesi_id);
    if (hasPresence) {
      // Safe delete logic: Batalkan sesi jika sudah ada presensi
      await jadwalRepository.batalkanSesi(sesi_id);
      return "Sesi memiliki riwayat presensi. Sesi telah diubah statusnya menjadi CANCELLED.";
    } else {
      // Hapus permanen jika tidak ada riwayat presensi
      await jadwalRepository.deleteSesi(sesi_id);
      return "Sesi berhasil dihapus secara permanen karena belum ada riwayat presensi.";
    }
  }

  async getJadwalByMahasiswa(mahasiswa_id) {
    const data = await jadwalRepository.getJadwalByMahasiswa(mahasiswa_id);
    if (!data) {
      const err = new Error("Mahasiswa tidak ditemukan");
      err.statusCode = 404;
      throw err;
    }
    return data;
  }
}
module.exports = new JadwalService();
