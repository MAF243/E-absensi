const rekapService = require('../services/rekapService');
const rekapRepository = require('../repositories/rekapRepository');

jest.mock('../repositories/rekapRepository');

describe('RekapService - getRekapMahasiswa', () => {
  it('harus memproses AKM dengan benar (menghitung Alpa implisit)', async () => {
    // Mock Data
    const mockMahasiswa = [{ id: 1, nama_lengkap: 'Budi' }];
    const mockMatkul = [{ user_id: 1, mk_id: 101, nama_mk: 'Pemrograman Web' }];
    const mockTarget = [{ mk_id: 101, total_sesi_berjalan: 4 }];
    
    // Budi hanya hadir 1 kali dari total 4 sesi yang sudah berjalan.
    // Dosen TIDAK merekap 3 sesi lainnya, sehingga Budi tidak punya absen di tabel 'absensi' untuk 3 sesi itu.
    const mockAbsensi = [{ user_id: 1, mk_id: 101, status: 'hadir', nama_mk: 'Pemrograman Web' }];

    rekapRepository.getMahasiswaFiltered.mockResolvedValue(mockMahasiswa);
    rekapRepository.getMatkulByMahasiswa.mockResolvedValue(mockMatkul);
    rekapRepository.getTargetPertemuan.mockResolvedValue(mockTarget);
    rekapRepository.getAbsensiMahasiswa.mockResolvedValue(mockAbsensi);

    const result = await rekapService.getRekapMahasiswa({});
    
    expect(result.length).toBe(1);
    const budi = result[0];
    
    // Hadir 1, harusnya Alpa 3 karena target 4
    expect(budi.total_h).toBe(1);
    expect(budi.total_a).toBe(3); 
    
    // AKM = (1 / 4) * 100 = 25%
    expect(budi.akm).toBe(25);
  });
});
