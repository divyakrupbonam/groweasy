'use client';

const STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'preview', label: 'Preview' },
  { key: 'importing', label: 'Map & Import' },
  { key: 'result', label: 'Result' },
] as const;

export type StepKey = (typeof STEPS)[number]['key'];

export function StepIndicator({ current }: { current: StepKey }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center w-full max-w-2xl">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={[
                  'flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs shrink-0 border transition-colors',
                  isDone
                    ? 'bg-teal border-teal text-white'
                    : isActive
                    ? 'bg-ink border-ink text-paper'
                    : 'bg-white border-line text-muted',
                ].join(' ')}
              >
                {isDone ? '✓' : i + 1}
              </span>
              <span
                className={[
                  'text-sm hidden sm:inline',
                  isActive ? 'text-ink font-semibold' : isDone ? 'text-teal-dark' : 'text-muted',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={['flex-1 h-px mx-3', isDone ? 'bg-teal' : 'bg-line'].join(' ')}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
