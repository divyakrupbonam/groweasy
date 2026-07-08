'use client';

import { useState } from 'react';
import { CRM_FIELD_ORDER, type ImportDone } from '@/lib/types';

export function ResultsTable({ result }: { result: ImportDone }) {
  const [tab, setTab] = useState<'imported' | 'skipped'>('imported');

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="total rows" value={result.totalRows} tone="ink" />
        <StatCard label="imported" value={result.totalImported} tone="teal" />
        <StatCard label="skipped" value={result.totalSkipped} tone="amber" />
      </div>

      <div className="flex gap-2 mb-3">
        <TabButton active={tab === 'imported'} onClick={() => setTab('imported')}>
          Imported ({result.totalImported})
        </TabButton>
        <TabButton active={tab === 'skipped'} onClick={() => setTab('skipped')}>
          Skipped ({result.totalSkipped})
        </TabButton>
      </div>

      {tab === 'imported' ? (
        <div className="data-scroll">
          <table>
            <thead>
              <tr>
                {CRM_FIELD_ORDER.map((f) => (
                  <th key={f}>{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.imported.map((record, i) => (
                <tr key={i}>
                  {CRM_FIELD_ORDER.map((f) => (
                    <td key={f} className="text-ink/80">
                      {record[f] || <span className="text-muted">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="data-scroll">
          <table>
            <thead>
              <tr>
                <th>Reason skipped</th>
                <th>Original row (raw)</th>
              </tr>
            </thead>
            <tbody>
              {result.skipped.map((s, i) => (
                <tr key={i}>
                  <td className="text-red">{s.reason}</td>
                  <td className="text-ink/70">{JSON.stringify(s.source_row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'ink' | 'teal' | 'amber' }) {
  const toneClasses = {
    ink: 'bg-white text-ink border-line',
    teal: 'bg-teal-light text-teal-dark border-teal/30',
    amber: 'bg-amber-light text-amber border-amber/30',
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClasses}`}>
      <p className="font-mono text-2xl">{value.toLocaleString()}</p>
      <p className="text-xs text-muted uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
        active ? 'bg-ink text-paper' : 'bg-white text-muted border border-line hover:text-ink',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
