const { CRM_FIELDS } = require('../config/crmSchema');

/**
 * Builds the system + user prompt sent to whichever LLM provider is active.
 * Kept provider-agnostic: it just produces plain strings, each provider
 * decides how to wire them into its own API shape.
 */
function buildSystemPrompt() {
    const fieldLines = CRM_FIELDS.map((f) => `- ${f.key}: ${f.description}`).join('\n');

    return `You are a data-mapping engine for GrowEasy CRM. You receive raw CSV rows exported from arbitrary sources (Facebook Lead Ads, Google Ads, Excel sheets, real-estate CRMs, sales reports, manual spreadsheets, etc). Column names and layouts vary between sources and are NOT fixed.

Your job: for each input row, infer the correct GrowEasy CRM field values, even when column names are abbreviated, misspelled, in a different language, or ambiguous. Use context across all columns in a row to make the best judgment.

Target CRM fields:
${fieldLines}

Rules you MUST follow:
1. Return ONLY a JSON array, one object per input row, in the SAME ORDER as the input rows. No prose, no markdown fences, no explanation.
2. Every object must contain exactly these keys: ${CRM_FIELDS.map((f) => f.key).join(', ')}. Use "" (empty string) for anything you cannot determine.
3. crm_status must be one of the allowed values or "" — never invent a new status.
4. data_source must be one of the allowed values or "" — never invent a new source.
5. If a row has multiple emails, use the first as "email" and append the rest into "crm_note" (e.g. "Also: second@x.com").
6. If a row has multiple phone numbers, use the first as "mobile_without_country_code" and append the rest into "crm_note".
7. created_at must be a value JavaScript's \`new Date(created_at)\` can parse. If you cannot produce a valid date, return "".
8. Keep every value a single line — escape internal newlines as \\n so the record can round-trip through CSV safely.
9. Do not fabricate facts that are not implied by the row (e.g. never invent a name, email, or city that isn't there). This caution does NOT apply to crm_status: classifying lead status from the tone/content of notes is expected and required, not "guessing" — only leave crm_status "" when a row has no notes/remarks/description at all.
10. If a row has neither an email nor a phone number anywhere in it, still return an object for it (do not drop it), but leave both "email" and "mobile_without_country_code" as "" — the caller decides what to do with unusable rows.`;
}

function buildUserPrompt(rows) {
    return `Here are ${rows.length} raw CSV rows as JSON objects (keys are the original column headers from the source file). Map each to the GrowEasy CRM schema and return the JSON array described in your instructions.

INPUT_ROWS:
${JSON.stringify(rows, null, 0)}`;
}

module.exports = { buildSystemPrompt, buildUserPrompt };