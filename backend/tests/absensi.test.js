const absensiService = require('../services/absensiService');
const absensiRepository = require('../repositories/absensiRepository');

jest.mock('../repositories/absensiRepository');

describe('AbsensiService - scanQR', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('harus error jika data scan tidak lengkap', async () => {
    await expect(absensiService.scanQR({ qr_code: '', latitude: null, longitude: null, mahasiswa_id: 1 }))
      .rejects.toThrow("Data scan tidak lengkap! Pastikan GPS aktif.");
  });

  it('harus error jika GPS berada di luar jangkauan radius 10m dari kampus', async () => {
    const mhs_lat = -6.5905000;
    const mhs_lon = 106.7850000; // Sekitar 30-40 meter
    
    await expect(absensiService.scanQR({ 
      qr_code: 'stikomabsen://sesi/MATKUL-1', 
      latitude: mhs_lat, 
      longitude: mhs_lon, 
      mahasiswa_id: 1 
    })).rejects.toThrow(/Gagal: Anda di luar jangkauan kampus/);
  });

  it('harus error jika format QR Code tidak valid', async () => {
    const KAMPUS_LAT = -6.5902172; 
    const KAMPUS_LON = 106.7854656; 

    await expect(absensiService.scanQR({ 
      qr_code: 'invalid_qr_code', 
      latitude: KAMPUS_LAT, 
      longitude: KAMPUS_LON, 
      mahasiswa_id: 1 
    })).rejects.toThrow("QR Code ini tidak valid!");
  });

  it('harus error jika sesi belum dibuka oleh dosen', async () => {
    const KAMPUS_LAT = -6.5902172; 
    const KAMPUS_LON = 106.7854656; 
    
    // Mock sesi tidak aktif
    absensiRepository.getSesiAktif.mockResolvedValue(null);

    await expect(absensiService.scanQR({ 
      qr_code: 'stikomabsen://sesi/MATKUL-101', 
      latitude: KAMPUS_LAT, 
      longitude: KAMPUS_LON, 
      mahasiswa_id: 1 
    })).rejects.toThrow("Sesi kelas belum dibuka oleh Dosen.");
  });

  it('harus mencatat kehadiran dengan sukses jika semua syarat terpenuhi', async () => {
    const KAMPUS_LAT = -6.5902172; 
    const KAMPUS_LON = 106.7854656; 
    
    absensiRepository.getSesiAktif.mockResolvedValue(55); // sesi_id
    absensiRepository.cekKepesertaan.mockResolvedValue(true);
    absensiRepository.cekAbsen.mockResolvedValue(false); // belum absen
    absensiRepository.catatKehadiran.mockResolvedValue(true);

    await absensiService.scanQR({ 
      qr_code: 'stikomabsen://sesi/MATKUL-101', 
      latitude: KAMPUS_LAT, 
      longitude: KAMPUS_LON, 
      mahasiswa_id: 1 
    });

    expect(absensiRepository.catatKehadiran).toHaveBeenCalledWith(1, "101", 55);
  });
});
