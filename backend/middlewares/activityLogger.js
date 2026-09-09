const activityRepository = require('../repositories/activityRepository');

const activityLogger = (req, res, next) => {
  res.on('finish', () => {
    if (!req.user || req.path === '/activity') return;

    const method = req.method.toUpperCase();
    const action = `${method} ${req.baseUrl}${req.path}`.slice(0, 100);
    const outcome = res.statusCode >= 400 ? 'failure' : 'success';
    const summary = `${method} ${req.originalUrl} (${res.statusCode})`.slice(0, 500);

    activityRepository.create({
      userId: req.user.id,
      role: req.user.role,
      action,
      summary,
      outcome,
      req
    }).catch((error) => console.error('Gagal mencatat aktivitas:', error.message));
  });
  next();
};

module.exports = activityLogger;
