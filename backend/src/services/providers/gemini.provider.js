const config = require('../../config');

/**
 * Google Gemini provider. Uses the generateContent REST API.
 * Expects GEMINI_API_KEY to be set.
 */
async function extractBatch(systemPrompt, userPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini request failed (${res.status}): ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  const parsed = JSON.parse(text);
  const records = Array.isArray(parsed) ? parsed : parsed.records;
  if (!Array.isArray(records)) throw new Error('Gemini response did not contain a records array');
  return records;
}

module.exports = { extractBatch };
