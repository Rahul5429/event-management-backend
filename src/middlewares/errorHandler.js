const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error({ err, url: req.originalUrl }, 'Unhandled error');
  const status = err.status || 500;
  const msg = err.message || 'Internal server error';
  res.status(status).json({ message: msg });
};
