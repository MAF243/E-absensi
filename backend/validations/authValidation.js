const { z } = require('zod');

const loginSchema = z.object({
  identitas: z.string().min(1, 'Nomor Induk / NIDN wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi')
});

module.exports = { loginSchema };
