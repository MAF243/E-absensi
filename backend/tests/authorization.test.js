jest.mock('../services/absensiService');
jest.mock('../services/jadwalService');

const absensiService = require('../services/absensiService');
const jadwalService = require('../services/jadwalService');
const { scanQR } = require('../controllers/absensiController');
const { getJadwalByMahasiswa } = require('../controllers/jadwalController');

const response = () => ({ json: jest.fn() });

describe('authorization boundaries', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses the student id from JWT, not the scan request body', async () => {
    const req = {
      body: { qr_code: 'stikomabsen://sesi/MATKUL-10', mahasiswa_id: 999 },
      user: { id: 12, role: 'mahasiswa' },
    };
    const res = response();

    await scanQR(req, res);

    expect(absensiService.scanQR).toHaveBeenCalledWith(expect.objectContaining({ mahasiswa_id: 12 }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('rejects a request for another student schedule', async () => {
    const req = { params: { mahasiswa_id: '99' }, user: { id: 12, role: 'mahasiswa' } };

    await expect(getJadwalByMahasiswa(req, response())).rejects.toMatchObject({ statusCode: 403 });
    expect(jadwalService.getJadwalByMahasiswa).not.toHaveBeenCalled();
  });
});
