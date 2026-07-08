const config = require('../../config');

/**
 * OpenAI provider. Uses the Chat Completions API with JSON mode.
 * Expects OPENAI_API_KEY to be set.
 */
async function extractBatch(systemPrompt, userPrompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: config.openai.model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${systemPrompt}\n\nRespond with a JSON object of the shape {"records": [...]} where records is the array described above.` },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`OpenAI request failed (${res.status}): ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI response missing content');

  const parsed = JSON.parse(content);
  const records = Array.isArray(parsed) ? parsed : parsed.records;
  if (!Array.isArray(records)) throw new Error('OpenAI response did not contain a records array');
  return records;
}

module.exports = { extractBatch };
