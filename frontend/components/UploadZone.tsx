'use client';

import { useCallback, useRef, useState } from 'react';

interface Props {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function UploadZone({ onFileSelected, isLoading, error }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
        onFileSelected(file); // let the parser surface a clean error message
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div className="w-full max-w-2xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        className={[
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-14 text-center cursor-pointer transition-colors',
          isDragging ? 'border-teal bg-teal-light' : 'border-line bg-white hover:border-ink/40',
        ].join(' ')}
      >
        <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center text-paper font-mono text-lg">
          ↑
        </div>
        <p className="text-ink font-semibold">
          {isLoading ? 'Reading file…' : 'Drop a CSV here, or click to browse'}
        </p>
        <p className="text-muted text-sm font-mono">
          Facebook exports · Google Ads · Excel · CRM exports · anything with a header row
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && (
        <p className="mt-3 text-sm text-red bg-red-light border border-red/30 rounded-lg px-3 py-2 font-mono">
          {error}
        </p>
      )}
    </div>
  );
}
