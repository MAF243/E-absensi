const absensiRepository = require('../repositories/absensiRepository');
const { hitungJarakMeters } = require('../utils/haversine');

class AbsensiService {
  async scanQR({ qr_code, latitude, longitude, mahasiswa_id }) {
    if (!qr_code || !latitude || !longitude || !mahasiswa_id) {
      const err = new Error("Data scan tidak lengkap! Pastikan GPS aktif.");
      err.statusCode = 400;
      throw err;
    }

    const KAMPUS_LAT = -6.5902172; 
    const KAMPUS_LON = 106.7854656; 
    const RADIUS_MAKSIMAL = 10;
    const jarak = hitungJarakMeters(KAMPUS_LAT, KAMPUS_LON, latitude, longitude);
    
    if (jarak > RADIUS_MAKSIMAL) {
      const err = new Error(`Gagal: Anda di luar jangkauan kampus. (Jarak: ${Math.round(jarak)}m)`);
      err.statusCode = 403;
      throw err;
    }
    
    if (!qr_code.startsWith('stikomabsen://sesi/MATKUL-')) {
      const err = new Error("QR Code ini tidak valid!");
      err.statusCode = 400;
      throw err;
    }

    const cleanStr = qr_code.replace('stikomabsen://sesi/', ''); 
    const qrParts = cleanStr.split('-');
    const mk_id = qrParts[1];

    const sesi_id = await absensiRepository.getSesiAktif(mk_id);
    if (!sesi_id) {
      const err = new Error("Sesi kelas belum dibuka oleh Dosen.");
      err.statusCode = 400;
      throw err;
    }

    const isPeserta = await absensiRepository.cekKepesertaan(mahasiswa_id, mk_id);
    if (!isPeserta) {
      const err = new Error("Gagal: Anda bukan peserta dari mata kuliah ini.");
      err.statusCode = 403;
      throw err;
    }

    const sudahAbsen = await absensiRepository.cekAbsen(mahasiswa_id, sesi_id);
    if (sudahAbsen) {
      const err = new Error("Anda sudah tercatat HADIR pada sesi ini.");
      err.statusCode = 400;
      throw err;
    }

    await absensiRepository.catatKehadiran(mahasiswa_id, mk_id, sesi_id);
  }
  
  async getRiwayatDosen(dosen_id) {
    return await absensiRepository.getRiwayatDosen(dosen_id);
  }
  
  async getDetailRekapSesi(sesi_id) {
    const mk_id = await absensiRepository.getSesiMk(sesi_id);
    if (!mk_id) {
      const err = new Error("Sesi tidak ditemukan");
      err.statusCode = 404;
      throw err;
    }

    const mk = await absensiRepository.getMkInfo(mk_id);
    let mahasiswa = [];
    if (mk.jenis_kelas === 'paket') {
      mahasiswa = await absensiRepository.getMahasiswaPaket(mk.angkatan_id, mk_id);
    } else {
      mahasiswa = await absensiRepository.getMahasiswaLintas(mk_id);
    }

    const absensi = await absensiRepository.getAbsensiSesi(sesi_id);
    const absenMap = {};
    absensi.forEach(a => absenMap[a.user_id] = a.status);

    const result = mahasiswa.map(m => ({
      ...m,
      status_absen: absenMap[m.id] || 'alpa' 
    }));

    const ringkasan = result.reduce((summary, m) => {
      summary.total_peserta += 1;
      summary[m.status_absen] += 1;
      return summary;
    }, { total_peserta: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0 });

    return { data: result, mk_id, ringkasan };
  }
  
  async simpanRekapManual(sesi_id, mk_id, rekap_data) {
    await absensiRepository.simpanRekapManual(sesi_id, mk_id, rekap_data);
  }
}

module.exports = new AbsensiService();
