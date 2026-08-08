const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
app.use(helmet());

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // batas 5 request per IP per windowMs
  message: { success: false, message: 'Terlalu banyak percobaan login, coba lagi setelah 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());

// ==========================================
// IMPORT ROUTES
// ==========================================
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const mahasiswaRoutes = require('./routes/mahasiswaRoutes');
const angkatanRoutes = require('./routes/angkatanRoutes'); //
const kelasRoutes = require('./routes/kelasRoutes');
const dosenRoutes = require('./routes/dosenRoutes');
const matkulRoutes = require('./routes/matkulRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const rekapRoutes = require('./routes/rekapRoutes');
const periodeRoutes = require('./routes/periodeRoutes');

// ==========================================
// GUNAKAN ROUTES
// ==========================================
// Setup Swagger API Documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Absensi API',
      version: '1.0.0',
      description: 'Dokumentasi API untuk E-Absensi STIKOM Elrahma',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rute API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/angkatan', angkatanRoutes);
app.use('/api/kelas', kelasRoutes);
app.use('/api/dosen', dosenRoutes);
app.use('/api/matkul', matkulRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/rekap', rekapRoutes);
app.use('/api/periode', periodeRoutes);

// ==========================================
// ERROR HANDLER GLOBAL
// ==========================================
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// ==========================================
// MENYALAKAN SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`==================================`);
  console.log(`🚀 Server Backend aktif di port ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`✅ Auth Route terpasang: /api/auth`);
  console.log(`✅ Dashboard Route terpasang: /api/dashboard`);
  console.log(`✅ Mahasiswa Route terpasang: /api/mahasiswa`);
  console.log(`✅ Angkatan Route terpasang: /api/angkatan`);
  console.log(`✅ Kelas Route terpasang: /api/kelas`);
  console.log(`==================================`);
});