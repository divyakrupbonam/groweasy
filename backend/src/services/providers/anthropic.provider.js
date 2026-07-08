const config = require('../../config');

/**
 * Anthropic (Claude) provider. Uses the Messages API.
 * Expects ANTHROPIC_API_KEY to be set.
 */
async function extractBatch(systemPrompt, userPrompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.anthropic.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.anthropic.model,
      max_tokens: 4096,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Anthropic request failed (${res.status}): ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const text = data?.content?.map((b) => b.text || '').join('') || '';
  const jsonText = extractJsonArray(text);
  const records = JSON.parse(jsonText);
  if (!Array.isArray(records)) throw new Error('Anthropic response did not contain a JSON array');
  return records;
}

/** Claude sometimes wraps JSON in prose/fences despite instructions; pull out the array. */
function extractJsonArray(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

module.exports = { extractBatch };
