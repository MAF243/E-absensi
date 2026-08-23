const { hitungJarakMeters } = require('../utils/haversine');

describe('Fungsi Haversine (Jarak GPS)', () => {
  it('harus menghitung jarak 0 meter untuk koordinat yang sama', () => {
    const lat = -6.5902172;
    const lon = 106.7854656;
    const jarak = hitungJarakMeters(lat, lon, lat, lon);
    expect(jarak).toBe(0);
  });

  it('harus menghitung jarak dengan akurat (estimasi > 10m untuk koordinat berbeda)', () => {
    const KAMPUS_LAT = -6.5902172;
    const KAMPUS_LON = 106.7854656;
    
    // Titik yang sedikit bergeser
    const mhs_lat = -6.5905000;
    const mhs_lon = 106.7850000;
    
    const jarak = hitungJarakMeters(KAMPUS_LAT, KAMPUS_LON, mhs_lat, mhs_lon);
    expect(jarak).toBeGreaterThan(10);
  });
});
