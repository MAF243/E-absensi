const { z } = require('zod');
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorsList = err.issues || err.errors || [];
      const errorMessages = errorsList.map(e => e.message).join(', ');
      return next(new AppError(`Validasi gagal: ${errorMessages}`, 400));
    }
    next(err);
  }
};

module.exports = validate;
