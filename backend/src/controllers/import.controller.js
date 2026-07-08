const logger = require('../utils/logger');
const { processImport } = require('../services/batchProcessor.service');

/**
 * Streams import progress as newline-delimited JSON (NDJSON) so the
 * frontend can show a live progress bar while batches complete, then
 * emits one final { type: "done", ... } line with the full result.
 *
 * Content-Type: application/x-ndjson
 */
async function importLeadsStream(req, res) {
  const { rows, aiProvider } = req.body;

  res.writeHead(200, {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const writeLine = (obj) => res.write(`${JSON.stringify(obj)}\n`);

  try {
    const result = await processImport(rows, {
      providerName: aiProvider,
      onProgress: async (progress) => writeLine(progress),
    });

    writeLine({ type: 'done', ...result });
  } catch (err) {
    logger.error('Import stream failed', { error: err.message });
    writeLine({ type: 'error', error: err.message });
  } finally {
    res.end();
  }
}

/**
 * Same pipeline, but waits for the whole import to finish and returns a
 * single JSON response. Simpler for scripting / curl / tests; the frontend
 * uses the streaming endpoint above for live progress.
 */
async function importLeadsSync(req, res, next) {
  try {
    const { rows, aiProvider } = req.body;
    const result = await processImport(rows, { providerName: aiProvider });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { importLeadsStream, importLeadsSync };
