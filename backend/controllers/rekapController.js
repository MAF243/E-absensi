const AppError = require('../utils/AppError');
const rekapService = require('../services/rekapService');

const getRekapMahasiswa = async (req, res, next) => {
  const data = await rekapService.getRekapMahasiswa(req.query);
    res.json({ success: true, data });
  
};

const getRekapDosen = async (req, res, next) => {
  const data = await rekapService.getRekapDosen(req.query);
    res.json({ success: true, data });
  
};

module.exports = { getRekapMahasiswa, getRekapDosen };