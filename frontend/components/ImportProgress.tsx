'use client';

import type { ImportProgress as ImportProgressEvent } from '@/lib/types';

interface Props {
  progress: ImportProgressEvent | null;
  totalRows: number;
}

export function ImportProgress({ progress, totalRows }: Props) {
  const pct = progress ? Math.round((progress.completedBatches / Math.max(progress.totalBatches, 1)) * 100) : 0;

  return (
    <div className="w-full max-w-2xl bg-white border border-line rounded-xl p-8">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-teal pulse-dot" />
        <span className="w-2 h-2 rounded-full bg-teal pulse-dot [animation-delay:0.15s]" />
        <span className="w-2 h-2 rounded-full bg-teal pulse-dot [animation-delay:0.3s]" />
        <p className="text-ink font-semibold ml-2">Mapping columns into GrowEasy CRM fields…</p>
      </div>

      <div className="h-2 rounded-full bg-paper overflow-hidden border border-line">
        <div
          className="h-full bg-teal transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between mt-3 font-mono text-xs text-muted">
        <span>
          {progress ? `Batch ${progress.completedBatches} / ${progress.totalBatches}` : 'Starting…'}
        </span>
        <span>{pct}%</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6 text-center">
        <div className="rounded-lg bg-paper py-3">
          <p className="font-mono text-lg text-ink">{totalRows.toLocaleString()}</p>
          <p className="text-xs text-muted">total rows</p>
        </div>
        <div className="rounded-lg bg-teal-light py-3">
          <p className="font-mono text-lg text-teal-dark">{progress?.importedSoFar.toLocaleString() ?? 0}</p>
          <p className="text-xs text-muted">mapped so far</p>
        </div>
        <div className="rounded-lg bg-amber-light py-3">
          <p className="font-mono text-lg text-amber">{progress?.skippedSoFar.toLocaleString() ?? 0}</p>
          <p className="text-xs text-muted">skipped so far</p>
        </div>
      </div>
    </div>
  );
}
