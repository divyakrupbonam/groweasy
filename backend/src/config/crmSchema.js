/**
 * Single source of truth for the GrowEasy CRM lead schema.
 * Used to (a) build the AI extraction prompt and (b) validate/normalize
 * whatever the model returns, so the two never drift apart.
 */

const CRM_STATUS_VALUES = [
    'GOOD_LEAD_FOLLOW_UP',
    'DID_NOT_CONNECT',
    'BAD_LEAD',
    'SALE_DONE',
];

const DATA_SOURCE_VALUES = [
    'leads_on_demand',
    'meridian_tower',
    'eden_park',
    'varah_swamy',
    'sarjapur_plots',
];

const CRM_FIELDS = [
    { key: 'created_at', description: 'Lead creation date/time. Must be parseable by JavaScript `new Date(created_at)`. If unknown, use empty string.' },
    { key: 'name', description: 'Full name of the lead.' },
    { key: 'email', description: 'Primary email address. If several exist, use the first and append the rest to crm_note.' },
    { key: 'country_code', description: 'Phone country code, e.g. "+91". DEFAULT RULE: if mobile_without_country_code is a 10-digit number and nothing in the row suggests a country other than India, output "+91" — this is the expected default, not a guess. Only use a different code if the row clearly indicates another country (e.g. a UK city, a US area code pattern, or an explicit country name). Only output "" if there is no phone number at all.' },
    { key: 'mobile_without_country_code', description: 'Mobile number WITHOUT the country code. If several numbers exist, use the first and append the rest to crm_note.' },
    { key: 'company', description: 'Company / organisation name.' },
    { key: 'city', description: 'City.' },
    { key: 'state', description: 'State / province.' },
    { key: 'country', description: 'Country.' },
    { key: 'lead_owner', description: 'The salesperson/agent/owner assigned to this lead (often an email).' },
    { key: 'crm_status', description: `Lead status. Must be exactly one of: ${CRM_STATUS_VALUES.join(', ')}. Actively infer this from ANY notes, remarks, or description text in the row — do not require an explicit status word. Examples: "interested", "wants callback", "asked to reschedule", "ready to move", "follow up next week" -> GOOD_LEAD_FOLLOW_UP. "not interested", "not looking anymore", "wrong number", "do not contact" -> BAD_LEAD. "no answer", "unreachable", "call not picked", "busy, try again" -> DID_NOT_CONNECT. "deal closed", "booked", "payment done", "onboarded" -> SALE_DONE. Only leave it "" if the row truly contains no notes/remarks/description at all to infer from.` },
    { key: 'crm_note', description: 'Free-text notes: remarks, follow-up notes, extra comments, extra phone numbers, extra emails, and anything useful that does not fit another field.' },
    { key: 'data_source', description: `Where the lead came from. Must be exactly one of: ${DATA_SOURCE_VALUES.join(', ')}, or empty string if nothing matches confidently. Never invent a value outside this list.` },
    { key: 'possession_time', description: 'Property possession time, if this is a real-estate lead (e.g. "Ready to move", "Dec 2026").' },
    { key: 'description', description: 'Any additional free-text description that does not belong in crm_note.' },
];

const CRM_FIELD_KEYS = CRM_FIELDS.map((f) => f.key);

module.exports = {
    CRM_STATUS_VALUES,
    DATA_SOURCE_VALUES,
    CRM_FIELDS,
    CRM_FIELD_KEYS,
};