'use client';

import type { RawRow } from '@/lib/types';

interface Props {
  headers: string[];
  rows: RawRow[];
  fileName: string;
}

const PREVIEW_ROW_CAP = 300;

export function PreviewTable({ headers, rows, fileName }: Props) {
  const visibleRows = rows.slice(0, PREVIEW_ROW_CAP);
  const truncated = rows.length > PREVIEW_ROW_CAP;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-sm text-muted font-mono">{fileName}</p>
          <p className="text-ink font-semibold">
            {rows.length.toLocaleString()} rows · {headers.length} columns detected
          </p>
        </div>
      </div>

      {/* Raw, as-is column headers — deliberately messy/unstyled chips to show
          "this is whatever your source file called these fields" before AI
          straightens anything out. */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {headers.map((h) => (
          <span
            key={h}
            className="font-mono text-xs px-2 py-1 rounded bg-white border border-line text-ink/70"
          >
            {h || '(blank header)'}
          </span>
        ))}
      </div>

      <div className="data-scroll">
        <table>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h || '—'}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i}>
                {headers.map((h) => (
                  <td key={h} className="text-ink/80">
                    {row[h] || <span className="text-muted">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {truncated && (
        <p className="text-xs text-muted mt-2 font-mono">
          Showing first {PREVIEW_ROW_CAP.toLocaleString()} of {rows.length.toLocaleString()} rows.
          All rows will be sent on import.
        </p>
      )}
    </div>
  );
}
