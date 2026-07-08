/* Minimal structured logger so we don't drag in a dependency for this. */

const level = (process.env.LOG_LEVEL || 'info').toLowerCase();
const levels = { error: 0, warn: 1, info: 2, debug: 3 };

function log(lvl, msg, meta) {
  if (levels[lvl] > levels[level]) return;
  const line = {
    time: new Date().toISOString(),
    level: lvl,
    msg,
    ...(meta ? { meta } : {}),
  };
  // eslint-disable-next-line no-console
  console[lvl === 'debug' ? 'log' : lvl](JSON.stringify(line));
}

module.exports = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};
