const rekapRepository = require('../repositories/rekapRepository');

class RekapService {
  async getRekapMahasiswa(query) {
    const { angkatan_id, jurusan, prodi_id, start_date, end_date } = query;
    const mahasiswa = await rekapRepository.getMahasiswaFiltered(angkatan_id, jurusan, prodi_id);
    if (mahasiswa.length === 0) return [];

    const mhsIds = mahasiswa.map(m => m.id);
    const sesiAktif = await rekapRepository.getTargetPertemuan(start_date, end_date);
    const targetPerMk = {};
    sesiAktif.forEach(s => targetPerMk[s.mk_id] = s.total_sesi_berjalan);

    const absensi = await rekapRepository.getAbsensiMahasiswa(mhsIds, start_date, end_date);
    const matkulMahasiswa = await rekapRepository.getMatkulByMahasiswa(mhsIds);

    const result = mahasiswa.map(mhs => {
       let recordAbsen = absensi.filter(a => a.user_id === mhs.id);
       let myMatkul = matkulMahasiswa.filter(m => m.user_id === mhs.id);
       
       let total_h = 0, total_i = 0, total_s = 0, total_a = 0;
       let matkulData = {};
       
       myMatkul.forEach(mk => {
           matkulData[mk.mk_id] = { nama_mk: mk.nama_mk, hadir: 0, izin: 0, sakit: 0, alpa: 0, target: targetPerMk[mk.mk_id] || 0 };
       });

       recordAbsen.forEach(ab => {
          if(!matkulData[ab.mk_id]) {
              matkulData[ab.mk_id] = { nama_mk: ab.nama_mk, hadir: 0, izin: 0, sakit: 0, alpa: 0, target: targetPerMk[ab.mk_id] || 0 };
          }
          
          if (ab.status === 'hadir') { matkulData[ab.mk_id].hadir += 1; }
          else if (ab.status === 'izin') { matkulData[ab.mk_id].izin += 1; }
          else if (ab.status === 'sakit') { matkulData[ab.mk_id].sakit += 1; }
          else if (ab.status === 'alpa') { matkulData[ab.mk_id].alpa += 1; }
       });

       let total_persen = 0;
       let count_mk = 0;
       let detail_matkul = Object.values(matkulData).map(mk => {
          let explicitly_recorded = mk.hadir + mk.izin + mk.sakit + mk.alpa;
          if (mk.target > explicitly_recorded) {
              mk.alpa += (mk.target - explicitly_recorded); // Implicit Alpa
          }

          total_h += mk.hadir;
          total_i += mk.izin;
          total_s += mk.sakit;
          total_a += mk.alpa;

          let persen = mk.target > 0 ? Math.round((mk.hadir / mk.target) * 100) : 0;
          total_persen += persen;
          count_mk++;
          return { nama_mk: mk.nama_mk, hadir: mk.hadir, target: mk.target, persen };
       });

       let akm = count_mk > 0 ? Math.round(total_persen / count_mk) : 0;
       return { ...mhs, total_h, total_i, total_s, total_a, detail_matkul, akm };
    });

    return result;
  }

  async getRekapDosen(query) {
    const { start_date, end_date } = query;
    return await rekapRepository.getRekapDosen(start_date, end_date);
  }
}
module.exports = new RekapService();
