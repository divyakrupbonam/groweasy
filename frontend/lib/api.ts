import type { ImportDone, ImportStreamEvent, RawRow } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/**
 * Posts the confirmed rows to the backend and reads back a stream of
 * newline-delimited JSON progress events, calling onEvent for each one.
 * Resolves with the final "done" payload.
 */
export async function importLeads(
  rows: RawRow[],
  onEvent: (event: ImportStreamEvent) => void
): Promise<ImportDone> {
  const res = await fetch(`${API_BASE_URL}/api/leads/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Import request failed with status ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResult: ImportDone | null = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      const event: ImportStreamEvent = JSON.parse(line);
      onEvent(event);
      if (event.type === 'done') finalResult = event;
      if (event.type === 'error') throw new Error(event.error);
    }
  }

  if (!finalResult) throw new Error('Import stream ended without a result.');
  return finalResult;
}
