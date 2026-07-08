'use client';

import { useCallback, useState } from 'react';
import { StepIndicator, type StepKey } from '@/components/StepIndicator';
import { UploadZone } from '@/components/UploadZone';
import { PreviewTable } from '@/components/PreviewTable';
import { ImportProgress } from '@/components/ImportProgress';
import { ResultsTable } from '@/components/ResultsTable';
import { parseCsvFile, downloadCsv, toCsv, type ParsedCsv } from '@/lib/csv';
import { importLeads } from '@/lib/api';
import type { ImportDone, ImportProgress as ImportProgressEvent } from '@/lib/types';

export default function Home() {
  const [step, setStep] = useState<StepKey>('upload');
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const [progress, setProgress] = useState<ImportProgressEvent | null>(null);
  const [result, setResult] = useState<ImportDone | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    setUploadError(null);
    setIsParsing(true);
    try {
      const csv = await parseCsvFile(file);
      setParsed(csv);
      setStep('preview');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not read this file.');
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (!parsed) return;
    setStep('importing');
    setImportError(null);
    setProgress(null);
    try {
      const done = await importLeads(parsed.rows, (event) => {
        if (event.type === 'progress') setProgress(event);
      });
      setResult(done);
      setStep('result');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.');
      setStep('preview');
    }
  }, [parsed]);

  const handleStartOver = useCallback(() => {
    setStep('upload');
    setParsed(null);
    setResult(null);
    setProgress(null);
    setUploadError(null);
    setImportError(null);
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center text-paper font-mono text-sm font-semibold">
              GE
            </div>
            <div>
              <p className="font-semibold text-ink leading-tight">GrowEasy CSV Importer</p>
              <p className="text-xs text-muted leading-tight">Any lead file, mapped to CRM format</p>
            </div>
          </div>
          {step !== 'upload' && (
            <button
              onClick={handleStartOver}
              className="text-sm text-muted hover:text-ink font-medium"
            >
              Start over
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col items-center gap-8">
        <StepIndicator current={step} />

        {step === 'upload' && (
          <UploadZone onFileSelected={handleFileSelected} isLoading={isParsing} error={uploadError} />
        )}

        {step === 'preview' && parsed && (
          <div className="w-full flex flex-col gap-5 items-stretch">
            <PreviewTable headers={parsed.headers} rows={parsed.rows} fileName={parsed.fileName} />
            {importError && (
              <p className="text-sm text-red bg-red-light border border-red/30 rounded-lg px-3 py-2 font-mono">
                {importError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleStartOver}
                className="px-4 py-2 rounded-lg border border-line text-ink font-medium hover:bg-white"
              >
                Choose a different file
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-lg bg-teal text-white font-medium hover:bg-teal-dark transition-colors"
              >
                Confirm & Import {parsed.rows.length.toLocaleString()} rows →
              </button>
            </div>
          </div>
        )}

        {step === 'importing' && parsed && (
          <ImportProgress progress={progress} totalRows={parsed.rows.length} />
        )}

        {step === 'result' && result && (
          <div className="w-full flex flex-col gap-5 items-stretch">
            <ResultsTable result={result} />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleStartOver}
                className="px-4 py-2 rounded-lg border border-line text-ink font-medium hover:bg-white"
              >
                Import another file
              </button>
              <button
                onClick={() => downloadCsv('groweasy_imported_leads.csv', toCsv(result.imported))}
                className="px-5 py-2 rounded-lg bg-ink text-paper font-medium hover:bg-ink/90 transition-colors"
              >
                Download imported CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
