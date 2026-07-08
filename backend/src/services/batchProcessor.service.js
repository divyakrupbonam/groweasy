const config = require('../config');
const logger = require('../utils/logger');
const { extractBatch } = require('./aiExtraction.service');
const { normalizeRecord, isMeaningfulRow } = require('../utils/validators');

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

/**
 * Runs an array of async batch-jobs with a concurrency cap, calling
 * onBatchDone(result, batchIndex) as each one finishes (not necessarily
 * in order) so the caller can stream progress.
 */
async function runWithConcurrency(jobs, concurrency, onBatchDone) {
  const results = new Array(jobs.length);
  let cursor = 0;

  async function worker() {
    while (cursor < jobs.length) {
      const index = cursor;
      cursor += 1;
      const result = await jobs[index]();
      results[index] = result;
      if (onBatchDone) await onBatchDone(result, index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, jobs.length) }, worker);
  await Promise.all(workers);
  return results;
}

/**
 * Takes the full set of raw CSV rows, batches them, sends each batch to the
 * AI, validates/normalizes the response against the CRM schema, and applies
 * the "must have email or mobile" skip rule.
 *
 * @param {object[]} rawRows - parsed CSV rows (objects keyed by original header)
 * @param {object} [opts]
 * @param {(progress: object) => void} [opts.onProgress] - called after each batch finishes
 */
async function processImport(rawRows, opts = {}) {
  const { onProgress, providerName } = opts;

  const meaningfulRows = rawRows.filter(isMeaningfulRow);
  const batches = chunk(meaningfulRows, config.batch.size);

  const imported = [];
  const skipped = [];

  const jobs = batches.map((batchRows) => async () => {
    try {
      const aiRecords = await extractBatch(batchRows, { providerName });
      const outcomes = batchRows.map((sourceRow, i) => {
        const { record, valid } = normalizeRecord(aiRecords[i]);
        return { sourceRow, record, valid };
      });
      return { ok: true, outcomes, rowCount: batchRows.length };
    } catch (err) {
      logger.error('Batch failed after retries, skipping its rows', { error: err.message });
      return {
        ok: false,
        error: err.message,
        outcomes: batchRows.map((sourceRow) => ({ sourceRow, record: null, valid: false })),
        rowCount: batchRows.length,
      };
    }
  });

  let completedBatches = 0;

  await runWithConcurrency(jobs, config.batch.concurrency, async (result) => {
    for (const outcome of result.outcomes) {
      if (outcome.valid) {
        imported.push(outcome.record);
      } else {
        skipped.push({
          reason: outcome.record
            ? 'Missing both email and mobile number'
            : `AI extraction failed: ${result.error}`,
          source_row: outcome.sourceRow,
        });
      }
    }

    completedBatches += 1;
    if (onProgress) {
      await onProgress({
        type: 'progress',
        completedBatches,
        totalBatches: batches.length,
        importedSoFar: imported.length,
        skippedSoFar: skipped.length,
      });
    }
  });

  return {
    imported,
    skipped,
    totalImported: imported.length,
    totalSkipped: skipped.length,
    totalRows: meaningfulRows.length,
    totalBatches: batches.length,
  };
}

module.exports = { processImport };
