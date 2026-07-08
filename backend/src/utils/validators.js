const { CRM_STATUS_VALUES, DATA_SOURCE_VALUES, CRM_FIELD_KEYS } = require('../config/crmSchema');

/**
 * Normalizes a single AI-extracted record against the CRM schema.
 * - Strips unknown keys
 * - Blanks out invalid enum values instead of trusting the model
 * - Confirms created_at is Date-parseable, otherwise blanks it
 * Returns { record, valid } where `valid` reflects the "must have
 * email or mobile" business rule from the assignment spec.
 */
function normalizeRecord(raw) {
  const record = {};

  for (const key of CRM_FIELD_KEYS) {
    const value = raw && raw[key] != null ? String(raw[key]).trim() : '';
    record[key] = value;
  }

  if (record.crm_status && !CRM_STATUS_VALUES.includes(record.crm_status)) {
    record.crm_status = '';
  }

  if (record.data_source && !DATA_SOURCE_VALUES.includes(record.data_source)) {
    record.data_source = '';
  }

  if (record.created_at) {
    const d = new Date(record.created_at);
    if (Number.isNaN(d.getTime())) {
      record.created_at = '';
    }
  }

  const hasEmail = record.email && /\S+@\S+\.\S+/.test(record.email);
  const hasMobile = record.mobile_without_country_code && /\d{4,}/.test(record.mobile_without_country_code);

  return { record, valid: Boolean(hasEmail || hasMobile) };
}

/** Basic guard against empty / non-object CSV rows before we ever call the AI. */
function isMeaningfulRow(row) {
  if (!row || typeof row !== 'object') return false;
  return Object.values(row).some((v) => String(v ?? '').trim().length > 0);
}

module.exports = { normalizeRecord, isMeaningfulRow };
