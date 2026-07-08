const config = require('../config');

/**
 * Guards the import endpoint against malformed or oversized payloads before
 * we spend money calling an AI provider.
 */
function validateImportPayload(req, res, next) {
  const { rows } = req.body || {};

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty "rows" array.' });
  }

  if (rows.length > config.maxRowsPerImport) {
    return res.status(413).json({
      error: `Too many rows (${rows.length}). Maximum supported per import is ${config.maxRowsPerImport}.`,
    });
  }

  if (!rows.every((r) => r && typeof r === 'object' && !Array.isArray(r))) {
    return res.status(400).json({ error: 'Every entry in "rows" must be a JSON object of column -> value.' });
  }

  next();
}

module.exports = { validateImportPayload };
