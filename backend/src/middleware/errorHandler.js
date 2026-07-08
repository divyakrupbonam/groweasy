const logger = require('../utils/logger');

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  if (res.headersSent) {
    return res.end();
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}

module.exports = { notFoundHandler, errorHandler };
