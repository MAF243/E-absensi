const express = require('express');
const router = express.Router();
const { getStats, getRanking, getLogs } = require('../controllers/dashboardController');

// Rute ini otomatis akan ditambah awalan /api/dashboard di server.js
router.get('/stats', getStats);
router.get('/ranking', getRanking);
router.get('/logs', getLogs);

module.exports = router;