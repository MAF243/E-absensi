const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Hanya masukkan jika belum ada dummy ini untuk menghindari duplikat
  const dummyDosenExist = await knex('users').where('nomor_induk', 'like', 'DUMMY%').first();
  if (dummyDosenExist) {
    console.log('Dummy Dosen sudah ada, tidak jadi insert.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);
  
  const dummyData = [];
  for (let i = 1; i <= 30; i++) {
    const padNum = i.toString().padStart(3, '0');
    dummyData.push({
      nomor_induk: `DUMMY${padNum}`,
      nama_lengkap: `Dosen Dummy ${i}, S.Kom., M.Kom.`,
      password: passwordHash,
      role: 'dosen',
      jenis_kelamin: i % 2 === 0 ? 'P' : 'L',
      status_akademik: 'aktif'
    });
  }

  await knex('users').insert(dummyData);
  console.log('Berhasil menambahkan 30 Dosen Dummy.');
};
