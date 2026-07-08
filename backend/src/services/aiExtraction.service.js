const config = require('../config');
const logger = require('../utils/logger');
const { buildSystemPrompt, buildUserPrompt } = require('./promptBuilder');

const openaiProvider = require('./providers/openai.provider');
const anthropicProvider = require('./providers/anthropic.provider');
const geminiProvider = require('./providers/gemini.provider');

const PROVIDERS = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
};

function getProvider(name) {
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(`Unknown AI provider "${name}". Valid options: ${Object.keys(PROVIDERS).join(', ')}`);
  }
  return provider;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends one batch of raw CSV rows to the configured AI provider and returns
 * the mapped CRM records, in the same order. Retries transient failures
 * with exponential backoff.
 */
async function extractBatch(rows, { providerName = config.aiProvider, maxRetries = config.batch.maxRetries } = {}) {
  const provider = getProvider(providerName);
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(rows);

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const records = await provider.extractBatch(systemPrompt, userPrompt);
      if (records.length !== rows.length) {
        logger.warn('AI returned a different record count than input rows', {
          expected: rows.length,
          received: records.length,
        });
      }
      return records;
    } catch (err) {
      lastError = err;
      logger.warn('AI extraction attempt failed', { attempt, error: err.message });
      if (attempt < maxRetries) {
        await sleep(2 ** attempt * 500);
      }
    }
  }
  throw lastError;
}

module.exports = { extractBatch, getProvider };
