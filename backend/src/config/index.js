require('dotenv').config({ override: true });

module.exports = {
  port: process.env.PORT || 4000,
  corsOrigin: process.env.CORS_ORIGIN || '*',

  aiProvider: (process.env.AI_PROVIDER || 'openai').toLowerCase(), // 'openai' | 'anthropic' | 'gemini'

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  },

  batch: {
    size: Number(process.env.AI_BATCH_SIZE) || 15,
    concurrency: Number(process.env.AI_BATCH_CONCURRENCY) || 3,
    maxRetries: Number(process.env.AI_MAX_RETRIES) || 2,
  },

  maxRowsPerImport: Number(process.env.MAX_ROWS_PER_IMPORT) || 5000,
};
